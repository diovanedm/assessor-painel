import { norm } from './datas.mjs?v=048d9ab09640';

export function casosEmAndamento(arquivos) {
  const encerrados = /^(fechado|resolvido|concluido|encerrado)$/;
  return Object.values(arquivos).filter(f => f.path.startsWith('casos/') && !encerrados.test(norm(f.meta.status).trim()))
    .sort((a, b) => String(b.meta.atualizado || '').localeCompare(a.meta.atualizado || '') || a.path.localeCompare(b.path));
}

const CARIMBO = /(?:(\d{4})-(\d{2})-(\d{2})|\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b)(?:[\s,]*(?:às\s*)?(\d{1,2})\s*[h:]\s*(\d{2})?)?/;

// Data (e hora) com que a linha começa: "Agora (17/11, 11h49):", "Parei aqui (2026-11-17 11:40)", "- 31/10: …".
// Só vale data nos primeiros 45 caracteres; a do meio do texto é assunto, não carimbo.
export function carimbo(linha, ano = new Date().getFullYear()) {
  const m = CARIMBO.exec(String(linha).slice(0, 60));
  if (!m || m.index > 45) return null;
  let a, me, d;
  if (m[1]) [a, me, d] = [+m[1], +m[2], +m[3]];
  else { d = +m[4]; me = +m[5]; a = m[6] ? +m[6] : ano; if (a < 100) a += 2000; }
  if (me < 1 || me > 12 || d < 1 || d > 31) return null;
  const hora = m[7] && +m[7] < 24 ? +m[7] * 60 + (+m[8] || 0) : -1;
  return [a, me, d, hora];
}
const maior = (x, y) => { for (let i = 0; i < 4; i++) if (x[i] !== y[i]) return x[i] > y[i]; return false; };

// A linha mais recente de "Onde está": maior data/hora no começo da linha; empate → a de baixo.
// Assim um "Parei aqui" antigo não vence um "Agora" novo escrito depois.
export function situacaoAtual(linhas, ano) {
  let melhor = null, carimboMelhor = null;
  for (const l of linhas) {
    const c = carimbo(l, ano);
    if (c && (!carimboMelhor || !maior(carimboMelhor, c))) { melhor = l; carimboMelhor = c; }
  }
  return melhor || linhas.filter(l => norm(l).includes('parei aqui')).at(-1) || linhas[0] || '';
}

export function pontoDeParada(nota) {
  const linhas = nota.body.split(/\r?\n/);
  const inicio = linhas.findIndex(l => /^##\s+.*onde esta\b/.test(norm(l)));
  if (inicio < 0) return nota.meta.resumo || '';
  const trecho = [];
  for (const linha of linhas.slice(inicio + 1)) {
    if (/^#{1,2}\s/.test(linha)) break;
    if (linha.trim() && !/^[#<|]/.test(linha.trim()) && !linha.trim().startsWith('> [!')) trecho.push(linha.trim());
  }
  const ano = parseInt(String(nota.meta.atualizado || ''), 10) || undefined;
  return situacaoAtual(trecho, ano) || nota.meta.resumo || '';
}

const DIAS_MODELO = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'];
const isoDoPlano = (dia, mes, ano) => `${ano}-${mes}-${dia}`;

export function blocosDaSemanaModelo(texto, hoje) {
  const linhas = texto.split(/\r?\n/);
  const periodo = linhas.map(l => /^##\s+Trimestre atual:\s*(\d{2})\/(\d{2})\/(\d{4})\s+a\s+(\d{2})\/(\d{2})\/(\d{4})/i.exec(l)).find(Boolean);
  if (periodo && (hoje < isoDoPlano(...periodo.slice(1, 4)) || hoje > isoDoPlano(...periodo.slice(4, 7)))) return [];
  const inicio = linhas.findIndex(l => /^##\s+semana[- ]modelo\b/.test(norm(l)));
  if (inicio < 0) return [];
  const dia = (new Date(hoje + 'T12:00:00')).getDay();
  const blocos = [];
  for (const linha of linhas.slice(inicio + 1)) {
    if (/^#{1,2}\s/.test(linha)) break;
    if (!linha.trimStart().startsWith('|')) continue;
    const [dias, horario, area, atividade] = linha.trim().slice(1).split('|').map(c => c.trim());
    const hora = /^(\d{1,2})[h:](\d{2})?$/.exec(horario || '');
    if (!hora || !area || !atividade) continue;
    const noDia = norm(dias).split(/\s+e\s+|\s*,\s*/).some(faixa => {
      const [primeiro, ultimo = primeiro] = faixa.split(/\s*[–—-]\s*/).map(d => DIAS_MODELO.indexOf(d.slice(0, 3)));
      return primeiro >= 0 && ultimo >= 0 && (dia - primeiro + 7) % 7 <= (ultimo - primeiro + 7) % 7;
    });
    if (!noDia) continue;
    const aPartir = /,\s*a partir de (\d{2})\/(\d{2})(?:\/(\d{4}))?$/i.exec(atividade);
    if (aPartir) {
      const [, d, m, ano] = aPartir;
      const anoInicio = ano || (periodo ? Number(periodo[3]) + (m < periodo[2] ? 1 : 0) : hoje.slice(0, 4));
      if (hoje < isoDoPlano(d, m, anoInicio)) continue;
    }
    blocos.push({ hora: `${hora[1].padStart(2, '0')}:${hora[2] || '00'}`, area, texto: aPartir ? atividade.slice(0, aPartir.index) : atividade });
  }
  return blocos.sort((a, b) => a.hora.localeCompare(b.hora));
}

export function textoDaBusca(texto) {
  return texto.normalize('NFC')
    .replace(/^\s*(?:[-*+]\s*)?\[[ xX]\]\s*/, '')
    .replace(/^\s*[-*|>]+\s*/, '')
    .replace(/\s*🆔\s*\S+/gu, '')
    .replace(/(?:📅|✅)\s*(?=\d{4}-\d{2}-\d{2})/gu, '')
    .replace(/\b\d{4}-(\d{2})-(\d{2})\b/g, '$2/$1')
    .replace(/\s*\|\s*/g, ' · ')
    .replace(/\s*·\s*$/, '').trim();
}
