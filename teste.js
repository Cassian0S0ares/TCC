import qrcode from 'qrcode-terminal';
import { Client } from 'whatsapp-web.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

// 🔑 Sua chave do Gemini 2.5 Flash
const GEMINI_API_KEY = "AIzaSyBWPkHIwzfOYKUR8dj2e1rSSzX6P2sWGoo";

// Inicializar o cliente do Gemini
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// Inicializar WhatsApp
const client = new Client();

// Histórico separado por chat
const conversations = {};

// Gerar QR Code
client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

// Bot pronto
client.on("ready", () => {
  console.log("🤖 Bot pronto e conectado!");
});

// Receber mensagens
client.on("message", async (message) => {
  try {
    const chatId = message.from;

    // Cria histórico do chat se não existir
    if (!conversations[chatId]) {
      conversations[chatId] = [
        {
          role: "user",
          content: "A partir de agora, responda sempre em português e mantenha o contexto da conversa.",
        },
        {
          role: "model",
          content: "Claro! Responderei sempre em português e lembrarei do contexto desta conversa.",
        },
      ];
    }

    // Adiciona mensagem do usuário
    conversations[chatId].push({ role: "user", content: message.body });

    // Inicia o chat com todo o histórico do chatId
    const chat = model.startChat({
      history: conversations[chatId].map((m) => ({
        role: m.role,
        parts: [{ text: m.content }],
      })),
      generationConfig: { maxOutputTokens: 500 },
    });

    // Envia a mensagem para o Gemini
    const result = await chat.sendMessage(message.body);
    const response = await result.response;

    // Extrair texto corretamente
    const reply =
      response.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Desculpe, não consegui gerar uma resposta.";

    // Adiciona resposta da IA ao histórico
    conversations[chatId].push({ role: "model", content: reply });

    // Responde no WhatsApp
    message.reply(reply);

  } catch (error) {
    console.error("❌ Erro ao processar a mensagem:", error);
    message.reply("Desculpe, ocorreu um erro ao processar sua mensagem 😅");
  }
});

// Inicializar WhatsApp
client.initialize();
