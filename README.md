# autoAbout: Chatbot No-Code

O **autoAbout** é uma plataforma no-code para criação de chatbots com interface visual drag-and-drop. A proposta é permitir que qualquer pessoa crie fluxos de conversa de forma intuitiva, sem precisar programar.

O projeto combina edição visual de fluxos com resposta inteligente por IA, priorizando caminhos estruturados e usando o Google Gemini como fallback para perguntas livres.

## Funcionalidades

- Interface drag-and-drop para montagem visual dos fluxos.
- Editor híbrido com fluxo estruturado + IA.
- Nós personalizados, como `AIConfigNode` e `TextUpdaterNode`.
- Gestão dinâmica do estado por usuário.
- Renderização em tempo real das alterações no diagrama.

## Tecnologias

| Camada | Tecnologia | Descrição |
|---|---|---|
| Frontend | React | Interface reativa e componentes de UI |
| Backend | Node.js / Express | APIs, processamento e integração com `whatsapp-web.js` |
| Diagramação | `@xyflow/react` | Renderização e manipulação de nós e conexões |
| IA | Google Gemini | Respostas naturais para conversas não estruturadas |
| Estado | Context API / Redux | Gerenciamento centralizado do fluxo e da sessão |

## Estrutura do frontend

- `App.jsx`: ponto de entrada e lógica principal do editor.
- `AIConfigNode.jsx`: componente do nó de configuração de IA.
- `TextUpdaterNode.jsx`: componente para mensagens de texto.
- `cadastro.js`: tela de cadastro.
- `login.css`: estilos da autenticação.
- `home.css`: estilos da página inicial.
- `projetos.css`: estilos da área de projetos.

## Desafio técnico

Diferente de aplicações CRUD tradicionais, um editor de diagramas precisa sincronizar em tempo real centenas de nós e conexões. No autoAbout, o gerenciamento de estado foi otimizado para manter a experiência fluida mesmo em fluxos extensos.

## Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/daviferreira-dev/TCC.git
cd TCC
npm install
```

### 2. Configure a IA

Crie um arquivo `.env` na raiz do projeto:

```env
GEMINI_API_KEY=SUA_CHAVE_AQUI
```

### 3. Execute o projeto

Abra dois terminais:

**Terminal 1 — servidor/bot**
```bash
node server.js
```

**Terminal 2 — interface visual**
```bash
npm run dev
```

Se o bot solicitar autenticação, escaneie o QR Code exibido no terminal.

## Objetivo do projeto

O autoAbout foi desenvolvido por **Davi Ferreira** como Trabalho de Conclusão de Curso (TCC), com foco em automação visual, usabilidade e criação simplificada de chatbots.

## Licença

Defina aqui a licença do projeto, se aplicável.
