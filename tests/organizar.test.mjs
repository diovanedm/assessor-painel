import test from 'node:test';
import assert from 'node:assert/strict';
import { tickTick, situacaoDaTarefa, tarefasDoAssunto, foraDoTickTick, partesDoTitulo, compromissosDaArea, semanaDosBlocos, progressoDasMetas, cardapio, diaDoCardapio, partesDoCaso, agoraDoCaso, idDoLink } from '../organizar.mjs';

const link = (p, id) => `https://ticktick.com/webapp/#p/${p}/tasks/${id}`;
const A = '6b01895c8f085913ead73419', B = '6aff54798f083a94ebce3d0a', C = '6afb4ca58f087a59c810825c';
const esp = { tarefasTodas: true, tarefas: [
  { titulo: 'Amolar as facas', prazo: '2026-11-21', area: 'casa-familia', link: link('p1', A) },
  { titulo: 'Mensagem pra psicóloga', prazo: '2026-11-23', area: 'emocional', id: C, nota: 'areas/emocional/terapia.md', link: link('p2', C) },
  { titulo: 'Cobrar o Procon', prazo: '2026-11-25', area: 'pessoal', nota: 'casos/tv-samsung-procon.md', link: link('p3', B) },
] };

test('id vem do link quando o espelho não traz', () => {
  assert.equal(idDoLink(link('x', A)), A);
  assert.equal(idDoLink('https://ticktick.com/webapp/'), null);
  const T = tickTick(esp);
  assert.equal(T.porId.get(A).titulo, 'Amolar as facas');
  assert.equal(T.completo, true);
});

test('situação de uma tarefa da nota pelo TickTick', () => {
  const T = tickTick(esp);
  assert.equal(situacaoDaTarefa({ id: A, checked: false }, T), 'aberta');
  assert.equal(situacaoDaTarefa({ id: A, checked: true }, T), 'aberta', 'reaberta no TickTick');
  assert.equal(situacaoDaTarefa({ id: '6af5ef9c8f0866ff609d9b0b', checked: false }, T), 'fechada');
  assert.equal(situacaoDaTarefa({ id: null, checked: false }, T), 'fora');
  assert.equal(situacaoDaTarefa({ id: null, checked: true }, T), 'feita');
  const parcial = tickTick({ tarefas: esp.tarefas });
  assert.equal(situacaoDaTarefa({ id: '6af5ef9c8f0866ff609d9b0b', checked: false }, parcial), 'desconhecida');
});

test('tarefas de uma área e de um caso', () => {
  const T = tickTick(esp);
  assert.deepEqual(tarefasDoAssunto(T, { area: 'casa-familia' }).map(t => t.titulo), ['Amolar as facas']);
  assert.deepEqual(tarefasDoAssunto(T, { paths: ['casos/tv-samsung-procon.md'] }).map(t => t.titulo), ['Cobrar o Procon']);
  assert.deepEqual(tarefasDoAssunto(T, { ids: [C] }).map(t => t.titulo), ['Mensagem pra psicóloga']);
  const { fora, fechadas } = foraDoTickTick([{ text: 'a', id: null, checked: false }, { text: 'b', id: '6af5ef9c8f0866ff609d9b0b', checked: false }, { text: 'c', id: A, checked: false }, { text: 'd', checked: true }], T);
  assert.deepEqual([fora.map(t => t.text), fechadas.map(t => t.text)], [['a'], ['b']]);
});

test('título da agenda em ícone, nome e complemento', () => {
  assert.deepEqual(partesDoTitulo('⭐ Festival Estrelas 2026 (ginástica da Anny, ginásio Castelo, turno da tarde), Arena PSG, R. Manila 570'),
    { icone: '⭐', nome: 'Festival Estrelas 2026', sub: 'Ginástica da Anny · Arena PSG' });
  assert.deepEqual(partesDoTitulo('🩺 Consulta Michele – Ginecologia (Renata Alves), CPS - Pedro 1'),
    { icone: '🩺', nome: 'Consulta Michele – Ginecologia', sub: 'Renata Alves · CPS - Pedro 1' });
  assert.deepEqual(partesDoTitulo('🪟 Prazo: orçamento das grades das janelas'), { icone: '🪟', nome: 'Orçamento das grades das janelas', sub: 'Prazo' });
  assert.equal(partesDoTitulo('Saúde • Corrida').nome, 'Corrida');
});

