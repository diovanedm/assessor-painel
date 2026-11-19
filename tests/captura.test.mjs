import test from 'node:test';
import assert from 'node:assert/strict';
import { linhasCaptura, lerCaptura, tipoAnexo, extAudio } from '../captura.mjs';

test('texto com várias linhas e anexos vira um item da caixa', () => {
  const linhas = linhasCaptura('gastei 30 no mercado\n\nno nubank ', [{ tipo: 'foto', caminho: 'painel/anexos/a.jpg' }, { tipo: 'áudio', caminho: 'painel/anexos/b.webm' }]);
  assert.deepEqual(linhas, ['💬 Captura: gastei 30 no mercado', 'no nubank', '📎 foto: painel/anexos/a.jpg', '📎 áudio: painel/anexos/b.webm']);
});

test('só anexo também vale; vazio não vale', () => {
  assert.deepEqual(linhasCaptura('  ', [{ tipo: 'áudio', caminho: 'x.m4a' }]), ['💬 Captura: (sem texto, áudio)', '📎 áudio: x.m4a']);
  assert.equal(linhasCaptura('', []), null);
});

test('lê de volta o texto e os anexos', () => {
  const r = lerCaptura('(sem texto, foto)', ['📎 foto: painel/anexos/a.jpg']);
  assert.deepEqual(r, { texto: '', anexos: [{ tipo: 'foto', caminho: 'painel/anexos/a.jpg' }] });
  assert.equal(lerCaptura('oi', ['tudo bem']).texto, 'oi\ntudo bem');
});

test('tipo e extensão dos anexos', () => {
  assert.equal(tipoAnexo('image/png'), 'foto');
  assert.equal(tipoAnexo('audio/webm;codecs=opus'), 'áudio');
  assert.equal(tipoAnexo('application/pdf'), 'pdf');
  assert.equal(extAudio('audio/mp4'), 'm4a');
  assert.equal(extAudio('audio/webm;codecs=opus'), 'webm');
});
