'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

// Componente de Timer
export function Timer({ seconds, isRunning, onStart, onPause, formatTime }) {
  return (
    <div className="bg-gray-800/50 rounded-lg p-4 text-center">
      <div className="text-4xl font-bold mb-2">{formatTime(seconds)}</div>
      <div className="flex justify-center space-x-4">
        {!isRunning ? (
          <Button 
            onClick={onStart} 
            className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2 rounded"
          >
            Iniciar
          </Button>
        ) : (
          <Button 
            onClick={onPause} 
            className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold px-4 py-2 rounded"
          >
            Pausar
          </Button>
        )}
      </div>
    </div>
  );
}

// Componente de Dica sobre a Coroa
export function CrownHint({ hint, isChief }) {
  const [showHint, setShowHint] = useState(false);
  
  if (!isChief) return null;
  
  return (
    <div className="bg-yellow-900/30 rounded-lg p-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold text-yellow-300">Dica sobre a Coroa:</h3>
        {!showHint && (
          <Button onClick={() => setShowHint(true)} className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold px-4 py-2 rounded text-sm" >
            Ver Dica
          </Button>
        )}
      </div>
      
      {showHint ? (
        <p className="text-white">{hint}</p>
      ) : (
        <p className="text-gray-400 italic">Clique no botão para ver a dica sobre a localização da Coroa.</p>
      )}
    </div>
  );
}

// Componente de Progresso do Jogo
export function GameProgress({ completedTasks, totalTasks }) {
  const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  return (
    <div className="bg-gray-800/50 rounded-lg p-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">Progresso das Tarefas:</h3>
        <span className="text-lg font-bold">{completedTasks}/{totalTasks}</span>
      </div>
      
      <div className="w-full bg-gray-700 rounded-full h-4">
        <div 
          className="bg-green-600 h-4 rounded-full" 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      
      <p className="text-center mt-2 text-sm text-gray-400">
        {percentage}% das tarefas concluídas
      </p>
    </div>
  );
}

