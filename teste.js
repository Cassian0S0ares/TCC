import qrcode from 'qrcode-terminal';
import { Client } from 'whatsapp-web.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fetch from 'node-fetch';
import { findBestMatch } from 'string-similarity'; 

// --- Configurações ---
const GEMINI_API_KEY = "AIzaSyBWPkHIwzfOYKUR8dj2e1rSSzX6P2sWGoo"; 
const FLOW_API_URL = 'http://localhost:3001/api/flows/Vendas_Bot'; 
const SIMILARITY_THRESHOLD = 0.6; // Nível de similaridade para reconhecer a condição

// --- Inicialização de Serviços ---
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
const client = new Client();

// --- Variáveis de Estado ---
let FLOW_MAP_JSON = null; 
let SYSTEM_INSTRUCTIONS = null; // Instruções da IA carregadas do bloco 'aiConfig'
const conversations = {}; // Histórico do Gemini
const userState = {}; // Rastreamento do usuário no fluxo

// --- Funções de Lógica do Fluxo ---

/**
 * Encontra o objeto Nó pelo seu ID.
 */
function getNode(nodeId) {
    if (!FLOW_MAP_JSON || !FLOW_MAP_JSON.nodes) return null;
    return FLOW_MAP_JSON.nodes.find(n => n.id === nodeId);
}

/**
 * Carrega o mapa do fluxo da API de Backend E extrai as instruções da IA.
 */
async function loadFlowMap() {
    try {
        console.log(`🔄 Carregando fluxo da API em: ${FLOW_API_URL}`);
        const response = await fetch(FLOW_API_URL);
        if (!response.ok) {
            throw new Error(`Falha ao carregar fluxo. Código: ${response.status}`);
        }
        FLOW_MAP_JSON = await response.json();
        
        // NOVO: Procura e extrai as instruções da IA do fluxo
        const aiConfigNode = FLOW_MAP_JSON.nodes.find(n => n.type === 'aiConfig');
        
        if (aiConfigNode && aiConfigNode.data.systemInstructions) {
            SYSTEM_INSTRUCTIONS = aiConfigNode.data.systemInstructions;
            console.log("🟢 Instruções de IA carregadas do bloco!");
        } else {
            SYSTEM_INSTRUCTIONS = "A partir de agora, responda sempre em português e mantenha o contexto da conversa. Seu papel é atuar como um chatbot de suporte genérico.";
            console.log("🟡 Usando instruções de IA padrão (Bloco 'aiConfig' não encontrado).");
        }

        console.log(`✅ Fluxo carregado com ${FLOW_MAP_JSON.nodes.length} nós.`);
        return true;
    } catch (error) {
        console.error("❌ ERRO GRAVE ao carregar o FLOW_MAP (Verifique a API na porta 3001):", error.message);
        FLOW_MAP_JSON = null;
        SYSTEM_INSTRUCTIONS = "A partir de agora, responda sempre em português e mantenha o contexto da conversa. Seu papel é atuar como um chatbot de suporte genérico.";
        return false;
    }
}

/**
 * Lógica de Roteamento Avançada: Encontra o próximo nó baseado na mensagem do usuário.
 */
function getNextNodeId(currentNodeId, userAnswer) {
    if (!FLOW_MAP_JSON || !FLOW_MAP_JSON.edges) return null;

    const outgoingEdges = FLOW_MAP_JSON.edges.filter(e => e.source === currentNodeId);
    const currentNode = getNode(currentNodeId);
    
    if (!currentNode || outgoingEdges.length === 0) return null;

    const normalizedAnswer = userAnswer.toLowerCase().trim();
    const conditions = [];

    // 1. Coleta todas as condições de saída válidas e seus destinos
    for (const edge of outgoingEdges) {
        const handle = edge.sourceHandle;
        let condition = '';

        if (handle === 'a' && currentNode.data.conditionA) {
            condition = currentNode.data.conditionA;
        } else if (handle === 'b' && currentNode.data.conditionB) {
            condition = currentNode.data.conditionB;
        }

        if (condition) {
            conditions.push({ 
                condition: condition.toLowerCase().trim(), 
                targetId: edge.target 
            });
        }
    }
    
    // 2. Tenta encontrar a melhor correspondência (String Similarity)
    if (conditions.length > 0) {
        const targets = conditions.map(c => c.condition);
        const bestMatch = findBestMatch(normalizedAnswer, targets);

        if (bestMatch.bestMatch.rating >= SIMILARITY_THRESHOLD) {
            const matchedCondition = conditions.find(c => c.condition === bestMatch.bestMatch.target);
            return matchedCondition.targetId;
        }
    }

    return null;
}

