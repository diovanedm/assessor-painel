import test from 'node:test';
import assert from 'node:assert/strict';
import { agendaPorDia, idadeDoEspelho, momento, resumoFinanceiro, tarefasEmGrupos } from '../espelho.mjs';

const esp = {
  atualizado: '2030-05-08T07:00:00-03:00',
  agenda: [
    { data: '2030-05-08', inicio: '12:30', fim: '13:30', titulo: 'Academia', area: 'saude' },
    { data: '2030-05-08', inicio: null, titulo: 'Aniversário', area: 'casa-familia' },
    { data: '2030-05-08', inicio: '07:00', fim: '07:30', titulo: 'Inglês', area: 'ingles' },
    { data: '2030-05-09', inicio: '20:00', fim: '21:00', titulo: 'Drum Groove' },
    { data: '2030-05-20', inicio: '09:00', titulo: 'Fora da janela' },
    { data: 'ontem', titulo: 'Data quebrada' },
  ],
  tarefas: [
    { titulo: 'Hoje baixa', prazo: '2030-05-08', prioridade: 'baixa' },
    { titulo: 'Hoje alta', prazo: '2030-05-08', prioridade: 'alta' },
    { titulo: 'Atrasada', prazo: '2030-05-01' },
    { titulo: 'Semana', prazo: '2030-05-12' },
    { titulo: 'Depois', prazo: '2030-06-01' },
    { titulo: 'Sem prazo' },
    { prazo: '2030-05-08' },
  ],
  financas: {
    mes: '2030-05', saldoTotal: 1000, ganhos: 500, gastos: 700, resultado: -200,
    contas: [{ nome: 'A', saldo: 10 }, { nome: 'B', saldo: 990 }, { nome: 'Sem saldo' }],
    categorias: [{ nome: 'Casa', valor: 300 }, { nome: 'Lazer', valor: 100 }, { nome: 'Zero', valor: 0 }, { nome: 'Taxas', valor: 5 }],
    faturas: [{ cartao: 'Y', valor: 50, vence: '2030-06-16' }, { cartao: 'X', valor: 80, vence: '2030-06-10' }, { cartao: 'Paga', valor: 0, vence: '2030-06-01' }],
    ultimos: [{ data: '2030-05-08', descricao: 'Padaria', valor: 10 }, { descricao: 'Sem data', valor: 1 }],
  },
};

test('agenda: 7 dias a partir de hoje, dia todo primeiro e depois por horário', () => {
  const dias = agendaPorDia(esp, '2030-05-08');
  assert.equal(dias.length, 7);
  assert.deepEqual(dias[0].itens.map(e => e.titulo), ['Aniversário', 'Inglês', 'Academia']);
  assert.equal(dias[0].itens[0].diaTodo, true);
  assert.deepEqual(dias[1].itens.map(e => e.titulo), ['Drum Groove']);
  assert.ok(dias.every(d => !d.itens.some(e => e.titulo === 'Fora da janela')));
  assert.deepEqual(agendaPorDia(null, '2030-05-08', 2).map(d => d.itens.length), [0, 0]);
});

test('momento do compromisso: passou, agora ou depois', () => {
  const ac = { inicio: '12:30', fim: '13:30', diaTodo: false };
  assert.equal(momento(ac, '2030-05-08', '2030-05-08', 12 * 60), 'depois');
  assert.equal(momento(ac, '2030-05-08', '2030-05-08', 13 * 60), 'agora');
  assert.equal(momento(ac, '2030-05-08', '2030-05-08', 14 * 60), 'passou');
  assert.equal(momento(ac, '2030-05-07', '2030-05-08', 0), 'passou');
  assert.equal(momento({ diaTodo: true }, '2030-05-08', '2030-05-08', 23 * 60), 'depois');
});

test('tarefas: grupos por prazo, prioridade alta primeiro no mesmo dia, sem título fica de fora', () => {
  const g = tarefasEmGrupos(esp, '2030-05-08');
  assert.deepEqual(g.atrasadas.map(t => t.titulo), ['Atrasada']);
  assert.deepEqual(g.hoje.map(t => t.titulo), ['Hoje alta', 'Hoje baixa']);
  assert.deepEqual(g.semana.map(t => t.titulo), ['Semana']);
  assert.deepEqual(g.depois.map(t => t.titulo), ['Depois']);
  assert.deepEqual(g.semPrazo.map(t => t.titulo), ['Sem prazo']);
});

test('finanças: só números que vieram do app, faturas pela data de vencimento', () => {
  const r = resumoFinanceiro(esp, { categorias: 2 });
  assert.equal(r.saldoTotal, 1000);
  assert.deepEqual(r.contas.map(c => c.nome), ['B', 'A']);
  assert.deepEqual(r.categorias.map(c => [c.nome, c.valor]), [['Casa', 300], ['Lazer', 100], ['Outras 1', 5]]);
  assert.equal(r.categorias[0].parte, 1);
  assert.deepEqual(r.faturas.map(f => f.cartao), ['X', 'Y']);
  assert.equal(r.proximaFatura.cartao, 'X');
  assert.equal(r.ultimos.length, 1);
  assert.equal(resumoFinanceiro({}), null);
});

test('idade do espelho em minutos', () => {
  assert.equal(idadeDoEspelho(esp, new Date('2030-05-08T08:30:00-03:00')), 90);
  assert.equal(idadeDoEspelho({}, new Date()), null);
});
