import { norm, pymd } from './datas.mjs?v=d6613cd2a56f';

/* ─────────────── Escrita na Memória (23/11/2026) ───────────────
   O painel volta a gravar nas notas, direto no lugar certo. Tudo aqui é texto → texto,
   sem tocar no GitHub: o painel lê a nota, aplica a função e sobe o resultado.
   Os formatos são os mesmos que o assessor usa (AGENTS.md do repo de dados). */

export const DIAS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
export const diaDaSemana = iso => DIAS[pymd(iso).getDay()];
const dataOk = s => /^\d{4}-\d{2}-\d{2}$/.test(s || '');
const ddmm = iso => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;
const erroSumiu = () => Object.assign(new Error('sumiu'), { code: 'sumiu' });

/** Nome de arquivo a partir do título: "Como me sinto" → "como-me-sinto". */
export function slug(texto, max = 48) {
  const s = norm(texto).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, max).replace(/-+$/, '');
  return s || 'nota';
}
/** Nome livre no cofre inteiro (o Obsidian liga as notas pelo nome do arquivo). */
export function nomeLivre(base, existentes, sufixo = '') {
  const tem = s => existentes.has(s.toLowerCase());
  if (!tem(base)) return base;
  if (sufixo && !tem(`${base}-${sufixo}`)) return `${base}-${sufixo}`;
  for (let i = 2; ; i++) if (!tem(`${base}-${i}`)) return `${base}-${i}`;
}

