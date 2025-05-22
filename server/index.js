// server/index.js
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Servidor TasKing Backend está no ar! (Pasta Teste)');
});

app.post('/api/game/setup', (req, res) => {
  console.log('Dados recebidos para configuração do jogo (backend - pasta teste):', req.body);
 
  const numJogadoresRecebido = req.body.numJogadores || 0;
  let numImpostoresDefinidoPeloBackend = 0;

  if (numJogadoresRecebido >= 1 && numJogadoresRecebido <= 7) {
    numImpostoresDefinidoPeloBackend = 1;
  } else if (numJogadoresRecebido >= 8 && numJogadoresRecebido <= 15) {
    numImpostoresDefinidoPeloBackend = 2;
  } else if (numJogadoresRecebido >= 16 && numJogadoresRecebido <= 21) {
    numImpostoresDefinidoPeloBackend = 3;
  }
  // Adicionar lógica para equipes dos impostores aqui se necessário no setup

  const gameId = `game_test_${Date.now()}`;
  const gameData = {
    ...req.body,
    gameId,
    numImpostoresDefinidoPeloBackend,
    messageFromServer: "Jogo configurado no backend! (Pasta Teste)"
  };

  res.status(200).json({
    message: 'Configurações recebidas e processadas pelo backend! (Pasta Teste)',
    data: gameData
  });
});

app.listen(PORT, () => {
  console.log(`Servidor backend do TasKing rodando na porta ${PORT} (Pasta Teste)`);
});