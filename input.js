var originalTouches = [];
var originalMousePosition = null;

// Handle both touch and mouse start events
function handleStartEvent(e) {
    // console.log(getPlayerArea(e.clientX, e.clientY, 4));
    const position = {
        x: e.clientX || e.touches[0].clientX,
        y: e.clientY || e.touches[0].clientY
    };

    if (e.type === 'touchstart') {
        let index = e.changedTouches[0].identifier;
        originalTouches[index] = position;
    } else {
        originalMousePosition = position;
    }
}

// Handle both touch and mouse end events
function handleEndEvent(e) {
    const viewportHeight = window.innerHeight;
    
    // Get start and end positions
    let startPos, endPos;
    if (e.type === 'touchend') {
        const index = e.changedTouches[0].identifier;
        startPos = originalTouches[index];
        endPos = {
            x: e.changedTouches[0].clientX,
            y: e.changedTouches[0].clientY
        };
    } else {
        startPos = originalMousePosition;
        endPos = {
            x: e.clientX,
            y: e.clientY
        };
    }

    if (!startPos) return;

    const yDelta = endPos.y - startPos.y;
    const xDelta = endPos.x - startPos.x;
    const distance = Math.sqrt(xDelta * xDelta + yDelta * yDelta);
    const player = getPlayerArea(startPos.x, startPos.y, player_count);

    // In single player mode, ignore swipes on player 2's side
    if (player_count === 1 && player == 2) {
        return;
    }

    if (distance > SWIPE_THRESHOLD) {                
        // Handle the slap
        console.log(`player-${player}-slap`);
        handleIntent(`player-${player}-slap`);
    }
}

// Add event listeners for both touch and mouse events
document.addEventListener('touchstart', handleStartEvent, { passive: false });
document.addEventListener('mousedown', handleStartEvent);
document.addEventListener('touchend', handleEndEvent);
document.addEventListener('mouseup', handleEndEvent);

const PLAYER_KEYBINDS = {
    1: { primary: 'k', secondary: 'l' },
    2: { primary: 'w', secondary: 'q' },
    3: { primary: 'o', secondary: 'p' },
    4: { primary: 'd', secondary: 's' }
};

//keyboard input
document.addEventListener('keydown', (event) => {
    if (event.key === '9') {
        debugger;
    }

    if(event.key === '1') {
        handleIntent('pause-card-draw');
    }

    // Player 1
    if (event.key == PLAYER_KEYBINDS[1].primary) {
        if(!players[0].joined) {
            players[0].joined = true;
            handleIntent('player-1-join');
            playerPhysicsHands.push(manifestHand(players[0], window.innerWidth / 2 + X_POSITION_OFFSET, window.innerHeight - 15, false, 1));
        } else {
            if(!players[0].ready) {
                players[0].ready = true;
                handleIntent('player-1-ready');
            } else {
                handleIntent('player-1-slap');
            }
        }
    }
    // Player 1 secondary
    if(event.key == PLAYER_KEYBINDS[1].secondary) {
        if(players[0].joined && !players[0].ready) {
            players[0].joined = false;
            handleIntent('player-1-unjoin');
            removeHand(players[0]);
        }
    }

    // Player 2
    if (event.key == PLAYER_KEYBINDS[2].primary) {
        if(!players[1].joined) {
            players[1].joined = true;
            handleIntent('player-2-join');
            playerPhysicsHands.push(manifestHand(players[1], window.innerWidth / 2 - X_POSITION_OFFSET, linkHeight/2, true, 0));
        } else {
            if(!players[1].ready) {
                players[1].ready = true;
                handleIntent('player-2-ready');
            } else {
                handleIntent('player-2-slap');
            }
        }
    }
    // Player 2 secondary
    if(event.key == PLAYER_KEYBINDS[2].secondary) {
        if(players[1].joined && !players[1].ready) {
            players[1].joined = false;
            handleIntent('player-2-unjoin');
            removeHand(players[1]);
        }
    }

    // Player 3
    if (event.key == PLAYER_KEYBINDS[3].primary) {
        if(!players[2].joined) {
            players[2].joined = true;
            handleIntent('player-3-join');
            playerPhysicsHands.push(manifestHand(players[2], window.innerWidth / 2 + X_POSITION_OFFSET, linkHeight/2, true, 2));
        } else {
            if(!players[2].ready) {
                players[2].ready = true;
                handleIntent('player-3-ready');
            } else {
                handleIntent('player-3-slap');
            }
        }
    }
    // Player 3 secondary
    if(event.key == PLAYER_KEYBINDS[3].secondary) {
        if(players[2].joined && !players[2].ready) {
            players[2].joined = false;
            handleIntent('player-3-unjoin');
            removeHand(players[2]);
        }
    }

    // Player 4
    if (event.key == PLAYER_KEYBINDS[4].primary) {
        if(!players[3].joined) {
            players[3].joined = true;
            handleIntent('player-4-join');
            playerPhysicsHands.push(manifestHand(players[3], window.innerWidth / 2 - X_POSITION_OFFSET, window.innerHeight - 15, false, 3));
        } else {
            if(!players[3].ready) {
                players[3].ready = true;
                handleIntent('player-4-ready');
            } else {
                handleIntent('player-4-slap');
            }
        }
    }
    // Player 4 secondary
    if(event.key == PLAYER_KEYBINDS[4].secondary) {
        if(players[3].joined && !players[3].ready) {
            players[3].joined = false;
            handleIntent('player-4-unjoin');
            removeHand(players[3]);
        }
    }
});