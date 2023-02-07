'use strict';
// selecting Elements
const player0El = document.querySelector('.player--0');
const player1El = document.querySelector('.player--1');
const score0El = document.querySelector('#score--0');
const score1El = document.getElementById('score--1');
const current0El = document.getElementById('current--0');
const current1El = document.getElementById('current--1');
const diceEl = document.querySelector('.dice');
const btnNew = document.querySelector('.btn--new');
const btnRoll = document.querySelector('.btn--roll');
const btnHold = document.querySelector('.btn--hold');
const btnNewGame = document.querySelector('.btn--new');

// Variable declaration
let playing = true;
let socket
socket = io();
socket.on("connect", ()=>{
    console.log("Socket ID: ", socket.id)
})

// Definations
const init = function() {
    score0El.textContent = 0;
    score1El.textContent = 0;
    diceEl.classList.add('hidden');
    
    playing = true;

    score0El.textContent = 0;
    score1El.textContent = 0;
    current0El.textContent = 0;
    current1El.textContent = 0;
    player0El.classList.remove('player--winner');
    player1El.classList.remove('player--winner');
    player0El.classList.add('player--active');
    player1El.classList.remove('player--active');
}

const EnablePlayer = function(player, roll) {
    const isYourTurn = (player===socket.id);
    console.log("isYourTurn", isYourTurn);
    if (isYourTurn) {
        console.log(btnHold.disabled, btnRoll.style.display)
        btnHold.disabled = false;
        btnRoll.disabled = false;
        btnRoll.style = "display: visible;"
        btnHold.style = "display: visible;"
    } else {
        btnHold.disabled = true;
        btnRoll.disabled = true; 
        btnRoll.style.display = "none"
        btnHold.style.display = "none"  
    }

    document.querySelector(`.player--${roll}`).classList.toggle('player--active', true);
    document.querySelector(`.player--${(roll+1)%2}`).classList.toggle('player--active', false);
}

// Logic begins here
init();

// Button Listeners
btnRoll.addEventListener('click', function(){
    if(playing){
        socket.emit("decide", {
            "player_id": socket.id,
            "decision": "roll"
         });
    }
});

btnHold.addEventListener('click', function(){
    if(playing){
     socket.emit("decide", {
        "player_id": socket.id,
        "decision": "hold"
     });
    }
});

btnNewGame.addEventListener('click', ()=>{
    console.log("Start new game");
    init();
    socket.emit('restart');
})

// WebSocket Receivers
// Main Game
socket.on("connection_status", (args) => {
    console.log("Received a connection_status signal", args.connection_status)
    if (args.connection_status === 'waiting') {
        alert("Waiting for second player to begin the game")
    }
    else if (args.connection_status === 'ready') {
        EnablePlayer(args.active_player, 0);
        alert(`Let's begin the game. ${args.active_player===socket.id ? "It's your turn" : "Oponent's turn"}`)
    }
    else if (args.connection_status === 'reject') {
        alert("Can't join, already 2 players onboarded")
    }
});

socket.on("score_update", (args) =>{
    console.log("score update", args);
    document.getElementById(`current--0`).textContent = args.player1_current;
    document.getElementById(`current--1`).textContent = args.player2_current;
    document.getElementById(`score--0`).textContent = args.player1_total;
    document.getElementById(`score--1`).textContent = args.player2_total;
    diceEl.classList.remove('hidden');
    diceEl.src = `assets/images/dice-${args.dice}.png`;
    if (args.dice === 0) diceEl.classList.add('hidden');
    EnablePlayer(args.next_turn, args.acitive_player_roll_num)
});

socket.on("winner", (winner) => {
    playing = false;
    document.querySelector(`.player--${winner}`).classList.add('player--winner');
    document.querySelector(`.player--${winner}`).classList.remove('player--active');
});

socket.on('restart', ()=>{
    init();
});

// Chat
