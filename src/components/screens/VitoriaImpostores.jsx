// src/components/screens/VitoriaImpostores.jsx
'use client';

import React from 'react';
import { useGameContext } from '@/context/GameContext';
import { Button } from '@/components/ui/button'; // Supondo que você tem este componente

export function VitoriaImpostores() {
  const {
    goToStep,
    players,
    impostors, // Array com nomes ou IDs dos impostores
    crownCard, // Objeto da carta coroa { description, color, symbol, number, ... }
    // gameConfig, // Para tempo total da partida, se guardado ou calculado
    tasks, // Para contar tarefas concluídas
    // Você pode precisar de um estado para 'tempoTotalDeJogoAteVitoria'
    // ou calcular a partir de 'currentRound' e 'timerDuration' se for relevante.
    // Por simplicidade, vamos focar nas infos que temos mais diretamente.
    // Se você tiver `crownFoundResult` com `playerName` de quem encontrou:
    crownFoundResult 
  } = useGameContext();

  const impostor = players.filter(p => p.isImpostor);
  const tarefasConcluidas = tasks.filter(task => !task.isCommon && task.completed).length;
  const totalTarefasPossiveis = tasks.filter(task => !task.isCommon).length;

  // Encontrar quem efetivamente entregou a coroa (se guardado em crownFoundResult)
  const heroiDaPartida = crownFoundResult?.playerName || "Um Impostor com muita sagacidade!";

  // Mensagem de Vitória
  let mensagemVitoria = `Parabéns, Equipe dos Impostores! A Coroa foi capturada pelo Impostor  ${heroiDaPartida}!`;
  if (crownFoundResult?.playerName && players.find(p => p.name === crownFoundResult.playerName)?.isImpostor) {
    // Caso especial (improvável neste fluxo de vitória da equipe, mas para cobrir)
    mensagemVitoria = `Atenção! ${crownFoundResult.playerName} (um Impostor) capturou a Coroa!`;
  }


  return (
    <div className="max-w-2xl w-full bg-gradient-to-br from-green-700 via-green-800 to-emerald-900 text-white rounded-xl shadow-2xl p-8 text-center animate-fadeIn">
      <h1 className="text-5xl font-bold mb-6 text-yellow-300 drop-shadow-lg">
        VITÓRIA DA EQUIPE!
      </h1>
      
      <p className="text-xl mb-8 leading-relaxed">
        {mensagemVitoria}
      </p>

      <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 mb-8 space-y-4 text-left">
        <h2 className="text-2xl font-semibold text-yellow-200 mb-4 border-b-2 border-yellow-400/50 pb-2">Detalhes da Partida:</h2>
        
        <div>
          <strong className="text-yellow-300">Carta da Coroa:</strong>
          <p className="ml-2">{crownCard ? `${crownCard.description} (Cor: ${crownCard.color}, Símbolo: ${crownCard.symbol}${crownCard.number !== null ? `, Número: ${crownCard.number}` : ''})` : 'Não informada'}</p>
        </div>

        <div>
          <strong className="text-yellow-300">Equipe Leal:</strong>
          <ul className="list-disc list-inside ml-2">
            {impostor.map(player => (
              <li key={player.id}>{player.name}</li>
            ))}
          </ul>
        </div>

        <div>
          <strong className="text-red-400">Impostor(es) Identificado(s):</strong>
          {impostors.length > 0 ? (
            <ul className="list-disc list-inside ml-2">
              {impostors.map((impostorName, index) => (
                <li key={index}>{impostorName}</li>
              ))}
            </ul>
          ) : (
            <p className="ml-2">Nenhum impostor nesta partida (ou não revelado).</p>
          )}
        </div>
        
        {/* <div>
          <strong className="text-yellow-300">Tempo de Jogo Total:</strong>
          <p className="ml-2">A ser implementado</p> 
        </div> */}

        <div>
          <strong className="text-yellow-300">Tarefas Concluídas:</strong>
          <p className="ml-2">{tarefasConcluidas} de {totalTarefasPossiveis}</p>
        </div>
      </div>

      <Button
        onClick={() => goToStep('inicio')} // Volta para a tela inicial para um novo jogo
        className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-10 py-4 rounded-lg text-lg transition-transform duration-150 hover:scale-105"
      >
        Jogar Novamente
      </Button>
    </div>
  );
}

// Adicione um pouco de CSS para a animação (opcional, em seu arquivo CSS global)
/*
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
.animate-fadeIn {
  animation: fadeIn 0.5s ease-out forwards;
}
*/