test('compromissos: espelho + agenda.md sem repetir, em ordem', () => {
  const C2 = compromissosDaArea({
    espelho: { agenda: [{ data: '2026-11-24', inicio: '19:00', fim: '20:00', titulo: 'Inglês da Anny', area: 'casa-familia', link: 'g' }] },
    eventos: [
      { date: '2026-12-13', start: '13:30', end: '19:00', allDay: false, name: '⭐ Festival Estrelas 2026', area: 'casa-familia' },
      { date: '2026-11-24', start: '19:00', end: '20:00', allDay: false, name: 'Inglês da Anny', area: 'casa-familia' },
      { date: '2026-11-10', start: null, end: null, allDay: true, name: 'Passado', area: 'casa-familia' },
      { date: '2026-12-01', start: null, end: null, allDay: true, name: 'Outra área', area: 'trabalho' },
    ], area: 'casa-familia', hoje: '2026-11-22',
  });
  assert.deepEqual(C2.map(e => [e.data, e.link]), [['2026-11-24', 'g'], ['2026-12-13', '']]);
});

test('blocos da semana e metas', () => {
  const series = [{ area: 'saude', days: { dows: new Set([1, 3]) } }, { area: 'cultura', days: { dows: new Set([0]) } }];
  const habitos = [{ area: 'saude', date: '2026-11-17', st: 'feito' }, { area: 'saude', date: '2026-11-10', st: 'feito' }];
  assert.deepEqual(semanaDosBlocos({ series, habitos, area: 'saude', hoje: '2026-11-22' }), { previstos: 2, feitos: 1, pct: 50 });
  assert.deepEqual(semanaDosBlocos({ series, habitos, area: 'casa-familia', hoje: '2026-11-22' }), { previstos: 0, feitos: 0, pct: null });
  assert.deepEqual(progressoDasMetas([{ pct: 40 }, { pct: 60 }, { pct: null }]), { total: 3, comNumero: 2, pct: 50 });
});

test('cardápio da semana e o dia de hoje', () => {
  const body = '# Casa\n\n## Cardápio da semana\n\nMontado em 2026-11-01.\n\n| Dia | Proteína | Legume |\n|---|---|---|\n| Seg | Frango | Abobrinha |\n| Qui | Acém moído | Beterraba |\n\nSempre: salada.\n\n## Rotina';
  const C2 = cardapio(body);
  assert.deepEqual(C2.colunas, ['Proteína', 'Legume']);
  assert.equal(C2.obs, 'Sempre: salada.');
  assert.deepEqual(diaDoCardapio(C2, '2026-11-26').itens, [['Proteína', 'Acém moído'], ['Legume', 'Beterraba']]);
  assert.equal(diaDoCardapio(C2, '2026-11-22'), null);
  assert.equal(cardapio('# X\n\n## Outra coisa\n\ntexto'), null);
});

test('caso separado em abas, sem perder seção', () => {
  const body = `# TV\n\n## Números do caso\n\n| Número | O quê | Onde | Data |\n|---|---|---|---|\n| 4003 | Atendimento | Procon | 2026-10 |\n\n## Produto\n\n- TV 55"\n\n## Contatos\n\n- Procon: e-mail\n\n## Onde está\n\n**Agora (17/11, 11h59):** é com o Procon.\n\nO que ele pede: reparo.\n\n## Próximos passos\n\n- [ ] Cobrar\n\n## Linha do tempo\n\n| Data | O que aconteceu |\n|---|---|\n| 2025-05-10 | Comprou |\n| 2026-11-22 | TV em casa |\n\n## Arquivos\n\n- nota fiscal`;
  const P = partesDoCaso(body);
  assert.deepEqual(P.numeros.rows, [['4003', 'Atendimento', 'Procon', '2026-10']]);
  assert.deepEqual(P.onde.agora, { rotulo: '17/11, 11h59', texto: 'é com o Procon.' });
  assert.equal(P.onde.resto, 'O que ele pede: reparo.');
  assert.deepEqual(P.linha.map(l => l.data), ['2026-11-22', '2025-05-10']);
  assert.deepEqual(P.outras.map(o => o.titulo), ['Produto']);
  assert.match(P.contatos, /Procon/);
  assert.match(P.passos, /Cobrar/);
  assert.match(P.arquivos, /nota fiscal/);
  assert.deepEqual(agoraDoCaso('Parei aqui (2026-11-17 10:00): esperando. Próximo passo: ligar.').agora, { rotulo: '2026-11-17 10:00', texto: 'esperando. Próximo passo: ligar.' });
});
