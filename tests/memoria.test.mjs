import test from 'node:test';
import assert from 'node:assert/strict';
import { pontoDeParada, carimbo } from '../memoria.mjs';

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
