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

  function NotifyScores(active_player) {
    let player1 = Object.keys(players)[0];
    let player2 = Object.keys(players)[1];

    io.emit("score_update", {
      'player1_current': players[player1].current_score,
      'player1_total': players[player1].total_score,
      'player2_current': players[player2].current_score,
      'player2_total': players[player2].total_score,
      'active_player': Object.keys(players)[activePlayer],
    });
  }

  socket.on("decide", (args) => {
    console.log("decide", args);
    if (args.player_id === Object.keys(players)[activePlayer]) {
      if (args.decision === 'roll'){
      roll_die = 5; // Roll the die
      players[args.player_id].current_score += roll_die; 
      NotifyScores(activePlayer);
      }
      else {
        NotifyScores((activePlayer+1)%2);
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


