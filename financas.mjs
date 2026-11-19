import { norm, pad, ymd } from './datas.mjs?v=c0273d90ee1f';

export const brl = v => (v < 0 ? '−' : '') + 'R$ ' + Math.abs(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const brl0 = v => (v < 0 ? '−' : '') + 'R$ ' + Math.round(Math.abs(v)).toLocaleString('pt-BR');
export const c2 = v => Math.round(v * 100) / 100;
export const pnum = v => { if (v == null) return null; let s = String(v).replace(/R\$/g, '').replace(/\s/g, ''); if (!s) return null; const neg = /^[-−]/.test(s); s = s.replace(/^[-−]/, ''); if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.'); const n = Number(s); return Number.isFinite(n) ? (neg ? -n : n) : null; };
function piso(valor) {
  const texto = String(valor ?? '').trim();
  const br = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(texto);
  const iso = br ? `${br[3]}-${pad(br[2])}-${pad(br[1])}` : texto;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return '';
  const [ano, mes, dia] = iso.split('-').map(Number);
  return mes >= 1 && mes <= 12 && dia >= 1 && dia <= dim(ano, mes) ? iso : '';
}

export function orcamentoDoMes(modelo, mes) {
  const categorias = new Map(modelo.orc.map(r => [r.categoria, { categoria: r.categoria, limite: r.limite, gasto: 0 }]));
  for (const item of modelo.desp) {
    if (item.data.slice(0, 7) !== mes) continue;
    const nome = item.categoria || 'Sem categoria';
    const categoria = categorias.get(nome) || { categoria: nome, limite: null, gasto: 0 };
    categoria.gasto = c2(categoria.gasto + item.valor);
    categorias.set(nome, categoria);
  }
  return [...categorias.values()].map(c => ({
    ...c, restante: c.limite == null ? null : c2(c.limite - c.gasto),
  }));
}

export function filtrarLancamentos(modelo, mes, tipo, consulta) {
  const texto = norm(consulta).trim();
  return modelo.lanc.filter(r =>
    r.data.slice(0, 7) === mes && (!tipo || r.tipo === tipo) &&
    (!texto || norm([r.descricao, r.categoria, r.pagamento].join(' ')).includes(texto))
  ).sort((a, b) => b.data.localeCompare(a.data) || b.i - a.i);
}

export const pmes = v => { const s = String(v || '').trim(); let m = /^(\d{1,2})\/(\d{4})$/.exec(s); if (m) return m[2] + '-' + m[1].padStart(2, '0'); m = /^\d{1,2}\/(\d{1,2})\/(\d{4})$/.exec(s); if (m) return m[2] + '-' + m[1].padStart(2, '0'); m = /^(\d{4})-(\d{2})/.exec(s); return m ? m[1] + '-' + m[2] : ''; };
export const addM = (mes, k) => { let [y, m] = mes.split('-').map(Number); m += k; while (m > 12) { m -= 12; y++; } while (m < 1) { m += 12; y--; } return y + '-' + pad(m); };
export const dim = (y, m) => new Date(y, m, 0).getDate();
export const isVA = p => /aliment|vale|benef/i.test(p || '');
export function valorCapturado(s) {
  const texto = String(s ?? '').trim().replace(/^R\$\s*/, '');
  if (!texto) return null;
  const valido = /^(?:\d+|\d{1,3}(?:\.\d{3})+)(?:,\d{1,2})?$/.test(texto);
  const decimal = /^\d+\.\d{1,2}$/.test(texto);
  if (!valido && !decimal) return NaN;
  const n = Number(valido ? texto.replace(/\./g, '').replace(',', '.') : texto);
  return Number.isSafeInteger(Math.round(n * 100)) && n > 0 ? c2(n) : NaN;
}

function cartaoAntigo(config) {
  const buscar = termo => config.find(c => norm(c.parametro).includes(termo))?.valor;
  return {
    cartao:'Nubank', texto:'Nubank', credito:0,
    fechamento:pnum(buscar('dia de fechamento')),
    vencimento:pnum(buscar('dia de vencimento')),
    ultima_paga:piso(buscar('ultima fatura paga')),
  };
}

function saldoConsolidado(saldos, movimentos, hoje) {
  const contas = saldos.filter(s => !s.reserva);
  const dataSaldo = contas.map(s => s.atualizado).sort().at(-1) || '';
  const reserva = saldos.filter(s => s.reserva).reduce((soma, s) => soma + (s.saldo || 0), 0);
  if (!contas.length || contas.some(s => s.saldo == null || !s.atualizado)) {
    return { atual:null, reserva, dataSaldo };
  }
  let atual = contas.reduce((soma, s) => soma + s.saldo, 0);
  const marcadores = contas.map(s => ({
    data:s.atualizado, conta:norm(s.conta), banco:norm(s.conta.split(/\s[—–-]\s/)[0]),
  }));
  for (const m of movimentos) {
    if (m.fonte !== 'lancamento' || m.data > hoje) continue;
    const descricao = norm(m.descricao);
    const nomes = marcadores.filter(s => descricao.includes(`(${s.conta})`) || descricao.includes(`(${s.banco})`));
    // Nos lançamentos antigos sem identificação inequívoca vale o corte geral do Resumo.
    const corte = nomes.length === 1 ? nomes[0].data : dataSaldo;
    if (m.data > corte) atual += m.valor;
  }
  return { atual:c2(atual), reserva:c2(reserva), dataSaldo };
}

export function calcularFinancas(espelho, referencia = new Date()) {
  if (!Array.isArray(espelho?.abas?.['Lançamentos'])) return null;
  const hoje = ymd(referencia);
  const A = espelho.abas, rows = n => (A[n] || []).slice(1).filter(r => r && r[0]);
  const lanc = [];
  (A['Lançamentos'] || []).slice(1).forEach((r, i) => { if (!r || !r[0]) return; const data = piso(r[0]), valor = pnum(r[2]); if (!data || valor == null) return; lanc.push({ i, data, tipo: String(r[1] || '').trim(), valor, categoria: String(r[3] || '').trim(), descricao: String(r[4] || '').trim(), pagamento: String(r[5] || '').trim() }); });
  const contas = rows('Contas').map(r => { const v = String(r[2] || '').trim(); return { conta: String(r[0]).trim(), valor: pnum(r[1]), vencimento: v, venc: piso(v), pagoEm: piso(r[5]), recorrente: String(r[3] || '').trim(), status: String(r[4] || '').trim() }; });
  const orc = rows('Orçamento').map(r => ({ categoria: String(r[0]).trim(), limite: pnum(r[1]), gasto: pnum(r[2]) }));
  const saldos = rows('Saldos').map(r => ({ conta: String(r[0]).trim(), saldo: pnum(r[1]), atualizado: piso(r[3]), reserva: /^s/i.test(String(r[4] || '').trim()) }));
  const cartoes = rows('Cartões').map(r => ({ cartao: String(r[0]).trim(), fechamento: pnum(r[1]), vencimento: pnum(r[2]), ultima_paga: piso(r[3]), credito: pnum(r[4]) || 0, texto: String(r[5] || '').trim() }));
  const rec = rows('Recorrentes').map(r => ({ descricao: String(r[0]).trim(), valor: pnum(r[1]), dia: pnum(r[2]), cartao: String(r[3] || '').trim(), categoria: String(r[4] || '').trim(), inicio: pmes(r[5]), parcelas: pnum(r[6]), ativo: !/^n/i.test(String(r[7] || '').trim()) }));
  const sm = rows('Saldos mensais').map(r => ({ mes: pmes(r[0]), saldo_inicial: pnum(r[1]) }));
  const config = rows('Config').map(r => ({ parametro: String(r[0]).trim(), valor: String(r[1] ?? '').trim() }));
  if (!cartoes.length && config.some(c => norm(c.parametro).includes('fatura'))) cartoes.push(cartaoAntigo(config));
  const h0 = referencia, cur = hoje.slice(0, 7);
  // faturas: cada compra no crédito vai pra fatura do seu cartão (fechamento e vencimento), mais as recorrentes que ainda vão cair
  const cfgC = {}; for (const c of cartoes) cfgC[c.cartao] = c;
  const padrao = cartoes.length ? cartoes[0].cartao : 'Nubank';
  const cartaoDe = d => { const t = String(d).toLowerCase(); for (const c of cartoes) if (c.texto && t.includes(c.texto.toLowerCase())) return c.cartao; return padrao; };
  const addYM = (y, m, k) => { m += k; while (m > 12) { m -= 12; y++; } return [y, m]; };
  const ciclo = (cartao, data) => {
    const c = cfgC[cartao] || {}; const [y, m, d] = data.split('-').map(Number);
    if (!c.fechamento || !c.vencimento) { const [vy, vm] = addYM(y, m, 1); return { fechamento: '', vencimento: vy + '-' + pad(vm) + '-' + pad(Math.min(c.vencimento || 10, dim(vy, vm))) }; }
    const [fy, fm] = d >= Math.min(c.fechamento, dim(y, m)) ? addYM(y, m, 1) : [y, m];
    const [vy, vm] = c.vencimento > c.fechamento ? [fy, fm] : addYM(fy, fm, 1);
    return { fechamento: fy + '-' + pad(fm) + '-' + pad(Math.min(c.fechamento, dim(fy, fm))), vencimento: vy + '-' + pad(vm) + '-' + pad(Math.min(c.vencimento, dim(vy, vm))) };
  };
  const fatItens = [];
  for (const r of lanc) { if (r.tipo !== 'Despesa' || r.pagamento !== 'Crédito') continue; const cartao = cartaoDe(r.descricao), c = ciclo(cartao, r.data); fatItens.push({ cartao, vencimento: c.vencimento, fechamento: c.fechamento, data: r.data, descricao: r.descricao, categoria: r.categoria, valor: c2(r.valor), origem: 'lançado' }); }
  const comprasLancadas = fatItens.slice();
  for (const r of rec) {
    if (!r.ativo || !r.valor || !r.dia || !r.inicio) continue;
    const [iy, im] = r.inicio.split('-').map(Number);
    for (let k = 0; k < 8; k++) {
      const [y, m] = addYM(h0.getFullYear(), h0.getMonth() + 1, k), n = (y - iy) * 12 + (m - im);
      if (n < 0 || (r.parcelas && n >= r.parcelas)) continue;
      const data = y + '-' + pad(m) + '-' + pad(Math.min(r.dia, dim(y, m)));
      if (data <= hoje) continue;
      const cartao = cfgC[r.cartao] ? r.cartao : padrao, c = ciclo(cartao, data);
      const registrada = comprasLancadas.findIndex(it =>
        it.cartao === cartao && it.data === data && it.valor === c2(r.valor) &&
        (norm(it.descricao) === norm(r.descricao) || norm(it.descricao).startsWith(norm(r.descricao) + ' ')));
      if (registrada >= 0) {
        comprasLancadas.splice(registrada, 1);
        continue;
      }
      fatItens.push({ cartao, vencimento: c.vencimento, fechamento: c.fechamento, data, descricao: r.descricao + (r.parcelas ? ' ' + (n + 1) + '/' + r.parcelas : ''), categoria: r.categoria, valor: c2(r.valor), origem: 'previsto' });
    }
  }
  fatItens.sort((a, b) => a.data < b.data ? 1 : a.data > b.data ? -1 : 0);
  const g = {};
  for (const it of fatItens) { const k = it.cartao + '|' + it.vencimento; const o = g[k] || (g[k] = { cartao: it.cartao, vencimento: it.vencimento, fechamento: it.fechamento, lancado: 0, previsto: 0, compras: 0 }); if (it.origem === 'previsto') o.previsto += it.valor; else o.lancado += it.valor; o.compras++; }
  const usado = {}, aberta = {};
  const faturas = Object.values(g).sort((a, b) => a.vencimento < b.vencimento ? -1 : a.vencimento > b.vencimento ? 1 : (a.cartao < b.cartao ? -1 : 1)).map(o => {
    const c = cfgC[o.cartao] || {}; const paga = !!(c.ultima_paga && o.vencimento <= c.ultima_paga);
    let credito = 0; if (!paga && !usado[o.cartao]) { usado[o.cartao] = 1; credito = c.credito || 0; }
    let status; if (paga) status = 'paga'; else if (o.vencimento < hoje) status = 'atrasada'; else if (o.fechamento && o.fechamento <= hoje) status = 'fechada'; else if (!aberta[o.cartao]) { aberta[o.cartao] = 1; status = 'aberta'; } else status = 'futura';
    return { cartao: o.cartao, vencimento: o.vencimento, fechamento: o.fechamento || '', mes: o.vencimento.slice(0, 7), status, lancado: c2(o.lancado), previsto: c2(o.previsto), credito: c2(credito), total: c2(Math.max(0, o.lancado + o.previsto - credito)), compras: o.compras };
  });
  const rc = {}; const getRc = k => rc[k] || (rc[k] = { mes: k, ja_no_cartao: 0, vai_entrar: 0 }); getRc(cur);
  for (const f of faturas) { if (f.status === 'paga') continue; const lan = Math.max(0, f.lancado - f.credito); const a = getRc(cur); a.ja_no_cartao += lan; if (f.status === 'aberta') a.vai_entrar += Math.max(0, f.total - lan); if (f.mes > cur) { const o = getRc(f.mes); o.ja_no_cartao += lan; o.vai_entrar += Math.max(0, f.total - lan); } }
  // entradas e saídas da conta
  const fim = addM(cur, 6), movs = [], sal = {};
  for (const r of lanc) {
    if (r.pagamento === 'Crédito' || isVA(r.pagamento)) continue;
    if (r.tipo !== 'Receita' && r.tipo !== 'Despesa') continue;
    if (r.tipo === 'Receita' && r.categoria === 'Salário') sal[r.data.slice(0, 7)] = 1;
    movs.push({ mes: r.data.slice(0, 7), data: r.data, descricao: r.descricao, origem: r.tipo === 'Receita' ? 'Receita' : 'Pix e boleto', valor: c2(r.tipo === 'Receita' ? r.valor : -r.valor), situacao: r.data <= hoje ? 'feito' : 'previsto', fonte: 'lancamento' });
  }
  let ref = 0; for (const c of config) if (/sal[aá]rio/i.test(c.parametro)) { const n = pnum(c.valor); if (n) ref = n; }
  if (ref) for (let k = 1; k <= 6; k++) { const mes = addM(cur, k); if (!sal[mes]) movs.push({ mes, data: mes + '-06', descricao: 'Salário (valor de referência)', origem: 'Receita', valor: c2(ref), situacao: 'previsto', fonte: 'salario' }); }
  for (const c of contas) {
    if (c.status !== 'Pendente' || c.valor == null || !c.venc) continue;
    let n = 1; if (/^s/i.test(c.recorrente)) { const m = /(\d+)\s*\/\s*(\d+)/.exec(c.conta); n = m ? Math.max(1, Number(m[2]) - Number(m[1]) + 1) : 99; }
    const [vy, vm, vd] = c.venc.split('-').map(Number);
    for (let k = 0; k < n; k++) { let y = vy, m = vm + k; while (m > 12) { m -= 12; y++; } const mes = y + '-' + pad(m); if (mes > fim) break; const data = mes + '-' + pad(Math.min(vd, dim(y, m))); const atras = data < hoje; movs.push({ mes: atras ? cur : mes, data, descricao: c.conta, origem: 'Conta', valor: c2(-c.valor), situacao: atras ? 'atrasada' : 'previsto', fonte: 'conta' }); }
  }
  for (const f of faturas) { if (f.status === 'paga' || f.total <= 0 || f.mes > fim) continue; const atras = f.status === 'atrasada'; movs.push({ mes: atras ? cur : f.mes, data: f.vencimento, descricao: 'Fatura ' + f.cartao, origem: 'Fatura', valor: c2(-f.total), situacao: atras ? 'atrasada' : 'previsto', fonte: 'fatura' }); }
  movs.sort((a, b) => a.data < b.data ? -1 : a.data > b.data ? 1 : 0);
  // saldo de cada mês
  const { atual, reserva, dataSaldo } = saldoConsolidado(saldos, movs, hoje);
  const inf = {}; for (const s of sm) if (s.mes && s.saldo_inicial != null) inf[s.mes] = s.saldo_inicial;
  let ini = cur; for (const m of movs) if (m.mes < ini) ini = m.mes; for (const k in inf) if (k < ini) ini = k;
  for (const r of lanc) if (r.data.slice(0, 7) < ini) ini = r.data.slice(0, 7);
  const proj = []; let prev = null;
  for (let mes = ini; mes <= fim; mes = addM(mes, 1)) {
    let ent = 0, sai = 0, entP = 0, saiP = 0;
    for (const x of movs) { if (x.mes !== mes) continue; if (x.valor >= 0) ent += x.valor; else sai -= x.valor; if (x.situacao !== 'feito') { if (x.valor >= 0) entP += x.valor; else saiP -= x.valor; } }
    const tipo = mes < cur ? 'passado' : mes === cur ? 'atual' : 'futuro';
    let si = inf[mes] != null ? inf[mes] : null, sa = null, sf = null;
    if (tipo === 'atual') { sa = atual; sf = atual == null ? null : atual + entP - saiP; } else if (tipo === 'futuro') { if (si == null) si = prev; sf = si == null ? null : si + ent - sai; }
    proj.push({ mes, tipo, saldo_inicial: si == null ? null : c2(si), saldo_atual: sa == null ? null : c2(sa), saldo_final: sf == null ? null : c2(sf), entradas: c2(ent), saidas: c2(sai), a_entrar: c2(entP), a_sair: c2(saiP), reserva: c2(reserva), saldo_em: dataSaldo });
    prev = sf;
  }
  for (let i = 0; i < proj.length - 1; i++) if (proj[i].tipo === 'passado' && inf[proj[i + 1].mes] != null) proj[i].saldo_final = c2(inf[proj[i + 1].mes]);
  const desp = lanc.filter(r => r.tipo === 'Despesa');
  return { lanc, desp, contas, orc, saldos, cartoes, rec, fatItens, faturas, rc, movs, proj, meses: proj.map(p => p.mes) };
}
