const socket = io();

const makeChoice = (choice) => {
    socket.emit('choice', choice);
};

const choiceImages = {
    rock: 'img/rock.png',
    paper: 'img/paper.png',
    scissors: 'img/scissors.png',
};

socket.on('result', (data) => {
    document.getElementById('result').innerText = data.message;
    const playerChoices = data.choices;
    const playerIds = Object.keys(playerChoices);
    if (playerIds.length === 2) {
        const [player1, player2] = playerIds;
        document.getElementById('player1-choice').src = choiceImages[playerChoices[player1]];
        document.getElementById('player2-choice').src = choiceImages[playerChoices[player2]];
    }
});

socket.on('scores', (scores) => {
    let scoresDisplay = '';
    for (const [player, score] of Object.entries(scores)) {
        scoresDisplay += `Player ${player}: Wins - ${score.wins}, Losses - ${score.losses}\n`;
    }
    document.getElementById('scores').innerText = scoresDisplay;
});