// Componente de Lista de Tarefas
export function TaskList({ tasks, onMarkCompleted, isChief, timerStarted }) {
  // Verificar se as checkboxes devem estar habilitadas
  // Agora sempre habilitadas para o Chefe, independente do timer
  const checkboxesEnabled = isChief;
  
  return (
    <div className="space-y-4">
	{tasks.map(task => (
	  <div 
		key={task.id} 
		className={`p-4 rounded-lg ${task.isCommon ? 'bg-yellow-900/30' : 'bg-gray-800/50'}`}
	  >
		<div className="flex justify-between items-start">
		  <div>

              <h3 className="font-semibold text-lg">
				{task.isCommon ? 'Área Comum' : task.name}
              </h3>
			  {!task.isCommon && (
				<>
				  <p className="text-sm text-gray-300">Responsável: {task.responsible}</p>
				  <p className="mt-2">{task.task?.description}</p>
				</>
			  )}
			</div>
		  
		  {!task.isCommon && (
			<div className="flex items-center">
			  <input type="checkbox" id={`task-${task.id}`} checked={task.completed}
				// Modifique o onChange para ter um console.log:
				onChange={(e) => { // Use o evento 'e' se precisar, mas para o log vamos usar 'task' diretamente
				  const newStatus = !task.completed; // Calcula o novo status
				  console.log(`TaskList: Checkbox para tarefa "${task.name}" (ID: ${task.id}) clicado. Habilitado: ${checkboxesEnabled}. Novo status seria: ${newStatus}`); // <--- LOG AQUI
				  if (checkboxesEnabled) {
					console.log(`TaskList: Chamando onMarkCompleted com ID: ${task.id}, Status: ${newStatus}`); // <--- LOG ANTES DE CHAMAR
					onMarkCompleted(task.id, newStatus); // Chama a função do pai (onMarkCompleted)
				  } else {
					console.log(`TaskList: Checkbox desabilitado, onMarkCompleted não será chamado.`);
				  }
				}}
				className={`h-6 w-6 rounded border-gray-300 ${checkboxesEnabled ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
				disabled={!checkboxesEnabled}
			  />
			  <label htmlFor={`task-${task.id}`} className={`ml-2 text-sm font-medium ${checkboxesEnabled ? 'cursor-pointer' : 'cursor-not-allowed text-gray-500'}`}>
				{task.completed ? 'Concluída' : 'Marcar como concluída'}
			  </label>
			</div>
		  )}
		</div>
	  </div>
	))}
    </div>
  );
}

// Componente de Seleção de Jogador
export function PlayerSelector({ players, onSelectPlayer }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {players.map(player => (
        <button
          key={player.id}
          onClick={() => onSelectPlayer(player.name)}
          className="p-4 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg text-center transition-colors"
        >
          <span className="text-lg font-medium">{player.name}</span>
        </button>
      ))}
    </div>
  );
}

// Componente de Botão de Hack (para o Impostor)
export function HackButton({ isImpostor, onHack }) {
  if (!isImpostor) return null;
  
  return (
    <div className="bg-red-900/30 rounded-lg p-4 text-center">
      <h3 className="text-lg font-semibold text-red-300 mb-2">Opção de Impostor:</h3>
      <Button 
        onClick={onHack} 
        className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-lg"
      >
        Hackear App
      </Button>
      <p className="mt-2 text-sm text-gray-400">
        Causa um comportamento inesperado no app para confundir os outros jogadores.
      </p>
    </div>
  );
}

// Componente para Declarar que Encontrou a Coroa
export function DeclareFoundCrown({ onDeclare }) {
  const [cardDescription, setCardDescription] = useState('');
  const [showForm, setShowForm] = useState(false);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (cardDescription.trim()) {
      onDeclare(cardDescription);
      setCardDescription('');
    }
  };
  
  return (
    <div className="bg-purple-900/30 rounded-lg p-4">
      {!showForm ? (
        <div className="text-center">
          <Button 
            onClick={() => setShowForm(true)} 
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 py-3 rounded-lg"
          >
            Declarar que Encontrou a Coroa
          </Button>
          <p className="mt-2 text-sm text-gray-400">
            Use esta opção se você acredita ter encontrado a carta que esconde a Coroa.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <h3 className="text-lg font-semibold text-purple-300 mb-2">Descreva a Carta da Coroa:</h3>
          <div className="mb-4">
            <input
              type="text"
              value={cardDescription}
              onChange={(e) => setCardDescription(e.target.value)}
              placeholder="Ex: vermelho 7, azul pular, coringa +4"
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
              required
            />
          </div>
          <div className="flex space-x-3">
            <Button 
              type="submit" 
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg"
            >
              Confirmar
            </Button>
            <Button 
              type="button"
              onClick={() => setShowForm(false)} 
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 rounded-lg"
            >
              Cancelar
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

// Componente de Papel do Jogador
export function PlayerRole({ playerName, isImpostor, isChief, onConfirmRoleView }) {
  const handleClick = () => {
    console.log("PlayerRole: Botão 'Entendi' clicado. Chamando onConfirmRoleView."); // <--- LOG IMPORTANTE
    if (typeof onConfirmRoleView === 'function') {
      onConfirmRoleView();
    } else {
      console.error("PlayerRole: onConfirmRoleView não é uma função!", onConfirmRoleView); // <--- LOG DE ERRO IMPORTANTE
    }
  };
  return (
    <div className="bg-gray-800/50 rounded-lg p-6 text-center max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Seu Papel</h2>
      
      <div className="mb-6">
        <p className="text-lg mb-2">Jogador:</p>
        <p className="text-2xl font-bold text-yellow-400">{playerName}</p>
      </div>
      
      <div className="mb-6">
        <p className="text-lg mb-2">Você é:</p>
        <p className={`text-2xl font-bold ${isImpostor ? 'text-red-500' : 'text-green-500'}`}>
          {isImpostor ? 'IMPOSTOR' : 'LEAL'}
        </p>
        <p className="mt-2 text-gray-400">
          {isImpostor 
            ? 'Sua missão é sabotar o jogo e não ser descoberto.' 
            : 'Sua missão é encontrar a Coroa e identificar os impostores.'}
        </p>
      </div>
      
      {isChief && (
        <div className="mt-4 p-3 bg-yellow-900/30 rounded-lg">
          <p className="text-yellow-300 font-bold">Você é o Chefe desta rodada!</p>
          <p className="text-sm mt-1">
            Você será responsável por coordenar os jogadores e verificar as tarefas.
          </p>
        </div>
      )}
      
      <Button 
		onClick = {handleClick/*onConfirmRoleView*/} // <--- Use a propriedade onConfirmRoleView aqui
        className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-lg"
      >
        Entendi
      </Button>
    </div>
  );
}



