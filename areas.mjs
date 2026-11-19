import { norm, pad, pymd, ymd } from './datas.mjs?v=220ab830493e';

/* Tópicos fixos de toda área, na ordem do sumário. `re` acha as seções (## …) das notas
   que alimentam o tópico; os tópicos sem `re` são montados pelo painel. */
export const TOPICOS = [
  { id: 'resumo', nome: 'Resumo', emoji: '📌' },
  { id: 'metas', nome: 'Metas e progresso', emoji: '🎯', re: /^(metas?|objetivos?)\b/ },
  { id: 'tarefas', nome: 'Tarefas e próximos passos', curto: 'Tarefas', emoji: '✅' },
  { id: 'agenda', nome: 'Agenda da área', curto: 'Agenda', emoji: '🗓️' },
  { id: 'combinados', nome: 'Combinados', emoji: '🤝', re: /combinad|^acordos?\b|^regras?\b/, tambem: (titulo, texto) => /^historico\b/.test(titulo) && /combinad/i.test(texto) },
  { id: 'decisoes', nome: 'Decisões', emoji: '🧭', re: /^decis/ },
  { id: 'padroes', nome: 'Padrões e aprendizados', emoji: '🔁', re: /^padro|aprendiz|^tecnicas que funcionam|^distracoes|^o que (funciona|trava)/ },
  { id: 'numeros', nome: 'Números e documentos', emoji: '🔢', re: /^(numeros|documentos|contatos)\b/ },
  { id: 'materiais', nome: 'Materiais e links', emoji: '🔗', re: /^(materia|links?\b|recursos|referencias|leituras?\b|lendo\b|lidos\b|trilhas?\b|cursos?\b|videos?\b)/ },
  { id: 'pessoas', nome: 'Pessoas e casos', emoji: '👥' },
  { id: 'perguntas', nome: 'Perguntas em aberto', emoji: '❓', re: /^(perguntas|a revisar|duvidas)\b/ },
  { id: 'conquistas', nome: 'Conquistas', emoji: '🏆', re: /conquist/ },
  // "Ver mais": ficam recolhidos no sumário
  { id: 'esperando', nome: 'Esperando', emoji: '🚧', re: /^(esperando|aguardando)\b/, mais: true },
  { id: 'custos', nome: 'Quanto custa', emoji: '💸', mais: true },
  { id: 'ideias', nome: 'Ideias pra depois', emoji: '💡', re: /^(ideias?\b|quero\b|um dia\b|algum dia\b|backlog\b)/, mais: true },
  { id: 'motivo', nome: 'Por que isso importa', emoji: '❤️', re: /^(por que|porque|motivo|pra que)\b/, mais: true },
];
const TOPICO_IDS = new Set(TOPICOS.map(t => t.id));

const APELIDOS = {
  financas: ['financas', 'dinheiro'], saude: ['saude'], ingles: ['ingles'], trabalho: ['trabalho', 'apsis'],
  carreira: ['carreira'], emocional: ['emocional'], 'casa-familia': ['casa-familia', 'casa e familia', 'casa', 'familia'], cultura: ['cultura'],
};
/** Áreas citadas num texto como "Finanças", "Casa e Família, Trabalho" ou "casa-familia". */
export function areasDoTexto(valor) {
  const partes = norm(valor).split(/\s*[,;/]\s*|\s+e\s+(?=[a-z])/).map(p => p.trim()).filter(Boolean);
  const inteiro = norm(valor).trim();
  const achadas = new Set();
  for (const [area, nomes] of Object.entries(APELIDOS)) {
    if (nomes.includes(inteiro) || partes.some(p => nomes.includes(p))) achadas.add(area);
  }
  return achadas;
}

export function notasDaArea(files, area) {
  const path = `areas/${area}/${area}.md`;
  return Object.values(files).filter(f => f.path.startsWith(`areas/${area}/`))
    .sort((a, b) => Number(b.path === path) - Number(a.path === path)
      || String(b.meta.atualizado || '').localeCompare(String(a.meta.atualizado || ''))
      || a.title.localeCompare(b.title, 'pt-BR'));
}

/** Registro do dia a dia da área (`registros-<area>-aaaa-mm.md`): vira dias no sumário, não nota. */
export const ehRegistroDoMes = path => /\/registros-[^/]+-\d{4}-\d{2}\.md$/.test(path);

