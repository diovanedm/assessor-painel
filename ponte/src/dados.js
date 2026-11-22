// Conversões puras (testáveis no Node): iCal do Google → agenda do espelho; TickTick → tarefas do espelho.
// Brasília é UTC−3 o ano todo (sem horário de verão desde 2019).
const BR = 3 * 3600e3;
const p2 = n => String(n).padStart(2, '0');
const local = ms => new Date(ms - BR);
const dataDe = d => `${d.getUTCFullYear()}-${p2(d.getUTCMonth() + 1)}-${p2(d.getUTCDate())}`;
const horaDe = d => `${p2(d.getUTCHours())}:${p2(d.getUTCMinutes())}`;
const semAcento = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

const AREA_NOME = {
  ingles: 'ingles', saude: 'saude', musica: 'musica', cultura: 'cultura', trabalho: 'trabalho', carreira: 'carreira',
  financas: 'financas', emocional: 'emocional', casa: 'casa-familia', 'casa e familia': 'casa-familia', familia: 'casa-familia',
};

/** Área de um compromisso: prefixo "Área · …" ou o assunto. */
export function areaDoEvento(titulo) {
  const t = semAcento(titulo).replace(/^[^\p{L}]+/u, '');
  const m = /^([a-z ]+?)\s*[·•|:-]\s/.exec(t);
  if (m && AREA_NOME[m[1].trim()]) return AREA_NOME[m[1].trim()];
  if (/psicolog|psiquiatr|terapia/.test(t)) return 'emocional';
  if (/🩺|medic|consulta|exame|dentist|academia|corrida/.test(semAcento(titulo))) return 'saude';
  if (/apsis/.test(t)) return 'trabalho';
  return null;
}

function eid(uid, calId, recId) {
  if (!uid || !calId) return '';
  const id = uid.replace(/@google\.com$/, '') + (recId ? '_' + recId : '');
  const cal = calId.replace(/@gmail\.com$/, '@m').replace(/@group\.calendar\.google\.com$/, '@g');
  const b = btoa(unescape(encodeURIComponent(id + ' ' + cal))).replace(/=+$/, '');
  return 'https://www.google.com/calendar/event?eid=' + b;
}

const carimboUtc = t => {
  const d = t.toJSDate ? new Date(t.toUnixTime() * 1000) : t;
  return `${d.getUTCFullYear()}${p2(d.getUTCMonth() + 1)}${p2(d.getUTCDate())}T${p2(d.getUTCHours())}${p2(d.getUTCMinutes())}${p2(d.getUTCSeconds())}Z`;
};
const carimboDia = t => `${t.year}${p2(t.month)}${p2(t.day)}`;

/** Compromissos de hoje (00:00 em Brasília) até hoje + dias, a partir do texto .ics. */
export function agendaDoIcs(ICAL, texto, { agora = new Date(), dias = 7, calId = '' } = {}) {
  const raiz = new ICAL.Component(ICAL.parse(texto));
  for (const tz of raiz.getAllSubcomponents('vtimezone')) {
    try { ICAL.TimezoneService.register(tz); } catch { /* já registrado */ }
  }
  const hojeLocal = dataDe(local(agora.getTime()));
  const ini = Date.parse(hojeLocal + 'T00:00:00-03:00');
  const fim = ini + dias * 864e5;
  const diasJanela = [...Array(dias)].map((_, i) => dataDe(local(ini + i * 864e5 + BR)));

  const mestres = new Map(), excecoes = [];
  for (const v of raiz.getAllSubcomponents('vevent')) {
    const uid = v.getFirstPropertyValue('uid');
    if (v.hasProperty('recurrence-id')) excecoes.push(v); else mestres.set(uid, v);
  }
  const eventos = new Map();
  for (const [uid, v] of mestres) eventos.set(uid, new ICAL.Event(v));
  for (const x of excecoes) {
    const ev = eventos.get(x.getFirstPropertyValue('uid'));
    if (ev) ev.relateException(x);
    else eventos.set(x.getFirstPropertyValue('uid') + '#' + x.getFirstPropertyValue('recurrence-id'), new ICAL.Event(x));
  }

  const saida = [];
  const emitir = (ev, item, start, end, recId) => {
    if (String(item.component.getFirstPropertyValue('status') || '').toUpperCase() === 'CANCELLED') return;
    const titulo = String(item.summary || '').trim();
    if (!titulo) return;
    const base = { titulo, area: areaDoEvento(titulo), link: eid(ev.uid, calId, recId) };
    if (start.isDate) {
      const d0 = Date.UTC(start.year, start.month - 1, start.day);
      const d1 = end ? Date.UTC(end.year, end.month - 1, end.day) : d0 + 864e5;
      for (let d = d0; d < Math.max(d1, d0 + 1); d += 864e5) {
        const dia = dataDe(new Date(d));
        if (diasJanela.includes(dia)) saida.push({ data: dia, inicio: null, fim: null, ...base });
      }
      return;
    }
    const s = start.toUnixTime() * 1000, e = end ? end.toUnixTime() * 1000 : s;
    if (e <= ini && e !== s) return;
    if (s >= fim || (e === s && s < ini)) return;
    const ls = local(s), le = local(e);
    saida.push({ data: dataDe(ls), inicio: horaDe(ls), fim: horaDe(le), ...base });
  };

  for (const ev of eventos.values()) {
    if (!ev.startDate) continue;
    if (!ev.isRecurring()) { emitir(ev, ev, ev.startDate, ev.endDate, ev.recurrenceId ? (ev.startDate.isDate ? carimboDia(ev.recurrenceId) : carimboUtc(ev.recurrenceId)) : ''); continue; }
    const it = ev.iterator();
    let t, n = 0;
    while ((t = it.next()) && n++ < 6000) {
      const det = ev.getOccurrenceDetails(t);
      const s = det.startDate.isDate ? Date.UTC(det.startDate.year, det.startDate.month - 1, det.startDate.day) + BR : det.startDate.toUnixTime() * 1000;
      if (s >= fim && t.toUnixTime() * 1000 >= fim) break;
      const e = det.endDate ? (det.endDate.isDate ? Date.UTC(det.endDate.year, det.endDate.month - 1, det.endDate.day) + BR : det.endDate.toUnixTime() * 1000) : s;
      if (e < ini) continue;
      const recId = t.isDate ? carimboDia(t) : carimboUtc(t);
      emitir(ev, det.item, det.startDate, det.endDate, recId);
    }
  }
  return saida.filter(e => e.data >= hojeLocal)
    .sort((a, b) => a.data.localeCompare(b.data) || String(a.inicio || '').localeCompare(String(b.inicio || '')));
}

