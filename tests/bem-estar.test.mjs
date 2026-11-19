import {test} from 'node:test';
import assert from 'node:assert/strict';
import {visaoBemEstar} from '../bem-estar.mjs';

const note = (path, body) => ({path, body});
const habits = body => note('eu/habitos.md', '| data | o quê | área | ✅/❌ | motivo |\n|---|---|---|---|---|\n'+body);
const training = body => note('areas/saude/treinos-2030-03.md', '| Data | Tipo | Detalhe | Km | Min | Pace | Obs |\n|---|---|---|---|---|---|---|\n'+body);
const journal = body => note('areas/emocional/journal-2030-03.md', '| Data | Humor (1–5) | Emoção | Intensidade (0–10) | Gatilho | O que ajudou |\n|---|---|---|---|---|---|\n'+body);

test('Treinos combinam tabelas e hábitos feitos, sem contar agendas ou duplicatas', () => {
  const files = [
    habits(`| 2030-03-01 | corrida 10 km | saúde | ✅ | correu 3,75 km |\n| 2030-03-02 | caminhada 2 km | saúde | ❌ | |\n| 2030-03-03 | academia | saúde | ✅ | |\n| 2030-03-03 | consulta | saúde | ✅ | |\n| 2030-03-04 | corrida 8 km | saúde | ✅ | |\n| 2030-03-05 | corrida | saúde | 🚫 | |\n| 2030-03-08 | corrida | saúde | ✅ | |`),
    training('| 2030-03-01 | Corrida | Parque | 4,3 | | | |\n| 2030-03-06 | Descanso | | | | | |\n| 2030-03-36 | Corrida | | 50 | | | |'),
  ];
  const html = visaoBemEstar('saude', files,'2030-03-07');
  assert.match(html,/class="be-big">3<\/div>/);
  assert.match(html,/4,3 <small>km/);
  assert.doesNotMatch(html,/3,75|10 km|50 km|8 km|consulta/);
});
test('Distância anotada no motivo complementa um treino sem distância', () => {
  const files = [training('| 2030-03-01 | Corrida | | | | | |'),habits('| 2030-03-01 | corrida 10 km | saúde | ✅ | 3,25 km realizados |')];
  assert.match(visaoBemEstar('saude',files,'2030-03-01'), /3,25 <small>km/);
});
test('Medidas usam valores da tabela e mostram as datas de cada medida', () => {
  const files = [note('areas/saude/corpo.md', 'Pesei 120 kg, por exemplo.\n| Data | Peso (kg) | Cintura (cm) | Obs |\n|---|---|---|---|\n| 2030-03-01 | 70,2 | 91 | |\n| 2030-03-06 | 69 | — | |')];
  const html = visaoBemEstar('saude',files,'2030-03-07');
  assert.match(html,/69 <small>kg/);
  assert.match(html,/91 <small>cm/);
  assert.match(html,/70,2/);
  assert.doesNotMatch(html,/120/);
});
test('Texto escrito não recebe nota de humor, mesmo quando cita outra escala', () => {
  const files = [journal('| 2030-03-03 dom | 4 | leve | 6 | | |\n| 2030-03-04 | — | nota dele 8/10 | | | |\n| 2030-03-05 | | | | | |\n| 2030-03-10 | 1 | depois | | | |\n\nNotas de 06/03 (à noite):\n- texto pessoal\n\n## 2030-03-07 · Anotação')];
  const html = visaoBemEstar('emocional',files,'2030-03-07');
  assert.equal((html.match(/class="be-day be-written"/g) || []).length,3);
  assert.equal((html.match(/class="be-day be-m4"/g) || []).length,1);
  assert.match(html,/4<small> \/ 5/);
  assert.match(html,/<details class="be-entry">[\s\S]*<p>texto pessoal<\/p>/);
  assert.doesNotMatch(html,/depois/);
});
test('O diário ignora textos que aparecem em outras notas e escapa os escritos do journal', () => {
  const files = [note('areas/emocional/foco.md','Notas de 05/03 (depois):\n- algo'),journal('| 2030-03-07 | — | <img src=x> \\| B | 7 | | |')];
  const html = visaoBemEstar('emocional',files,'2030-03-07');
  assert.match(html,/&lt;img src=x&gt; \| B/);
  assert.doesNotMatch(html,/<img|be-day be-m[1-5]/);
  assert.equal((html.match(/class="be-day be-written"/g)||[]).length,1);
});
test('A visão vazia oferece check-in e mantém dias sem registro explícitos', () => {
  assert.match(visaoBemEstar('saude',[],'2030-03-07'), /Seus treinos aparecem/);
  const html = visaoBemEstar('emocional',[],'2030-03-07');
  assert.match(html,/data-ficha="estou"/);
  assert.equal((html.match(/title="Sem registro"/g) || []).length,7);
});
