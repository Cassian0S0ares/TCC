// AIConfigNode.jsx
import { useCallback } from 'react';
import { Handle, Position } from '@xyflow/react';

// --- Estilos ---
const nodeStyle = {
  padding: '15px',
  background: '#F0FFF0', // Cor verde clara para diferenciar
  borderRadius: '15px',
  width: '300px',
  boxShadow: '0 4px 8px rgba(0, 128, 0, 0.2)',
  fontFamily: 'sans-serif',
  fontSize: '14px',
  paddingBottom: '25px',
  border: '2px dashed #3CB371', // Borda tracejada
  color: 'black'
};

const handleStyle = {
  backgroundColor: '#3CB371' // Verde médio
};

const labelStyle = {
  display: 'block',
  marginBottom: '5px',
  marginTop: '10px',
  fontSize: '12px',
  fontWeight: 'bold',
  color: '#3CB371'
};

const textareaStyle = {
  width: '100%',
  padding: '10px',
  border: '1px solid #3CB371',
  borderRadius: '8px',
  backgroundColor: '#FFFFFF',
  fontSize: '14px',
  boxSizing: 'border-box',
  outline: 'none',
  minHeight: '150px',
};
// --- Fim Estilos ---

function AIConfigNode({ id, data, isConnectable }) {
    
  // Função para atualizar o valor das instruções no estado do nó
  const onInstructionsChange = useCallback((evt) => {
    // data.onDataChange é o callback principal passado do App.jsx
    data.onDataChange(id, 'systemInstructions', evt.target.value);
  }, [id, data]);

  return (
    <div className="ai-config-node" style={nodeStyle}>
      {/* Target: Opcional, para indicar que este bloco pode ser ativado por um fluxo */}
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        style={handleStyle}
      />
      
      <div>
        <label htmlFor="systemInstructions" style={labelStyle}>
          INSTRUÇÕES DE PERSONALIDADE E REGRAS DA IA:
        </label>
        <textarea 
          id="systemInstructions" 
          name="systemInstructions" 
          onChange={onInstructionsChange} 
          className="nodrag" 
          style={textareaStyle}
          placeholder="Ex: Você é um assistente de vendas amigável. Use emojis e responda apenas em horário comercial (9h às 18h). Qualquer pergunta fora do escopo de vendas deve ser respondida com 'Entre em contato com o suporte técnico'."
          value={data.systemInstructions || ''} // Exibe o texto salvo
        />
      </div>

      <p style={{marginTop: '10px', fontSize: '10px', color: '#555'}}>
        Este bloco define a personalidade do ChatBot.
      </p>

      {/* Source: Opcional, para permitir conexão com outros nós, se necessário */}
      <Handle 
        type="source" 
        position={Position.Bottom} 
        id="out" 
        isConnectable={isConnectable} 
        style={handleStyle}
      />
    </div>
  );
}

export default AIConfigNode;