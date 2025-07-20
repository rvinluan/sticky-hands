document.addEventListener('keydown', (event) => {
    if (event.key === '9') {
        debugger;
    }

    // Gameplay screen: Keyboard shortcuts for slaps and debug
    if (!gameplayScreen.classList.contains('hidden') && 
        roundStartScreen.classList.contains('hidden')) {
        // Debug pause toggle
        if (event.key === '1') {
            isDebugPaused = !isDebugPaused;
            if (isDebugPaused) {
                console.log('Debug: Game timer paused');
            } else {
                console.log('Debug: Game timer resumed');
            }
        }

        if (event.key === 'd') { // Player 1 slap
            handleIntent('player-1-slap')
        } else if (event.key === 'k') { // Player 2 slap
            handleIntent('player-2-slap')
        }
    }
});