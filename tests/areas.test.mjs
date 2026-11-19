import test from 'node:test';
import assert from 'node:assert/strict';
import {
  areasDoTexto, destinoDaArea, diasDaArea, entradasDatadas, linkDeRegistro, metasDaTabela, notasDaArea,
  padroesDosHabitos, primeiraMeta, secoesDeLeitura, secoesDoTopico,
} from '../areas.mjs';

const nota = (path, body, meta = {}) => ({ path, body, meta, stem: path.split('/').pop().replace(/\.md$/, ''), title: path.split('/').pop().replace(/\.md$/, '') });

test('links e rotas da área: tópico, dias, um dia e notas de apoio, inclusive em subpastas', () => {
  const path = 'areas/cultura/leitura/Resenha #4.md';
  assert.deepEqual(destinoDaArea(linkDeRegistro(path), ['cultura']), { area: 'cultura', vista: 'nota', dia: null, path });
  assert.equal(linkDeRegistro('areas/cultura/cultura.md'), '#area/cultura');
  assert.equal(linkDeRegistro('areas/cultura/registros-cultura-2026-11.md'), '#area/cultura/dias');
  assert.equal(destinoDaArea('#area/incerta', ['cultura']), null);
  assert.equal(destinoDaArea('#area/cultura/nota/%', ['cultura']).path, null);
  assert.equal(destinoDaArea('#area/cultura', ['cultura']).vista, 'resumo');
  assert.equal(destinoDaArea('#area/cultura/combinados', ['cultura']).vista, 'combinados');
  assert.equal(destinoDaArea('#area/cultura/registros', ['cultura']).vista, 'dias');
  assert.deepEqual(destinoDaArea('#area/cultura/dia/2026-11-18', ['cultura']), { area: 'cultura', vista: 'dia', dia: '2026-11-18', path: null });
  assert.equal(destinoDaArea('#area/cultura/dia/ontem', ['cultura']).vista, 'resumo');
  // links antigos de "Registros escritos" continuam abrindo a nota
  assert.equal(destinoDaArea('#area/cultura/registros/leituras', ['cultura']).path, 'areas/cultura/leituras.md');
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

test('metas em tabela viram meta, atual, alvo e porcentagem quando os dois são números', () => {
  const texto = '| Meta | Atual | Alvo |\n|---|---|---|\n| Journaling às 22h | 2 | 5 dias por semana |\n| Ler um livro | — | 1 |';
  const metas = metasDaTabela(texto);
  assert.deepEqual(metas[0], { meta: 'Journaling às 22h', atual: '2', alvo: '5 dias por semana', pct: 40 });
  assert.equal(metas[1].pct, null);
  assert.equal(primeiraMeta([{ title: 'Metas do trimestre', text: texto }]), 'Journaling às 22h');
});

test('entradas com data: seções do dia, "Notas de dd/mm" e linhas de tabela', () => {
  const body = ['# Registros', '', '## 2026-11-17 ter', '', '- ✅ Academia', '### detalhe', 'texto', '',
    '## 2026-11-18 qua', '- ✅ Caminhada', '', '## Outra coisa', '', '| Data | Humor | Gatilho |', '|---|---|---|',
    '| 2026-11-16 seg | 4 | — |', '| 2026-02-30 | x | y |', '', 'Notas de 12/11 (palavras dele):', '- Foi bom', '- Mesa Hub', '', 'fora do bloco'].join('\n');
  const es = entradasDatadas(nota('areas/emocional/journal-2026-11.md', body));
  assert.deepEqual(es.map(e => [e.date, e.tipo]), [['2026-11-17', 'texto'], ['2026-11-18', 'texto'], ['2026-11-16', 'linha'], ['2026-11-12', 'texto']]);
  assert.equal(es[0].titulo, 'ter');
  assert.match(es[0].texto, /### detalhe\ntexto/);
  assert.deepEqual(es[2].campos, [['Humor', '4']]);
  assert.equal(es[3].titulo, 'palavras dele');
  assert.equal(es[3].texto, '- Foi bom\n- Mesa Hub');
});

test('dias da área juntam registros, casos da área e linhas de hábitos, decisões e documentos', () => {
  const files = [
    nota('areas/trabalho/registros-trabalho-2026-11.md', '# R\n\n## 2026-11-18 qua\n\n- ✅ Reunião com o gestor'),
    nota('areas/trabalho/trabalho.md', '# Trabalho\n\n## Histórico\n\n| Data | Sobre o quê | Ficou combinado |\n|---|---|---|\n| 2026-11-17 | Versões | documentar no docs |'),
    nota('casos/ao-170.md', '# AO-170\n\n## Linha do tempo\n\n| Data | O que aconteceu |\n|---|---|\n| 2026-11-18 | mergeado |\n| 2026-12-01 | futuro |', { area: 'trabalho' }),
    nota('casos/outro.md', '| Data | O que aconteceu |\n|---|---|\n| 2026-11-18 | não é da área |', { area: 'financas' }),
    nota('eu/habitos.md', '| data | o quê | área | ✅/❌ | motivo |\n|---|---|---|---|---|\n| 2026-11-18 | Drum Groove (20h30) | trabalho | ❌ | cansado |\n| 2026-11-18 | academia | saude | ✅ | — |'),
    nota('eu/decisoes.md', '| Data | Decisão | Por quê | Áreas |\n|---|---|---|---|\n| 2026-11-10 | Pré-commit roda tudo | pedido do gestor | Trabalho |\n| 2026-11-10 | Não comprar EA111 | furada | Finanças |'),
    nota('documentos/documentos.md', '## Registro\n\n| Data | Documento | Número | Caso |\n|---|---|---|---|\n| 2026-11-06 | Ocorrência | 123 | [[ao-170]] |'),
  ];
  const dias = diasDaArea(Object.fromEntries(files.map(f => [f.path, f])), 'trabalho', '2026-11-19');
  assert.deepEqual(dias.map(d => d.date), ['2026-11-18', '2026-11-17', '2026-11-10', '2026-11-06']);
  assert.deepEqual(dias[0].entradas.map(e => e.origem), ['registro', 'fora', 'caso']);
  assert.deepEqual(dias[0].entradas[1].campos, [['o quê', 'Drum Groove (20h30)'], ['✅/❌', '❌'], ['motivo', 'cansado']]);
  assert.equal(dias[2].entradas[0].fonte, 'Decisões');
  assert.equal(dias[3].entradas[0].fonte, 'Documentos');
});

test('tópicos acham as seções certas e o Histórico só quando registra combinados', () => {
  const principal = nota('areas/trabalho/trabalho.md', '# T\n\n## Combinados\n\n- Avisar a Apsis\n\n## Histórico\n\n| Data | Ficou combinado |\n|---|---|\n| 2026-11-01 | x |');
  const cuidados = nota('areas/saude/cuidados.md', '# C\n\n## Histórico\n\n| Data | Consulta |\n|---|---|\n| 2026-11-01 | y |');
  const conquistas = nota('areas/trabalho/conquistas.md', '# Conquistas\n\n| Data | Conquista |\n|---|---|\n| 2026-11-01 | z |');
  assert.deepEqual(secoesDoTopico([principal, cuidados], 'combinados').map(s => s.titulo), ['Combinados', 'Histórico']);
  assert.equal(secoesDoTopico([conquistas], 'conquistas')[0].inteira, true);
  assert.deepEqual(secoesDoTopico([principal], 'resumo'), []);
});

test('áreas citadas em texto livre', () => {
  assert.deepEqual([...areasDoTexto('Casa e Família')], ['casa-familia']);
  assert.deepEqual([...areasDoTexto('Finanças, Trabalho')].sort(), ['financas', 'trabalho']);
  assert.equal(areasDoTexto('Todos').size, 0);
});

test('padrões dos hábitos: feitos, faltas com motivo e o dia que mais falha', () => {
  const h = [
    { date: '2026-11-16', oque: 'academia (12h30)', area: 'saude', st: 'feito', motivo: '—' },
    { date: '2026-11-09', oque: 'academia (12h30)', area: 'saude', st: 'nao', motivo: 'reunião' },
    { date: '2026-11-02', oque: 'Academia', area: 'saude', st: 'nao', motivo: '—' },
    { date: '2026-11-11', oque: 'caminhada', area: 'saude', st: 'nao', motivo: '' },
    { date: '2026-11-11', oque: 'inglês', area: 'ingles', st: 'nao', motivo: '' },
  ];
  const p = padroesDosHabitos(h, 'saude', '2026-11-19');
  assert.equal(p.total, 4);
  assert.deepEqual(p.lista[0], { nome: 'academia', feito: 1, nao: 2, cancelado: 0, motivos: [{ date: '2026-11-09', motivo: 'reunião' }] });
  assert.equal(p.diaQueMaisFalha, 1);
});
