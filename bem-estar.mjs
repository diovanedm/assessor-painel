import {addDays, norm, pymd, ymd} from './datas.mjs?v=b960b59f0d6b';

const safe = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
const number = n => n.toLocaleString('pt-BR', {maximumFractionDigits: 2});
const weekday = new Intl.DateTimeFormat('pt-BR', {weekday: 'short'});
const fullDay = new Intl.DateTimeFormat('pt-BR', {day:'numeric', month:'short', year:'numeric'});
const shortDay = iso => iso.slice(8, 10) + '/' + iso.slice(5, 7);
const dateText = iso => fullDay.format(pymd(iso));
const source = (file, label) => `<button type="button" class="be-source" data-open="${safe(file.path)}">${safe(label)} <span aria-hidden="true">↗</span></button>`;

function isoDate(s) {
  const iso = s?.trim().match(/^(\d{4}-\d{2}-\d{2})(?:$|[\s,])/u)?.[1];
  return iso && ymd(pymd(iso)) === iso ? iso : null;
}
function numeric(s) {
  const m = String(s || '').trim().match(/^(\d+(?:[.,]\d+)?)\s*(?:kg|km|cm)?$/i);
  return m ? Number(m[1].replace(',', '.')) : null;
}
function onScale(s, low, high) {
  const n = numeric(s);
  return Number.isInteger(n) && n >= low && n <= high ? n : null;
}
function cellText(s) {
  const text = (s || '').trim();
  return /^[–—-]$/.test(text) ? '' : text;
}
function splitCells(line) {
  return line.trim().replace(/^\||\|$/g, '').split(/(?<!\\)\|/).map(c => c.trim().replace(/\\\|/g, '|'));
}
function tableRows(file, today) {
  const rows = [];
  let headers;
  for (const raw of file.body.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line.startsWith('|')) { headers = null; continue; }
    const cells = splitCells(line);
    if (norm(cells[0]) === 'data') { headers = cells.map(c => norm(c).split(' (')[0]); continue; }
    const date = isoDate(cells[0]);
    if (!headers || !date || date > today) continue;
    const row = Object.fromEntries(headers.map((key, i) => [key, cellText(cells[i])]));
    rows.push({...row, date, file});
  }
  return rows;
}
const kinds = [
  ['Musculação', /^(?:musculacao|academia|treino de forca)\b/],
  ['Corrida', /^corrida\b/],
  ['Caminhada', /^caminhada\b/],
  ['Ciclismo', /^(?:pedalada|ciclismo|bicicleta)\b/],
  ['Natação', /^natacao\b/],
  ['Pilates', /^pilates\b/],
];
function workoutKind(text, isHabit) {
  const cleaned = norm(text).replace(/^[^a-z]+/, '');
  if (!cleaned || /^(?:descanso|cancelad[oa]|previst[oa]|planejad[oa]|nao)\b/.test(cleaned)) return null;
  return kinds.find(([,re]) => re.test(cleaned))?.[0] || (isHabit ? null : text);
}

