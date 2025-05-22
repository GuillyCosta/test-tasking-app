'use client';

import React, { useState, useEffect } from 'react';
import { useGameContext } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { PlayerRole } from '@/components/GameComponents';
import { PlayerSelector } from '@/components/GameComponents';

export function RevelacaoPapelScreen() {
  const { 
    players, 
    setPlayers, // Precisaremos para marcar 'roleViewed'
    currentChief, // Para saber quem é o chefe atual
    selectedPlayer, // Ou se você tem um 'jogador atual' cuja revelação está sendo mostrada
    setSelectedPlayer, 
    goToStep,
    currentRound,
    crownCardChanged,
    impostors // Para determinar se o jogador é impostor
  } = useGameContext();
  
  const [showRole, setShowRole] = useState(false);
  const [roleViewed, setRoleViewed] = useState(false);
  
  console.log("----------------------------------------------------");
  console.log("RevelacaoPapelScreen: RENDERIZANDO/INICIANDO.");
  console.log("  - Players:", players);
  console.log("  - CurrentChief:", currentChief);
  console.log("  - SelectedPlayer:", selectedPlayer);
  
  const handleEntendi = () => {
    console.log("RevelacaoPapelScreen: Botão 'Entendi' clicado. Indo para a rodada.");
    goToStep('rodada'); // <--- ESTA LINHA É CRUCIAL
  };
  
  // Selecionar jogador
/*  const handleSelectPlayer = (playerName) => {
    setSelectedPlayer(playerName);
    setShowRole(true);
    setRoleViewed(false);
  };*/
  
  
  // Selecionar jogador para ver o papel
  const handleSelectPlayer = (playerName) => {
    const playerToView = players.find(p => p.name === playerName);
    // Só permite selecionar se o papel ainda não foi visto nesta rodada OU se é o primeiro jogador
    // (ou se você quiser permitir rever - ajuste a lógica aqui)
    if (playerToView && !playerToView.roleViewedThisRound) {
        setSelectedPlayer(playerName);
        setShowRole(true);
    } else if (playerToView && playerToView.roleViewedThisRound) {
        alert(`${playerName} já visualizou seu papel nesta rodada.`);
    }
  };
  
  
  // Marcar papel como visto
/*  const handleRoleViewed = () => {
    setRoleViewed(true);
    setShowRole(false);
  };*/
  
  // Marcar o papel do jogador como visto e limpar a seleção
  const handleRoleViewed = () => {
    console.log("RevelacaoPapelScreen: Papel visualizado por", selectedPlayer);
    
    // Marcar no objeto do jogador que o papel foi visto
    setPlayers(prevPlayers => 
      prevPlayers.map(p => 
        p.name === selectedPlayer ? { ...p, roleViewedThisRound: true } : p
      )
    );

    setShowRole(false); // Esconde o PlayerRole
    // setSelectedPlayer(''); // Limpa o jogador selecionado para voltar à tela de seleção,
                           // ou, se for o último, vai para a próxima etapa.
                           // Vamos adiar a limpeza de selectedPlayer para depois da verificação.
  };
  
  // Verificar se o jogador selecionado é o Chefe
  const isChief = selectedPlayer === currentChief;
  
  // Encontrar o jogador selecionado
  const player = players.find(p => p.name === selectedPlayer);
  
  // Verificar se o jogador é um impostor
  const isImpostor = player?.isImpostor || false;
  
  // Verificar se todos os jogadores ativos viram seus papéis
  const allPlayersViewedRoles = players
    .filter(p => !p.votedOut) // Apenas jogadores não eliminados
    .every(p => p.roleViewedThisRound);

  // Efeito para limpar selectedPlayer quando showRole se torna false,
  // exceto se todos já viram (para permitir o botão "Iniciar Rodada")
  useEffect(() => {
    if (!showRole && selectedPlayer && !allPlayersViewedRoles) {
      setSelectedPlayer(''); // Volta para a tela de seleção de jogador
    }
  }, [showRole, selectedPlayer, setSelectedPlayer, allPlayersViewedRoles]);


  // Lógica do que mostrar:
  let screenContent;

  if (showRole && player) {
    // 1. Mostrando o papel para o jogador selecionado
    screenContent = (
      <PlayerRole 
        playerName={player.name} 
        isImpostor={isImpostor} 
        isChief={isChief} 
        onConfirmRoleView={handleRoleViewed} // <--- PASSA A FUNÇÃO CORRETA AQUI
      />
    );
  } else if (allPlayersViewedRoles) {
    // 2. Todos viram, mostrar botão para iniciar a rodada
    screenContent = (
      <div className="text-center">
        <h3 className="text-2xl font-bold mb-6 text-green-400">Todos os jogadores visualizaram seus papéis!</h3>
        <Button 
          onClick={() => {
			console.log("RevelacaoPapelScreen: Botão 'Iniciar Rodada' clicado."); // <--- LOG IMPORTANTE
            // Opcional: resetar 'roleViewedThisRound' para todos os jogadores
            setPlayers(prevPlayers => prevPlayers.map(p => ({ ...p, roleViewedThisRound: false })));
			//const selectedPlayer = currentChief; //por enquanto
            goToStep('rodada');
          }} 
          className="bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-3 rounded-lg text-xl"
        >
          Iniciar Rodada
        </Button>
      </div>
    );
  } else {
    // 3. Ninguém selecionado OU nem todos viram, mostrar seletor de jogador
    screenContent = (
      <>
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-center text-yellow-400 mb-2">
            {currentRound === 1 ? 'Revelação de Papéis' : `Rodada ${currentRound}`}
          </h2>
          <p className="text-center text-gray-300">
            {currentChief === selectedPlayer && showRole ? 
             `Passe o dispositivo para o próximo jogador após clicar em "Entendi".` :
             `Cada jogador deve selecionar seu nome para ver seu papel.`
            }
          </p>
          
          {currentRound > 1 && (
            <div className="mt-4 p-3 bg-yellow-900/30 rounded-lg text-center">
              <p className="text-yellow-300 font-bold">
                O Chefe desta rodada é: <span className="text-white">{currentChief}</span>
              </p>
              {crownCardChanged && (
                <p className="mt-2 text-red-300">
                  Atenção: A carta que esconde a Coroa foi alterada!
                </p>
              )}
            </div>
          )}
        </div>
        
        {/* Passar apenas jogadores que ainda não viram o papel ou todos se quiser permitir rever */}
        <PlayerSelector 
            players={players.filter(p => !p.votedOut && !p.roleViewedThisRound)} 
            onSelectPlayer={handleSelectPlayer}
            disabledPlayerMessage="Já visualizou o papel" // Mensagem para jogadores que já viram (se você mostrar todos)
        />
        {players.filter(p => !p.votedOut && p.roleViewedThisRound).length > 0 && (
            <div className="mt-4 text-sm text-gray-400">
                Jogadores que já viram seu papel:  
                {players.filter(p => !p.votedOut && p.roleViewedThisRound).map(p => p.name).join(', ')}
            </div>
        )}
      </>
    );
  }
  
//  return (
 //   <div className="max-w-3xl w-full bg-black/30 backdrop-blur-sm shadow-2xl border-yellow-500/30 rounded-lg p-6">
 //     {screenContent}
 //   </div>
  //);

//--//
  return (
    <div className="max-w-3xl w-full bg-black/30 backdrop-blur-sm shadow-2xl border-yellow-500/30 rounded-lg p-6">
	{screenContent}
    </div>
  );
  // Dentro da função componente RevelacaoPapelScreen, antes do return
	console.log("RevelacaoPapelScreen: selectedPlayer:", selectedPlayer);
	console.log("RevelacaoPapelScreen: showRole:", showRole);
	console.log("RevelacaoPapelScreen: activePlayers:", activePlayers.map(p => ({name: p.name, viewed: p.roleViewedThisRound}))); // Supondo que activePlayers está definido
	console.log("RevelacaoPapelScreen: allPlayersViewedRoles:", allPlayersViewedRoles); // Supondo que allPlayersViewedRoles está definido
}


