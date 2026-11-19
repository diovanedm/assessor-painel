import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';

// Execute "node scripts/versionar.mjs" após alterar os arquivos públicos do painel.
const root = new URL('../', import.meta.url);
const files = (await readdir(root)).filter(name => name === 'index.html' || /\.(?:m?js|css)$/.test(name)).sort();
const localAsset = /((?:\b(?:src|href)=|\b(?:from|import)\s+)["']\.\/[\w./-]+\.(?:m?js|css))(?:\?v=[\w.-]+)?(?=["'])/g;
const contents = new Map();
const hash = createHash('sha256');
for (const name of files) {
  const original = await readFile(new URL(name, root), 'utf8');
  const normalized = original.replace(localAsset, '$1');
  hash.update(name).update('\0').update(normalized).update('\0');
  contents.set(name, { original, normalized });
}
const version = hash.digest('hex').slice(0, 12);
for (const [name, { original, normalized }] of contents) {
  const versioned = normalized.replace(localAsset, '$1?v=' + version);
  if (versioned === original) continue;
  if (process.argv.includes('--check')) {
    throw new Error('Versão desatualizada em ' + name + '. Execute node scripts/versionar.mjs.');
  }
  await writeFile(new URL(name, root), versioned);
}
console.log(version);
