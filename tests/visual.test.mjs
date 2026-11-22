import test from 'node:test';
import assert from 'node:assert/strict';
import { humorRecente, marcosDaArea, nivelDeIngles, proximosDaArea, segundaDaSemana, semanaDaArea, tipoDeTreino, trilha } from '../visual.mjs';

test('semana começa na segunda e junta os hábitos da área', () => {
  assert.equal(segundaDaSemana('2026-11-22'), '2026-11-16');
  const s = semanaDaArea([{ date: '2026-11-17', oque: 'academia (12:30)', area: 'saude', st: 'feito' }, { date: '2026-11-17', oque: 'sessão', area: 'ingles', st: 'nao' }], 'saude', '2026-11-22');
  assert.equal(s.length, 7);
  assert.deepEqual(s[1].itens, [{ oque: 'academia (12:30)', st: 'feito', tipo: 'academia' }]);
  assert.equal(tipoDeTreino('corrida 5 km (16h30)'), 'corrida');
});
test('marcos: só os que não passaram, com os dias que faltam', () => {
  const m = marcosDaArea({ marcos: ['2026-12-13 o Festival', '2026-11-01 passado', 'sem data'] }, '2026-11-22');
  assert.deepEqual(m, [{ data: '2026-12-13', nome: 'o Festival', dias: 21 }]);
});
test('humor e dias de registro do journal', () => {
  const t = '| Data | Humor (1–5) | Emoção |\n|---|---|---|\n| 2026-11-16 seg | 4 | cansaço |\n| 2026-11-01 | 2 | x |\n| 2026-11-22 dom | — | — |';
  assert.deepEqual(humorRecente([t], '2026-11-22', 14), [{ date: '2026-11-16', humor: 4 }, { date: '2026-11-22', humor: null }]);
});
test('trilha, nível e próximos compromissos', () => {
  const tr = trilha('## Trilha\n\n| Fase | Tema | Status |\n|---|---|---|\n| 1 | JS | Concluída |\n| 2 | Testes | A fazer |\n\n## Outra\n| a | b |');
  assert.deepEqual(tr.map(f => [f.fase, f.feita]), [['1', true], ['2', false]]);
  const nv = nivelDeIngles([{ meta: 'Nível', atual: 'A2 alto', alvo: 'B1 (proposto)' }]);
  assert.deepEqual([nv.atual, nv.alvo], [1, 2]);
  const p = proximosDaArea({ agenda: [{ data: '2026-11-23', inicio: '07:00', titulo: 'Consulta', area: 'saude' }, { data: '2026-11-21', titulo: 'velho', area: 'saude' }] }, [], 'saude', '2026-11-22');
  assert.deepEqual(p.map(e => e.titulo), ['Consulta']);
});
