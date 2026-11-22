/* ─────────────── utilidades ─────────────── */
import { CUSTOS_DA_AREA, TOPICOS, areasDoTexto, casosDaArea, custosDaArea, linksDasNotas, destinoDaArea, diasDaArea, ehRegistroDoMes, entradasDatadas, linkDaNota, linkDeRegistro, metasDaTabela, notaSolta, notasDaArea, padroesDosHabitos, primeiraMeta, secoesDeLeitura, secoesDoTopico } from './areas.mjs?v=13ee44f54df8';
import { refeicaoDoHorario, refeicoesOrdenadas } from './alimentacao.mjs?v=13ee44f54df8';
import { visaoBemEstar } from './bem-estar.mjs?v=13ee44f54df8';
import { blocosDaSemanaModelo, casosEmAndamento, pontoDeParada, textoDaBusca } from './memoria.mjs?v=13ee44f54df8';
import { APPS, agendaPorDia, idadeDoEspelho, momento, resumoFinanceiro, tarefasEmGrupos } from './espelho.mjs?v=13ee44f54df8';
import { humorRecente, marcosDaArea, nivelDeIngles, proximosDaArea, semanaDaArea, trilha } from './visual.mjs?v=13ee44f54df8';
import { linhasCaptura, lerCaptura, tipoAnexo, extAudio, lerOrganizados, destinoLegivel } from './captura.mjs?v=13ee44f54df8';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const h = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
import { norm, pad, ymd, pymd, addDays, hm, toMin, now } from './datas.mjs?v=13ee44f54df8';
const DOW = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
const DOWL = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
const MON = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const dm = s => { const d = pymd(s); return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`; };
const dayLabel = s => { const d = pymd(s); return `${DOW[d.getDay()]} ${pad(d.getDate())}/${pad(d.getMonth() + 1)}`; };
const short = (s, n = 70) => { s = String(s).replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n - 1).replace(/[\s,;:.—-]+\S*$/, '') + '…' : s; };
const pad5 = s => s.length === 4 ? '0' + s : s;
const ICON = {
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
  x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/></svg>',
};
const PAGES = [
  { id: 'inicio', nome: 'Hoje', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><rect x="4" y="4" width="7" height="7" rx="2.2"/><rect x="13" y="4" width="7" height="7" rx="2.2"/><rect x="4" y="13" width="7" height="7" rx="2.2"/><rect x="13" y="13" width="7" height="7" rx="2.2"/></svg>' },
  { id: 'tarefas', nome: 'Tarefas', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="7" r="2"/><path d="M11 7h9M11 17h9"/><path d="m4.5 17 1.5 1.5L8.5 15.5"/></svg>' },
  { id: 'financas', nome: 'Finanças', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="6" width="17" height="13" rx="3"/><path d="M3.5 10.5h17"/><path d="M15 15h2.5"/></svg>' },
  { id: 'alimentacao', nome: 'Refeições e compras', curto: 'Refeições', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.5h16a8 8 0 0 1-16 0Z"/><path d="M9.5 9c0-1.6 1.2-2 1.2-3.6M13.5 9c0-1.6 1.2-2 1.2-3.6"/></svg>' },
  { id: 'areas', nome: 'Memória', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><path d="m15.5 8.5-2 5-5 2 2-5 5-2Z"/></svg>' },
];
const MAIS_ICON = '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5.5" cy="12" r="1.9"/><circle cx="12" cy="12" r="1.9"/><circle cx="18.5" cy="12" r="1.9"/></svg>';

const LS = {
  get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { } },
  raw(k) { try { return localStorage.getItem(k); } catch { return null; } },
  put(k, v) { try { localStorage.setItem(k, v); return true; } catch { return false; } },
  del(k) { try { localStorage.removeItem(k); } catch { } },
  keys() { try { return Object.keys(localStorage); } catch { return []; } },
};
const K = 'assessor.painel.';
/* cache das notas: IndexedDB (cabe centenas de MB; o localStorage para em ~5 MB e o painel
   passaria a baixar tudo de novo a cada abertura). Sem IndexedDB, volta pro localStorage. */
const Blobs = {
  mem: new Map(), db: null,
  async init() {
    if (this.db || !window.indexedDB) return;
    try {
      this.db = await new Promise((ok, no) => {
        const r = indexedDB.open('assessor-painel', 1);
        r.onupgradeneeded = () => r.result.createObjectStore('b');
        r.onsuccess = () => ok(r.result);
        r.onerror = () => no(r.error);
        r.onblocked = () => no(new Error('blocked'));
      });
    } catch { this.db = null; }
  },
  store(mode) { return this.db.transaction('b', mode).objectStore('b'); },
  async load(shas) {
    const want = [...new Set(shas)].filter(x => x && !this.mem.has(x));
    if (this.db && want.length) {
      try {
        await new Promise(ok => {
          const st = this.store('readonly');
          let n = want.length;
          const fim = () => { if (--n === 0) ok(); };
          for (const x of want) { const g = st.get(x); g.onsuccess = () => { if (g.result != null) this.mem.set(x, g.result); fim(); }; g.onerror = fim; }
        });
      } catch { }
    }
    /* migra o que ainda estiver no localStorage (versão antiga do painel) */
    for (const x of want) {
      if (this.mem.has(x)) continue;
      const t = LS.raw(K + 'b.' + x);
      if (t == null) continue;
      this.mem.set(x, t);
      if (this.db) { this.put(x, t); LS.del(K + 'b.' + x); }
    }
  },
  get(x) { const t = this.mem.get(x); return t == null ? null : t; },
  put(x, t) {
    this.mem.set(x, t);
    if (this.db) { try { this.store('readwrite').put(t, x); return; } catch { } }
    LS.put(K + 'b.' + x, t);
  },
  gc(keep) {
    for (const x of [...this.mem.keys()]) if (!keep.has(x)) this.mem.delete(x);
    for (const k of LS.keys()) if (k.startsWith(K + 'b.') && !keep.has(k.slice(K.length + 2))) LS.del(k);
    if (!this.db) return;
    try {
      const st = this.store('readwrite');
      const r = st.getAllKeys();
      r.onsuccess = () => { for (const k of r.result) if (!keep.has(k)) st.delete(k); };
    } catch { }
  },
  clear() {
    this.mem.clear();
    for (const k of LS.keys()) if (k.startsWith(K + 'b.')) LS.del(k);
    if (this.db) { try { this.store('readwrite').clear(); } catch { } }
  },
};
const cfg = Object.assign({ token: '', repo: 'diovanedm/meu-assessor-dados', branch: '', interval: 15, theme: 'auto', discreet: true, finUrl: '', finToken: '' }, LS.get(K + 'cfg', {}));
const saveCfg = () => LS.set(K + 'cfg', cfg);
const devHost = ['localhost', '127.0.0.1'].includes(location.hostname);
const API = (devHost && new URLSearchParams(location.search).get('api')) || 'https://api.github.com';

/* ─────────────── o que o painel sabe do repo ─────────────── */
const AREAS = {
  financas: { nome: 'Finanças', emoji: '💰' }, saude: { nome: 'Saúde', emoji: '💪' }, ingles: { nome: 'Inglês', emoji: '🗣️' },
  trabalho: { nome: 'Trabalho', emoji: '💼' }, carreira: { nome: 'Carreira', emoji: '🚀' }, emocional: { nome: 'Emocional', emoji: '💭' },
  'casa-familia': { nome: 'Casa e família', emoji: '🏡' }, cultura: { nome: 'Cultura', emoji: '📚' },
};
const AREA_ORDER = ['financas', 'saude', 'ingles', 'trabalho', 'carreira', 'emocional', 'casa-familia', 'cultura'];
const NOTA_AREAS = [['geral', '📥 Geral'], ['trabalho', '💼 Trabalho'], ['financas', '💰 Finanças'], ['casa-familia', '🏡 Casa e família'], ['saude', '💪 Saúde'], ['emocional', '💭 Emocional'], ['ingles', '🗣️ Inglês'], ['carreira', '🚀 Carreira'], ['cultura', '📚 Cultura']];
const EMOCOES = ['irritação', 'raiva', 'ansiedade', 'nervoso', 'cansaço', 'tristeza', 'culpa', 'medo', 'frustração', 'calma', 'alegria', 'gratidão'];
const HUMOR = [['😣', 'péssimo'], ['🙁', 'mal'], ['😐', 'mais ou menos'], ['🙂', 'bem'], ['😄', 'muito bem']];
const SENS = new Set(['emocional', 'saude']);
const VEIL = new Set(['emocional', 'saude', 'financas']);
const SEMANA_MODELO = 'eu/plano.md';
const COMPRAS = 'areas/casa-familia/compras.md';
const CAIXA = 'painel/caixa.md', RESERVADA = 'painel/caixa-reservada.md';
const FIN = 'painel/espelho.json', FICHAS = 'painel/fichas.md';
const PLANO_D = 'areas/saude/plano-alimentar.md', PLANO_M = 'areas/casa-familia/plano-alimentar-michele.md', SUBS_M = 'areas/casa-familia/substituicoes-michele.md', CASAL = 'areas/casa-familia/alimentacao-casal.md';
const STATUS = { bem: 'bem', atencao: 'atenção', alerta: 'alerta', parado: 'parado' };
const STATUS_PRIORITARIOS = ['parado', 'alerta', 'atencao'];
const ROTULOS = {
  financas: '💰 Finanças', agenda: '📅 Agenda', diario: '📓 Diário', emocional: '💭 Emocional', saude: '💪 Saúde', ingles: '🗣️ Inglês',
  trabalho: '💼 Trabalho', carreira: '🚀 Carreira', 'casa-familia': '🏡 Casa e família', casa: '🏡 Casa', familia: '🏡 Família', cultura: '📚 Cultura',
  documentos: '📄 Documentos', eu: '🙋 Você', compras: '🛒 Compras', pessoas: '👥 Pessoas', inbox: '📥 Inbox', tarefas: '✅ Tarefas',
  caso: '📂 Caso', obsidian: '✏️ Você no Obsidian', vault: '✏️ Você no Obsidian', painel: '📲 Painel',
};
const TECNICOS = new Set(['indice', 'repo', 'inicio', 'plugin', 'merge', 'ferramentas', 'espelho']);
/* Painel só de leitura (22/11/2026): estes atributos gravavam na caixa ou nas notas. */
const ESCRITA = ['humor', 'task', 'compra', 'cxdel', 'mdt', 'pego', 'boxRemove', 'areaCaptura', 'anotarNota', 'ficha', 'regficha', 'reg'];
const TASK_RE = /^(\s*)- \[([ xX])\] (.*)$/;
const ITEM_RE = /^- (\d{4}-\d{2}-\d{2}) (\d{1,2}:\d{2}) — (.+)$/;

function areaKey(s) {
  const n = norm(s).trim();
  if (!n) return '';
  if (AREAS[n]) return n;
  if (n.startsWith('casa') || n.startsWith('famil')) return 'casa-familia';
  for (const k in AREAS) if (norm(AREAS[k].nome) === n) return k;
  return n;
}
const areaColor = a => AREAS[a] ? `var(--a-${a})` : 'var(--a-eu)';
const incluir = p => p.endsWith('.md') && !/^(?:\.|arquivo\/|_modelos\/|ferramentas\/|memoria\/|dist\/)/.test(p) && !['AGENTS.md', 'inicio.md', 'CLAUDE.md', 'README.md'].includes(p);

/* ─────────────── estado ─────────────── */
const S = {
  head: null, etag: null, files: {}, commits: [], ours: new Set(),
  tasks: [], compras: { secs: [], heads: [] }, agenda: { series: [], events: [] }, habits: [], inbox: [], stems: {}, name: '',
  cx: [], ov: null, pendAdd: [], pendDel: new Set(),
  syncing: false, lastSync: 0, lastTry: 0, pending: 0, err: null, rateReset: 0, wrote: {}, resync: false,
  page: 'inicio', areaRoute: null, areaHash: '', tab: 'hoje', reg: 'nota', open: null, reveal: new Set(), minute: -1, day: '',
  notaArea: 'geral', regFicha: 'estou', fichas: [], plano: null, comprados: [], sel: null, wk: 0, _idx: {},
  extratoTipo: '', extratoBusca: '', planAba: 'Lançamentos', planBusca: '',
  fin: null, finSha: null, _fm: null, finMes: null, finTab: 'resumo', finOpen: {}, finDia: null, finCat: null, fcart: null,
  aliTab: 'plano', pessoa: LS.get(K + 'pessoa2', 'ambos'), aliRef: null, trocaP: LS.get(K + 'trocap', 'diovane'), trocaOpen: null, dias: LS.get(K + 'dias', 7), trocaQ: '',
};
let queue = Promise.resolve();

/* ─────────────── leitura das notas ─────────────── */
function parseFile(path, sha, text) {
  const fm = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  const meta = {};
  let body = text;
  if (fm) {
    body = text.slice(fm[0].length);
    for (const l of fm[1].split(/\r?\n/)) {
      const m = l.match(/^([\w-]+):\s*(.*)$/);
      if (!m) continue;
      let v = m[2].trim();
      if (v.startsWith('[') && v.endsWith(']')) v = v.slice(1, -1).split(',').map(x => x.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
      else v = v.replace(/^["']|["']$/g, '');
      meta[m[1]] = v;
    }
  }
  const stem = path.split('/').pop().replace(/\.md$/, '');
  const tm = body.match(/^#\s+(.+)$/m);
  const title = tm ? tm[1].trim() : stem;
  let area = areaKey(meta.area || '');
  const ma = path.match(/^areas\/([^/]+)\//);
  if (ma && (!area || !AREAS[area])) area = ma[1];
  if (!area) area = 'eu';
  const sens = SENS.has(area) || path === RESERVADA || path === SEMANA_MODELO || path === 'eu/como-funciono.md';
  const tasks = [];
  let h2 = '', h3 = '', fence = false;
  for (const l of text.split('\n')) {
    if (/^\s*```/.test(l)) { fence = !fence; continue; }
    if (fence) continue;
    let m;
    if ((m = l.match(/^(#{2,3})\s+(.*)$/))) { if (m[1] === '##') { h2 = m[2].trim(); h3 = ''; } else h3 = m[2].trim(); continue; }
    if ((m = l.match(TASK_RE))) tasks.push(mkTask(l, m, h2, h3));
  }
  return { path, sha, text, meta, body, stem, title, area, sens, tasks, _n: null };
}
function mkTask(raw, m, h2, h3) {
  const r = m[3];
  return {
    raw, checked: m[2] !== ' ', h2, h3,
    due: (r.match(/📅\s*(\d{4}-\d{2}-\d{2})/) || [])[1] || null,
    done: (r.match(/✅\s*(\d{4}-\d{2}-\d{2})/) || [])[1] || null,
    id: (r.match(/🆔\s*(\S+)/) || [])[1] || null,
    prio: /⏫/.test(r) ? 'alta' : /🔽/.test(r) ? 'baixa' : null,
    text: cleanTask(r),
  };
}
const cleanTask = t => t.replace(/\s*📅\s*\d{4}-\d{2}-\d{2}/g, '').replace(/\s*✅\s*\d{4}-\d{2}-\d{2}/g, '').replace(/\s*🆔\s*\S+/g, '')
  .replace(/\s*[⏫🔼🔽]️?/gu, '').replace(/\s*·\s*(pedido feito\s*)?\d{4}-\d{2}-\d{2}.*$/, '').trim();

function cells(l) { return l.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map(c => c.trim()); }
const isSep = l => /^\|\s*:?-{3,}/.test(l.trim());

function parseAgenda(text) {
  const series = [], events = [];
  let sec = '';
  const today = now();
  for (const l of (text || '').split('\n')) {
    const m = l.match(/^##\s+(.+)$/);
    if (m) { sec = norm(m[1]); continue; }
    if (!l.trim().startsWith('|') || isSep(l)) continue;
    const c = cells(l);
    if (sec.startsWith('series fixas') && c.length >= 3 && norm(c[0]) !== 'dia') {
      const s = parseSerie(c, today);
      if (s) series.push(s);
    } else if (sec.startsWith('compromissos') && /^\d{4}-\d{2}-\d{2}/.test(c[0])) {
      events.push({ date: c[0].slice(0, 10), ...parseHora(c[1]), name: c[2] || '', area: areaKey(c[3] || ''), obs: c[4] || '' });
    }
  }
  return { series, events };
}
function parseHora(s) {
  const r = (s || '').match(/(\d{1,2}:\d{2})\s*[–-]\s*(\d{1,2}:\d{2})/);
  if (r) return { start: pad5(r[1]), end: pad5(r[2]), allDay: false };
  const one = (s || '').match(/(\d{1,2}:\d{2})/);
  if (one) return { start: pad5(one[1]), end: minToHm(toMin(one[1]) + 30), allDay: false };
  return { start: null, end: null, allDay: true };
}
const minToHm = m => `${pad(Math.floor(Math.min(m, 1439) / 60))}:${pad(Math.min(m, 1439) % 60)}`;
function parseSerie(c, today) {
  const spec = norm(c[0]);
  const days = {};
  const md = spec.match(/^dia (\d+)/);
  if (md) days.mday = +md[1];
  else {
    const idx = { dom: 0, seg: 1, ter: 2, qua: 3, qui: 4, sex: 5, sab: 6 };
    const set = new Set();
    for (const part of spec.split(/\s+e\s+|,\s*/)) {
      const r = part.split(/\s*[–-]\s*/).map(x => x.trim().slice(0, 3));
      if (r.length === 2 && r[0] in idx && r[1] in idx) { let i = idx[r[0]]; for (let g = 0; g < 7; g++) { set.add(i); if (i === idx[r[1]]) break; i = (i + 1) % 7; } }
      else if (r[0] in idx) set.add(idx[r[0]]);
    }
    if (!set.size) return null;
    days.dows = set;
  }
  const tm = parseHora(c[1]);
  let ev = c[2] || '', from = null;
  const fm = ev.match(/,?\s*a partir de (\d{1,2})\/(\d{1,2})/i);
  if (fm) {
    const y = today.getFullYear();
    let d = new Date(y, +fm[2] - 1, +fm[1]);
    if (d < addDays(today, -180)) d = new Date(y + 1, +fm[2] - 1, +fm[1]);
    from = ymd(d);
    ev = ev.replace(fm[0], '').trim();
  }
  let area = '', name = ev;
  const pm = ev.match(/^(.+?)\s+·\s+(.+)$/);
  if (pm && AREAS[areaKey(pm[1])]) { area = areaKey(pm[1]); name = pm[2]; }
  const until = ((c[3] || '').match(/^\d{4}-\d{2}-\d{2}/) || [])[0] || null;
  return { days, ...tm, name, area, from, until, kind: 'serie' };
}
function seriesOn(dateStr) {
  const d = pymd(dateStr);
  return S.agenda.series.filter(s => {
    if (s.from && dateStr < s.from) return false;
    if (s.until && dateStr > s.until) return false;
    return s.days.mday ? d.getDate() === s.days.mday : s.days.dows.has(d.getDay());
  });
}
function parseHabits(text) {
  const out = [];
  for (const l of (text || '').split('\n')) {
    if (!l.startsWith('|') || isSep(l)) continue;
    const c = cells(l);
    const d = (c[0] || '').match(/^\d{4}-\d{2}-\d{2}/);
    if (!d) continue;
    const st = (c[3] || '').includes('✅') ? 'feito' : (c[3] || '').includes('❌') ? 'nao' : /🚫|cancel/i.test(c[3] || '') ? 'cancelado' : null;
    out.push({ date: d[0], oque: c[1] || '', area: areaKey(c[2] || ''), st, ok: st === 'feito' ? true : st === 'nao' ? false : null, motivo: c[4] || '' });
  }
  return out;
}
function parseInbox(f) {
  if (!f) return [];
  return f.body.split('\n').filter(l => /^- (?!\[)/.test(l)).map(raw => {
    const m = raw.match(/^- (\d{4}-\d{2}-\d{2})(?:\s+(\d{1,2}:\d{2}))?\s*(?:—|-|:)?\s*(.*)$/);
    return m ? { date: m[1], time: m[2] || '', text: m[3] } : { date: '', time: '', text: raw.slice(2) };
  });
}
function regTool() {
  const f = S.files['areas/emocional/emocional.md'];
  const fallback = { title: 'Regulação emocional', qs: ['O que estou sentindo? Descrever os sintomas físicos.', 'Qual o contexto em que isso está acontecendo?', 'Do que eu precisava e não tive?', 'Revisando o meu dia, o que pode ter causado?'], fromNote: false };
  if (!f) return fallback;
  const L = f.body.split('\n');
  const i = L.findIndex(l => /^##\s+Ferramenta/i.test(l));
  if (i < 0) return fallback;
  const tt = L[i].replace(/^##\s+/, '');
  const title = (tt.split(':')[1] || tt).replace(/\(.*?\)/g, '').trim() || fallback.title;
  const qs = [];
  for (let k = i + 1; k < L.length && !/^##\s/.test(L[k]); k++) { const m = L[k].match(/^\s*\d+[.)]\s+(.+)$/); if (m) qs.push(m[1].trim()); }
  return qs.length ? { title, qs, fromNote: true } : fallback;
}

/* ─────────────── caixa do painel ─────────────── */
function parseBlocks(text, path) {
  const out = [];
  let cur = null;
  for (const l of (text || '').split('\n')) {
    const m = l.match(ITEM_RE);
    if (m) { cur = { path, date: m[1], time: pad5(m[2]), head: m[3], cont: [], raw: [l] }; out.push(cur); continue; }
    if (cur && /^ {2,}\S/.test(l)) { cur.cont.push(l.trim()); cur.raw.push(l); continue; }
    cur = null;
  }
  for (const it of out) { it.block = it.raw.join('\n'); Object.assign(it, classify(it.head)); }
  return out;
}
function classify(head) {
  const note = (head.match(/ → (\S+\.md)(?=\s|$)/) || [])[1] || null;
  const id = (head.match(/🆔\s*(\S+)/) || [])[1] || null;
  const due = (head.match(/📅\s*(\d{4}-\d{2}-\d{2})/) || [])[1] || null;
  const b = head.replace(/ → \S+\.md(?=\s|$)/, '').replace(/\s*🆔\s*\S+/, '').replace(/\s*📅\s*\d{4}-\d{2}-\d{2}/, '').trim();
  let m;
  if ((m = b.match(/^✅ Tarefa feita: (.+)$/))) return { kind: 'feita', text: m[1], note, id };
  if ((m = b.match(/^↩️ Tarefa reaberta: (.+)$/))) return { kind: 'reaberta', text: m[1], note, id };
  if ((m = b.match(/^➕ Tarefa nova: (.+)$/))) return { kind: 'nova', text: m[1], due };
  if ((m = b.match(/^🛒 Comprado: (.+)$/))) return { kind: 'comprado', text: m[1] };
  if ((m = b.match(/^🛒 Comprar \(([^)]+)\): (.+)$/))) return { kind: 'comprar', sec: m[1], text: m[2] };
  if ((m = b.match(/^🔁 (Fez|Não fez|Cancelado): (.+) \(([\w-]+), (\d{1,2}:\d{2}|dia todo)(?:, (\d{1,2})\/(\d{1,2}))?\)(?: — motivo: (.*))?$/))) {
    const st = m[1] === 'Fez' ? 'feito' : m[1] === 'Não fez' ? 'nao' : 'cancelado';
    return { kind: 'habito', st, ok: st === 'feito' ? true : st === 'nao' ? false : null, text: m[2], area: m[3], start: m[4] === 'dia todo' ? 'dia todo' : pad5(m[4]), dd: m[5] ? [+m[5], +m[6]] : null, motivo: m[7] || '' };
  }
  if ((m = b.match(/^💰 Receita: (.+)$/))) return { kind: 'receita', text: m[1] };
  if ((m = b.match(/^🔄 Transferência: (.+)$/))) return { kind: 'transferencia', text: m[1] };
  if ((m = b.match(/^💬 Captura: (.+)$/))) return { kind: 'captura', text: m[1] };
  if ((m = b.match(/^💳 Compra: (.+)$/))) return { kind: 'compra', text: m[1] };
  if ((m = b.match(/^🧾 Comprovante: (.+)$/))) return { kind: 'comprovante', text: m[1] };
  if ((m = b.match(/^📝 Anotação \(([^)]+)\):\s?(.*)$/))) return { kind: 'nota', areaTxt: m[1], text: m[2], note };
  if (/^💭 /.test(b)) return { kind: 'estou', text: b.replace(/^💭\s*/, '') };
  if (/^🧭 /.test(b)) return { kind: 'regula', text: b.replace(/^🧭\s*/, '').replace(/:$/, '') };
  return { kind: 'outro', text: b };
}
const kw = s => norm(s).replace(/^[^a-z0-9]+/, '').split(/[\s,·(—:-]+/)[0];
function buildCaixa() {
  let items = [...parseBlocks(S.files[CAIXA]?.text, CAIXA), ...parseBlocks(S.files[RESERVADA]?.text, RESERVADA)];
  for (const p of S.pendAdd) if (!items.some(i => i.path === p.path && i.block === p.block)) items.push(...parseBlocks(p.block, p.path).map(i => ({ ...i, pending: true })));
  items = items.filter(i => !S.pendDel.has(i.path + '\n' + i.block));
  items.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  S.cx = items;
  const ov = { task: new Map(), habit: new Map(), comprado: new Map(), comprar: [], novas: [] };
  for (const it of items) {
    if (it.kind === 'feita' || it.kind === 'reaberta') {
      ov.task.set(it.id ? 'id:' + it.id : it.note + '\n' + norm(it.text), it);
    } else if (it.kind === 'habito') {
      let hd = it.date;
      if (it.dd) { let y = +it.date.slice(0, 4); if (it.dd[1] > +it.date.slice(5, 7) + 1) y--; hd = `${y}-${pad(it.dd[1])}-${pad(it.dd[0])}`; }
      it.hdate = hd;
      ov.habit.set(`${hd}|${it.area}|${kw(it.text)}|${it.start}`, it);
    }
    else if (it.kind === 'comprado') ov.comprado.set(norm(it.text), it);
    else if (it.kind === 'comprar') ov.comprar.push(it);
    else if (it.kind === 'nova') ov.novas.push(it);
  }
  S.ov = ov;
}
function taskOv(g) {
  if (!S.ov) return null;
  if (g.key.startsWith('id:')) return S.ov.task.get(g.key) || null;
  for (const m of g.members) { const o = S.ov.task.get(m.path + '\n' + norm(g.text)); if (o) return o; }
  return null;
}

function reindex() {
  S.stems = {};
  for (const p in S.files) S.stems[S.files[p].stem.toLowerCase()] = p;
  const groups = new Map();
  for (const p in S.files) {
    if (p === COMPRAS) continue;
    const f = S.files[p];
    for (const t of f.tasks) {
      const key = t.id ? 'id:' + t.id : p + '\n' + t.raw;
      let g = groups.get(key);
      if (!g) { g = { key, text: t.text, due: t.due, done: t.done, prio: t.prio, checked: true, sens: false, area: f.area, members: [] }; groups.set(key, g); }
      g.members.push({ path: p, raw: t.raw });
      g.checked = g.checked && t.checked;
      g.sens = g.sens || f.sens;
      if (!g.due && t.due) g.due = t.due;
      if (t.done && (!g.done || t.done > g.done)) g.done = t.done;
    }
  }
  S.tasks = [...groups.values()];
  const cf = S.files[COMPRAS];
  const secs = [];
  if (cf) {
    for (const t of cf.tasks) {
      if (norm(t.h2).startsWith('comprar') && !t.checked) {
        let s = secs.find(x => x.name === (t.h3 || 'Outro'));
        if (!s) secs.push(s = { name: t.h3 || 'Outro', items: [] });
        s.items.push(t);
      }
    }
  }
  S.compras = { secs, heads: cf ? [...cf.text.matchAll(/^###\s+(.+)$/gm)].map(m => m[1].trim()) : [] };
  S.agenda = parseAgenda(S.files['agenda.md']?.text);
  S.habits = parseHabits(S.files['eu/habitos.md']?.text);
  S.inbox = parseInbox(S.files['inbox.md']);
  S.name = S.files['eu/perfil.md']?.title || '';
  S.fichas = parseFichas(S.files[FICHAS]);
  S.plano = { dv: parsePlano(S.files[PLANO_D]), mi: parsePlano(S.files[PLANO_M]), subsMi: parseGruposM(S.files[SUBS_M]), casal: parseCasal(S.files[CASAL]) };
  S.comprados = parseComprados(S.files[COMPRAS]);
  buildCaixa();
}

/* ─────────────── GitHub ─────────────── */
function erro(code, msg) { const e = new Error(msg || code); e.code = code; return e; }
async function gh(path, { method = 'GET', body, etag } = {}) {
  const headers = { Accept: 'application/vnd.github+json', Authorization: 'Bearer ' + cfg.token };
  if (etag) headers['If-None-Match'] = etag;
  if (body) headers['Content-Type'] = 'application/json';
  let r;
  try { r = await fetch(API + path, { method, headers, body: body ? JSON.stringify(body) : undefined, cache: 'no-store' }); }
  catch { throw erro('offline'); }
  if (r.status === 304) return { status: 304, ok: false };
  let json = null;
  try { json = await r.json(); } catch { }
  if (r.status === 401) throw erro('token');
  if ((r.status === 403 || r.status === 429) && r.headers.get('x-ratelimit-remaining') === '0') {
    S.rateReset = (+r.headers.get('x-ratelimit-reset') || 0) * 1000;
    throw erro('rate');
  }
  return { status: r.status, ok: r.ok, json, etag: r.headers.get('etag') };
}
const repoPath = p => p.split('/').map(encodeURIComponent).join('/');
function b64dec(s) { const bin = atob(String(s).replace(/\s/g, '')); const u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return new TextDecoder().decode(u); }
function b64enc(str) { const u = new TextEncoder().encode(str); let bin = ''; for (let i = 0; i < u.length; i += 0x8000) bin += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(bin); }
async function getBlob(sha) {
  const c = Blobs.get(sha);
  if (c != null) return c;
  const r = await gh(`/repos/${cfg.repo}/git/blobs/${sha}`);
  if (!r.ok) throw erro('http', 'blob ' + r.status);
  const t = b64dec(r.json.content);
  Blobs.put(sha, t);
  return t;
}
async function pool(items, n, fn) {
  let i = 0;
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, async () => { while (i < items.length) { const it = items[i++]; await fn(it); } }));
}
function saveSnap() {
  const files = {};
  for (const p in S.files) files[p] = S.files[p].sha;
  LS.set(K + 'snap', { repo: cfg.repo, head: S.head, files, commits: S.commits.slice(0, 30), finSha: S.finSha });
}
async function loadSnap() {
  const s = LS.get(K + 'snap', null);
  if (!s || s.repo !== cfg.repo) return false;
  await Blobs.load([...Object.values(s.files), s.finSha]);
  for (const p in s.files) { if (!incluir(p)) continue; const t = Blobs.get(s.files[p]); if (t != null) S.files[p] = parseFile(p, s.files[p], t); }
  S.head = s.head; S.commits = s.commits || [];
  if (s.finSha) { const t = Blobs.get(s.finSha); if (t != null) { try { S.fin = JSON.parse(t); S.finSha = s.finSha; } catch { } } }
  return Object.keys(S.files).length > 0;
}
function gcBlobs() {
  const keep = new Set(Object.values(S.files).map(f => f.sha));
  if (S.finSha) keep.add(S.finSha);
  Blobs.gc(keep);
}

async function sync(force = false) {
  if (S.syncing || !cfg.token) return;
  S.syncing = true; S.lastTry = Date.now(); setLive();
  const t0 = Date.now();
  const done = () => { S.err = null; S.lastSync = Date.now(); };
  try {
    if (!cfg.branch) {
      const r = await gh(`/repos/${cfg.repo}`);
      if (r.status === 404) throw erro('notfound');
      if (!r.ok) throw erro('http', 'repo ' + r.status);
      cfg.branch = r.json.default_branch || 'main'; saveCfg();
    }
    const ref = await gh(`/repos/${cfg.repo}/git/ref/heads/${encodeURIComponent(cfg.branch)}`, { etag: force ? null : S.etag });
    if (ref.status === 304) { done(); return; }
    if (ref.status === 404) throw erro('notfound');
    if (!ref.ok) throw erro('http', 'ref ' + ref.status);
    const novoEtag = ref.etag;
    const sha = ref.json.object.sha;
    if (sha === S.head && !force && Object.keys(S.files).length) { done(); return; }
    const tr = await gh(`/repos/${cfg.repo}/git/trees/${sha}?recursive=1`);
    if (!tr.ok) throw erro('http', 'tree ' + tr.status);
    const next = {};
    let finSha = null;
    for (const e of tr.json.tree) { if (e.type !== 'blob') continue; if (e.path === FIN) finSha = e.sha; else if (incluir(e.path)) next[e.path] = e.sha; }
    if (finSha !== S.finSha) { if (finSha) { try { await Blobs.load([finSha]); S.fin = JSON.parse(await getBlob(finSha)); S.finSha = finSha; } catch { throw erro('http', 'leitura do espelho'); } } else { S.fin = null; S.finSha = null; } S._fm = null; }
    const fresh = p => (S.wrote[p] || 0) >= t0;
    const changed = Object.keys(next).filter(p => (!S.files[p] || S.files[p].sha !== next[p]) && !fresh(p));
    const removed = Object.keys(S.files).filter(p => !(p in next) && !fresh(p));
    await Blobs.load(changed.map(p => next[p]));
    await pool(changed, 6, async p => { S.files[p] = parseFile(p, next[p], await getBlob(next[p])); });
    for (const p of removed) delete S.files[p];
    const prev = S.head;
    S.head = sha;
    const cm = await gh(`/repos/${cfg.repo}/commits?sha=${encodeURIComponent(cfg.branch)}&per_page=30`);
    if (cm.ok && Array.isArray(cm.json)) S.commits = cm.json.map(c => ({ sha: c.sha, msg: c.commit.message, date: c.commit.author?.date || c.commit.committer?.date }));
    S.etag = novoEtag;
    reindex(); saveSnap();
    gcBlobs();
    done();
    render();
    if (prev && prev !== sha) announce(prev, [...changed, ...removed]);
  } catch (e) {
    S.err = e.code || 'http';
    if (e.code === 'token') showSetup('O GitHub recusou o token. Gere outro e cole aqui.');
    else if (e.code === 'notfound') showSetup('Não achei o repositório com esse token. Confira o nome e se o token tem acesso a ele.');
  } finally {
    S.syncing = false; setLive();
    if (S.resync) { S.resync = false; setTimeout(() => sync(), 300); }
  }
}

/* ─────────────── gravação: só nas caixas ─────────────── */
function carimbar(text) {
  if (!/^---\r?\n/.test(text)) return text;
  const end = text.indexOf('\n---', 4);
  if (end < 0) return text;
  const fm = text.slice(0, end);
  if (!/^atualizado:/m.test(fm)) return text;
  return fm.replace(/^atualizado:.*$/m, 'atualizado: ' + ymd(now())) + text.slice(end);
}
function write(path, transform, message, { onOk, onErr } = {}) {
  S.pending++; setLive();
  const job = queue.then(() => doWrite(path, transform, message))
    .then(r => { onOk?.(r); return true; }, e => { onErr ? onErr(e) : toastErr(e); return false; })
    .finally(() => { S.pending--; setLive(); render(); });
  queue = job.catch(() => { });
  return job;
}
async function doWrite(path, transform, message) {
  const f = S.files[path];
  let base = f ? f.text : null, sha = f ? f.sha : undefined;
  for (let i = 0; i < 3; i++) {
    let out = transform(base);
    if (out == null) throw erro('sumiu');
    out = carimbar(out);
    const body = { message: message + '\n\nvia painel', content: b64enc(out), branch: cfg.branch };
    if (sha) body.sha = sha;
    const r = await gh(`/repos/${cfg.repo}/contents/${repoPath(path)}`, { method: 'PUT', body });
    if (r.ok) {
      const nsha = r.json.content.sha;
      Blobs.put(nsha, out);
      S.files[path] = parseFile(path, nsha, out);
      S.ours.add(r.json.commit.sha);
      S.wrote[path] = Date.now();
      if (S.syncing) S.resync = true;
      reindex(); saveSnap();
      setTimeout(() => sync(), 600);
      return r.json;
    }
    if (r.status === 409 || r.status === 422) {
      const g = await gh(`/repos/${cfg.repo}/contents/${repoPath(path)}?ref=${encodeURIComponent(cfg.branch)}`);
      if (g.status === 404) { base = null; sha = undefined; continue; }
      if (!g.ok) throw erro('http', 'contents ' + g.status);
      base = b64dec(g.json.content); sha = g.json.sha;
      continue;
    }
    if (r.status === 403 || r.status === 404) throw erro('perm');
    throw erro('http', 'put ' + r.status);
  }
  throw erro('conflito');
}
const MSGS = {
  offline: 'Sem conexão. Nada foi gravado; tente de novo quando a internet voltar.',
  perm: 'O token não tem permissão de escrita. Gere um com "Contents: Read and write".',
  sumiu: 'Não consegui gravar: o arquivo mudou no GitHub. Recarreguei; tente de novo.',
  organizado: 'Esse item já foi organizado pelo assessor.',
  conflito: 'O arquivo mudou várias vezes seguidas no GitHub. Tente de novo em instantes.',
  rate: 'Limite de chamadas do GitHub atingido. Tente de novo em alguns minutos.',
  token: 'O GitHub recusou o token.',
};
function toastErr(e, pre) { toast((pre ? pre + '. ' : '') + (MSGS[e.code] || 'O GitHub respondeu com erro (' + (e.message || 'desconhecido') + ').'), { err: true }); sync(true); }

function caixaTemplate(sens) {
  return `---\ntipo: caixa\narea: ${sens ? 'emocional' : 'eu'}\nstatus: ativo\ntags: [painel, caixa, entrada]\npessoas: []\nresumo: ${sens ? 'Caixa reservada do painel (emocional e saúde).' : 'Caixa de entrada do painel.'} O assessor organiza e tira daqui.\natualizado: ${ymd(now())}\n---\n\n# ${sens ? 'Caixa reservada do painel' : 'Caixa do painel'}\n\n## Itens\n`;
}
const oneLine = s => String(s || '').replace(/\s*\n+\s*/g, ' / ').trim();
/* lines[0] vira o cabeçalho do item; o resto vira linhas recuadas */
function addCaixa(lines, { sens = false, msg, ok } = {}) {
  const path = sens ? RESERVADA : CAIXA;
  const block = mkBlock(lines);
  const p = { path, block };
  S.pendAdd.push(p); buildCaixa(); render();
  const commit = sens ? 'emocional: registro atualizado' : `painel: ${msg || short(lines[0], 60)}`;
  return write(path, base => {
    if (base == null) base = caixaTemplate(sens);
    const t = base.replace(/\s+$/, '');
    const last = t.split('\n').pop();
    return t + (/^#/.test(last) ? '\n\n' : '\n') + block + '\n';
  }, commit, {
    onOk() { S.pendAdd = S.pendAdd.filter(x => x !== p); buildCaixa(); if (ok) toast(ok); },
    onErr(e) { S.pendAdd = S.pendAdd.filter(x => x !== p); buildCaixa(); toastErr(e, 'Não guardei'); },
  });
}
const mkBlock = lines => { const n = now(); return [`- ${ymd(n)} ${hm(n)} — ${lines[0]}`, ...lines.slice(1).filter(l => l != null && String(l).trim() !== '').map(l => '  ' + String(l).trim())].join('\n'); };
function replaceCaixa(old, lines, { sens = false, msg, ok } = {}) {
  const path = sens ? RESERVADA : CAIXA;
  if (old.pending) return;
  if (old.path !== path) { delCaixa(old); return addCaixa(lines, { sens, msg, ok }); }
  const block = mkBlock(lines), key = old.path + '\n' + old.block, p = { path, block };
  S.pendDel.add(key); S.pendAdd.push(p); buildCaixa(); render();
  return write(path, base => {
    if (base == null) base = caixaTemplate(sens);
    const ls = base.split('\n');
    const i = ls.findIndex((l, k) => l === old.raw[0] && old.raw.every((r, j) => ls[k + j] === r));
    if (i >= 0) ls.splice(i, old.raw.length);
    const t = ls.join('\n').replace(/\s+$/, '');
    const last = t.split('\n').pop();
    return t + (/^#/.test(last) ? '\n\n' : '\n') + block + '\n';
  }, sens ? 'emocional: registro atualizado' : `painel: ${msg || short(lines[0], 60)}`, {
    onOk() { S.pendDel.delete(key); S.pendAdd = S.pendAdd.filter(x => x !== p); buildCaixa(); if (ok) toast(ok); },
    onErr(e) { S.pendDel.delete(key); S.pendAdd = S.pendAdd.filter(x => x !== p); buildCaixa(); toastErr(e, 'Não guardei'); },
  });
}
function delCaixa(it, okMsg) {
  if (it.pending) return;
  const key = it.path + '\n' + it.block;
  S.pendDel.add(key); buildCaixa(); render();
  write(it.path, base => {
    if (base == null) throw erro('organizado');
    const ls = base.split('\n');
    const i = ls.findIndex((l, k) => l === it.raw[0] && it.raw.every((r, j) => ls[k + j] === r));
    if (i < 0) throw erro('organizado');
    ls.splice(i, it.raw.length);
    return ls.join('\n');
  }, it.path === RESERVADA ? 'emocional: registro atualizado' : `painel: desfeito — ${short(it.head, 50)}`, {
    onOk() { S.pendDel.delete(key); buildCaixa(); if (okMsg) toast(okMsg); },
    onErr(e) { S.pendDel.delete(key); buildCaixa(); if (e.code === 'organizado') { toast(MSGS.organizado); sync(true); } else toastErr(e, 'Não tirei da caixa'); },
  });
}

/* ações */
function clickTask(key) {
  const g = S.tasks.find(t => t.key === key);
  if (!g) return;
  const o = taskOv(g);
  if (o) { delCaixa(o, 'Desfeito. Saiu da caixa.'); return; }
  const path = g.members[0].path;
  const kind = g.checked ? '↩️ Tarefa reaberta' : '✅ Tarefa feita';
  addCaixa([`${kind}: ${g.text} → ${path}${g.key.startsWith('id:') ? ' 🆔 ' + g.key.slice(3) : ''}`], {
    sens: g.sens, msg: `${g.checked ? 'reaberta' : 'feita'} — ${short(g.text, 50)}`,
    ok: g.checked ? 'Reaberta. Ficou na caixa pro assessor.' : 'Feita! Ficou na caixa pro assessor marcar no TickTick.',
  });
}
function clickCompra(t) {
  const o = S.ov.comprado.get(norm(t.text));
  if (o) { delCaixa(o, 'Desfeito.'); return; }
  addCaixa([`🛒 Comprado: ${t.text}`], { msg: `comprado — ${short(t.text, 50)}` });
}
/* ─────────────── markdown → HTML ─────────────── */
function wl(stem, alias) {
  const p = S.stems[String(stem).trim().toLowerCase()];
  const label = alias || (p ? h(S.files[p].title) : stem);
  return p ? `<a href="#" class="wl" data-open="${h(p)}">${label}</a>` : `<span class="wlx">${label}</span>`;
}
function inline(t) {
  let s = h(t);
  const codes = [];
  s = s.replace(/`([^`]+)`/g, (_, c) => { codes.push(c); return `\u0000${codes.length - 1}\u0000`; });
  s = s.replace(/\[\[([^\]|#]+)(#[^\]|]*)?(?:\|([^\]]+))?\]\]/g, (_, st, _h, al) => wl(st, al));
  s = s.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, (_, tx, u) => `<a href="${u}" target="_blank" rel="noopener noreferrer">${tx}</a>`);
  s = s.replace(/(^|[\s(])(https?:\/\/[^\s<)]+)/g, (_, pre, u) => `${pre}<a href="${u}" target="_blank" rel="noopener noreferrer">${u.replace(/^https?:\/\/(www\.)?/, '').slice(0, 42)}${u.length > 52 ? '…' : ''}</a>`);
  s = s.replace(/~~([^~]+)~~/g, '<del>$1</del>');
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/(^|[^*\w])\*([^*\s][^*]*?)\*(?!\w)/g, '$1<em>$2</em>');
  return s.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${codes[i]}</code>`);
}
const plain = t => String(t || '').replace(/\[\[([^\]|#]+)(?:#[^\]|]*)?(?:\|([^\]]+))?\]\]/g, (_, st, al) => al || (S.stems[st.toLowerCase()] ? S.files[S.stems[st.toLowerCase()]].title : st)).replace(/\*\*/g, '').replace(/`/g, '');

function tabelaDeRegistros(head, rows) {
  return `<div class="reading-entries">${rows.map(cells => {
    const fields = cells.slice(1).map((value, i) => {
      if (!value.trim()) return '';
      return `<div><dt>${inline(head[i+1] || 'Detalhe')}</dt><dd>${inline(value)}</dd></div>`;
    }).join('');
    return `<details><summary>${inline(cells[0])}</summary><dl>${fields}</dl></details>`;
  }).join('')}</div>`;
}

function md(src, path, reading = false) {
  const L = src.split('\n');
  let out = '', i = 0, para = [];
  const flush = () => { if (para.length) { out += `<p>${inline(para.join(' '))}</p>`; para = []; } };
  while (i < L.length) {
    const l = L[i];
    if (/^\s*```/.test(l)) {
      flush(); const buf = []; i++;
      while (i < L.length && !/^\s*```/.test(L[i])) buf.push(L[i++]);
      i++; out += `<pre><code>${h(buf.join('\n'))}</code></pre>`; continue;
    }
    let m;
    if ((m = l.match(/^(#{1,6})\s+(.*)$/))) { flush(); const n = Math.min(m[1].length, 4); out += `<h${n}>${inline(m[2])}</h${n}>`; i++; continue; }
    if (/^\s*(-{3,}|\*{3,})\s*$/.test(l)) { flush(); out += '<hr>'; i++; continue; }
    if (l.trim().startsWith('|') && L[i + 1] && isSep(L[i + 1])) {
      flush();
      const head = cells(l); i += 2; const rows = [];
      while (i < L.length && L[i].trim().startsWith('|')) rows.push(cells(L[i++]));
      if (reading && head.length >= 4 && /^(data|dia)\b/.test(norm(head[0])) && rows.length) out += tabelaDeRegistros(head, rows);
      else out += `<div class="tbl"><table><thead><tr>${head.map(c => `<th>${inline(c)}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(c => `<td${c.length <= 24 && !/\s\S+\s\S+\s/.test(c) ? ' class="nw"' : ''}>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
      continue;
    }
    if (/^>/.test(l)) {
      flush(); const buf = [];
      while (i < L.length && /^>/.test(L[i])) buf.push(L[i++].replace(/^>\s?/, ''));
      const co = buf[0] && buf[0].match(/^\[!(\w+)\]([-+]?)\s*(.*)$/);
      if (co) { const inner = md(buf.slice(1).join('\n'), path, reading); out += `<details${co[2] === '-' ? '' : ' open'}><summary>${inline(co[3] || co[1])}</summary>${inner}</details>`; }
      else out += `<blockquote>${md(buf.join('\n'), path, reading)}</blockquote>`;
      continue;
    }
    if (/^\s*([-*+]|\d+\.)\s+/.test(l)) {
      flush();
      const items = [];
      while (i < L.length && (/^\s*([-*+]|\d+\.)\s+/.test(L[i]) || (/^\s{2,}\S/.test(L[i]) && items.length))) {
        const x = L[i];
        if (/^\s*([-*+]|\d+\.)\s+/.test(x)) items.push({ ind: x.match(/^\s*/)[0].length, raw: x, ol: /^\s*\d+\./.test(x) });
        else items[items.length - 1].cont = (items[items.length - 1].cont || '') + ' ' + x.trim();
        i++;
      }
      out += renderList(items, path);
      continue;
    }
    if (!l.trim()) { flush(); i++; continue; }
    para.push(l.trim()); i++;
  }
  flush();
  return out;
}
function renderList(items, path) {
  let html = '';
  const stack = [];
  const open = (ol, ind) => { stack.push({ ol, ind }); html += ol ? '<ol>' : '<ul>'; };
  const close = () => { const s = stack.pop(); html += s.ol ? '</ol>' : '</ul>'; };
  for (const it of items) {
    while (stack.length && it.ind < stack[stack.length - 1].ind) close();
    if (!stack.length || it.ind > stack[stack.length - 1].ind) open(it.ol, it.ind);
    const tm = it.raw.match(TASK_RE);
    if (tm) {
      const tid = (tm[3].match(/🆔\s*(\S+)/) || [])[1];
      const key = tid ? 'id:' + tid : path + '\n' + it.raw;
      const g = S.tasks.find(x => x.key === key);
      const st = g ? isChecked(g) : tm[2] !== ' ';
      const box = g && taskOv(g);
      html += `<li class="tk${st ? ' done' : ''}"><button class="chk" role="checkbox" aria-checked="${st}" data-mdt="${h(key)}" data-mdpath="${h(path)}" data-mdraw="${h(it.raw)}" aria-label="${st ? 'Reabrir' : 'Marcar como feita'}">${ICON.check}</button><span>${inline(tm[3].replace(/\s*🆔\s*\S+/g, '') + (it.cont || ''))}${box ? ' <span class="tag">na caixa</span>' : ''}</span></li>`;
    } else {
      html += `<li>${inline(it.raw.replace(/^\s*([-*+]|\d+\.)\s+/, '') + (it.cont || ''))}</li>`;
    }
  }
  while (stack.length) close();
  return html;
}

/* ─────────────── desenho ─────────────── */
function render() {
  if ($('#app').hidden) return;
  document.body.classList.toggle('discreet', !!cfg.discreet);
  $('#eye').setAttribute('aria-pressed', String(!cfg.discreet));
  $('#eyeSlash').style.display = cfg.discreet ? '' : 'none';
  renderNav(); renderInicio(); renderTasks(); renderFinancas(); renderSentir(); renderAlimentacao(); renderRegistrar(); renderRhythm(); renderAreas(); renderCases(); renderAreaPage();
  renderNotaPage();
  if (S.open) renderDrawer();
}
function renderNav() {
  const active = S.page === 'area' ? (S.areaRoute.area === 'financas' ? 'financas' : 'areas') : S.page === 'nota' ? 'areas' : S.page;
  $('#nav').innerHTML = PAGES.map(p => `<a href="#${p.id}"${active === p.id ? ' aria-current="page"' : ''}>${p.icon}<span>${p.nome}</span></a>`).join('');
  const naMais = PAGES.some(p => p.mais && p.id === active);
  $('#tabbar').innerHTML = PAGES.filter(p => !p.mais).map(p => `<a href="#${p.id}"${active === p.id ? ' aria-current="page"' : ''}>${p.icon}<span>${p.curto || p.nome}</span></a>`).join('') +
    (PAGES.some(p => p.mais) ? `<a href="#" data-act="mais"${naMais ? ' aria-current="page"' : ''} aria-label="Mais opções">${MAIS_ICON}<span>Mais</span></a>` : '');
}
function route() {
  let [id, sub] = location.hash.slice(1).split('/');
  let area = destinoDaArea(location.hash, AREA_ORDER);
  if (area?.area === 'financas' && /^#area\/financas\/?$/.test(location.hash)) {
    history.replaceState(null, '', '#financas');
    id = 'financas'; sub = ''; area = null;
  }
  if (!id || id === 'hoje') id = 'inicio';
  const solta = area ? null : notaSolta(location.hash);
  const p = area ? 'area' : solta ? 'nota' : id === 'area' ? 'areas' : PAGES.some(x => x.id === id) ? id : 'inicio';
  const changed = p !== S.page || ((p === 'area' || p === 'nota') && location.hash !== S.areaHash);
  S.notaPath = solta ? solta.path : null;
  if (changed && S.open) closeNote();
  const previousArea = S.areaRoute?.area || (S.page === 'financas' ? 'financas' : null);
  const mesmaArea = changed && p === 'area' && S.page === 'area' && S.areaRoute?.area === area?.area;
  const nextArea = area?.area || (p === 'financas' ? 'financas' : null);
  if (previousArea && previousArea !== nextArea) S.reveal.delete(`#area/${previousArea}`);
  S.areaRoute = area;
  S.areaHash = area || solta ? location.hash : '';
  if (changed) S.voltas = (S.voltas || 0) + 1;
  if (changed) S.sumario = false;
  const saiDeTarefas = S.page === 'tarefas' && p !== 'tarefas';
  if (saiDeTarefas) S.reveal.delete('#tarefas');
  if (S.page === 'sentir' && p !== 'sentir') S.reveal.delete('#sentir');
  if (S.page === 'alimentacao' && p !== 'alimentacao') {
    S.reveal.delete('#alimentacao');
    $('#ali').replaceChildren();
  }
  if (p === 'alimentacao') S.aliTab = ['compras', 'trocas'].includes(sub) ? sub : 'plano';
  if (p === 'registrar') S.reg = 'captura';
  if (changed && p === 'alimentacao') S.aliRef = null;
  S.page = p;
  closeSheet();
  for (const el of $$('.page')) el.hidden = el.dataset.page !== p;
  renderNav();
  renderAreaPage();
  renderNotaPage();
  if (p === 'tarefas' || saiDeTarefas) renderTasks();
  if (p === 'alimentacao') renderAlimentacao();
  if (p === 'financas' || (previousArea === 'financas' && nextArea !== previousArea)) renderFinancas();
  if (p === 'registrar') renderRegistrar();
  if (p === 'sentir') renderSentir();
  const notaAberta = S.files[area?.path || S.notaPath];
  document.title = `${notaAberta ? plain(notaAberta.title) : area ? AREAS[area.area].nome : PAGES.find(page => page.id === p)?.nome || 'Hoje'} · Meu Assessor`;
  if (changed) {
    // Dentro da mesma área: só sobe até o começo do conteúdo se ele ficou acima da tela.
    const main = mesmaArea && $('#areaPage .area-main');
    if (main) {
      const topo = Math.max(0, main.getBoundingClientRect().top + scrollY - (($('.top')?.offsetHeight || 0) + 12));
      if (scrollY > topo) window.scrollTo(0, topo);
    } else window.scrollTo(0, 0);
    if (p === 'area' || p === 'nota') $(`#${p === 'nota' ? 'notaPage' : 'areaPage'} ${area?.vista === 'nota' || p === 'nota' ? '.reading-note h2' : 'h1'}`)?.focus({ preventScroll: true });
  }
}

const isChecked = g => { const o = taskOv(g); return o ? o.kind === 'feita' : g.checked; };
const byDue = (a, b) => (a.due || '9').localeCompare(b.due || '9') || (b.prio === 'alta') - (a.prio === 'alta');
import { organizarTarefas, primeiroPasso, prioridadesDoDia } from './tarefas.mjs?v=13ee44f54df8';
function estadoTarefa(g) {
  if (g.nova) return { feita:false, data:'' };
  const item = taskOv(g);
  return item ? { feita:item.kind === 'feita', data:item.date } : { feita:g.checked, data:g.done };
}

function gruposDeTarefas() {
  const novas = (S.ov?.novas || []).map(it => ({ nova:true, item:it, text:it.text, due:it.due, sens:it.path === RESERVADA }));
  return organizarTarefas([...S.tasks, ...novas], ymd(now()), estadoTarefa);
}

function buckets() {
  const grupos = gruposDeTarefas(), d = ymd(now());
  return { hoje:[...grupos.atrasadas, ...grupos.hoje, ...grupos.feitas.filter(g => estadoTarefa(g).data === d)], proximas:grupos.proximas, semdata:grupos.semdata };
}

function tarefaReservada(g) {
  return g.sens || VEIL.has(g.area) || g.members?.some(m => VEIL.has(S.files[m.path]?.area));
}
function dueTxt(due) {
  const d = ymd(now());
  if (due < d) return `<span class="due late">atrasada desde ${dm(due)}</span>`;
  if (due === d) return `<span class="due today">hoje</span>`;
  if (due === ymd(addDays(now(), 1))) return `<span class="due">amanhã</span>`;
  return `<span class="due">${dayLabel(due)}</span>`;
}
function srcLink(path) {
  const f = S.files[path];
  if (!f) return '';
  return `<a href="#" data-open="${h(path)}">${h(short(plain(f.title), 40))}</a>`;
}
function taskLi(g) {
  if (g.nova) {
    return `<li class="task${g.item.pending ? ' busy' : ''}"><button class="rm" data-cxdel="${h(g.item.path + '\n' + g.item.block)}" aria-label="Tirar da caixa: ${h(g.text)}" title="Tirar da caixa">${ICON.x}</button><div class="tx"><div class="t">${inline(g.text)}</div><div class="meta">${g.due ? dueTxt(g.due) : ''}<span class="tag">nova, na caixa</span></div></div></li>`;
  }
  const ch = isChecked(g), o = taskOv(g);
  const meta = [];
  if (g.due && !ch) meta.push(dueTxt(g.due));
  const conclusao = ch && estadoTarefa(g).data;
  if (conclusao) meta.push('Concluída em ' + pymd(conclusao).toLocaleDateString('pt-BR'));
  if (g.prio === 'alta' && !ch) meta.push('<span class="prio">prioridade alta</span>');
  const seen = new Set();
  for (const m of g.members) if (!seen.has(m.path) && m.path !== 'tarefas.md') { seen.add(m.path); meta.push(srcLink(m.path)); }
  if (o) meta.push('<span class="tag">na caixa</span>');
  return `<li class="task${ch ? ' done' : ''}${o && o.pending ? ' busy' : ''}"><button class="chk" role="checkbox" aria-checked="${ch}" data-task="${h(g.key)}" aria-label="${o ? 'Desfazer' : ch ? 'Reabrir' : 'Marcar como feita'}: ${h(plain(g.text))}">${ICON.check}</button><div class="tx"><div class="t">${inline(g.text)}</div>${meta.length ? `<div class="meta">${meta.join('')}</div>` : ''}</div></li>`;
}
function grupoTarefas(titulo, itens, chave, expandidos, mostrar) {
  const visiveis = itens.filter(mostrar);
  if (!visiveis.length) return '';
  const extras = visiveis.slice(5);
  return `<section class="tarefa-grupo" data-grupo="${chave}"><header><h2>${titulo}</h2><span>${visiveis.length}</span></header>
    <ul class="tasks">${visiveis.slice(0, 5).map(taskLi).join('')}</ul>
    ${extras.length ? `<details class="tarefa-extras" data-task-lista="${chave}"${expandidos.has(chave) ? ' open' : ''}>
      <summary>Mais ${extras.length} ${extras.length === 1 ? 'tarefa' : 'tarefas'}</summary><ul class="tasks">${extras.map(taskLi).join('')}</ul></details>` : ''}</section>`;
}

function renderTasks() {
  const el = $('#tasks');
  if (!el) return;
  const hoje = ymd(now());
  $('#tasksDate').innerHTML = fonteTxt('tarefas');
  if (!S.fin) { el.innerHTML = semEspelho('tarefas'); return; }
  const G = tarefasEmGrupos(S.fin, hoje);
  const reservadas = Object.values(G).flat().filter(t => VEIL.has(t.area)).length;
  const grupo = (titulo, itens) => {
    const vis = itens.filter(tarefaVisivel);
    return vis.length ? `<section class="es-grupo"><h2>${titulo} <span>${vis.length}</span></h2><ul class="es-lista">${vis.map(t => tarefaLi(t, hoje)).join('')}</ul></section>` : '';
  };
  let html = grupo('Atrasadas', G.atrasadas) + grupo('Hoje', G.hoje) + grupo('Próximos 7 dias', G.semana) + grupo('Mais adiante', G.depois) + grupo('Sem prazo', G.semPrazo);
  if (!html) html = '<p class="hj-empty">Nada aberto no TickTick.</p>';
  if (cfg.discreet && reservadas) {
    const aberta = S.reveal.has('#tarefas');
    html += `<div class="tarefa-privacidade">${ICON.lock}<span>${reservadas === 1 ? '1 tarefa reservada' : reservadas + ' tarefas reservadas'}</span>
      <button type="button" data-tarefa-privacidade aria-pressed="${aberta}">${aberta ? 'Ocultar' : 'Mostrar'}</button></div>`;
  }
  el.innerHTML = html;
}

function cxCompraLi(it) {
  return `<li class="task${it.pending ? ' busy' : ''}"><button class="rm" data-cxdel="${h(it.path + '\n' + it.block)}" aria-label="Tirar da caixa: ${h(it.text)}" title="Tirar da caixa">${ICON.x}</button><div class="tx"><div class="t">${inline(it.text)}</div><div class="meta"><span class="tag">nova, na caixa</span></div></div></li>`;
}

/* Caixa */
const KIND = { receita: '💰 Receita', transferencia: '🔄 Transferência', feita: '✅ Tarefa feita', reaberta: '↩️ Tarefa reaberta', nova: '➕ Tarefa nova', comprado: '🛒 Comprado', comprar: '🛒 Comprar', nota: '📝 Anotação', estou: '💭 Como estou', regula: '🧭 Regulação', compra: '💳 Compra', comprovante: '🧾 Comprovante', captura: '💬 Captura', outro: '📌 Item' };
function cxLabel(it, compact) {
  const movimento = ['receita', 'transferencia', 'compra', 'comprovante'].includes(it.kind);
  if (movimento && cfg.discreet) return '<span class="k">Movimentação financeira</span> <span class="muted">(reservada)</span>';
  const reserved = cfg.discreet && (it.path === RESERVADA || VEIL.has(areaKey(it.areaTxt || it.area)) || (it.note && VEIL.has(S.files[it.note]?.area)));
  if (it.kind === 'captura' && cfg.discreet) return '<span class="k">💬 Captura</span> <span class="muted">(reservada)</span>';
  if (reserved) return `<span class="k">${it.kind === 'estou' ? '💭 Como estou' : it.kind === 'regula' ? '🧭 Regulação' : '🔒 Registro reservado'}</span> <span class="muted">(reservado)</span>`;
  let k = KIND[it.kind] || KIND.outro, t = it.text || '';
  if (it.kind === 'habito') { k = it.st === 'feito' ? '🔁 Fez' : it.st === 'nao' ? '🔁 Não fez' : '🔁 Cancelado'; t = `${/^\p{Extended_Pictographic}/u.test(it.text) ? '' : (AREAS[it.area]?.emoji || '') + ' '}${it.text}${it.hdate && it.hdate !== it.date ? ` (${dm(it.hdate)})` : ''}${it.motivo ? ' — ' + it.motivo : ''}`; }
  if (it.kind === 'compra' || it.kind === 'comprovante') t = t.replace(/ · comprovante: \S+/, ' · 🧾 com comprovante').replace(/^painel\/comprovantes\/\S+/, 'print anexado');
  if (it.kind === 'nota') k = `📝 ${it.areaTxt}`;
  if (it.kind === 'comprar') k = `🛒 Comprar (${it.sec})`;
  if (it.kind === 'regula') { k = '🧭 ' + (it.text || 'Regulação'); t = ''; }
  if (it.kind === 'estou') { k = '💭 Como estou'; }
  if (it.kind === 'captura') {
    const c = lerCaptura(it.text, it.cont);
    const marcas = c.anexos.map(a => a.tipo === 'áudio' ? '🎙️ áudio' : a.tipo === 'foto' ? '📷 foto' : '📎 ' + a.tipo).join(' · ');
    const corpo = compact ? short(c.texto.replace(/\n/g, ' '), 70) : c.texto;
    return `<span class="k">💬</span> <span class="cap-t">${h(corpo)}</span>${marcas ? ` <span class="muted">${h(marcas)}</span>` : ''}`;
  }
  const extra = [];
  if (it.due) extra.push(dueTxt(it.due));
  if (it.note && S.files[it.note]) extra.push(srcLink(it.note));
  const body = compact ? short(plain(t), 70) : plain(t);
  return `<span class="k">${h(k)}</span>${body ? ' ' + h(body) : ''}${extra.length ? ` <span class="muted">· </span>${extra.join(' ')}` : ''}${!compact && it.cont.length ? `<span class="c">${h(it.cont.map(c => c.replace(/^>\s?/, '')).join('\n'))}</span>` : ''}`;
}
function renderRhythm() {
  const n = now(), days = [];
  for (let k = 6; k >= 0; k--) days.push(ymd(addDays(n, -k)));
  const rows = ['saude', 'ingles', 'carreira', 'emocional', 'cultura', 'financas', 'trabalho'];
  let html = `<div class="rh"><span></span>${days.map(d => { const x = pymd(d); return `<span class="dh${d === days[6] ? ' today' : ''}">${DOW[x.getDay()]}<br>${x.getDate()}</span>`; }).join('')}<span class="dh">feitos</span>`;
  let any = false;
  const boxH = S.cx.filter(i => i.kind === 'habito');
  for (const a of rows) {
    if (cfg.discreet && VEIL.has(a)) continue;
    let okN = 0, planN = 0, cellsH = '', has = false;
    for (const d of days) {
      const plan = seriesOn(d).filter(s => s.area === a);
      const rs = [...S.habits.filter(r => r.area === a && r.date === d), ...boxH.filter(i => i.area === a && (i.hdate || i.date) === d)];
      if (a === 'trabalho' && !rs.length) { cellsH += '<span></span>'; continue; }
      planN += plan.length; has = has || plan.length > 0 || rs.length > 0;
      const ok = rs.filter(r => r.ok === true).length, no = rs.filter(r => r.ok === false).length;
      okN += ok;
      const tip = `${AREAS[a].nome}, ${dayLabel(d)}: ${ok} feito(s), ${no} não feito(s), ${plan.length} planejado(s)`;
      const c = ok ? 'ok' : no ? 'no' : plan.length ? (d === days[6] ? 'plan' : 'miss') : '';
      cellsH += c ? `<span class="cell ${c}" style="--c:${areaColor(a)}" title="${h(tip)}"></span>` : '<span></span>';
    }
    if (!has) continue;
    any = true;
    html += `<span class="lb">${AREAS[a].emoji} ${AREAS[a].nome}</span>${cellsH}<span class="tot">${okN}/${Math.max(planN, okN)}</span>`;
  }
  html += '</div><div class="legend"><span><span class="cell ok"></span>feito</span><span><span class="cell no"></span>não feito</span><span><span class="cell miss"></span>planejado, sem registro</span><span><span class="cell plan"></span>hoje, falta marcar</span></div>';
  $('#rhythm').innerHTML = any ? html : '<p class="empty">Sem blocos ou registros nesta semana.</p>';
}
function feedItem(c) {
  const subj = c.msg.split('\n')[0].replace(/\s*\[(agenda|planilha|drive|tarefas?|ticktick)\]/g, '').trim();
  const via = /via painel/.test(c.msg);
  let pre = '', txt = subj;
  if (/^vault backup/i.test(subj)) { pre = 'obsidian'; txt = 'notas editadas'; }
  else if (subj.includes(': ') && subj.split(': ')[0].length <= 45) [pre, txt] = [subj.split(': ')[0], subj.split(': ').slice(1).join(': ')];
  const p = norm(pre).trim(), key = p.split(/[\s/,;]+/)[0] || '';
  if (TECNICOS.has(key)) return null;
  let label;
  const caseP = S.stems[p] && S.stems[p].startsWith('casos/') ? S.stems[p] : null;
  if (caseP) label = '📂 ' + short(S.files[caseP].title, 40);
  else if (ROTULOS[p]) label = ROTULOS[p];
  else if (ROTULOS[key]) label = ROTULOS[key];
  else label = pre ? '📝 ' + pre[0].toUpperCase() + pre.slice(1) : '📝 Notas';
  const reservado = SENS.has(key) || (cfg.discreet && (key === 'financas' || (caseP && VEIL.has(S.files[caseP]?.area)) || (via && /compra|receita|transferência|comprovante|financ/i.test(subj))));
  if (reservado) { txt = 'registro atualizado'; if (cfg.discreet) label = '🔒 Registro reservado'; }
  return { label, txt: txt ? txt[0].toUpperCase() + txt.slice(1) : '', via, date: c.date ? new Date(c.date) : null, sha: c.sha };
}
function whenTxt(d) {
  if (!d) return '';
  const n = now(), t = ymd(d);
  if (t === ymd(n)) { const m = (n - d) / 60000; return m < 1 ? 'agora' : m < 60 ? `há ${Math.floor(m)} min` : 'hoje ' + hm(d); }
  if (t === ymd(addDays(n, -1))) return 'ontem ' + hm(d);
  return dayLabel(t) + ' ' + hm(d);
}
function relDay(s) {
  if (!s || !/^\d{4}-\d{2}-\d{2}/.test(s)) return '';
  const diff = Math.round((pymd(ymd(now())) - pymd(s.slice(0, 10))) / 864e5);
  return diff <= 0 ? 'mexida hoje' : diff === 1 ? 'mexida ontem' : diff < 15 ? `mexida há ${diff} dias` : `mexida em ${dm(s.slice(0, 10))}`;
}
function renderAreas() {
  $('#memoryLinks').innerHTML = atalhosDaMemoria();
  $('#areaList').innerHTML = AREA_ORDER.map(a => {
    const file = S.files[`areas/${a}/${a}.md`];
    if (!file || a === 'financas') return '';
    const status = norm(file.meta.status || '');
    let detail = '';
    if (cfg.discreet && (file.sens || VEIL.has(a))) {
      detail = `<span class="area-status">${ICON.lock} Área reservada</span>`;
    } else if (Object.hasOwn(STATUS, status)) {
      detail = `<span class="area-status lamp s-${status}">${STATUS[status]}</span>`;
    }
    return `<a class="area-tile" href="#area/${a}" style="--c:${areaColor(a)}">
      <span class="tile-mark" aria-hidden="true">${AREAS[a].emoji}</span>
      <span class="tile-name">${h(AREAS[a].nome)}</span>${detail}
    </a>`;
  }).join('') || '<p class="empty">Nenhuma área registrada.</p>';
}
function areaRecordList(files, area) {
  return `<ul class="reading-index">${files.map(f => {
    const principal = f.path === `areas/${area}/${area}.md`;
    const date = String(f.meta.atualizado || '').slice(0, 10);
    const meta = [principal ? 'Nota principal' : '', /^\d{4}-\d{2}-\d{2}$/.test(date) ? `Atualizado em ${dm(date)}/${date.slice(0, 4)}` : ''].filter(Boolean);
    return `<li><a href="${h(principal ? linkDeNota(area) : linkDeRegistro(f.path))}"><span class="book-icon" aria-hidden="true">${BOOK_ICON}</span><span class="index-title">${h(plain(f.title))}${meta.length ? `<small>${h(meta.join(' · '))}</small>` : ''}</span><span aria-hidden="true">›</span></a></li>`;
  }).join('')}</ul>`;
}

const BOOK_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M6 4.5h11.5v15H7.3A2.3 2.3 0 0 1 5 17.2V6a1.5 1.5 0 0 1 1-1.5Z"/><path d="M5.5 16h12M9 8h5"/></svg>';
const SUMARIO_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M4 6h3M10 6h10M4 12h3M10 12h10M4 18h3M10 18h10"/></svg>';
const linkTopico = (area, id) => id === 'resumo' ? (area === 'financas' ? '#area/financas/resumo' : `#area/${area}`) : `#area/${area}/${id}`;
const linkDeNota = area => `#area/${area}/nota/${encodeURIComponent(area)}`;
const diaLongo = s => { const t = pymd(s).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }); return t.charAt(0).toUpperCase() + t.slice(1); };
const ORIGEM_ICON = { registro: '📓', area: '📄', caso: '📂', Hábitos: '🔁', Decisões: '🧭', Documentos: '🔢', Agenda: '🗓️' };
const DICA = {
  metas: 'As metas do trimestre entram aqui quando você combinar na revisão. Ficam em “Metas do trimestre” na nota da área.',
  tarefas: 'Nenhuma tarefa nesta área. Quando você pedir uma, o assessor cria no TickTick e ela aparece aqui.',
  combinados: 'Quando você combinar algo (com alguém ou com você mesmo), o assessor anota em “Combinados”.',
  decisoes: 'Decisões que mudam o rumo desta área. O assessor guarda com a data e o porquê.',
  padroes: 'O que funciona e o que trava. Aparece sozinho quando houver ✅ e ❌ de hábitos desta área, e o assessor completa na revisão de domingo.',
  numeros: 'Protocolos, valores, contatos e documentos dos casos desta área.',
  pessoas: 'Pessoas e casos aparecem aqui quando estiverem ligados às notas desta área.',
  perguntas: 'O que ficou pra decidir ou conferir. O assessor traz na revisão de domingo.',
  conquistas: 'O que deu certo, com a data. Serve de prova quando o dia parecer ruim.',
  agenda: 'Nenhum compromisso desta área na agenda. Os blocos fixos e os compromissos com a área marcada aparecem aqui.',
  materiais: 'Cursos, vídeos, livros e links desta área. O assessor guarda em “Materiais e links” na nota da área, e os links citados nas notas aparecem aqui sozinhos.',
  esperando: 'Nada esperando outra pessoa nesta área. Tarefas que começam com “Esperando:” aparecem aqui.',
  custos: 'Nenhum gasto da planilha ligado a esta área neste mês.',
  ideias: 'O que você quer fazer um dia, sem prazo. O assessor guarda em “Ideias pra depois”.',
  motivo: 'Por que esta área importa pra você, nas suas palavras. Serve pra lembrar num dia ruim.',
  dias: 'Nenhum registro com data nesta área ainda. O assessor grava aqui o que você fez ou não fez, dia a dia.',
};

/* tudo que a página da área precisa, calculado uma vez por desenho */
function contextoDaArea(area, base) {
  const ver = f => !cfg.discreet || !f.sens || S.reveal.has(base);
  const notas = notasDaArea(S.files, area).filter(ver);
  const principal = notas.find(f => f.path === `areas/${area}/${area}.md`) || null;
  const casos = casosDaArea(S.files, area).filter(ver)
    .sort((a, b) => Number(/^(fechado|resolvido|concluido|encerrado)$/.test(norm(a.meta.status))) - Number(/^(fechado|resolvido|concluido|encerrado)$/.test(norm(b.meta.status)))
      || String(b.meta.atualizado || '').localeCompare(String(a.meta.atualizado || '')));
  const hoje = ymd(now());
  const dias = diasDaArea(Object.fromEntries([...notas, ...casos, ...['eu/habitos.md', 'eu/decisoes.md', 'documentos/documentos.md', 'agenda.md'].map(p => S.files[p]).filter(Boolean)].map(f => [f.path, f])), area, hoje);
  const tarefas = organizarTarefas(S.tasks.filter(g => g.members.some(m => S.files[m.path]?.area === area) && (!cfg.discreet || !g.sens || S.reveal.has(base))), hoje, estadoTarefa);
  const apoio = notas.filter(f => f !== principal && !ehRegistroDoMes(f.path));
  return { area, base, notas, principal, casos, dias, tarefas, apoio, hoje };
}
const ultimosDias = (C, n) => C.dias.slice(0, n);
/* lista longa: os n primeiros itens de 1º nível ficam à vista, o resto vai pra um "mais" */
function cortarLista(text, n) {
  const L = text.split('\n');
  let itens = 0, corte = -1;
  for (let i = 0; i < L.length; i++) if (/^([-*+]|\d+\.)\s+/.test(L[i]) && ++itens === n + 1) { corte = i; break; }
  if (corte < 0) return { inicio: text, resto: '', n: 0 };
  const resto = L.slice(corte).join('\n');
  return { inicio: L.slice(0, corte).join('\n'), resto, n: resto.split('\n').filter(l => /^([-*+]|\d+\.)\s+/.test(l)).length };
}
const maiuscula = t => t.charAt(0).toUpperCase() + t.slice(1);
const semTraco = t => String(t || '').replace(/^\s*[—–-]+\s*/, '');
const itensDoDia = dia => dia.entradas.reduce((n, e) => n + (e.tipo === 'texto' ? Math.max(1, e.texto.split('\n').filter(l => /^\s*([-*+]|\d+\.)\s+/.test(l) && !/^\s{2,}/.test(l)).length) : 1), 0);
function linhasDoDia(dia) {
  return dia.entradas.map(e => {
    if (e.tipo === 'texto') {
      const l = e.texto.split('\n').map(x => x.trim()).find(x => x && !/^[#|>]/.test(x));
      return l ? plain(l.replace(/^([-*+]|\d+\.)\s+(\[[ xX]\]\s*)?/, '')) : plain(e.titulo || e.fonte);
    }
    const st = e.campos.find(([, v]) => /^[✅❌🚫↷]/u.test(v.trim()) && v.trim().length <= 3)?.[1] || '';
    const resto = e.campos.filter(([, v]) => v !== st);
    const principal = resto.length > 2 ? `${resto[0][0].replace(/\s*\(.*\)$/, '')}: ${resto[0][1]}` : resto[0]?.[1] || '';
    return plain(`${st ? st + ' ' : ''}${principal}`);
  }).filter(Boolean);
}

function topicosDaArea(C) {
  const { area, notas, principal, casos } = C;
  const secoes = id => secoesDoTopico(['decisoes', 'numeros', 'perguntas'].includes(id) ? [...notas, ...casos] : notas, id);
  const decisoesFora = S.files['eu/decisoes.md'] ? entradasDatadas(S.files['eu/decisoes.md']).filter(e => e.tipo === 'linha' && e.campos.some(([k, v]) => /^areas?$/.test(norm(k)) && areasDoTexto(v).has(area))) : [];
  const casoStems = new Set(casos.map(f => f.stem.toLowerCase()));
  const docs = S.files['documentos/documentos.md'] ? entradasDatadas(S.files['documentos/documentos.md']).filter(e => e.tipo === 'linha' && e.campos.some(([k, v]) => norm(k) === 'caso' && [...v.matchAll(/\[\[([^\]|#]+)/g)].some(m => m[1].trim().toLowerCase() === area || casoStems.has(m[1].trim().toLowerCase())))) : [];
  const padroes = padroesDosHabitos(S.habits, area, C.hoje);
  const pessoas = new Set();
  for (const f of [...notas, ...casos]) {
    for (const m of f.text.matchAll(/\[\[([^\]|#]+)/g)) { const p = S.stems[m[1].trim().toLowerCase()]; if (p?.startsWith('pessoas/')) pessoas.add(p); }
    for (const nome of [].concat(f.meta.pessoas || [])) { const p = S.stems[String(nome).replace(/^\[\[|\]\]$/g, '').trim().toLowerCase()]; if (p?.startsWith('pessoas/')) pessoas.add(p); }
  }
  const abertasL = ['atrasadas', 'hoje', 'proximas', 'semdata'].flatMap(k => C.tarefas[k]);
  const abertas = abertasL.length;
  const esperando = abertasL.filter(g => /^esperando\b/.test(norm(plain(g.text))));
  const compromissos = S.agenda.events.filter(e => e.area === area && e.date >= C.hoje).sort((a, b) => (a.date + (a.start || '')).localeCompare(b.date + (b.start || '')));
  const fixos = S.agenda.series.filter(x => x.area === area && (!x.until || x.until >= C.hoje));
  // Gastos agora ficam no Minhas Economias: a área não calcula mais custos pela planilha.
  const custos = { itens: [], total: 0 }, custosAntes = custos;
  const links = linksDasNotas(notas);
  const metasSec = secoes('metas');
  const extras = { decisoes: decisoesFora, numeros: docs };
  const n = {
    resumo: 0, metas: metasSec.reduce((t, s) => t + Math.max(1, metasDaTabela(s.texto).length), 0), tarefas: abertas,
    pessoas: casos.length + pessoas.size, padroes: secoes('padroes').length + padroes.lista.length,
    agenda: compromissos.length + fixos.length, esperando: esperando.length + secoes('esperando').length,
    custos: custos.itens.length, materiais: secoes('materiais').length + links.length,
  };
  for (const id of ['combinados', 'decisoes', 'numeros', 'perguntas', 'conquistas', 'ideias', 'motivo']) n[id] = secoes(id).length + (extras[id]?.length || 0);
  return { n, secoes, decisoesFora, docs, padroes, pessoas: [...pessoas].map(p => S.files[p]).filter(Boolean), metasSec, esperando, compromissos, fixos, custos, custosAntes, links, temFin: false };
}

const SM_CARET = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M6 4l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
/* Sumário (22/11/2026): só aparece o que tem conteúdo. Tópico vazio não ocupa espaço;
   ele surge sozinho quando o assessor grava algo naquela seção. */
function sumarioDaArea(C, T, vista) {
  const { area } = C;
  // caso ou pessoa aberto dentro da área acende "Pessoas e casos"
  const atual = vista.vista !== 'nota' ? vista.vista : /^(casos|pessoas)\//.test(vista.path || '') ? 'pessoas' : null;
  const item = t => `<li><a class="sm-row" href="${linkTopico(area, t.id)}"${atual === t.id ? ' aria-current="page"' : ''}><span class="sm-ic" aria-hidden="true">${t.emoji}</span><span class="sm-nome">${t.curto || t.nome}</span>${t.id !== 'resumo' && T.n[t.id] ? `<span class="sm-n">${T.n[t.id]}</span>` : ''}</a></li>`;
  const visiveis = TOPICOS.filter(t => t.id === 'resumo' || T.n[t.id] > 0 || t.id === atual);
  const meses = new Map();
  for (const d of C.dias) { const k = d.date.slice(0, 7); if (!meses.has(k)) meses.set(k, []); meses.get(k).push(d); }
  const mesAtual = (vista.dia || C.dias[0]?.date || C.hoje).slice(0, 7);
  const dias = [...meses.entries()].map(([k, ds]) => `<li><details class="sm-tg sm-mes"${k === mesAtual && vista.dia ? ' open' : ''} data-section="mes-${k}"><summary class="sm-row"><span class="sm-caret">${SM_CARET}</span><span class="sm-nome">${MESES[+k.slice(5) - 1]} ${k.slice(0, 4)}</span><span class="sm-n">${ds.length}</span></summary>
    <ul class="sm-sub">${ds.map(d => `<li><a class="sm-row" href="#area/${area}/dia/${d.date}"${vista.dia === d.date ? ' aria-current="page"' : ''}><span class="sm-nome">${dayLabel(d.date)}</span><span class="sm-n">${itensDoDia(d)}</span></a></li>`).join('')}</ul></details></li>`).join('');
  const notas = [C.principal ? `<li><a class="sm-row" href="${linkDeNota(area)}"${vista.path === C.principal.path ? ' aria-current="page"' : ''}><span class="sm-ic" aria-hidden="true">📄</span><span class="sm-nome">Nota principal</span></a></li>` : '',
    ...C.apoio.map(f => `<li><a class="sm-row" href="${h(linkDeRegistro(f.path))}"${vista.path === f.path ? ' aria-current="page"' : ''}><span class="sm-ic" aria-hidden="true">📄</span><span class="sm-nome">${h(plain(f.title))}</span></a></li>`)].join('');
  const emDias = atual === 'dias' || !!vista.dia;
  const emNotas = vista.vista === 'nota' && !atual;
  const blocoDias = C.dias.length ? `<li><details class="sm-tg" data-section="sm-dias"${emDias ? ' open' : ''}><summary class="sm-row${atual === 'dias' ? ' sm-atual' : ''}"><span class="sm-caret">${SM_CARET}</span><span class="sm-ic" aria-hidden="true">📅</span><span class="sm-nome">Registros diários</span><span class="sm-n">${C.dias.length}</span></summary>
    <ul class="sm-sub"><li><a class="sm-row" href="#area/${area}/dias"${atual === 'dias' ? ' aria-current="page"' : ''}><span class="sm-nome">Todos os dias</span></a></li>${dias}</ul></details></li>` : '';
  const blocoNotas = notas ? `<li><details class="sm-tg" data-section="sm-notas"${emNotas ? ' open' : ''}><summary class="sm-row"><span class="sm-caret">${SM_CARET}</span><span class="sm-ic" aria-hidden="true">📚</span><span class="sm-nome">Notas da área</span><span class="sm-n">${C.apoio.length + (C.principal ? 1 : 0)}</span></summary><ul class="sm-sub">${notas}</ul></details></li>` : '';
  return `<nav class="sumario" id="areaSumario" aria-label="Sumário de ${h(AREAS[area].nome)}">
    <div class="sm-topo"><span>${h(AREAS[area].nome)}</span><button type="button" class="ib sm-fechar" data-sumario="fechar" aria-label="Fechar sumário">${ICON.x}</button></div>
    <ul class="sm-lista">${visiveis.map(item).join('')}</ul>
    ${blocoDias || blocoNotas ? `<ul class="sm-lista sm-arquivo">${blocoDias}${blocoNotas}</ul>` : ''}
  </nav>`;
}

const vazioTopico = id => `<div class="area-card topico-vazio"><p>${h(DICA[id] || 'Nada aqui ainda.')}</p></div>`;
const cartaoSecao = s => `<section class="area-card secao-card"><header class="secao-h"><h3>${h(plain(s.titulo))}</h3>${s.titulo !== s.fonte ? `<button type="button" class="secao-fonte" data-open="${h(s.path)}">${h(short(plain(s.fonte), 34))} <span aria-hidden="true">↗</span></button>` : `<button type="button" class="secao-fonte" data-open="${h(s.path)}">abrir <span aria-hidden="true">↗</span></button>`}</header><div class="md">${md(s.texto, s.path, true)}</div></section>`;
function barraMeta(m) {
  return `<li class="meta-item"><div class="meta-t">${inline(m.meta)}</div><div class="meta-nums"><span>Atual <b>${inline(m.atual || '—')}</b></span><span>Alvo <b>${inline(m.alvo || '—')}</b></span></div>${m.pct !== null ? `<div class="meta-barra" role="img" aria-label="${m.pct}% do alvo"><i style="width:${m.pct}%"></i></div>` : ''}</li>`;
}
function linhaDoRegistro(e) {
  let campos = [...e.campos], st = '';
  const i = campos.findIndex(([, v]) => /^[✅❌🚫↷]/u.test(v.trim()) && v.trim().length <= 3);
  if (i >= 0) { st = campos[i][1].trim(); campos.splice(i, 1); }
  if (campos.length <= 2) {
    const [principal, extra] = campos;
    return `<li class="dia-linha">${st ? `<span class="dia-st">${st}</span>` : ''}<span>${inline(principal?.[1] || '')}${extra ? ` <small>${inline(extra[0])}: ${inline(extra[1])}</small>` : ''}</span></li>`;
  }
  return `<li class="dia-linha dia-campos">${st ? `<span class="dia-st">${st}</span>` : ''}<dl>${campos.map(([k, v]) => `<div><dt>${inline(k)}</dt><dd>${inline(v)}</dd></div>`).join('')}</dl></li>`;
}
function blocoDoDia(dia) {
  const grupos = new Map();
  for (const e of dia.entradas) { if (!grupos.has(e.path)) grupos.set(e.path, []); grupos.get(e.path).push(e); }
  return [...grupos.entries()].map(([path, es]) => {
    const e0 = es[0], ic = ORIGEM_ICON[e0.fonte] || ORIGEM_ICON[e0.origem] || '📄';
    const secao = [...new Set(es.map(e => e.secao).filter(Boolean))].map(plain).join(' · ');
    const textos = es.filter(e => e.tipo === 'texto').map(e => `${e.titulo && !/^(seg|ter|qua|qui|sex|s[aá]b|dom)\.?$/i.test(e.titulo) ? `<p class="dia-sub">${inline(e.titulo)}</p>` : ''}<div class="md">${md(e.texto, path, true)}</div>`).join('');
    const linhas = es.filter(e => e.tipo === 'linha');
    return `<section class="dia-grupo"><header><span aria-hidden="true">${ic}</span><button type="button" class="dia-fonte" data-open="${h(path)}">${h(plain(e0.origem === 'registro' ? 'Anotações do dia' : e0.fonte))}</button>${secao && e0.origem !== 'fora' ? `<small>${h(secao)}</small>` : ''}</header>
      ${textos}${linhas.length ? `<ul class="dia-linhas">${linhas.map(linhaDoRegistro).join('')}</ul>` : ''}</section>`;
  }).join('');
}

/* ─────────────── topo próprio de cada área (22/11/2026) ───────────────
   Cada área mostra primeiro o que importa nela, num desenho dela. Tudo vem das notas e do espelho. */
const HERO = {
  saude: { kicker: 'Corpo e treino', marca: '🏃' },
  ingles: { kicker: 'Inglês, uma sessão de cada vez', marca: '🗣️' },
  carreira: { kicker: 'Trilha até pleno', marca: '🧗' },
  emocional: { kicker: 'Cuidar de você', marca: '🌙' },
  'casa-familia': { kicker: 'Família e a chegada do Rafael', marca: '🏡' },
  cultura: { kicker: 'Um tema por domingo', marca: '🧭' },
  trabalho: { kicker: 'Apsis e renda extra', marca: '💼' },
};
const DIA1 = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const ICONE_TREINO = { academia: '🏋️', corrida: '🏃', caminhada: '🚶', outro: '•' };
const quandoCurto = (data, hora, hoje) => {
  const dif = Math.round((pymd(data) - pymd(hoje)) / 864e5);
  const dia = dif === 0 ? 'hoje' : dif === 1 ? 'amanhã' : dayLabel(data);
  return hora ? `${dia} · ${hora}` : dia;
};
function heroDaArea(C, T) {
  const { area, hoje } = C;
  const H = HERO[area];
  if (!H) return '';
  const metas = T.metasSec.flatMap(s => metasDaTabela(s.texto));
  const status = norm(C.principal?.meta.status || '');
  const prox = proximosDaArea(S.fin, S.agenda.events, area, hoje, 2);
  let titulo = '', corpo = '';
  if (area === 'saude') {
    const semana = semanaDaArea(S.habits, area, hoje);
    const feitos = semana.flatMap(d => d.itens).filter(x => x.st === 'feito' && x.tipo !== 'outro').length;
    titulo = `<b>${feitos}</b> ${feitos === 1 ? 'treino' : 'treinos'} nesta semana`;
    corpo = `<ol class="hx-semana" aria-label="Treinos da semana">${semana.map(d => {
      const fez = d.itens.filter(x => x.st === 'feito' && x.tipo !== 'outro'), faltou = d.itens.some(x => x.st === 'nao');
      const cls = [d.dia === hoje ? 'hoje' : '', d.dia > hoje ? 'futuro' : '', fez.length ? 'fez' : faltou ? 'faltou' : ''].filter(Boolean).join(' ');
      const rot = fez.map(x => x.oque).join(', ') || (faltou ? 'faltou' : 'nada registrado');
      return `<li class="${cls}" title="${h(dayLabel(d.dia) + ': ' + rot)}"><span class="hx-d">${DIA1[pymd(d.dia).getDay()]}</span><span class="hx-c" aria-label="${h(rot)}">${fez.length ? fez.map(x => ICONE_TREINO[x.tipo]).join('') : faltou ? '✕' : ''}</span></li>`;
    }).join('')}</ol>`;
  } else if (area === 'ingles') {
    const ses = metas.find(m => /^sess/i.test(m.meta));
    const nv = nivelDeIngles(metas);
    const a = parseInt(ses?.atual, 10) || 0, b = parseInt(ses?.alvo, 10) || 0, pct = b ? Math.min(100, a / b * 100) : 0;
    titulo = ses ? `<b>${a}</b> de ${b} sessões` : 'Sessões de inglês';
    corpo = `<div class="hx-ingles"><svg class="hx-anel" viewBox="0 0 44 44" role="img" aria-label="${Math.round(pct)}% das sessões"><circle cx="22" cy="22" r="18"/><circle class="v" cx="22" cy="22" r="18" stroke-dasharray="${(pct / 100 * 113.1).toFixed(1)} 113.1"/><text x="22" y="26">${Math.round(pct)}%</text></svg>
      ${nv.atual >= 0 ? `<ol class="hx-niveis" aria-label="Nível">${nv.niveis.map((n, i) => `<li class="${i < nv.atual ? 'passou' : i === nv.atual ? 'agora' : i === nv.alvo ? 'alvo' : ''}">${n}${i === nv.atual ? '<small>você</small>' : i === nv.alvo ? '<small>meta</small>' : ''}</li>`).join('')}</ol>` : ''}</div>`;
  } else if (area === 'carreira') {
    const fases = trilha(S.files['areas/carreira/plano-carreira.md']?.body);
    const atual = fases.findIndex(f => !f.feita);
    titulo = atual >= 0 ? `Fase <b>${h(fases[atual].fase)}</b>: ${h(fases[atual].tema)}` : fases.length ? 'Trilha concluída' : 'Trilha de carreira';
    corpo = fases.length ? `<ol class="hx-trilha">${fases.map((f, i) => `<li class="${f.feita ? 'feita' : i === atual ? 'agora' : ''}"><span>${h(f.fase)}</span><small>${h(f.tema)}</small></li>`).join('')}</ol>` : '';
  } else if (area === 'emocional') {
    const textos = C.notas.filter(f => /\/journal-\d{4}-\d{2}\.md$/.test(f.path)).map(f => f.body);
    const hum = humorRecente(textos, hoje, 14);
    const dias7 = [...Array(7)].map((_, i) => ymd(addDays(pymd(hoje), i - 6)));
    const feitos = new Set(hum.map(x => x.date));
    const k = dias7.filter(d => feitos.has(d)).length;
    titulo = `Registro em <b>${k}</b> dos últimos 7 dias`;
    const pts = hum.filter(x => x.humor);
    const desde = addDays(pymd(hoje), -13);
    const xy = pts.map(x => [Math.round((pymd(x.date) - desde) / 864e5) / 13 * 280 + 10, 52 - (x.humor - 1) / 4 * 44]);
    corpo = `<ol class="hx-pontos" aria-label="Registros dos últimos 7 dias">${dias7.map(d => `<li class="${feitos.has(d) ? 'fez' : ''}${d === hoje ? ' hoje' : ''}"><span>${DIA1[pymd(d).getDay()]}</span><i></i></li>`).join('')}</ol>
      ${xy.length > 1 ? `<figure class="hx-humor"><svg viewBox="0 0 300 60" role="img" aria-label="Humor dos últimos 14 dias, de 1 a 5"><polyline points="${xy.map(p => p.join(',')).join(' ')}"/>${xy.map(p => `<circle cx="${p[0]}" cy="${p[1]}" r="3.2"/>`).join('')}</svg><figcaption>Humor de 1 a 5, últimos 14 dias</figcaption></figure>` : ''}`;
  } else if (area === 'casa-familia') {
    const marcos = marcosDaArea(C.principal?.meta, hoje);
    titulo = marcos[0] ? `<b>${marcos[0].dias}</b> ${marcos[0].dias === 1 ? 'dia' : 'dias'} até ${h(marcos[0].nome)}` : 'Casa e família';
    const semArtigo = t => maiuscula(t.replace(/^(o|a|os|as)\s+/i, ''));
    corpo = marcos.length ? `<ul class="hx-marcos">${marcos.slice(0, 3).map(m => `<li><b>${m.dias}</b><span>${m.dias === 1 ? 'dia' : 'dias'}</span><small>${h(semArtigo(m.nome))}<br>${dm(m.data)}/${m.data.slice(2, 4)}</small></li>`).join('')}</ul>` : '';
  } else if (area === 'cultura') {
    const dom = metas.find(m => /domingo/i.test(m.meta));
    const a = parseInt(dom?.atual, 10) || 0, b = parseInt(dom?.alvo, 10) || 12;
    titulo = `<b>${a}</b> de ${b} domingos`;
    const tema = (S.files['areas/cultura/leituras.md']?.body.match(/^##\s+Tema\s*\d*\s*:\s*(.+?)(?:\s*\(.*)?$/m) || [])[1];
    const musica = (S.files['areas/cultura/musicas.md']?.body.match(/\*\*(.+?)\*\*,\s*de\s*\*\*(.+?)\*\*/) || []);
    corpo = `<ol class="hx-domingos" aria-label="${a} de ${b} domingos">${[...Array(b)].map((_, i) => `<li class="${i < a ? 'fez' : ''}"></li>`).join('')}</ol>
      <div class="hx-chips">${tema ? `<span>📖 ${h(tema)}</span>` : ''}${musica[1] ? `<span>🎵 ${h(musica[1])} · ${h(musica[2])}</span>` : ''}</div>`;
  } else if (area === 'trabalho') {
    const abertos = C.casos.filter(f => !/^(fechado|resolvido|concluido|encerrado)$/.test(norm(f.meta.status || '')));
    titulo = `<b>${abertos.length}</b> ${abertos.length === 1 ? 'assunto aberto' : 'assuntos abertos'}`;
    corpo = abertos.length ? `<div class="hx-chips hx-casos">${abertos.slice(0, 5).map(f => `<button type="button" data-open="${h(f.path)}">📂 ${h(short(plain(f.title), 42))}</button>`).join('')}</div>` : '';
  }
  return `<section class="hero hero-${area}" data-marca="${H.marca}">
    <div class="hero-top"><p class="hero-kicker">${h(H.kicker)}</p>${Object.hasOwn(STATUS, status) ? `<span class="area-status lamp s-${status}">${STATUS[status]}</span>` : ''}</div>
    <h2 class="hero-titulo">${titulo}</h2>${corpo}
    ${prox.length ? `<ul class="hero-prox">${prox.map(e => `<li><span>${h(quandoCurto(e.data, e.inicio, hoje))}</span>${h(plain(e.titulo))}</li>`).join('')}</ul>` : ''}
  </section>`;
}

function corpoDoTopico(C, T, vista) {
  const { area, principal } = C;
  const id = vista.vista;
  if (id === 'resumo') {
    const secs = principal ? secoesDeLeitura(principal.body) : [];
    const agora = secs.find(s => /^agora\b/.test(norm(s.title)));
    const importante = secs.find(s => /^importante\b/.test(norm(s.title)));
    // "## Também: …" na nota da área = assunto paralelo (ex.: renda extra no Trabalho), num cartão à parte
    const tambem = secs.filter(s => /^tambem\b/.test(norm(s.title)));
    const meta = T.metasSec.flatMap(s => metasDaTabela(s.texto))[0];
    const metaLista = !meta && primeiraMeta(secs);
    const status = norm(principal?.meta.status || '');
    const prox = [...C.tarefas.atrasadas, ...C.tarefas.hoje, ...C.tarefas.proximas, ...C.tarefas.semdata].slice(0, 3);
    const dias = ultimosDias(C, 3);
    const hero = heroDaArea(C, T);
    return `${hero}<div class="area-overview">
      <section class="area-card focus-card"><div class="area-card-head"><h3>${agora ? 'Agora' : 'Como está'}</h3>${!hero && Object.hasOwn(STATUS, status) ? `<span class="area-status lamp s-${status}">${STATUS[status]}</span>` : ''}</div>
        ${agora ? '' : `<p>${h(short(plain(principal?.meta.resumo || 'Ainda sem resumo. O assessor escreve um quando você contar como está esta área.'), 240))}</p>`}
        ${agora ? (() => { const { inicio, resto, n } = cortarLista(agora.text, 4); return `<div class="md resumo-agora">${md(inicio, principal.path, true)}</div>${n ? `<details class="resumo-mais" data-section="agora-mais"><summary>Mais ${n} ${n === 1 ? 'item' : 'itens'} em “Agora”</summary><div class="md resumo-agora">${md(resto, principal.path, true)}</div></details>` : ''}`; })() : ''}</section>
      ${tambem.map(t => { const nome = plain(t.title).replace(/^também\s*:?\s*/i, ''); return `<section class="area-card area-tambem"><div class="area-card-head"><h3><small>Também nesta área</small>${h(nome.charAt(0).toUpperCase() + nome.slice(1))}</h3></div><div class="md">${md(t.text, principal.path, true)}</div></section>`; }).join('')}
      ${meta || metaLista ? `<section class="area-card"><div class="area-card-head"><h3>Meta em foco</h3><a class="area-link" href="${linkTopico(area, 'metas')}">Metas →</a></div>
        ${meta ? `<ul class="metas">${barraMeta(meta)}</ul>` : `<p class="area-empty">${inline(metaLista)}</p>`}</section>` : ''}
      ${prox.length ? `<section class="area-card"><div class="area-card-head"><h3>Próximos passos</h3><a class="area-link" href="${linkTopico(area, 'tarefas')}">Tarefas →</a></div>
        <ul class="area-steps">${prox.map(taskLi).join('')}</ul></section>` : ''}
      ${dias.length ? `<section class="area-card area-recent"><div class="area-card-head"><h3>Últimos dias</h3><a class="area-link" href="#area/${area}/dias">Todos →</a></div>
        <ul class="ultimos">${dias.map(d => `<li><a href="#area/${area}/dia/${d.date}"><b>${dayLabel(d.date)}</b><span>${h(short(linhasDoDia(d).slice(0, 2).join(' · '), 110))}</span></a></li>`).join('')}</ul></section>` : ''}
      ${importante ? `<section class="area-card area-recent"><h3>Importante</h3><div class="md">${md(importante.text, principal.path, true)}</div></section>` : ''}
      ${area === 'financas' ? `<a class="area-card area-recent fin-atalho" href="#financas"><b>💰 Abrir Finanças</b><span>Saldo, extrato, orçamento e cartões, direto da planilha →</span></a>` : ''}
    </div>${SENS.has(area) ? visaoBemEstar(area, Object.values(S.files), C.hoje) : ''}`;
  }
  if (id === 'metas') {
    if (!T.metasSec.length) return vazioTopico('metas', area);
    const hj = pymd(C.hoje), seg = addDays(hj, -((hj.getDay() + 6) % 7));
    const semana = [...Array(7)].map((_, i) => ymd(addDays(seg, i)));
    const hab = S.habits.filter(x => x.area === area && semana.includes(x.date) && x.st);
    const feitos = hab.filter(x => x.st === 'feito').length;
    return T.metasSec.map(s => {
      const metas = metasDaTabela(s.texto);
      return `<section class="area-card secao-card"><header class="secao-h"><h3>${h(plain(s.titulo))}</h3><button type="button" class="secao-fonte" data-open="${h(s.path)}">abrir <span aria-hidden="true">↗</span></button></header>
        ${metas.length ? `<ul class="metas">${metas.map(barraMeta).join('')}</ul>` : `<div class="md">${md(s.texto, s.path, true)}</div>`}</section>`;
    }).join('') + (hab.length ? `<section class="area-card"><h3>Esta semana</h3><p class="semana-hab"><b>${feitos} de ${hab.length}</b> blocos e hábitos feitos (${Math.round(feitos / hab.length * 100)}%)</p>
      <ul class="dia-linhas">${hab.sort((a, b) => a.date.localeCompare(b.date)).map(x => `<li class="dia-linha"><span class="dia-st">${x.st === 'feito' ? '✅' : x.st === 'nao' ? '❌' : '🚫'}</span><span>${h(x.oque)} <small>${dayLabel(x.date)}${x.motivo && !/^[—–-]$/.test(x.motivo.trim()) ? ' · ' + h(x.motivo) : ''}</small></span></li>`).join('')}</ul></section>` : '');
  }
  if (id === 'tarefas') {
    const G = C.tarefas, todos = () => true, exp = new Set(LS.get(K + 'area-tarefas', []));
    const html = grupoTarefas('Atrasadas e de hoje', [...G.atrasadas, ...G.hoje], 'area-hoje', exp, todos)
      + grupoTarefas('Próximas', G.proximas, 'area-proximas', exp, todos)
      + grupoTarefas('Sem prazo', G.semdata, 'area-semdata', exp, todos)
      + grupoTarefas('Feitas por último', G.feitas.slice(0, 8), 'area-feitas', exp, todos);
    return html ? `<div class="area-tarefas">${html}</div>` : vazioTopico('tarefas', area);
  }
  if (id === 'pessoas') {
    if (!T.n.pessoas) return vazioTopico('pessoas', area);
    const caso = f => { const open = S.tasks.filter(g => !isChecked(g) && g.members.some(m => m.path === f.path)); return `<button class="case" data-open="${h(f.path)}"><div class="hd"><span class="ct">${h(plain(f.title))}</span><span class="st">${h(f.meta.status || '')}</span></div><p class="rs">${h(plain(f.meta.resumo || ''))}</p><div class="ft">${open.length ? `<span>${open.length} ${open.length > 1 ? 'tarefas' : 'tarefa'}</span>` : ''}<span>${relDay(f.meta.atualizado)}</span></div></button>`; };
    return `${C.casos.length ? `<section class="area-card"><h3>Casos</h3><div class="cases area-cases">${C.casos.map(caso).join('')}</div></section>` : ''}
      ${T.pessoas.length ? `<section class="area-card"><h3>Pessoas</h3><ul class="pessoas-lista">${T.pessoas.map(f => `<li><button type="button" data-open="${h(f.path)}"><b>${h(plain(f.title))}</b><span>${h(short(plain(f.meta.resumo || ''), 120))}</span></button></li>`).join('')}</ul></section>` : ''}`;
  }
  if (id === 'dias') {
    if (!C.dias.length) return vazioTopico('dias', area);
    return `<ol class="dias-lista">${C.dias.map(d => { const ls = linhasDoDia(d); return `<li><a href="#area/${area}/dia/${d.date}"><span class="dl-data"><b>${dayLabel(d.date)}</b><small>${d.date.slice(0, 4)}</small></span><span class="dl-txt">${ls.slice(0, 3).map(l => `<span>${h(short(l, 120))}</span>`).join('')}${ls.length > 3 ? `<small>+${ls.length - 3}</small>` : ''}</span><span aria-hidden="true">›</span></a></li>`; }).join('')}</ol>`;
  }
  if (id === 'dia') {
    const i = C.dias.findIndex(d => d.date === vista.dia);
    const dia = C.dias[i];
    const novo = C.dias[i - 1], velho = i >= 0 ? C.dias[i + 1] : C.dias.find(d => d.date < vista.dia);
    const nav = `<nav class="dia-nav" aria-label="Outros dias">${velho ? `<a href="#area/${area}/dia/${velho.date}">← ${dayLabel(velho.date)}</a>` : '<span></span>'}${novo ? `<a href="#area/${area}/dia/${novo.date}">${dayLabel(novo.date)} →</a>` : ''}</nav>`;
    return `${dia ? blocoDoDia(dia) : `<div class="area-card topico-vazio"><p>Nada registrado nesta área em ${dm(vista.dia)}.</p></div>`}${nav}`;
  }
  if (id === 'agenda') {
    if (!T.n.agenda) return vazioTopico('agenda', area);
    const ordemDow = [1, 2, 3, 4, 5, 6, 0];
    const quando = x => x.days.mday ? `Dia ${x.days.mday}` : ordemDow.filter(d => x.days.dows.has(d)).map(d => DOW[d]).join(', ');
    const hora = e => e.allDay ? 'dia inteiro' : `${e.start}–${e.end}`;
    return `${T.compromissos.length ? `<section class="area-card"><h3>Próximos compromissos</h3><ul class="dia-linhas">${T.compromissos.slice(0, 20).map(e => `<li class="dia-linha"><span class="dia-st dia-data">${dm(e.date)}</span><span>${inline(e.name)}<small>${DOW[pymd(e.date).getDay()]} · ${hora(e)}${e.obs ? ' · ' + h(short(plain(e.obs), 90)) : ''}</small></span></li>`).join('')}</ul></section>` : ''}
      ${T.fixos.length ? `<section class="area-card"><h3>Blocos fixos da semana</h3><ul class="dia-linhas">${T.fixos.map(x => `<li class="dia-linha"><span class="dia-st dia-data">${h(quando(x))}</span><span>${inline(x.name)}<small>${hora(x)}${x.from && x.from > C.hoje ? ' · a partir de ' + dm(x.from) : ''}</small></span></li>`).join('')}</ul></section>` : ''}
      <p class="area-nota">Espelho da agenda (<button type="button" class="secao-fonte" data-open="agenda.md">agenda.md ↗</button>). O Google Agenda manda.</p>`;
  }
  if (id === 'esperando') {
    const secs = T.secoes('esperando');
    if (!T.n.esperando) return vazioTopico('esperando', area);
    return `${T.esperando.length ? `<section class="area-card"><h3>Esperando alguém</h3><ul class="tasks">${T.esperando.map(taskLi).join('')}</ul></section>` : ''}${secs.map(cartaoSecao).join('')}`;
  }
  if (id === 'custos') {
    if (area === 'financas') return `<a class="area-card fin-atalho" href="#financas"><b>💰 Abrir Finanças</b><span>Orçamento por categoria, extrato e cartões →</span></a>`;
    const regra = CUSTOS_DA_AREA[area];
    if (!regra) return `<div class="area-card topico-vazio"><p>Nenhuma categoria da planilha está ligada a ${h(AREAS[area].nome)}.</p></div>`;
    if (!T.temFin) return `<div class="area-card topico-vazio"><p>Os gastos agora ficam no Minhas Economias. Veja em <a href="#financas">Finanças</a>.</p></div>`;
    const { itens, total } = T.custos;
    return `<section class="area-card"><div class="area-card-head"><h3>${MESES[+C.hoje.slice(5, 7) - 1]} até agora</h3><a class="area-link" href="#financas">Finanças →</a></div>
      <p class="custo-total">${V(total)} <small>em ${itens.length} ${itens.length === 1 ? 'gasto' : 'gastos'} · mês passado ${V(T.custosAntes.total)}</small></p>
      ${itens.length ? `<ul class="dia-linhas">${itens.slice(0, 20).map(d => `<li class="dia-linha"><span class="dia-st dia-data">${dm(d.data)}</span><span>${h(d.descricao || d.categoria)}<small>${h(d.categoria)} · ${V(d.valor)}</small></span></li>`).join('')}</ul>` : ''}
      <p class="area-nota">Conta as categorias ${regra.categorias.map(c => `<b>${h(c)}</b>`).join(', ')}${regra.descricao ? ' (só o que é desta área pela descrição)' : ''}.</p></section>`;
  }
  // tópicos montados a partir das seções das notas
  const secs = T.secoes(id);
  let extra = '';
  if (id === 'materiais' && T.links.length) {
    extra = `<section class="area-card secao-card"><header class="secao-h"><h3>Links citados nas notas</h3><small class="secao-nota">${T.links.length}</small></header><ul class="dia-linhas">${T.links.slice(0, 40).map(l => `<li class="dia-linha"><span class="dia-st" aria-hidden="true">↗</span><span><a href="${h(l.url)}" target="_blank" rel="noopener noreferrer">${h(l.titulo || l.url.replace(/^https?:\/\/(www\.)?/, '').slice(0, 60))}</a><small>${h(short(plain(l.contexto.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/https?:\/\/\S+/g, '').trim() || l.fonte), 120))} · ${h(plain(l.fonte))}</small></span></li>`).join('')}</ul></section>`;
  }
  if (id === 'decisoes' && T.decisoesFora.length) {
    extra = `<section class="area-card secao-card"><header class="secao-h"><h3>Decisões registradas</h3><button type="button" class="secao-fonte" data-open="eu/decisoes.md">todas <span aria-hidden="true">↗</span></button></header><ul class="dia-linhas">${T.decisoesFora.sort((a, b) => b.date.localeCompare(a.date)).map(e => `<li class="dia-linha"><span class="dia-st dia-data">${dm(e.date)}</span><span>${inline(e.campos.find(([k]) => /^decis/.test(norm(k)))?.[1] || '')}${(() => { const p = e.campos.find(([k]) => /^por que/.test(norm(k))); return p ? ` <small>Por quê: ${inline(p[1])}</small>` : ''; })()}</span></li>`).join('')}</ul></section>`;
  }
  if (id === 'numeros' && T.docs.length) {
    extra = `<section class="area-card secao-card"><header class="secao-h"><h3>Documentos registrados</h3><button type="button" class="secao-fonte" data-open="documentos/documentos.md">todos <span aria-hidden="true">↗</span></button></header><ul class="dia-linhas">${T.docs.sort((a, b) => b.date.localeCompare(a.date)).map(e => { const get = re => e.campos.find(([k]) => re.test(norm(k)))?.[1] || ''; const num = get(/^numero/), onde = get(/^onde/), caso = get(/^caso/); return `<li class="dia-linha"><span class="dia-st dia-data">${dm(e.date)}</span><span>${inline(get(/^documento/))}${num && !/^[—–-]/.test(num) ? ` <small>Nº ${inline(num)}</small>` : ''}${caso ? ` <small>${inline(caso)}</small>` : ''}${onde && !/^[—–-]$/.test(onde) ? ` <small>${inline(onde)}</small>` : ''}</span></li>`; }).join('')}</ul></section>`;
  }
  if (id === 'padroes' && T.padroes.lista.length) {
    const P = T.padroes;
    extra = `<section class="area-card secao-card"><header class="secao-h"><h3>Calculado dos seus ✅ e ❌</h3><small class="secao-nota">desde ${dm(P.desde)}</small></header>
      <ul class="padroes">${P.lista.map(r => { const tot = r.feito + r.nao; return `<li><div class="pd-t"><b>${h(maiuscula(r.nome))}</b><span>${r.feito} de ${tot} feitos${r.cancelado ? ` · ${r.cancelado} cancelado${r.cancelado > 1 ? 's' : ''}` : ''}</span></div>${tot ? `<div class="meta-barra"><i style="width:${Math.round(r.feito / tot * 100)}%"></i></div>` : ''}${r.motivos.length ? `<p class="pd-m">Motivos das faltas: ${r.motivos.slice(-3).map(m => `${dm(m.date)} ${h(semTraco(m.motivo))}`).join(' · ')}</p>` : ''}</li>`; }).join('')}</ul>
      ${P.diaQueMaisFalha !== null ? `<p class="pd-dia">Dia que mais falha: <b>${DOWL[P.diaQueMaisFalha]}</b></p>` : ''}</section>`;
  }
  if (!secs.length && !extra) return vazioTopico(id, area);
  return extra + secs.map(cartaoSecao).join('');
}

/* ─────────────── leitura de nota: o mesmo layout pra toda nota ─────────────── */
function tipoDaNota(f) {
  const p = f.path;
  if (p.startsWith('casos/')) return '📂 Caso';
  if (p.startsWith('pessoas/')) return '👤 Pessoa';
  if (/^areas\/([^/]+)\/\1\.md$/.test(p)) return '📌 Nota principal';
  if (ehRegistroDoMes(p) || /\/(journal|treinos)-\d{4}-\d{2}\.md$/.test(p)) return '📅 Registros do mês';
  if (p.startsWith('areas/')) return '📄 Nota da área';
  if (p.startsWith('diario/')) return '📓 Diário';
  if (p.startsWith('documentos/')) return '🔢 Documentos';
  if (p === 'agenda.md') return '🗓️ Agenda';
  if (p === 'tarefas.md') return '✅ Tarefas';
  if (p.startsWith('eu/')) return '🙋 Sobre você';
  if (p.startsWith('painel/')) return '📲 Painel';
  return '📄 Nota';
}
/* Seções do assunto ficam abertas; histórico e dias antigos começam fechados (abre com um toque). */
const SECAO_FECHADA = /^(linha do tempo|historico|descartad|arquivad|antig)/;
function leituraDaNota(f) {
  const secoes = secoesDeLeitura(f.body);
  const intro = secoes[0]?.intro ? secoes.shift() : null;
  const datas = secoes.map(s => (s.title.match(/^(\d{4}-\d{2}-\d{2})/) || [])[1]).filter(Boolean).sort();
  const aberta = s => { const d = (s.title.match(/^(\d{4}-\d{2}-\d{2})/) || [])[1]; return d ? d === datas.at(-1) : !SECAO_FECHADA.test(norm(plain(s.title))); };
  const date = String(f.meta.atualizado || '').slice(0, 10);
  const pessoas = [].concat(f.meta.pessoas || []).map(p => String(p).replace(/^\[\[|\]\]$/g, '').trim()).filter(Boolean);
  const chips = [tipoDaNota(f), AREAS[f.area] && !f.path.startsWith('areas/') ? `${AREAS[f.area].emoji} ${AREAS[f.area].nome}` : '']
    .filter(Boolean).map(c => `<span>${h(c)}</span>`).join('') + (f.meta.status ? `<span class="rn-status">${h(f.meta.status)}</span>` : '');
  const ghUrl = `https://github.com/${cfg.repo}/blob/${encodeURIComponent(cfg.branch || 'main')}/${repoPath(f.path)}`;
  const meta = [/^\d{4}-\d{2}-\d{2}$/.test(date) ? `<time datetime="${date}">Atualizada em ${dm(date)}/${date.slice(0, 4)}</time>` : '',
    pessoas.length ? `<span>👥 ${pessoas.map(p => wl(p)).join(', ')}</span>` : '',
    `<a href="${h(ghUrl)}" target="_blank" rel="noopener noreferrer">abrir no GitHub ↗</a>`].filter(Boolean).join('');
  return `<article class="reading-note">
    <header><div class="rn-topo"><p class="rn-chips">${chips}</p></div>
      <h2 tabindex="-1">${h(plain(f.title))}</h2>
      <p class="rn-meta">${meta}</p></header>
    ${f.meta.resumo ? `<section class="rn-resumo"><h3>📌 Resumo</h3><p>${inline(f.meta.resumo)}</p></section>` : ''}
    ${intro ? `<div class="md rn-intro">${md(intro.text, f.path, true)}</div>` : ''}
    ${secoes.map((s, i) => `<details class="reading-part" data-section="${i}"${aberta(s) ? ' open' : ''}>
      <summary>${h(plain(s.title))}</summary><div class="md">${md(s.text, f.path, true)}</div></details>`).join('')}
    ${!secoes.length && !intro && !f.meta.resumo ? '<p class="area-empty">Esta nota ainda está vazia.</p>' : ''}
    </article>`;
}
/* Nota reservada com o modo discreto ligado: pede um toque antes de mostrar. */
const notaVelada = (f, base) => cfg.discreet && (f.sens || VEIL.has(f.area) || f.path === CAIXA) && !S.reveal.has(f.path) && !(base && S.reveal.has(base));
const veuDaNota = f => `<div class="area-gate">${ICON.lock}<h2>Nota reservada</h2><p>Esta nota é de ${h(AREAS[f.area]?.nome || 'um assunto reservado')} e o modo discreto está ativo.</p><button class="btn" data-reveal="${h(f.path)}">Mostrar a nota</button></div>`;
const voltarDaNota = destino => `<a class="area-back nota-voltar" href="${destino}"${S.voltas > 1 ? ' data-voltar' : ''}><span aria-hidden="true">←</span> Voltar</a>`;

/* Página própria (`#nota/…`) para nota sem área, aberta fora de uma área: o mesmo layout, sem sumário. */
let lastNotaMarkup = '';
function renderNotaPage() {
  const el = $('#notaPage');
  if (!el) return;
  if (S.page !== 'nota') { if (el.childElementCount) el.replaceChildren(); lastNotaMarkup = ''; return; }
  const f = S.files[S.notaPath];
  const openDetails = new Map();
  const same = el.dataset.route === location.hash;
  if (same) for (const d of $$('details', el)) openDetails.set(d.dataset.section, d.open);
  el.dataset.route = location.hash;
  el.style.setProperty('--area-accent', areaColor(f?.area));
  const corpo = !f ? `<p class="area-card">${S.head ? 'Esta nota não foi encontrada.' : 'Carregando a nota…'}</p>` : notaVelada(f) ? veuDaNota(f) : leituraDaNota(f);
  const markup = `${voltarDaNota('#areas')}<div class="area-main nota-solta">${corpo}</div>`;
  if (same && markup === lastNotaMarkup) return;
  lastNotaMarkup = markup;
  el.innerHTML = markup;
  for (const node of $$('details', el)) if (openDetails.has(node.dataset.section)) node.open = openDetails.get(node.dataset.section);
}

let lastAreaMarkup = '';
function renderAreaPage() {
  const el = $('#areaPage'), route = S.areaRoute;
  if (S.page !== 'area' || !route) {
    if (el.childElementCount) el.replaceChildren();
    lastAreaMarkup = '';
    S.sumario = false;
    el.classList.remove('sumario-on');
    return;
  }
  const { area } = route;
  const label = AREAS[area].nome, base = `#area/${area}`;
  const gate = cfg.discreet && VEIL.has(area) && !S.reveal.has(base);
  const same = el.dataset.route === location.hash && el.dataset.locked === String(gate);
  const openDetails = new Map();
  const detailKey = d => d.dataset.section ?? d.querySelector(':scope > summary')?.textContent;
  if (same) for (const d of $$('details', el)) openDetails.set(detailKey(d), d.open);
  el.dataset.route = location.hash;
  el.dataset.locked = String(gate);
  el.style.setProperty('--area-accent', areaColor(area));
  const hide = cfg.discreet && S.reveal.has(base) ? `<button class="btn ghost" data-ocultar-area="${area}">Ocultar área</button>` : '';
  const head = `<a class="area-back" href="#areas"><span aria-hidden="true">←</span> Todas as áreas</a>
    <div class="area-heading"><h1 tabindex="-1">${label}</h1><div class="area-tools">${hide}</div></div>`;
  let markup;
  if (gate) {
    markup = head + `<div class="area-gate">${ICON.lock}<h2>Área reservada</h2><p>O modo discreto está ativo.</p><button class="btn" data-reveal-area="${area}">Mostrar esta área</button></div>`;
  } else {
    const C = contextoDaArea(area, base), T = topicosDaArea(C);
    let titulo = '', corpo;
    if (route.vista === 'nota') {
      const f = S.files[route.path];
      corpo = !f ? `<p class="area-card">${S.head ? 'Esta nota não foi encontrada.' : 'Carregando a nota…'}</p>` : notaVelada(f, base) ? veuDaNota(f) : leituraDaNota(f);
    } else {
      const t = TOPICOS.find(x => x.id === route.vista);
      titulo = `<h2 class="topico-titulo">${t ? `${t.emoji} ${t.nome}` : route.vista === 'dias' ? '📅 Registros diários' : `📅 ${diaLongo(route.dia)}`}</h2>`;
      corpo = S.head || Object.keys(S.files).length ? corpoDoTopico(C, T, route) : '<p class="area-card">Carregando suas notas…</p>';
    }
    markup = head + `<div class="area-shell"><div class="area-sumario-col">${sumarioDaArea(C, T, route)}</div>
      <div class="area-main">${route.vista === 'nota' ? voltarDaNota(base) : ''}${titulo}${corpo}</div></div>
      <button type="button" class="sumario-fab" data-sumario="abrir" aria-controls="areaSumario" aria-expanded="${S.sumario ? 'true' : 'false'}">${SUMARIO_ICON}<span>Sumário</span></button>
      <div class="sumario-scrim" data-sumario="fechar" aria-hidden="true"></div>`;
  }
  el.classList.toggle('sumario-on', !!S.sumario && !gate);
  if (same && markup === lastAreaMarkup) return;
  lastAreaMarkup = markup;
  const smScroll = $('.area-sumario-col', el)?.scrollTop || 0;
  el.innerHTML = markup;
  const smCol = $('.area-sumario-col', el);
  if (smCol) smCol.scrollTop = smScroll;
  for (const node of $$('details', el)) if (openDetails.has(detailKey(node))) node.open = openDetails.get(detailKey(node));
}
function sumario(abrir) {
  S.sumario = abrir;
  const el = $('#areaPage');
  el.classList.toggle('sumario-on', abrir);
  $('.sumario-fab', el)?.setAttribute('aria-expanded', String(abrir));
  if (abrir) requestAnimationFrame(() => ($('.sumario [aria-current="page"]', el) || $('.sm-fechar', el))?.focus({ preventScroll: false }));
  else $('.sumario-fab', el)?.focus({ preventScroll: true });
}

function renderCases() {
  const cs = casosEmAndamento(S.files);
  $('#casesCount').textContent = cs.length || '';
  $('#cases').innerHTML = cs.map(f => {
    const open = S.tasks.filter(g => !isChecked(g) && g.members.some(m => m.path === f.path));
    const nextDue = open.filter(g => g.due).sort(byDue)[0];
    return `<button class="case${cfg.discreet && (f.sens || VEIL.has(f.area)) ? ' reserved-case' : ''}" data-open="${h(f.path)}"><div class="hd"><span class="ct">${h(plain(f.title))}</span><span class="st">${h(f.meta.status || '')}</span></div><p class="rs">${h(plain(f.meta.resumo || ''))}</p><div class="ft">${nextDue ? `<span>${dueTxt(nextDue.due)}: ${h(short(plain(nextDue.text), 46))}</span>` : ''}${open.length ? `<span>${open.length} ${open.length > 1 ? 'tarefas' : 'tarefa'}</span>` : ''}<span>${relDay(f.meta.atualizado)}</span></div></button>`;
  }).join('') || '<p class="empty">Nenhum caso aberto.</p>';
}

/* ─────────────── abrir nota: sempre na página, com o mesmo layout ─────────────── */
function openNote(path) {
  if (!S.files[path]) return;
  if (S.open) closeNote();
  const alvo = linkDaNota(path, S.files[path].area, S.page === 'area' ? S.areaRoute?.area : null, AREA_ORDER);
  if (location.hash !== alvo) location.hash = alvo;
}
/* A gaveta ficou só para "o que entrou de novo" (um registro do assessor ou do painel). */
function closeNote() {
  S.open = null;
  const dr = $('#drawer'), sc = $('#scrim');
  dr.classList.remove('on'); sc.classList.remove('on');
  setTimeout(() => { if (!S.open) { dr.hidden = true; sc.hidden = true; $('#drBody').innerHTML = ''; } }, 260);
}
/* ─────────────── registro (commit) na gaveta ─────────────── */
const Commits = new Map();
function openCommit(sha) {
  S.open = '@' + sha;
  const dr = $('#drawer'), sc = $('#scrim');
  dr.hidden = false; sc.hidden = false;
  $('#drBody').innerHTML = '';
  renderDrawer();
  requestAnimationFrame(() => { dr.classList.add('on'); sc.classList.add('on'); $('#drClose').focus(); });
  if (!Commits.has(sha)) {
    Commits.set(sha, null);
    gh(`/repos/${cfg.repo}/commits/${sha}`).then(r => {
      if (!r.ok) throw erro('http', 'commit ' + r.status);
      Commits.set(sha, { msg: r.json.commit.message, files: (r.json.files || []).map(f => ({ path: f.filename, status: f.status, patch: f.patch })) });
    }).catch(e => { Commits.set(sha, { err: e }); }).finally(() => { if (S.open === '@' + sha) renderDrawer(); });
  }
}
function cmLines(patch) {
  const add = [], del = [];
  for (const l of String(patch || '').split('\n')) {
    if (/^\+\+\+|^---/.test(l)) continue;
    if (l[0] === '+') add.push(l.slice(1)); else if (l[0] === '-') del.push(l.slice(1));
  }
  const skip = x => !x.trim() || /^\s*atualizado:/.test(x) || /^---\s*$/.test(x);
  return { add: add.filter(x => !skip(x)), del: del.filter(x => !skip(x)) };
}
function cmBlock(lines, path) {
  const runs = [];
  for (const l of lines) {
    const k = l.trim().startsWith('|') ? 'tb' : /^[a-z_]+:\s/.test(l) && !/^https?:/.test(l) ? 'fm' : 'md';
    if (runs.length && runs[runs.length - 1].k === k) runs[runs.length - 1].ls.push(l); else runs.push({ k, ls: [l] });
  }
  return runs.map(r => {
    if (r.k === 'tb') { const rows = r.ls.filter(l => !isSep(l)).map(cells); return `<div class="tbl"><table><tbody>${rows.map(rw => `<tr>${rw.map(c => `<td${c.length <= 24 && !/\s\S+\s\S+\s/.test(c) ? ' class="nw"' : ''}>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`; }
    if (r.k === 'fm') return r.ls.map(l => { const m = l.match(/^([a-z_]+):\s*(.*)$/i); return `<p class="fmk"><b>${h(m[1])}</b>: ${inline(m[2].replace(/^["']|["']$/g, ''))}</p>`; }).join('');
    return md(r.ls.join('\n'), path);
  }).join('');
}
function renderCommit() {
  const sha = S.open.slice(1), it = (S.feedIdx || {})[sha], c = Commits.get(sha);
  $('#drTitle').textContent = it ? it.label : 'Registro';
  const ghUrl = `https://github.com/${cfg.repo}/commit/${sha}`;
  $('#drPath').innerHTML = `${it && it.date ? `<span>${h(whenTxt(it.date))}</span>` : ''}<span>${it && it.via ? 'pelo painel' : 'pelo assessor'}</span><a href="${h(ghUrl)}" target="_blank" rel="noopener noreferrer">ver no GitHub</a>`;
  const body = $('#drBody');
  if (!c) { body.innerHTML = '<p class="empty" style="padding:30px 0">Carregando o que foi registrado…</p>'; return; }
  if (c.err) { body.innerHTML = `<p class="empty" style="padding:30px 0">Não consegui abrir este registro agora${c.err.code === 'offline' ? ' (sem conexão)' : ''}.</p>`; Commits.delete(sha); return; }
  const files = c.files.filter(f => incluir(f.path) && f.status !== 'removed');
  const sub = c.msg.split('\n')[0].replace(/\s*\[(agenda|planilha|drive|tarefas?|ticktick)\]/g, '').trim();
  let html = `<div class="fm"><span class="rsm">${h(it ? it.txt : sub)}</span></div>`;
  if (!files.length) html += '<p class="empty">Este registro não mexeu em nenhuma nota.</p>';
  for (const f of files) {
    const nf = S.files[f.path], title = nf ? plain(nf.title) : f.path.split('/').pop().replace(/\.md$/, '');
    const open = nf ? `<button class="btn" data-open="${h(f.path)}">Abrir a nota</button>` : '';
    html += `<section class="cm-f"><div class="cm-h"><h3>${h(title)}<span class="rp">${h(f.path)}${f.status === 'added' ? ' · nota nova' : ''}</span></h3>${open}</div>`;
    if ((nf?.sens || VEIL.has(nf?.area) || [CAIXA, RESERVADA].includes(f.path)) && cfg.discreet && !S.reveal.has(f.path)) { html += `<div class="gate" style="padding:18px 0">${ICON.lock.replace('<svg', '<svg style="width:22px;height:22px;color:var(--ink3)"')}<p>Conteúdo de ${h(AREAS[nf?.area]?.nome || 'um assunto reservado')}.</p><button class="btn" data-reveal="${h(f.path)}">Mostrar</button></div></section>`; continue; }
    if (!f.patch) { html += '<p class="muted">Mudança grande demais pra mostrar aqui. Abra a nota.</p></section>'; continue; }
    const { add, del } = cmLines(f.patch);
    if (add.length) html += `<div class="cm-add md">${cmBlock(add, f.path)}</div>`;
    else html += '<p class="muted">Só tirou coisas desta nota.</p>';
    if (del.length) html += `<details class="cm-old"><summary>O que saiu ou foi trocado (${del.length})</summary><div class="md">${cmBlock(del.map(l => l.replace(/^(\s*)- \[([ xX])\] /, (_, sp, x) => sp + '- ' + (x === ' ' ? '☐ ' : '☑ '))), null)}</div></details>`;
    html += '</section>';
  }
  const scroll = body.scrollTop;
  body.innerHTML = html;
  body.scrollTop = scroll;
}
function renderDrawer() {
  if (S.open && S.open.startsWith('@')) renderCommit();
  else if (S.open) closeNote();
}

/* ─────────────── busca ─────────────── */
let findSel = 0, findList = [];
function openFind() { $('#find').hidden = false; $('#findIn').value = ''; doFind(); $('#findIn').focus(); }
function closeFind() { $('#find').hidden = true; }
function doFind() {
  const q = norm($('#findIn').value).trim();
  const terms = q.split(/\s+/).filter(Boolean);
  let res;
  if (!terms.length) {
    res = Object.values(S.files).filter(f => f.meta.atualizado && !f.path.startsWith('painel/')).sort((a, b) => b.meta.atualizado.localeCompare(a.meta.atualizado)).slice(0, 8).map(f => ({ f, sn: plain(f.meta.resumo || '') }));
  } else {
    res = [];
    for (const f of Object.values(S.files)) {
      const nt = norm(f.title), nm = norm([f.meta.resumo, ...(Array.isArray(f.meta.tags) ? f.meta.tags : [f.meta.tags || ''])].join(' '));
      f._n = f._n || f.body.split('\n').map(l => [l, norm(l)]);
      if (!terms.every(t => nt.includes(t) || nm.includes(t) || f._n.some(x => x[1].includes(t)))) continue;
      let sc = 0, best = null, bestN = 0;
      for (const t of terms) { if (nt.includes(t)) sc += 10; if (nm.includes(t)) sc += 4; }
      for (const [l, nl] of f._n) { const c = terms.filter(t => nl.includes(t)).length; if (c) { sc += c; if (c > bestN && l.trim() && !/^#/.test(l)) { bestN = c; best = l; } } }
      res.push({ f, sc, sn: plain(best || f.meta.resumo || '') });
    }
    res.sort((a, b) => b.sc - a.sc);
    res = res.slice(0, 20);
  }
  findList = res; findSel = 0;
  const termosVisiveis = [...new Set(terms.map(textoDaBusca))].filter(t => t.length > 1).sort((a, b) => b.length - a.length);
  const re = termosVisiveis.length ? new RegExp(termosVisiveis.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'g') : null;
  const mark = s => {
    if (!re) return h(s);
    let html = '', fim = 0;
    for (const match of norm(s).matchAll(re)) {
      html += h(s.slice(fim, match.index)) + '<mark>' + h(s.slice(match.index, match.index + match[0].length)) + '</mark>';
      fim = match.index + match[0].length;
    }
    return html + h(s.slice(fim));
  };
  $('#findRes').innerHTML = res.length ? res.map((r, i) => {
    const f = r.f, reservado = cfg.discreet && (f.sens || VEIL.has(f.area) || f.path === CAIXA);
    const titulo = textoDaBusca(plain(f.title)).replace(/ — registros de /i, ' · ');
    const rotulo = AREAS[f.area]?.nome || tipoDaNota(f).replace(/^\S+ /, '');
    const trecho = reservado ? 'Conteúdo reservado' : mark(short(textoDaBusca(r.sn), 220));
    return `<li><button role="option" aria-selected="${i === 0}" data-find="${i}"><span class="rt">${h(titulo)}</span>${rotulo !== titulo ? `<span class="rp">${h(rotulo)}</span>` : ''}<div class="sn">${trecho}</div></button></li>`;
  }).join('') : `<li class="empty" style="padding:14px 12px">Nada encontrado com “${h($('#findIn').value)}”.</li>`;
}
function moveFind(d) {
  if (!findList.length) return;
  findSel = (findSel + d + findList.length) % findList.length;
  $$('#findRes button').forEach((b, i) => b.setAttribute('aria-selected', String(i === findSel)));
  $$('#findRes button')[findSel]?.scrollIntoView({ block: 'nearest' });
}

/* ─────────────── ajustes e entrada ─────────────── */
const MARK = '<svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="11" fill="none" stroke="var(--line)" stroke-width="3"/><path d="M16 5a11 11 0 0 1 9.5 16.5" fill="none" stroke="var(--ink)" stroke-width="3" stroke-linecap="round"/><circle cx="25.5" cy="21.5" r="3.4" fill="var(--signal)"/></svg>';
function showSetup(msg) {
  $('#app').hidden = true; if (S.open) { S.open = null; $('#drawer').hidden = true; $('#scrim').hidden = true; } $('#cfg').hidden = true;
  const s = $('#setup');
  s.hidden = false;
  s.innerHTML = `<div class="box"><div class="mark">${MARK}</div><form class="form" id="setupForm" autocomplete="off">
    <h1>Meu Assessor</h1><h2>Conectar minha memória</h2>
    <p class="hint" style="font-size:14px">Conecte seu repositório privado para ver a agenda, encontrar suas notas e registrar gastos. O token fica neste aparelho.</p>
    <details class="access-guide"><summary>Como criar o token de acesso</summary><ol>
      <li>Abra <a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener noreferrer">github.com/settings/personal-access-tokens/new</a>.</li>
      <li>Em <b>Repository access</b>, escolha <b>Only select repositories</b> e marque o repositório do assessor.</li>
      <li>Em <b>Permissions → Repository permissions</b>, mude <b>Contents</b> para <b>Read and write</b>.</li>
      <li>Clique em <b>Generate token</b>, copie e cole aqui embaixo.</li>
    </ol></details>
    <label for="sRepo">Repositório</label><input id="sRepo" value="${h(cfg.repo)}" spellcheck="false" autocapitalize="off">
    <label for="sTok">Token</label><input id="sTok" type="password" placeholder="github_pat_…" spellcheck="false" autocapitalize="off">
    ${msg ? `<p class="err">${h(msg)}</p>` : ''}<p class="err" id="sErr"></p>
    <div class="row"><button class="btn big" type="submit">Conectar</button></div>
  </form></div>`;
  $('#setupForm').onsubmit = async ev => {
    ev.preventDefault();
    const repo = $('#sRepo').value.trim().replace(/^https?:\/\/github\.com\//, '').replace(/\.git$|\/$/g, '');
    const tok = $('#sTok').value.trim();
    if (!/^[\w.-]+\/[\w.-]+$/.test(repo)) { $('#sErr').textContent = 'Escreva o repositório como usuario/nome.'; return; }
    if (!tok) { $('#sErr').textContent = 'Cole o token.'; return; }
    const prevTok = cfg.token, prevRepo = cfg.repo;
    cfg.token = tok; cfg.repo = repo; cfg.branch = '';
    $('#sErr').textContent = 'Conferindo…';
    try {
      const r = await gh(`/repos/${repo}`);
      if (r.status === 404) throw erro('notfound');
      if (!r.ok) throw erro('http', String(r.status));
      cfg.branch = r.json.default_branch || 'main';
      if (prevRepo !== repo) { S.files = {}; S.head = null; S.commits = []; }
      saveCfg(); start();
    } catch (e) {
      cfg.token = prevTok; cfg.repo = prevRepo;
      $('#sErr').textContent = e.code === 'token' ? 'O GitHub recusou esse token. Confira se copiou inteiro.' : e.code === 'notfound' ? 'Esse token não enxerga o repositório. Confira o nome e o acesso do token.' : e.code === 'offline' ? 'Sem conexão com o GitHub agora. Confira a internet e tente de novo.' : 'O GitHub respondeu com erro (' + e.message + ').';
    }
  };
  $('#sTok')?.focus({ preventScroll:true });
}
function showCfg() {
  const o = $('#cfg');
  o.hidden = false;
  o.innerHTML = `<div class="box settings-box" role="dialog" aria-modal="true" aria-labelledby="settingsTitle"><form class="form" id="cfgForm">
    <header><h2 id="settingsTitle">Ajustes</h2><button class="ib" type="button" id="cClose" aria-label="Fechar ajustes">${ICON.x}</button></header>
    <label for="cTheme">Aparência</label><select id="cTheme"><option value="auto"${cfg.theme === 'auto' ? ' selected' : ''}>Igual ao aparelho</option><option value="light"${cfg.theme === 'light' ? ' selected' : ''}>Clara</option><option value="dark"${cfg.theme === 'dark' ? ' selected' : ''}>Escura</option></select>
    <label for="cInt">Intervalo de sincronização</label><select id="cInt">${[10,15,30,60].map(s => `<option value="${s}"${cfg.interval === s ? ' selected' : ''}>${s} segundos</option>`).join('')}</select>
    <details class="capture-extra"><summary>Conexão com o GitHub</summary><label for="cRepo">Repositório conectado</label><input id="cRepo" value="${h(cfg.repo)}" disabled>
      <p class="hint">Token terminado em ${h(cfg.token.slice(-4))}.</p><button class="btn ghost signout" type="button" id="cOut">Desconectar deste aparelho</button></details>
    <div class="form-foot"><button class="btn" type="submit">Salvar ajustes</button></div>
  </form></div>`;
  $('#cfgForm').onsubmit = ev => { ev.preventDefault(); cfg.interval = +$('#cInt').value; cfg.theme = $('#cTheme').value; saveCfg(); applyTheme(); o.hidden = true; };
  $('#cClose').onclick = () => { o.hidden = true; };
  $('#cOut').onclick = () => {
    cfg.token = ''; cfg.branch = ''; saveCfg();
    Blobs.clear(); LS.del(K + 'snap'); capturePanes.clear(); $('#regBody').replaceChildren();
    S.files = {}; S.head = null; S.commits = []; S.etag = null;
    o.hidden = true; showSetup();
  };
  o.onclick = ev => { if (ev.target === o) o.hidden = true; };
  $('#cTheme').focus();
}
function applyTheme() {
  const t = cfg.theme === 'auto' ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : cfg.theme;
  document.documentElement.dataset.theme = t;
  $('meta[name="theme-color"]').content = t === 'dark' ? '#17191D' : '#E8EBEF';
}

/* ─────────────── avisos e indicador ─────────────── */
function toast(msg, { err = false, open, html = false } = {}) {
  const el = document.createElement('div');
  el.className = 'toast' + (err ? ' err' : '');
  el.innerHTML = `<span class="tm">${html ? msg : h(msg)}</span>${open ? '<button data-t="open">Ver</button>' : ''}`;
  const kill = () => { el.style.opacity = '0'; el.style.transition = 'opacity .2s'; setTimeout(() => el.remove(), 200); };
  el.addEventListener('click', ev => { if (ev.target.dataset.t === 'open') { openNote(open); kill(); } });
  $('#toasts').appendChild(el);
  while ($('#toasts').children.length > 3) $('#toasts').firstChild.remove();
  setTimeout(kill, err ? 7000 : 4000);
}
function announce(prev, changed) {
  const ext = [];
  for (const c of S.commits) { if (c.sha === prev) break; if (!S.ours.has(c.sha)) ext.push(c); }
  if (!ext.length) return;
  const it = ext.map(feedItem).filter(Boolean);
  const first = changed.find(p => S.files[p] && !S.files[p].sens && !p.startsWith('painel/'));
  if (it.length) toast(`<b>${h(it[0].label)}</b><small>${h(it[0].txt)}${it.length > 1 ? ` (e mais ${it.length - 1})` : ''}</small>`, { html: true, open: first });
  const secs = new Set();
  for (const p of changed) {
    if (p.startsWith('casos/')) secs.add('#secCases');
    if (p.startsWith('areas/')) secs.add('#secAreas');
    if (p === 'agenda.md') secs.add('#wAgenda');
    if (p === 'eu/habitos.md') secs.add('#secRhythm');
  }
  for (const s of secs) { const el = $(s); if (!el || el.closest('.page')?.hidden) continue; el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash'); }
}
function setLive() {
  const el = $('#live'), tx = $('#liveTxt');
  if (!el) return;
  let cls = '', t = '';
  if (S.pending) { cls = 'saving'; t = 'guardando…'; }
  else if (S.err === 'offline') { cls = 'err'; t = 'sem conexão'; }
  else if (S.err === 'rate') { cls = 'err'; t = `limite do GitHub até ${hm(new Date(S.rateReset || Date.now() + 6e5))}`; }
  else if (S.err) { cls = 'err'; t = 'erro ao ler o GitHub'; }
  else if (!S.lastSync) { cls = 'idle'; t = 'conectando'; }
  else { const s = Math.round((Date.now() - S.lastSync) / 1000); t = `<b>ao vivo</b><span class="ago">${s < 5 ? '' : ` · há ${s < 60 ? s + ' s' : Math.round(s / 60) + ' min'}`}</span>`; }
  el.className = 'live ' + cls;
  tx.innerHTML = t;
  el.title = S.head ? `Último commit lido: ${S.head.slice(0, 7)}` : '';
}

const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
/* ─────────────── Início: o dia num olhar (agenda, tarefas e dinheiro vêm do espelho) ─────────────── */
const sensIt = it => SENS.has(it.area) || /🧠|🩺|psic[oó]|psiq|terap/i.test(it.name);
const maiusc = s => String(s || '').charAt(0).toUpperCase() + String(s || '').slice(1);
const safeUrl = u => (/^https:\/\/[^\s"'<>]+$/.test(String(u || '')) ? String(u) : '');
function quandoEspelho() {
  const t = Date.parse(S.fin?.atualizado || '');
  if (!Number.isFinite(t)) return '';
  const d = new Date(t), dia = ymd(d);
  return dia === ymd(now()) ? `hoje às ${hm(d)}` : dia === ymd(addDays(now(), -1)) ? `ontem às ${hm(d)}` : `em ${dm(dia)} às ${hm(d)}`;
}
function fonteTxt(app) {
  const q = quandoEspelho(), idade = idadeDoEspelho(S.fin, now());
  const velho = idade != null && idade > 12 * 60;
  return `Do ${APPS[app].nome}${q ? `, atualizado ${q}` : ''}${velho ? ' · <b class="es-velho">pode estar desatualizado</b>' : ''}`;
}
const abrirApp = app => `<a class="btn es-app" href="${APPS[app].url}" target="_blank" rel="noopener noreferrer">Abrir ${APPS[app].nome} <span aria-hidden="true">↗</span></a>`;
const semEspelho = app => `<div class="es-vazio"><p>O assessor ainda não puxou os dados do ${APPS[app].nome}. Peça a ele: <b>“atualiza o painel”</b>.</p>${abrirApp(app)}</div>`;
const cabecaCard = (titulo, app) => `<header class="hj-section-head"><div><h2>${titulo}</h2><p>${fonteTxt(app)}</p></div>
  <a href="${APPS[app].url}" target="_blank" rel="noopener noreferrer">Abrir <span aria-hidden="true">↗</span></a></header>`;
function wAgenda() {
  const n = now(), hoje = ymd(n), minuto = n.getHours() * 60 + n.getMinutes();
  if (!S.fin) return `<section id="wAgenda" class="hj-card hj-agenda">${cabecaCard('Agenda', 'agenda')}${semEspelho('agenda')}</section>`;
  const dias = agendaPorDia(S.fin, hoje, 7);
  const linha = (it, dia) => {
    const privado = cfg.discreet && (VEIL.has(it.area) || sensIt({ area: it.area, name: it.titulo }));
    const quando = momento(it, dia, hoje, minuto), link = privado ? '' : safeUrl(it.link);
    const miolo = `<span class="hj-time">${it.diaTodo ? 'Dia todo' : h(it.inicio)}${!it.diaTodo && it.fim ? `<small>${h(it.fim)}</small>` : ''}</span>
      <span class="hj-event-name">${h(privado ? 'Compromisso reservado' : it.titulo)}${quando === 'agora' ? '<small>Agora</small>' : ''}</span>`;
    return `<li class="hj-event es-ev ${quando}" style="--c:${privado ? 'var(--ink3)' : areaColor(it.area)}">${link
      ? `<a href="${h(link)}" target="_blank" rel="noopener noreferrer">${miolo}</a>` : `<div>${miolo}</div>`}</li>`;
  };
  const bloco = (titulo, d) => `<h3 class="hj-day-heading">${titulo}</h3>${d.itens.length
    ? `<ol class="hj-events">${d.itens.map(it => linha(it, d.dia)).join('')}</ol>` : '<p class="hj-empty">Nada na agenda.</p>'}`;
  const [d0, d1, ...resto] = dias, outros = resto.filter(d => d.itens.length);
  const total = outros.reduce((s, d) => s + d.itens.length, 0);
  return `<section id="wAgenda" class="hj-card hj-agenda">${cabecaCard('Agenda', 'agenda')}
    ${bloco(`Hoje, ${dm(hoje)}`, d0)}${bloco(`Amanhã, ${dm(d1.dia)}`, d1)}
    ${outros.length ? `<details class="hj-fold" data-home-fold="semana"><summary>Resto da semana (${total})</summary>
      ${outros.map(d => bloco(`${maiusc(DOWL[pymd(d.dia).getDay()])}, ${dm(d.dia)}`, d)).join('')}</details>` : ''}
  </section>`;
}
function tarefaLi(t, hoje) {
  const quando = !t.prazo ? 'Sem prazo' : t.prazo < hoje ? `Atrasada desde ${dm(t.prazo)}`
    : t.prazo === hoje ? (t.hora ? `Hoje, ${t.hora}` : 'Hoje') : `${dayLabel(t.prazo)}${t.hora ? ', ' + t.hora : ''}`;
  const meta = [quando, t.prioridade === 'alta' ? 'Prioridade alta' : '', t.lista || ''].filter(Boolean).join(' · ');
  const link = safeUrl(t.link);
  const miolo = `<span class="es-nome">${h(t.titulo)}<small>${h(meta)}</small></span>${link ? '<span class="es-abrir" aria-hidden="true">↗</span>' : ''}`;
  return `<li class="${t.prazo && t.prazo < hoje ? 'atrasada' : ''}" style="--c:${areaColor(t.area)}">${link
    ? `<a class="es-item" href="${h(link)}" target="_blank" rel="noopener noreferrer">${miolo}</a>` : `<div class="es-item">${miolo}</div>`}</li>`;
}
const tarefaVisivel = t => !cfg.discreet || S.reveal.has('#tarefas') || !VEIL.has(t.area);
function wTarefas() {
  const hoje = ymd(now());
  if (!S.fin) return `<section id="wTarefas" class="hj-card hj-prioridades">${cabecaCard('Tarefas', 'tarefas')}${semEspelho('tarefas')}</section>`;
  const G = tarefasEmGrupos(S.fin, hoje);
  const todas = [...G.atrasadas, ...G.hoje], agora = todas.filter(tarefaVisivel);
  const prox = G.semana.filter(tarefaVisivel)[0];
  const vazio = prox ? `<p class="hj-empty">Nada atrasado nem pra hoje. Próxima: <strong>${h(short(prox.titulo, 70))}</strong> · ${dayLabel(prox.prazo)}</p>`
    : '<p class="hj-empty">Nada atrasado nem pra hoje.</p>';
  const ocultas = todas.length - agora.length;
  return `<section id="wTarefas" class="hj-card hj-prioridades">${cabecaCard('Tarefas', 'tarefas')}
    ${agora.length ? `<ul class="es-lista">${agora.slice(0, 5).map(t => tarefaLi(t, hoje)).join('')}</ul>` : vazio}
    ${ocultas ? `<p class="hj-hint">${ocultas === 1 ? '1 tarefa reservada' : ocultas + ' tarefas reservadas'} (modo discreto).</p>` : ''}
    <a class="hj-more" href="#tarefas">${agora.length > 5 ? `Mais ${agora.length - 5} · ` : ''}Ver todas as tarefas</a></section>`;
}
function wDinheiro() {
  const R = resumoFinanceiro(S.fin), head = cabecaCard('Dinheiro', 'financas');
  if (!R) return `<section id="wDinheiro" class="hj-card hj-dinheiro">${head}${semEspelho('financas')}</section>`;
  const mes = R.mes ? maiusc(MESES[Number(R.mes.slice(5)) - 1]) : 'Mês';
  const fat = R.proximaFatura;
  return `<section id="wDinheiro" class="hj-card hj-dinheiro">${head}
    <dl class="es-kpis">
      <div><dt>Saldo nas contas</dt><dd>${R.saldoTotal == null ? '—' : V(R.saldoTotal)}</dd></div>
      <div><dt>Resultado de ${mes.toLowerCase()}</dt><dd>${R.resultado == null ? '—' : V(R.resultado, R.resultado < 0 ? 'neg' : 'pos')}</dd></div>
      ${fat ? `<div><dt>Próxima fatura</dt><dd>${V(fat.valor)}<small>${h(fat.cartao)} · vence ${dm(fat.vence)}</small></dd></div>` : ''}
    </dl><a class="hj-more" href="#financas">Ver finanças</a></section>`;
}
function humorBotoes() {
  return `<div class="es-humor" role="group" aria-label="Como você está agora, de 1 a 5">${HUMOR.map(([e, l], i) =>
    `<button type="button" data-humor="${i + 1}" aria-label="${i + 1} de 5, ${l}"><span aria-hidden="true">${e}</span><small>${l}</small></button>`).join('')}</div>`;
}
function wSentir() {
  return `<section class="hj-card hj-sentir" id="wSentir"><header class="hj-section-head"><h2>Como você está?</h2><a href="#sentir">Meus registros <span aria-hidden="true">↗</span></a></header>
    ${humorBotoes()}<p class="hj-hint">Um toque e, se quiser, conte o que aconteceu. Vai direto pro seu diário emocional.</p></section>`;
}
function proximaRefeicao() {
  if (cfg.discreet) return null;
  return refeicaoDoHorario(refeicoesOrdenadas(S.plano?.dv?.meals), now());
}
function fichasAll() {
  const est = { id: 'estou', emoji: '💭', nome: 'Como estou', desc: 'O check-in do journal. Preencha só o que fizer sentido.', builtin: true };
  let lista = S.fichas;
  if (!lista.length) { const t = regTool(); lista = [{ id: 'regulacao', emoji: '🧭', nome: t.title, desc: '', campos: t.qs.map(q => ({ q, tipo: 'texto' })), semArquivo: true }]; }
  return [est, ...lista];
}
function wRefeicao() {
  const ref = cfg.discreet ? null : proximaRefeicao();
  const hora = ref ? `<p>${ref.amanha ? 'Amanhã' : 'Próxima refeição'}, ${ref.meal.t} · ${h(ref.meal.nome)}</p>` : '';
  return `<section class="hj-channel" id="wRef"><header><span class="hj-channel-icon" aria-hidden="true">🍽️</span><h3><a href="#alimentacao">Refeições e compras</a></h3></header>
    ${hora}<div class="hj-actions"><a href="#alimentacao/plano">Ver plano</a><a id="wCompras" href="#alimentacao/compras">Lista de compras</a></div></section>`;
}
function wRetomar() {
  const casos = casosEmAndamento(S.files).filter(f => !cfg.discreet || (!f.sens && !VEIL.has(f.area)));
  const lista = casos.slice(0,2).map(f => {
    const abertas = S.tasks.filter(g => !isChecked(g) && (!cfg.discreet || !tarefaReservada(g)) && g.members.some(m => m.path === f.path)).sort(byDue);
    // Primeiro onde o caso está agora (a linha mais recente de "Onde está"), depois o próximo passo.
    const situacao = plain(pontoDeParada(f)).replace(/^(agora|parei aqui)\b[^:]*:\s*/i, '');
    const prox = abertas[0];
    const passo = prox ? `Próximo: ${short(plain(prox.text), 80)}${prox.due ? ` · ${prox.due < ymd(now()) ? 'atrasada desde' : 'até'} ${dm(prox.due)}` : ''}` : '';
    return `<button type="button" class="hj-resume" data-open="${h(f.path)}"><span class="hj-folder" aria-hidden="true">↳</span><span><strong>${h(plain(f.title))}</strong>
      ${situacao ? `<small>${h(short(situacao,110))}</small>` : ''}${passo ? `<small class="hj-resume-next">${h(passo)}</small>` : ''}</span><span class="hj-resume-arrow" aria-hidden="true">›</span></button>`;
  }).join('');
  return `<section class="hj-card hj-retomar" id="retomadas"><header class="hj-section-head"><h2>Retomar um caso</h2><a href="#areas">Ver memória <span aria-hidden="true">↗</span></a></header>
    ${lista || '<p class="hj-empty">Nenhum caso visível para retomar.</p>'}</section>`;
}
function atalhosDaMemoria() {
  const caminhos = [['documentos/documentos.md', 'Documentos'], ['eu/decisoes.md', 'Decisões'], [SEMANA_MODELO, 'Meu plano']];
  return caminhos.filter(([p]) => S.files[p]).map(([p, nome]) =>
    `<button type="button" class="btn ghost" data-open="${h(p)}">${nome}</button>`).join('');
}

function renderInicio() {
  const el = $('#home');
  if (!el) return;
  const n = now(), hr = n.getHours();
  const sauda = hr < 5 || hr >= 18 ? 'Boa noite' : hr < 12 ? 'Bom dia' : 'Boa tarde';
  const abertos = new Set($$('details[data-home-fold][open]', el).map(section => section.dataset.homeFold));
  S.minute = hr * 60 + n.getMinutes(); S.day = ymd(n);
  const pronto = Boolean(S.head || Object.keys(S.files).length);
  const saudacao = `<header class="hj-heading"><div><p>${DOWL[n.getDay()]}, ${n.getDate()} de ${MESES[n.getMonth()]}</p>
    <h1>${sauda}${S.name ? ', ' + h(S.name) : ''}.</h1></div><button type="button" class="hj-capture" data-act="buscar"><span aria-hidden="true">⌕</span> Buscar</button></header>`;
  if (!pronto) {
    el.innerHTML = `${saudacao}<p class="hj-loading" role="status">${S.err ? 'Não foi possível carregar suas notas.' : 'Carregando suas notas…'}</p>`;
    return;
  }
  el.innerHTML = `${saudacao}<div class="hj-board es-board">${wAgenda()}${wTarefas()}${wDinheiro()}${wRetomar()}</div>
    <section class="hj-tools"><div class="hj-channels es-canais">${wRefeicao()}</div></section>`;
  for (const section of $$('details[data-home-fold]', el)) section.open = abertos.has(section.dataset.homeFold);
}

/* ─────────────── folha (bottom sheet) ─────────────── */
let sheetCtx = null;
function openSheet(title, html, ctx = {}) {
  const w = $('#sheet');
  sheetCtx = ctx;
  $('#shTitle').textContent = title;
  $('#shBody').innerHTML = html;
  w.hidden = false;
  document.body.classList.add('sheet-on');
  requestAnimationFrame(() => w.classList.add('on'));
  const f = ctx.focus && $('#shBody').querySelector(ctx.focus);
  if (f) f.focus();
}
function closeSheet() {
  const w = $('#sheet');
  if (w.hidden) return;
  w.classList.remove('on');
  document.body.classList.remove('sheet-on');
  sheetCtx = null;
  setTimeout(() => { if (!w.classList.contains('on')) { w.hidden = true; $('#shBody').innerHTML = ''; } }, 200);
}
const sheetOpen = () => !$('#sheet').hidden;
function sheetMais() {
  openSheet('Mais', `<ul class="menu">
    <li><a href="#alimentacao" data-close><span class="e">🥗</span>Refeições e compras</a></li>
  </ul>
`);
}

/* ─────────────── formulários (folha e Registrar usam os mesmos) ─────────────── */
const picked = (f, k) => f.querySelector(`[data-pick="${k}"][aria-checked="true"]`)?.dataset.v || '';
const pressed = (f, k) => $$(`[data-pick="${k}"][aria-pressed="true"]`, f).map(b => b.dataset.v);
function formNota(area = 'geral') {
  return `<form class="f2 quick-note" data-form="nota" autocomplete="off">
    <label class="compose-title">O que você quer guardar?
      <textarea name="txt" required rows="5" placeholder="Uma ideia, algo para lembrar, uma conversa…" aria-label="Texto da nota"></textarea></label>
    <div class="compose-bottom"><label class="mini-select"><span>Área</span>
      <select name="areaNota" aria-label="Área da nota">${NOTA_AREAS.map(([k]) => `<option value="${k}"${k === area ? ' selected' : ''}>${h(AREAS[k]?.nome || 'Geral')}</option>`).join('')}</select>
      </label><button class="btn big" type="submit">Guardar nota</button></div>
  </form>`;
}
const rangeField = (name, label) => `<div class="field"><label>${h(label)}</label><div class="range"><input type="range" name="${name}" min="0" max="10" step="1" value="5" data-range><output>5</output></div><p class="hint" style="margin-top:4px" data-rh>Toque na barra para marcar.</p></div>`;
const humorField = (name, label) => `<div class="field"><span class="lbl">${h(label)}</span><div class="mood" role="radiogroup" aria-label="${h(label)} de 1 a 5">${HUMOR.map(([e, l], i) => `<button type="button" role="radio" data-pick="${name}" data-v="${i + 1}" aria-checked="false" aria-label="${i + 1} de 5, ${l}">${e}<small>${i + 1}</small></button>`).join('')}</div></div>`;
const emoField = (name, label) => `<div class="field"><span class="lbl">${h(label)}</span><div class="chips" role="group" aria-label="${h(label)}">${EMOCOES.map(e => `<button type="button" data-pick="${name}" data-v="${h(e)}" aria-pressed="false">${h(e)}</button>`).join('')}</div><input type="text" name="${name}_outra" placeholder="Outra (escreva)" style="margin-top:10px"></div>`;
function formFicha(fi) {
  let corpo;
  if (fi.id === 'estou') {
    corpo = humorField('humor', 'Como você está agora?') +
      `<label class="field"><span>Nas suas palavras</span><textarea name="livre" placeholder="O que marcou o seu dia?"></textarea></label>
       <details class="capture-extra"><summary>Emoções e contexto</summary>${emoField('emo', 'O que você sentiu')}${rangeField('intens', 'Intensidade')}
       <label class="field"><span>O que provocou</span><input type="text" name="gatilho"></label>
       <label class="field"><span>O que ajudou</span><input type="text" name="ajudou"></label></details>`;
  } else {
    corpo = fi.campos.map((c, i) => c.tipo === 'escala' ? rangeField('c' + i, c.q) : c.tipo === 'humor' ? humorField('c' + i, c.q) : c.tipo === 'emocoes' ? emoField('c' + i, c.q)
      : `<div class="q"><label><span>${i + 1}</span>${h(c.q)}</label><textarea name="c${i}"></textarea></div>`).join('');
  }
  return `<form class="f2" data-form="ficha" data-id="${h(fi.id)}" autocomplete="off">
    ${!fi.builtin && fi.desc ? `<p class="hint">${h(fi.desc)}</p>` : ''}${corpo}
    <div class="form-foot"><button class="btn big" type="submit">Guardar</button>${!fi.builtin && !fi.semArquivo ? `<button class="btn ghost big" type="button" data-act="ficha-editar" data-id="${h(fi.id)}">Editar exercício</button>` : ''}<p class="hint">Vai direto pro seu diário emocional.</p></div>
  </form>`;
}
const TIPOS_CAMPO = [['texto', 'Texto'], ['escala', 'Escala 0 a 10'], ['humor', 'Humor 1 a 5'], ['emocoes', 'Emoções']];
const campoRow = (c = { q: '', tipo: 'texto' }) => `<div class="ed-f" data-campo><input type="text" data-q value="${h(c.q)}" placeholder="Pergunta ou campo" aria-label="Pergunta"><select data-tipo aria-label="Tipo">${TIPOS_CAMPO.map(([v, l]) => `<option value="${v}"${c.tipo === v ? ' selected' : ''}>${l}</option>`).join('')}</select><button type="button" class="ib" data-act="campo-del" aria-label="Tirar este campo">${ICON.x}</button></div>`;
function formFichaEd(fi) {
  const campos = fi ? fi.campos : [{ q: '', tipo: 'texto' }, { q: '', tipo: 'texto' }];
  return `<form class="f2" data-form="ficha-ed" data-id="${fi ? h(fi.id) : ''}" autocomplete="off">
    <p class="hint" style="margin-top:0">Pra quando a psicóloga passar algo novo: dê um nome e escreva as perguntas. O que você preencher vai direto pro seu diário emocional.</p>
    <div class="field" style="display:grid;grid-template-columns:64px 1fr;gap:8px"><div><label>Emoji</label><input type="text" name="emoji" value="${h(fi ? fi.emoji : '🧭')}" maxlength="4" style="text-align:center"></div><div><label>Nome do exercício</label><input type="text" name="nome" value="${h(fi ? fi.nome : '')}" placeholder="Ex.: Registro de pensamentos"></div></div>
    <div class="field"><label>Explicação (opcional)</label><input type="text" name="desc" value="${h(fi ? fi.desc : '')}" placeholder="Ex.: usar quando bater ansiedade"></div>
    <div class="field"><span class="lbl">Campos</span><div data-campos>${campos.map(campoRow).join('')}</div><button type="button" class="btn ghost" data-act="campo-add" style="margin-top:10px">＋ Campo</button></div>
    <div class="form-foot"><button class="btn big" type="submit">Salvar exercício</button>${fi ? '<button class="btn ghost big" type="button" data-act="ficha-del" style="color:var(--alert)">Apagar exercício</button>' : ''}</div>
  </form>`;
}
const blobB64 = b => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result).split(',')[1]); r.onerror = () => rej(erro('arquivo')); r.readAsDataURL(b); });
async function shrinkImage(file) {
  const bmp = await createImageBitmap(file);
  const k = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
  const c = document.createElement('canvas');
  c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
  c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
  return await new Promise((res, rej) => c.toBlob(b => b ? res(b) : rej(new Error('canvas')), 'image/jpeg', 0.82));
}
function uploadComprovante(file, rotulo, { pasta = 'painel/comprovantes', max = 8e6, ext: extDado, msg = 'painel: comprovante enviado' } = {}) {
  const job = queue.then(async () => {
    let blob = file, ext = extDado || ((file.name || '').match(/\.(\w{2,5})$/) || [])[1]?.toLowerCase() || (file.type === 'application/pdf' ? 'pdf' : 'jpg');
    if (/^image\//.test(file.type)) { try { blob = await shrinkImage(file); ext = 'jpg'; } catch { } }
    if (blob.size > max) throw erro('grande');
    const b64 = await blobB64(blob);
    const n = now();
    const slug = norm(rotulo || 'comprovante').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 30) || 'comprovante';
    const path = `${pasta}/${ymd(n)}-${pad(n.getHours())}${pad(n.getMinutes())}${pad(n.getSeconds())}-${slug}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
    S.pending++; setLive();
    try {
      const r = await gh(`/repos/${cfg.repo}/contents/${repoPath(path)}`, { method: 'PUT', body: { message: msg + '\n\nvia painel', content: b64, branch: cfg.branch } });
      if (!r.ok) throw erro(r.status === 403 || r.status === 404 ? 'perm' : 'http', 'put ' + r.status);
      S.ours.add(r.json.commit.sha);
      return path;
    } finally { S.pending--; setLive(); }
  });
  queue = job.catch(() => { });
  return job;
}
// O rascunho continua disponível na aba enquanto a gravação estiver em andamento.
async function concluirCaptura(f, gravar) {
  if (f.dataset.saving) return;
  f.dataset.saving = '1';
  const btn = f.querySelector('button[type=submit]'), original = btn.textContent;
  const inSheet = Boolean(f.closest('#sheet'));
  btn.disabled = true; btn.textContent = 'Guardando…';
  f.inert = true; f.setAttribute('aria-busy', 'true');
  let ok = false;
  try {
    ok = await gravar();
  } catch (e) {
    if (e.code === 'grande') toast(f.dataset.form === 'captura' ? 'Um anexo ficou grande demais (foto até 8 MB, áudio até 20 MB).' : 'O arquivo ultrapassou 8 MB. Escolha uma imagem menor.', { err:true });
    else toastErr(e, 'Não foi possível guardar');
  } finally {
    delete f.dataset.saving;
    f.inert = false; f.removeAttribute('aria-busy');
    btn.disabled = false; btn.textContent = original;
  }
  if (!ok) return;
  if (inSheet) {
    if (f.closest('#sheet')) closeSheet();
    return;
  }
  if (f.dataset.form === 'captura') {
    limparCaptura(f);
  } else if (f.dataset.form === 'nota') {
    f.elements.txt.value = '';
  } else {
    // Recria somente a captura enviada. Outras modalidades podem ter um rascunho.
    for (const [id, pane] of capturePanes) if (pane.contains(f)) capturePanes.delete(id);
    renderRegistrar();
  }
}

const arquivosCapturados = new WeakMap();
function submitFicha(f) {
  const fi = fichasAll().find(x => x.id === f.dataset.id);
  if (!fi) return;
  const n = now(), diaTxt = `${ymd(n)} ${DOW[n.getDay()]}`;
  if (fi.id === 'estou') {
    const emos = [...pressed(f, 'emo'), ...(f.emo_outra.value.trim() ? [f.emo_outra.value.trim()] : [])];
    const hu = picked(f, 'humor'), intens = f.intens.dataset.set ? f.intens.value : '';
    const gatilho = f.gatilho.value.trim(), ajudou = f.ajudou.value.trim(), livre = f.livre.value.trim();
    const estruturado = hu || emos.length || intens || gatilho || ajudou;
    if (!estruturado && !livre) { toast('Preencha pelo menos uma coisa.'); return; }
    const linha = estruturado ? `| ${diaTxt} | ${hu || '—'} | ${celula(emos.join(', '))} | ${intens || '—'} | ${celula(gatilho)} | ${celula(ajudou)} |` : '';
    const secao = livre ? `## ${diaTxt} · ${hm(n)} · 💭 Como estou (palavras dele)\n${livre.split(/\n+/).map(l => l.trim()).filter(Boolean).map(l => '- ' + l).join('\n')}` : '';
    return concluirCaptura(f, () => gravarJournal({ linha, secao }));
  }
  const ans = [];
  fi.campos.forEach((c, i) => {
    let v = '';
    if (c.tipo === 'escala') { const r = f.elements['c' + i]; if (r && r.dataset.set) v = `${r.value}/10`; }
    else if (c.tipo === 'humor') { const x = picked(f, 'c' + i); if (x) v = `${x}/5`; }
    else if (c.tipo === 'emocoes') { const o = f.elements[`c${i}_outra`]; v = [...pressed(f, 'c' + i), ...(o && o.value.trim() ? [o.value.trim()] : [])].join(', '); }
    else v = (f.elements['c' + i]?.value || '').trim();
    if (v) ans.push(`- ${c.q} → ${oneLine(v)}`);
  });
  if (!ans.length) { toast('Responda pelo menos um campo.'); return; }
  const secao = `## ${diaTxt} · ${hm(n)} · ${fi.emoji || '🧭'} ${fi.nome}\n${ans.join('\n')}`;
  return concluirCaptura(f, () => gravarJournal({ secao }));
}
/* fichas: lidas de painel/fichas.md; o painel cria, edita e apaga ali */
function parseFichas(f) {
  if (!f) return [];
  const out = [];
  let cur = null;
  for (const l of f.body.split('\n')) {
    let m;
    if ((m = l.match(/^##\s+(.+)$/))) {
      const t = m[1].trim(), em = t.match(/^(\p{Extended_Pictographic}[️‍\p{Extended_Pictographic}]*)\s*(.+)$/u);
      cur = { emoji: em ? em[1] : '🧭', nome: (em ? em[2] : t).trim(), desc: [], campos: [] };
      out.push(cur); continue;
    }
    if (!cur) continue;
    if ((m = l.match(/^\s*[-*]\s+(.+)$/))) {
      const t = m[1].trim(), tm = t.match(/^(.*?)\s+·\s+(texto|escala|humor|emoç?c?[õo]es)$/i);
      cur.campos.push({ q: tm ? tm[1].trim() : t, tipo: tm ? norm(tm[2]).replace('emocoes', 'emocoes') : 'texto' });
      continue;
    }
    if (l.trim() && !/^#/.test(l)) cur.desc.push(l.trim());
  }
  const ids = new Set();
  return out.filter(x => x.campos.length).map(x => {
    let id = norm(x.nome).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'ficha';
    while (ids.has(id) || id === 'estou') id += '-2';
    ids.add(id);
    return { ...x, id, desc: x.desc.join(' ') };
  });
}
const FICHAS_INTRO = `---\ntipo: config\narea: emocional\nstatus: ativo\ntags: [painel, fichas, emocional, terapia, psicologa, ferramenta, registro, formulario]\npessoas: []\nresumo: Fichas de saúde emocional do painel — o que a psicóloga passa para ele registrar. Cada ficha vira um formulário no painel; o que ele preenche vai direto para o journal do mês.\natualizado: ${ymd(now())}\n---\n\n# Fichas de saúde emocional\n\nCada \`##\` é uma ficha do widget "Saúde emocional" do painel; cada item da lista é um campo (\`- Pergunta\` ou \`- Pergunta · escala|humor|emocoes\`).\n\n`;
function fichasTexto(base, op) {
  const pf = base ? parseFile(FICHAS, '', base) : null;
  let lista = pf ? parseFichas(pf) : [];
  if (op.del) lista = lista.filter(x => x.id !== op.del);
  else if (op.set) {
    const i = op.id ? lista.findIndex(x => x.id === op.id) : -1;
    if (i >= 0) lista[i] = op.set; else lista.push(op.set);
  }
  let intro = FICHAS_INTRO;
  if (base) { const k = base.search(/^## /m); intro = (k >= 0 ? base.slice(0, k) : base).replace(/\s+$/, '') + '\n\n'; }
  return intro + lista.map(x => `## ${x.emoji} ${x.nome}\n${x.desc ? x.desc + '\n' : ''}${x.campos.map(c => `- ${c.q}${c.tipo !== 'texto' ? ' · ' + c.tipo : ''}`).join('\n')}`).join('\n\n') + '\n';
}
function salvarFicha(f) {
  const nome = oneLine(f.nome.value).replace(/^#+\s*/, ''), emoji = (f.emoji.value || '').trim() || '🧭';
  const campos = $$('[data-campo]', f).map(r => ({ q: oneLine(r.querySelector('[data-q]').value).replace(/\s+·\s+(texto|escala|humor|emocoes)$/i, ''), tipo: r.querySelector('[data-tipo]').value })).filter(c => c.q);
  if (!nome) { toast('Dê um nome pro exercício.'); f.nome.focus(); return; }
  if (!campos.length) { toast('Escreva pelo menos um campo.'); return; }
  const set = { emoji, nome, desc: oneLine(f.desc.value), campos };
  const id = f.dataset.id;
  write(FICHAS, base => fichasTexto(base, { set, id }), 'emocional: fichas do painel', { onOk() { if (id) capturePanes.delete('ficha-' + id); toast(id ? 'Exercício atualizado.' : 'Exercício criado.'); } });
  closeSheet();
}
function apagarFicha(id) {
  write(FICHAS, base => { if (base == null) throw erro('sumiu'); return fichasTexto(base, { del: id }); }, 'emocional: fichas do painel', { onOk() { capturePanes.delete('ficha-' + id); toast('Exercício apagado.'); } });
  closeSheet();
}

/* ─────────────── Capturar: uma caixa só, como numa conversa ─────────────── */
// Texto, fotos e áudio vão juntos para a caixa como "💬 Captura"; o assessor decide o que é.
const capturePanes = new Map(); // ainda usado pelas fichas (folha)
const capAnexos = []; // { id, file, tipo, url, caminho }
let gravacao = null;
const CAP_ICON = {
  clip: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m20.5 11.5-8.3 8.3a5 5 0 0 1-7.1-7.1l8.6-8.6a3.4 3.4 0 0 1 4.8 4.8l-8.6 8.6a1.7 1.7 0 0 1-2.4-2.4l7.9-7.9"/></svg>',
  mic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/></svg>',
  send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5m-6 6 6-6 6 6"/></svg>',
  stop: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="7" y="7" width="10" height="10" rx="2" fill="currentColor"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M9 7V4.5h6V7m-8.5 0 1 13h9l1-13"/></svg>',
};
function formCaptura() {
  return `<form class="chat-composer" data-form="captura" autocomplete="off">
    <div class="chat-attachments" data-anexos hidden></div>
    <div class="chat-row">
      <label class="chat-ib chat-clip" title="Anexar foto ou arquivo"><input type="file" name="anexo" accept="image/*,application/pdf" multiple aria-label="Anexar foto ou arquivo">${CAP_ICON.clip}</label>
      <textarea name="txt" rows="1" placeholder="Escreva qualquer coisa…" aria-label="O que você quer guardar"></textarea>
      <div class="chat-recording" data-gravando hidden><span class="rec-dot" aria-hidden="true"></span><span data-tempo>0:00</span>
        <button type="button" class="chat-ib" data-cap="cancelar" aria-label="Descartar o áudio" title="Descartar">${CAP_ICON.trash}</button>
        <button type="button" class="chat-ib rec-stop" data-cap="parar" aria-label="Parar e anexar o áudio" title="Parar">${CAP_ICON.stop}</button></div>
      <button type="button" class="chat-ib chat-mic" data-cap="gravar" aria-label="Gravar áudio" title="Gravar áudio">${CAP_ICON.mic}</button>
      <button type="submit" class="chat-send" aria-label="Enviar" title="Enviar">${CAP_ICON.send}</button>
    </div>
  </form>`;
}
function renderRegistrar() {
  const body = $('#regBody');
  let f = body.querySelector('form[data-form=captura]');
  if (!f) { body.innerHTML = formCaptura(); f = body.firstElementChild; ligarCaptura(f); }
  renderConversa();
}
// Onde cada item da caixa foi parar (painel/organizados.md, gravado pelo assessor ao organizar).
const ORGANIZADOS = 'painel/organizados.md';
const organizados = () => lerOrganizados(S.files[ORGANIZADOS]?.body);
function destinoHtml(destino) {
  const d = destinoLegivel(destino);
  if (d.stem) {
    const path = S.stems[d.stem.toLowerCase()], f = path && S.files[path];
    if (!f) return `em ${h(d.stem)}`;
    if (cfg.discreet && (f.sens || VEIL.has(f.area))) return 'numa nota reservada';
    return `em <button type="button" class="cap-dest" data-open="${h(path)}">${h(plain(f.title))} <span aria-hidden="true">›</span></button>`;
  }
  return h(d.texto);
}
function textoOrganizado(o) {
  const reservado = /^🔒/u.test(o.texto) || (cfg.discreet && /^(💬|💭|🧭|💳|🧾|💰|🔄)/u.test(o.texto));
  return reservado ? '<span class="muted">Item reservado</span>' : h(plain(o.texto.replace(/^💬 Captura:\s*/u, '')));
}
function respostaOrganizado(o) {
  const onde = destinoHtml(o.destino);
  return `<li class="chat-reply"><div class="bubble">✅ ${onde ? 'Guardado ' + onde : 'Organizado pelo assessor'}</div><time>organizado ${h(o.orgData === ymd(now()) ? o.orgHora : dm(o.orgData) + ' ' + o.orgHora)}</time></li>`;
}
function renderConversa() {
  const log = $('#regLog');
  if (!log) return;
  const d = ymd(now());
  // Hoje: o que ainda está na caixa e o que o assessor já guardou, cada um com a resposta de onde ficou.
  const naCaixa = S.cx.filter(it => it.date === d).map(it => ({ chave: it.date + ' ' + pad5(String(it.time || '')), html:
    `<li class="chat-msg${it.kind === 'captura' ? ' chat-livre' : ''}${it.pending ? ' busy' : ''}"><div class="bubble">${cxLabel(it, false)}</div><time>${h(it.time)}${it.pending ? ' · enviando…' : ' · na caixa, o assessor ainda não organizou'}</time></li>` }));
  const feitos = organizados().filter(o => o.data === d || o.orgData === d).map(o => ({ chave: o.data + ' ' + pad5(o.hora), html:
    `<li class="chat-msg chat-livre feito"><div class="bubble">${textoOrganizado(o)}</div><time>${h(o.data === d ? o.hora : dm(o.data) + ' ' + o.hora)}</time></li>${respostaOrganizado(o)}` }));
  const itens = [...feitos, ...naCaixa].sort((a, b) => a.chave.localeCompare(b.chave));
  const html = itens.length
    ? itens.map(i => i.html).join('')
    : '<li class="chat-empty">Escreva do jeito que vier: um gasto, uma ideia, como você está, um print. O assessor organiza e mostra aqui onde ficou.</li>';
  if (log.innerHTML === html) return;
  const cresceu = log.children.length < itens.length;
  log.innerHTML = html;
  if (cresceu && S.page === 'registrar') log.lastElementChild?.scrollIntoView({ block: 'nearest' });
}
function ligarCaptura(f) {
  const ta = f.elements.txt;
  ta.addEventListener('input', () => ajustarCaptura(f));
  f.elements.anexo.addEventListener('change', () => {
    for (const file of f.elements.anexo.files) addAnexo(f, file);
    f.elements.anexo.value = '';
  });
  ta.addEventListener('paste', ev => {
    const fs = [...(ev.clipboardData?.files || [])];
    if (fs.length) { ev.preventDefault(); fs.forEach(x => addAnexo(f, x)); }
  });
  f.addEventListener('click', ev => {
    const b = ev.target.closest('[data-cap]');
    if (!b) return;
    const a = b.dataset.cap;
    if (a === 'gravar') iniciarGravacao(f);
    else if (a === 'parar') pararGravacao(f, true);
    else if (a === 'cancelar') pararGravacao(f, false);
    else if (a === 'tirar') tirarAnexo(f, b.dataset.id);
  });
  ajustarCaptura(f);
}
function ajustarCaptura(f) {
  const ta = f.elements.txt;
  ta.style.height = 'auto';
  ta.style.height = Math.min(ta.scrollHeight, 220) + 'px';
  f.classList.toggle('tem-conteudo', Boolean(ta.value.trim() || capAnexos.length));
}
function addAnexo(f, file) {
  const tipo = tipoAnexo(file.type);
  if (!['foto', 'pdf', 'áudio'].includes(tipo)) { toast('Dá pra anexar foto, PDF ou áudio.'); return; }
  capAnexos.push({ id: crypto.randomUUID().slice(0, 8), file, tipo, url: URL.createObjectURL(file) });
  renderAnexos(f);
}
function tirarAnexo(f, id) {
  const i = capAnexos.findIndex(a => a.id === id);
  if (i < 0) return;
  URL.revokeObjectURL(capAnexos[i].url);
  capAnexos.splice(i, 1);
  renderAnexos(f);
}
function renderAnexos(f) {
  const box = f.querySelector('[data-anexos]');
  box.hidden = !capAnexos.length;
  box.innerHTML = capAnexos.map(a => {
    const prev = a.tipo === 'foto' ? `<img src="${a.url}" alt="Foto anexada">`
      : a.tipo === 'áudio' ? `<audio controls src="${a.url}" aria-label="Áudio gravado"></audio>`
      : `<span class="chat-file">📄 ${h(short(a.file.name || 'arquivo.pdf', 26))}</span>`;
    return `<div class="chat-att chat-att-${a.tipo === 'áudio' ? 'audio' : a.tipo}">${prev}<button type="button" class="chat-att-x" data-cap="tirar" data-id="${a.id}" aria-label="Tirar este anexo">${ICON.x}</button></div>`;
  }).join('');
  ajustarCaptura(f);
}
function limparCaptura(f) {
  for (const a of capAnexos) URL.revokeObjectURL(a.url);
  capAnexos.length = 0;
  f.elements.txt.value = '';
  renderAnexos(f);
  f.elements.txt.focus({ preventScroll: true });
}
async function iniciarGravacao(f) {
  if (gravacao) return;
  if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') { toast('Este navegador não grava áudio. Use o microfone do teclado para ditar.'); return; }
  let stream;
  try { stream = await navigator.mediaDevices.getUserMedia({ audio: true }); }
  catch { toast('Não consegui usar o microfone. Libere o acesso nas permissões do navegador.', { err: true }); return; }
  const mime = ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm'].find(t => MediaRecorder.isTypeSupported?.(t)) || '';
  let rec;
  try { rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined); }
  catch { stream.getTracks().forEach(t => t.stop()); toast('Não consegui gravar neste navegador.', { err: true }); return; }
  const g = gravacao = { rec, stream, chunks: [], inicio: Date.now(), guardar: true, base: f.elements.txt.value, parando: false, fala: null };
  rec.ondataavailable = e => { if (e.data && e.data.size) g.chunks.push(e.data); };
  rec.onstop = () => {
    stream.getTracks().forEach(t => t.stop());
    clearInterval(g.timer);
    if (g.guardar && g.chunks.length) {
      const tipo = rec.mimeType || g.chunks[0].type || 'audio/webm';
      const blob = new Blob(g.chunks, { type: tipo });
      addAnexo(f, new File([blob], 'audio.' + extAudio(tipo), { type: tipo }));
    }
    if (gravacao === g) gravacao = null;
    mostrarGravacao(f, false);
  };
  rec.start(1000);
  const tempo = f.querySelector('[data-tempo]');
  tempo.textContent = '0:00';
  g.timer = setInterval(() => {
    const s = Math.floor((Date.now() - g.inicio) / 1000);
    tempo.textContent = `${Math.floor(s / 60)}:${pad(s % 60)}`;
    if (s >= 600) pararGravacao(f, true);
  }, 500);
  // Transcrição ao vivo, quando o navegador oferece: o texto aparece na caixa e o áudio vai junto.
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SR) {
    try {
      const fala = new SR();
      fala.lang = 'pt-BR'; fala.continuous = true; fala.interimResults = true;
      let final = '';
      fala.onresult = ev => {
        let parcial = '';
        for (let i = ev.resultIndex; i < ev.results.length; i++) {
          const r = ev.results[i];
          if (r.isFinal) final += r[0].transcript.trim() + ' '; else parcial += r[0].transcript;
        }
        const ta = f.elements.txt;
        ta.value = (g.base.trim() ? g.base.trim() + ' ' : '') + (final + parcial).trim();
        ajustarCaptura(f);
      };
      fala.onerror = () => { };
      fala.onend = () => { if (gravacao === g && !g.parando) { try { fala.start(); } catch { } } };
      fala.start();
      g.fala = fala;
    } catch { }
  }
  mostrarGravacao(f, true);
}
function pararGravacao(f, guardar) {
  const g = gravacao;
  if (!g || g.parando) return;
  g.parando = true; g.guardar = guardar;
  try { g.fala?.stop(); } catch { }
  if (!guardar) { f.elements.txt.value = g.base; ajustarCaptura(f); }
  try { g.rec.state !== 'inactive' ? g.rec.stop() : g.rec.onstop(); } catch { g.rec.onstop(); }
}
function mostrarGravacao(f, on) {
  f.classList.toggle('gravando', on);
  f.querySelector('[data-gravando]').hidden = !on;
  f.querySelector('.chat-mic').hidden = on;
}
function enviarCaptura(f) {
  if (gravacao) { toast('Pare a gravação antes de enviar.'); return; }
  const texto = f.elements.txt.value.trim(), lista = capAnexos.slice();
  if (!texto && !lista.length) { f.elements.txt.focus(); return; }
  return concluirCaptura(f, async () => {
    const anexos = [];
    for (const a of lista) {
      if (!a.caminho) {
        const audio = a.tipo === 'áudio';
        a.caminho = await uploadComprovante(a.file, audio ? 'audio' : short(texto, 30) || a.tipo, { pasta: 'painel/anexos', max: audio ? 20e6 : 8e6, ext: audio ? extAudio(a.file.type) : undefined, msg: 'painel: anexo enviado' });
      }
      anexos.push({ tipo: a.tipo, caminho: a.caminho });
    }
    return addCaixa(linhasCaptura(texto, anexos), { msg: 'captura', ok: 'Na caixa. Quando o assessor organizar, aparece aqui onde ficou.' });
  });
}

/* ─────────────── Finanças: o resumo do Minhas Economias (espelho gravado pelo assessor) ─────────────── */
import { brl, pnum } from './financas.mjs?v=13ee44f54df8';
const V = (v, cls = '') => `<span class="veil${cls ? ' ' + cls : ''}">${brl(v)}</span>`;
const corSegura = c => /^#[0-9a-f]{3,8}$/i.test(String(c || '')) ? c : /^[0-9a-f]{6}$/i.test(String(c || '')) ? '#' + c : 'var(--ink3)';
function renderFinancas() {
  const el = $('#fin');
  if (!el) return;
  const revelada = cfg.discreet && S.reveal.has('#area/financas');
  const R = resumoFinanceiro(S.fin);
  const topo = `<header class="es-topo"><div class="page-h"><div class="fin-titulo"><h1>Finanças</h1>
    ${revelada ? `<button type="button" class="fin-ocultar" data-ocultar-area="financas" aria-label="Ocultar finanças">${ICON.lock} Ocultar</button>` : ''}</div>
    <p>${fonteTxt('financas')}</p></div>${abrirApp('financas')}</header>`;
  if (!R) { el.innerHTML = topo + semEspelho('financas'); return; }
  if (cfg.discreet && !revelada) {
    el.innerHTML = `${topo}<div class="fin-privado">${ICON.lock}<h2>Finanças em modo discreto</h2>
      <button type="button" class="btn" data-reveal-area="financas">Mostrar finanças</button></div>`;
    return;
  }
  const valor = v => v == null ? '—' : V(v);
  const nomeMes = R.mes ? maiusc(MESES[Number(R.mes.slice(5)) - 1]) : 'Este mês';
  const contas = R.contas.map(c => `<li><span class="es-dot" style="--c:${corSegura(c.cor)}"></span><span>${h(c.nome)}</span><b>${V(c.saldo)}</b></li>`).join('');
  const cats = R.categorias.map(c => `<li><span>${h(c.nome)}</span><b>${V(c.valor)}</b><i style="--p:${Math.max(2, Math.round(c.parte * 100))}%;--c:${corSegura(c.cor)}"></i></li>`).join('');
  const fats = R.faturas.map(f => `<li><span class="es-dot" style="--c:${corSegura(f.cor)}"></span><span>${h(f.cartao)}<small>${f.fecha ? `fecha ${dm(f.fecha)} · ` : ''}vence ${dm(f.vence)}</small></span><b>${V(f.valor)}</b></li>`).join('');
  const ult = R.ultimos.map(u => `<li><time>${dm(u.data)}</time><span>${h(u.descricao)}<small>${h([u.categoria, u.onde].filter(Boolean).join(' · '))}</small></span>${V(u.tipo === 'ganho' ? u.valor : -u.valor, u.tipo === 'ganho' ? 'pos' : '')}</li>`).join('');
  el.innerHTML = `${topo}<div class="es-fin">
    <section class="es-bloco"><h2>Saldo nas contas</h2><p class="es-grande">${valor(R.saldoTotal)}</p>${contas ? `<ul class="es-linhas">${contas}</ul>` : ''}</section>
    <section class="es-bloco"><h2>${nomeMes}</h2><dl class="es-kpis"><div><dt>Entrou</dt><dd>${valor(R.ganhos)}</dd></div><div><dt>Saiu</dt><dd>${valor(R.gastos)}</dd></div>
      <div><dt>Resultado</dt><dd>${R.resultado == null ? '—' : V(R.resultado, R.resultado < 0 ? 'neg' : 'pos')}</dd></div></dl>
      ${cats ? `<h3>Gastos por categoria</h3><ul class="es-barras">${cats}</ul>` : ''}</section>
    ${fats ? `<section class="es-bloco"><h2>Faturas abertas</h2><ul class="es-linhas">${fats}</ul></section>` : ''}
    ${ult ? `<section class="es-bloco"><h2>Últimos lançamentos</h2><ul class="es-linhas es-extrato">${ult}</ul></section>` : ''}
  </div><p class="es-rodape">Para lançar, corrigir ou apagar, use o Minhas Economias ou fale com o assessor. <a href="#area/financas/resumo">Notas de finanças</a></p>`;
}

/* ─────────────── Como estou: o diário emocional, gravado direto no journal do mês ─────────────── */
const JOURNAL_CAB = '| Data | Humor (1–5) | Emoção | Intensidade (0–10) | Gatilho | O que ajudou |';
const celula = s => oneLine(s).replace(/\|/g, '/') || '—';
function journalTemplate(mes) {
  return `---\ntipo: registro\narea: emocional\nstatus: ativo\ntags: [journal, check-in]\npessoas: []\nresumo: Check-ins emocionais de ${MESES[Number(mes.slice(5)) - 1]} de ${mes.slice(0, 4)}.\natualizado: ${ymd(now())}\n---\n\n# Diário emocional — ${mes}\n\n${JOURNAL_CAB}\n|---|---|---|---|---|---|\n`;
}
/* linha: nova linha da tabela do mês; secao: bloco "## aaaa-mm-dd ddd · hh:mm · …" no fim do arquivo */
function gravarJournal({ linha, secao }) {
  const dia = ymd(now()), path = `areas/emocional/journal-${dia.slice(0, 7)}.md`;
  return write(path, base => {
    let t = (base ?? journalTemplate(dia.slice(0, 7))).replace(/\s+$/, '') + '\n';
    if (linha) {
      const ls = t.split('\n');
      const ini = ls.findIndex(l => /^\|\s*Data\s*\|/i.test(l));
      if (ini >= 0) {
        let fim = ini;
        while (fim + 1 < ls.length && /^\|/.test(ls[fim + 1])) fim++;
        ls.splice(fim + 1, 0, linha);
        t = ls.join('\n');
      } else t += `\n${JOURNAL_CAB}\n|---|---|---|---|---|---|\n${linha}\n`;
    }
    if (secao) t = t.replace(/\s+$/, '') + '\n\n' + secao + '\n';
    return t;
  }, 'emocional: registro atualizado', {
    onOk() { toast('Guardado no seu diário emocional.'); renderSentir(); },
    onErr(e) { toastErr(e, 'Não guardei'); },
  });
}
function renderSentir() {
  const el = $('#sentir');
  if (!el) return;
  const oculto = cfg.discreet && !S.reveal.has('#sentir');
  const fichas = fichasAll().filter(f => !f.builtin);
  el.innerHTML = `<header class="es-topo"><div class="page-h"><h1>Como estou</h1><p>Seu diário emocional. Fica guardado direto, sem organizar nada; o assessor lê todo dia.</p></div></header>
    <section class="es-bloco"><h2>Como você está agora?</h2>${humorBotoes()}</section>
    ${oculto ? `<div class="fin-privado">${ICON.lock}<h2>Registros em modo discreto</h2><button type="button" class="btn" data-reveal-sentir>Mostrar registros</button></div>`
      : `<section class="es-bloco"><h2>Exercícios da psicóloga</h2><div class="hj-actions">${fichas.map(f => `<button type="button" class="btn ghost" data-ficha="${h(f.id)}">${h(f.emoji || '🧭')} ${h(f.nome)}</button>`).join('')}
        <button type="button" class="btn ghost" data-act="ficha-nova">＋ Criar exercício</button></div></section>
        ${visaoBemEstar('emocional', Object.values(S.files), ymd(now()))}`}`;
}

/* ─────────────── Alimentação ─────────────── */
const splitQ = s => { const i = s.indexOf(' · '); return i < 0 ? [s.trim(), ''] : [s.slice(0, i).trim(), s.slice(i + 3).trim()]; };
function parsePlano(f) {
  if (!f) return null;
  const P = { meals: [], subs: [], grupos: [], grupoDe: {}, extras: [], intro: '' };
  let h2 = '', meal = null, item = null, grp = null, ex = null;
  const intro = [];
  for (const l of f.body.split('\n')) {
    let m;
    if ((m = l.match(/^##\s+(.+)$/))) { h2 = norm(m[1]); meal = item = grp = null; ex = null; if (!/^(refeicoes|trocar a refeicao|lista de trocas|grupo de cada)/.test(h2)) { ex = { titulo: m[1].trim(), linhas: [] }; P.extras.push(ex); } continue; }
    if (/^#\s/.test(l)) continue;
    if (!h2) { if (l.trim()) intro.push(l.trim()); continue; }
    if (h2.startsWith('refeicoes')) {
      if ((m = l.match(/^###\s+(\d{1,2}:\d{2})\s*·\s*(.+)$/))) { const ps = m[2].split(/\s+·\s+/); meal = { t: pad5(m[1]), nome: ps[0].trim(), meta: ps.slice(1).join(' · '), itens: [] }; P.meals.push(meal); item = null; continue; }
      if (meal && item && (m = l.match(/^\s{2,}[-*]\s+ou\s+(.+)$/))) { const [n, q] = splitQ(m[1]); item.alts.push({ n, q }); continue; }
      if (meal && (m = l.match(/^[-*]\s+(.+)$/))) { const ps = m[1].split(/\s+·\s+/); item = { n: ps[0].trim(), q: (ps[1] || '').trim(), k: (ps[2] || '').trim(), alts: [] }; meal.itens.push(item); continue; }
    } else if (h2.startsWith('trocar a refeicao')) {
      if ((m = l.match(/^[-*]\s+(.+?)\s+·\s+\*\*(.+?)\*\*:\s*(.+)$/))) P.subs.push({ ref: norm(m[1]), nome: m[2], txt: m[3] });
    } else if (h2.startsWith('lista de trocas')) {
      if ((m = l.match(/^###\s+(.+)$/))) { const [nome, ref] = splitQ(m[1]); grp = { nome, ref, itens: [] }; P.grupos.push(grp); continue; }
      if (grp && (m = l.match(/^[-*]\s+(.+)$/))) { const [n, q] = splitQ(m[1]); grp.itens.push({ n, q }); }
    } else if (h2.startsWith('grupo de cada')) {
      if ((m = l.match(/^[-*]\s+(.+)$/))) { const [a, g] = splitQ(m[1]); P.grupoDe[a] = g; }
    } else if (ex) ex.linhas.push(l);
  }
  P.intro = intro.filter(l => !/painel lê|O painel/.test(l))[0] || '';
  return P;
}
function parseGruposM(f) {
  if (!f) return [];
  const out = []; let g = null;
  for (const l of f.body.split('\n')) {
    let m;
    if ((m = l.match(/^##\s+(\d+)\s*·\s*(.+)$/))) { g = { num: +m[1], nome: m[2].trim(), ref: 'uma porção', itens: [] }; out.push(g); continue; }
    if (/^##\s/.test(l)) { g = null; continue; }
    if (g && (m = l.match(/^[-*]\s+(.+)$/))) { const [n, q] = splitQ(m[1]); g.itens.push({ n, q }); }
  }
  return out;
}
function parseCasal(f) {
  const C = { juntos: [], compras: [] };
  if (!f) return C;
  let h2 = '', meal = null;
  for (const l of f.body.split('\n')) {
    let m;
    if ((m = l.match(/^##\s+(.+)$/))) { h2 = norm(m[1]); meal = null; continue; }
    if (h2.startsWith('refeicoes juntos')) {
      if ((m = l.match(/^###\s+(\d{1,2}:\d{2})\s*·\s*(.+)$/))) { meal = { t: pad5(m[1]), nome: m[2].trim(), itens: [], soD: [], soM: [] }; C.juntos.push(meal); continue; }
      if (!meal) continue;
      if (l.trim().startsWith('|') && !isSep(l)) { const c = cells(l); if (norm(c[0]) === 'alimento') continue; const tr = s => ({ t: (s || '').replace(/\s*·\s*troca$/, ''), troca: /·\s*troca$/.test(s || '') }); meal.itens.push({ n: c[0], d: tr(c[1]), m: tr(c[2]), obs: c[3] || '' }); continue; }
      if ((m = l.match(/^[-*]\s+Só (Diovane|Michele):\s*(.+)$/))) (m[1] === 'Diovane' ? meal.soD : meal.soM).push(splitQ(m[2]));
    } else if (h2.startsWith('lista de compras')) {
      if (!l.trim().startsWith('|') || isSep(l)) continue;
      const c = cells(l); if (norm(c[0]) === 'item') continue;
      const un = c[2] || '', mu = un.match(/^un\s*\(([^/]+)\/([^)]+)\)/);
      const q = s => { const n = pnum(String(s || '').replace(/[^\d,.-]/g, '')); return n || 0; };
      C.compras.push({ n: c[0], tipo: c[1] || 'Outros', u: mu ? 'un' : /vontade/.test(norm(un)) ? 'av' : un.trim(), rot: mu ? [mu[1].trim(), mu[2].trim()] : null, d: q(c[3]), m: q(c[4]), refs: c[5] || '' });
    }
  }
  return C;
}
function parseComprados(f) {
  if (!f) return [];
  return f.tasks.filter(t => norm(t.h2).startsWith('comprados')).map(t => ({ text: t.text, date: (t.raw.match(/(\d{4}-\d{2}-\d{2})/) || [])[1] || '' }));
}
const pegoBase = t => { const lugar = (t.match(/\(no lugar de ([^)]+)\)/i) || [])[1] || ''; const base = t.split(/\s+—\s+/)[0].replace(/\s*\(no lugar de [^)]+\)/i, '').trim(); return { base: norm(base), lugar: norm(lugar), nome: base }; };
const fmtPeso = (v, ml) => v >= 1000 ? fmtN(Math.round(v / 100) / 10) + (ml ? ' L' : ' kg') : fmtN(Math.round(v)) + (ml ? ' ml' : ' g');
const fmtN = n => { const r = Math.round(n * 100) / 100; return Number.isInteger(r) ? String(r) : String(r).replace('.', ','); };
function qtdItem(it, dias) {
  if (it.u === 'av') return it.m ? `à vontade (Michele ${fmtPeso(it.m * dias)})` : 'à vontade';
  const v = (it.d + it.m) * dias;
  if (it.u === 'un') { const n = Math.ceil(v); return `${n} ${n === 1 ? it.rot[0] : it.rot[1]}`; }
  return fmtPeso(v, it.u === 'ml');
}
function listaCompras() {
  const C = S.plano && S.plano.casal;
  if (!C || !C.compras.length) return null;
  const dias = S.dias, lim = ymd(addDays(now(), -(dias - 1)));
  const pend = new Map();
  for (const it of S.cx) if (it.kind === 'comprado') { const p = pegoBase(it.text); pend.set(p.base, it); if (p.lugar) pend.set(p.lugar, { ...it, sub: p.nome }); }
  const feitos = new Map();
  for (const c of S.comprados) if (c.date && c.date >= lim) { const p = pegoBase(c.text); feitos.set(p.base, c); if (p.lugar) feitos.set(p.lugar, { ...c, sub: p.nome }); }
  const itens = C.compras.map(it => {
    const k = norm(it.n);
    const p = pend.get(k), f2 = !p && [...feitos.keys()].find(x => x === k || x.startsWith(k + ' ') || k.startsWith(x + ' '));
    const fe = f2 ? feitos.get(f2) : null;
    return { ...it, key: k, qtd: qtdItem(it, dias), pego: !!(p || fe), box: p || null, sub: (p && p.sub) || (fe && fe.sub) || '' };
  });
  return { itens, dias };
}
const nb = t => String(t || '').replace(/(\d)\s+(g|ml|kg|L|latas?)\b/g, '$1\u00a0$2');
const QUEM = { diovane: ['Diovane', 'd'], michele: ['Michele', 'm'], ambos: ['Os dois', 'a'] };
function renderAlimentacao() {
  const el = $('#ali');
  if (!el) return;
  const visible = !cfg.discreet || S.reveal.has('#alimentacao');
  $('#aliOcultar').hidden = !cfg.discreet || !visible;
  const labels = [['plano','Refeições'],['trocas','Substituições'],['compras','Compras']];
  $('#aliTabs').innerHTML = labels.map(([key,label]) => `<a href="#alimentacao/${key}" ${S.aliTab === key ? 'aria-current="page"':''}>${label}</a>`).join('');
  const context = [S.aliTab, S.pessoa, S.aliRef, S.trocaP, visible].join('/');
  const same = el.dataset.context === context;
  const keep = same ? $$('[data-keep]',el).map(input => [input.dataset.keep,input.value,document.activeElement === input,input.selectionStart]) : [];
  const opened = same ? new Map($$('details[data-stay]',el).map(item=>[item.dataset.stay,item.open])) : new Map();
  const P = S.plano || {};
  if (!visible && S.aliTab !== 'compras') {
    el.innerHTML = `<section class="area-gate">${ICON.lock}<h2>Planos alimentares reservados</h2><p>O modo discreto está ativo.</p><button type="button" class="btn" data-act="ali-privacidade">Mostrar planos</button></section>`;
  } else {
    el.innerHTML = S.aliTab === 'compras' ? aliCompras() : S.aliTab === 'trocas' ? aliTrocas(P) : aliPlano(P);
  }
  el.dataset.context = context;
  for (const item of $$('details[data-stay]',el)) if (opened.has(item.dataset.stay)) item.open = opened.get(item.dataset.stay);
  for (const [key,value,focused,pos] of keep) {
    const input = el.querySelector(`[data-keep="${CSS.escape(key)}"]`);
    if (!input) continue;
    input.value = value;
    if (focused) {
      input.focus({preventScroll:true});
      if (pos != null) input.setSelectionRange(pos,pos);
    }
  }
}
function quemSeg(atual, opcoes, attr) {
  return `<div class="quem" role="group" aria-label="De quem é o plano">${opcoes.map(k => `<button type="button" class="q-${QUEM[k][1]}" ${attr}="${k}" aria-pressed="${atual === k}"><i></i>${QUEM[k][0]}</button>`).join('')}</div>`;
}
/* a refeição inteira trocada: as do plano do Diovane e as opções de jantar da Michele */
function trocasDaRefeicao(P, m, quem) {
  const out = [], nm = norm(m.nome);
  if (quem !== 'michele' && P.dv) for (const s of P.dv.subs) if (nm === s.ref || nm.startsWith(s.ref + ' ') && !/^depois/.test(nm)) out.push({ q: 'd', nome: s.nome, html: `<p>${h(s.txt)}</p>` });
  if (quem !== 'diovane' && P.mi) for (const ex of P.mi.extras) {
    const tit = norm(ex.titulo);
    if (!/^jantar/.test(tit) || nm !== 'jantar') continue;
    const nome = ex.titulo.replace(/^Jantar\s*·\s*/i, '').trim() || ex.titulo;
    out.push({ q: 'm', nome: nome.charAt(0).toUpperCase() + nome.slice(1), html: md(ex.linhas.join('\n'), PLANO_M) });
  }
  return out;
}
function altBtn(a, it, pl, quem) {
  const g = a.n.match(/^([\d,.½]+)\s+porç(?:ão|ões)\s+do grupo\s+(\d+)\s*\(([^)]+)\)/i);
  if (g) return `<button type="button" class="alt-lista" data-trocagrupo="${h(g[3])}" data-tp="michele"><span>Ver a lista toda: <b>${h(g[3])}</b></span><span>${h(g[1])}\u00a0${+g[1].replace(',', '.') > 1 ? 'porções' : 'porção'} ›</span></button>`;
  return `<div class="alt"><span>${h(a.n)}</span><span>${h(nb(a.q))}</span></div>`;
}
function itemLinha(it, pl, quem) {
  const alts = it.alts || [];
  const fim = quem === 'diovane' && pl.grupoDe[it.n] ? `<button type="button" class="alt-lista" data-trocagrupo="${h(pl.grupoDe[it.n])}" data-tp="diovane"><span>Ver a lista toda: <b>${h(pl.grupoDe[it.n])}</b></span><span>›</span></button>` : '';
  const linha = `<span class="fn">${h(it.n)}</span><span class="fq">${h(nb(it.q))}</span>`;
  if (!alts.length && !fim) return `<li><div class="fl">${linha}<span class="fx"></span></div></li>`;
  return `<li><details><summary class="fl">${linha}<span class="fx" aria-label="Ver substituições">Trocas <i aria-hidden="true">⌄</i></span></summary><div class="alts">${alts.map(a => altBtn(a, it, pl, quem)).join('')}${fim}</div></details></li>`;
}
function refeicoesDaPessoa(P, quem) {
  if (quem === 'diovane') return P.dv?.meals;
  if (quem === 'michele') return P.mi?.meals;
  return P.casal?.juntos;
}
function chaveRefeicao(horario) {
  return `${horario.index}-${horario.amanha ? 'amanha' : horario.mins > 0 ? 'proxima' : 'agora'}`;
}
function aliPlano(P) {
  const quem = Object.hasOwn(QUEM,S.pessoa) ? S.pessoa : 'ambos';
  const pl = quem === 'michele' ? P.mi : P.dv;
  const meals = refeicoesOrdenadas(refeicoesDaPessoa(P,quem));
  const selector = `<div class="ali-person"><span>Plano alimentar</span>${quemSeg(quem,['ambos','diovane','michele'],'data-pessoa')}</div>`;
  if (!meals.length) return selector + `<p class="ali-nodata">As refeições ${quem === 'ambos' ? 'dos dois' : quem === 'michele' ? 'da Michele' : 'do Diovane'} vão aparecer aqui quando o plano estiver nas notas.</p>`;
  const horario = refeicaoDoHorario(meals,now());
  const ref = S.aliRef?.split('|');
  let si = ref ? meals.findIndex((x,i) => x.t === ref[0] && i === +ref[1]) : -1;
  if (si < 0 && ref) si = meals.findIndex(x => x.t === ref[0]);
  if (si < 0) si = horario.index;
  const meal = meals[si];
  const when = horario.amanha ? 'Primeira de amanhã' : horario.mins > 0 ? 'Próxima refeição' : 'Refeição de agora';
  const label = si === horario.index ? when : 'Refeição selecionada';
  const choose = i => `${meals[i].t}|${i}`;
  const stepper = meals.length > 1 ? `<nav class="ali-steps" aria-label="Percorrer refeições">
    ${si > 0 ? `<button type="button" data-ref="${choose(si-1)}">← ${h(meals[si-1].nome)}</button>` : '<span></span>'}
    ${si + 1 < meals.length ? `<button type="button" data-ref="${choose(si+1)}">${h(meals[si+1].nome)} →</button>` : ''}</nav>` : '';
  const main = `<header class="ali-meal-cover" data-meal-key="${chaveRefeicao(horario)}"><div><p>${label}</p><h2 id="aliMealTitle" tabindex="-1">${h(meal.nome)}</h2></div><time>${h(meal.t)}</time></header>`;
  const timetable = `<details class="ali-card ali-clock" data-stay="horarios"${matchMedia('(min-width: 861px)').matches ? ' open' : ''}><summary><span>Horários do plano</span><small>${meals.length} refeições</small></summary>
    <div class="ali-slots">${meals.map((m,i) => `<button type="button" data-ref="${choose(i)}" aria-pressed="${si === i}"><time>${h(m.t)}</time><span>${h(m.nome)}</span>${i === horario.index ? '<i aria-label="Horário em destaque">●</i>':''}</button>`).join('')}</div>
    ${S.aliRef ? `<button type="button" class="ali-reset" data-ref="agora">Voltar ao horário de agora</button>`:''}</details>`;
  let portion;
  if (quem === 'ambos') {
    const lines = [...meal.itens,...meal.soD.map(([n,t]) => ({n,d:{t},m:{}})),...meal.soM.map(([n,t]) => ({n,d:{},m:{t}}))];
    const amount = (person, item) => `<div class="ali-quantity"><dt>${person}</dt><dd>${item.t ? h(nb(item.t)) : '—'}${item.troca ? ' <small>troca</small>':''}</dd></div>`;
    portion = `<ul class="ali-plates">${lines.map(it => `<li><strong>${h(it.n)}</strong><dl>${amount('Diovane',it.d)}${amount('Michele',it.m)}</dl>${it.obs ? `<p>${h(it.obs)}</p>`:''}</li>`).join('')}</ul>`;
  } else {
    portion = `<ul class="ritems">${meal.itens.map(it=>itemLinha(it,pl,quem)).join('')}</ul>`;
  }
  const swaps = trocasDaRefeicao(P,meal,quem);
  const alternatives = swaps.length ? `<details class="ali-card ali-disclosure" data-stay="opcoes-${si}"><summary>Outras opções para esta refeição <small>${swaps.length}</small></summary>
    ${swaps.map(s=>`<details class="swap"><summary><span>${h(s.nome)}</span>${quem === 'ambos' ? `<small>${s.q === 'd' ? 'Diovane':'Michele'}</small>`:''}</summary><div class="md">${s.html}</div></details>`).join('')}</details>`:'';
  const path = quem === 'ambos' ? CASAL : quem === 'michele' ? PLANO_M : PLANO_D;
  const foot = quem !== 'ambos' && pl ? `${pl.intro ? `<p>${inline(pl.intro)}</p>` : ''}${pl.extras.filter(ex=>!/^jantar/.test(norm(ex.titulo))).map(ex=>`<details class="swap"><summary>${inline(ex.titulo)}</summary><div class="md">${md(ex.linhas.join('\n'),path)}</div></details>`).join('')}` : '';
  return `${selector}<div class="ali-meal-grid">${main}${timetable}
    <div class="ali-dish"><section class="ali-card"><h3>${quem === 'ambos' ? 'Porções de cada um' : 'No prato'}</h3>${portion}${meal.meta && quem !== 'ambos' ? `<details class="ali-nutrients"><summary>Informações nutricionais</summary><p>${h(meal.meta)}</p></details>`:''}</section>
    ${stepper}${alternatives}<details class="ali-card ali-disclosure" data-stay="nota"><summary>Plano por escrito</summary>${foot}<button class="ali-link" type="button" data-open="${h(path)}">Ler a nota completa ↗</button></details></div></div>`;
}
function aliTrocas(P) {
  const quem = S.trocaP === 'michele' ? 'michele' : 'diovane', mi = quem === 'michele';
  const groups = (mi ? P.subsMi : P.dv?.grupos) || [];
  const q = norm(S.trocaQ).trim();
  const result = groups.map(g => ({...g,itens: q && !norm(g.nome).includes(q) ? g.itens.filter(i=>norm(i.n).includes(q)) : g.itens})).filter(g=>g.itens.length);
  const path = mi ? SUBS_M : PLANO_D;
  const controls = `<div class="ali-person"><span>Lista de substituições</span>${quemSeg(quem,['diovane','michele'],'data-trocap')}</div>`;
  if (!groups.length) return controls + '<p class="ali-nodata">A lista de substituições ainda não está nas notas.</p>';
  return `${controls}<div class="ali-search"><label for="aliBusca">Buscar nas substituições</label><input id="aliBusca" type="search" data-keep="trocaq" data-trocaq placeholder="Alimento ou grupo" value="${h(S.trocaQ)}"></div>
    <div class="ali-subhead"><h2>Grupos de alimentos</h2><p>${mi ? 'Cada opção equivale a uma porção do grupo.' : 'Cada opção já traz a quantidade prevista no plano.'}</p></div>
    <div class="ali-groups">${result.map(g=>`<details class="tg" data-grp="${h(g.nome)}"${q || S.trocaOpen === g.nome ? ' open':''}><summary><span class="tgn">${h(g.nome)}</span><span class="tgc">${g.itens.length} ${g.itens.length === 1 ? 'opção':'opções'}</span></summary>
      ${!mi && g.ref ? `<p class="tgr">No lugar de ${h(g.ref)}</p>`:''}<ul>${g.itens.map(i=>`<li><span>${h(i.n)}</span><span>${h(nb(i.q))}</span></li>`).join('')}</ul></details>`).join('') || '<p class="ali-nodata">Nenhum alimento ou grupo encontrado.</p>'}</div>
    <button type="button" class="ali-link" data-open="${path}">Abrir lista original ↗</button>`;
}
function comprasDoPlano(L) {
  const feitos = L.itens.filter(it=>it.pego).length;
  const grupos = new Map();
  for (const it of L.itens) {
    if (!grupos.has(it.tipo)) grupos.set(it.tipo,[]);
    grupos.get(it.tipo).push(it);
  }
  const open = [...grupos.keys()].find(key=>grupos.get(key).some(it=>!it.pego));
  const item = it => {
    const byPerson = [it.d && `Diovane ${fmtN(it.d)}`,it.m && `Michele ${fmtN(it.m)}`].filter(Boolean).join(' · ');
    const daily = (!cfg.discreet || S.reveal.has('#alimentacao')) && byPerson && it.u !== 'av' ? `${h(byPerson)}${it.u === 'un' ? '' : ' '+h(it.u)} por dia`:'';
    return `<li class="task${it.pego ? ' done':''}${it.box?.pending ? ' busy':''}"><button type="button" class="chk" role="checkbox" aria-checked="${it.pego}" data-pego="${h(it.key)}" aria-label="${it.pego ? 'Comprado' : 'Peguei'}: ${h(it.n)}">${ICON.check}</button>
      <div class="tx"><div class="t"><b>${h(it.n)}</b><span>${h(it.u === 'av' && cfg.discreet && !S.reveal.has('#alimentacao') ? 'à vontade' : it.qtd)}</span></div>${daily || it.sub || it.box ? `<div class="q2">${daily}${it.sub ? ` · No lugar, ${h(it.sub)}`:''}${it.box ? ' <span class="tag">na caixa</span>':''}</div>`:''}</div></li>`;
  };
  return `<section class="ali-basket"><div><p>Compras do plano</p><h2>${L.itens.length-feitos} <span>${L.itens.length-feitos === 1 ? 'item para pegar':'itens para pegar'}</span></h2><label for="aliProg">${feitos} de ${L.itens.length} no carrinho</label>
    <progress id="aliProg" max="${L.itens.length}" value="${feitos}"></progress></div>
    <div class="ali-days"><span>Comprar para</span><div class="days" role="group" aria-label="Dias de refeições">${[1,3,7,15].map(d=>`<button type="button" data-dias="${d}" aria-pressed="${d===S.dias}">${d} ${d===1 ? 'dia':'dias'}</button>`).join('')}</div></div></section>
    <div class="ali-subhead"><h2>Lista por setor</h2><p>Quantidades somadas dos dois planos para ${S.dias} ${S.dias===1?'dia':'dias'}.</p></div>
    <div class="ali-shop-groups">${[...grupos].map(([key,itens])=>`<details class="ali-card ali-disclosure" data-stay="setor-${h(key)}"${key===open ? ' open':''}><summary>${h(key)}<small>${itens.filter(it=>it.pego).length}/${itens.length} pegos</small></summary><ul class="tasks shop">${itens.map(item).join('')}</ul></details>`).join('')}</div>`;
}
function aliCompras() {
  const L = listaCompras();
  const secs = S.compras.secs;
  const extra = secs.map(s=>({...s,pendentes:S.ov.comprar.filter(it=>norm(it.sec) === norm(s.name))})).filter(s=>s.items.length || s.pendentes.length);
  const orphan = S.ov.comprar.filter(it=>!secs.some(s=>norm(s.name) === norm(it.sec)));
  return `${L ? comprasDoPlano(L) : '<p class="ali-nodata">A lista de compras do plano ainda não está nas notas.</p>'}
    <section class="ali-card ali-other"><h2>Outras compras</h2>${extra.map(s=>`<h3>${h(s.name)}</h3><ul class="tasks">${s.items.map(t=>{
      const checked = S.ov.comprado.get(norm(t.text));
      return `<li class="task${checked ? ' done':''}${checked?.pending ? ' busy':''}"><button type="button" class="chk" role="checkbox" aria-checked="${!!checked}" data-compra="${h(t.raw)}" aria-label="${checked ? 'Desfazer':'Comprado'}: ${h(t.text)}">${ICON.check}</button><div class="tx"><div class="t">${inline(t.text)}</div>${checked ? '<small>Na caixa</small>':''}</div></li>`;
    }).join('')}${s.pendentes.map(cxCompraLi).join('')}</ul>`).join('')}${orphan.length ? `<h3>Na caixa</h3><ul class="tasks">${orphan.map(cxCompraLi).join('')}</ul>`:''}
    ${extra.length || orphan.length ? '':'<p>A lista da casa está vazia.</p>'}
</section>`;
}
function clickPego(key) {
  const L = listaCompras(); if (!L) return;
  const it = L.itens.find(i => i.key === key); if (!it) return;
  if (it.box) { if (it.box.pending) return; delCaixa(S.cx.find(c => c.block === it.box.block && c.path === it.box.path) || it.box, 'Desfeito.'); return; }
  if (it.pego) { toast('Já organizado pelo assessor (está em Comprados).'); return; }
  addCaixa([`🛒 Comprado: ${it.n} — ${it.qtd} (${L.dias} ${L.dias > 1 ? 'dias' : 'dia'}, plano)`], { msg: `comprado — ${short(it.n, 40)}` });
}

/* ─────────────── eventos ─────────────── */
function copiar(txt, ok) {
  try { navigator.clipboard.writeText(txt).then(() => toast(ok), () => toast('Não consegui copiar. Tente de novo no computador.', { err: true })); } catch { toast('Não consegui copiar. Tente de novo no computador.', { err: true }); }
}
function bind() {
  document.addEventListener('click', ev => {
    const t = ev.target.closest('[data-humor],[data-reveal-sentir],[data-tarefa-privacidade],[data-commit],[data-open],[data-task],[data-compra],[data-cxdel],[data-tab],[data-mdt],[data-reveal],[data-find],[data-reg],[data-mood],[data-emo],#copyAsk,[data-act],[data-st],[data-day],[data-wk],[data-pick],[data-ficha],[data-regficha],[data-fmes],[data-ftab],[data-fo],[data-fedit],[data-fnova],[data-faba],[data-fcart],[data-fvenc],[data-fdia],[data-fcat],[data-alitab],[data-pessoa],[data-dias],[data-pego],[data-trocagrupo],[data-ref],[data-trocap],[data-close],[data-reveal-area],[data-ocultar-area],[data-area-captura],[data-anotar-nota],[data-box-remove],[data-sumario],[data-voltar]');
    if (!t) return;
    const d = t.dataset;
    // Painel só de leitura (22/11/2026): nada que grave nas notas, na caixa ou nas listas responde ao toque.
    if (ESCRITA.some(k => d[k] !== undefined)) { ev.preventDefault(); return; }
    if (d.humor) {
      const fi = fichasAll()[0];
      openSheet(`${fi.emoji} ${fi.nome}`, formFicha(fi), { focus: 'textarea[name=livre]' });
      $(`#shBody [data-pick="humor"][data-v="${d.humor}"]`)?.setAttribute('aria-checked', 'true');
      return;
    }
    if (d.revealSentir !== undefined) { S.reveal.add('#sentir'); renderSentir(); return; }
    if (d.tarefaPrivacidade !== undefined) {
      if (S.reveal.has('#tarefas')) S.reveal.delete('#tarefas'); else S.reveal.add('#tarefas');
      renderTasks(); $('#tasks [data-tarefa-privacidade]')?.focus(); return;
    }
    if (d.sumario) { ev.preventDefault(); sumario(d.sumario === 'abrir' && !S.sumario); return; }
    if (d.boxRemove !== undefined) { const it = S.cx[Number(d.boxRemove)]; if (it && !it.pending) delCaixa(it, 'Registro retirado da caixa.'); return; }
    if (t.id === 'copyAsk') { copiar('oi assessor, organiza a caixa do painel', 'Copiado. Cole no Claude: "oi assessor, organiza a caixa do painel"'); return; }
    const privacyArea = d.revealArea || d.ocultarArea;
    if (privacyArea && AREA_ORDER.includes(privacyArea)) {
      if (d.ocultarArea) S.reveal.delete('#area/' + privacyArea); else S.reveal.add('#area/' + privacyArea);
      if (S.page === 'financas') renderFinancas(); else renderAreaPage();
      return;
    }
    if (d.areaCaptura && AREA_ORDER.includes(d.areaCaptura)) {
      openSheet('Anotar em ' + AREAS[d.areaCaptura].nome, formNota(d.areaCaptura), { focus: 'textarea' });
      return;
    }
    if (d.anotarNota && S.files[d.anotarNota]) {
      const f = S.files[d.anotarNota];
      openSheet('Anotar sobre ' + plain(f.title), `<form class="f2" data-form="nota-vinculada" data-path="${h(f.path)}"><label class="field">Sua anotação<textarea name="txt" required></textarea></label><div class="form-foot"><button class="btn" type="submit">Guardar na caixa</button></div></form>`, { focus: 'textarea' });
      return;
    }
    if (d.close !== undefined) { closeSheet(); return; }
    if (d.pick) {
      const grp = t.closest('[role="radiogroup"]');
      if (grp) { for (const b of $$(`[data-pick="${d.pick}"]`, grp)) b.setAttribute('aria-checked', String(b === t)); }
      else t.setAttribute('aria-pressed', String(t.getAttribute('aria-pressed') !== 'true'));
      return;
    }
    if (d.ficha) { const fi = fichasAll().find(x => x.id === d.ficha); if (fi) openSheet(`${fi.emoji} ${fi.nome}`, formFicha(fi)); return; }
    if (d.regficha) { S.regFicha = d.regficha; renderRegistrar(); return; }
    if (d.act === 'ali-privacidade') {
      if (S.reveal.has('#alimentacao')) S.reveal.delete('#alimentacao'); else S.reveal.add('#alimentacao');
      renderAlimentacao(); return;
    }
    if (d.act) {
      const a = d.act;
      if (t.tagName === 'A') ev.preventDefault();
      if (a === 'nota') { openSheet('✏️ Anotar', formNota('geral'), { focus: 'textarea' }); return; }
      if (a === 'ficha-nova') { openSheet('Novo exercício', formFichaEd(null), { focus: 'input[name=nome]' }); return; }
      if (a === 'ficha-editar') { const fi = S.fichas.find(x => x.id === d.id); if (fi) openSheet('Editar exercício', formFichaEd(fi)); return; }
      if (a === 'ficha-del') { const f = t.closest('form'); if (f && f.dataset.id) { if (t.dataset.sure) apagarFicha(f.dataset.id); else { t.dataset.sure = '1'; t.textContent = 'Toque de novo pra apagar'; } } return; }
      if (a === 'campo-add') { t.closest('form').querySelector('[data-campos]').insertAdjacentHTML('beforeend', campoRow()); t.closest('form').querySelector('[data-campo]:last-child [data-q]').focus(); return; }
      if (a === 'campo-del') { const r = t.closest('[data-campo]'); if (r && r.parentElement.children.length > 1) r.remove(); else if (r) r.querySelector('[data-q]').value = ''; return; }
      if (a === 'mais') { sheetMais(); return; }
      if (a === 'buscar') { closeSheet(); openFind(); return; }
      if (a === 'ajustes') { closeSheet(); showCfg(); return; }
      if (a === 'olho') { closeSheet(); cfg.discreet = !cfg.discreet; saveCfg(); S.reveal.clear(); render(); return; }
      return;
    }
    if (d.voltar !== undefined) { ev.preventDefault(); history.back(); return; }
    if (d.commit) { ev.preventDefault(); openCommit(d.commit); return; }
    if (d.open !== undefined) { ev.preventDefault(); closeFind(); openNote(d.open); return; }
    if (d.task) { clickTask(d.task); return; }
    if (d.compra) { const t2 = S.files[COMPRAS]?.tasks.find(x => x.raw === d.compra); if (t2) clickCompra(t2); return; }
    if (d.cxdel) { const it = S.cx.find(i => i.path + '\n' + i.block === d.cxdel); if (it) delCaixa(it, 'Tirei da caixa.'); return; }
    if (d.mdt) {
      if (S.tasks.some(x => x.key === d.mdt)) clickTask(d.mdt);
      else if (d.mdpath === COMPRAS) { const t2 = S.files[COMPRAS]?.tasks.find(x => x.raw === d.mdraw); if (t2) clickCompra(t2); }
      return;
    }
    if (d.reveal) { S.reveal.add(d.reveal); if (S.open) renderDrawer(); renderAreaPage(); renderNotaPage(); return; }
    if (d.find) { const r = findList[+d.find]; if (r) { closeFind(); openNote(r.f.path); } return; }
    if (d.reg) { location.hash = '#registrar/' + d.reg; return; }
    if (d.pessoa) { S.pessoa = d.pessoa; LS.set(K + 'pessoa2', d.pessoa); renderAlimentacao(); return; }
    if (d.ref) {
      S.aliRef = d.ref === 'agora' ? null : d.ref;
      renderAlimentacao();
      $('#aliMealTitle')?.focus({preventScroll:true});
      return;
    }
    if (d.trocap) { S.trocaP = d.trocap; S.trocaOpen = null; LS.set(K + 'trocap', d.trocap); renderAlimentacao(); return; }
    if (d.dias) { S.dias = +d.dias; LS.set(K + 'dias', S.dias); renderAlimentacao(); renderInicio(); return; }
    if (d.pego) { clickPego(d.pego); return; }
    if (d.trocagrupo) { S.aliTab = 'trocas'; S.trocaP = d.tp || (S.pessoa === 'michele' ? 'michele' : 'diovane'); S.trocaQ = ''; S.trocaOpen = d.trocagrupo; history.replaceState(null, '', '#alimentacao/trocas'); renderAlimentacao(); const g = $$('[data-grp]').find(x => x.dataset.grp === d.trocagrupo); if (g) { g.scrollIntoView({ behavior: 'smooth', block: 'start' }); g.classList.add('flash'); } return; }
  });
  document.addEventListener('contextmenu', ev => { if (!ev.target.closest('input,textarea,select,[contenteditable]')) ev.preventDefault(); });
  document.addEventListener('input', ev => {
    const t = ev.target;
    if (t.matches('[data-range]')) { t.dataset.set = '1'; const o = t.parentElement.querySelector('output'); if (o) o.textContent = t.value; const hh = t.closest('.field')?.querySelector('[data-rh]'); if (hh) hh.textContent = 'Marcado.'; return; }
    if (t.matches('[data-trocaq]')) { S.trocaQ = t.value; renderAlimentacao(); return; }
  });
  document.addEventListener('change', ev => {
    const t = ev.target;
    if (t.matches('[name=areaNota]') && t.closest('#regBody')) S.notaArea = t.value;
    if (t.matches('select[data-outro]') && t.value === '__outro') {
      const campo = document.createElement('input');
      Object.assign(campo, { type: 'text', name: t.name, id: t.id, required: t.required, placeholder: 'Escreva o valor' });
      t.replaceWith(campo); campo.focus();
    }
    if (t.matches('[data-ficha-escolha]')) { S.regFicha = t.value; renderRegistrar(); }
    if (t.matches('input[type=file][name=arq]')) {
      const box = t.closest('form').querySelector('[data-prev]'), file = t.files && t.files[0];
      if (!file) { box.innerHTML = ''; return; }
      if (/^image\//.test(file.type)) { const r = new FileReader(); r.onload = () => { box.innerHTML = `<img src="${r.result}" alt=""><span>${h(short(file.name, 30))}</span>`; }; r.readAsDataURL(file); }
      else box.innerHTML = `<span>📄 ${h(short(file.name, 34))}</span>`;
    }
  });
  document.addEventListener('submit', ev => {
    const f = ev.target;
    const kind = f.dataset.form;
    if (kind) { ev.preventDefault(); return; }
    if (kind === 'captura') { enviarCaptura(f); return; }
    if (kind === 'nota') { concluirCaptura(f, () => saveNota(f.elements.txt.value, f.elements.areaNota.value)); return; }
    if (kind === 'ficha') { submitFicha(f); return; }
    if (kind === 'ficha-ed') { salvarFicha(f); return; }
    if (kind === 'outro') { const txt = oneLine(f.txt.value); if (!txt) { f.txt.focus(); return; } const lugar = f.lugar.value; addCaixa([`🛒 Comprado: ${txt}${lugar ? ` (no lugar de ${lugar})` : ''}`], { msg: `comprado — ${short(txt, 40)}`, ok: lugar ? `Anotado no lugar de ${lugar}.` : 'Anotado.' }); f.txt.value = ''; f.lugar.value = ''; return; }
    if (kind === 'addcompra') { const txt = oneLine(f.txt.value); if (!txt) { f.txt.focus(); return; } addCompraBox(txt, f.sec.value); f.txt.value = ''; return; }
    if (kind === 'nota-vinculada') {
      const field = f.elements.txt;
      const v = field.value.trim(), nf = S.files[f.dataset.path];
      if (!v || !nf) return;
      const lines = v.split(/\n+/);
      const an = AREAS[nf.area]?.nome || (nf.path.startsWith('casos/') ? 'Caso' : 'Geral');
      addCaixa([`📝 Anotação (${an}): ${lines[0]} → ${nf.path}`, ...lines.slice(1)], { sens: nf.sens, msg: `anotação sobre ${short(plain(nf.title), 40)}`, ok: 'Guardado na caixa. O assessor atualiza a nota.' });
      field.value = '';
      closeSheet();
    }
  });
  document.addEventListener('keydown', ev => {
    const t = ev.target;
    if (ev.key === 'Enter' && !ev.shiftKey && !ev.isComposing && t.matches && t.matches('form[data-form="nota"] textarea') && t.closest('#sheet')) { ev.preventDefault(); t.form.requestSubmit(); }
    if (ev.key === 'Enter' && !ev.shiftKey && !ev.isComposing && t.matches && t.matches('form[data-form="captura"] textarea') && matchMedia('(pointer: fine)').matches) { ev.preventDefault(); t.form.requestSubmit(); }
  });
  // "Ver mais" do sumário lembra se ele abriu ou fechou (só quando é ele quem clica)
  $('#eye').onclick = () => { cfg.discreet = !cfg.discreet; saveCfg(); S.reveal.clear(); render(); };
  $('#openCfg').onclick = showCfg;
  $('#openFind').onclick = openFind;
  $('#find').addEventListener('click', ev => { if (ev.target.id === 'find') closeFind(); });
  $('#sheet').addEventListener('click', ev => { if (ev.target.id === 'sheet') closeSheet(); });
  $('#shClose').onclick = closeSheet;
  $('#findIn').addEventListener('input', doFind);
  $('#findIn').addEventListener('keydown', ev => {
    if (ev.key === 'ArrowDown') { ev.preventDefault(); moveFind(1); }
    else if (ev.key === 'ArrowUp') { ev.preventDefault(); moveFind(-1); }
    else if (ev.key === 'Enter') { const r = findList[findSel]; if (r) { closeFind(); openNote(r.f.path); } }
  });
  $('#drClose').onclick = closeNote;
  $('#scrim').onclick = closeNote;
  document.addEventListener('keydown', ev => {
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName);
    if ((ev.metaKey || ev.ctrlKey) && ev.key.toLowerCase() === 'k') { ev.preventDefault(); $('#find').hidden ? openFind() : closeFind(); return; }
    if (ev.key === '/' && !typing && $('#find').hidden && !$('#app').hidden && !sheetOpen()) { ev.preventDefault(); openFind(); return; }
    if (ev.key === 'Escape') {
      if (!$('#find').hidden) closeFind();
      else if (sheetOpen()) closeSheet();
      else if (!$('#cfg').hidden) $('#cfg').hidden = true;
      else if (S.open) closeNote();
      else if (S.sumario) sumario(false);
    }
  });
  addEventListener('hashchange', route);
  matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', () => cfg.theme === 'auto' && applyTheme());
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && Date.now() - S.lastTry > 4000) sync(); });
  addEventListener('online', () => sync());
}
function saveNota(v, area) {
  v = String(v || '').trim();
  if (!v) return false;
  const lines = v.split(/\n+/);
  const nome = area === 'geral' ? 'Geral' : AREAS[area]?.nome || area;
  return addCaixa([`📝 Anotação (${nome}): ${lines[0]}`, ...lines.slice(1)], { sens: SENS.has(area), msg: `anotação (${nome.toLowerCase()})`, ok: 'Nota guardada na caixa.' });
}
function addCompraBox(txt, sec) { addCaixa([`🛒 Comprar (${sec}): ${txt}`], { msg: `comprar — ${short(txt, 50)}`, ok: 'Na caixa. O assessor põe na lista.' }); }

function tick() {
  const n = now();
  if ($('#app').hidden) return;
  const m = n.getHours() * 60 + n.getMinutes();
  if (ymd(n) !== S.day) render();
  else if (m !== S.minute) {
    renderInicio();
    if (S.page === 'alimentacao' && S.aliTab === 'plano' && !S.aliRef) {
      const marker = $('#ali [data-meal-key]');
      const meals = refeicoesOrdenadas(refeicoesDaPessoa(S.plano || {}, S.pessoa));
      const next = refeicaoDoHorario(meals, n);
      if (marker && next && marker.dataset.mealKey !== chaveRefeicao(next)) renderAlimentacao();
    }
  }
  setLive();
  if (!cfg.token || S.syncing || document.visibilityState !== 'visible') return;
  let wait = cfg.interval * 1000;
  if (S.err === 'offline' || S.err === 'http') wait = Math.max(wait, 30000);
  if (S.err === 'rate') wait = Math.max(30000, (S.rateReset || 0) - Date.now());
  if (Date.now() - S.lastTry >= wait) sync();
}

async function start() {
  $('#setup').hidden = true;
  $('#app').hidden = false;
  await Blobs.init();
  if (await loadSnap()) reindex(); else buildCaixa();
  route();
  render();
  sync(true);
}

applyTheme();
bind();
setInterval(tick, 1000);
tick();
if (cfg.token) start(); else showSetup();
