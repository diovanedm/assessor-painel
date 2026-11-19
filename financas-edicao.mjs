import { norm, pad } from './datas.mjs?v=8787cb127060';

// Edição direta da planilha pelo painel: descobre as colunas de cada aba no espelho,
// converte os valores para os campos do formulário e de volta para a planilha.
export const ABAS_EDITAVEIS = ['Lançamentos', 'Contas', 'Orçamento', 'Cartões', 'Recorrentes', 'Saldos', 'Saldos mensais', 'Config'];
const OBRIGATORIAS = { 'Lançamentos': [0, 1, 2, 3, 5] };

const DATA_BR = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
const DATA_ISO = /^(\d{4})-(\d{2})-(\d{2})$/;
const MES = /^\d{1,2}\/\d{4}$/;
const NUMERO = /^[-−]?\s*(?:R\$\s*)?[-−]?\s*(?:\d{1,3}(?:\.\d{3})+|\d+)(?:,\d+)?$|^[-−]?\d+\.\d+$/;
const DINHEIRO = /valor|saldo|limite|credito|gasto|restante|r\$/;
const LIVRE = /descri|observ|texto|parametro/;

const ehData = v => DATA_BR.test(v) || DATA_ISO.test(v);

export function tipoDaColuna(nome, valores) {
  const n = norm(nome);
  if (valores.length ? valores.every(ehData) : /^data\b|atualizad|pago em|informado em/.test(n)) return 'data';
  if (valores.length ? valores.every(v => MES.test(v)) : /mm\/aaaa/.test(n)) return 'mes';
  if (valores.length ? valores.every(v => NUMERO.test(v)) : DINHEIRO.test(n)) return DINHEIRO.test(n) ? 'valor' : 'numero';
  return 'texto';
}

// Valores repetidos viram lista de escolha (Tipo, Pagamento, Categoria, Sim/Não, Status).
export function opcoesDaColuna(nome, valores, tipo) {
  if (tipo !== 'texto' || LIVRE.test(norm(nome))) return [];
  if (/sim\/nao/.test(norm(nome)) || (valores.length && valores.every(v => /^(sim|nao)$/.test(norm(v))))) return ['Sim', 'Não'];
  const contagem = new Map();
  for (const v of valores) contagem.set(v, (contagem.get(v) || 0) + 1);
  if (contagem.size > 20 || contagem.size >= valores.length) return [];
  return [...contagem.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'pt-BR')).map(([v]) => v);
}

export function colunasDaAba(espelho, aba) {
  const linhas = espelho?.abas?.[aba] || [];
  const cabecalho = linhas[0] || [];
  const largura = Math.max(cabecalho.length, ...linhas.slice(1).map(l => (l || []).length), 0);
  const calculadas = new Set(espelho?.calculadas?.[aba] || []);
  const obrigatorias = new Set(OBRIGATORIAS[aba] || [0]);
  return Array.from({ length: largura }, (_, i) => {
    const nome = String(cabecalho[i] || `Coluna ${i + 1}`).trim();
    const valores = linhas.slice(1).map(l => String(l?.[i] ?? '').trim()).filter(Boolean);
    const tipo = tipoDaColuna(nome, valores);
    return { i, nome, tipo, calculada: calculadas.has(i), obrigatoria: obrigatorias.has(i) && !calculadas.has(i), opcoes: opcoesDaColuna(nome, valores, tipo) };
  });
}

export const linhaDoEspelho = (espelho, aba, linha) => (espelho?.abas?.[aba]?.[linha - 1] || []).map(v => String(v ?? ''));

export function numeroDigitado(texto) {
  let s = String(texto ?? '').replace(/R\$/g, '').replace(/\s/g, '').replace(/−/g, '-');
  if (!s) return null;
  const negativo = s.startsWith('-');
  s = s.replace(/^-/, '');
  if (s.endsWith('%')) s = s.slice(0, -1);
  if (s.includes(',')) { if (!/^(?:\d{1,3}(?:\.\d{3})+|\d+),\d+$/.test(s)) return NaN; s = s.replace(/\./g, '').replace(',', '.'); }
  else if (/^\d{1,3}(?:\.\d{3})+$/.test(s)) s = s.replace(/\./g, '');
  else if (!/^\d+(?:\.\d+)?$/.test(s)) return NaN;
  const n = Number(s);
  return Number.isFinite(n) ? (negativo ? -n : n) : NaN;
}

