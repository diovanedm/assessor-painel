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