/** Texto que ele digitou: sem espaço sobrando no fim das linhas e sem linhas em branco repetidas. */
export function limpo(txt) {
  return String(txt || '').replace(/\r\n?/g, '\n').split('\n').map(l => l.replace(/\s+$/, '')).join('\n')
    .replace(/\n{3,}/g, '\n\n').replace(/^\n+|\n+$/g, '');
}
export const umaLinha = s => limpo(s).replace(/\s*\n+\s*/g, ' ').trim();
/* Célula de tabela: sem quebra e com a barra escapada. */
const celula = s => umaLinha(s).replace(/\|/g, '\\|') || '—';
/* Valor de frontmatter numa linha só, sem colchetes ou aspas nas pontas (na lista de tags, sem vírgula). */
const valorFm = s => umaLinha(s).replace(/^[[\]"']+|[[\]"']+$/g, '').trim();
const tag = s => valorFm(s).replace(/\s*,\s*/g, ' ').toLowerCase();

/* ─────────────── frontmatter ─────────────── */
function partes(text) {
  const t = String(text ?? '');
  const m = t.match(/^---\n([\s\S]*?)\n---\n?/);
  return m ? { fm: m[1], resto: t.slice(m[0].length) } : { fm: null, resto: t };
}
export function campo(text, nome) {
  const { fm } = partes(text);
  const m = fm == null ? null : fm.match(new RegExp(`^${nome}:[ \\t]*(.*)$`, 'm'));
  return m ? m[1].trim() : '';
}
/** Põe (ou troca) um campo do frontmatter; valor null tira o campo. */
export function definirCampo(text, nome, valor) {
  const { fm, resto } = partes(text);
  const corpo = resto.replace(/^\n+/, '');
  if (fm == null) return valor == null ? String(text ?? '') : `---\n${nome}: ${valor}\n---\n\n${corpo}`;
  const re = new RegExp(`^${nome}:.*$`);
  let ls = fm.split('\n');
  if (valor == null) ls = ls.filter(l => !re.test(l));
  else if (ls.some(l => re.test(l))) ls = ls.map(l => re.test(l) ? `${nome}: ${valor}` : l);
  else { const i = ls.findIndex(l => /^atualizado:/.test(l)); ls.splice(i >= 0 ? i : ls.length, 0, `${nome}: ${valor}`); }
  return `---\n${ls.join('\n')}\n---\n\n${corpo}`;
}

/* ─────────────── seções ─────────────── */
/* Cabeçalhos fora de bloco de código: [{ i, nivel, titulo }]. */
function cabecalhos(L) {
  const out = [];
  let fence = '';
  L.forEach((l, i) => {
    const d = /^\s*(`{3,}|~{3,})/.exec(l);
    if (d) { if (!fence) fence = d[1]; else if (d[1].startsWith(fence)) fence = ''; return; }
    if (fence) return;
    const m = /^(#{1,6})\s+(.*?)\s*$/.exec(l);
    if (m) out.push({ i, nivel: m[1].length, titulo: m[2].trim() });
  });
  return out;
}
function inicioDoCorpo(L) {
  if (L[0] !== '---') return 0;
  const f = L.indexOf('---', 1);
  return f > 0 ? f + 1 : 0;
}
/** Seções de nível 2 (## …): { i (linha do título), fim (exclusivo), titulo }. */
export function secoes2(L) {
  const corpo = inicioDoCorpo(L);
  const hs = cabecalhos(L).filter(x => x.i >= corpo);
  return hs.filter(x => x.nivel === 2).map(x => {
    const prox = hs.find(y => y.i > x.i && y.nivel <= 2);
    return { i: x.i, fim: prox ? prox.i : L.length, titulo: x.titulo };
  });
}
const chaveSimples = t => norm(String(t).replace(/[^\p{L}\p{N}\s/-]/gu, ' ')).replace(/\s+/g, ' ').trim();
/** A seção cujo título começa com `nome` (sem acento, sem emoji). */
export function acharSecao(L, nome) {
  const alvo = chaveSimples(nome);
  return secoes2(L).find(s => { const t = chaveSimples(s.titulo); return t === alvo || t.startsWith(alvo + ' ') || t.startsWith(alvo + '/'); }) || null;
}
const linhas = base => String(base ?? '').replace(/\s+$/, '').split('\n');
const juntar = L => L.join('\n').replace(/\s+$/, '') + '\n';
const semBrancos = c => { const x = [...c]; while (x.length && !x[0].trim()) x.shift(); while (x.length && !x[x.length - 1].trim()) x.pop(); return x; };
const corpoDa = (L, s) => semBrancos(L.slice(s.i + 1, s.fim));
/* Põe o bloco na linha i, com uma linha em branco antes e depois. */
function inserirBloco(L, i, bloco) {
  const antes = L.slice(0, i), depois = L.slice(i);
  while (antes.length && !antes[antes.length - 1].trim()) antes.pop();
  while (depois.length && !depois[0].trim()) depois.shift();
  return juntar([...antes, ...(antes.length ? [''] : []), ...bloco, ...(depois.length ? ['', ...depois] : [])]);
}
/* Reescreve o corpo da seção, mantendo o título e o lugar. */
const reescrever = (L, s, corpo) => inserirBloco([...L.slice(0, s.i), ...L.slice(s.fim)], s.i, [L[s.i], ...(corpo.length ? ['', ...corpo] : [])]);
const ehItem = l => /^\s*([-*+]|\d+\.)\s/.test(l || '');
const ehTabela = l => /^\s*\|/.test(l || '');
/* Junta dois blocos de linhas: lista com lista e tabela com tabela seguem coladas; o resto ganha uma linha em branco. */
function emSeguida(a, b) {
  if (!a.length) return [...b];
  if (!b.length) return [...a];
  const colado = (ehItem(a[a.length - 1]) && ehItem(b[0])) || (ehTabela(a[a.length - 1]) && ehTabela(b[0]));
  return colado ? [...a, ...b] : [...a, '', ...b];
}

/** Título de registro: "2026-11-23 seg · Ansiedade antes da daily" → { data, dia, titulo }. */
export function lerTitulo(t) {
  const m = /^(\d{4}-\d{2}-\d{2})(?:\s+(seg|ter|qua|qui|sex|s[áa]b|dom)\.?)?\s*(?:[·—–:|-]\s*)?(.*)$/i.exec(String(t || '').trim());
  if (!m || !dataOk(m[1])) return { data: null, dia: '', titulo: String(t || '').trim() };
  return { data: m[1], dia: m[2] || '', titulo: m[3].trim() };
}
export const tituloDoRegistro = (data, titulo) => `${data} ${diaDaSemana(data)}${umaLinha(titulo) ? ' · ' + umaLinha(titulo) : ''}`;

/* Chave do registro: o título da seção (+ §n quando o mesmo título se repete). */
function comChaves(L) {
  const vistos = new Map();
  return secoes2(L).map(s => {
    const n = (vistos.get(s.titulo) || 0) + 1;
    vistos.set(s.titulo, n);
    return { ...s, chave: n > 1 ? `${s.titulo}§${n}` : s.titulo };
  });
}
const achar = (L, chave) => comChaves(L).find(s => s.chave === chave) || null;

const FIXADO = /^(📌|fixad)/u;
/** Uma nota vista como pasta: cada "## …" é um registro.
    { intro, fixados, registros }; registro = { chave, titulo, data, rotulo, temTitulo, texto, ordem }. */
export function registrosDaNota(text) {
  const L = String(text || '').split('\n');
  const S = comChaves(L);
  const corpo = inicioDoCorpo(L);
  const intro = L.slice(corpo, S[0]?.i ?? L.length).filter(l => !/^#\s/.test(l)).join('\n').trim();
  const fixados = [], registros = [];
  S.forEach((s, ordem) => {
    const { data, titulo } = lerTitulo(s.titulo);
    const texto = L.slice(s.i + 1, s.fim).join('\n').trim();
    const primeira = texto.split('\n').map(x => x.trim()).find(x => x && !/^[|>#]/.test(x)) || '';
    const rotulo = titulo || primeira.replace(/^([-*+]|\d+\.)\s+(\[[ xX]\]\s*)?/, '').replace(/\*\*/g, '').slice(0, 90) || (data ? 'Registro' : s.titulo);
    const r = { chave: s.chave, titulo: s.titulo, data, rotulo, temTitulo: Boolean(titulo), texto, ordem };
    (!data && FIXADO.test(norm(s.titulo).trim()) ? fixados : registros).push(r);
  });
  return { intro, fixados, registros };
}
/** Ordem da pasta: 'data' (mais novo primeiro; sem data no fim, na ordem da nota) ou 'titulo' (A–Z). */
export function ordenarRegistros(regs, ordem = 'data') {
  const r = [...regs];
  if (ordem === 'titulo') return r.sort((a, b) => a.rotulo.localeCompare(b.rotulo, 'pt-BR', { sensitivity: 'base' }) || String(b.data || '').localeCompare(String(a.data || '')));
  return r.sort((a, b) => (b.data ? 1 : 0) - (a.data ? 1 : 0) || String(b.data || '').localeCompare(String(a.data || ''))
    || (a.data ? b.ordem - a.ordem : a.ordem - b.ordem));
}

/* Posição do registro novo: antes da 1ª seção com data maior (mesma data: depois das que já existem). */
const posDaData = (L, data) => (data && secoes2(L).find(s => { const d = lerTitulo(s.titulo).data; return d && d > data; })?.i) ?? L.length;
/** Texto digitado → markdown: cada linha de prosa vira um parágrafo (no textarea, Enter é quebra de linha;
    no markdown, uma quebra só junta as linhas). Listas, tabelas, citações e títulos ficam como estão. */
export function paragrafos(texto) {
  const L = limpo(texto).split('\n'), out = [];
  const tipo = l => /^\s*([-*+]|\d+\.)\s|^\s{2,}\S/.test(l) ? 'lista' : /^\s*\|/.test(l) ? 'tabela' : /^\s*>/.test(l) ? 'citacao' : 'prosa';
  let fence = false;
  L.forEach((l, i) => {
    const ant = L[i - 1], cerca = /^\s*```/.test(l);
    if (i && !fence && l.trim() && ant?.trim() && !(tipo(ant) === tipo(l) && tipo(l) !== 'prosa')) out.push('');
    if (cerca) fence = !fence;
    out.push(l);
  });
  return out.join('\n');
}
const blocoDoRegistro = (data, titulo, texto) => {
  const cab = data ? tituloDoRegistro(data, titulo) : umaLinha(titulo) || 'Anotação';
  return [`## ${cab}`, ...(limpo(texto) ? ['', ...paragrafos(texto).split('\n')] : [])];
};
/** Acrescenta um registro "## data ddd · título" na ordem das datas. */
export function acrescentarRegistro(base, { data, titulo, texto }) {
  const L = linhas(base);
  return inserirBloco(L, posDaData(L, data), blocoDoRegistro(data, titulo, texto));
}
/** A chave da última seção com esse título (o registro que acabou de entrar). */
export const chaveDoTitulo = (texto, titulo) => comChaves(String(texto || '').split('\n')).filter(s => s.titulo === titulo).pop()?.chave || titulo;
/** A chave que o registro recém-gravado ganhou (pra abrir e destacar no painel). */
export const chaveDoNovo = (texto, data, titulo) => chaveDoTitulo(texto, data ? tituloDoRegistro(data, titulo) : umaLinha(titulo) || 'Anotação');
/** Troca o registro (título, data e texto); se a data mudou, ele vai pro lugar da data nova. */
export function trocarRegistro(base, chave, { data, titulo, texto }) {
  const L = String(base ?? '').split('\n');
  const s = achar(L, chave);
  if (!s) throw erroSumiu();
  const bloco = blocoDoRegistro(data, titulo || (!data ? s.titulo : ''), texto);
  const sem = [...L.slice(0, s.i), ...L.slice(s.fim)];
  if ((lerTitulo(s.titulo).data || null) === (data || null)) return inserirBloco(sem, s.i, bloco);
  const L2 = linhas(juntar(sem));
  return inserirBloco(L2, posDaData(L2, data), bloco);
}
/** Tira o registro da nota: { texto (a nota sem ele), bloco (as linhas do registro, título incluído) }. */
export function tirarRegistro(base, chave) {
  const L = String(base ?? '').split('\n');
  const s = achar(L, chave);
  if (!s) throw erroSumiu();
  return { texto: juntar([...L.slice(0, s.i), ...L.slice(s.fim)]), bloco: semBrancos(L.slice(s.i, s.fim)) };
}
/** Põe um registro vindo de outra nota, na ordem das datas. */
export function porBloco(base, bloco) {
  const L = linhas(base);
  return inserirBloco(L, posDaData(L, lerTitulo(String(bloco[0] || '').replace(/^##\s+/, '')).data), bloco);
}

/* ─────────────── notas novas ─────────────── */
const fm = campos => `---\n${Object.entries(campos).filter(([, v]) => v != null && v !== '').map(([k, v]) => `${k}: ${v}`).join('\n')}\n---\n`;
/** Pasta nova de uma área: uma nota em que cada "## …" é um registro. */
export function novaPasta({ area, titulo, ordem = 'data', topico = null, resumo = '', hoje }) {
  const nome = umaLinha(titulo);
  return `${fm({ tipo: 'pasta', area, status: 'ativo', tags: `[${tag(nome)}]`, pessoas: '[]',
    resumo: valorFm(resumo) || `${valorFm(nome)}: registros com data.`, ordem: ordem === 'titulo' ? 'titulo' : 'data', topico, atualizado: hoje })}\n# ${nome}\n`;
}
export const NOMES_AREAS = { financas: 'Finanças', saude: 'Saúde', ingles: 'Inglês', trabalho: 'Trabalho', musica: 'Música', carreira: 'Carreira', emocional: 'Emocional', 'casa-familia': 'Casa e Família', cultura: 'Cultura' };
/** Nota principal nova da área (só o título; as seções nascem quando houver o que pôr). */
export function novaNotaPrincipal({ area, hoje }) {
  const nome = NOMES_AREAS[area] || area;
  return `${fm({ tipo: 'area', area, status: 'bem', tags: `[${area}]`, pessoas: '[]', resumo: nome, atualizado: hoje })}\n# ${nome}\n`;
}
/** Registro do mês da área (o mesmo do `cerebro.py diario --area`). */
export function novoRegistroDoMes({ area, mes, hoje }) {
  const nome = NOMES_AREAS[area] || area, m = MESES[+mes.slice(5, 7) - 1], a = mes.slice(0, 4);
  return `${fm({ tipo: 'registro', area, status: 'ativo', tags: `[registros, dia, ${area}]`, pessoas: '[]', resumo: `O dia a dia de ${nome} em ${m} de ${a}: o que ele fez, não fez ou aconteceu nesta área.`, atualizado: hoje })}\n# ${nome} — registros de ${m} de ${a}\n\nUma seção por dia. Grava com \`cerebro.py diario "…" --area ${area}\` (vai junto no diário geral). Hábitos, journal, treinos, decisões e linhas do tempo dos casos desta área aparecem no painel sem copiar pra cá.\n`;
}
/** Diário geral do mês (o mesmo do `_modelos/diario.md`). */
export function novoDiario({ mes, hoje }) {
  const m = MESES[+mes.slice(5, 7) - 1], a = mes.slice(0, 4);
  return `${fm({ tipo: 'diario', area: 'eu', status: 'ativo', tags: '[diario, dia, feito, nao-feito, check-in, blocos]', pessoas: '[]', resumo: `Diário de ${m} de ${a} — o que foi feito e o que não foi a cada dia.`, atualizado: hoje })}\n# Diário — ${m} de ${a}\n`;
}
/** Diário emocional do mês: cada "## data ddd · …" é um registro. */
export function novoJournal({ mes, hoje }) {
  const m = MESES[+mes.slice(5, 7) - 1], a = mes.slice(0, 4);
  return `${fm({ tipo: 'registro', area: 'emocional', status: 'ativo', tags: '[journal, autoconhecimento]', pessoas: '[]', resumo: `Diário emocional de ${m} de ${a}.`, atualizado: hoje })}\n# Diário emocional — ${m} de ${a}\n`;
}
/** Caso novo (projeto, processo): o modelo do repo, sem tarefas (elas ficam no TickTick). */
export function novoCaso({ titulo, area, resumo, agora, hoje }) {
  const nome = umaLinha(titulo), ag = umaLinha(agora);
  return `${fm({ tipo: 'caso', area: area || 'pessoal', status: 'aberto', tags: `[${tag(nome)}]`, pessoas: '[]', resumo: valorFm(resumo) || valorFm(nome), atualizado: hoje })}
# ${nome}

## Números do caso

| Número | O quê | Onde | Data |
|---|---|---|---|

## Onde está
${ag ? `\n**Agora (${ddmm(hoje)}):** ${ag}\n` : ''}
## Contatos

## Linha do tempo

| Data | O que aconteceu |
|---|---|

## Arquivos

Pasta no Drive: Meu Assessor › Casos › ${nome}. Cada arquivo também em [[documentos]].
`;
}

/* ─────────────── registro do dia ─────────────── */
/** Cada linha vira um item ("- …"), com o prefixo (✅, ❌) quando houver. */
export function itensDoDia(texto, prefixo = '') {
  return limpo(texto).split('\n').map(l => l.trim()).filter(Boolean).map(l => {
    const sem = l.replace(/^([-*+]|\d+\.)\s+/, '');
    return `- ${prefixo && !sem.startsWith(prefixo) ? prefixo + ' ' : ''}${sem}`;
  });
}
const secaoDoDia = (L, data) => secoes2(L).find(x => { const t = lerTitulo(x.titulo); return t.data === data && !t.titulo; });
/** Itens na seção "## aaaa-mm-dd ddd" (cria na ordem certa), como o `cerebro.py diario`. */
export function noDia(base, data, itens) {
  const L = linhas(base);
  const s = secaoDoDia(L, data);
  if (s) return reescrever(L, s, emSeguida(corpoDa(L, s), itens));
  return inserirBloco(L, posDaData(L, data), [`## ${data} ${diaDaSemana(data)}`, '', ...itens]);
}
/** O dia já tem uma linha com esse trecho? (pra não repetir o aviso no diário) */
export function diaTem(base, data, trecho) {
  const L = linhas(base);
  const s = secaoDoDia(L, data);
  return Boolean(s) && L.slice(s.i + 1, s.fim).some(l => l.includes(trecho));
}
/** Arquivo da área: o que ele arquivou pelo painel. Tem `arquivado:`, então só a busca acha. */
export function novoArquivo({ area, hoje }) {
  const nome = NOMES_AREAS[area] || area;
  return `${fm({ tipo: 'arquivo', area, status: 'arquivado', tags: `[arquivo, ${area}]`, pessoas: '[]', resumo: `Registros de ${nome} que ele arquivou pelo painel. Só a busca acha.`, arquivado: hoje, atualizado: hoje })}\n# Arquivo de ${nome}\n`;
}
/** O registro que vai pro arquivo leva a data e de onde veio. */
export const blocoArquivado = (bloco, hoje, origem) => [bloco[0], '', `_Arquivado em ${ddmm(hoje)}; veio de [[${origem}]]._`, ...bloco.slice(1)];

/* ─────────────── seções da nota principal e dos casos ─────────────── */
export const ORDEM_AREA = ['Agora', 'Metas do trimestre', 'Importante', 'Histórico'];
const ORDEM_CASO = ['Números do caso', 'Onde está', 'Histórico da situação', 'Contatos', 'Próximos passos', 'Linha do tempo', 'Arquivos'];
/* Garante a seção, no lugar dela na ordem da nota. */
function garantir(L, nome, ordem) {
  if (acharSecao(L, nome)) return L;
  const pos = ordem.indexOf(nome);
  const depois = ordem.slice(pos + 1).map(n => acharSecao(L, n)).find(Boolean);
  const antes = depois ? null : ordem.slice(0, Math.max(0, pos)).reverse().map(n => acharSecao(L, n)).find(Boolean);
  return linhas(inserirBloco(L, depois ? depois.i : antes ? antes.fim : L.length, [`## ${nome}`]));
}
/** Troca o conteúdo de uma seção (cria se não existir). Conteúdo vazio tira a seção. */
export function trocarSecao(base, nome, conteudo, ordem = ORDEM_AREA) {
  const c = limpo(conteudo);
  let L = linhas(base);
  const existe = acharSecao(L, nome);
  if (!c) return existe ? juntar([...L.slice(0, existe.i), ...L.slice(existe.fim)]) : juntar(L);
  L = garantir(L, nome, ordem);
  return reescrever(L, acharSecao(L, nome), c.split('\n'));
}
export function textoDaSecao(base, nome) {
  const L = String(base ?? '').split('\n');
  const s = acharSecao(L, nome);
  return s ? corpoDa(L, s).join('\n') : '';
}

/* Primeira tabela da seção: { ini, fim, head }, ou null. */
function tabelaDa(L, s) {
  let k = s.i + 1;
  while (k < s.fim && !ehTabela(L[k])) k++;
  if (k >= s.fim) return null;
  const ini = k;
  while (k < s.fim && ehTabela(L[k])) k++;
  return { ini, fim: k, head: celulas(L[ini]) };
}
const celulas = l => l.trim().replace(/^\|/, '').replace(/(?<!\\)\|$/, '').split(/(?<!\\)\|/).map(c => c.trim());
const linhaDaTabela = cs => `| ${cs.join(' | ')} |`;
/* Uma linha no fim da tabela da seção (cria seção e tabela quando precisar). */
function linhaNaTabela(base, nome, cabeca, valores, ordem) {
  const L = garantir(linhas(base), nome, ordem);
  const s = acharSecao(L, nome);
  const t = tabelaDa(L, s);
  if (!t) return reescrever(L, s, emSeguida(corpoDa(L, s), [linhaDaTabela(cabeca), `|${cabeca.map(() => '---').join('|')}|`, linhaDaTabela(valores)]));
  return juntar([...L.slice(0, t.fim), linhaDaTabela(t.head.map((_, i) => valores[i] ?? '—')), ...L.slice(t.fim)]);
}

/* Metas do trimestre: | Meta | Atual | Alvo | */
export const acrescentarMeta = (base, { meta, atual, alvo }) =>
  linhaNaTabela(base, 'Metas do trimestre', ['Meta', 'Atual', 'Alvo'], [celula(meta), celula(atual), celula(alvo)], ORDEM_AREA);
function linhaDaMeta(L, original) {
  const alvo = norm(String(original).replace(/\\\|/g, '|')).trim();
  for (const s of secoes2(L).filter(x => /^(metas?|objetivos?)\b/.test(chaveSimples(x.titulo)))) {
    const t = tabelaDa(L, s);
    if (!t) continue;
    const iMeta = Math.max(0, t.head.findIndex(x => /^(meta|objetivo)/.test(norm(x))));
    for (let k = t.ini + 1; k < t.fim; k++) {
      if (/^\|\s*:?-{3,}/.test(L[k].trim())) continue;
      if (norm(String(celulas(L[k])[iMeta] || '').replace(/\\\|/g, '|')).trim() === alvo) return { k, t };
    }
  }
  return null;
}
/** Troca a meta (as colunas que o painel não conhece ficam como estavam). */
export function trocarMeta(base, original, { meta, atual, alvo }) {
  const L = String(base ?? '').split('\n');
  const a = linhaDaMeta(L, original);
  if (!a) throw erroSumiu();
  const cs = celulas(L[a.k]);
  a.t.head.forEach((x, i) => {
    const n = norm(x);
    if (/^(meta|objetivo)/.test(n) && !/final/.test(n)) cs[i] = celula(meta);
    else if (/^atual/.test(n)) cs[i] = celula(atual);
    else if (/^(alvo|meta final)/.test(n)) cs[i] = celula(alvo);
  });
  L[a.k] = linhaDaTabela(cs);
  return juntar(L);
}
/** Tira a meta da tabela e guarda no Histórico da área (nada some). */
export function tirarMeta(base, original, hoje) {
  const L = String(base ?? '').split('\n');
  const a = linhaDaMeta(L, original);
  if (!a) throw erroSumiu();
  const cs = celulas(L[a.k]);
  const col = re => { const i = a.t.head.findIndex(x => re.test(norm(x))); return i >= 0 && cs[i] && cs[i] !== '—' ? cs[i] : ''; };
  const extra = [col(/^atual/) && `atual ${col(/^atual/)}`, col(/^(alvo|meta final)/) && `alvo ${col(/^(alvo|meta final)/)}`].filter(Boolean).join(', ');
  const sem = juntar([...L.slice(0, a.k), ...L.slice(a.k + 1)]);
  return linhaNaTabela(sem, 'Histórico', ['Data', 'Sobre o quê', 'Ficou combinado'],
    [hoje, `Meta tirada do trimestre: ${celula(original)}${extra ? ` (${extra})` : ''}`, '—'], ORDEM_AREA);
}

/* Casos */
export const acrescentarAcontecimento = (base, data, texto) =>
  linhaNaTabela(base, 'Linha do tempo', ['Data', 'O que aconteceu'], [data, celula(texto)], ORDEM_CASO);
export const acrescentarNumero = (base, { numero, oque, onde, data }) =>
  linhaNaTabela(base, 'Números do caso', ['Número', 'O quê', 'Onde', 'Data'], [celula(numero), celula(oque), celula(onde), data || '—'], ORDEM_CASO);
export function acrescentarContato(base, texto) {
  const L = garantir(linhas(base), 'Contatos', ORDEM_CASO);
  const s = acharSecao(L, 'Contatos');
  return reescrever(L, s, emSeguida(corpoDa(L, s), [`- ${umaLinha(texto)}`]));
}
const SITUACAO = /^(?:- )?(?:\*\*)?(?:Agora|Parei aqui)\b/i;
/** "Onde está" tem um "Agora" só: o novo entra, o velho vai pro "Histórico da situação" (mais novo em cima). */
export function trocarAgora(base, texto, hoje) {
  let L = garantir(linhas(base), 'Onde está', ORDEM_CASO);
  const s = acharSecao(L, 'Onde está');
  const corpo = corpoDa(L, s);
  const antigas = corpo.filter(l => SITUACAO.test(l.trim()));
  const fica = semBrancos(corpo.filter(l => !SITUACAO.test(l.trim())));
  L = linhas(reescrever(L, s, emSeguida([`**Agora (${ddmm(hoje)}):** ${umaLinha(texto)}`], fica)));
  if (!antigas.length) return juntar(L);
  L = garantir(L, 'Histórico da situação', ORDEM_CASO);
  const hs = acharSecao(L, 'Histórico da situação');
  return reescrever(L, hs, emSeguida(antigas.map(a => '- ' + a.trim().replace(/^- /, '')), corpoDa(L, hs)));
}
export const definirStatus = (base, status) => definirCampo(base, 'status', status);
/** Troca o título (# …) da nota. */
export function renomear(base, nome) {
  const L = String(base ?? '').split('\n');
  const corpo = inicioDoCorpo(L);
  const i = L.findIndex((l, k) => k >= corpo && /^#\s/.test(l));
  if (i >= 0) { L[i] = `# ${umaLinha(nome)}`; return juntar(L); }
  return inserirBloco(L, corpo, [`# ${umaLinha(nome)}`]);
}

/* ─────────────── caixa do painel: avisa o assessor ───────────────
   Cada coisa escrita no painel deixa um item ✍️ na caixa. Na próxima conversa o assessor
   lê, corrige a escrita e deixa no padrão, sem mudar o que ele disse, e tira da caixa. */
export const itemDaCaixa = (dia, hora, cabeca) => `- ${dia} ${hora} — ${umaLinha(cabeca)}`;
export function naCaixa(base, item) {
  const t = String(base ?? '').replace(/\s+$/, '');
  return t + (/^#/.test(t.split('\n').pop()) ? '\n\n' : '\n') + item + '\n';
}
