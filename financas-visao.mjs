import { brl, c2, dim } from './financas.mjs?v=21ba6c13873e';

// O extrato usa a data da compra, inclusive para crédito e vale-alimentação.
export function lancamentosRealizados(lancamentos, mes, hoje) {
  const [ano, numeroMes] = mes.split('-').map(Number);
  const fimMes = dim(ano, numeroMes);
  const mesAtual = hoje.slice(0, 7);
  const ultimoDia = mes > mesAtual ? 0 : mes === mesAtual ? Number(hoje.slice(8)) : fimMes;
  const periodos = [];
  for (let inicio = 1; inicio <= ultimoDia; inicio += 7) {
    periodos.push({ inicio, fim: Math.min(inicio + 6, ultimoDia), receita: 0, despesa: 0 });
  }
  const itens = lancamentos.filter(item => item.data.startsWith(mes + '-') && item.data <= hoje &&
    (item.tipo === 'Receita' || item.tipo === 'Despesa')).sort((a, b) => b.data.localeCompare(a.data) || b.i - a.i);
  const totais = { receita: 0, despesa: 0 };
  for (const item of itens) {
    const periodo = periodos[Math.floor((Number(item.data.slice(8)) - 1) / 7)];
    const tipo = item.tipo === 'Receita' ? 'receita' : 'despesa';
    periodo[tipo] = c2(periodo[tipo] + item.valor);
    totais[tipo] = c2(totais[tipo] + item.valor);
  }
  return { itens, periodos, totais, ultimoDia };
}

const faixa = p => p.inicio === p.fim ? String(p.inicio) : p.inicio + '–' + p.fim;

export function graficoLancamentos({ itens, periodos, totais }) {
  if (!itens.length) return '<p class="fin-empty">Nenhuma receita ou despesa realizada neste período.</p>';
  const valores = periodos.flatMap(p => [p.receita, p.despesa]);
  const maximo = Math.max(0, ...valores);
  const minimo = Math.min(0, ...valores);
  const y = valor => 100 * (maximo - valor) / (maximo - minimo || 1);
  const base = maximo === minimo ? 100 : y(0);
  const barra = (valor, tipo) => valor === 0 ? '' : '<i class="barra-' + tipo + '" style="top:' +
    Math.min(base, y(valor)).toFixed(3) + '%;height:' + Math.abs(y(valor) - base).toFixed(3) + '%"></i>';
  const legenda = (tipo, nome) => '<div class="fin-total"><span class="fin-key chave-' + tipo + '">' +
    nome + '</span><strong>' + brl(totais[tipo]) + '</strong></div>';
  const barras = periodos.map(p => '<div class="fin-par">' + barra(p.receita, 'receita') +
    barra(p.despesa, 'despesa') + '</div>').join('');
  const rotulos = periodos.map(p => '<span>' + faixa(p) + '</span>').join('');
  const tabela = periodos.map(p => '<tr><th scope="row">' + faixa(p) + '</th><td>' +
    brl(p.receita) + '</td><td>' + brl(p.despesa) + '</td></tr>').join('');
  return '<div class="fin-totais">' + legenda('receita', 'Receitas') + legenda('despesa', 'Despesas') +
    '</div><div class="fin-plot" aria-hidden="true"><div class="fin-barras"><i class="fin-base" style="top:' +
    base.toFixed(3) + '%"></i>' + barras + '</div><div class="fin-rotulos">' + rotulos +
    '</div></div><details class="fin-valores"><summary>Valores por período</summary><table><thead><tr>' +
    '<th scope="col">Dias do mês</th><th scope="col">Receitas</th><th scope="col">Despesas</th>' +
    '</tr></thead><tbody>' + tabela + '</tbody></table></details>';
}
