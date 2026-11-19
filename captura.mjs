// Captura livre do painel: uma caixa de texto, fotos e áudio, como numa conversa.
// O assessor lê a linha "💬 Captura" na caixa e decide o que é (nota, gasto, check-in…).

const TIPO_ANEXO = [
  [/^audio\//, 'áudio'],
  [/^image\//, 'foto'],
  [/^application\/pdf$/, 'pdf'],
];
export const tipoAnexo = mime => (TIPO_ANEXO.find(([re]) => re.test(mime || '')) || [, 'arquivo'])[1];

export const extAudio = mime => /mp4|m4a|aac/.test(mime || '') ? 'm4a' : /ogg/.test(mime || '') ? 'ogg' : /wav/.test(mime || '') ? 'wav' : 'webm';

/** Monta as linhas do item da caixa. anexos: [{ tipo: 'foto'|'áudio'|'pdf'|'arquivo', caminho }] */
export function linhasCaptura(texto, anexos = []) {
  const partes = String(texto || '').replace(/\r/g, '').split(/\n+/).map(l => l.trim()).filter(Boolean);
  const primeira = partes.shift() || (anexos.length ? `(sem texto, ${anexos.map(a => a.tipo).join(' e ')})` : '');
  if (!primeira) return null;
  return [`💬 Captura: ${primeira}`, ...partes, ...anexos.map(a => `📎 ${a.tipo}: ${a.caminho}`)];
}

/** Separa o texto e os anexos de um item já lido da caixa (cont = linhas recuadas). */
export function lerCaptura(texto, cont = []) {
  const anexos = [], linhas = [];
  for (const l of cont) {
    const m = String(l).match(/^📎 ([^:]+): (\S+)$/u);
    if (m) anexos.push({ tipo: m[1], caminho: m[2] }); else linhas.push(String(l).replace(/^>\s?/, ''));
  }
  const t = /^\(sem texto, .+\)$/.test(texto || '') ? '' : texto || '';
  return { texto: [t, ...linhas].filter(Boolean).join('\n'), anexos };
}

/** Linhas de painel/organizados.md (gravadas pelo `cerebro.py caixa tirar c1=<nota>`):
 *  "- 2026-11-19 16:03 — 📝 Anotação (cultura): … → [[bateria]] (organizado 2026-11-19 16:33)"
 *  → { data, hora, texto, destino, orgData, orgHora }. A mais nova vem primeiro. */
export function lerOrganizados(body) {
  const out = [];
  for (const l of String(body || '').split(/\r?\n/)) {
    const m = l.match(/^- (\d{4}-\d{2}-\d{2}) (\d{1,2}:\d{2}) — (.*) → (.+?)(?: \(organizado (\d{4}-\d{2}-\d{2}) (\d{1,2}:\d{2})\))?$/u);
    if (m) out.push({ data: m[1], hora: m[2], texto: m[3], destino: m[4].trim(), orgData: m[5] || m[1], orgHora: m[6] || '' });
  }
  return out;
}

/** "[[bateria]]" → { stem: 'bateria' }; "planilha" → { texto: 'na planilha' }. */
export function destinoLegivel(destino) {
  const m = String(destino || '').match(/^\[\[([^\]|#]+)(?:\|[^\]]*)?\]\]$/);
  if (m) return { stem: m[1].trim() };
  const d = String(destino || '').trim(), n = d.toLowerCase();
  const fixos = { planilha: 'na planilha', ticktick: 'no TickTick', agenda: 'na agenda', calendar: 'na agenda', journal: 'no journal', organizado: '' };
  return { texto: n in fixos ? fixos[n] : d };
}
