import test from 'node:test';
import assert from 'node:assert/strict';
import { colunasDaAba, linhaDoEspelho, linhaNova, linhasDaAba, paraCampo, paraPlanilha, pedidoPlanilha, numeroDigitado } from '../financas-edicao.mjs';
import { calcularFinancas } from '../financas.mjs';

const espelho = { calculadas: { 'Orçamento': [2, 3] }, abas: {
  'Lançamentos': [['Data', 'Tipo', 'Valor (R$)', 'Categoria', 'Descrição', 'Pagamento'],
    ['18/11/2026', 'Despesa', 'R$ 19,92', 'Transporte', 'Uber (Nubank)', 'Crédito'],
    ['19/11/2026', 'Despesa', 'R$ 1.103,90', 'Transporte', 'Oficina (Nubank)', 'Pix'],
    ['20/11/2026', 'Receita', 'R$ 200,00', 'Aulas', 'Aula de bateria', 'Pix']],
  'Orçamento': [['Categoria', 'Limite mensal (R$)', 'Gasto no mês (R$)', 'Restante (R$)'], ['Mercado', 'R$ 700,00', 'R$ 262,50', 'R$ 437,50']],
  'Recorrentes': [['Descrição', 'Valor', 'Dia da cobrança', 'Cartão', 'Categoria', 'Primeira cobrança (mm/aaaa)', 'Total de parcelas', 'Ativo (Sim/Não)'],
    ['Consórcio', '570,44', '7', 'Nubank', 'Transporte', '10/2026', '', 'Sim']],
  'Saldos': [['Conta', 'Saldo', 'Resgate imediato', 'Atualizado em', 'Reserva'], ['Nubank — conta', 'R$ 0,00', 'Sim', '17/11/2026', 'Não']],
} };

test('descobre o tipo de cada coluna e marca as calculadas', () => {
  const lanc = colunasDaAba(espelho, 'Lançamentos');
  assert.deepEqual(lanc.map(c => c.tipo), ['data', 'texto', 'valor', 'texto', 'texto', 'texto']);
  assert.deepEqual(lanc[1].opcoes, ['Despesa', 'Receita']);
  assert.deepEqual(lanc[4].opcoes, []);
  assert.deepEqual(lanc.filter(c => c.obrigatoria).map(c => c.i), [0, 1, 2, 3, 5]);
  const orc = colunasDaAba(espelho, 'Orçamento');
  assert.deepEqual(orc.map(c => c.calculada), [false, false, true, true]);
  const rec = colunasDaAba(espelho, 'Recorrentes');
  assert.equal(rec[5].tipo, 'mes');
  assert.equal(rec[2].tipo, 'numero');
  assert.equal(rec[1].tipo, 'valor');
});

test('converte valores da planilha para o formulário e de volta', () => {
  assert.equal(paraCampo('19/11/2026', 'data'), '2026-11-19');
  assert.equal(paraCampo('R$ 1.103,90', 'valor'), '1103,9');
  assert.equal(paraCampo('-R$ 860,36', 'valor'), '-860,36');
  const cols = colunasDaAba(espelho, 'Lançamentos');
  const { valores, erros } = paraPlanilha(cols, { 0: '2026-11-21', 1: 'Despesa', 2: '1.234,56', 3: 'Mercado', 4: 'Feira\n(Nubank)', 5: 'Pix' });
  assert.deepEqual(erros, []);
  assert.deepEqual(valores, ['21/11/2026', 'Despesa', '1234,56', 'Mercado', 'Feira (Nubank)', 'Pix']);
  assert.deepEqual(paraPlanilha(cols, { 0: '', 1: 'Despesa', 2: 'abc', 3: 'Mercado', 5: 'Pix' }).erros, ['Preencha Data.', 'Valor (R$): número inválido.']);
  const orc = paraPlanilha(colunasDaAba(espelho, 'Orçamento'), { 0: 'Mercado', 1: '800', 2: 'x' });
  assert.deepEqual(orc.valores, ['Mercado', '800', null, null]);
});

test('aceita os jeitos comuns de digitar números', () => {
  assert.equal(numeroDigitado('12.50'), 12.5);
  assert.equal(numeroDigitado('1.000'), 1000);
  assert.equal(numeroDigitado('R$ -5,5'), -5.5);
  assert.ok(Number.isNaN(numeroDigitado('1,2,3')));
  assert.equal(numeroDigitado(''), null);
});

test('lista as linhas com o número da planilha, mais recentes primeiro, e filtra pela busca', () => {
  const linhas = linhasDaAba(espelho, 'Lançamentos');
  assert.deepEqual(linhas.map(l => l.linha), [4, 3, 2]);
  assert.deepEqual(linhasDaAba(espelho, 'Lançamentos', 'uber').map(l => l.linha), [2]);
  assert.deepEqual(linhaDoEspelho(espelho, 'Lançamentos', 3)[4], 'Oficina (Nubank)');
});

test('linha nova vem com data de hoje e o pedido leva a linha original', () => {
  const cols = colunasDaAba(espelho, 'Lançamentos');
  assert.deepEqual(linhaNova(cols, 'Lançamentos', '2026-11-19').slice(0, 2), ['19/11/2026', 'Despesa']);
  const antes = linhaDoEspelho(espelho, 'Lançamentos', 2);
  assert.deepEqual(pedidoPlanilha('apagar', 'Lançamentos', 2, antes), { acao: 'apagar', aba: 'Lançamentos', linha: 2, antes });
  assert.deepEqual(Object.keys(pedidoPlanilha('criar', 'Saldos', null, null, ['x'])), ['acao', 'aba', 'valores']);
  assert.throws(() => pedidoPlanilha('editar', 'Resumo', 2, [], []));
});

test('o modelo guarda a linha da planilha de cada item', () => {
  const M = calcularFinancas(espelho, new Date(2026, 10, 20, 12));
  assert.deepEqual(M.lanc.map(r => r.linha), [2, 3, 4]);
  assert.equal(M.orc[0].linha, 2);
  assert.equal(M.saldos[0].linha, 2);
  assert.equal(M.rec[0].linha, 2);
  assert.equal(M.fatItens.find(x => x.origem === 'lançado').linha, 2);
});