const numeroBR = n => String(Math.round(n * 100) / 100).replace('.', ',');

export function paraCampo(valor, tipo) {
  const v = String(valor ?? '').trim();
  if (!v) return '';
  if (tipo === 'data') {
    let m = DATA_BR.exec(v);
    if (m) return `${m[3]}-${pad(m[2])}-${pad(m[1])}`;
    m = DATA_ISO.exec(v);
    return m ? v : '';
  }
  if (tipo === 'valor' || tipo === 'numero') {
    const n = numeroDigitado(v);
    return Number.isFinite(n) ? numeroBR(n) : v;
  }
  return v;
}

// Devolve o que vai para a planilha: data dd/mm/aaaa, números com vírgula e null nas colunas calculadas.
export function paraPlanilha(colunas, campos) {
  const erros = [];
  const valores = colunas.map(c => {
    if (c.calculada) return null;
    const v = String(campos[c.i] ?? '').trim();
    if (!v) { if (c.obrigatoria) erros.push(`Preencha ${c.nome}.`); return ''; }
    if (c.tipo === 'data') {
      const m = DATA_ISO.exec(v) || DATA_BR.exec(v);
      if (!m) { erros.push(`${c.nome}: data inválida.`); return v; }
      return DATA_ISO.test(v) ? `${m[3]}/${m[2]}/${m[1]}` : `${pad(m[1])}/${pad(m[2])}/${m[3]}`;
    }
    if (c.tipo === 'valor' || c.tipo === 'numero') {
      const n = numeroDigitado(v);
      if (!Number.isFinite(n)) { erros.push(`${c.nome}: número inválido.`); return v; }
      return numeroBR(n);
    }
    if (c.tipo === 'mes' && !MES.test(v)) { erros.push(`${c.nome}: use mm/aaaa.`); return v; }
    return v.replace(/\s*\n\s*/g, ' ');
  });
  if (!erros.length && valores.every(v => v === '' || v == null)) erros.push('Preencha pelo menos um campo.');
  return { valores, erros };
}

export function linhaNova(colunas, aba, hoje) {
  const [y, m, d] = hoje.split('-');
  return colunas.map(c => {
    if (c.calculada) return '';
    if (aba === 'Lançamentos' && c.i === 0) return `${d}/${m}/${y}`;
    if (aba === 'Lançamentos' && c.i === 1) return 'Despesa';
    if (aba === 'Contas' && /status/.test(norm(c.nome))) return 'Pendente';
    if (/^ativo/.test(norm(c.nome))) return 'Sim';
    if (aba === 'Saldos' && /atualizado/.test(norm(c.nome))) return `${d}/${m}/${y}`;
    return '';
  });
}

// Linhas de uma aba para a lista do painel: número da linha na planilha e o texto da busca.
export function linhasDaAba(espelho, aba, busca = '') {
  const linhas = espelho?.abas?.[aba] || [];
  const termo = norm(busca).trim();
  const saida = [];
  linhas.forEach((l, k) => {
    if (!k || !l || !l.some(v => String(v ?? '').trim())) return;
    const valores = l.map(v => String(v ?? ''));
    if (termo && !norm(valores.join(' ')).includes(termo)) return;
    saida.push({ linha: k + 1, valores });
  });
  if (aba === 'Lançamentos') {
    const chave = v => { const m = DATA_BR.exec(v[0] || ''); return m ? `${m[3]}-${pad(m[2])}-${pad(m[1])}` : String(v[0] || ''); };
    saida.sort((a, b) => chave(b.valores).localeCompare(chave(a.valores)) || b.linha - a.linha);
  }
  return saida;
}

export function pedidoPlanilha(acao, aba, linha, antes, valores) {
  if (!ABAS_EDITAVEIS.includes(aba)) throw new Error('Aba não editável: ' + aba);
  const pedido = { acao, aba };
  if (acao !== 'criar') { pedido.linha = linha; pedido.antes = antes; }
  if (acao !== 'apagar') pedido.valores = valores;
  return pedido;
}
