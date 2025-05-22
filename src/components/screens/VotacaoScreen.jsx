'use client';

import React, { useState, useEffect } from 'react';
import { useGameContext } from '@/context/GameContext';
import { Button } from '@/components/ui/button';

export function VotacaoScreen() {
  const { 
    players, 
    currentChief, 
    selectedPlayer, 
    registerVote, 
    finalizeVoting, 
    goToStep,
    gameConfig,
    votes
  } = useGameContext();
  
  const [votedPlayer, setVotedPlayer] = useState('');
  const [voteRegistered, setVoteRegistered] = useState(false);
  const [votingFinalized, setVotingFinalized] = useState(false);
  const [votingResult, setVotingResult] = useState(null);
  
  // Jogadores que AINDA NÃO REGISTRARAM SEU VOTO na UI nesta rodada
  const [playersYetToVoteUI, setPlayersYetToVoteUI] = useState([]);
  const [currentVoterIndexUI, setCurrentVoterIndexUI] = useState(0); // Índice para playersYetToVoteUI

  // Novo estado para a mensagem de confirmação
  const [showVoteConfirmation, setShowVoteConfirmation] = useState(false);
  const [votedPlayerNameForConfirmation, setVotedPlayerNameForConfirmation] = useState(''); // Para a mensagem
  
  const targetablePlayers = players.filter(p => !p.votedOut); // Em quem se pode votar
  
  useEffect(() => {
    // Quem precisa passar pela UI para registrar um voto:
    // Todos os não eliminados que AINDA NÃO TÊM seu nome como chave no objeto 'votes' do contexto.
    const uiVoters = players.filter(p => 
        !p.votedOut && 
        !votes[p.name] // Se o nome do jogador NÃO está como chave em 'votes', ele ainda não votou
    );
    
    // Opcional: Ordenar para consistência
    // uiVoters.sort((a, b) => a.name.localeCompare(b.name)); 

    setPlayersYetToVoteUI(uiVoters);
    setCurrentVoterIndexUI(0); 
    console.log("VotacaoScreen: Jogadores que ainda precisam registrar voto na UI:", uiVoters);
  }, [players, votes, showVoteConfirmation]); // Reage a mudanças em players ou quando um voto é adicionado a 'votes'

  const currentUIToVote = playersYetToVoteUI[currentVoterIndexUI];
  
  const handleVote = (votedPlayerName) => {
    if (!currentUIToVote) {
      console.error("VotacaoScreen: Não há um currentUIToVote definido.");
      return;
    }
    console.log(`VotacaoScreen: ${currentUIToVote.name} (tarefa completa: ${currentUIToVote.completedTask}) registrou voto em ${votedPlayerName}`);
    registerVote(currentUIToVote.name, votedPlayerName);
    
	setVotedPlayerNameForConfirmation(votedPlayerName); // Guarda para a mensagem
    setShowVoteConfirmation(true); // Mostra a mensagem de confirmação
	
    // Registra o voto no contexto. A validade será checada em finalizeVoting.
    registerVote(currentUIToVote.name, votedPlayerName);
    // O useEffect cuidará de atualizar playersYetToVoteUI e currentVoterIndexUI
  };
  
  const handleConfirmationAcknowledged = () => {
    setShowVoteConfirmation(false); // Esconde a mensagem, o useEffect vai re-avaliar e mostrar o próximo votante ou o botão de finalizar
    setVotedPlayerNameForConfirmation(''); // O useEffect [players, votes, showVoteConfirmation] cuidará de atualizar a UI para o próximo votante
    // ou para o estado de "todos votaram".
  };

  const handleFinalizeAndShowResults = () => {
    console.log("VotacaoScreen: Finalizando votação e mostrando resultados...");
    const votingOutcome = finalizeVoting(); // finalizeVoting no contexto usará player.completedTask
    console.log("VotacaoScreen: Resultado da votação (do contexto):", votingOutcome);
    goToStep('resultado');
  };

  if (showVoteConfirmation) {
    return (
      <div className="max-w-lg w-full bg-black/50 p-8 rounded-lg shadow-xl text-center">
        <h2 className="text-3xl font-bold text-green-400 mb-6">Voto Confirmado!</h2>
        <p className="text-xl text-gray-200 mb-4">
          <strong className="text-white">{currentUIToVote?.name} votou em {votedPlayerNameForConfirmation}</strong>.
        </p>
        <p className="text-lg text-yellow-300 mb-8">
          Por favor, devolva o aparelho para o Chefe.
        </p>
        <Button
          onClick={handleConfirmationAcknowledged}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-lg text-lg"
        >
          OK (Próximo Votante / Finalizar)
        </Button>
      </div>
    );
  }

  // Se não há mais jogadores para passar pela UI de votação
  if (playersYetToVoteUI.length === 0 && players.filter(p => !p.votedOut).length > 0) { 
    // (E há jogadores ativos, significando que a votação ocorreu)
     return (
      <div className="max-w-lg w-full bg-black/50 p-8 rounded-lg shadow-xl text-center">
        <h2 className="text-3xl font-bold text-yellow-400 mb-6">Votação Concluída</h2>
        <p className="text-gray-300 mb-8">Todos os jogadores registraram seus votos.</p>
        <Button
          onClick={handleFinalizeAndShowResults}
          className="bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-3 rounded-lg text-lg"
        >
          Ver Resultado da Votação
        </Button>
      </div>
    );
  }
  
  // Se não há jogadores ativos para votar (ex: todos eliminados, ou jogo começou sem jogadores suficientes - caso de erro)
  if (players.filter(p => !p.votedOut).length === 0) {
    return (
        <div className="max-w-lg w-full bg-black/50 p-8 rounded-lg shadow-xl text-center">
          <h2 className="text-3xl font-bold text-yellow-400 mb-6">Votação</h2>
          <p className="text-gray-300 mb-8">Não há jogadores para votar.</p>
          <Button // Mesmo sem votantes, precisa de uma forma de prosseguir
            onClick={handleFinalizeAndShowResults} // finalizeVoting lidará com 0 votos
            className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-8 py-3 rounded-lg text-lg"
          >
            Continuar
          </Button>
        </div>
      );
  }

  // Se currentUIToVote ainda é undefined mas playersYetToVoteUI não está vazio, algo está errado com o índice.
  // Mas a lógica acima deve cobrir o "carregando próximo votante".
  if (!currentUIToVote && playersYetToVoteUI.length > 0) {
      return <div className="text-white">Carregando próximo votante...</div>;
  }
  // Se não há currentUIToVote e playersYetToVoteUI está vazio, o bloco if acima (votacao concluida) já pegou.
  
  return (
    <div className="max-w-lg w-full bg-black/50 p-8 rounded-lg shadow-xl">
      <h2 className="text-3xl font-bold text-yellow-400 mb-2 text-center">Votação</h2>
      {currentUIToVote && ( // Adiciona verificação para currentUIToVote
        <p className="text-center text-gray-300 text-xl mb-8">
            <strong className="text-xl text-white">Agora é a vez de {currentUIToVote.name} votar!</strong>
            <br/>
            <span className="text-sm">
            (Tarefa Concluída: {currentUIToVote.completedTask ? 
                <span className="text-green-400">Sim</span> : 
                <span className="text-red-400">Não</span>
            } - Voto será {currentUIToVote.completedTask ? "válido" : "inválido"})
            </span>
            <br/>
            <strong className="text-white">Chefe {currentChief}, passe o aparelho para <strong className="text-xl text-white">{currentUIToVote.name}</strong> registrar o seu voto<br/>( E não veja em quem {currentUIToVote.name} vai votar!)</strong>
        </p>
      )}

      <div className="space-y-3">
        {targetablePlayers.map(player => (
          <Button
            key={player.id}
            onClick={() => handleVote(player.name)}
            variant={"secondary"} 
            className="w-full justify-start p-4 text-lg bg-red-500 hover:bg-red-700 text-white font-bold px-8 py-3 rounded-lg text-lg"
            // Regra: não pode votar em si mesmo? Ajuste se necessário.
            //disabled={currentUIToVote && currentUIToVote.name === player.name} 
          >
            Votar em: {player.name}
          </Button>
        ))}
      </div>
      
      {currentUIToVote && playersYetToVoteUI.length - (currentVoterIndexUI +1) > 0 && (
         <p className="text-center text-sm text-gray-400 mt-6">
            {playersYetToVoteUI.length - (currentVoterIndexUI + 1)} jogadores ainda precisam votar.
         </p>
      )}
      {currentUIToVote && playersYetToVoteUI.length - (currentVoterIndexUI +1) === 0 && (
          <p className="text-center text-sm text-yellow-300 mt-6">
              Você é o último a registrar o voto.
          </p>
      )}
    </div>
  );

  
  // Verificar se o jogador atual é o Chefe
  const isChief = selectedPlayer === currentChief;
  
  // Filtrar jogadores disponíveis para votação (excluindo o jogador atual e jogadores já eliminados)
  const availablePlayers = players.filter(player => 
    player.name !== selectedPlayer && !player.votedOut
  );
  
  // Verificar se o jogador já votou
  const hasVoted = !!votes[selectedPlayer];
  
  // Registrar voto
/*  const handleVote = (playerName) => {
    if (!voteRegistered) {
      const result = registerVote(selectedPlayer, playerName);
      if (result.success) {
        setVotedPlayer(playerName);
        setVoteRegistered(true);
      }
    }
  };*/
  
  // Finalizar votação (apenas para o Chefe)
  const handleFinalizeVoting = () => {
    if (isChief && !votingFinalized) {
      const result = finalizeVoting();
      setVotingResult(result);
      setVotingFinalized(true);
    }
  };
  
  // Ir para a tela de resultado
  const handleGoToResult = () => {
    goToStep('resultado');
  };
  
  // Verificar se todos os jogadores votaram
  const allPlayersVoted = players
    .filter(player => !player.votedOut)
    .every(player => !!votes[player.name]);
  
/*  return (
    <div className="max-w-3xl w-full bg-black/30 backdrop-blur-sm shadow-2xl border-yellow-500/30 rounded-lg p-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-center text-yellow-400 mb-2">Votação</h2>
		<p className="text-center text-gray-300">
          Jogador //<span className="text-lg font-medium">playerName</span> CORRIGIR!!!
        </p>
        <p className="text-center text-gray-300">
          Vote em quem você acha que é o Impostor para eliminá-lo da Equipe
        </p>
      </div>
      
      {!voteRegistered ? (
        <>
          <div className="mb-4">
            <p className="text-lg mb-2">Escolha um jogador para eliminar:</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {availablePlayers.map(player => {
              // Determinar se devemos mostrar o status da tarefa
              const showTaskStatus = isChief || gameConfig.votacaoNivel === 'visiveis';
              
              return (
                <button
                  key={player.id}
                  onClick={() => handleVote(player.name)}
                  className="p-4 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg text-left transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium">{player.name}</span>
                    
                    {showTaskStatus && (
                      <span className={`text-sm ${player.completedTask ? 'text-green-400' : 'text-red-400'}`}>
                        {player.completedTask ? 'Tarefa Concluída' : 'Tarefa Pendente'}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </>
      ) : (
        <div className="mb-6 p-4 bg-green-900/30 rounded-lg text-center">
          <p className="text-green-300 font-bold mb-2">Voto registrado!</p>
          <p className="text-white">Você votou em: <span className="font-bold">{votedPlayer}</span></p>
          
          {!isChief && (
            <p className="mt-2 text-gray-400 text-sm">
              Aguarde o Chefe finalizar a votação.
            </p>
          )}
        </div>
      )}
      
      {isChief && voteRegistered && !votingFinalized && (
        <div className="mb-6">
          <div className="p-4 bg-yellow-900/30 rounded-lg mb-4">
            <p className="text-yellow-300 font-bold">Como Chefe, você pode finalizar a votação.</p>
            <p className="mt-1 text-sm text-gray-300">
              {allPlayersVoted 
                ? 'Todos os jogadores já votaram.' 
                : 'Nem todos os jogadores votaram ainda.'}
            </p>
          </div>
          
          <Button 
            onClick={handleFinalizeVoting} 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg"
          >
            Finalizar Votação
          </Button>
        </div>
      )}
      
      {votingFinalized && (
        <div className="text-center">
          <Button 
            onClick={handleGoToResult} 
            className="bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-3 rounded-lg"
          >
            Ver Resultado
          </Button>
        </div>
      )}
    </div>
  );
}


*/
}

// Componente de Resultado da Votação
export function VotingResult({ result, players, showImpostorReveal }) {
  const { mostVotedPlayer, isTie, voteCounts } = result;
  
  // Encontrar o jogador eliminado
  const eliminatedPlayer = mostVotedPlayer 
    ? players.find(p => p.name === mostVotedPlayer) 
    : null;
  
  // Verificar se o jogador eliminado era um impostor
  const wasImpostor = eliminatedPlayer?.isImpostor || false;
  
  return;
}