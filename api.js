// api.js

import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { promises as fs } from 'fs'; 
import path from 'path'; 

// --- Configuração e Estado ---
const app = express();
const PORT = 3001;
const FLOWS_DIR = path.join(process.cwd(), 'flows');

// --- Middlewares ---
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

// --- Rotas da API ---

// 1. Rota POST para salvar/atualizar um fluxo
app.post('/api/flows/:flowId', async (req, res) => {
    const { flowId } = req.params;
    const flowData = req.body;
    const filePath = path.join(FLOWS_DIR, `${flowId}.json`);

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

// 2. Rota GET para carregar um fluxo por ID
app.get('/api/flows/:flowId', async (req, res) => {
    const { flowId } = req.params;
    const filePath = path.join(FLOWS_DIR, `${flowId}.json`);

    try {
        const data = await fs.readFile(filePath, 'utf8');
        const flow = JSON.parse(data);
        flow.id = flowId; 
        res.status(200).json(flow);
    } catch (error) {
        console.warn(`⚠️ Fluxo '${flowId}' não encontrado.`);
        res.status(404).json({ message: 'Fluxo não encontrado.' });
    }
});

// ----------------------------------------------------
// ROTA: /api/flows/active (Carrega o fluxo salvo por último - USADO PELO BOT)
// ----------------------------------------------------
app.get('/api/flows/active', async (req, res) => {
    try {
        
        const files = await fs.readdir(FLOWS_DIR);
        const jsonFiles = files.filter(file => file.endsWith('.json'));

        if (jsonFiles.length === 0) {
            return res.status(404).json({ message: 'Nenhum fluxo JSON encontrado no diretório.' });
        }

        let latestFile = null;
        let latestMtime = 0; 

        for (const file of jsonFiles) {
            const filePath = path.join(FLOWS_DIR, file);

            const stats = await fs.stat(filePath);

            if (stats.mtimeMs > latestMtime) {
                latestMtime = stats.mtimeMs;
                latestFile = file;
            }
        }

        if (!latestFile) {
            return res.status(404).json({ message: 'Falha ao identificar o fluxo ativo.' });
        }

        const latestFilePath = path.join(FLOWS_DIR, latestFile);
        const flowData = await fs.readFile(latestFilePath, 'utf-8');

        const flowId = latestFile.replace('.json', '');
        const flowJson = JSON.parse(flowData);
        flowJson.id = flowId;

        console.log(`✅ Fluxo ATIVO retornado: ${flowId} (mtime: ${new Date(latestMtime).toLocaleTimeString()})`);
        res.status(200).json(flowJson);

    } catch (error) {
        console.error('❌ Erro ao encontrar o fluxo ativo:', error);
        res.status(500).json({ message: 'Falha interna ao carregar o fluxo ativo.', error: error.message });
    }
});


// --- Inicialização do Servidor ---
app.listen(PORT, () => {
    console.log(`🚀 API rodando em http://localhost:${PORT}`);
});