// Ponte ao vivo do painel do Meu Assessor.
// Lê o Google Agenda (endereço secreto iCal) e o TickTick (API aberta, só leitura)
// e devolve agenda e tarefas no mesmo formato do painel/espelho.json.
// Segredos (wrangler secret put): PAINEL_CHAVE, GCAL_ICS, TICKTICK_CLIENT_ID, TICKTICK_CLIENT_SECRET.
// KV: PONTE (guarda o token do TickTick).
import ICAL from 'ical.js';
import { agendaDoIcs, tarefasDoTickTick } from './dados.js';

const TT_API = 'https://api.ticktick.com/open/v1';
const TT_AUTH = 'https://ticktick.com/oauth/authorize';
const TT_TOKEN = 'https://ticktick.com/oauth/token';
const CACHE_SEG = 30;

export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    const cors = corsDe(req, env);
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    try {
      if (url.pathname === '/ao-vivo') return await aoVivo(req, env, ctx, cors);
      if (url.pathname === '/ticktick/conectar') return await conectar(url, env);
      if (url.pathname === '/ticktick/volta') return await volta(url, env);
      if (url.pathname === '/') return pagina('Ponte do painel', '<p>Ligada ✅. O painel lê <code>/ao-vivo</code>.</p>');
      return new Response('não achei', { status: 404 });
    } catch (e) {
      return json({ erro: String(e?.message || e) }, 500, cors);
    }
  },
};

function corsDe(req, env) {
  const origens = String(env.ORIGENS || 'https://diovanedm.github.io').split(/[\s,]+/).filter(Boolean);
  const o = req.headers.get('Origin') || '';
  const ok = origens.includes(o) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(o);
  return {
    'Access-Control-Allow-Origin': ok ? o : origens[0],
    'Access-Control-Allow-Headers': 'Authorization',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

const json = (obj, status = 200, extra = {}) =>
  new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...extra } });

