import test from 'node:test';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

test('o HTML e seus módulos carregam os arquivos da mesma versão', () => {
  const script = fileURLToPath(new URL('../scripts/versionar.mjs', import.meta.url));
  execFileSync(process.execPath, [script, '--check']);
});
