// AIConfigNode.jsx - Bloco de Configuração de IA
import { useCallback } from 'react';
import { Handle, Position } from '@xyflow/react';

// --- Estilos ---
const nodeStyle = {
  padding: '15px',
  background: '#F0FFF0', 
  borderRadius: '15px',
  width: '300px',
  boxShadow: '0 4px 8px rgba(0, 128, 0, 0.2)',
  fontFamily: 'sans-serif',
  fontSize: '14px',
  paddingBottom: '25px',
  border: '2px dashed #3CB371', 
  color: 'black'
};

const handleStyle = {
  backgroundColor: '#3CB371' 
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
  resize: 'vertical'
};
// --- Fim Estilos ---

function AIConfigNode({ id, data, isConnectable }) {
    
  const onInstructionsChange = useCallback((evt) => {
    data.onDataChange(id, 'systemInstructions', evt.target.value);
  }, [id, data]);

  return (
    <div className="ai-config-node" style={nodeStyle}>
      {/* TARGET: Entrada de ativação */}
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
          placeholder="Ex: Você é um bot de suporte. Responda de forma direta e concisa. Limite-se a dar instruções técnicas."
          value={data.systemInstructions || ''} 
        />
      </div>

      <p style={{marginTop: '10px', fontSize: '10px', color: '#555'}}>
        Este bloco define a **personalidade** do ChatBot.
      </p>

      {/* SOURCE: Saída (para voltar ao menu ou seguir o fluxo) */}
      <Handle 
        type="source" 
        position={Position.Bottom} 
        id="default"
        isConnectable={isConnectable} 
        style={handleStyle} 
      />
    </div>
  );
}

export default AIConfigNode;