function healthData(files, today) {
  const workouts = [], measures = [];
  for (const file of files) {
    if (/^areas\/saude\/treinos-\d{4}-\d{2}\.md$/.test(file.path)) {
      for (const row of tableRows(file, today)) {
        const kind = workoutKind(row.tipo, false);
        if (kind) workouts.push({date:row.date, kind, km:numeric(row.km), file});
      }
    } else if (file.path === 'areas/saude/corpo.md') {
      for (const row of tableRows(file, today)) {
        const kg = numeric(row.peso), waist = numeric(row.cintura);
        if (kg > 0 || waist > 0) measures.push({date:row.date, kg, waist, file});
      }
    }
  }
  const habitFile = files.find(f => f.path === 'eu/habitos.md');
  if (habitFile) {
    const fromTable = new Set(workouts.map(w => w.date + '|' + norm(w.kind)));
    const seenHabits = new Set();
    for (const row of tableRows(habitFile, today)) {
      if (norm(row.area) !== 'saude' || !row['✅/❌']?.includes('✅')) continue;
      const kind = workoutKind(row['o que'], true);
      if (!kind) continue;
      const key = row.date + '|' + norm(kind);
      // A distância da atividade agendada pode ser diferente da distância percorrida.
      const kmText = row.motivo?.match(/^(?:(?:fez|correu|percorreu|caminhou|dist[aâ]ncia(?: real)?)\s*[:=]?\s*)?(\d+(?:[.,]\d+)?)\s*km\b/i)?.[1];
      const km = numeric(kmText);
      if (fromTable.has(key)) {
        const matches = workouts.filter(w => w.date === row.date && norm(w.kind) === norm(kind));
        if (matches.length === 1 && matches[0].km == null) matches[0].km = km;
        continue;
      }
      const identity = row.date + '|' + norm(row['o que']);
      if (!seenHabits.has(identity)) workouts.push({date:row.date, kind, km, file:habitFile});
      seenHabits.add(identity);
    }
  }
  const newestFirst = (a,b) => b.date.localeCompare(a.date);
  return { workouts: workouts.sort(newestFirst), measures: measures.sort(newestFirst) };
}

