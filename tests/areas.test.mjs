import test from 'node:test';
import assert from 'node:assert/strict';
import { destinoDaArea, linkDeRegistro, notasDaArea, primeiraMeta, secoesDeLeitura } from '../areas.mjs';

test('links dos registros reabrem a mesma nota, inclusive em subpastas', () => {
  const path = 'areas/cultura/leitura/Resenha #4.md';
  const route = destinoDaArea(linkDeRegistro(path), ['cultura']);
  assert.deepEqual(route, { area: 'cultura', registros: true, path });
  assert.equal(destinoDaArea('#area/incerta', ['cultura']), null);
  assert.equal(destinoDaArea('#area/cultura/registros/%', ['cultura']).path, null);
});

test('índice de leitura mostra a principal primeiro e os outros registros por atualização', () => {
  const files = ['cultura/a', 'saude/saude', 'cultura/z', 'cultura/cultura'].map((nome, i) => ({
    path: `areas/${nome}.md`, meta: { atualizado: `2026-10-0${i+1}` }, title: nome,
  }));
  assert.deepEqual(notasDaArea(files,'cultura').map(f => f.title), ['cultura/cultura','cultura/z','cultura/a']);
});

test('leitura por assunto preserva introduções, subtítulos, texto e exemplos de Markdown', () => {
  const body = ['# Área', 'Introdução', '## Metas', '- [ ] Terminar o caderno', '## Histórico',
    '~~~text', '## Cabeçalho dentro do exemplo', '~~~', '### Uma tarde', 'Descrição original.'].join('\n');
  const sections = secoesDeLeitura(body);
  assert.deepEqual(sections.map(s => s.title), ['Apresentação','Metas','Histórico']);
  assert.equal(sections[0].text, 'Introdução');
  assert.equal(primeiraMeta(sections), 'Terminar o caderno');
  assert.equal(sections.at(-1).text, '~~~text\n## Cabeçalho dentro do exemplo\n~~~\n### Uma tarde\nDescrição original.');
});
