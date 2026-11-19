import test from 'node:test';
import assert from 'node:assert/strict';
import { organizarTarefas, primeiroPasso } from '../tarefas.mjs';

const hoje = '2030-05-08';
const estado = t => ({ feita: t.checked, data: t.done });
test('separa atrasadas, hoje, futuras, sem prazo, novas e todo o histórico', () => {
  const notas = [
    { due:'2030-05-07' }, { due:hoje }, { due:'2030-05-09' }, {},
    { checked:true }, { checked:true, done:'2030-05-01' }, { nova:true, due:hoje },
  ];
  const grupos = organizarTarefas(notas, hoje, estado);
  assert.deepEqual(grupos.atrasadas, [notas[0]]);
  assert.deepEqual(grupos.hoje, [notas[1], notas[6]]);
  assert.deepEqual(grupos.proximas, [notas[2]]);
  assert.deepEqual(grupos.semdata, [notas[3]]);
  assert.deepEqual(grupos.feitas, [notas[5], notas[4]]);
  assert.equal(new Set(Object.values(grupos).flat()).size, notas.length);
});

test('foco respeita prioridade, privacidade e confirmação das novas na caixa', () => {
  const simples = { due:hoje }, importante = { due:hoje, prio:'alta' };
  const nova = { due:'2030-05-01', nova:true }, reservada = { due:'2030-05-02', sens:true };
  const todas = organizarTarefas([nova,reservada,simples,importante], hoje, estado);
  assert.equal(primeiroPasso(todas, t => !t.sens), importante);
  assert.equal(primeiroPasso(todas, () => true), reservada);
  assert.equal(primeiroPasso(organizarTarefas([], hoje, estado), () => true), null);
});

test('prioridades do dia trazem atrasadas, hoje e alta sem prazo, nessa ordem', async () => {
  const { prioridadesDoDia } = await import('../tarefas.mjs');
  const atrasada = { due:'2030-05-01' }, deHoje = { due:hoje }, alta = { prio:'alta' }, comum = {}, futura = { due:'2030-06-01', prio:'alta' };
  const grupos = organizarTarefas([comum, alta, futura, deHoje, atrasada], hoje, estado);
  assert.deepEqual(prioridadesDoDia(grupos), [atrasada, deHoje, alta]);
});
