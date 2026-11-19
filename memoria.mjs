import { norm } from './datas.mjs?v=c0273d90ee1f';

export function casosEmAndamento(arquivos) {
  const encerrados = /^(fechado|resolvido|concluido|encerrado)$/;
  return Object.values(arquivos).filter(f => f.path.startsWith('casos/') && !encerrados.test(norm(f.meta.status).trim()))
    .sort((a, b) => String(b.meta.atualizado || '').localeCompare(a.meta.atualizado || '') || a.path.localeCompare(b.path));
}
export function pontoDeParada(nota) {
  const linhas = nota.body.split(/\r?\n/);
  const inicio = linhas.findIndex(l => /^##\s+.*onde esta\b/.test(norm(l)));
  if (inicio < 0) return nota.meta.resumo || '';
  const trecho = [];
  for (const linha of linhas.slice(inicio + 1)) {
    if (/^#{1,2}\s/.test(linha)) break;
    if (linha.trim() && !/^[#<|]/.test(linha.trim())) trecho.push(linha.trim());
  }
  return trecho.filter(l => norm(l).includes('parei aqui')).at(-1) || trecho[0] || nota.meta.resumo || '';
}
