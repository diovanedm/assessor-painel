// O espelho que o assessor grava em painel/espelho.json: o que está agora no Google Agenda,
// no TickTick e no Minhas Economias. O painel só lê; quem manda são os aplicativos.
import { addDays, pymd, ymd, toMin } from './datas.mjs?v=9c31fcd4636f';

export const APPS = {
  agenda: { nome: 'Google Agenda', url: 'https://calendar.google.com/calendar/r' },
  tarefas: { nome: 'TickTick', url: 'https://ticktick.com/webapp/' },
  financas: { nome: 'Minhas Economias', url: 'https://apps.apple.com/br/app/minhas-economias/id520869873' },
};

const ehData = s => /^\d{4}-\d{2}-\d{2}$/.test(String(s || ''));
const ehHora = s => /^\d{1,2}:\d{2}$/.test(String(s || ''));
const num = v => (typeof v === 'number' && Number.isFinite(v) ? v : null);

/** Minutos desde a última atualização do espelho (null se não dá pra saber). */
export function idadeDoEspelho(esp, agora) {
  const t = Date.parse(esp?.atualizado || '');
  return Number.isFinite(t) ? Math.max(0, Math.round((agora - t) / 60000)) : null;
}

/** Compromissos por dia, de hoje até hoje + dias − 1. Dia todo primeiro, depois por horário. */
export function agendaPorDia(esp, hoje, dias = 7) {
  const itens = (Array.isArray(esp?.agenda) ? esp.agenda : []).filter(e => e && ehData(e.data) && e.titulo);
  return [...Array(dias)].map((_, i) => {
    const dia = ymd(addDays(pymd(hoje), i));
    const doDia = itens.filter(e => e.data === dia).map(e => ({ ...e, diaTodo: !ehHora(e.inicio) }))
      .sort((a, b) => (b.diaTodo - a.diaTodo) || String(a.inicio || '').localeCompare(String(b.inicio || '')));
    return { dia, itens: doDia };
  });
}

/** Situação de um compromisso agora: 'passou', 'agora' ou 'depois'. */
export function momento(item, dia, hoje, minutoAgora) {
  if (dia < hoje) return 'passou';
  if (dia > hoje || item.diaTodo) return 'depois';
  const ini = toMin(item.inicio), fim = ehHora(item.fim) ? toMin(item.fim) : ini;
  if (minutoAgora >= fim && fim > ini) return 'passou';
  if (minutoAgora >= ini && minutoAgora < fim) return 'agora';
  return minutoAgora > ini ? 'passou' : 'depois';
}

const PESO = { alta: 0, media: 1, baixa: 2, nenhuma: 3 };
/** Tarefas abertas do TickTick em grupos: atrasadas, hoje, próximos 7 dias, mais adiante e sem prazo. */
export function tarefasEmGrupos(esp, hoje) {
  const grupos = { atrasadas: [], hoje: [], semana: [], depois: [], semPrazo: [] };
  const limite = ymd(addDays(pymd(hoje), 7));
  for (const t of Array.isArray(esp?.tarefas) ? esp.tarefas : []) {
    if (!t || !t.titulo) continue;
    if (!ehData(t.prazo)) grupos.semPrazo.push(t);
    else if (t.prazo < hoje) grupos.atrasadas.push(t);
    else if (t.prazo === hoje) grupos.hoje.push(t);
    else if (t.prazo <= limite) grupos.semana.push(t);
    else grupos.depois.push(t);
  }
  const ordem = (a, b) => String(a.prazo || '9').localeCompare(String(b.prazo || '9'))
    || String(a.hora || '99').localeCompare(String(b.hora || '99'))
    || (PESO[a.prioridade] ?? 3) - (PESO[b.prioridade] ?? 3);
  for (const g of Object.values(grupos)) g.sort(ordem);
  return grupos;
}

/** Resumo do dinheiro para a tela: só números que vieram do Minhas Economias. */
export function resumoFinanceiro(esp, { categorias = 6 } = {}) {
  const f = esp?.financas;
  if (!f || typeof f !== 'object') return null;
  const contas = (Array.isArray(f.contas) ? f.contas : []).filter(c => c && c.nome && num(c.saldo) != null)
    .sort((a, b) => b.saldo - a.saldo);
  const todas = (Array.isArray(f.categorias) ? f.categorias : []).filter(c => c && c.nome && num(c.valor) > 0)
    .sort((a, b) => b.valor - a.valor);
  const principais = todas.slice(0, categorias);
  const resto = todas.slice(categorias).reduce((s, c) => s + c.valor, 0);
  if (resto > 0) principais.push({ nome: `Outras ${todas.length - categorias}`, valor: Math.round(resto * 100) / 100, cor: '' });
  const maior = principais.reduce((m, c) => Math.max(m, c.valor), 0);
  const faturas = (Array.isArray(f.faturas) ? f.faturas : []).filter(x => x && x.cartao && num(x.valor) > 0 && ehData(x.vence))
    .sort((a, b) => a.vence.localeCompare(b.vence) || b.valor - a.valor);
  const ultimos = (Array.isArray(f.ultimos) ? f.ultimos : []).filter(x => x && ehData(x.data) && x.descricao && num(x.valor) != null);
  const saldoTotal = num(f.saldoTotal) ?? (contas.length ? Math.round(contas.reduce((s, c) => s + c.saldo, 0) * 100) / 100 : null);
  return {
    mes: /^\d{4}-\d{2}$/.test(f.mes || '') ? f.mes : null,
    saldoTotal, contas,
    ganhos: num(f.ganhos), gastos: num(f.gastos), resultado: num(f.resultado),
    categorias: principais.map(c => ({ ...c, parte: maior ? c.valor / maior : 0 })),
    faturas, proximaFatura: faturas[0] || null, ultimos,
  };
}
