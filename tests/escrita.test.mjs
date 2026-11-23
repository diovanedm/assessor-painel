import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../escrita.mjs';

const pasta = `---
tipo: pasta
area: emocional
status: ativo
tags: [como me sinto]
pessoas: []
resumo: Como me sinto: registros com data.
ordem: data
atualizado: 2026-11-20
---

# Como me sinto

Um parágrafo de apresentação.

## 📌 Fixado — guia

- Ler antes de escrever.

## 2026-11-16 seg · ~17h50 — Fora da realidade

- Lendo no Substack.

### Detalhe

Mais texto.

## 2026-11-22 — Conversa com o ChatGPT

Texto da conversa.

## Sem data

Uma anotação solta.
`;

test('nome de arquivo e nome livre', () => {
  assert.equal(E.slug('Como me sinto?'), 'como-me-sinto');
  assert.equal(E.slug('Reuniões com o Paulo (Apsis)'), 'reunioes-com-o-paulo-apsis');
  assert.equal(E.slug('!!!'), 'nota');
  const tem = new Set(['como-me-sinto', 'como-me-sinto-emocional']);
  assert.equal(E.nomeLivre('como-me-sinto', tem, 'emocional'), 'como-me-sinto-2');
  assert.equal(E.nomeLivre('ideias', tem, 'trabalho'), 'ideias');
});

