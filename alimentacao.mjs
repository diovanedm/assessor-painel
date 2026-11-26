function hhmm(meal) {
  const match = String(meal.t).match(/^(\d{1,2}):(\d{2})$/);
  if (!match || +match[1] > 23 || +match[2] > 59) return Infinity;
  return 60 * Number(match[1]) + Number(match[2]);
}

export function refeicoesOrdenadas(meals) {
  return (meals || []).filter(m => Number.isFinite(hhmm(m))).sort((a,b) => hhmm(a) - hhmm(b));
}

// Durante os dez minutos seguintes, a refeição do horário continua em destaque.
export function refeicaoDoHorario(meals, date) {
  if (!meals.length) return null;
  const minute = date.getHours() * 60 + date.getMinutes();
  const current = meals.findLastIndex(m => hhmm(m) <= minute && hhmm(m) >= minute - 10);
  const upcoming = meals.findIndex(m => hhmm(m) > minute);
  const tomorrow = current < 0 && upcoming < 0;
  const index = current >= 0 ? current : tomorrow ? 0 : upcoming;
  return {index, meal:meals[index], amanha:tomorrow, mins: hhmm(meals[index]) - minute + (tomorrow ? 1440 : 0)};
}

/* Trocas fixas (26/11/2026): ele escolhe uma troca para um item da refeição e ela fica
   no lugar do original até ele desfazer. Fica em painel/trocas.md; o plano da nutricionista não muda.
   Linha: "- Diovane · 08:10 Café da manhã · Pão francês → Tapioca · 45 g · desde 2026-11-26" */
const semAcento = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
const QUEM_NOME = { diovane: 'Diovane', michele: 'Michele' };
export const chaveTroca = (quem, t, item) => `${quem}|${t}|${semAcento(item)}`;
const LINHA = /^[-*]\s+(Diovane|Michele)\s+·\s+(\d{1,2}:\d{2})\s+(.+?)\s+·\s+(.+?)\s+→\s+(.+?)(?:\s+·\s+desde\s+(\d{4}-\d{2}-\d{2}))?\s*$/;

export function lerTrocas(texto) {
  const out = new Map();
  for (const l of String(texto || '').split('\n')) {
    const m = l.match(LINHA);
    if (!m) continue;
    const i = m[5].indexOf(' · ');
    const [n, q] = i < 0 ? [m[5].trim(), ''] : [m[5].slice(0, i).trim(), m[5].slice(i + 3).trim()];
    const quem = m[1].toLowerCase(), t = m[2].padStart(5, '0');
    out.set(chaveTroca(quem, t, m[4]), { quem, t, refeicao: m[3].trim(), orig: m[4].trim(), n, q, desde: m[6] || '' });
  }
  return out;
}

export function linhaTroca(tr) {
  return `- ${QUEM_NOME[tr.quem]} · ${tr.t} ${tr.refeicao} · ${tr.orig} → ${tr.n}${tr.q ? ' · ' + tr.q : ''}${tr.desde ? ' · desde ' + tr.desde : ''}`;
}

export function notaTrocas(hoje) {
  return `---\ntipo: referencia\narea: saude\nstatus: ativo\ntags: [trocas, substituicoes, plano-alimentar, refeicoes, alimentacao]\npessoas: []\nresumo: Trocas fixas escolhidas no painel — itens dos planos alimentares que estão no lugar do original até ele desfazer. O plano da nutricionista não muda.\natualizado: ${hoje}\n---\n\n# Trocas em uso\n\nO painel lê e grava esta nota (Refeições › item › Trocas). Cada linha: \`- Quem · hh:mm Refeição · Item do plano → Troca · quantidade · desde aaaa-mm-dd\`. Desfazer no painel tira a linha.\n\n## Trocas\n`;
}

/* Põe (tr) ou tira (tr sem n) a troca de um item; uma troca por item */
export function gravarTroca(base, tr, hoje) {
  const texto = base ?? notaTrocas(hoje);
  const alvo = chaveTroca(tr.quem, tr.t, tr.orig);
  const linhas = texto.split('\n').filter(l => { const m = l.match(LINHA); return !m || chaveTroca(m[1].toLowerCase(), m[2].padStart(5, '0'), m[4]) !== alvo; });
  let t = linhas.join('\n').replace(/\s+$/, '');
  if (tr.n) t += '\n' + linhaTroca({ ...tr, desde: tr.desde || hoje });
  return t + '\n';
}

/* O item como aparece no prato: com a troca, o nome e a quantidade dela */
export function aplicarTroca(item, quem, t, trocas) {
  const tr = trocas?.get(chaveTroca(quem, t, item.n));
  return tr ? { ...item, troca: tr } : item;
}
