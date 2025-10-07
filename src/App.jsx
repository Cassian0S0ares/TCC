import { useCallback, useRef, useState } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import TextUpdaterNode from './TextUpdaterNode'; 
// ⚠️ 1. IMPORTAÇÃO CORRETA: O novo bloco precisa ser importado
import AIConfigNode from './AIConfigNode'; 

const rfStyle = {
  backgroundColor: '#EBECEC',
  backgroundImage: 'radial-gradient(#bbb 1px, transparent 1px)',
  backgroundSize: '20px 20px',
};

// Dados iniciais (garantindo que o bloco AI esteja presente por padrão)
const initialNodes = [
  {
    id: 'node-start', 
    type: 'textUpdater',
    position: { x: 5, y: 5 },
    data: { 
      messageText: "Olá! Bem-vindo ao meu bot. Digite 1 para Opção A ou 2 para Opção B.",
      conditionA: "1",
      conditionB: "2",
      onDataChange: () => {}, // placeholder
    },
  },
  {
    id: 'ai-config-default', 
    type: 'aiConfig',
    position: { x: 5, y: 300 },
    data: { 
      systemInstructions: "Você é um assistente prestativo e amigável, especialista em fluxos de WhatsApp.",
      onDataChange: () => {}, // placeholder
    },
  },
];

// ⚠️ 2. REGISTRO CORRETO: Os dois tipos de nó precisam ser registrados
const nodeTypes = { 
    textUpdater: TextUpdaterNode,
    aiConfig: AIConfigNode, 
};

function FlowCanvas() {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState([]);
  const reactFlowWrapper = useRef(null);
  
  // ⚠️ 3. ACESSO CORRETO: Desestrutura os métodos 'project' e 'toObject' diretamente
  const { project, toObject } = useReactFlow();

  // Função para atualizar os dados internos de um nó (passada para os filhos)
  const onNodeDataChange = useCallback((id, key, value) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              [key]: value,
            },
          };
        }
        return node;
      })
    );
  }, [setNodes]);

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [],
  );

  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [],
  );

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [],
  );
  
  // Lógica de salvamento
  const onSave = useCallback(async () => {
    // Usa 'toObject' desestruturado
    const flow = toObject(); 
    
    const FLOW_ID = 'meu_bot_principal'; 
    const API_URL = `http://localhost:3001/api/flows/${FLOW_ID}`;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(flow), 
        });
        
        const result = await response.json();

        if (response.ok) {
            alert(`✅ Fluxo salvo com sucesso! ID: ${result.flowId}`);
        } else {
            alert(`❌ Erro ao salvar o fluxo: ${result.message || 'Erro de servidor'}`);
        }
    } catch (error) {
        console.error('Erro de conexão:', error);
        alert('❌ Erro de conexão ao servidor API. Certifique-se de que api.js está rodando na porta 3001.');
    }
    
  }, [toObject]); 

  // ⚠️ 4. FUNÇÃO DE CRIAÇÃO CORRETA: Usa 'project' e define o 'type'
  // ⚠️ Modificação para contornar o erro do 'project'
  const addNode = (type) => { 
    
    // ✅ NOVO: Posição aleatória fixa (Os nós aparecerão no canto superior esquerdo)
    const position = {
      x: -50 + Math.random() * 50, 
      y: -50 + Math.random() * 50,
    };

    const newNodeId = `node-${type}-${Date.now()}`; 
    
    const initialData = type === 'aiConfig' 
      ? { systemInstructions: 'Instruções da IA aqui.', onDataChange: onNodeDataChange }
      : { messageText: 'Nova mensagem do bloco.', conditionA: '', conditionB: '', onDataChange: onNodeDataChange };

    const newNode = {
      id: newNodeId,
      type: type, 
      position, // Usa a nova posição fixa
      data: initialData,
    };

    setNodes((nds) => [...nds, newNode]);
    
    // DEBUG: Confirma que o nó foi adicionado ao estado
    console.log(`✅ Novo nó (${type}) adicionado ao estado:`, newNodeId);
  };
  
  // Mapeia os nós para garantir que a função de callback esteja disponível para nós já existentes
  const nodesWithCallback = nodes.map(node => ({
    ...node,
    data: {
      ...node.data,
      onDataChange: onNodeDataChange, 
    }
  }));

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Barra lateral */}
      <aside
        style={{
          width: '250px',
          background: '#D9C6F8',
          color: 'black',
          padding: '1rem',
          opacity: '75%',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}
      >
        {/* Interação Direta  */}
        <button
          onClick={() => addNode('textUpdater')} // Chama addNode com o tipo 'textUpdater'
          style={{
            padding: '0.5rem',
            background: '#FFF',
            borderRadius: '15px',
            cursor: 'pointer',
            color: 'black', 
            fontWeight: 'bolder',
            width: '100%',
            border: '1px solid #9370DB',
            textAlign: 'center', 
          }}
        >
          + Bloco de Mensagem
        </button>
        
        {/* Interações com a IA */}
        <button
          onClick={() => addNode('aiConfig')} // Chama addNode com o tipo 'aiConfig'
          style={{
            padding: '0.5rem',
            background: '#3CB371', 
            borderRadius: '15px',
            cursor: 'pointer',
            color: 'white', 
            fontWeight: 'bolder',
            width: '100%',
            border: '1px solid #3CB371',
            textAlign: 'center', 
          }}
        >
          + Configurar a IA
        </button>

        <hr style={{width: '100%', borderTop: '1px solid #9370DB', margin: '10px 0'}} />

        <button
          onClick={onSave}
          style={{
            padding: '0.5rem',
            background: '#9370DB',
            borderRadius: '15px',
            cursor: 'pointer',
            color: 'white', 
            fontWeight: 'bolder',
            width: '100%',
            border: '1px solid #9370DB',
            textAlign: 'center', 
          }}
        >
          💾 SALVAR FLUXO
        </button>
      </aside>

      {/* Canvas do React Flow */}
      <div ref={reactFlowWrapper} style={{ flexGrow: 1 }}>
        <ReactFlow
          nodes={nodesWithCallback} 
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          style={rfStyle}
        />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ReactFlowProvider>
      <FlowCanvas />
    </ReactFlowProvider>
  );
}