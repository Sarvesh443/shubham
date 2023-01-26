const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.use(express.static("public"));

let players = {};
let activePlayer = 0;

io.on('connection', (socket) => {
  players[socket.id] = {  
    "socket": socket,
    "total_score": 0,
    "current_score": 0,
    "isActivePlayer": false,
    "player_roll_num": Object.keys(players).length
  } 
  let total_players = Object.keys(players).length
  console.log(`Player with socket id ${socket.id} connected.`)
  console.log(`Total number of players: ${total_players}`)

  // Sending the connection status
  // Reject if we already have 2 players connected
  if (total_players > 2) {
    delete players[socket.id]
    socket.emit("connection_status", {"connection_status": "reject"});
    socket.disconnect();
    console.log("Already 2 players are onboarded", Object.keys(players))
  }
  // Send ready signal when we have 2 players 
  else if (total_players == 2) {
    // Tell player 1 to go first
    activePlayer = 0
    io.emit("connection_status",  {"connection_status": "ready", "active_player": Object.keys(players)[activePlayer]})
  }
  // Else send a waiting signal
  else {
    io.emit("connection_status",  {"connection_status": "waiting"})
  }

  function NotifyScores(active_player, dice) {
    // Get the player's socket ids
    let player1 = Object.keys(players)[0];
    let player2 = Object.keys(players)[1];

    // Send these to the clients
    io.emit("score_update", {
      'player1_current': players[player1].current_score,
      'player1_total': players[player1].total_score,
      'player2_current': players[player2].current_score,
      'player2_total': players[player2].total_score,
      'next_turn': Object.keys(players)[active_player],
      'acitive_player_roll_num': active_player,
      'dice': dice
    });
  }

  // This triggers when the client sends its decision on roll or hold
  socket.on("decide", (args) => {
    console.log("decide", args);
    
    // Just a check if the message received by server is from the active client.  
    if (args.player_id === Object.keys(players)[activePlayer]) {
      if (args.decision === 'roll'){

        // This is how the score is calculated
        const dice = Math.trunc(Math.random()*6) + 1;
        players[args.player_id].current_score = dice == 1 
          ? 0 
          : players[args.player_id].current_score + dice;
        activePlayer = dice == 1 ? (activePlayer + 1) % 2 : activePlayer
        NotifyScores(activePlayer, dice);
      }
      else if (args.decision === 'hold') {
        players[args.player_id].total_score += players[args.player_id].current_score;
        players[args.player_id].current_score = 0; 
        activePlayer = (activePlayer + 1) % 2;
        NotifyScores(activePlayer, 0);
      }
    }
  });

  socket.on('disconnect', () => {
      delete players[socket.id];
      console.log('Client disconnected ' + socket.id);
  });
});

server.listen(3001, () => {
  console.log('listening on *:3001');
});


