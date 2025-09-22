import qrcode from 'qrcode-terminal';
import { Client } from 'whatsapp-web.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Substitua pelo seu caminho correto para o arquivo .env se estiver usando.
// Por exemplo: require('dotenv').config();
const GEMINI_API_KEY = 'AIzaSyBWPkHIwzfOYKUR8dj2e1rSSzX6P2sWGoo'; // <--- SUBSTITUA AQUI

// Inicializar o cliente do Gemini
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }); // Modelo atualizado

// Inicializar WhatsApp
const client = new Client();

// Gerar QR Code para conectar
client.on('qr', (qr) => {
qrcode.generate(qr, { small: true });
});

// Quando o bot estiver pronto
client.on('ready', () => {
 console.log('Bot pronto e conectado!');
});

// Responde mensagens recebidas
client.on('message', async (message) => {
 // Inicia uma nova conversa a cada mensagem para manter o contexto independente
  const chat = model.startChat({
    history: [], // Inicia um histórico vazio para cada nova interação
    generationConfig: {
      maxOutputTokens: 1000,
    },
  });

  try {
    // Envia a mensagem do usuário para o Gemini
    const result = await chat.sendMessage(message.body);
    const response = await result.response;
    const text = response.text();

    // Envia a resposta de volta no WhatsApp
    message.reply(text);
  } catch (error) {
    console.error('Erro ao processar a mensagem:', error);
    message.reply('Desculpe, ocorreu um erro ao processar sua mensagem 😅');
  }
});

// Inicializar o WhatsApp
client.initialize();