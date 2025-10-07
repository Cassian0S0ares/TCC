// bloco com texto
import { useCallback } from 'react';
import { Handle, Position } from '@xyflow/react';

// --- Estilos ---
const nodeStyle = {
  padding: '10px',
  background: 'white',
  borderRadius: '15px',
  width: '200px', // Aumentei um pouco a largura
  boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
  fontFamily: 'sans-serif',
  fontSize: '14px',
  paddingBottom: '25px',
  border: '1px solid #9370DB',
  color: 'black'
};

const handleStyle = {
  backgroundColor: '#9370db'
};

const labelStyle = {
  display: 'block',
  marginBottom: '5px',
  marginTop: '10px',
  fontSize: '10px',
  fontWeight: 'bold',
};

const inputStyle = {
  width: '100%',
  padding: '10px',
  border: '1px solid #9370DB',
  borderRadius: '5px',
  backgroundColor: '#FFFFF',
  fontSize: '14px',
  boxSizing: 'border-box',
  outline: 'none',
};
// --- Fim Estilos ---

function TextUpdaterNode({ id, data, isConnectable }) {

  // Função para atualizar o valor da mensagem no estado do nó
  const onMessageChange = useCallback((evt) => {
    data.onDataChange(id, 'messageText', evt.target.value);
  }, [id, data]);

  // Função para atualizar o valor da condição 1 (Saída 'a')
  const onConditionAChange = useCallback((evt) => {
    data.onDataChange(id, 'conditionA', evt.target.value);
  }, [id, data]);

  // Função para atualizar o valor da condição 2 (Saída 'b')
  const onConditionBChange = useCallback((evt) => {
    data.onDataChange(id, 'conditionB', evt.target.value);
  }, [id, data]);

  // Função para atualizar o valor da condição 3 (Saída 'C')
  const onConditionCChange = useCallback((evt) => {
    data.onDataChange(id, 'conditionC', evt.target.value);
  }, [id, data]);

  return (
    <div className="text-updater-node" style={nodeStyle}>
      {/* TARGET: Onde a conversa entra */}
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        style={handleStyle}
      />

      <div>
        <label htmlFor="messageText" style={labelStyle}>MENSAGEM A ENVIAR:</label>
        <textarea
          id="messageText"
          name="messageText"
          onChange={onMessageChange}
          className="nodrag"
          style={{
            ...inputStyle,
            minHeight: '200px', // 👈 MUDANÇA: Aumenta a altura mínima
            resize: 'vertical', // Permite redimensionamento vertical pelo usuário
            borderRadius: '5px' // Usa bordas quadradas para área de texto
          }}
          placeholder="Digite sua mensagem longa aqui..."
          value={data.messageText || ''}
        />
      </div>


      {/* Saída A (Handle 'a') */}
      <div>
        <label htmlFor="conditionA" style={labelStyle}>CONDIÇÃO PARA SAÍDA A:</label>
        <input
          id="conditionA"
          name="conditionA"
          onChange={onConditionAChange}
          className="nodrag"
          style={inputStyle}
          placeholder="Ex: Sim ou Opção 1"
          value={data.conditionA || ''}
        />
      </div>
      <Handle
        type="source"
        position={Position.Right}
        id="a" // ID da saída A
        isConnectable={isConnectable}
        style={{ ...handleStyle, top: '50%', background: 'green' }}
      />

      {/* Saída B (Handle 'b') */}
      <div>
        <label htmlFor="conditionB" style={labelStyle}>CONDIÇÃO PARA SAÍDA B:</label>
        <input
          id="conditionB"
          name="conditionB"
          onChange={onConditionBChange}
          className="nodrag"
          style={inputStyle}
          placeholder="Ex: Não ou Opção 2"
          value={data.conditionB || ''}
        />
      </div>
      <div>
        <label htmlFor="conditionC" style={labelStyle}>CONDIÇÃO PARA SAÍDA C:</label>
        <input
          id="conditionC"
          name="conditionC"
          onChange={onConditionCChange}
          className="nodrag"
          style={inputStyle}
          placeholder="Ex: Talvez ou Opção 3"
          value={data.conditionC || ''}
        />
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        id="b" // ID da saída B
        isConnectable={isConnectable}
        style={{ ...handleStyle, background: 'red' }}
      />
    </div>
  );
}

export default TextUpdaterNode;