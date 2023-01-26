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

let scores = [0, 0];
let currentScore = 0;
let activePlayer = 0;
let playing = true;

let socket

const init = function() {
    score0El.textContent = 0;
    score1El.textContent = 0;
    diceEl.classList.add('hidden');
    
    scores = [0, 0];
    currentScore = 0;
    activePlayer = 0;
    playing = true;

    score0El.textContent = 0;
    score1El.textContent = 0;
    current0El.textContent = 0;
    current1El.textContent = 0;
    player0El.classList.remove('player--winner');
    player1El.classList.remove('player--winner');
    player0El.classList.add('player--active');
    player1El.classList.remove('player--active');

    socket = io();
    socket.on("connect", ()=>{
        console.log("Socket ID: ", socket.id)
    })

}

init();

const switchPlayer = function() {
    document.getElementById(`current--${activePlayer}`).textContent = 0;
    activePlayer = activePlayer === 0 ? 1 : 0;
    currentScore = 0;
    player0El.classList.toggle('player--active');
    player1El.classList.toggle('player--active');
}

btnRoll.addEventListener('click', function(){
    if(playing){
        const dice = Math.trunc(Math.random()*6) + 1;
        diceEl.classList.remove('hidden');
        diceEl.src = `assets/images/dice-${dice}.png`;
        if(dice!==1){
            currentScore += dice;
            document.getElementById(`current--${activePlayer}`).textContent = currentScore;
        } else {
            switchPlayer();
        }
        socket.emit("decide", {
            "player_id": socket.id,
            "decision": "roll"
         });
    }
});

btnHold.addEventListener('click', function(){
    if(playing){
        scores[activePlayer] += currentScore;
        document.getElementById(`score--${activePlayer}`).textContent = scores[activePlayer];
    
        if(scores[activePlayer] >= 60) {
            playing = false;
            document.querySelector(`.player--${activePlayer}`).classList.add('player--winner');
            document.querySelector(`.player--${activePlayer}`).classList.remove('player--active');
        }
        switchPlayer();
     socket.emit("decide", {
        "player_id": socket.id,
        "decision": "hold"
     });
    }
});

btnNewGame.addEventListener('click', init)

const EnablePlayer = function(player) {
    const isYourTurn = player===socket.id;
    if (isYourTurn) {
        btnHold.disabled = false;
        btnRoll.disabled = false;
    } else {
        btnHold.disabled = true;
        btnRoll.disabled = true;   
    }
}

socket.on("connection_status", (args) => {
    console.log("Received a connection_status signal", args.connection_status)
    if (args.connection_status === 'waiting') {
        alert("Waiting for second player to begin the game")
    }
    else if (args.connection_status === 'ready') {
        EnablePlayer(args.active_player);
        alert(`Let's begin the game. ${args.active_player===socket.id ? "It's your turn" : "Oponent's turn"}`)
    }
    else if (args.connection_status === 'reject') {
        alert("Can't join, already 2 players onboarded")
    }
});

socket.on("score_update", (args) =>{
    console.log("score update", args);
    scores[0] = args.player1_total;
    scores[1] = args.player2_total;
    document.getElementById(`current--0`).textContent = args.player1_current;
    document.getElementById(`current--1`).textContent = args.player2_current;
});