# 🌐 Como Colocar o Site no Ar Gratuitamente para Enviar pelo WhatsApp

Para enviar o link do site da sua lista de casamento para os convidados pelo WhatsApp, redes sociais ou QR Code do convite, você pode hospedá-lo **gratuitamente** em serviços confiáveis na nuvem.

Abaixo estão as opções mais simples e recomendadas:

---

## Opção 1: Render.com (Recomendada - 100% Grátis)

O **Render** hospeda aplicações Node.js gratuitamente com link HTTPS seguro (ex: `https://casamento-sofia-e-lucas.onrender.com`).

### Passo a passo rápido:
1. Crie uma conta gratuita em [render.com](https://render.com).
2. Suba a pasta deste projeto no seu [GitHub](https://github.com) (em um repositório público ou privado).
3. No painel do Render:
   - Clique em **New +** > **Web Service**.
   - Conecte sua conta do GitHub e selecione o repositório da lista.
   - O Render detectará automaticamente as configurações:
     - **Runtime:** `Node`
     - **Build Command:** `npm install`
     - **Start Command:** `node server.js`
     - **Instance Type:** `Free`
   - Clique em **Create Web Service**.
4. Em cerca de 2 minutos, o Render fornecerá o link oficial do seu site (com cadeado de segurança `https://`).
5. Pronto! Basta copiar e enviar para os convidados.

---

## Opção 2: Compartilhamento Rápido via Túnel (Ngrok ou LocalTunnel)

Se você quiser testar imediatamente com familiares e amigos no WhatsApp sem precisar criar conta de hospedagem agora:

1. Abra um terminal na pasta do projeto.
2. Execute:
   ```bash
   npx localtunnel --port 3000
   ```
3. O comando gerará um link público temporário (ex: `https://casamento-felizes.loca.lt`) que você pode abrir em qualquer celular!

---

## 🔒 Acesso dos Noivos (Área Administrativa)
- **PIN Padrão:** `1234`
- Para alterar o PIN, os nomes do casal, a data do casamento ou adicionar sua chave Pix, clique em **Área dos Noivos** no canto superior direito do site e acesse as **Configurações**.
