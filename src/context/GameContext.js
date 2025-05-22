'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// Contexto do jogo
const GameContext = createContext();

// Provedor do contexto
export function GameProvider({ children }) {
  // Estado do jogo
  const [gameStep, setGameStep] = useState('inicio');
  const [gameConfig, setGameConfig] = useState({
    numJogadores: 5,
    numTarefas: 5,
    timerDuration: 60, // 1 minuto em segundos
    numImpostores: 1,
    numComodos: 5,
    tipoCartas: 'padrao_uno',//tipoBaralho 'padrao_uno',
    showImpostorReveal: true,
    nivelDif: 'padrao_dif', // 'padrao', 'medio', 'dificil', 'cataclisma' antes     cartaCoroaNivel 'padrao', // 'padrao', 'medio', 'dificil', 'cataclisma'
    nivelVot: 'visiveis', //, 'ocultas' antes votacaoNivel 'visiveis', // 'visiveis', 'ocultas'
    gameMode: 'padrao' // <--- NOVA PROPRIEDADE: 'padrao', 'eliminacao', 'cooperativo', 'competitivo', 'masters'
  });
  
  const [players, setPlayers] = useState([]);
  const [impostors, setImpostors] = useState([]);
  const [currentChief, setCurrentChief] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [rooms, setRooms] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [timerSeconds, setTimerSeconds] = useState(gameConfig.timerDuration);
  const [timerRunning, setTimerRunning] = useState(false);
  const [currentRound, setCurrentRound] = useState(1);
  const [votes, setVotes] = useState({});
  const [crownCard, setCrownCard] = useState(null);
  const [crownHint, setCrownHint] = useState('');
  const [crownFound, setCrownFound] = useState(false);
  const [crownFoundResult, setCrownFoundResult] = useState(null);
  const [hackActive, setHackActive] = useState(false);
  const [hackType, setHackType] = useState(null);
  const [crownCardChanged, setCrownCardChanged] = useState(false);
  const [lastCrownChangeRound, setLastCrownChangeRound] = useState(0);
  const [lastVotingResult, setLastVotingResult] = useState(null);
  
  // Timer
  useEffect(() => {
    let interval=null;
    
    if (timerRunning && timerSeconds > 0) {
    console.log("GameContext Timer useEffect: Iniciando intervalo. timerRunning:", timerRunning, "timerSeconds:", timerSeconds);
      interval = setInterval(() => {
        // Se o hack estiver ativo e for do tipo 'timer', o tempo passa mais rápido
        if (hackActive && hackType === 'timer') {
          setTimerSeconds(prev => Math.max(0, prev - 2));
        } else {
          setTimerSeconds(prev => Math.max(0, prev - 1));
        }
      }, 1000);
    } else if (timerSeconds === 0 && timerRunning) { // Adicionado timerRunning para garantir que só pare se estava rodando
    console.log("GameContext Timer useEffect: Timer chegou a zero. Parando. timerRunning:", timerRunning);
      setTimerRunning(false);
    }
    
    return () => {
		if (interval) {
		  // console.log("GameContext Timer useEffect: Limpando intervalo ID:", interval);
		  clearInterval(interval);
		}
	};
}, [timerRunning, timerSeconds, hackActive, hackType]);
  
  // Formatar tempo
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Iniciar timer
  const startTimer = () => {
	  console.log("GameContext: startTimer chamado. Definindo timerRunning para true. Duração inicial (timerSeconds):", gameConfig.timerDuration);
	  // Ao iniciar, garantir que o timer comece da duração configurada se não estiver rodando ou se resetado
	  // Ou apenas define como rodando se já tem um tempo parcial?
	  // Se for um "play" após um "pause", não deve resetar timerSeconds.
	  // Se for um "start" de uma nova rodada, resetTimer já deve ter sido chamado.
	  setTimerSeconds(prev => prev === 0 ? gameConfig.timerDuration : prev); // Se já zerou, reseta, senão continua
	  setTimerRunning(true);
  };
  
  // Pausar timer
  const pauseTimer = () => {
    console.log("GameContext: pauseTimer chamado. Definindo timerRunning para false.");
    setTimerRunning(false);
  };
  
  // Resetar timer
  const resetTimer = () => {
    console.log("GameContext: resetTimer chamado. Resetando timerSeconds para:", gameConfig.timerDuration, "e timerRunning para false.");
    setTimerSeconds(gameConfig.timerDuration);
    setTimerRunning(false);
  };
  
  // Navegar para um passo específico
  const goToStep = (step) => {
  console.log(`GameContext goToStep: Mudando para o step '${step}' (step anterior era '${gameStep}')`); // <--- LOG IMPORTANTE
  setGameStep(step);
};
  // Configurar o jogo
  const configureGame = (config) => {
    setGameConfig(config);
    setTimerSeconds(config.timerDuration);
  };
  
  // Adicionar jogador
  const addPlayer = (name) => {
    if (players.length < gameConfig.numJogadores && !players.some(p => p.name === name)) {
      setPlayers(prev => [...prev, { 
        id: Date.now().toString(), 
        name, 
        isImpostor: false,
        votedOut: false,
        completedTask: false,
        card: null
      }]);
      return true;
    }
    return false;
  };
  
  // Remover jogador
  const removePlayer = (id) => {
    setPlayers(prev => prev.filter(player => player.id !== id));
  };
  
  // Selecionar impostores aleatoriamente
  const selectImpostors = () => {
    const shuffledPlayers = [...players].sort(() => 0.5 - Math.random());
    const selectedImpostors = shuffledPlayers.slice(0, gameConfig.numImpostores);
    
    // Marcar jogadores como impostores
    const updatedPlayers = players.map(player => ({
      ...player,
      isImpostor: selectedImpostors.some(imp => imp.id === player.id)
    }));
    
    setPlayers(updatedPlayers);
    setImpostors(selectedImpostors.map(imp => imp.name));
  };
  
  // Selecionar chefe aleatoriamente
  const selectChief = () => {
    const availablePlayers = players.filter(player => !player.votedOut);
    if (availablePlayers.length > 0) {
      const randomIndex = Math.floor(Math.random() * availablePlayers.length);
      const newChief = availablePlayers[randomIndex].name;
      setCurrentChief(newChief);
      return newChief;
    }
    return null;
  };
  
  // Verificar se o jogador atual é o Chefe e um Impostor
  const isChiefAndImpostor = () => {
    const player = players.find(p => p.name === selectedPlayer);
    return player && player.name === currentChief && player.isImpostor;
  };
  
  // Gerar tarefas para os jogadores
  const generateTasks = () => {
    const taskDescriptions = [
      { description: "Encontre três cartas da mesma cor" },
      { description: "Colete uma sequência de três números consecutivos" },
      { description: "Reúna duas cartas com o mesmo símbolo" },
      { description: "Encontre uma carta de cada cor básica" },
      { description: "Colete cartas que somem exatamente 15 pontos" },
      { description: "Encontre duas cartas de ação (Pular, Inverter, +2)" },
      { description: "Reúna uma carta de cada tipo (número, ação, coringa)" },
      { description: "Colete três cartas com números pares" },
      { description: "Encontre três cartas com números ímpares" },
      { description: "Reúna cartas que formem uma escada (ex: 3, 4, 5)" }
    ];
    
    // Criar tarefas para cada jogador
    const newTasks = [];
    const availablePlayers = players.filter(player => !player.votedOut);
    
    // Atribuir tarefas aos jogadores
    availablePlayers.forEach((player, index) => {
      const taskIndex = index % taskDescriptions.length;
      newTasks.push({
        id: `task-${player.id}`,
        name: `Cômodo ${index + 1}`,
        responsible: player.name,
        task: taskDescriptions[taskIndex],
        completed: false,
        isCommon: false
      });
    });
    
    // Adicionar tarefa da área comum
    newTasks.push({
      id: 'task-common',
      name: 'Área Comum',
      responsible: 'Todos',
      task: null,
      completed: false,
      isCommon: true
    });
    
    setTasks(newTasks);
    return newTasks;
  };
  
  // Gerar cômodos para o jogo
  const generateRooms = () => {
    const newRooms = [];
    const availablePlayers = players.filter(player => !player.votedOut);
    
    // Criar cômodos para cada jogador
    availablePlayers.forEach((player, index) => {
      newRooms.push({
        id: `room-${index + 1}`,
        name: `Cômodo ${index + 1}`,
        responsible: player.name,
        cards: generateCards(5), // 5 cartas por cômodo
        isCommon: false
      });
    });
    //newRooms.push({ /* área comum */ });
    // Adicionar área comum
    newRooms.push({
      id: 'room-common',
      name: 'Área Comum',
      responsible: 'Todos',
      cards: [],
      isCommon: true
    });
    
    setRooms(newRooms);
    return newRooms;
  };
  
  // Gerar cartas para um cômodo
  const generateCards = (count) => {
    const colors = ['vermelho', 'azul', 'verde', 'amarelo'];
    const symbols = ['número', '+2', 'inverter', 'pular', 'coringa'];
    const cards = [];
    
    for (let i = 0; i < count; i++) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      const symbol = symbols[Math.floor(Math.random() * symbols.length)];
      const number = symbol === 'número' ? Math.floor(Math.random() * 10) : null;
      
      cards.push({
        id: `card-${Date.now()}-${i}`,
        color: symbol === 'coringa' ? 'preto' : color,
        symbol,
        number,
        description: symbol === 'número' 
          ? `${color} ${number}` 
          : `${color} ${symbol}`
      });
    }
    
    return cards;
  };