function findJournalDays(files, today) {
  const days = new Map();
  for (const file of files) {
    const journal = file.path.match(/^areas\/emocional\/journal-(\d{4})-\d{2}\.md$/);
    if (!journal) continue;
    const entry = date => {
      if (!days.has(date)) days.set(date, {date, file, scores:[], emotions:[], responses:[], passages:[]});
      return days.get(date);
    };
    for (const row of tableRows(file, today)) {
      if (!['humor','emocao','intensidade','gatilho','o que ajudou'].some(key => row[key])) continue;
      const day = entry(row.date);
      const mood = onScale(row.humor, 1, 5);
      if (mood !== null) day.scores.push(mood);
      if (row.emocao) day.emotions.push(row.emocao);
      const fields = [['Humor', mood && `${mood}/5`], ['Emoção', row.emocao], ['Intensidade', row.intensidade], ['Gatilho', row.gatilho], ['O que ajudou', row['o que ajudou']]];
      day.responses.push(fields.filter(([,val]) => val));
    }
    // Os journals mais antigos usam "Notas de dd/mm", os mais novos também podem usar títulos ISO.
    let passage;
    for (const raw of file.body.split(/\r?\n/)) {
      const br = raw.match(/^(?:#{1,4}\s*)?(?:\*{1,2})?Notas? de (\d{2})\/(\d{2})(?:\/(\d{4}))?\b/i);
      const iso = br ? `${br[3] || journal[1]}-${br[2]}-${br[1]}` : raw.match(/^#{2,4}\s+(\d{4}-\d{2}-\d{2})\b/)?.[1];
      if (iso) {
        passage = null;
        if (isoDate(iso) && iso <= today) {
          passage = [];
          entry(iso).passages.push(passage);
        }
      } else if (/^#{1,4}\s|^---$|^\|/.test(raw)) {
        passage = null;
      } else if (passage && raw.trim()) {
        passage.push(raw.trim().replace(/^[-*]\s+/, ''));
      }
    }
  }
  return [...days.values()].sort((a,b) => b.date.localeCompare(a.date));
}
const icons = {
  run:'<path d="m4 17 4-5 4 2 6-8m-5 0h5v5"/>',
  activity:'<path d="M2 12h5l3-7 4 14 3-7h5"/>',
  journal:'<path d="M5 4h12a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2V4Zm3 12h11M9 8h6"/>',
  mood:'<circle cx="12" cy="12" r="8"/><path d="M8.5 13.5q3.5 4 7 0M9 9.5h.1m5.8 0h.1"/>',
  body:'<rect x="4" y="4" width="16" height="16" rx="4"/><path d="M8 9q4-5 8 0l-4 4z"/>'
};
const icon = name => `<span class="be-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${icons[name]}</svg></span>`;
const heading = (image, label) => `<h2 class="be-heading">${icon(image)}${label}</h2>`;

function distanceCard(workouts, today) {
  const runs = workouts.filter(w => w.kind === 'Corrida' && w.km > 0).slice(0, 6).reverse();
  if (!runs.length) {
    const end = pymd(today);
    const weeks = Array.from({length:4}, (_, i) => {
      const last = ymd(addDays(end, -7 * (3-i)));
      const first = ymd(addDays(pymd(last), -6));
      return {label:shortDay(first), title:`${shortDay(first)} a ${shortDay(last)}`, count:workouts.filter(w => w.date >= first && w.date <= last).length};
    });
    return `<section class="be-card be-feature">${heading('activity','Treinos nas últimas quatro semanas')}
      ${workouts.some(w => w.date >= ymd(addDays(end,-27))) ? bars(weeks, w => w.count, w => String(w.count), w => w.label, w => `${w.title} · ${w.count} treinos registrados`) : '<p class="be-empty">Seus treinos aparecem aqui conforme você registra as atividades.</p>'}</section>`;
  }
  const last = runs.at(-1);
  return `<section class="be-card be-feature">${heading('run','Distância por corrida')}
    <div class="be-big">${number(last.km)} <small>km</small></div>
    <p class="be-caption">Última corrida com distância · ${dateText(last.date)}</p>
    ${bars(runs,w => w.km,w => number(w.km),w => shortDay(w.date),w => `${dateText(w.date)} · ${number(w.km)} km`)}
    </section>`;
}
function bars(items, value, valueLabel, dayLabel, accessible) {
  const max = Math.max(...items.map(value), 1);
  return `<ul class="be-bars" aria-label="Histórico">${items.map(item => `<li><span class="sr">${safe(accessible(item))}</span>
    <div class="be-column" aria-hidden="true" style="--level:${Math.round(100*value(item)/max)}%">
      <span>${safe(valueLabel(item))}</span><i></i></div><small aria-hidden="true">${safe(dayLabel(item))}</small></li>`).join('')}</ul>`;
}
function monthCard(workouts, today) {
  const month = workouts.filter(w => w.date.slice(0,7) === today.slice(0,7));
  const counts = new Map();
  for (const w of month) counts.set(w.kind, (counts.get(w.kind) || 0) + 1);
  return `<section class="be-card">${heading('activity','Atividade do mês')}
    <div class="be-big">${month.length}</div><p class="be-caption">${month.length === 1 ? 'treino registrado' : 'treinos registrados'} em ${pymd(today).toLocaleDateString('pt-BR',{month:'long'})}</p>
    ${counts.size ? `<ul class="be-types">${[...counts].sort((a,b) => b[1]-a[1]).map(([kind,count]) => `<li><span>${safe(kind)}</span><b>${count}</b></li>`).join('')}</ul>`:''}
    </section>`;
}
function latestWorkouts(workouts) {
  if (!workouts.length) return '';
  return `<section class="be-card">${heading('journal','Atividades recentes')}<ul class="be-timeline">${workouts.slice(0,3).map(w =>
    `<li><time datetime="${w.date}">${shortDay(w.date)}</time><div><strong>${safe(w.kind)}</strong>${w.km > 0 ? `<small>${number(w.km)} km</small>`:''}</div>${source(w.file,'Ver registro')}</li>`).join('')}</ul></section>`;
}
function bodyCard(measures, files) {
  const file = files.find(f => f.path === 'areas/saude/corpo.md');
  if (!file) return '';
  if (!measures.length) return `<section class="be-card">${heading('body','Peso e medidas')}<p class="be-empty">Quando você anotar uma medida, poderá acompanhar a evolução aqui.</p>${source(file,'Abrir caderno de medidas')}</section>`;
  const weight = measures.filter(m => m.kg > 0);
  const waist = measures.find(m => m.waist > 0);
  const series = weight.length > 1 ? weight.slice(0,5).reverse() : [];
  return `<section class="be-card">${heading('body','Peso e medidas')}
    <dl class="be-measures">${[weight.length && ['Peso', weight[0].kg,'kg', weight[0].date],waist && ['Cintura',waist.waist,'cm',waist.date]].filter(Boolean).map(([label,value,unit,date]) =>
      `<div><dt>${label}</dt><dd>${number(value)} <small>${unit}</small></dd><small>${dateText(date)}</small></div>`).join('')}</dl>
    ${series.length ? bars(series,m=>m.kg,m=>number(m.kg),m=>shortDay(m.date),m=>`${dateText(m.date)} · ${number(m.kg)} kg`):''}${source(file,'Abrir caderno de medidas')}</section>`;
}
const moods = ['', 'Péssimo', 'Mal', 'Mais ou menos', 'Bem', 'Muito bem'];

function moodWeek(days, today) {
  const byDate = new Map(days.map(d => [d.date,d]));
  const start = addDays(pymd(today), -6);
  const week = Array.from({length:7}, (_, i) => {
    const date = ymd(addDays(start,i)), day = byDate.get(date), score = day?.scores.at(-1);
    const title = score ? `${moods[score]} · ${score} de 5` : day ? 'Registro escrito' : 'Sem registro';
    return `<li aria-label="${dateText(date)} · ${title}"><small aria-hidden="true">${weekday.format(pymd(date)).replace('.','')}</small>
      <span class="be-day ${score ? 'be-m'+score : day ? 'be-written' : ''}" title="${title}" aria-hidden="true">${score || (day ? '✎' : '·')}</span>
      <small aria-hidden="true">${date.slice(-2)}</small></li>`;
  }).join('');
  return `<section class="be-card be-feature">${heading('journal','Sua semana no diário')}
    <p class="be-caption">${shortDay(ymd(start))} a ${shortDay(today)}</p>
    <ul class="be-week" aria-label="Últimos sete dias de diário">${week}</ul>
    <p class="be-legend"><span>1–5 · Humor</span><span>✎ Texto</span><span>· Sem registro</span></p></section>`;
}
function lastMood(days) {
  const day = days.find(d => d.scores.length), score = day?.scores.at(-1);
  return `<section class="be-card be-last">${heading('mood','Último humor anotado')}
    ${score ? `<div class="be-big">${score}<small> / 5</small></div><p class="be-caption">${moods[score]} · ${dateText(day.date)}</p>`:'<p class="be-empty">Você pode registrar como se sente usando a escala de 1 a 5.</p>'}
    <button type="button" class="be-checkin" data-ficha="estou">Fazer check-in <span aria-hidden="true">↗</span></button></section>`;
}
function journalList(days) {
  if (!days.length) return '';
  return `<section class="be-card be-wide">${heading('journal','Últimos registros')}<div class="be-entries">${days.slice(0,3).map(d => {
    const emotion = d.emotions.at(-1);
    const paragraphs = d.passages.filter(p => p.length);
    return `<details class="be-entry"><summary><time datetime="${d.date}">${shortDay(d.date)}</time><span><strong>${emotion ? 'Check-in emocional':'Diário emocional'}</strong>
      ${emotion ? `<small class="be-excerpt">${safe(emotion)}</small>`:''}</span><span class="be-read">Ler <i aria-hidden="true">⌄</i></span></summary>
      <div class="be-entry-text">${d.responses.filter(fields => fields.length).map(fields => `<dl>${fields.map(([label,v]) => `<div><dt>${label}</dt><dd>${safe(v)}</dd></div>`).join('')}</dl>`).join('')}
        ${paragraphs.map(p => `<div class="be-passage">${p.map(line => `<p>${safe(line)}</p>`).join('')}</div>`).join('')}
        ${source(d.file,'Abrir diário completo')}</div></details>`;
  }).join('')}</div></section>`;
}
export function visaoBemEstar(area, files, today) {
  if (area === 'saude') {
    const {workouts,measures} = healthData(files,today);
    return `<div class="be-grid be-health">${distanceCard(workouts,today)}${monthCard(workouts,today)}${latestWorkouts(workouts)}${bodyCard(measures,files)}</div>`;
  }
  if (area === 'emocional') {
    const days = findJournalDays(files,today);
    return `<div class="be-grid be-emotion">${moodWeek(days,today)}${lastMood(days)}${journalList(days)}</div>`;
  }
  return '';
}