/**
 * Lógica de processamento de mensagem usando o Gemini, com base nas SYSTEM_INSTRUCTIONS.
 */
async function getAiResponse(chatId, userMessage) {
    // 1. Inicializa o histórico do chat
    if (!conversations[chatId]) {
        conversations[chatId] = [
            // Usa as instruções carregadas (SYSTEM_INSTRUCTIONS)
            { role: "user", content: SYSTEM_INSTRUCTIONS }, 
            { role: "model", content: "Entendido. Aplicando as configurações e estou pronto para interagir!" },
        ];
    }
    
    // 2. Adiciona mensagem do usuário
    conversations[chatId].push({ role: "user", content: userMessage });

    // 3. Envia para o Gemini
    const chat = model.startChat({ history: conversations[chatId].map((m) => ({
        role: m.role,
        parts: [{ text: m.content }],
      })), generationConfig: { maxOutputTokens: 500 } });

    const result = await chat.sendMessage(userMessage);
    const response = await result.response;
    
    const aiReply = response.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Desculpe, não consegui gerar uma resposta com a IA.";

    // 4. Adiciona resposta da IA ao histórico
    conversations[chatId].push({ role: "model", content: aiReply });
    
    return aiReply;
}

// --- Eventos do WhatsApp ---

client.on("qr", (qr) => {
    qrcode.generate(qr, { small: true });
});

client.on("ready", async () => {
    console.log("🤖 Cliente WhatsApp conectado.");
    await loadFlowMap(); 
    console.log(`🚀 Motor de Execução ${FLOW_MAP_JSON ? 'DE FLUXO ATIVO' : 'DE IA APENAS'}.`);
});

client.on("message", async (message) => {
    const chatId = message.from;
    const userMessage = message.body;
    const normalizedMessage = userMessage.toLowerCase().trim();

    // Comandos de controle
    if (normalizedMessage === '#reiniciar' || normalizedMessage === '#menu') {
        if (FLOW_MAP_JSON) {
            userState[chatId] = { currentNodeId: FLOW_MAP_JSON.nodes[0].id, mode: 'flow' };
            const initialNode = getNode(userState[chatId].currentNodeId);
            return message.reply(`Comando recebido. Voltando ao fluxo principal.\n\n${initialNode.data.messageText}`);
        }
        return message.reply("Não há um fluxo ativo para reiniciar. Você está no modo IA.");
    }
    if (normalizedMessage === '#atualizar' && message.fromMe) { 
        const success = await loadFlowMap();
        return message.reply(success ? "Fluxo atualizado com sucesso!" : "Falha ao atualizar o fluxo. Verifique a API.");
    }

    // 1. Inicializa o estado do usuário
    if (!userState[chatId]) {
        const initialMode = FLOW_MAP_JSON ? 'flow' : 'ai_only';
        userState[chatId] = { 
            currentNodeId: FLOW_MAP_JSON?.nodes[0]?.id, 
            mode: initialMode 
        };
    }
    
    let currentState = userState[chatId];
    let reply = "";

    try {
        
        // --- 2. Tentar Executar o Fluxo (Modo Padrão) ---
        if (currentState.mode === 'flow' && FLOW_MAP_JSON) {
            
            const nextNodeId = getNextNodeId(currentState.currentNodeId, userMessage);
            
            if (nextNodeId) {
                // Rota do Fluxo Encontrada
                currentState.currentNodeId = nextNodeId;
                const nextNode = getNode(nextNodeId);
                reply = nextNode.data.messageText;
                
            } else {
                // Nenhuma rota do fluxo encontrada (Fallback para IA)
                currentState.mode = 'ai_support';
                
                message.reply("Não entendi essa opção. Você pode perguntar o que precisar, ou digite **#reiniciar** para voltar ao menu.");
                
                reply = await getAiResponse(chatId, userMessage);
            }
            
        } 
        
        // --- 3. Executar Gemini (Modo de Suporte IA) ---
        if (currentState.mode === 'ai_support' || currentState.mode === 'ai_only') {
            reply = await getAiResponse(chatId, userMessage);
        }

        // 4. Responde no WhatsApp
        if (reply) {
             message.reply(reply);
        }

    } catch (error) {
        console.error(`ERRO no processamento de mensagem [${chatId}]:`, error);
        message.reply("Ocorreu um erro interno. Por favor, tente novamente ou digite **#reiniciar**.");
    }
});

client.initialize();