// Em src/context/GameContext.js

// Modifique selectCrownCard para aceitar 'generatedRooms' como argumento
const selectCrownCard = (generatedRooms) => {
  console.log("selectCrownCard: Recebeu generatedRooms:", generatedRooms);

  if (!generatedRooms || !Array.isArray(generatedRooms)) { // Verificação de segurança
	console.error("selectCrownCard: generatedRooms é inválido ou não é um array.");
	return null;
  }

  const playerRooms = generatedRooms.filter(room => room && !room.isCommon); // Adiciona verificação de 'room'
  console.log("selectCrownCard: playerRooms filtrados:", playerRooms);

  if (playerRooms.length === 0) {
	console.log("selectCrownCard: Nenhum cômodo de jogador encontrado (com base nos cômodos passados).");
	return null;
  }
  
  const randomRoomIndex = Math.floor(Math.random() * playerRooms.length);
  const selectedRoom = playerRooms[randomRoomIndex];
  console.log("selectCrownCard: selectedRoom:", selectedRoom);
  
  if (!selectedRoom.cards || selectedRoom.cards.length === 0) {
	console.log(`selectCrownCard: Cômodo "${selectedRoom.name}" não tem cartas.`);
	return null;
  }
  
  const randomCardIndex = Math.floor(Math.random() * selectedRoom.cards.length);
  const selectedCard = selectedRoom.cards[randomCardIndex];
  
  setCrownCard({ // Atualiza o estado global `crownCard`
	...selectedCard,
	roomId: selectedRoom.id
  });
  
  console.log("selectCrownCard: Coroa escondida na carta:", selectedCard, "no cômodo:", selectedRoom.name);
  return { // Retorna os detalhes da carta coroa selecionada
	card: selectedCard,
	roomId: selectedRoom.id
  };
};
  //};
  // Verificar se a carta coroa deve ser alterada com base no nível escolhido
  const shouldChangeCrownCard = () => {
    switch (gameConfig.cartaCoroaNivel) {
      case 'padrao_dif':
        return false; // Nunca muda
      case 'medio':
        return currentRound > 0 && currentRound % 10 === 0 && currentRound !== lastCrownChangeRound;
      case 'dificil':
        return currentRound > 0 && currentRound % 5 === 0 && currentRound !== lastCrownChangeRound;
      case 'cataclisma':
        // 20% de chance de mudar a cada rodada
        return Math.random() < 0.2 && currentRound !== lastCrownChangeRound;
      default:
        return false;
    }
  };
  
  // Alterar a carta coroa
  const changeCrownCard = () => {
    const result = selectCrownCard();
    if (result) {
      setCrownCardChanged(true);
      setLastCrownChangeRound(currentRound);
      return true;
    }
    return false;
  };
  
  // Gerar dica sobre a coroa
  const generateCrownHint = (currentCrownCard) => { // <--- Aceita currentCrownCard
    console.log("generateCrownHint: Recebeu currentCrownCard:", currentCrownCard);
	if (!currentCrownCard) { // Usa o parâmetro
    console.log("generateCrownHint: currentCrownCard (parâmetro) é null/undefined. Nenhuma dica.");
    setCrownHint(''); 
    return '';
  }
    /*if (!crownCard) {
		console.log("generateCrownHint: crownCard é null. Nenhuma dica.");
		setCrownHint(''); 
		return '';
	}
    let hint = '';
    const hintTypes = [
      'cor',
      'símbolo',
      'número',
      'comparação'
    ];*/
  // ... lógica para gerar `hint` usando `currentCrownCard.color`, `currentCrownCard.symbol`, etc. ...
  let hint = '';
  const hintTypes = ['cor', 'símbolo', 'número', 'comparação'];
  const hintType = hintTypes[Math.floor(Math.random() * hintTypes.length)];
  
  switch (hintType) {
    case 'cor':
      hint = `A Inteligência informa que a carta de cor ${currentCrownCard.color} esconde a Coroa.`;
      break;
    // ... (adapte os outros cases para usar currentCrownCard.symbol, currentCrownCard.number) ...
    case 'símbolo':
        hint = `A Inteligência recebeu um reporte de que a Coroa foi vista em uma carta de símbolo ${currentCrownCard.symbol}.`;
        break;
    case 'número':
        if (currentCrownCard.number !== null) {
            hint = `A Inteligência aponta que a Coroa está em uma carta com o número ${currentCrownCard.number}.`;
        } else {
            hint = `A Inteligência aponta que a Coroa está em uma carta especial sem número.`;
        }
        break;
    case 'comparação':
        if (currentCrownCard.number !== null) {
            const comparison = Math.random() > 0.5 ? 'maior' : 'menor';
            const compareNumber = comparison === 'maior' 
            ? Math.max(0, currentCrownCard.number - Math.floor(Math.random() * 3) - 1)
            : Math.min(9, currentCrownCard.number + Math.floor(Math.random() * 3) + 1);
            
            hint = `A Inteligência aponta que a Coroa está em uma carta com número ${comparison} que ${compareNumber}.`;
        } else {
            hint = `A Inteligência aponta que a Coroa está em uma carta especial.`;
        }
        break;
    default: // Adicione um default para garantir que 'hint' seja sempre uma string
        hint = "A Inteligência está processando a informação sobre a Coroa...";
        break;
  }
  console.log("generateCrownHint: Dica efetivamente gerada:", hint);
  setCrownHint(hint); // Atualiza o estado global crownHint
  return hint;
};
  
  // Marcar tarefa como concluída
  const markTaskCompleted = (taskId, completed) => {
    // Se o hack estiver ativo e for do tipo 'tasks', inverte o status
    if (hackActive && hackType === 'tasks') {
      completed = !completed;
    }
    
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, completed } : task
    ));
    
    // Atualizar o status de conclusão da tarefa do jogador
    const task = tasks.find(t => t.id === taskId);
    if (task && !task.isCommon) {
      setPlayers(prev => prev.map(player => 
        player.name === task.responsible ? { ...player, completedTask: completed } : player
      ));
    }
  };
  
  // Pegar uma carta de um cômodo
  const takeCardFromRoom = (roomId, cardId, playerName) => {
    // Verificar se o jogador já tem uma carta
    const player = players.find(p => p.name === playerName);
    if (player && player.card) {
      return { success: false, error: 'Você já está carregando uma carta' };
    }
    
    // Encontrar o cômodo e a carta
    const room = rooms.find(r => r.id === roomId);
    if (!room) return { success: false, error: 'Cômodo não encontrado' };
    
    const cardIndex = room.cards.findIndex(c => c.id === cardId);
    if (cardIndex === -1) return { success: false, error: 'Carta não encontrada' };
    
    // Remover a carta do cômodo
    const card = room.cards[cardIndex];
    const updatedRooms = rooms.map(r => {
      if (r.id === roomId) {
        return {
          ...r,
          cards: r.cards.filter(c => c.id !== cardId)
        };
      }
      return r;
    });
    
    // Dar a carta ao jogador
    const updatedPlayers = players.map(p => {
      if (p.name === playerName) {
        return {
          ...p,
          card
        };
      }
      return p;
    });
    
    setRooms(updatedRooms);
    setPlayers(updatedPlayers);
    
    return { success: true, card };
  };
  
  // Deixar uma carta em um cômodo
  const leaveCardInRoom = (roomId, playerName) => {
    // Verificar se o jogador tem uma carta
    const player = players.find(p => p.name === playerName);
    if (!player || !player.card) {
      return { success: false, error: 'Você não está carregando nenhuma carta' };
    }
    
    // Encontrar o cômodo
    const room = rooms.find(r => r.id === roomId);
    if (!room) return { success: false, error: 'Cômodo não encontrado' };
    
    // Adicionar a carta ao cômodo
    const card = player.card;
    const updatedRooms = rooms.map(r => {
      if (r.id === roomId) {
        return {
          ...r,
          cards: [...r.cards, card]
        };
      }
      return r;
    });
    
    // Remover a carta do jogador
    const updatedPlayers = players.map(p => {
      if (p.name === playerName) {
        return {
          ...p,
          card: null
        };
      }
      return p;
    });
    
    setRooms(updatedRooms);
    setPlayers(updatedPlayers);
    
    return { success: true };
  };
  
  // Trocar cartas entre jogadores
  const tradeCardsBetweenPlayers = (player1Name, player2Name) => {
    const player1 = players.find(p => p.name === player1Name);
    const player2 = players.find(p => p.name === player2Name);
    
    if (!player1 || !player2) {
      return { success: false, error: 'Jogador não encontrado' };
    }
    
    if (!player1.card && !player2.card) {
      return { success: false, error: 'Nenhum dos jogadores tem carta para trocar' };
    }
    
    // Trocar as cartas
    const updatedPlayers = players.map(p => {
      if (p.name === player1Name) {
        return { ...p, card: player2.card };
      }
      if (p.name === player2Name) {
        return { ...p, card: player1.card };
      }
      return p;
    });
    
    setPlayers(updatedPlayers);
    
    return { success: true };
  };
  
  // Registrar voto
  const registerVote = (voterName, votedName) => {
    // Verificar se o jogador completou sua tarefa
    const voter = players.find(p => p.name === voterName);
    
    // Registrar o voto independentemente de ter completado a tarefa ou não
    setVotes(prev => ({
      ...prev,
      [voterName]: votedName
    }));
    
    return { success: true };
  };
  
  // Finalizar votação e determinar resultado
