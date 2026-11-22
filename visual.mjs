// Dados do topo próprio de cada área (22/11/2026). Funções puras: recebem o que o painel já leu
// das notas e do espelho e devolvem números prontos para desenhar. Nada aqui grava.
import { addDays, norm, pymd, ymd } from './datas.mjs?v=608f29e12708';

const ehData = s => /^\d{4}-\d{2}-\d{2}$/.test(String(s || '')) && ymd(pymd(s)) === s;
const celulas = l => l.trim().replace(/^\|/, '').replace(/\|$/, '').split(/(?<!\\)\|/).map(c => c.trim());
const separador = l => /^\|\s*:?-{3,}/.test(l.trim());

/** Segunda-feira da semana de `hoje` (aaaa-mm-dd). */
export function segundaDaSemana(hoje) {
  const d = pymd(hoje);
  return ymd(addDays(d, -((d.getDay() + 6) % 7)));
}

/** Tipo de treino pelo nome do hábito: academia, corrida, caminhada ou outro. */
export function tipoDeTreino(oque) {
  const t = norm(oque).replace(/^[^a-z]+/, '');
  if (/^(academia|musculacao|treino)/.test(t)) return 'academia';
  if (/^corrida/.test(t)) return 'corrida';
  if (/^caminhada/.test(t)) return 'caminhada';
  return 'outro';
}

/** A semana (seg a dom) dos hábitos de uma área: [{ dia, itens: [{ oque, st, tipo }] }]. */
export function semanaDaArea(habitos, area, hoje) {
  const seg = segundaDaSemana(hoje);
  return [...Array(7)].map((_, i) => {
    const dia = ymd(addDays(pymd(seg), i));
    const itens = habitos.filter(h => h.area === area && h.date === dia && h.st)
      .map(h => ({ oque: h.oque, st: h.st, tipo: tipoDeTreino(h.oque) }));
    return { dia, itens };
  });
}

/** Próximos compromissos de uma área, do espelho do Google Agenda (com o agenda.md de reserva). */
export function proximosDaArea(espelho, eventos, area, hoje, n = 3) {
  const doEspelho = (Array.isArray(espelho?.agenda) ? espelho.agenda : [])
    .filter(e => e && e.area === area && ehData(e.data) && e.data >= hoje && e.titulo)
    .map(e => ({ data: e.data, inicio: e.inicio || null, titulo: e.titulo, link: e.link || '' }));
  const base = doEspelho.length ? doEspelho : (eventos || [])
    .filter(e => e.area === area && e.date >= hoje)
    .map(e => ({ data: e.date, inicio: e.allDay ? null : e.start, titulo: e.name, link: '' }));
  return base.sort((a, b) => (a.data + (a.inicio || '')).localeCompare(b.data + (b.inicio || ''))).slice(0, n);
}

/** Marcos com data no frontmatter (`marcos: [2026-12-13 Festival, …]`) → os que ainda não passaram, com os dias que faltam. */
export function marcosDaArea(meta, hoje) {
  const lista = [].concat(meta?.marcos || []);
  return lista.map(x => {
    const m = String(x).trim().match(/^(\d{4}-\d{2}-\d{2})\s+(.+)$/);
    if (!m || !ehData(m[1])) return null;
    const dias = Math.round((pymd(m[1]) - pymd(hoje)) / 864e5);
    return { data: m[1], nome: m[2].trim(), dias };
  }).filter(x => x && x.dias >= 0).sort((a, b) => a.data.localeCompare(b.data));
}

/** Linhas do journal (tabela Data | Humor …) nos últimos `dias`: [{ date, humor }], mais antigas primeiro. */
export function humorRecente(textos, hoje, dias = 14) {
  const desde = ymd(addDays(pymd(hoje), -(dias - 1)));
  const porDia = new Map();
  for (const texto of textos) {
    let head = null;
    for (const l of String(texto || '').split('\n')) {
      if (!l.trim().startsWith('|')) { head = null; continue; }
      if (separador(l)) continue;
      const c = celulas(l);
      if (!head) { head = c.map(x => norm(x)); continue; }
      const d = (c[0] || '').slice(0, 10);
      if (!/^data\b/.test(head[0]) || !ehData(d) || d < desde || d > hoje) continue;
      const i = head.findIndex(x => /^humor/.test(x));
      const v = i >= 0 ? Number((c[i] || '').match(/^\d/)?.[0]) : NaN;
      porDia.set(d, Number.isFinite(v) && v >= 1 && v <= 5 ? v : (porDia.get(d) ?? null));
    }
  }
  return [...porDia.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([date, humor]) => ({ date, humor }));
}

/** Tabela "Trilha" do plano de carreira: [{ fase, tema, status, feita }]. */
export function trilha(texto) {
  const out = [];
  let dentro = false, head = null;
  for (const l of String(texto || '').split('\n')) {
    if (/^##\s/.test(l)) { dentro = /^##\s+trilha\b/i.test(l); head = null; continue; }
    if (!dentro || !l.trim().startsWith('|') || separador(l)) continue;
    const c = celulas(l);
    if (!head) { head = c.map(x => norm(x)); continue; }
    const col = re => head.findIndex(x => re.test(x));
    const status = c[col(/^status/)] || '';
    out.push({ fase: c[col(/^fase/)] || String(out.length + 1), tema: c[col(/^tema/)] || '', status, feita: /conclu|feit|✅/i.test(status), atual: /andamento|fazendo|atual/i.test(status) });
  }
  return out;
}

const NIVEIS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
/** Nível de inglês pela meta "Nível | A2 alto | B1": { niveis, atual, alvo } (índices em NIVEIS). */
export function nivelDeIngles(metas) {
  const m = metas.find(x => /^n[ií]vel/i.test(x.meta));
  const idx = s => NIVEIS.indexOf((String(s || '').toUpperCase().match(/[ABC][12]/) || [])[0]);
  return { niveis: NIVEIS, atual: m ? idx(m.atual) : -1, alvo: m ? idx(m.alvo) : -1 };
}
