import { useCallback, useRef, useState, useEffect } from 'react';
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
import AIConfigNode from './AIConfigNode'; 

const rfStyle = {
  backgroundColor: '#EBECEC',
  backgroundImage: 'radial-gradient(#bbb 1px, transparent 1px)',
  backgroundSize: '20px 20px',
};

// ----------------------------------------------------------------------
// DADOS INICIAIS (Fluxo Padrão - Usado se o ID não for encontrado)
// ----------------------------------------------------------------------
const initialNodes = [
  {
    id: 'node-start', 
    type: 'textUpdater',
    position: { x: 50, y: 150 }, 
    data: { 
      messageText: "Olá! Digite o número da opção desejada:\n\n1. Vendas e Informações\n2. Falar com a IA (Suporte)",
      conditionA: "1", 
      conditionB: "2", 
      onDataChange: () => {}, 
    },
  },
  {
    id: 'node-vendas', 
    type: 'textUpdater',
    position: { x: 350, y: 150 }, 
    data: { 
      messageText: "Vendas de 9h às 18h. Digite '0' para voltar.",
      conditionA: "0", 
      conditionB: "", 
      onDataChange: () => {}, 
    },
  },
  {
    id: 'ia-suporte-config', 
    type: 'aiConfig',
    position: { x: 50, y: 450 }, 
    data: { 
      systemInstructions: "Você é um bot de suporte técnico.",
      onDataChange: () => {}, 
    },
  },
];

const initialEdges = [
  { id: 'e1-2a', source: 'node-start', sourceHandle: 'a', target: 'node-vendas', type: 'smoothstep', label: '1 - Vendas' },
  { id: 'e1-3b', source: 'node-start', sourceHandle: 'b', target: 'ia-suporte-config', type: 'smoothstep', label: '2 - Suporte (Ativa IA)' },
  { id: 'e2-1a', source: 'node-vendas', sourceHandle: 'a', target: 'node-start', type: 'smoothstep', label: '0 - Voltar' },
];

const nodeTypes = { 
    textUpdater: TextUpdaterNode,
    aiConfig: AIConfigNode, 
};

// ----------------------------------------------------------------------
// FUNÇÃO AUXILIAR: LER O ID DO PROJETO DA URL
// ----------------------------------------------------------------------
const getFlowIdFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    // Retorna o valor de 'flowId' da URL, ou 'fluxo_padrao' como fallback
    return params.get('flowId') || 'fluxo_padrao'; 
};