// Em src/context/GameContext.js

const finalizeVoting = () => {
  console.log("GameContext: Finalizando votos. Votos brutos:", votes);

  const voteCounts = {};
  let validVotesCast = 0;

  Object.entries(votes).forEach(([voterName, votedName]) => {
    const voter = players.find(p => p.name === voterName);
    if (voter && voter.completedTask) {
      console.log(`Voto de ${voterName} em ${votedName} é VÁLIDO.`);
      voteCounts[votedName] = (voteCounts[votedName] || 0) + 1;
      validVotesCast++;
    } else if (voter) {
      console.log(`Voto de ${voterName} em ${votedName} é INVÁLIDO.`);
    } else {
      console.warn(`finalizeVoting: Votante ${voterName} não encontrado.`);
    }
  });

  console.log("GameContext: Contagem de votos válidos:", voteCounts, "Total de votos válidos:", validVotesCast);

  let determinedMostVotedPlayerName = null; // Variável local para o cálculo
  let determinedMaxVotes = 0;
  let determinedIsTie = false;

  if (validVotesCast > 0) {
    // Encontrar o número máximo de votos que qualquer jogador recebeu
    for (const playerName in voteCounts) {
      if (voteCounts[playerName] > determinedMaxVotes) {
        determinedMaxVotes = voteCounts[playerName];
      }
    }

    // Coletar todos os jogadores que alcançaram esse número máximo de votos
    const playersWithMaxVotes = [];
    for (const playerName in voteCounts) {
      if (voteCounts[playerName] === determinedMaxVotes) {
        playersWithMaxVotes.push(playerName);
      }
    }

    console.log("GameContext: determinedMaxVotes:", determinedMaxVotes, "playersWithMaxVotes:", playersWithMaxVotes);

    if (playersWithMaxVotes.length === 1 && determinedMaxVotes > 0) {
      // Apenas UM jogador teve o número máximo de votos (e houve pelo menos um voto)
      determinedMostVotedPlayerName = playersWithMaxVotes[0];
      determinedIsTie = false;
      console.log("GameContext: Um jogador mais votado:", determinedMostVotedPlayerName);
    } else if (playersWithMaxVotes.length > 1 && determinedMaxVotes > 0) {
      // Múltiplos jogadores empataram com o número máximo de votos
      determinedMostVotedPlayerName = null; // Ninguém é eliminado em caso de empate
      determinedIsTie = true;
      console.log("GameContext: Empate entre múltiplos jogadores. Ninguém eliminado.");
    } else {
      // Nenhum voto válido ou maxVotes foi 0 (não deveria acontecer se validVotesCast > 0 e voteCounts tem itens)
      // Este caso cobre se algo deu muito errado ou se todos os votos foram para jogadores diferentes com 1 voto cada
      // e a sua regra de empate não considera isso (a lógica acima já deveria pegar "empate entre múltiplos").
      // Se todos têm 1 voto e há mais de 1 jogador votado, playersWithMaxVotes.length > 1.
      // Este 'else' é mais para o caso de validVotesCast > 0 mas determinedMaxVotes acaba sendo 0, o que é estranho.
      determinedMostVotedPlayerName = null;
      determinedIsTie = true; // Considera empate
      console.log("GameContext: Nenhum jogador claramente mais votado ou nenhum voto. Considerado empate.");
    }
  } else {
    // Nenhum voto válido foi computado
    determinedMostVotedPlayerName = null;
    determinedIsTie = true; // Considera empate
    console.log("GameContext: Nenhum voto válido. Ninguém eliminado.");
  }
  
  let playerExpelledInfo = null;
  if (determinedMostVotedPlayerName) { // Usa a variável local calculada
    console.log("GameContext: Jogador a ser expulso:", determinedMostVotedPlayerName);
    setPlayers(prevPlayers => prevPlayers.map(player => {
      if (player.name === determinedMostVotedPlayerName) {
        playerExpelledInfo = { ...player, votedOut: true, wasImpostor: player.isImpostor, votedOutRound: currentRound };
        return { ...player, votedOut: true, votedOutRound: currentRound };
      }
      return player;
    }));
    
    if (hackActive) {
        console.log("GameContext: Desativando hack após expulsão.");
        setHackActive(false);
        setHackType(null);
    }
  }

  console.log("GameContext: Limpando votos.");
  setVotes({});
  
  const outcome = {
    mostVotedPlayerName: determinedMostVotedPlayerName, // Usa a variável local
    isTie: determinedIsTie,                             // Usa a variável local
    voteCounts: voteCounts,
    playerExpelledInfo: playerExpelledInfo
  };

  setLastVotingResult(outcome); // Atualiza o estado do contexto
  console.log("GameContext: Resultado da finalização da votação (armazenado):", outcome);
  return outcome;
};
  
  // Iniciar nova rodada
  const startNewRound = () => {
  console.log("GameContext: Iniciando nova rodada. Rodada anterior:", currentRound);
	  
	let newCrownCardDetails = null;
    // Incrementar contador de rodadas
    setCurrentRound(prev => prev + 1);
    console.log("GameContext startNewRound: Nova rodada será:", currentRound + 1); // currentRound ainda não atualizou aqui

    
    // Resetar timer
    resetTimer();
    
    // Resetar status de conclusão de tarefas
    setPlayers(prev => prev.map(player => ({
      ...player,
      completedTask: false,
      roleViewedThisRound: false // Se você usa isso na tela de revelação
    })));
    console.log("GameContext startNewRound: Status de tarefas e visualização de papéis resetados.");
    
    // Gerar novas tarefas
    generateTasks();
    
    // Verificar se a carta coroa deve ser alterada
    if (shouldChangeCrownCard()) {
		const newChangedCard = changeCrownCard(); // changeCrownCard chama selectCrownCard e atualiza o ESTADO crownCard
	// Precisamos que changeCrownCard retorne os detalhes da nova carta
    // Para isso, `changeCrownCard` precisa ser ajustado:
    // const changeCrownCard = () => {
    //   const result = selectCrownCard(rooms); // Passa o estado 'rooms' ou os cômodos atuais
      //changeCrownCard();
		  if (newChangedCard) {
		  setCrownCard(newChangedCard); // ATUALIZA o estado da carta coroa
		  cartaAtualParaDica = newChangedCard; // Usa a nova carta para a dica imediata
		  setCrownCardChanged(true); // Sinaliza que mudou
		  setLastCrownChangeRound(currentRound + 1); // Usa o valor que currentRound TERÁ
		  console.log("GameContext startNewRound: Carta coroa ALTERADA para:", newChangedCard);
		} else {
		  setCrownCardChanged(false);
		  console.warn("GameContext startNewRound: Deveria mudar a carta coroa, mas falhou em selecionar uma nova.");
		}
    } else {
      setCrownCardChanged(false);
      console.log("GameContext startNewRound: Carta coroa NÃO foi alterada.");
    }
    
    // Gerar nova dica sobre a coroa
    generateCrownHint();//(cardToHint); 
    console.log("GameContext startNewRound: Nova dica da coroa gerada.");
    
    // Selecionar novo chefe
    selectChief();
     
	// 7. Selecionar um NOVO CHEFE (entre jogadores não eliminados)
    const newChief = selectChief(); // Sua função selectChief já deve pegar dos players.filter(p => !p.votedOut)
    console.log("GameContext startNewRound: Novo Chefe selecionado:", newChief);
	
    console.log("GameContext startNewRound: Indo para a tela de revelação de papéis/chefe.");
    // Ir para a tela de revelação de papel
    goToStep('revelacao-papel');
  };
  
  // Hackear o app (função para o impostor)
  const hackApp = () => {
    if (!isChiefAndImpostor()) {
      return { success: false, error: 'Apenas o Chefe Impostor pode hackear o app' };
    }
    
    // Escolher um tipo de hack aleatório
    const hackTypes = ['timer', 'tasks', 'votes'];
    const selectedHackType = hackTypes[Math.floor(Math.random() * hackTypes.length)];
    
    setHackActive(true);
    setHackType(selectedHackType);
    
    return { 
      success: true, 
      type: selectedHackType 
    };
  };
  
  // Declarar que encontrou a coroa
  const declareFoundCrown = (cardDescription) => {
    // Verificar se a descrição da carta corresponde à carta coroa
    //const isCorrect = crownCard && cardDescription.toLowerCase() === crownCard.description.toLowerCase();
    // Certifique-se que crownCard (o estado) está definido e tem a propriedade 'description'
    const cartaCoroaReal = crownCard; // Pega do estado
    console.log("declareFoundCrown: Comparando", cardDescription, "com", cartaCoroaReal?.description);
	if (!cartaCoroaReal) {
      console.error("declareFoundCrown: Estado crownCard é null. Impossível verificar.");
      return { success: false, correct: false, message: "Erro interno: Carta coroa não definida." };
    }

    // Comparação (ignorando maiúsculas/minúsculas e talvez espaços extras)
    const isCorrect = cartaCoroaReal.description && cardDescription.trim().toLowerCase() === cartaCoroaReal.description.trim().toLowerCase();
    if (isCorrect) {
      console.log("declareFoundCrown: CORRETO!");
      setCrownFound(true);
      setCrownFoundResult({
        playerName: selectedPlayer, // Ou currentChief se for sempre ele
        isImpostor: players.find(p => p.name === selectedPlayer)?.isImpostor || false,
        actionTaken: null
      });
      
      return {
        success: true,
        correct: true,
        message: "Parabéns! Você encontrou a Coroa!"
      };
    } else {
        console.log("declareFoundCrown: INCORRETO.");
      return {
        success: true,
        correct: false,
        message: "Esta não é a carta que esconde a Coroa. Continue procurando!"
      };
    }
  };
  
