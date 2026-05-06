🚀 autoAbout






O autoAbout é uma plataforma no-code para criação de chatbots inteligentes com editor visual drag-and-drop baseado em nós, permitindo construir fluxos automatizados de forma rápida, escalável e integrada com IA e WhatsApp.

🖼️ Preview

⚠️ Adicione aqui um GIF ou imagem do sistema funcionando

![Preview do sistema](./docs/preview.gif)
🧠 Visão geral

A proposta do autoAbout é simplificar a construção de automações e chatbots por meio de um editor visual intuitivo.

A aplicação combina:

Fluxos estruturados
Execução em tempo real
Integração com IA
Comunicação via WhatsApp

Tudo isso com uma arquitetura separada e escalável.

⚙️ Funcionalidades
🎯 Editor visual drag-and-drop (node-based)
🔗 Criação de fluxos de conversação
🤖 Integração com IA (Google Gemini)
📱 Integração com WhatsApp (whatsapp-web.js)
🔐 Uso de variáveis de ambiente com dotenv
📲 Geração de QR Code para autenticação
🧩 Arquitetura modular (frontend + API + bot)
🏗️ Arquitetura

O sistema é dividido em três camadas principais:

Frontend (React): Interface visual de criação dos fluxos
API (Node.js + Express): Gerenciamento e comunicação
Bot (whatsapp-web.js): Execução dos fluxos e interação com usuários

Essa separação permite maior escalabilidade e manutenção independente.

💡 Diferenciais
🔥 Editor visual estilo Node-Based (similar ao React Flow)
⚡ Criação rápida de automações sem código
🤖 Integração com IA para respostas dinâmicas
📱 Automação direta no WhatsApp
🧩 Estrutura pronta para expansão (Telegram, Webchat, etc.)
📌 Casos de uso
Atendimento automatizado no WhatsApp
Bots de vendas e qualificação de leads
Suporte técnico automatizado
Respostas inteligentes com IA
Automação de processos internos
🛠️ Tecnologias utilizadas
React
Node.js
Express
whatsapp-web.js
qrcode-terminal
@ai-sdk/google
dotenv
📁 Estrutura do projeto
autoAbout/
│
├── teste.js        # Inicializa o bot e gera QR Code
├── api.js          # API do sistema
├── .env            # Variáveis de ambiente
├── package.json
└── frontend/       # Interface visual (React)
⚡ Pré-requisitos

Antes de começar, você precisa ter instalado:

Node.js
npm
Conta ativa no WhatsApp
🚀 Instalação
# Clone o repositório
git clone https://github.com/seu-usuario/autoAbout.git

# Acesse a pasta
cd autoAbout

# Instale as dependências
npm install
🔐 Configuração

Crie um arquivo .env na raiz do projeto:

GEMINI_API_KEY=SUA_CHAVE_AQUI

⚠️ Nunca compartilhe sua chave de API publicamente

▶️ Execução

Abra 3 terminais separados:

🟢 Terminal 1 — Bot
node teste.js
Gera o QR Code no terminal
Faça login com seu WhatsApp
🔵 Terminal 2 — Frontend
npm run dev
Inicia a interface visual
🟣 Terminal 3 — API
node api.js
Sobe a API do sistema
🔄 Fluxo de uso
Instale as dependências
Configure o .env
Inicie o bot
Inicie o frontend
Inicie a API
Escaneie o QR Code
Comece a criar seus fluxos 🚀
🔒 Segurança
Uso de variáveis de ambiente com .env
Nunca exponha sua GEMINI_API_KEY
Recomendado usar .env.example no repositório
🗺️ Roadmap
 Integração com Telegram
 Persistência em banco de dados
 Templates prontos de chatbot
 Deploy automatizado
 Editor com salvamento automático
🤝 Contribuição

Contribuições são bem-vindas!

Faça um fork
Crie uma branch (feature/minha-feature)
Commit suas mudanças
Push para o repositório
Abra um Pull Request
📄 Licença


👨‍💻 Autor

Desenvolvido por Davi Ferreira, Cassiano Soares, Rachel Camargo, Mateus Moura
