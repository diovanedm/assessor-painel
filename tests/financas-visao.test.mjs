import test from 'node:test';
import assert from 'node:assert/strict';
import { lancamentosRealizados, graficoLancamentos } from '../financas-visao.mjs';

const item = (data, tipo, valor, i = 0) => ({ data, tipo, valor, i });

test('resumo considera a data de competência e limita o mês atual a hoje', () => {
  const itens = [
    item('2028-02-01', 'Receita', 100),
    { ...item('2028-02-01', 'Despesa', 18.85, 1), pagamento: 'Crédito' },
    { ...item('2028-02-08', 'Despesa', 2.80), pagamento: 'Vale-alimentação' },
    item('2028-02-09', 'Receita', 250),
    item('2028-02-01', 'Transferência', 20),
    item('2028-01-31', 'Despesa', 9),
  ];
  const dados = lancamentosRealizados(itens, '2028-02', '2028-02-08');
  assert.equal(dados.itens.length, 3);
  assert.deepEqual(dados.totais, { receita: 100, despesa: 21.65 });
  assert.deepEqual(dados.periodos, [
    { inicio: 1, fim: 7, receita: 100, despesa: 18.85 },
    { inicio: 8, fim: 8, receita: 0, despesa: 2.8 },
  ]);
  assert.equal(dados.itens[0].data, '2028-02-08');
  assert.equal(dados.itens[1].i, 1);
  assert.match(graficoLancamentos(dados), /<td>R\$ 2,80<\/td>/);
});

test('ano bissexto, valor negativo e mês vazio têm representação legível', () => {
  const dados = lancamentosRealizados([item('2028-02-29', 'Despesa', -5)], '2028-02', '2028-03-01');
  assert.deepEqual(dados.periodos.at(-1), { inicio: 29, fim: 29, receita: 0, despesa: -5 });
  assert.ok(!/NaN|Infinity/.test(graficoLancamentos(dados)));
  assert.match(graficoLancamentos(dados), /−R\$ 5,00/);
  const vazio = lancamentosRealizados([], '2028-04', '2028-03-01');
  assert.equal(vazio.periodos.length, 0);
  assert.match(graficoLancamentos(vazio), /Nenhuma receita ou despesa/);
  assert.doesNotMatch(graficoLancamentos(vazio), /fin-barras/);
});