// Em GameContext.js

const initializeGame = () => {
  console.log("----------------------------------------------------");
  console.log("GameContext: INÍCIO de initializeGame. Estado gameStep atual:", gameStep);
  
  if (players.length < gameConfig.numJogadores) { // Validação de jogadores
    console.error("GameContext initializeGame: Não há jogadores suficientes. Necessário:", gameConfig.numJogadores, "Atual:", players.length);
    return false; 
  }

  console.log("GameContext initializeGame: Selecionando impostores e chefe...");
  selectImpostors();       
  const firstChief = selectChief(); 
  console.log("GameContext initializeGame: Impostores selecionados. Primeiro Chefe:", firstChief);
  
  console.log("GameContext initializeGame: Gerando tarefas...");
  const newGeneratedTasks = generateTasks(); 
  console.log("GameContext initializeGame: Tarefas geradas:", newGeneratedTasks);

  console.log("GameContext initializeGame: Gerando cômodos...");
  const newGeneratedRooms = generateRooms(); 
  console.log("GameContext initializeGame: Cômodos gerados:", newGeneratedRooms);
  
  console.log("GameContext initializeGame: Selecionando carta coroa...");
  const crownSelectionResult = selectCrownCard(newGeneratedRooms); // Chama SÓ UMA VEZ
  
  if (!crownSelectionResult || !crownSelectionResult.card) { 
    console.error("GameContext initializeGame: Falha crítica ao selecionar a carta coroa. Abortando.");
    generateCrownHint(null); // Limpa a dica como precaução
    return false; 
  }
  console.log("GameContext initializeGame: Carta coroa selecionada:", crownSelectionResult.card);
  
  console.log("GameContext initializeGame: Gerando dica da coroa...");
  const dicaGerada = generateCrownHint(crownSelectionResult.card); // Chama SÓ UMA VEZ com a carta
  console.log("GameContext initializeGame: Dica gerada:", dicaGerada);
  
  console.log("GameContext: Jogo inicializado com sucesso.");
  console.log("  - Primeiro Chefe:", firstChief);
  console.log("  - Carta Coroa selecionada (objeto):", crownSelectionResult.card);
  console.log("  - Dica inicial:", dicaGerada);
  // O estado 'crownCard' (global) será atualizado por setCrownCard dentro de selectCrownCard
  // O estado 'crownHint' (global) será atualizado por setCrownHint dentro de generateCrownHint

  console.log("GameContext initializeGame: Resetando timer...");
  resetTimer(); 

  console.log("GameContext initializeGame: Indo para o step 'revelacao'...");
  goToStep('revelacao'); 
  return true; 
};
  
  
// ... todo o seu código anterior, incluindo a função chooseCrownAction se você a descomentou
// Se a função chooseCrownAction ainda não está completa, você pode comentá-la corretamente por enquanto:

  const chooseCrownAction = (action) => {
    console.log(`GameContext: chooseCrownAction chamada com ação: "${action}"`);
    if (!crownFound || !crownFoundResult) { // crownFoundResult deve ter playerName
    console.error("chooseCrownAction: Coroa não encontrada ou detalhes do jogador ausentes.");
    return { success: false, message: 'A Coroa ainda não foi encontrada ou jogador não identificado.' };
  }
  const playerWhoFoundName = crownFoundResult.playerName;
  const player = players.find(p => p.name === playerWhoFoundName);

  if (!player) {
    console.error("chooseCrownAction: Jogador que encontrou a coroa não localizado:", playerWhoFoundName);
    return { success: false, message: 'Erro ao identificar o jogador.' };
  }

  console.log(`GameContext: Jogador ${player.name} (Impostor: ${player.isImpostor}) escolheu a ação: ${action}`);
  
  // Atualizar o crownFoundResult para incluir a ação tomada
  setCrownFoundResult(prev => ({ ...prev, actionTaken: action, finalMessage: `Jogador ${player.name} escolheu: ${action}` }));

  // Determinar o resultado do jogo com base na ação, papel do jogador, etc.
  // Esta é a parte mais complexa que você precisará expandir com base nas suas regras.
  let gameEndMessage = `Ação "${action}" registrada para ${player.name}.`;
  let winner = null; // 'real', 'nobres', 'federalistas', 'jogador_individual'

  if (action === 'revelarEquipe') {
    if (!player.isImpostor) {
      gameEndMessage = `${player.name} revelou a Coroa para a Equipe Real! A Equipe Real vence!`;
      winner = 'real'; // Ou um identificador para a equipe leal

	  // Atualizar o estado do jogo para refletir o fim (se aplicável)
	  // setGameOutcome({ winner, message: gameEndMessage, winningTeam: 'leais' });
	  
	  // GUARDE INFORMAÇÕES RELEVANTES QUE A TELA DE VITÓRIA POSSA PRECISAR
	  // (Muitas já estão no contexto, como `players`, `impostors`, `crownCard`)
	  // `crownFoundResult` já tem o nome de quem encontrou.

	  console.log("GameContext: Vitória da Equipe Leal! Indo para tela de vitória.");
      setIsGameOver(true); // Se você implementou este estado
	  goToStep('vitoriaEquipe'); // <--- NOVO gameStep 
      return { success: true, message: "Vitória da Equipe!", gameEnded: true }; // Sinaliza fim de jogo

    } else {
	  console.log("GameContext: Vitória dos Impostores! Indo para tela de vitória.");
      gameEndMessage = `${player.name} (Impostor) conseguiu capturar a Coroa para os Impostores! O Impostor vence!`;
      setIsGameOver(true);
      goToStep('vitoriaImpostores'); // Exemplo
      return { success: true, message: "Vitória dos Impostores!", gameEnded: true };
	  
      // Aqui você pode decidir se o jogo continua ou se há outra consequência
    }
  } else if (action === 'tornarReiSozinho') {
    gameEndMessage = `${player.name} decidiu tomar a Coroa para si e se tornou o novo Rei! Vitória individual!`;
    winner = 'jogador_individual';
    setIsGameOver(true);
    goToStep('vitoriaIndividual'); // Exemplo de outra tela final
    return { success: true, message: "Vitória Individual!", gameEnded: true };
  } else {
    console.log("GameContext: Ação da coroa realizada, mas o jogo continua.");
    // Atualizar `crownFoundResult` com a ação tomada, etc.
    setCrownFoundResult(prev => ({ ...prev, actionTaken: action, finalMessage: `Ação "${action}" realizada.` }));
    return { 
      success: true, 
      message: `Ação "${action}" realizada. O jogo continua.`, 
      gameEnded: false // Sinaliza que o jogo NÃO terminou
    };
  }
  // Adicione mais 'else if' para 'entregarNobres', 'entregarFederalistas'
  // e a lógica de vitória correspondente.

  // Atualizar o estado do jogo para refletir o fim (se aplicável)
  // Você pode querer um novo estado como `gameOutcome` ou `winningTeam`
  // setGameOutcome({ winner, message: gameEndMessage }); // Exemplo

  // Mudar para uma tela de fim de jogo
  //goToStep('resultado'); // Ou uma tela específica de 'fimDeJogo'

  return { 
    success: true, 
    message: gameEndMessage,
    actionTaken: action 
  };
  };

