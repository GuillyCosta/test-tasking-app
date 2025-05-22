'use client';

import React from 'react';
import { useGameContext } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { VotingResult } from '@/components/screens/VotacaoScreen';

export function ResultadoScreen() {
  const { 
    players, 
    gameConfig, 
    startNewRound, 
    goToStep,
    lastVotingResult, // <--- PEGUE O RESULTADO DO CONTEXTO
    currentRound
  } = useGameContext();
    
  // Use o resultado da votação diretamente do contexto
  const votingOutcome = lastVotingResult; // Pode ser null se a tela for acessada sem uma votação prévia
  
  let message = "Aguardando resultado da votação...";
  let expelledPlayerName = null;
  let wasImpostorText = "";
  let displayVoteCounts = {};

  if (votingOutcome) {
    console.log("ResultadoScreen: Recebeu votingOutcome do contexto:", votingOutcome);
    displayVoteCounts = votingOutcome.voteCounts || {};

    if (votingOutcome.isTie) {
      message = "A votação terminou em empate! Ninguém foi eliminado desta rodada.";
    } else if (votingOutcome.mostVotedPlayerName) {
      expelledPlayerName = votingOutcome.mostVotedPlayerName;
      message = `${expelledPlayerName} foi o mais votado e está fora da partida!`;
      
      // Detalhes do jogador expulso
      const expelledDetails = votingOutcome.playerExpelledInfo;
      if (expelledDetails) {
        wasImpostorText = expelledDetails.isImpostor ? "(Era um Impostor!)" : "(Era Leal)";
      } else {
        // Fallback se playerExpelledInfo não estiver completo (embora devesse estar)
        const p = players.find(pl => pl.name === expelledPlayerName);
        if (p) wasImpostorText = p.isImpostor ? "(Era um Impostor!)" : "(Era Leal)";
      }
    } else {
      message = "Nenhum jogador foi eliminado na votação (nenhum voto válido ou outra condição).";
    }
  } else {
    console.warn("ResultadoScreen: lastVotingResult é null ou undefined.");
    // Isso não deveria acontecer se a navegação para esta tela for sempre após finalizeVoting
  }
  
  const handleStartNewRoundOrEndGame = () => {
    console.log("ResultadoScreen: Botão 'Próxima Rodada' clicado. Chamando startNewRound.");
    // Aqui você precisaria de uma lógica para verificar se o jogo realmente acabou
    // (ex: impostores venceram, leais venceram).
    // Se não, chama startNewRound(). Se sim, chama goToStep('telaDeFimDeJogoApropriada').
    // Por agora, vamos assumir que sempre inicia uma nova rodada a partir daqui
    // se não for uma tela de vitória final.
    
    // A função startNewRound no GameContext já deve chamar goToStep para 'revelacao' ou 'rodada'
	// Na ResultadoScreen, no handler do botão:
	const gameStatus = checkWinConditionsAfterVote();
	if (gameStatus.gameOver) {
	  setLastGameOutcome(gameStatus); // Um novo estado no contexto para o resultado final
	  goToStep(gameStatus.winner === 'leais' ? 'vitoriaFinalLeais' : 'vitoriaFinalImpostores'); // Novas telas de fim de jogo
	} else {
	  startNewRound();
	}
  };
  
  // O componente VotingResult provavelmente espera o objeto 'outcome' completo
  // ou partes dele. Ajuste as props conforme necessário para VotingResult.
  const resultForDisplayComponent = votingOutcome || { // Fallback se votingOutcome for null
      mostVotedPlayer: null,
      isTie: true,
      voteCounts: {},
      playerExpelledInfo: null
  };

  // Use o resultado da votação diretamente do contexto
  //const votingOutcome = lastVotingResult; // Pode ser null se a tela for acessada sem uma votação prévia
  
  // Obter o resultado da votação do contexto
  const votingResult = {
    mostVotedPlayer: players.find(p => p.votedOut && p.votedOutRound === currentRound)?.name || null,
    isTie: false, // Determinado durante a finalização da votação
    voteCounts: {} // Preenchido durante a finalização da votação
  };
  
  // Iniciar nova rodada
  const handleStartNewRound = () => {
    startNewRound();
  };
  
  return (
    <div className="max-w-3xl w-full bg-black/30 backdrop-blur-sm shadow-2xl border-yellow-500/30 rounded-lg p-6">
      <div className="bg-gray-800/50 rounded-lg p-6 max-w-md mx-auto">
      <h2 className="text-4xl font-bold text-center mb-6">Resultado da Votação</h2>
        <p className="text-center text-xl text-gray-300 mb-6">
          Veja quem foi eliminado nesta rodada
        </p>
		{/* Usando a mensagem processada */}
		<div className="text-center p-4 bg-gray-700/50 rounded-lg mb-6">
          <p className="text-3xl font-semibold mb-8">{message}</p>
          {expelledPlayerName && <p className="text-xl text-center text-red-400 font-semibold">{wasImpostorText}</p>}
        </div>
      </div>
      
      <VotingResult 
        result={votingResult} 
		result={resultForDisplayComponent} // Seu componente pode esperar uma estrutura específica

        // Melhor passar as partes individuais que ele precisa:

        mostVotedPlayerName={votingOutcome?.mostVotedPlayerName}

        isTie={votingOutcome?.isTie || false}

        voteCounts={displayVoteCounts}

        playerExpelledInfo={votingOutcome?.playerExpelledInfo}
        players={players} 
        showImpostorReveal={gameConfig.showImpostorReveal} 
      />
      
      <div className="mt-8 text-center">
        <Button 
          onClick={handleStartNewRoundOrEndGame} 
          className="bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-3 rounded-lg"
        >
          Iniciar Nova Rodada
        </Button>
      </div>
    </div>
  );
}


