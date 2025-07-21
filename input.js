document.addEventListener('keydown', (event) => {
    if (event.key === '9') {
        debugger;
    }

    if(event.key === '1') {
        handleIntent('pause-card-draw');
    }

    if (event.key === 'd') { // Player 1 slap
        console.log('player 1 slap');
        handleIntent('player-1-slap')
    } else if (event.key === 'k') { // Player 2 slap
        handleIntent('player-2-slap')
    }
});