function chaveOk(recebida, env) {
  const a = String(recebida || ''), b = String(env.PAINEL_CHAVE || '');
  if (!b || a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

async function aoVivo(req, env, ctx, cors) {
  const tok = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
  if (!chaveOk(tok, env)) return json({ erro: 'chave' }, 401, cors);

  const cache = caches.default;
  const chaveCache = new Request(new URL('/__cache/ao-vivo', req.url).toString());
  const forcar = new URL(req.url).searchParams.has('agora');
  if (!forcar) {
    const hit = await cache.match(chaveCache);
    if (hit) return new Response(hit.body, { headers: { ...Object.fromEntries(hit.headers), ...cors } });
  }

  const agora = new Date();
  const [ag, tt] = await Promise.allSettled([lerAgenda(env, agora), lerTickTick(env)]);
  const erros = {};
  if (ag.status === 'rejected') erros.agenda = String(ag.reason?.message || ag.reason);
  if (tt.status === 'rejected') erros.tarefas = String(tt.reason?.message || tt.reason);
  const corpo = {
    versao: 1,
    aoVivo: true,
    atualizado: isoBrasilia(agora),
    agenda: ag.status === 'fulfilled' ? ag.value : null,
    tarefas: tt.status === 'fulfilled' ? tt.value : null,
    tarefasTodas: tt.status === 'fulfilled',
    erros,
  };
  const resp = json(corpo, 200, cors);
  if (!Object.keys(erros).length) {
    const guardar = json(corpo, 200, { 'Cache-Control': `max-age=${CACHE_SEG}` });
    ctx.waitUntil(cache.put(chaveCache, guardar));
  }
  return resp;
}

/* ───────── Google Agenda pelo endereço secreto iCal ───────── */
async function lerAgenda(env, agora) {
  const urls = String(env.GCAL_ICS || '').split(/\s+/).filter(Boolean);
  if (!urls.length) throw new Error('falta o GCAL_ICS');
  const listas = await Promise.all(urls.map(async u => {
    const r = await fetch(u, { cf: { cacheTtl: 0 } });
    if (!r.ok) throw new Error('Google Agenda respondeu ' + r.status);
    return agendaDoIcs(ICAL, await r.text(), { agora, dias: 7, calId: calIdDaUrl(u) });
  }));
  return listas.flat().sort((a, b) => a.data.localeCompare(b.data) || String(a.inicio || '').localeCompare(String(b.inicio || '')));
}

function calIdDaUrl(u) {
  const m = /\/calendar\/ical\/([^/]+)\//.exec(u);
  return m ? decodeURIComponent(m[1]) : '';
}

/* ───────── TickTick ───────── */
async function tokenTickTick(env) {
  const salvo = await env.PONTE.get('ticktick', 'json');
  if (!salvo?.access_token) throw new Error('TickTick não conectado: abra /ticktick/conectar');
  if (salvo.expira && Date.now() > salvo.expira) throw new Error('TickTick expirou: abra /ticktick/conectar de novo');
  return salvo.access_token;
}

async function lerTickTick(env) {
  const token = await tokenTickTick(env);
  const get = async p => {
    const r = await fetch(TT_API + p, { headers: { Authorization: 'Bearer ' + token } });
    if (r.status === 401) throw new Error('TickTick recusou o token: abra /ticktick/conectar de novo');
    if (!r.ok) throw new Error('TickTick respondeu ' + r.status + ' em ' + p);
    return r.json();
  };
  const projetos = (await get('/project')).filter(p => !p.closed);
  const dados = await Promise.all([
    ...projetos.map(p => get(`/project/${p.id}/data`)),
    get('/project/inbox/data').catch(() => null),
  ]);
  return tarefasDoTickTick(dados.filter(Boolean));
}

async function conectar(url, env) {
  if (!chaveOk(url.searchParams.get('chave'), env)) return pagina('Chave errada', '<p>Abra com <code>?chave=</code> a mesma chave do painel.</p>', 401);
  const state = crypto.randomUUID();
  await env.PONTE.put('state:' + state, '1', { expirationTtl: 600 });
  const dest = new URL(TT_AUTH);
  dest.search = new URLSearchParams({
    client_id: env.TICKTICK_CLIENT_ID, scope: 'tasks:read', state,
    redirect_uri: url.origin + '/ticktick/volta', response_type: 'code',
  }).toString();
  return Response.redirect(dest.toString(), 302);
}

async function volta(url, env) {
  const code = url.searchParams.get('code'), state = url.searchParams.get('state');
  if (!code || !state || !(await env.PONTE.get('state:' + state))) return pagina('Não deu', '<p>O link expirou. Abra <code>/ticktick/conectar</code> de novo.</p>', 400);
  await env.PONTE.delete('state:' + state);
  const r = await fetch(TT_TOKEN, {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + btoa(env.TICKTICK_CLIENT_ID + ':' + env.TICKTICK_CLIENT_SECRET),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ code, grant_type: 'authorization_code', scope: 'tasks:read', redirect_uri: url.origin + '/ticktick/volta' }),
  });
  const t = await r.json().catch(() => ({}));
  if (!r.ok || !t.access_token) return pagina('Não deu', `<p>O TickTick não entregou o acesso (${r.status}).</p>`, 400);
  const expira = t.expires_in ? Date.now() + (t.expires_in - 3600) * 1000 : null;
  await env.PONTE.put('ticktick', JSON.stringify({ access_token: t.access_token, expira }));
  const quando = expira ? new Date(expira).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' }) : 'sem data';
  return pagina('TickTick conectado ✅', `<p>Pronto. O painel já mostra suas tarefas ao vivo.</p><p>O acesso vale até <b>${quando}</b>; depois é só abrir este link de novo.</p>`);
}

function pagina(titulo, corpo, status = 200) {
  return new Response(`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${titulo}</title>
<body style="font:16px system-ui;max-width:32rem;margin:3rem auto;padding:0 1rem"><h1 style="font-size:1.4rem">${titulo}</h1>${corpo}</body>`,
  { status, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

function isoBrasilia(d) {
  const b = new Date(d.getTime() - 3 * 3600e3).toISOString().slice(0, 19);
  return b + '-03:00';
}
