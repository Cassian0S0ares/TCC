# autoAbout

[![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white)]()
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)]()
[![WhatsApp Web.js](https://img.shields.io/badge/WhatsApp%20Web.js-25D366?logo=whatsapp&logoColor=white)]()

O **autoAbout** é uma plataforma no-code para criação de chatbots com interface visual drag-and-drop. O projeto permite montar fluxos de conversação de forma intuitiva, integrando frontend, API e bot em processos separados [web:12][web:25].

## Visão geral

A proposta do autoAbout é simplificar a construção de automações e chatbots por meio de um editor visual baseado em nós. A aplicação combina fluxo estruturado com integração de IA, oferecendo uma experiência prática para criação e manutenção de conversas automatizadas.

## Funcionalidades

- Interface visual drag-and-drop para criação de fluxos.
- Estrutura separada entre frontend, API e bot.
- Integração com WhatsApp via `whatsapp-web.js`.
- Leitura de variáveis de ambiente com `dotenv`.
- Geração de QR Code no terminal com `qrcode-terminal`.
- Suporte a IA com `@ai-sdk/google`.

## Tecnologias utilizadas

- React.
- Node.js.
- Express.
- `whatsapp-web.js`.
- `qrcode-terminal`.
- `@ai-sdk/google`.
- `dotenv`.

## Estrutura do projeto

- `teste.js`: inicializa o bot e exibe o QR Code no terminal.
- `api.js`: responsável pela API do projeto.
- `npm run dev`: inicia a interface visual.
- `.env`: arquivo de variáveis de ambiente.

## Pré-requisitos

Antes de começar, tenha instalado:

- Node.js.
- npm.
- Conta WhatsApp ativa para autenticação do bot.

## Instalação

### 1. Entre no projeto

```bash
cd nome-do-projeto
```

### 2. Instale as dependências

```bash
npm install
npm audit fix
npm install whatsapp-web.js qrcode-terminal @ai-sdk/google dotenv
```

O `npm audit fix` deve ser usado para corrigir vulnerabilidades conhecidas quando possível, sem forçar alterações desnecessárias [web:21][web:11].

### 3. Configure o arquivo `.env`

Crie um arquivo `.env` na raiz do projeto e adicione suas variáveis:

```env
GEMINI_API_KEY=SUA_CHAVE_AQUI
```

O pacote `dotenv` carrega essas variáveis para a aplicação durante a execução [web:13][web:19].

## Execução

Abra **3 terminais separados** e execute os comandos abaixo:

### Terminal 1 — Bot

```bash
node teste.js
```

Esse processo inicia o bot e exibe o QR Code no terminal para autenticação no WhatsApp [web:12][web:28].

### Terminal 2 — Frontend

```bash
npm run dev
```

Esse comando inicia a interface visual do projeto.

### Terminal 3 — API

```bash
node api.js
```

Esse processo sobe a API responsável pela comunicação do sistema.

## Fluxo recomendado

1. Instale as dependências.
2. Configure o arquivo `.env`.
3. Inicie o bot no Terminal 1.
4. Inicie o frontend no Terminal 2.
5. Inicie a API no Terminal 3.
6. Escaneie o QR Code com o WhatsApp quando ele aparecer.

## Observações

O `whatsapp-web.js` funciona como cliente do WhatsApp Web e normalmente exige autenticação por QR Code, por isso o uso de `qrcode-terminal` é apropriado nesse fluxo [web:12][web:25].
