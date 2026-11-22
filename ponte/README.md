# Ponte ao vivo do painel

Um Worker grátis na Cloudflare que lê o **Google Agenda** e o **TickTick** na hora e entrega pro painel.
Assim, marcou no TickTick ou mudou na Agenda → aparece no painel em até 30 segundos, sem gastar cota do Claude.

- 🔒 Só leitura (TickTick com `tasks:read`, Agenda pelo endereço secreto iCal).
- 🔑 Nenhum segredo fica neste repo público: tudo vai em `wrangler secret`.
- 🧯 Se a ponte cair, o painel volta sozinho pro `painel/espelho.json` do assessor.
- 💰 Dinheiro continua vindo do espelho do assessor (Minhas Economias).

## Configurar (uma vez, ~15 min, no Mac)

### 1. Link secreto da Agenda
Google Agenda no computador → ⚙️ Configurações → sua agenda (Diovane) → **Integrar agenda** → copie o **Endereço secreto no formato iCal**.
Mais de uma agenda? Junte os endereços separados por espaço.

### 2. App no TickTick
1. Abra <https://developer.ticktick.com/manage> e clique em **+ App Name** (nome: `Painel`).
2. Em **OAuth redirect URL**, ponha `https://ponte-painel.<seu-subdominio>.workers.dev/ticktick/volta` (o subdomínio aparece no passo 3; dá pra voltar e editar).
3. Guarde o **Client ID** e o **Client Secret**.

### 3. Subir a ponte
```bash
cd ~/assessor-painel/ponte      # ou onde estiver o clone do painel
npm install
npx wrangler login
npx wrangler secret put PAINEL_CHAVE          # invente uma senha longa (é a "Chave" do painel)
npx wrangler secret put GCAL_ICS              # o endereço secreto do passo 1
npx wrangler secret put TICKTICK_CLIENT_ID
npx wrangler secret put TICKTICK_CLIENT_SECRET
npx wrangler deploy                           # mostra o endereço https://ponte-painel.<…>.workers.dev
```
(Se o `deploy` pedir o KV: `npx wrangler kv namespace create PONTE` e cole o `id` no `wrangler.toml`.)

### 4. Conectar o TickTick
Abra no navegador: `https://ponte-painel.<…>.workers.dev/ticktick/conectar?chave=<PAINEL_CHAVE>` → autorize → "TickTick conectado ✅".
O acesso vale uns 6 meses; a página mostra a data. Quando vencer, o painel avisa e é só abrir esse link de novo.

### 5. Ligar no painel
Painel → ⚙️ Ajustes → **Ao vivo: TickTick e Google Agenda** → cole o endereço e a chave → Salvar.
No cartão de Agenda e Tarefas aparece **"ao vivo"**.

## Por dentro
- `GET /ao-vivo` (cabeçalho `Authorization: Bearer <PAINEL_CHAVE>`): `{ agenda, tarefas, tarefasTodas, atualizado, erros }`, no formato do `espelho.json`. Guarda 30 s em cache; `?agora` ignora o cache.
- Agenda: hoje 00:00 (Brasília) até +7 dias, com séries, exceções e cancelamentos.
- Tarefas: todas as abertas de todas as listas (e da Entrada). Área pela lista; "📁 Casos" o painel acha pela nota.
- A junção com o espelho do assessor fica em `espelho.mjs` (`comAoVivo`), testada em `tests/espelho.test.mjs`.
