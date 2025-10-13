import qrcode from 'qrcode-terminal';
import { Client } from 'whatsapp-web.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fetch from 'node-fetch';
import { findBestMatch } from 'string-similarity';
import 'dotenv/config';


// --- Configurações ---
// ⚠️ ATENÇÃO: SUBSTITUA ESTA CHAVE PELA SUA CHAVE API REAL DO GEMINI!
const GEMINI_API_KEY = "SUA_CHAVE_API_AQUI"; 

const CURRENT_FLOW_ID = process.env.CURRENT_FLOW_ID || 'Vendas_Bot';
const FLOW_API_URL = `http://localhost:3001/api/flows/${CURRENT_FLOW_ID}`;

const SIMILARITY_THRESHOLD = 0.6;

// --- Inicialização de Serviços ---
// Garante que o bot não falhe, mas usa a chave configurada
const finalApiKey = GEMINI_API_KEY === "SUA_CHAVE_API_AQUI" ? "AIzaSyBWPkHIwzfOYKUR8dj2e1rSSzX6P2sWGoo" : GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(finalApiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
const client = new Client();

// --- Variáveis de Estado ---
let FLOW_MAP_JSON = null;
let SYSTEM_INSTRUCTIONS = null;
const conversations = {};
const userState = {};

/** * Encontra o objeto Nó pelo seu ID. */
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
        
        const aiConfigNode = FLOW_MAP_JSON.nodes.find(n => n.type === 'aiConfig');

        if (aiConfigNode && aiConfigNode.data.systemInstructions) {
            SYSTEM_INSTRUCTIONS = aiConfigNode.data.systemInstructions;
            console.log("🟢 Instruções de IA carregadas do bloco!");
        } else {
            SYSTEM_INSTRUCTIONS = "A partir de agora, responda sempre em português e mantenha o contexto da conversa. Seu papel é atuar como um chatbot de suporte genérico.";
            console.log("🟡 Usando instruções de IA padrão (Bloco 'aiConfig' não encontrado).");
        }
        console.log(`✅ Fluxo carregado com ${FLOW_MAP_JSON.nodes.length} nós. ID ATUAL: ${CURRENT_FLOW_ID}`);
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
 * Lógica de processamento de mensagem usando o Gemini, com tratamento de erro.
 */
async function getAiResponse(chatId, userMessage) {
    // 1. Inicializa o histórico do chat
    if (!conversations[chatId]) {
        conversations[chatId] = [
            { role: "user", content: SYSTEM_INSTRUCTIONS },
            { role: "model", content: "Entendido. Aplicando as configurações e estou pronto para interagir!" },
        ];
    }

    // 2. Adiciona mensagem do usuário
    conversations[chatId].push({ role: "user", content: userMessage });

    // 3. Envia para o Gemini
    const chat = model.startChat({
        history: conversations[chatId].map((m) => ({
            role: m.role,
            parts: [{ text: m.content }],
        })), generationConfig: { maxOutputTokens: 500 }
    });

    try {
        const result = await chat.sendMessage(userMessage);
        const response = await result.response;

        // 🟢 DEBUG: Se a resposta for vazia, loga no console para diagnóstico.
        if (response && response.candidates && response.candidates.length === 0) {
             console.log("⚠️ Resposta do Gemini VAZIA. Verifique o prompt ou a segurança.");
        }

        // Se o Gemini não retornar conteúdo (caindo no ||), retorna o erro de geração.
        const aiReply = response.candidates?.[0]?.content?.parts?.[0]?.text ||
            "Desculpe, não consegui gerar uma resposta com a IA.";

        // 4. Adiciona resposta da IA ao histórico
        conversations[chatId].push({ role: "model", content: aiReply });

        return aiReply;
    } catch (error) {
        console.error("❌ ERRO GRAVE na chamada da API Gemini:", error.message || error);
        // Esta mensagem será enviada ao usuário em caso de falha na chave/conexão.
        return "❌ Desculpe, a IA está indisponível ou ocorreu um erro de conexão. Por favor, verifique se sua chave API do Gemini está correta e se há conexão com a internet.";
    }
}

// --- Eventos do WhatsApp ---

client.on("qr", (qr) => {
    qrcode.generate(qr, { small: true });
});

client.on("ready", async () => {
    console.log("🤖 Cliente WhatsApp conectado.");
    await loadFlowMap(); // Carrega o mapa e as instruções da IA no início
    console.log(`🚀 Motor de Execução ${FLOW_MAP_JSON ? 'DE FLUXO ATIVO' : 'DE IA APENAS'}.`);
});

client.on("message", async (message) => {
    const chatId = message.from;
    const userMessage = message.body;
    const normalizedMessage = userMessage.toLowerCase().trim();

    // Comandos de controle
    if (normalizedMessage === '#reiniciar' || normalizedMessage === '#menu') {
        if (FLOW_MAP_JSON && FLOW_MAP_JSON.nodes.length > 0) {
            userState[chatId] = { currentNodeId: FLOW_MAP_JSON.nodes[0].id, mode: 'flow' };
            const initialNode = getNode(userState[chatId].currentNodeId);
            if (initialNode && initialNode.data && initialNode.data.messageText) {
                return message.reply(`Comando recebido. Voltando ao fluxo principal.\n\n${initialNode.data.messageText}`);
            } else {
                return message.reply("Comando recebido. Voltando ao fluxo principal (Nó inicial sem mensagem).");
            }
        }
        return message.reply("Não há um fluxo ativo para reiniciar. Você está no modo IA.");
    }

    if (normalizedMessage === '#atualizar' && message.fromMe) {
        const success = await loadFlowMap();
        return message.reply(success ? `✅ Fluxo atualizado com sucesso! ID: ${CURRENT_FLOW_ID}. Novas conversas usarão a versão mais recente.` : "❌ Falha ao atualizar o fluxo. Verifique a API na porta 3001.");
    }

    // 1. Inicializa o estado do usuário
    if (!userState[chatId]) {
        const initialMode = FLOW_MAP_JSON ? 'flow' : 'ai_only';
        userState[chatId] = {
            currentNodeId: FLOW_MAP_JSON?.nodes[0]?.id,
            mode: initialMode
        };
        // Se estiver em modo fluxo, envia a primeira mensagem
        if (initialMode === 'flow') {
            const initialNode = getNode(userState[chatId].currentNodeId);
            if (initialNode && initialNode.data && initialNode.data.messageText) {
                return message.reply(initialNode.data.messageText);
            }
        }
    }

    let currentState = userState[chatId];
    
    try {

        // --- 2. Tentar Executar o Fluxo (PRIORIDADE) ---
        if (currentState.mode === 'flow' && FLOW_MAP_JSON) {

            const nextNodeId = getNextNodeId(currentState.currentNodeId, userMessage);

            if (nextNodeId) {
                // Rota do Fluxo Encontrada
                currentState.currentNodeId = nextNodeId;
                const nextNode = getNode(nextNodeId);

                // Verifica se o próximo nó é uma Configuração de IA
                if (nextNode.type === 'aiConfig') {
                    // 🟢 CORREÇÃO: Mudar para modo IA, enviar sinalização e RETORNAR
                    
                    currentState.mode = 'ai_support';
                    
                    // 1. Envia a MENSAGEM DE SINALIZAÇÃO
                    await message.reply("🤖 **Entendido!** Você está falando com o nosso Suporte de IA agora.\n\n*Descreva seu problema ou pergunta livremente. Digite #menu para voltar ao fluxo.*");
                    
                    // 2. RETORNA: Interrompe o processamento da mensagem atual ("2") e espera o próximo input.
                    return; 

                } else {
                    // Próximo nó é um Bloco de Mensagem
                    // Responde com a mensagem do nó e ENCERRA A EXECUÇÃO.
                    return message.reply(nextNode.data.messageText);
                }


            } else {
                // Nenhuma rota do fluxo encontrada (Fallback para IA)
                currentState.mode = 'ai_support';

                // Avisa que entrou no modo IA antes de enviar a resposta
                await message.reply("Não entendi essa opção. Você pode perguntar o que precisar, ou digite **#reiniciar** para voltar ao menu.");
                
                // Processa a mensagem inválida com a IA e retorna a resposta
                const aiReply = await getAiResponse(chatId, userMessage);
                return message.reply(aiReply);
            }

        }

        // --- 3. Executar Gemini (Modo de Suporte IA ou ai_only) ---
        // Este bloco lida com a conversa contínua com a IA.
        if (currentState.mode === 'ai_support' || currentState.mode === 'ai_only') {
            const aiReply = await getAiResponse(chatId, userMessage);
            return message.reply(aiReply);
        }


    } catch (error) {
        console.error(`ERRO no processamento de mensagem [${chatId}]:`, error);
        message.reply("Ocorreu um erro interno. Por favor, tente novamente ou digite **#reiniciar**.");
    }
});

client.initialize();    