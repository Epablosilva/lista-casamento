# 💍 Sistema de Lista de Presentes de Casamento & Checklist Interativo

Um sistema web completo, responsivo e elegante para você compartilhar com seus convidados de casamento. Funciona como um **checklist interativo**, onde os convidados visualizam os itens, marcam o presente que desejam dar com seus nomes (evitando presentes repetidos), e os noivos possuem uma área exclusiva para gerenciar toda a lista.

---

## ✨ Funcionalidades

### 👥 Para os Convidados
- **Visualização em Checklist & Cards Elegantes:** Cada presente tem status claro (Disponível ou Escolhido).
- **Reserva com Identificação:** O convidado clica em **"Quero Presentear"**, digita seu nome, WhatsApp (opcional) e uma mensagem de carinho para os noivos.
- **Evita Presentes Repetidos:** Uma vez escolhido, o presente fica travado no checklist com a etiqueta *"Escolhido com carinho por [Nome]"*.
- **Chuva de Fogos/Confetes 🎉:** Animação festiva ao confirmar o presente.
- **Filtros e Busca em Tempo Real:** Filtragem por categorias (Cozinha, Quarto, Sala, Eletrodomésticos, etc.), status (Disponíveis ou Já Escolhidos) e campo de busca.
- **Sugestão de Onde Comprar:** Link opcional em cada card para lojas como Amazon, Magazine Luiza, etc.
- **Opção de Contribuição via Pix:** Botão de copiar chave Pix caso o convidado prefira enviar cota em dinheiro.
- **Contagem Regressiva:** Relógio dinâmico marcando dias, horas e minutos até o grande dia.

### 👑 Para os Noivos (Modo Administrativo)
- **Acesso Protegido por PIN:** Apenas os noivos podem alterar a lista (PIN padrão inicial: `1234`).
- **Adicionar Novos Itens:** Formulário completo para cadastrar novos presentes com título, categoria, descrição, link e foto/ícone.
- **Editar e Excluir Itens:** Edição direta em qualquer presente da lista.
- **Liberar / Cancelar Reserva:** Caso algum convidado desista ou marque por engano, os noivos podem liberar o item novamente com 1 clique.
- **Mural de Mensagens:** Visualização de todos os recados carinhosos deixados pelos convidados.
- **Exportação de Relatório (CSV / Excel):** Download de planilha completa com presentes e quem presenteou.
- **Painel de Configurações:** Altere os nomes dos noivos, data do casamento, mensagem inicial, chave Pix e altere o PIN de segurança.

---

## 🚀 Como Executar Localmente

### Método 1: Dois cliques
Basta dar um duplo clique no arquivo [`start.bat`](file:///C:/Users/User/.gemini/antigravity/scratch/lista-casamento/start.bat) dentro da pasta.

### Método 2: Via Terminal
```bash
npm start
```
Abra seu navegador em: **[http://localhost:3000](http://localhost:3000)**

---

## 🌐 Como Colocar na Internet para Enviar pelo WhatsApp
Consulte o arquivo [`COMO_PUBLICAR.md`](file:///C:/Users/User/.gemini/antigravity/scratch/lista-casamento/COMO_PUBLICAR.md) para o passo a passo de como hospedar 100% de graça no Render.com ou compartilhar instantaneamente.
