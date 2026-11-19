import test from 'node:test';
import assert from 'node:assert/strict';
import { pontoDeParada, carimbo, blocosDaSemanaModelo, textoDaBusca } from '../memoria.mjs';

test('retomar pega a situação mais recente, não o último "Parei aqui"', () => {
  const body = ['# Caso', '', '## Onde está', '',
    '**Agora (06/11):** ligar por volta de 16/11.', '',
    'A empresa respondeu em 06/11 dizendo outra coisa.', '',
    'Parei aqui (2026-11-17 11:40): falta responder o e-mail de 09/11.', '',
    '**Agora (17/11, 11h49):** o Procon respondeu.', '',
    '**17/11, 11h59:** contestação enviada. Esperando até 25/11 → cobrar.', '',
    '## Próximos passos', '- [ ] algo'].join('\n');
  assert.match(pontoDeParada({ body, meta: { atualizado: '2026-11-17' } }), /contestação enviada/);
});

test('sem data no começo das linhas, continua usando o "Parei aqui"', () => {
  const body = '## Onde está\n\nContexto solto.\n\nParei aqui: falta ligar.\n\n## Fim';
  assert.equal(pontoDeParada({ body, meta: {} }), 'Parei aqui: falta ligar.');
});

test('data no meio do texto não conta como carimbo', () => {
  assert.equal(carimbo('O que ele pede: reparo sem custo; se não der, troca. A assistência escreveu em 28/10.'), null);
  assert.deepEqual(carimbo('**Agora (17/11, 11h49):** x', 2026), [2026, 11, 17, 709]);
});

test('semana-modelo combina faixas de dias, início adiado e vigência do trimestre', () => {
  const plano = [
    '## Trimestre atual: 03/11/2026 a 31/01/2027',
    '## Semana-modelo',
    '| Qui | 12h30 | Saúde | academia (1h), a partir de 03/12 |',
    '| Seg–Qui e Dom | 22h00 | Emocional | journaling |',
    '| Qui | 7h00 | Inglês | sessão de 30 min |',
    '## Revisões',
    '| Qui | 9h00 | Outra área | fora da seção |',
  ].join('\n');
  assert.deepEqual(blocosDaSemanaModelo(plano, '2026-11-19').map(b => b.hora), ['07:00', '22:00']);
  assert.deepEqual(blocosDaSemanaModelo(plano, '2026-12-03')[1], { hora: '12:30', area: 'Saúde', texto: 'academia (1h)' });
  assert.deepEqual(blocosDaSemanaModelo(plano, '2026-12-06').map(b => b.area), ['Emocional']);
  assert.deepEqual(blocosDaSemanaModelo(plano, '2026-12-04'), []);
  assert.deepEqual(blocosDaSemanaModelo(plano, '2027-02-01'), []);
});

test('trechos da busca exibem texto e datas sem marcações de tarefa ou de tabela', () => {
  assert.equal(textoDaBusca('  - [x] Buscar o laço ✅ 2026-11-13 🆔 6abc'), 'Buscar o laço 13/11');
  assert.equal(textoDaBusca('| 2026-11-05 | Ensaio de música |'), '05/11 · Ensaio de música');
});