// Exemplo em GameContext.js
const checkWinConditionsAfterVote = () => {
  const leaisAtivos = players.filter(p => !p.isImpostor && !p.votedOut);
  const impostoresAtivos = players.filter(p => p.isImpostor && !p.votedOut);

  console.log("checkWinConditions: Leais Ativos:", leaisAtivos.length, "Impostores Ativos:", impostoresAtivos.length);

  if (impostoresAtivos.length === 0) {
    return { gameOver: true, winner: 'leais', message: "Todos os impostores foram eliminados! Equipe Leal vence!" };
  }
  if (impostoresAtivos.length >= leaisAtivos.length) {
    return { gameOver: true, winner: 'impostores', message: "Os impostores dominaram! Impostores Vencem!" };
  }
  // Adicione outras condições de vitória/derrota aqui
  return { gameOver: false, winner: null, message: "" }; // Jogo continua
};
// Não se esqueça de expor checkWinConditionsAfterVote no Provider value.

  // =======================================================================
  // PARTE FUNDAMENTAL FALTANTE: O RETURN DO PROVIDER
  // =======================================================================
  return (
    <GameContext.Provider value={{
      // Estados e Setters que você quer expor:
      gameStep,
      goToStep, // Função para mudar gameStep
      gameConfig,
      configureGame, // ou setGameConfig se preferir expor o setter diretamente
      players,
      addPlayer,
      removePlayer,
      setPlayers, // Se precisar manipular players diretamente de fora
      impostors, // setImpostors não costuma ser exposto, é interno
      currentChief, // setCurrentChief pode ser interno se gerenciado por selectChief
      selectedPlayer,
      setSelectedPlayer,
      rooms, // setRooms é interno
      tasks, // setTasks é interno
      markTaskCompleted,
      timerSeconds,
      timerRunning,
      formatTime,
      startTimer,
      pauseTimer,
      resetTimer,
      currentRound, // startNewRound gerencia isso
      votes, // registerVote gerencia isso
      // crownCard, // Geralmente secreto, mas útil para debug ou certas lógicas
      crownHint, // generateCrownHint gerencia isso
      crownFound, // ESTADO IMPORTANTE
      setCrownFound, // A função declareFoundCrown gerencia isso
      crownFoundResult,
      hackActive, // hackApp gerencia isso
      hackType,   // hackApp gerencia isso
      // crownCardChanged, // Interno
      // lastCrownChangeRound, // Interno

      // Funções que você quer expor:
      selectImpostors,
      selectChief,
      isChiefAndImpostor,
      generateTasks,
      generateRooms,
		initializeGame,
      // generateCards, // Função helper interna
      selectCrownCard,
      // shouldChangeCrownCard, // Interno
      // changeCrownCard, // Interno
      generateCrownHint,
      takeCardFromRoom,
      leaveCardInRoom,
      tradeCardsBetweenPlayers,
      registerVote,
      finalizeVoting,
      lastVotingResult,
      startNewRound,
      hackApp,
      declareFoundCrown, // FUNÇÃO IMPORTANTE que atualiza crownFound
      chooseCrownAction // Se/quando estiver pronta
      
      // Certifique-se de adicionar qualquer outra coisa que seus componentes de tela (screens) precisem!
      // Por exemplo, se RodadaScreen usa `crownActionResult` (vi no seu código), ele deve vir de crownFoundResult
      // ou ser um estado separado.
      // No seu código, você tem `crownFoundResult`, que é o que deve ser usado.
	  
    }}>
      {children}
    </GameContext.Provider>
  );
} // <--- ESTA É A CHAVE QUE FECHA A FUNÇÃO `GameProvider`

// =======================================================================
// PARTE FUNDAMENTAL FALTANTE: O HOOK CUSTOMIZADO PARA USAR O CONTEXTO
// =======================================================================
export const useGameContext = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
};