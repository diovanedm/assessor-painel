import test from 'node:test';
import assert from 'node:assert/strict';
import { projetos, situacao } from '../projetos.mjs';

const f = (path, status, atualizado, tasks) => ({ path, title: path, area: 'trabalho', meta: { status, atualizado }, tasks });
test('situação pelo status', () => {
  assert.equal(situacao('fechado'), 'concluido');
  assert.equal(situacao('em andamento'), 'andamento');
  assert.equal(situacao('Esperando o Procon'), 'esperando');
});
test('atrasados primeiro, concluídos à parte, andamento das tarefas', () => {
  const P = projetos({
    a: f('casos/a.md', 'aberto', '2026-11-20', [{ checked: false, due: '2026-11-30', text: 'x' }]),
    b: f('casos/b.md', 'aberto', '2026-11-01', [{ checked: true }, { checked: false, due: '2026-11-20', text: 'y' }]),
    c: f('casos/c.md', 'fechado', '2026-11-19', []),
    n: f('areas/x.md', 'aberto', '2026-11-19', []),
  }, '2026-11-22');
  assert.deepEqual(P.andamento.map(p => p.path), ['casos/b.md', 'casos/a.md']);
  assert.equal(P.atrasados, 1);
  assert.deepEqual([P.andamento[0].feitas, P.andamento[0].total, P.andamento[0].parado], [1, 2, 21]);
  assert.deepEqual(P.concluidos.map(p => p.path), ['casos/c.md']);
});
