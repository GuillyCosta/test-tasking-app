'use client'; // Certifique-se de que esta linha está no topo se for um Componente Cliente

import React from 'react';
import { GameProvider, useGameContext } from '@/context/GameContext';
import { InicioScreen } from '@/components/screens/InicioScreen';
import { ConfiguracaoScreen } from '@/components/screens/ConfiguracaoScreen';
import { JogadoresScreen } from '@/components/screens/JogadoresScreen';
import { RevelacaoPapelScreen } from '@/components/screens/RevelacaoPapelScreen';
import { RodadaScreen } from '@/components/screens/RodadaScreen';
import { VotacaoScreen } from '@/components/screens/VotacaoScreen';
import { ResultadoScreen } from '@/components/screens/ResultadoScreen';
import { RegrasScreen } from '@/components/screens/RegrasScreen';
import { VitoriaEquipeScreen } from '@/components/screens/VitoriaEquipeScreen'; // Importe a tela de vitória de Equipe

// Componente principal que gerencia as telas com base no gameStep
function GameApp() {
  const { gameStep } = useGameContext();
  
  console.log("GameApp renderizado com gameStep:", gameStep);
  
  const renderScreen = () => {
    switch (gameStep) {
      case 'inicio':
        return <InicioScreen />;
      case 'configuracao':
        return <ConfiguracaoScreen />;
      case 'jogadores':
        return <JogadoresScreen />;
      case 'revelacao':
        return <RevelacaoPapelScreen />;
      case 'rodada':
        return <RodadaScreen />;
      case 'votacao':
        return <VotacaoScreen />;
      case 'resultado':
        return <ResultadoScreen />;
      case 'regras':
        return <RegrasScreen />;
      case 'vitoriaEquipe':
        return <VitoriaEquipeScreen />;
      default:
        return <InicioScreen />;
    }
  };
  
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-blue-900 to-purple-900 text-white">
      {renderScreen()}
    </main>
  );
}

// Página principal que envolve o aplicativo com o provedor de contexto
export default function Home() {
  return (
    <GameProvider>
      <GameApp />
    </GameProvider>
  );
}