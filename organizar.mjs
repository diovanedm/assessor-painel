// Organização das páginas de área e de caso (22/11/2026).
// Regra: tarefa é do TickTick. O painel mostra as tarefas abertas lá (pelo espelho) e aponta
// para o TickTick; o que só existe nas notas aparece como "fora do TickTick".
import { norm, pymd, ymd, addDays } from './datas.mjs?v=608f29e12708';
import { secoesDeLeitura } from './areas.mjs?v=608f29e12708';

export const TICKTICK = 'https://ticktick.com/webapp/';
const ID_RE = /^[0-9a-f]{24}$/i;
const ehData = s => /^\d{4}-\d{2}-\d{2}$/.test(String(s || ''));
const ehHora = s => /^\d{1,2}:\d{2}$/.test(String(s || ''));
const maiusc = t => { const s = String(t || '').trim(); return s.charAt(0).toUpperCase() + s.slice(1); };

/** Id da tarefa no fim do link do TickTick (`…/tasks/<id>`). */
export const idDoLink = link => (String(link || '').match(/\/tasks\/([0-9a-f]{24})(?![0-9a-f])/i) || [])[1] || null;

/** O que está aberto no TickTick, pelo espelho. `completo`: o espelho traz todas as abertas
    (não só as da semana), então uma 🆔 que não está nele já foi concluída lá. */
export function tickTick(esp) {
  const lista = (Array.isArray(esp?.tarefas) ? esp.tarefas : []).filter(t => t && t.titulo).map(t => ({
    ...t,
    id: ID_RE.test(String(t.id || '')) ? t.id : idDoLink(t.link),
    nota: /\.md$/.test(String(t.nota || '')) ? t.nota : null,
  }));
  return { lista, porId: new Map(lista.filter(t => t.id).map(t => [t.id, t])), completo: esp?.tarefasTodas === true, existe: !!esp };
}

/** Uma tarefa escrita numa nota, olhando o TickTick:
    'aberta' (aberta lá) · 'feita' (marcada na nota) · 'fechada' (aberta na nota, concluída lá)
    · 'fora' (sem 🆔: não existe no TickTick) · 'desconhecida' (o espelho só traz parte das tarefas). */
export function situacaoDaTarefa(t, T) {
  if (t.id && T.porId.has(t.id)) return 'aberta';
  if (t.checked) return 'feita';
  if (!t.id) return 'fora';
  return T.completo ? 'fechada' : 'desconhecida';
}

/** Tarefas abertas no TickTick de um assunto: da área, ligadas a uma das notas (campo `nota`)
    ou com a 🆔 escrita numa das notas. */
export function tarefasDoAssunto(T, { area = null, paths = [], ids = [] } = {}) {
  const P = new Set(paths), D = new Set(ids);
  return T.lista.filter(t => (area && t.area === area) || (t.nota && P.has(t.nota)) || (t.id && D.has(t.id)));
}

/** Tarefas das notas que não batem com o TickTick: `fora` (sem 🆔) e `fechadas` (concluídas lá, abertas na nota). */
export function foraDoTickTick(tarefas, T) {
  const fora = [], fechadas = [];
  for (const t of tarefas) {
    const s = situacaoDaTarefa(t, T);
    if (s === 'fora') fora.push(t);
    else if (s === 'fechada') fechadas.push(t);
  }
  return { fora, fechadas };
}

/* ─────────── agenda ─────────── */

/** Título da agenda em partes para o cartão: ícone (emoji do começo), nome e um complemento curto.
    "🩺 Consulta Michele – Ginecologia (Renata Alves), CPS - Pedro 1" → 🩺 · "Consulta Michele – Ginecologia" · "Renata Alves · CPS - Pedro 1". */
export function partesDoTitulo(titulo) {
  let t = String(titulo || '').trim();
  const ic = t.match(/^((?:\p{Extended_Pictographic}|\p{Regional_Indicator})(?:️|‍\p{Extended_Pictographic})*)\s*/u);
  const icone = ic ? ic[1] : '';
  if (ic) t = t.slice(ic[0].length);
  const sub = [];
  const pre = t.match(/^(prazo|lembrete|aviso)\s*:\s*/i);
  if (pre) { sub.push(maiusc(pre[1].toLowerCase())); t = t.slice(pre[0].length); }
  const serie = t.match(/^([^·•]{2,24}?)\s+[·•]\s+(.+)$/);
  if (serie) t = serie[2];
  let nome = t;
  const par = t.match(/^(.+?)\s*\(([^)]*)\)\s*,?\s*(.*)$/);
  if (par) {
    nome = par[1];
    sub.push(par[2].split(',')[0]);
    if (par[3]) sub.push(par[3].split(',')[0]);
  } else {
    const i = t.indexOf(', ');
    if (i > 0) { nome = t.slice(0, i); sub.push(t.slice(i + 2).split(',')[0]); }
  }
  return { icone, nome: maiusc(nome), sub: sub.map(s => maiusc(s.trim())).filter(Boolean).join(' · ') };
}

