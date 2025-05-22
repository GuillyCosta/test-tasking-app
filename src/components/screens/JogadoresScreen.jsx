'use client';

import React, { useState } from 'react';
import { useGameContext } from '@/context/GameContext';
import { Button } from '@/components/ui/button';

export function JogadoresScreen() {
  const { 
    players, 
    gameConfig, 
    addPlayer, 
    removePlayer, 
    initializeGame, 
    goToStep 
  } = useGameContext();
  
  const [newPlayerName, setNewPlayerName] = useState('');
  const [error, setError] = useState('');
  
  // Adicionar novo jogador
  const handleAddPlayer = (e) => {
    e.preventDefault();
    
    if (!newPlayerName.trim()) {
      setError('Digite um nome para o jogador');
      return;
    }
    
    const success = addPlayer(newPlayerName.trim());
    
    if (success) {
      setNewPlayerName('');
      setError('');
    } else {
      setError('Não foi possível adicionar o jogador. Verifique se o nome já existe ou se o limite foi atingido.');
	  alert('Não foi possível adicionar o jogador. Verifique o nome ou o limite de jogadores.');
    }
  };
  
  // Remover jogador
  const handleRemovePlayer = (id) => {
    removePlayer(id);
  };
    
  // Iniciar o jogo
  const handleStartGame = () => {
  console.log("JogadoresScreen: handleConfirmAndStart - INÍCIO DA FUNÇÃO"); // Novo log
  // ... (validações) ...
    if (players.length < 4) {
      setError('É necessário pelo menos 4 jogadores para iniciar o jogo');
      return;
    }
    
    if (players.length < gameConfig.numJogadores) {
      setError(`É necessário ter ${gameConfig.numJogadores} jogadores configurados. Você tem ${players.length}.`);
      return;
    }
    
	if (players.length === 0 && gameConfig.numJogadores === 0) { // Caso extremo
        alert("Configure o número de jogadores primeiro.");
        goToStep('configuracao'); // Volta para configuração
        return;
    }
    console.log("JogadoresScreen: handleConfirmAndStart - Chamando initializeGame...");
	
    // Chamar a função do contexto para inicializar o jogo
    const gameInitialized = initializeGame(); // <--- CHAMADA AQUI 
    console.log("JogadoresScreen: handleConfirmAndStart - initializeGame retornou:", gameInitialized);
    if (!gameInitialized) {
        alert("Houve um problema ao iniciar o jogo. Verifique o console para mais detalhes.");
		console.log("Houve um problema ao iniciar o jogo. Verifique o console para mais detalhes.");
    }
    // A função initializeGame no contexto já chama goToStep para a próxima tela
  console.log("JogadoresScreen: handleConfirmAndStart - FIM DA FUNÇÃO");
  };
  
  return (
    <div className="max-w-3xl w-full bg-black/30 backdrop-blur-sm shadow-2xl border-yellow-500/30 rounded-lg p-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-center text-yellow-400 mb-2">Adicionar Jogadores</h2>
        <p className="text-center text-gray-300">
          Adicione os nomes de todos os jogadores participantes
        </p>
      </div>
      
{/* Formulário para adicionar jogadores */}
      {players.length < gameConfig.numJogadores ? (
        <div className="mb-6 flex space-x-2">
          <input
            type="text"
            value={newPlayerName} //newPlayerName
            onChange={(e) => setNewPlayerName(e.target.value)}
            placeholder="Nome do Jogador"
            className="flex-grow p-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-yellow-500 focus:border-yellow-500"
          />
          <button
            onClick={handleAddPlayer}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg"
          >
            Adicionar
          </button>
        </div>
      ) : (
        <p className="text-center text-green-400 mb-6">Todos os {gameConfig.numJogadores} jogadores foram adicionados!</p>
      )}

      {/* Lista de jogadores adicionados */}
      <div className="mb-8 space-y-2">
        {players.map((player, index) => (
          <div key={player.id} className="flex justify-between items-center bg-gray-700/50 p-3 rounded-md">
            <span className="text-lg">{index + 1}. {player.name}</span>
            <button 
              onClick={() => removePlayer(player.id)}
              className="text-red-500 hover:text-red-400 text-sm font-medium"
            >
              Remover
            </button>
          </div>
        ))}
      </div>

      {/* Botão para confirmar e iniciar */}
      {players.length > 0 && ( // Ou `players.length === gameConfig.numJogadores`
        <div className="text-center">
          <button
			onClick={handleEntendi}
            //onClick={handleStartGame} // <--- Este botão chama initializeGame
            disabled={players.length !== gameConfig.numJogadores} // Desabilita se não tiver o número certo
            className="bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-4 rounded-lg text-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirmar Jogadores e Iniciar Jogo
          </button>
        </div>
      )}
      <div className="mt-6 text-center">
        <button 
            onClick={() => goToStep('configuracao')} 
            className="text-gray-400 hover:text-gray-200"
        >
            ← Voltar para Configuração
        </button>
      </div>
    </div>
  );
}