function FlowCanvas() {
  // Inicializa o estado com base no ID da URL, mas os nós e arestas vazios (serão carregados)
  const [currentFlowId, setCurrentFlowId] = useState(getFlowIdFromUrl()); 
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]); 
  
  const reactFlowWrapper = useRef(null);
  const reactFlowInstance = useReactFlow();

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
  
  // ----------------------------------------------------------------------
  // SALVAR FLUXO
  // ----------------------------------------------------------------------
  const onSave = useCallback(async () => {
    const FLOW_ID = currentFlowId.trim();
    if (!FLOW_ID) {
      alert("Por favor, insira um ID de Projeto válido para salvar.");
      return;
    }
    const flow = reactFlowInstance.toObject(); 
    const API_URL = `http://localhost:3001/api/flows/${FLOW_ID}`;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(flow), 
        });
        
        const result = await response.json();

        if (response.ok) {
            alert(`✅ Fluxo salvo com sucesso! ID: ${FLOW_ID}`);
        } else {
            alert(`❌ Erro ao salvar o fluxo: ${result.message || 'Erro de servidor'}`);
        }
    } catch (error) {
        console.error('Erro de conexão:', error);
        alert('❌ Erro de conexão ao servidor API.');
    }
    
  }, [reactFlowInstance, currentFlowId]); 

  // ----------------------------------------------------------------------
  // CARREGAR FLUXO
  // ----------------------------------------------------------------------
  const onLoad = useCallback(async (idToLoad) => {
    const FLOW_ID = idToLoad.trim();
    if (!FLOW_ID) return;

    const API_URL = `http://localhost:3001/api/flows/${FLOW_ID}`;

    try {
        const response = await fetch(API_URL);
        
        if (response.status === 404) {
             console.log(`Fluxo '${FLOW_ID}' não encontrado. Iniciando layout padrão.`);
             // Se não existe, carrega o layout inicial (initialNodes/Edges)
             setNodes(initialNodes); 
             setEdges(initialEdges);
             return;
        }
        
        const flow = await response.json();

        setNodes(flow.nodes || []);
        setEdges(flow.edges || []);
        
        if (flow.viewport) {
             reactFlowInstance.setViewport(flow.viewport, { duration: 500 });
        }
        
        console.log(`Fluxo '${FLOW_ID}' carregado com sucesso.`);

    } catch (error) {
        console.error('Erro ao carregar o fluxo:', error);
        alert('❌ Erro de conexão ao servidor API ou falha na leitura do JSON.');
    }
  }, [reactFlowInstance, setNodes, setEdges]); 

  // ----------------------------------------------------------------------
  // EFEITO: CARREGAR FLUXO AO INICIAR O COMPONENTE
  // ----------------------------------------------------------------------
  useEffect(() => {
    // Carrega o fluxo usando o ID que veio da URL
    if (reactFlowInstance) {
        onLoad(currentFlowId); 
    }
  }, [reactFlowInstance]); // Executa uma vez após a montagem e inicialização do ReactFlow

  // ----------------------------------------------------------------------
  // FUNÇÃO: ADICIONAR NOVO NÓ
  // ----------------------------------------------------------------------
  const addNode = (type) => { 
    // Garante que o novo nó não nasça exatamente em 0,0
    const position = {
      x: 50 + Math.random() * 50, 
      y: 50 + Math.random() * 50,
    };

    const newNodeId = `node-${type}-${Date.now()}`; 
    
    const initialData = type === 'aiConfig' 
      ? { systemInstructions: 'Instruções da IA aqui.', onDataChange: onNodeDataChange }
      : { messageText: 'Nova mensagem do bloco.', conditionA: '', conditionB: '', onDataChange: onNodeDataChange };

    const newNode = {
      id: newNodeId,
      type: type, 
      position, 
      data: initialData,
    };

    setNodes((nds) => [...nds, newNode]);
    console.log(`✅ Novo nó (${type}) adicionado:`, newNodeId);
  };
  
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
        {/* INPUT ID DO PROJETO */}
        <label style={{fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px'}}>ID do Projeto:</label>
        <input 
          type="text"
          value={currentFlowId}
          onChange={(e) => setCurrentFlowId(e.target.value)}
          placeholder="Ex: fluxo_vendas"
          style={{
            padding: '0.5rem',
            borderRadius: '5px',
            border: '1px solid #9370DB',
            width: '100%',
            marginBottom: '15px'
          }}
        />
        
        <hr style={{width: '100%', borderTop: '1px solid #9370DB', margin: '10px 0'}} />

        {/* BOTÕES DE ADICIONAR NÓ */}
        <button
          onClick={() => addNode('textUpdater')}
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
        
        <button
          onClick={() => addNode('aiConfig')}
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

        {/* BOTÕES SALVAR/CARREGAR */}
        <button
          onClick={() => onLoad(currentFlowId)} // Carrega o que estiver digitado
          style={{
            padding: '0.5rem',
            background: '#4682B4',
            borderRadius: '15px',
            cursor: 'pointer',
            color: 'white', 
            fontWeight: 'bolder',
            width: '100%',
            border: '1px solid #4682B4',
            textAlign: 'center', 
            marginBottom: '10px' 
          }}
        >
          🔄 CARREGAR FLUXO
        </button>
        
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