export function linkDeRegistro(path) {
  const match = /^areas\/([^/]+)\/(.+)\.md$/.exec(path);
  if (!match) return '';
  if (ehRegistroDoMes(path)) return `#area/${match[1]}/dias`;
  return match[2] === match[1] ? `#area/${match[1]}` : `#area/${match[1]}/nota/${encodeURIComponent(match[2])}`;
}

/* Caminho no fim do link (`casos/tv-samsung` → `casos/tv-samsung.md`); null se o link estiver quebrado. */
const caminhoDoLink = partes => {
  try {
    const path = partes.map(decodeURIComponent).join('/');
    return path && !path.split('/').some(p => !p || p === '.' || p === '..') ? path + '.md' : null;
  } catch { return null; }
};
const linkDoCaminho = path => path.replace(/\.md$/, '').split('/').map(encodeURIComponent).join('/');

/** Toda nota abre na página, com o mesmo layout. Nota da pasta de uma área → dentro da área.
    Nota de fora (caso, pessoa, eu/…) com `area:` de uma das áreas → dentro dessa área.
    Sem área: dentro da área em que você está, ou numa página própria (`#nota/…`). */
export function linkDaNota(path, areaDaNota, areaAtual, areas) {
  const pasta = /^areas\/([^/]+)\//.exec(path);
  if (pasta && areas.includes(pasta[1])) return path === `areas/${pasta[1]}/${pasta[1]}.md` ? `#area/${pasta[1]}/nota/${encodeURIComponent(pasta[1])}` : linkDeRegistro(path);
  const area = areas.includes(areaDaNota) ? areaDaNota : areas.includes(areaAtual) ? areaAtual : null;
  return area ? `#area/${area}/ver/${linkDoCaminho(path)}` : `#nota/${linkDoCaminho(path)}`;
}

