// Cada item pertence a um só grupo. A conclusão pendente da caixa já vale na interface.
export function organizarTarefas(tarefas, hoje, estado) {
  const grupos = { atrasadas: [], hoje: [], proximas: [], semdata: [], feitas: [] };
  const conclusoes = new Map();
  for (const tarefa of tarefas) {
    const { feita, data } = estado(tarefa);
    if (feita) {
      grupos.feitas.push(tarefa);
      conclusoes.set(tarefa, data || '');
    } else if (!tarefa.due) grupos.semdata.push(tarefa);
    else if (tarefa.due < hoje) grupos.atrasadas.push(tarefa);
    else if (tarefa.due === hoje) grupos.hoje.push(tarefa);
    else grupos.proximas.push(tarefa);
  }
  const prioridade = t => t.prio === 'alta' ? 0 : t.prio === 'baixa' ? 2 : 1;
  const porPrazo = (a, b) => (a.due || '').localeCompare(b.due || '') || prioridade(a) - prioridade(b);
  for (const nome of ['atrasadas', 'hoje', 'proximas', 'semdata']) grupos[nome].sort(porPrazo);
  grupos.feitas.sort((a, b) => conclusoes.get(b).localeCompare(conclusoes.get(a)));
  return grupos;
}

export function primeiroPasso(grupos, podeMostrar) {
  for (const nome of ['atrasadas', 'hoje']) {
    const tarefas = grupos[nome].filter(t => !t.nova && podeMostrar(t));
    const primeiro = tarefas.find(t => t.prio === 'alta') || tarefas[0];
    if (primeiro) return primeiro;
  }
  return null;
}
