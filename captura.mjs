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
