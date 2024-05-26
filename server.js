const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

let players = {};
let scores = {};

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Assign role
    let role = Object.keys(players).length === 0 ? 'Player 1' : 'Player 2';
    players[socket.id] = { choice: null, role };
    scores[socket.id] = { wins: 0, losses: 0 };

    // Send role to the client
    socket.emit('role', role);

    socket.on('choice', (choice) => {
        players[socket.id].choice = choice;
        checkGameResult();
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        delete players[socket.id];
        delete scores[socket.id];
    });
});

const checkGameResult = () => {
    const playerIds = Object.keys(players);
    if (playerIds.length === 2) {
        const [player1, player2] = playerIds;
        const choice1 = players[player1].choice;
        const choice2 = players[player2].choice;

        if (choice1 && choice2) {
            let resultMessage;
            if (choice1 === choice2) {
                resultMessage = 'Empate';
                io.emit('result', { message: resultMessage, choices: { [player1]: choice1, [player2]: choice2 } });
            } else if (
                (choice1 === 'rock' && choice2 === 'scissors') ||
                (choice1 === 'scissors' && choice2 === 'paper') ||
                (choice1 === 'paper' && choice2 === 'rock')
            ) {
                scores[player1].wins++;
                scores[player2].losses++;
                resultMessage = `Ganaste! ${choice1} vs ${choice2}`;
                io.to(player1).emit('result', { message: resultMessage, choices: { [player1]: choice1, [player2]: choice2 } });
                resultMessage = `Perdiste! ${choice1} vs ${choice2}`;
                io.to(player2).emit('result', { message: resultMessage, choices: { [player1]: choice1, [player2]: choice2 } });
            } else {
                scores[player1].losses++;
                scores[player2].wins++;
                resultMessage = `Perdiste! ${choice1} vs ${choice2}`;
                io.to(player1).emit('result', { message: resultMessage, choices: { [player1]: choice1, [player2]: choice2 } });
                resultMessage = `Ganaste! ${choice1} vs ${choice2}`;
                io.to(player2).emit('result', { message: resultMessage, choices: { [player1]: choice1, [player2]: choice2 } });
            }

            // Reset choices for next round
            players[player1].choice = null;
            players[player2].choice = null;

            // Update scores
            io.emit('scores', scores);
        }
    }
};

server.listen(3000, () => {
    console.log('Server is running on port 3000');
});