/** `#nota/<caminho>` → caminho da nota (página própria, fora das áreas). */
export function notaSolta(hash) {
  const [prefix, ...partes] = hash.replace(/^#/, '').split('/');
  if (prefix !== 'nota' || !partes.length) return null;
  return { path: caminhoDoLink(partes) };
}

/** `#area/<area>[/<tópico>|/dias|/dia/aaaa-mm-dd|/nota/<arquivo>|/ver/<caminho>]` → o que mostrar. */
export function destinoDaArea(hash, areas) {
  const [prefix, area, sub, extra, ...resto] = hash.replace(/^#/, '').split('/');
  if (prefix !== 'area' || !areas.includes(area)) return null;
  const base = { area, vista: 'resumo', dia: null, path: null };
  if (!sub) return base;
  if (sub === 'ver' && extra) return { ...base, vista: 'nota', path: caminhoDoLink([extra, ...resto]) };
  if (TOPICO_IDS.has(sub) && !extra) return { ...base, vista: sub };
  if ((sub === 'dias' || sub === 'registros') && !extra) return { ...base, vista: 'dias' };
  if (sub === 'dia' && /^\d{4}-\d{2}-\d{2}$/.test(extra || '') && !resto.length) return { ...base, vista: 'dia', dia: extra };
  if ((sub === 'nota' || sub === 'registros') && extra && !resto.length) {
    let path = null;
    try { path = `areas/${area}/${decodeURIComponent(extra)}.md`; } catch { path = null; }
    return { ...base, vista: 'nota', path };
  }
  return base;
}

// Preserva introduções, blocos de código e a ordem do texto da nota.
export function secoesDeLeitura(body) {
  const sections = [];
  let title = 'Apresentação', lines = [], fence = '', firstTitle = true, intro = true;
  const flush = () => {
    const text = lines.join('\n').trim();
    if (text) sections.push(intro ? { title, text, intro: true } : { title, text });
    lines = [];
    intro = false;
  };
  for (const line of body.split(/\r?\n/)) {
    const delimiter = /^\s*(`{3,}|~{3,})/.exec(line);
    if (delimiter) {
      if (!fence) fence = delimiter[1];
      else if (delimiter[1].startsWith(fence)) fence = '';
    }
    if (!fence) {
      if (firstTitle && /^#\s/.test(line)) { firstTitle = false; continue; }
      const heading = /^#{1,2}\s+(.+)$/.exec(line);
      if (heading) { flush(); title = heading[1].trim(); continue; }
    }
    lines.push(line);
  }
  flush();
  return sections;
}

export function primeiraMeta(sections) {
  const goals = sections.find(section => /^(metas?|objetivos?)\b/.test(norm(section.title)));
  if (!goals) return '';
  const lista = goals.text.split('\n').map(line => line.trim()).find(line => /^[-*]\s+/.test(line));
  if (lista) return lista.replace(/^[-*]\s+(?:\[[ xX]\]\s*)?/, '');
  const meta = metasDaTabela(goals.text)[0];
  return meta ? meta.meta : '';
}

const celulas = l => l.trim().replace(/^\|/, '').replace(/\|$/, '').split(/(?<!\\)\|/).map(c => c.trim().replace(/\\\|/g, '|'));
const ehSeparador = l => /^\|\s*:?-{3,}/.test(l.trim());
const vazio = v => !v || /^[–—-]+$/.test(v.trim());

/** Tabela "| Meta | Atual | Alvo |" → [{ meta, atual, alvo, pct }], pct só quando os dois são números. */
export function metasDaTabela(text) {
  const out = [];
  let head = null;
  for (const l of String(text || '').split('\n')) {
    if (!l.trim().startsWith('|')) { head = null; continue; }
    if (ehSeparador(l)) continue;
    const c = celulas(l);
    if (!head) { head = c.map(x => norm(x)); continue; }
    const col = re => head.findIndex(x => re.test(x));
    const iMeta = Math.max(0, col(/^(meta|objetivo)/)), iAtual = col(/^atual/), iAlvo = col(/^(alvo|meta final)/);
    if (vazio(c[iMeta])) continue;
    const atual = iAtual >= 0 ? c[iAtual] || '' : '', alvo = iAlvo >= 0 ? c[iAlvo] || '' : '';
    const num = s => { const m = String(s).replace(/\./g, '').match(/-?\d+(?:,\d+)?/); return m ? Number(m[0].replace(',', '.')) : null; };
    const a = num(atual), b = num(alvo);
    out.push({ meta: c[iMeta], atual, alvo, pct: a !== null && b ? Math.max(0, Math.min(100, Math.round(a / b * 100))) : null });
  }
  return out;
}

const dataValida = iso => /^\d{4}-\d{2}-\d{2}$/.test(iso) && ymd(pymd(iso)) === iso;

/** Tudo que tem data numa nota: seções "## aaaa-mm-dd", parágrafos "Notas de dd/mm" e linhas de
    tabela cuja 1ª coluna é Data/Dia. Cada entrada: { date, tipo: 'texto'|'linha', titulo, secao, texto|campos }. */
export function entradasDatadas(file) {
  const out = [];
  const ano = (file.path.match(/-(\d{4})-\d{2}\.md$/) || [])[1] || String(file.meta?.atualizado || '').slice(0, 4);
  let fence = '', h2 = '', bloco = null, nivel = 0, head = null;
  const fechar = () => {
    if (!bloco) return;
    const texto = bloco.linhas.join('\n').trim();
    if (texto) out.push({ date: bloco.date, tipo: 'texto', titulo: bloco.titulo, secao: bloco.secao, texto });
    bloco = null;
  };
  for (const raw of String(file.body || '').split(/\r?\n/)) {
    const delim = /^\s*(`{3,}|~{3,})/.exec(raw);
    if (delim || fence) {
      if (delim) { if (!fence) fence = delim[1]; else if (delim[1].startsWith(fence)) fence = ''; }
      if (bloco) bloco.linhas.push(raw);
      continue;
    }
    const hd = /^(#{1,6})\s+(.*)$/.exec(raw);
    if (hd) {
      const lvl = hd[1].length, t = hd[2].trim(), d = t.slice(0, 10);
      if (bloco && (lvl <= nivel || bloco.solto)) fechar();
      head = null;
      if (lvl >= 2 && dataValida(d)) {
        fechar();
        bloco = { date: d, titulo: t.slice(10).replace(/^[\s·—–:-]+/, '').trim(), secao: lvl > 2 ? h2 : '', linhas: [] };
        nivel = lvl;
      } else if (bloco) bloco.linhas.push(raw);
      if (lvl <= 2) h2 = t;
      continue;
    }
    const nt = /^(?:\*{1,2})?Notas? de (\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?\b(.*)$/i.exec(raw.trim());
    if (nt && ano) {
      fechar();
      const iso = `${nt[3] || ano}-${pad(nt[2])}-${pad(nt[1])}`;
      if (dataValida(iso)) {
        bloco = { date: iso, titulo: nt[4].replace(/\*+/g, '').replace(/^[\s,]+|:\s*$/g, '').replace(/^\((.*)\)$/, '$1').trim(), secao: h2, linhas: [], solto: true };
        nivel = 99;
      }
      continue;
    }
    if (bloco?.solto && !raw.trim() && bloco.linhas.length) { fechar(); continue; }
    if (bloco) { bloco.linhas.push(raw); continue; }
    if (raw.trim().startsWith('|')) {
      if (ehSeparador(raw)) continue;
      const c = celulas(raw);
      if (!head) { head = c; continue; }
      const d = (c[0] || '').slice(0, 10);
      if (/^(data|dia)\b/.test(norm(head[0])) && dataValida(d)) {
        const campos = head.slice(1).map((k, i) => [k, c[i + 1] || '']).filter(([, v]) => !vazio(v));
        out.push({ date: d, tipo: 'linha', titulo: h2, secao: h2, campos, quando: c[0] });
      }
      continue;
    }
    head = null;
  }
  fechar();
  return out;
}

const FORA = ['eu/habitos.md', 'eu/decisoes.md', 'documentos/documentos.md', 'agenda.md'];
const ROTULO_FORA = { 'eu/habitos.md': 'Hábitos', 'eu/decisoes.md': 'Decisões', 'documentos/documentos.md': 'Documentos', 'agenda.md': 'Agenda' };
const SO_CAMPOS = { 'agenda.md': /^(hora|o que)/ };

/** Casos (pasta casos/) cujo frontmatter `area` é esta área. */
export function casosDaArea(files, area) {
  return Object.values(files).filter(f => f.path.startsWith('casos/') && areasDoTexto(f.meta?.area || '').has(area));
}

function linhaDeFora(e, area, casos) {
  for (const [k, v] of e.campos) {
    const nk = norm(k);
    if (/^areas?$/.test(nk) && areasDoTexto(v).has(area)) return true;
    if (nk === 'caso') {
      const links = [...v.matchAll(/\[\[([^\]|#]+)/g)].map(m => m[1].trim().toLowerCase());
      if (links.some(l => l === area || casos.has(l))) return true;
    }
  }
  return false;
}

/** Os registros diários da área, do mais novo ao mais antigo: [{ date, entradas: [...] }].
    Junta as notas da pasta da área, as linhas do tempo dos casos da área e as linhas de
    hábitos, decisões e documentos marcadas com a área. Datas futuras ficam de fora. */
export function diasDaArea(files, area, hoje) {
  const casos = new Set(casosDaArea(files, area).map(f => (f.stem || f.path.split('/').pop().replace(/\.md$/, '')).toLowerCase()));
  const porDia = new Map();
  for (const f of Object.values(files)) {
    const naArea = f.path.startsWith(`areas/${area}/`);
    const stem = (f.stem || f.path.split('/').pop().replace(/\.md$/, '')).toLowerCase();
    const caso = f.path.startsWith('casos/') && casos.has(stem);
    const fora = FORA.includes(f.path);
    if (!naArea && !caso && !fora) continue;
    for (const e of entradasDatadas(f)) {
      if (e.date > hoje) continue;
      if (fora) {
        if (e.tipo !== 'linha' || !linhaDeFora(e, area, casos)) continue;
        e.campos = e.campos.filter(([k]) => !/^areas?$/.test(norm(k)) && (!SO_CAMPOS[f.path] || SO_CAMPOS[f.path].test(norm(k))));
      }
      const entrada = { ...e, path: f.path, fonte: ROTULO_FORA[f.path] || f.title || stem, origem: naArea ? (ehRegistroDoMes(f.path) ? 'registro' : 'area') : caso ? 'caso' : 'fora' };
      if (!porDia.has(e.date)) porDia.set(e.date, []);
      porDia.get(e.date).push(entrada);
    }
  }
  const ordem = { registro: 0, fora: 1, area: 2, caso: 3 };
  return [...porDia.entries()].sort((a, b) => b[0].localeCompare(a[0]))
    .map(([date, entradas]) => ({ date, entradas: entradas.sort((a, b) => ordem[a.origem] - ordem[b.origem]) }));
}

/** Texto com algo além de cabeçalhos de tabela vazios e linhas em branco. */
export function temConteudo(texto) {
  let tabela = 0;
  return String(texto || '').split('\n').some(l => {
    const t = l.trim();
    if (!t.startsWith('|')) { tabela = 0; return !!t && !/^#{1,6}\s/.test(t); }
    tabela += 1;
    return tabela > 2;
  });
}
/** Seções das notas que alimentam um tópico: [{ path, fonte, titulo, texto }]. */
export function secoesDoTopico(notas, topico) {
  const t = TOPICOS.find(x => x.id === topico);
  if (!t?.re) return [];
  const out = [];
  for (const f of notas) {
    const stem = norm(f.stem || f.path.split('/').pop().replace(/\.md$/, ''));
    if (t.re.test(stem) && !f.path.startsWith('casos/')) {
      const texto = f.body.replace(/^#\s.*$/m, '').trim();
      if (temConteudo(texto)) out.push({ path: f.path, fonte: f.title, titulo: f.title, texto, inteira: true });
      continue;
    }
    for (const s of secoesDeLeitura(f.body)) if ((t.re.test(norm(s.title)) || t.tambem?.(norm(s.title), s.text)) && temConteudo(s.text)) out.push({ path: f.path, fonte: f.title, titulo: s.title, texto: s.text });
  }
  return out;
}

/** Hábitos da área: feitos/faltas por hábito, motivos e o dia da semana que mais falha. */
export function padroesDosHabitos(habitos, area, hoje, dias = 30) {
  const desde = ymd(new Date(pymd(hoje).getTime() - dias * 864e5));
  const daArea = habitos.filter(x => x.area === area && x.date >= desde && x.date <= hoje && x.st);
  const porNome = new Map();
  const faltasPorDia = new Array(7).fill(0);
  for (const x of daArea) {
    const nome = x.oque.replace(/\s*\([^)]*\)\s*/g, ' ').replace(/^[^\p{L}]+/u, '').replace(/\s+/g, ' ').trim().toLowerCase() || x.oque;
    if (!porNome.has(nome)) porNome.set(nome, { nome, feito: 0, nao: 0, cancelado: 0, motivos: [] });
    const r = porNome.get(nome);
    r[x.st] += 1;
    if (x.st === 'nao') {
      faltasPorDia[pymd(x.date).getDay()] += 1;
      if (!vazio(x.motivo)) r.motivos.push({ date: x.date, motivo: x.motivo });
    }
  }
  const lista = [...porNome.values()].sort((a, b) => (b.feito + b.nao) - (a.feito + a.nao) || a.nome.localeCompare(b.nome, 'pt-BR'));
  const max = Math.max(...faltasPorDia);
  return { lista, total: daArea.length, diaQueMaisFalha: max > 1 ? faltasPorDia.indexOf(max) : null, desde };
}

/* Gastos da planilha que contam como da área: categorias e, quando a categoria é dividida
   entre áreas (Educação), palavras da descrição. */
export const CUSTOS_DA_AREA = {
  saude: { categorias: ['Saúde'] },
  'casa-familia': { categorias: ['Mercado', 'Moradia', 'Família', 'Contas fixas'] },
  cultura: { categorias: ['Lazer'] },
  ingles: { categorias: ['Educação'], descricao: /ingl|cake|english/i },
  carreira: { categorias: ['Educação'], descricao: /alura|curso|udemy|rocketseat|livro t[eé]cnico/i },
};
/** Despesas da área num mês (aaaa-mm): { itens, total }. */
export function custosDaArea(despesas, area, mes) {
  const regra = CUSTOS_DA_AREA[area];
  if (!regra) return { itens: [], total: 0 };
  const cats = new Set(regra.categorias.map(c => norm(c)));
  const itens = despesas.filter(d => String(d.data || '').startsWith(mes) && cats.has(norm(d.categoria))
    && (!regra.descricao || regra.descricao.test(d.descricao || '')))
    .sort((a, b) => String(b.data).localeCompare(String(a.data)));
  return { itens, total: Math.round(itens.reduce((t, d) => t + (Number(d.valor) || 0), 0) * 100) / 100 };
}

/** Links citados nas notas (menos os de documentos do Google, que ficam em Números). */
export function linksDasNotas(notas) {
  const vistos = new Set(), out = [];
  for (const f of notas) {
    for (const linha of String(f.body || '').split('\n')) {
      for (const m of linha.matchAll(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|(?:^|[\s(])(https?:\/\/[^\s<)]+)/g)) {
        const url = (m[2] || m[3] || '').replace(/[.,;:]+$/, '');
        if (!url || vistos.has(url) || /(drive|docs|mail)\.google\.com|claude\.ai/.test(url)) continue;
        vistos.add(url);
        out.push({ url, titulo: m[1] || '', contexto: linha.replace(/^\s*([-*+]|\d+\.)\s+(\[[ xX]\]\s*)?/, '').trim(), path: f.path, fonte: f.title });
      }
    }
  }
  return out;
}
