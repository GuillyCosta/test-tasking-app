'use client';

import React, { useState } from 'react';
import { useGameContext } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export function ConfiguracaoScreen() {
  const { 
    gameConfig, 
    //setGameConfig, 
	configureGame,
    goToStep 
  } = useGameContext();
  
  const [numJogadores, setNumJogadores] = useState(gameConfig.numJogadores);
  const [numTarefas, setNumTarefas] = useState(gameConfig.numTarefas);
  const [timerMinutes, setTimerMinutes] = useState(Math.floor(gameConfig.timerDuration / 60));
  const [numImpostores, setNumImpostores] = useState(gameConfig.numImpostores);
  const [numComodos, setNumComodos] = useState(gameConfig.numComodos);
  //const [tipoBaralho, setTipoBaralho] = useState(gameConfig.tipoBaralho || 'uno');
  const [showImpostorReveal, setShowImpostorReveal] = useState(gameConfig.showImpostorReveal);
  //const [cartaCoroaNivel, setCartaCoroaNivel] = useState(gameConfig.cartaCoroaNivel || 'padrao');
  //const [votacaoNivel, setVotacaoNivel] = useState(gameConfig.votacaoNivel || 'visiveis');
  
  // Novo estado local para o modo de jogo
  const [nivelDif, setNivelDif] = useState(gameConfig.nivelDif || 'padrao_dif');
  
  const [nivelVot, setNivelVot] = useState(gameConfig.nivelVot || 'visiveis');
  
  const [gameMode, setGameMode] = useState(gameConfig.gameMode || 'padrao');
  
  const [tipoCartas, setTipoCartas] = useState(gameConfig.tipoCartas || 'padrao_uno');
  
  // =======================================================================
  // ADICIONE ESTAS LINHAS SE ELAS NÃO ESTIVEREM PRESENTES:
  // =======================================================================
  const [isLoading, setIsLoading] = useState(false); // Para feedback de carregamento
  const [error, setError] = useState(null);         // Para exibir mensagens de erro
  // =======================================================================

	const nivelDifOptions = [
		{ value: 'padrao_dif', label: 'Padrão', description: '1 Carta Coroa por jogo' },
		{ value: 'medio', label: 'Médio (Em Breve)', description: '1 Carta Coroa a cada 10 rodadas' },
		{ value: 'dificil', label: 'Difícil (Em Breve)', description: '1 Carta Coroa a cada 5 rodadas' },
		{ value: 'cataclisma', label: 'Cataclisma (Em Breve)', description: 'A Carta Coroa é alterada aleatoriamente pelo App)' },
	  ];
	  
	  const nivelVotOptions = [
		{ value: 'visiveis', label: 'Visíveis', description: 'Durante a votação' },
		{ value: 'ocultas', label: 'Ocultas', description: 'Durante a votação' },
		{ value: 'aleatorias', label: 'Aleatórias (Em Breve)', description: 'Durante a votação' },
	  ];


	const tipoCartasOptions = [
		{ value: 'padrao_uno', label: 'Uno (padrão)', description: 'Usar cartas do Jogo de Uno' },
		{ value: 'cartas_app', label: 'Cartas do App (Em Breve)', description: 'Usar Cartas geradas pelo App' },
		{ value: 'tasking', label: 'TasKing (Em Breve)', description: 'Usar cartas do Jogo TasKing' },
		{ value: 'comum', label: 'Baralho comum (Em Breve)', description: 'Usar cartas de baralho comum (4 naipes)' },
		{ value: 'outro', label: 'Outro (Em Breve)', description: 'Usar outro tipo de cartas (especificar na opção "Outro tipo")' },
	  ];

	const gameModeOptions = [
		{ value: 'padrao', label: 'Padrão', description: 'O jogo termina quando a Carta Coroa é encontrada.' },
		{ value: 'eliminacao', label: 'Eliminação', description: 'Termina com Coroa encontrada E impostor eliminado OU impostor encontra a Coroa.' },
		{ value: 'cooperativo', label: 'Cooperativo (Em Breve)', description: 'Sem impostor. Equipe Real vs. Tarefas e Timer.' },
		{ value: 'competitivo', label: 'Competitivo (Em Breve)', description: 'Equipes competem por Tarefas e Coroa.' },
		{ value: 'masters', label: 'Masters (Em Breve)', description: 'Competitivo com impostores em cada equipe.' },
	  ];

  // Validar e salvar configurações
  const handleSaveConfig = async() => {
    setIsLoading(true);
	setError(null);
	
	 // Por exemplo, modo 'cooperativo' não tem impostores.
    let finalNumImpostores = numImpostores;
    if (gameMode === 'cooperativo') {
        finalNumImpostores = 0;
    } else {
        // Sua lógica atual de validação de impostores
        const maxPossibleImpostors = Math.floor(numJogadores / 2);
        finalNumImpostores = Math.min(numImpostores, maxPossibleImpostors > 0 ? maxPossibleImpostors : (numJogadores > 1 ? 1 : 0) );
    }
	
    const timerDuration = timerMinutes * 60;
    
    // Validar número de impostores (não pode ser maior que metade dos jogadores)
    //const maxPossibleImpostors = Math.floor(numJogadores / 2);
	//const validNumImpostores = Math.min(numImpostores, maxPossibleImpostors > 0 ? maxPossibleImpostors : 1);
    // Atualizar configuração no contexto
    /*setGameConfig({
      numJogadores,
      timerDuration,
      numImpostores: validNumImpostores,
      numComodos,
      tipoBaralho,
      showImpostorReveal,
      cartaCoroaNivel,
      votacaoNivel
    });*/
	const newConfig = {
    // ...gameConfig, // Se quiser manter configurações antigas não presentes no formulário
    numJogadores,
	numTarefas,
    timerDuration,
    numImpostores: finalNumImpostores, // Use o valor validado
    numComodos,
    tipoCartas,
    showImpostorReveal,
    //cartaCoroaNivel,
	nivelDif,
    nivelVot,
    gameMode: gameMode // ADICIONA O MODO DE JOGO À CONFIGURAÇÃO
  };
    
    console.log("ConfiguracaoScreen: Salvando configuração:", newConfig);

    // Avançar para a tela de jogadores
    //goToStep('jogadores');
  //};*/
  
  try {
    // A chamada para o backend continua a mesma, para o backend definir papéis, etc.
    const response = await fetch('http://localhost:3001/api/game/setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newConfig), // Envia a nova configuração completa
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Erro do servidor: ${response.status}`);
    }

    const result = await response.json();
    console.log('Resposta do backend (setup):', result);

    // Agora chame configureGame com a configuração que você acabou de montar e enviar
    configureGame({
          ...newConfig,
          numImpostores: result.data?.numImpostoresDefinidoPeloBackend || finalNumImpostores 
      });  // <--- CHAME configureGame AQUI

    goToStep('jogadores');
  } catch (err) {
    console.error('Falha ao salvar configuração:', err);
    setError(err.message || 'Não foi possível conectar ao servidor.');
  } finally {
    setIsLoading(false);
  }
};
  
  return (
    <div className="max-w-3xl w-full bg-black/30 backdrop-blur-sm shadow-2xl border-yellow-500/30 rounded-lg p-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-center text-yellow-400 mb-2">Configuração do Jogo</h2>
        <p className="text-center text-gray-300">
          Defina os parâmetros para esta partida
        </p>
      </div>
      
      <div className="space-y-6">
        {/* Número de Jogadores */}
        <div>
          <label className="block text-lg font-medium mb-2">Número de Jogadores:</label>
          <div className="flex items-center">
            <input
              type="range"
              min="4"
              max="25"
              value={numJogadores}
              onChange={(e) => setNumJogadores(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <span className="ml-4 text-xl font-bold min-w-[2rem] text-center">{numJogadores}</span>
          </div>
        </div>
		
        {/* Número de Tarefas */}
        <div>
          <label className="block text-lg font-medium mb-2">Número de Tarefas por Rodada:</label>
          <div className="flex items-center">
            <input
              type="range"
              min="5"
              max="250"
              value={numTarefas}
              onChange={(e) => setNumTarefas(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <span className="ml-4 text-xl font-bold min-w-[2rem] text-center">{numTarefas}</span>
          </div>
        </div>
		
		 {/* Número de Cômodos */}
        <div>
          <label className="block text-lg font-medium mb-2">Número de Cômodos disponíveis:</label>
          <div className="flex items-center">
            <input
              type="range"
              min="3"
              max="10"
              value={numComodos}
              onChange={(e) => setNumComodos(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <span className="ml-4 text-xl font-bold min-w-[2rem] text-center">{numComodos}</span>
          </div>
        </div>
        
        {/* Timer (apenas minutos) */}
        <div>
          <label className="block text-lg font-medium mb-2">Duração do Timer por Rodada:</label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              min="1"
              max="10"
              value={timerMinutes}
              onChange={(e) => setTimerMinutes(parseInt(e.target.value))}
              className="w-20 p-2 bg-gray-800 border border-gray-700 rounded-lg text-center"
            />
            <span>minutos</span>
          </div>
        </div>
        
	  {/* Seção Tipo de Cartas */}
      <div className="mt-6">
        <label className="block text-lg font-medium mb-2">Tipo de Cartas:</label>
        <div className="space-y-3">
          {tipoCartasOptions.map(option => (
            <label 
              key={option.value} 
              className={`flex items-start p-3 rounded-lg border transition-all duration-150
                          ${tipoCartas === option.value 
                            ? 'bg-yellow-500/20 border-yellow-500 shadow-md' 
                            : 'bg-gray-800/60 border-gray-700 hover:border-yellow-600/70'}
                          ${['cartas_app', 'tasking', 'comum','outro'].includes(option.value) ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <input
                type="radio"
                name="tipoCartas"
                value={option.value}
				checked={tipoCartas === option.value}
				onChange={() => setTipoCartas(option.value)}
                disabled={['cartas_app', 'tasking', 'comum','outro'].includes(option.value)} // Desabilita os modos futuros
                className="h-5 w-5 mt-1 text-yellow-600 focus:ring-yellow-500 border-gray-500"
              />
              <div className="ml-3">
                <span className="text-md font-semibold block">{option.label}</span>
                <span className="text-xs text-gray-400 block">{option.description}</span>
              </div>
            </label>
          ))}
        </div>
      </div>
	  
	  {/* Seção Nível de Dificuldade - Alteração da Carta Coroa*/}
      <div className="mt-6">
        <label className="block text-xl font-medium mb-2">Nível de Dificuldade</label>
        <label className="block text-lg font-medium mb-2">Carta Coroa</label>
        <div className="space-y-3">
          {nivelDifOptions.map(option => (
            <label 
              key={option.value} 
              className={`flex items-start p-3 rounded-lg border transition-all duration-150
                          ${nivelDif === option.value 
                            ? 'bg-yellow-500/20 border-yellow-500 shadow-md' 
                            : 'bg-gray-800/60 border-gray-700 hover:border-yellow-600/70'}
                          ${['medio', 'dificil', 'cataclisma'].includes(option.value) ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <input
                type="radio"
                name="nivelDif"
                value={option.value}
                checked={nivelDif === option.value}
                onChange={() => setNivelDif(option.value)}
                disabled={['medio', 'dificil', 'cataclisma'].includes(option.value)} // Desabilita os modos futuros
                className="h-5 w-5 mt-1 text-yellow-600 focus:ring-yellow-500 border-gray-500"
              />
              <div className="ml-3">
                <span className="text-md font-semibold block">{option.label}</span>
                <span className="text-xs text-gray-400 block">{option.description}</span>
              </div>
            </label>
          ))}
        </div>
      </div>
	  
	  {/* Seção Nível de Dificuldade - Votação */}
      <div className="mt-6">
        <label className="block text-lg font-medium mb-2">Votação</label>
        <div className="space-y-3">
          {nivelVotOptions.map(option => (
            <label 
              key={option.value} 
              className={`flex items-start p-3 rounded-lg border transition-all duration-150
                          ${nivelVot === option.value 
                            ? 'bg-yellow-500/20 border-yellow-500 shadow-md' 
                            : 'bg-gray-800/60 border-gray-700 hover:border-yellow-600/70'}
                          ${['aleatorias'].includes(option.value) ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <input
                type="radio"
                name="nivelVot"
                value={option.value}
                checked={nivelVot === option.value}
                onChange={() => setNivelVot(option.value)}
                disabled={['aleatorias'].includes(option.value)} // Desabilita os modos futuros
                className="h-5 w-5 mt-1 text-yellow-600 focus:ring-yellow-500 border-gray-500"
              />
              <div className="ml-3">
                <span className="text-md font-semibold block">{option.label}</span>
                <span className="text-xs text-gray-400 block">{option.description}</span>
              </div>
            </label>
          ))}
        </div>
      </div>
        
		{/* Número de Impostores - desabilitar se o modo for cooperativo */}
        {gameMode !== 'cooperativo' && (
          <div className="mt-6">
            <label className="block text-lg font-medium mb-2">Número de Impostores:</label>
            <div className="flex items-center">
                <input
                type="range"
                min={gameMode === 'padrao' || gameMode === 'eliminacao' ? "1" : "0"} // Mínimo 1 para modos com impostor
                max={Math.max(1, Math.floor(numJogadores / 2))}
                value={numImpostores}
                onChange={(e) => setNumImpostores(parseInt(e.target.value))}
                disabled={isLoading || gameMode === 'cooperativo'}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                />
                <span className="ml-4 text-xl font-bold min-w-[2rem] text-center">{numImpostores}</span>
            </div>
          </div>
        )}
        {gameMode === 'cooperativo' && (
          <p className="mt-2 text-sm text-yellow-300">O modo Cooperativo não utiliza impostores.</p>
        )}
        </div>

        {/* Mostrar Revelação de Impostor */}
        <div>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showImpostorReveal}
              onChange={(e) => setShowImpostorReveal(e.target.checked)}
              className="h-5 w-5 rounded border-gray-300"
            />
            <span className="text-lg">Mostrar se o jogador eliminado era um Impostor</span>
          </label>
        </div>
		
        
      {/* Seção Modo de Jogo */}
      <div className="mt-6">
        <label className="block text-lg font-medium mb-2">Modo de Jogo:</label>
        <div className="space-y-3">
          {gameModeOptions.map(option => (
            <label 
              key={option.value} 
              className={`flex items-start p-3 rounded-lg border transition-all duration-150
                          ${gameMode === option.value 
                            ? 'bg-yellow-500/20 border-yellow-500 shadow-md' 
                            : 'bg-gray-800/60 border-gray-700 hover:border-yellow-600/70'}
                          ${['cooperativo', 'competitivo', 'masters'].includes(option.value) ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <input
                type="radio"
                name="gameMode"
                value={option.value}
                checked={gameMode === option.value}
                onChange={() => setGameMode(option.value)}
                disabled={['cooperativo', 'competitivo', 'masters'].includes(option.value)} // Desabilita os modos futuros
                className="h-5 w-5 mt-1 text-yellow-600 focus:ring-yellow-500 border-gray-500"
              />
              <div className="ml-3">
                <span className="text-md font-semibold block">{option.label}</span>
                <span className="text-xs text-gray-400 block">{option.description}</span>
              </div>
            </label>
          ))}
        </div>
      </div>
        
      <div className="mt-8 text-center">
        <Button 
          onClick={handleSaveConfig} 
          className="bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-3 rounded-lg text-lg"
        >
          Iniciar o Jogo
        </Button>
      </div>
    </div>
  );
}


