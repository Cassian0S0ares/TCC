// Antes: const express = require('express');
import express from 'express';
// Antes: const bodyParser = require('body-parser');
import bodyParser from 'body-parser';
// Antes: const cors = require('cors');
import cors from 'cors';
import { promises as fs } from 'fs'; // Usaremos 'fs/promises' para operações assíncronas

// --- Configuração e Estado ---
const app = express();
const PORT = 3001;
const FLOWS_DIR = './flows'; 

// --- Middlewares ---
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

// --- Rotas da API ---

// 1. Rota POST para salvar/atualizar um fluxo
app.post('/api/flows/:flowId', async (req, res) => {
    const { flowId } = req.params;
    const flowData = req.body;
    const filePath = `${FLOWS_DIR}/${flowId}.json`;
    
    // Cria o diretório 'flows' se não existir
    try {
        await fs.mkdir(FLOWS_DIR, { recursive: true });
    } catch (error) {
        // Ignora se o diretório já existe
    }

    try {
        await fs.writeFile(filePath, JSON.stringify(flowData, null, 2));
        console.log(`✅ Fluxo '${flowId}' salvo/atualizado com sucesso.`);
        res.status(200).json({ message: 'Fluxo salvo com sucesso.', flowId });
    } catch (error) {
        console.error(`❌ Erro ao salvar o fluxo '${flowId}':`, error);
        res.status(500).json({ message: 'Erro interno do servidor ao salvar o fluxo.' });
    }
});

// 2. Rota GET para carregar um fluxo (usada pelo teste.js)
app.get('/api/flows/:flowId', async (req, res) => {
    const { flowId } = req.params;
    const filePath = `${FLOWS_DIR}/${flowId}.json`;
    
    try {
        const data = await fs.readFile(filePath, 'utf8');
        const flow = JSON.parse(data);
        res.status(200).json(flow);
    } catch (error) {
        // Se o arquivo não existir ou houver erro de leitura
        console.warn(`⚠️ Fluxo '${flowId}' não encontrado.`, error.message);
        res.status(404).json({ message: 'Fluxo não encontrado.' });
    }
});

// --- Inicialização do Servidor ---
app.listen(PORT, () => {
    console.log(`🚀 API rodando em http://localhost:${PORT}`);
});