const PRIO = { 5: 'alta', 3: 'media', 1: 'baixa' };

/** Área de uma tarefa pela lista do TickTick (regra do AGENTS.md). Casos → null (o painel acha pela nota). */
export function areaDaTarefa(lista, titulo) {
  const l = semAcento(lista), t = semAcento(titulo);
  if (/trabalho|apsis/.test(l)) return 'trabalho';
  if (/saude/.test(l)) return /psicolog|terap|psiquiatr/.test(t) ? 'emocional' : 'saude';
  if (/estudo/.test(l)) return /ingl|english|cake/.test(t) ? 'ingles' : 'carreira';
  if (/casa|famil/.test(l)) return 'casa-familia';
  if (/financ/.test(l)) return 'financas';
  if (/musica|bateria/.test(l)) return 'musica';
  if (/emocional/.test(l)) return 'emocional';
  if (/ingles/.test(l)) return 'ingles';
  if (/cultura|leitura/.test(l)) return 'cultura';
  return null;
}

function prazoDe(due, allDay) {
  if (!due) return { prazo: null, hora: null };
  const ms = Date.parse(String(due).replace(/([+-]\d{2})(\d{2})$/, '$1:$2'));
  if (!Number.isFinite(ms)) return { prazo: null, hora: null };
  const d = local(ms);
  return { prazo: dataDe(d), hora: allDay ? null : horaDe(d) };
}

/** Tarefas abertas de cada resposta de /project/{id}/data, no formato do espelho. */
export function tarefasDoTickTick(respostas) {
  const vistas = new Set(), out = [];
  for (const r of respostas) {
    const nomeLista = String(r?.project?.name || 'Entrada').replace(/^[^\p{L}\p{N}]+/u, '').trim() || 'Entrada';
    for (const t of Array.isArray(r?.tasks) ? r.tasks : []) {
      if (!t?.id || vistas.has(t.id) || (t.status ?? 0) !== 0) continue;
      vistas.add(t.id);
      const titulo = String(t.title || '').trim();
      if (!titulo) continue;
      const { prazo, hora } = prazoDe(t.dueDate, t.isAllDay);
      const nota = /Nota:\s*`?\[{0,2}([^\s`\]]+\.md)/i.exec(String(t.content || t.desc || ''))?.[1] || null;
      out.push({
        id: t.id, titulo, prazo, hora,
        prioridade: PRIO[t.priority] || 'nenhuma',
        lista: nomeLista, area: areaDaTarefa(nomeLista, titulo), nota,
        link: `https://ticktick.com/webapp/#p/${t.projectId || r?.project?.id || 'inbox'}/tasks/${t.id}`,
      });
    }
  }
  return out.sort((a, b) => String(a.prazo || '9').localeCompare(String(b.prazo || '9')) || String(a.hora || '99').localeCompare(String(b.hora || '99')));
}