const chaveDoEvento = (data, titulo) => data + '|' + norm(partesDoTitulo(titulo).nome).replace(/[^a-z0-9]+/g, ' ').trim().split(' ').slice(0, 3).join(' ');

/** Próximos compromissos de uma área: o espelho do Google Agenda (7 dias, com link) mais o
    `agenda.md` (meses à frente), sem repetir. Em ordem de data e hora. */
export function compromissosDaArea({ espelho, eventos = [], area, hoje, n = Infinity }) {
  const out = [], visto = new Set();
  const por = (data, titulo, item) => { const k = chaveDoEvento(data, titulo); if (visto.has(k)) return; visto.add(k); out.push(item); };
  for (const e of Array.isArray(espelho?.agenda) ? espelho.agenda : []) {
    if (!e || e.area !== area || !ehData(e.data) || e.data < hoje || !e.titulo) continue;
    por(e.data, e.titulo, { data: e.data, inicio: ehHora(e.inicio) ? e.inicio : null, fim: ehHora(e.fim) ? e.fim : null, titulo: e.titulo, link: e.link || '', obs: '' });
  }
  for (const e of eventos) {
    if (e.area !== area || !ehData(e.date) || e.date < hoje || !e.name) continue;
    por(e.date, e.name, { data: e.date, inicio: e.allDay ? null : e.start, fim: e.allDay ? null : e.end, titulo: e.name, link: '', obs: e.obs || '' });
  }
  return out.sort((a, b) => (a.data + (a.inicio || '')).localeCompare(b.data + (b.inicio || ''))).slice(0, n);
}

/** Blocos da semana (seg a dom) de uma área: previstos pelas séries fixas da agenda e feitos pelos hábitos. */
export function semanaDosBlocos({ series = [], habitos = [], area, hoje }) {
  const d0 = pymd(hoje), seg = addDays(d0, -((d0.getDay() + 6) % 7));
  const dias = [...Array(7)].map((_, i) => ymd(addDays(seg, i)));
  let previstos = 0;
  for (const s of series) {
    if (s.area !== area) continue;
    for (const d of dias) {
      if (s.from && d < s.from) continue;
      if (s.until && d > s.until) continue;
      const x = pymd(d);
      if (s.days?.mday ? x.getDate() === s.days.mday : s.days?.dows?.has(x.getDay())) previstos++;
    }
  }
  const daSemana = habitos.filter(h => h.area === area && dias.includes(h.date) && h.st);
  const feitos = daSemana.filter(h => h.st === 'feito').length;
  previstos = Math.max(previstos, daSemana.filter(h => h.st !== 'cancelado').length);
  return { previstos, feitos, pct: previstos ? Math.round(Math.min(1, feitos / previstos) * 100) : null };
}

/** Andamento das metas do trimestre (das linhas da tabela de metas). `pct` só quando há número. */
export function progressoDasMetas(metas) {
  const comNumero = metas.filter(m => typeof m.pct === 'number');
  return {
    total: metas.length,
    comNumero: comNumero.length,
    pct: comNumero.length ? Math.round(comNumero.reduce((s, m) => s + m.pct, 0) / comNumero.length) : null,
  };
}

/* ─────────── tabelas ─────────── */
const celulas = l => l.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map(c => c.trim());
const separador = l => /^\|\s*:?-{3,}/.test(l.trim());
/** Primeira tabela de um texto: { head, rows, resto } (resto = o texto fora da tabela). */
export function tabela(texto) {
  const L = String(texto || '').split('\n');
  const i = L.findIndex((l, k) => l.trim().startsWith('|') && L[k + 1] && separador(L[k + 1]));
  if (i < 0) return { head: [], rows: [], resto: String(texto || '').trim() };
  let j = i + 2;
  const rows = [];
  while (j < L.length && L[j].trim().startsWith('|')) rows.push(celulas(L[j++]));
  return { head: celulas(L[i]), rows: rows.filter(r => r.some(c => c && !/^[—–-]$/.test(c))), resto: [...L.slice(0, i), ...L.slice(j)].join('\n').trim() };
}

