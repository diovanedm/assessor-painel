import test from 'node:test';
import assert from 'node:assert/strict';
import { calcularFinancas, orcamentoDoMes, filtrarLancamentos, valorCapturado } from '../financas.mjs';
import { casosEmAndamento, pontoDeParada } from '../memoria.mjs';

test('concilia cada conta identificada na data do respectivo saldo', () => {
  const p = planilha();
  p.abas.Saldos = [[], ['Banco A — conta', '200','Sim','18/11/2026','Não'], ['Banco B — conta','100','Sim','10/11/2026','Não']];
  p.abas.Lançamentos = [[], ['15/11/2026','Despesa','15','Casa','Compra (Banco B)','Débito'], ['18/11/2026','Despesa','9','Casa','Compra (Banco A)','Pix']];
  assert.equal(calcularFinancas(p,hoje).proj.find(x => x.tipo === 'atual').saldo_atual,285);
});
test('um recorrente já lançado conta uma única vez e o crédito abate o total da fatura', () => {
  const p = planilha();
  p.abas.Lançamentos = [[], ['23/11/2026','Despesa','40','Casa','Serviço digital (Azul)','Crédito']];
  p.abas.Cartões[1][4] = '55';
  p.abas.Recorrentes = [[], ['Serviço digital','40','23','Azul','Casa','11/2026','1','Sim'], ['Clube','25','22','Azul','Casa','11/2026','1','Sim']];
  const f = calcularFinancas(p,hoje).faturas[0];
  assert.deepEqual([f.lancado, f.previsto, f.total, f.compras], [40,25,10,2]);
});
test('valores digitados em reais aceitam milhar e centavos', () => {
  assert.equal(valorCapturado('1.000'), 1000);
  assert.equal(valorCapturado('R$ 1.234,56'), 1234.56);
  assert.equal(valorCapturado('12.50'), 12.5);
  assert.ok(Number.isNaN(valorCapturado('1,234')));
  assert.ok(Number.isNaN(valorCapturado('0')));
});

const hoje = new Date(2026, 10, 19, 12);
function planilha() {
  return { abas: {
    Lançamentos: [['Data', 'Tipo', 'Valor', 'Categoria', 'Descrição', 'Pagamento'],
      ['15/11/2026', 'Despesa', '25,25', 'Mercado', 'Padaria da praça', 'Pix'],
      ['17/11/2026', 'Despesa', '80,00', 'Casa', 'Luminária (Azul)', 'Crédito'],
      ['18/11/2026', 'Despesa', '10,00', 'Mercado', 'Feira', 'Vale-alimentação'],
      ['2026-11-20', 'Receita', '120,00', 'Aulas', 'Oficina de sábado', 'Pix'],
      ['19/12/2026', 'Despesa', '10,00', 'Casa', 'Papel (Azul)', 'Crédito']],
    Saldos: [[], ['Carteira', '500,00', 'Sim', '14/11/2026', 'Não'], ['Reserva', '1200,00', 'Sim', '14/11/2026', 'Sim']],
    Orçamento: [[], ['Mercado', '30,00'], ['Casa', '90,00']],
    Contas: [[], ['Internet', '30,00', '25/11/2026', 'Não', 'Pendente'], ['Telefone', '8,00', '10/11/2026', 'Não', 'Pago']],
    Cartões: [[], ['Azul', '15', '24', '24/10/2026', '', 'Azul']],
    Recorrentes: [], Config: [],
  }};
}
test('trata Pix, benefício, reserva, receita futura e pagamento de fatura em seus meses', () => {
  const modelo = calcularFinancas(planilha(), hoje);
  const nov = modelo.proj.find(p => p.mes === '2026-11');
  const dez = modelo.proj.find(p => p.mes === '2026-12');
  assert.equal(nov.saldo_atual, 474.75);
  assert.equal(nov.reserva, 1200);
  assert.equal(nov.saldo_final, 564.75);
  assert.equal(dez.a_sair, 80);
  assert.equal(modelo.faturas.find(f => f.vencimento === '2026-12-24').lancado, 80);
  assert.equal(modelo.movs.filter(m => m.fonte === 'fatura' && m.mes === '2026-12').length, 1);
});
test('orçamento usa a data da compra e o extrato aceita filtros de tipo e texto sem acento', () => {
  const modelo = calcularFinancas(planilha(), hoje);
  const orc = orcamentoDoMes(modelo, '2026-11');
  assert.equal(orc.find(c => c.categoria === 'Mercado').restante, -5.25);
  assert.equal(orc.find(c => c.categoria === 'Casa').gasto, 80);
  assert.equal(orcamentoDoMes(modelo, '2026-12').find(c => c.categoria === 'Casa').gasto, 10);
  assert.equal(filtrarLancamentos(modelo, '2026-11', 'Despesa', 'luminaria').length, 1);
  assert.equal(filtrarLancamentos(modelo, '2026-11', 'Receita', 'sabado').length, 1);
  assert.equal(filtrarLancamentos(modelo, '2026-11', 'Receita', 'praça').length, 0);
});
test('saldo ausente é desconhecido e o pagamento integral retira a fatura da previsão', () => {
  const p = planilha(); p.abas.Saldos = [];
  p.abas.Cartões[1][3] = '24/12/2026';
  const m = calcularFinancas(p, hoje);
  assert.equal(m.proj.find(p => p.tipo === 'atual').saldo_atual, null);
  assert.equal(m.proj.find(p => p.tipo === 'atual').saldo_final, null);
  assert.equal(m.movs.filter(x => x.fonte === 'fatura' && x.mes === '2026-12').length, 0);
});
test('casos encerrados saem da retomada e o ponto de parada tem prioridade', () => {
  const caso = { path:'casos/teste.md', meta:{status:'aberto'}, body:'## Onde está\nSituação inicial.\nParei aqui na revisão.\n## Próximos passos\nLigar.' };
  assert.equal(pontoDeParada(caso), 'Parei aqui na revisão.');
  const fechado = { ...caso, path:'casos/fechado.md', meta:{status:'concluído'} };
  assert.deepEqual(casosEmAndamento({caso, fechado}), [caso]);
});