test('frontmatter: troca, acrescenta antes do atualizado e tira', () => {
  let t = E.definirCampo(pasta, 'ordem', 'titulo');
  assert.equal(E.campo(t, 'ordem'), 'titulo');
  t = E.definirCampo(t, 'arquivado', '2026-11-23');
  assert.match(t, /arquivado: 2026-11-23\natualizado: 2026-11-20\n---\n\n# Como me sinto/);
  t = E.definirCampo(t, 'arquivado', null);
  assert.equal(E.campo(t, 'arquivado'), '');
  assert.equal(E.campo(t, 'tipo'), 'pasta');
});

test('nota como pasta: fixados, registros com data e sem data; ### fica dentro do registro', () => {
  const R = E.registrosDaNota(pasta);
  assert.equal(R.intro, 'Um parágrafo de apresentação.');
  assert.deepEqual(R.fixados.map(r => r.rotulo), ['📌 Fixado — guia']);
  assert.deepEqual(R.registros.map(r => [r.data, r.rotulo]), [
    ['2026-11-16', '~17h50 — Fora da realidade'], ['2026-11-22', 'Conversa com o ChatGPT'], [null, 'Sem data']]);
  assert.match(R.registros[0].texto, /### Detalhe\n\nMais texto\./);
  assert.deepEqual(E.ordenarRegistros(R.registros, 'data').map(r => r.rotulo), ['Conversa com o ChatGPT', '~17h50 — Fora da realidade', 'Sem data']);
  assert.deepEqual(E.ordenarRegistros(R.registros, 'titulo').map(r => r.rotulo), ['~17h50 — Fora da realidade', 'Conversa com o ChatGPT', 'Sem data']);
});

test('registro novo entra na ordem das datas e com o título padrão', () => {
  let t = E.acrescentarRegistro(pasta, { data: '2026-11-18', titulo: 'Ansiedade antes da daily', texto: 'Linha 1\n\n\n\nLinha 2   ' });
  assert.match(t, /Mais texto\.\n\n## 2026-11-18 qua · Ansiedade antes da daily\n\nLinha 1\n\nLinha 2\n\n## 2026-11-22 — Conversa/);
  t = E.acrescentarRegistro(t, { data: '2026-11-23', titulo: '', texto: 'Sem título' });
  assert.match(t, /Uma anotação solta\.\n\n## 2026-11-23 seg\n\nSem título\n$/);
  assert.equal(E.chaveDoNovo(t, '2026-11-23', ''), '2026-11-23 seg');
  // mesma data: depois do que já existe
  t = E.acrescentarRegistro(t, { data: '2026-11-18', titulo: 'Outro', texto: 'x' });
  assert.ok(t.indexOf('2026-11-18 qua · Ansiedade') < t.indexOf('2026-11-18 qua · Outro'));
  assert.ok(t.indexOf('2026-11-18 qua · Outro') < t.indexOf('2026-11-22 — Conversa'));
});

test('título repetido ganha chave própria', () => {
  let t = E.acrescentarRegistro(pasta, { data: '2026-11-23', titulo: 'Dia', texto: 'a' });
  t = E.acrescentarRegistro(t, { data: '2026-11-23', titulo: 'Dia', texto: 'b' });
  const R = E.registrosDaNota(t).registros.filter(r => r.data === '2026-11-23');
  assert.deepEqual(R.map(r => r.chave), ['2026-11-23 seg · Dia', '2026-11-23 seg · Dia§2']);
  assert.equal(E.chaveDoNovo(t, '2026-11-23', 'Dia'), '2026-11-23 seg · Dia§2');
  const sem = E.tirarRegistro(t, '2026-11-23 seg · Dia§2');
  assert.deepEqual(sem.bloco, ['## 2026-11-23 seg · Dia', '', 'b']);
  assert.match(sem.texto, /## 2026-11-23 seg · Dia\n\na\n$/);
});

test('editar registro: no lugar, ou na posição da data nova', () => {
  let t = E.trocarRegistro(pasta, '2026-11-22 — Conversa com o ChatGPT', { data: '2026-11-22', titulo: 'Conversa com o ChatGPT', texto: 'Texto revisto.' });
  assert.match(t, /## 2026-11-22 dom · Conversa com o ChatGPT\n\nTexto revisto\.\n\n## Sem data/);
  t = E.trocarRegistro(t, '2026-11-22 dom · Conversa com o ChatGPT', { data: '2026-11-10', titulo: 'Antes', texto: 'y' });
  assert.match(t, /- Ler antes de escrever\.\n\n## 2026-11-10 ter · Antes\n\ny\n\n## 2026-11-16 seg/);
  assert.throws(() => E.trocarRegistro(t, 'não existe', { data: '2026-11-10', titulo: '', texto: '' }), { code: 'sumiu' });
});

test('mover: tira de uma nota e põe na outra na ordem das datas', () => {
  const { texto, bloco } = E.tirarRegistro(pasta, '2026-11-16 seg · ~17h50 — Fora da realidade');
  assert.ok(!texto.includes('Fora da realidade'));
  assert.match(texto, /- Ler antes de escrever\.\n\n## 2026-11-22 — Conversa/);
  const destino = E.novaPasta({ area: 'saude', titulo: 'Sono', hoje: '2026-11-23' });
  const d1 = E.acrescentarRegistro(destino, { data: '2026-11-20', titulo: 'Noite ruim', texto: 'acordei 3x' });
  const d2 = E.porBloco(d1, bloco);
  assert.match(d2, /# Sono\n\n## 2026-11-16 seg · ~17h50 — Fora da realidade\n\n- Lendo no Substack\.\n\n### Detalhe\n\nMais texto\.\n\n## 2026-11-20 sex · Noite ruim/);
});

test('pasta nova e pasta de tópico', () => {
  const p = E.novaPasta({ area: 'trabalho', titulo: 'Combinados', topico: 'combinados', resumo: 'Combinados do trabalho', hoje: '2026-11-23' });
  assert.match(p, /^---\ntipo: pasta\narea: trabalho\nstatus: ativo\ntags: \[combinados\]\npessoas: \[\]\nresumo: Combinados do trabalho\nordem: data\ntopico: combinados\natualizado: 2026-11-23\n---\n\n# Combinados\n$/);
  assert.doesNotMatch(E.novaPasta({ area: 'x', titulo: 'A, b', hoje: '2026-11-23' }), /topico:/);
});

test('registro do dia: itens na seção do dia (como o cerebro.py diario)', () => {
  let t = E.novoRegistroDoMes({ area: 'trabalho', mes: '2026-11', hoje: '2026-11-23' });
  assert.match(t, /# Trabalho — registros de novembro de 2026/);
  t = E.noDia(t, '2026-11-23', E.itensDoDia('Daily às 9h\n- Revisei o PR', '✅'));
  assert.match(t, /## 2026-11-23 seg\n\n- ✅ Daily às 9h\n- ✅ Revisei o PR\n$/);
  t = E.noDia(t, '2026-11-23', E.itensDoDia('Faltou o teste'));
  assert.match(t, /- ✅ Revisei o PR\n- Faltou o teste\n$/);
  t = E.noDia(t, '2026-11-21', ['- antes']);
  assert.match(t, /## 2026-11-21 sáb\n\n- antes\n\n## 2026-11-23 seg/);
  assert.match(E.novoDiario({ mes: '2026-12', hoje: '2026-12-01' }), /# Diário — dezembro de 2026/);
});

test('Agora e Importante da nota principal: cria na ordem, troca e tira', () => {
  let t = E.novaNotaPrincipal({ area: 'trabalho', hoje: '2026-11-23' });
  t = E.trocarSecao(t, 'Importante', '- Não trabalhar depois das 18h');
  t = E.trocarSecao(t, 'Agora', '- Sprint da versão de dezembro');
  assert.match(t, /# Trabalho\n\n## Agora\n\n- Sprint da versão de dezembro\n\n## Importante\n\n- Não trabalhar depois das 18h\n$/);
  assert.equal(E.textoDaSecao(t, 'Agora'), '- Sprint da versão de dezembro');
  t = E.trocarSecao(t, 'Agora', '');
  assert.doesNotMatch(t, /## Agora/);
});

test('metas: cria a tabela, acrescenta, troca e tira pro Histórico', () => {
  let t = E.novaNotaPrincipal({ area: 'ingles', hoje: '2026-11-23' });
  t = E.trocarSecao(t, 'Importante', '- x');
  t = E.acrescentarMeta(t, { meta: 'Sessões de inglês', atual: '2', alvo: '24' });
  assert.match(t, /## Metas do trimestre\n\n\| Meta \| Atual \| Alvo \|\n\|---\|---\|---\|\n\| Sessões de inglês \| 2 \| 24 \|\n\n## Importante/);
  t = E.acrescentarMeta(t, { meta: 'Ler A | B', atual: '', alvo: '1 livro' });
  assert.match(t, /\| Sessões de inglês \| 2 \| 24 \|\n\| Ler A \\\| B \| — \| 1 livro \|\n/);
  t = E.trocarMeta(t, 'Sessões de inglês', { meta: 'Sessões de inglês', atual: '5', alvo: '24' });
  assert.match(t, /\| Sessões de inglês \| 5 \| 24 \|/);
  t = E.tirarMeta(t, 'Ler A | B', '2026-11-23');
  assert.doesNotMatch(t, /Ler A \\\| B \| — \| 1 livro/);
  assert.match(t, /## Histórico\n\n\| Data \| Sobre o quê \| Ficou combinado \|\n\|---\|---\|---\|\n\| 2026-11-23 \| Meta tirada do trimestre: Ler A \\\| B \(alvo 1 livro\) \| — \|\n$/);
  assert.throws(() => E.trocarMeta(t, 'Não existe', { meta: 'a', atual: '', alvo: '' }), { code: 'sumiu' });
});

test('caso novo, acontecimento, número, contato e um "Agora" só', () => {
  let t = E.novoCaso({ titulo: 'Conserto da geladeira', area: 'casa-familia', resumo: 'Geladeira parou de gelar', agora: 'Liguei na Brastemp', hoje: '2026-11-23' });
  assert.match(t, /^---\ntipo: caso\narea: casa-familia\nstatus: aberto\n/);
  assert.match(t, /## Onde está\n\n\*\*Agora \(23\/11\):\*\* Liguei na Brastemp\n\n## Contatos/);
  t = E.acrescentarAcontecimento(t, '2026-11-23', 'Abri o chamado');
  assert.match(t, /\| Data \| O que aconteceu \|\n\|---\|---\|\n\| 2026-11-23 \| Abri o chamado \|\n\n## Arquivos/);
  t = E.acrescentarNumero(t, { numero: 'OS 123', oque: 'Chamado', onde: 'Brastemp', data: '2026-11-23' });
  assert.match(t, /\|---\|---\|---\|---\|\n\| OS 123 \| Chamado \| Brastemp \| 2026-11-23 \|\n/);
  t = E.acrescentarContato(t, 'Brastemp: 0800 970 0999');
  assert.match(t, /## Contatos\n\n- Brastemp: 0800 970 0999\n\n## Linha do tempo/);
  t = E.trocarAgora(t, 'Técnico vem dia 25', '2026-11-24');
  assert.match(t, /## Onde está\n\n\*\*Agora \(24\/11\):\*\* Técnico vem dia 25\n\n## Histórico da situação\n\n- \*\*Agora \(23\/11\):\*\* Liguei na Brastemp\n\n## Contatos/);
  t = E.trocarAgora(t, 'Consertado', '2026-11-25');
  assert.match(t, /## Histórico da situação\n\n- \*\*Agora \(24\/11\):\*\* Técnico vem dia 25\n- \*\*Agora \(23\/11\):\*\* Liguei na Brastemp\n/);
  t = E.definirStatus(t, 'fechado');
  assert.equal(E.campo(t, 'status'), 'fechado');
});

test('caixa: item ✍️ no fim da lista', () => {
  const base = '---\ntipo: caixa\n---\n\n# Caixa do painel\n\n## Itens\n';
  const t = E.naCaixa(base, E.itemDaCaixa('2026-11-23', '09:41', '✍️ Registro no painel: "Ansiedade" → areas/emocional/como-me-sinto.md'));
  assert.match(t, /## Itens\n\n- 2026-11-23 09:41 — ✍️ Registro no painel: "Ansiedade" → areas\/emocional\/como-me-sinto\.md\n$/);
  const t2 = E.naCaixa(t, E.itemDaCaixa('2026-11-23', '09:50', 'outro'));
  assert.match(t2, /como-me-sinto\.md\n- 2026-11-23 09:50 — outro\n$/);
});

test('diário: não repete o aviso do registro emocional no mesmo dia', () => {
  let t = E.noDia(E.novoDiario({ mes: '2026-11', hoje: '2026-11-23' }), '2026-11-23', ['- 📓 Registro emocional feito pelo painel']);
  assert.ok(E.diaTem(t, '2026-11-23', 'Registro emocional'));
  assert.ok(!E.diaTem(t, '2026-11-22', 'Registro emocional'));
  assert.ok(!E.diaTem(null, '2026-11-23', 'Registro emocional'));
});

test('arquivar: o registro vai pro arquivo da área com a origem', () => {
  const { bloco } = E.tirarRegistro(pasta, '2026-11-22 — Conversa com o ChatGPT');
  const arq = E.porBloco(E.novoArquivo({ area: 'emocional', hoje: '2026-11-23' }), E.blocoArquivado(bloco, '2026-11-23', 'como-me-sinto'));
  assert.match(arq, /^---\ntipo: arquivo\narea: emocional\nstatus: arquivado\n[\s\S]*arquivado: 2026-11-23\natualizado: 2026-11-23\n---\n\n# Arquivo de Emocional\n\n## 2026-11-22 — Conversa com o ChatGPT\n\n_Arquivado em 23\/11; veio de \[\[como-me-sinto\]\]\._\n\nTexto da conversa\.\n$/);
  assert.equal(E.chaveDoTitulo(arq, '2026-11-22 — Conversa com o ChatGPT'), '2026-11-22 — Conversa com o ChatGPT');
});

test('o que ele digita em linhas separadas continua separado (parágrafos)', () => {
  assert.equal(E.paragrafos('Fiquei ansioso.\nRespirei e passou.\n- um\n- dois\n  continua\nfim\n| a | b |\n|---|---|'),
    'Fiquei ansioso.\n\nRespirei e passou.\n\n- um\n- dois\n  continua\n\nfim\n\n| a | b |\n|---|---|');
  assert.equal(E.paragrafos('```\nlinha 1\nlinha 2\n```'), '```\nlinha 1\nlinha 2\n```');
  const t = E.acrescentarRegistro('# P\n', { data: '2026-11-23', titulo: 'x', texto: 'a\nb' });
  assert.match(t, /## 2026-11-23 seg · x\n\na\n\nb\n$/);
});

test('renomear a pasta só troca o título', () => {
  const t = E.renomear(pasta, 'Como estou me sentindo');
  assert.match(t, /---\n\n# Como estou me sentindo\n\nUm parágrafo/);
});