/* ─────────── cardápio (casa e família) ─────────── */
export const DIAS_CURTOS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
/** "## Cardápio da semana" com a tabela Dia | Proteína | Legume | …: { colunas, dias: [{ dia, itens }], obs }. */
export function cardapio(body) {
  const s = secoesDeLeitura(String(body || '')).find(x => /^cardapio\b/.test(norm(x.title)));
  if (!s) return null;
  const T = tabela(s.text);
  if (!T.head.length || norm(T.head[0]) !== 'dia') return null;
  const colunas = T.head.slice(1);
  const dias = T.rows.filter(r => r[0]).map(r => ({ dia: r[0], itens: colunas.map((c, i) => [c, r[i + 1] || '']).filter(([, v]) => v && !/^[—–-]$/.test(v)) }));
  const obs = T.resto.split('\n').map(l => l.trim()).filter(l => l && !/^montado em/i.test(norm(l)) && !/^[#|]/.test(l)).pop() || '';
  return dias.length ? { colunas, dias, obs } : null;
}
export const diaDoCardapio = (C, hoje) => {
  const alvo = norm(DIAS_CURTOS[pymd(hoje).getDay()]).slice(0, 3);
  return C?.dias.find(d => norm(d.dia).slice(0, 3) === alvo) || null;
};

/* ─────────── caso ─────────── */
const TIPO_SECAO = [
  ['numeros', /^(numeros|protocolos)\b/],
  ['onde', /^onde esta\b/],
  ['contatos', /^contatos?\b/],
  ['passos', /^(proximos passos|tarefas|pendencias)\b/],
  ['linha', /^linha do tempo\b/],
  ['historico', /^historico\b/],
  ['arquivos', /^(arquivos|documentos|anexos)\b/],
];
const limpaTitulo = t => norm(t).replace(/^[^a-z0-9]+/, '').trim();

/** O "Agora" de "Onde está": { rotulo: '17/11, 11h59', texto }, e o resto do texto da seção. */
export function agoraDoCaso(texto) {
  const paras = String(texto || '').split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
  const i = paras.findIndex(p => /^(\*\*)?(agora|parei aqui)\b/i.test(p));
  if (i < 0) return { agora: null, resto: paras.join('\n\n') };
  const p = paras[i];
  const m = p.match(/^(?:\*\*)?(agora|parei aqui)\s*(?:\(([^)]*)\))?\s*:?\s*(?:\*\*)?\s*:?\s*/i);
  const texto2 = p.slice(m ? m[0].length : 0).trim();
  return { agora: { rotulo: m?.[2] || '', texto: texto2 }, resto: paras.filter((_, k) => k !== i).join('\n\n') };
}

/** Seções de um caso já separadas pelas abas da página. Nada se perde: o que não tem lugar vai em `outras`. */
export function partesDoCaso(body) {
  const P = { intro: '', onde: null, numeros: null, contatos: '', passos: '', linha: [], linhaResto: '', historico: '', arquivos: '', outras: [] };
  for (const s of secoesDeLeitura(String(body || ''))) {
    if (s.intro) { P.intro = s.text; continue; }
    const tipo = (TIPO_SECAO.find(([, re]) => re.test(limpaTitulo(s.title))) || [])[0];
    if (tipo === 'numeros') { const T = tabela(s.text); P.numeros = { head: T.head, rows: T.rows, resto: T.resto }; }
    else if (tipo === 'onde') P.onde = agoraDoCaso(s.text);
    else if (tipo === 'linha') {
      const T = tabela(s.text);
      const linhas = T.rows.map(r => ({ data: r[0] || '', texto: r.slice(1).filter(Boolean).join(' · ') })).filter(r => r.texto);
      const crescente = linhas.length > 1 && linhas[0].data.slice(0, 10) <= linhas.at(-1).data.slice(0, 10);
      P.linha = crescente ? linhas.reverse() : linhas;
      P.linhaResto = T.resto;
    }
    else if (tipo) P[tipo] = P[tipo] ? P[tipo] + '\n\n' + s.text : s.text;
    else P.outras.push({ titulo: s.title, texto: s.text });
  }
  return P;
}
