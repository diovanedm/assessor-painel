import test from 'node:test';
import assert from 'node:assert/strict';
import { lerOrganizados, destinoLegivel } from '../captura.mjs';

test('lê onde cada item da caixa ficou', () => {
  const body = ['# Organizados', '', '## Itens', '',
    '- 2026-11-19 16:03 — 📝 Anotação (cultura): aula » boa → [[bateria]] (organizado 2026-11-19 16:33)',
    '- 2026-11-19 15:00 — 💳 Compra: mercado — R$ 32 → planilha (organizado 2026-11-19 16:33)',
    '- 2026-11-18 09:00 — 🔒 Item reservado → organizado'].join('\n');
  const o = lerOrganizados(body);
  assert.equal(o.length, 3);
  assert.deepEqual(o[0], { data: '2026-11-19', hora: '16:03', texto: '📝 Anotação (cultura): aula » boa', destino: '[[bateria]]', orgData: '2026-11-19', orgHora: '16:33' });
  assert.equal(o[1].texto, '💳 Compra: mercado — R$ 32');
  assert.equal(o[2].orgData, '2026-11-18');
});

test('destino em palavras', () => {
  assert.deepEqual(destinoLegivel('[[bateria]]'), { stem: 'bateria' });
  assert.deepEqual(destinoLegivel('planilha'), { texto: 'na planilha' });
  assert.deepEqual(destinoLegivel('TickTick'), { texto: 'no TickTick' });
  assert.deepEqual(destinoLegivel('organizado'), { texto: '' });
});
