import { norm } from './datas.mjs';

export function notasDaArea(files, area) {
  const path = `areas/${area}/${area}.md`;
  return Object.values(files).filter(f => f.path.startsWith(`areas/${area}/`))
    .sort((a, b) => Number(b.path === path) - Number(a.path === path)
      || String(b.meta.atualizado || '').localeCompare(String(a.meta.atualizado || ''))
      || a.title.localeCompare(b.title, 'pt-BR'));
}

export function linkDeRegistro(path) {
  const match = /^areas\/([^/]+)\/(.+)\.md$/.exec(path);
  return match ? `#area/${match[1]}/registros/${encodeURIComponent(match[2])}` : '';
}

export function destinoDaArea(hash, areas) {
  const [prefix, area, tab, encoded, ...extra] = hash.replace(/^#/, '').split('/');
  if (prefix !== 'area' || !areas.includes(area)) return null;
  let path = null;
  if (tab === 'registros' && encoded && !extra.length) {
    try { path = `areas/${area}/${decodeURIComponent(encoded)}.md`; } catch { path = null; }
  }
  return { area, registros: tab === 'registros', path };
}

// Preserva introduções, blocos de código e a ordem do texto da nota.
export function secoesDeLeitura(body) {
  const sections = [];
  let title = 'Apresentação', lines = [], fence = '', firstTitle = true;
  const flush = () => {
    const text = lines.join('\n').trim();
    if (text) sections.push({ title, text });
    lines = [];
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
  return goals?.text.split('\n').map(line => line.trim()).find(line => /^[-*]\s+/.test(line))
    ?.replace(/^[-*]\s+(?:\[[ xX]\]\s*)?/, '') || '';
}
