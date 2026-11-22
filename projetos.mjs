// Aba Projetos (22/11/2026): tudo que tem começo e fim (as notas de casos/), com o andamento de cada um.
// Só leitura: o painel calcula a partir das notas; quem atualiza é o assessor.
import { norm, pymd } from './datas.mjs?v=d8e3ff85f4ed';

const ENCERRADO = /^(fechado|resolvido|concluido|encerrado)$/;
const diasEntre = (a, b) => Math.round((pymd(b) - pymd(a)) / 864e5);

/** Situação do projeto pelo `status` do frontmatter: 'andamento', 'esperando' ou 'concluido'. */
export function situacao(status) {
  const s = norm(status || '').trim();
  if (ENCERRADO.test(s)) return 'concluido';
  if (/^(esperando|aguardando|parado|pausado)/.test(s)) return 'esperando';
  return 'andamento';
}

/** Um projeto pronto para mostrar: andamento das tarefas, a próxima, há quanto tempo não mexe. */
export function resumoDoProjeto(f, hoje) {
  const tarefas = f.tasks || [];
  const feitas = tarefas.filter(t => t.checked).length;
  const abertas = tarefas.filter(t => !t.checked)
    .sort((a, b) => (a.due || '9999').localeCompare(b.due || '9999'));
  const proxima = abertas[0] || null;
  const atualizado = /^\d{4}-\d{2}-\d{2}/.test(String(f.meta?.atualizado || '')) ? String(f.meta.atualizado).slice(0, 10) : null;
  return {
    path: f.path, titulo: f.title, area: f.area, status: f.meta?.status || '', situacao: situacao(f.meta?.status),
    resumo: f.meta?.resumo || '',
    feitas, total: tarefas.length, abertas: abertas.length, proxima,
    atrasada: !!(proxima?.due && proxima.due < hoje),
    atualizado, parado: atualizado ? Math.max(0, diasEntre(atualizado, hoje)) : null,
  };
}

/** Todos os projetos (casos/), separados em andamento e concluídos.
    Em andamento: atrasados primeiro, depois pelo prazo da próxima tarefa, depois o mexido por último. */
export function projetos(arquivos, hoje) {
  const todos = Object.values(arquivos).filter(f => f.path.startsWith('casos/')).map(f => resumoDoProjeto(f, hoje));
  const ordem = (a, b) => Number(b.atrasada) - Number(a.atrasada)
    || (a.proxima?.due || '9999').localeCompare(b.proxima?.due || '9999')
    || String(b.atualizado || '').localeCompare(String(a.atualizado || ''));
  const andamento = todos.filter(p => p.situacao !== 'concluido').sort(ordem);
  const concluidos = todos.filter(p => p.situacao === 'concluido').sort((a, b) => String(b.atualizado || '').localeCompare(String(a.atualizado || '')));
  return { andamento, concluidos, atrasados: andamento.filter(p => p.atrasada).length };
}
