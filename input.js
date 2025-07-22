var originalTouches = [];
var originalMousePosition = null;
var playersJoined = [true, false, false, false];

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

//keyboard input
document.addEventListener('keydown', (event) => {
    if (event.key === '9') {
        debugger;
    }

    if(event.key === '1') {
        handleIntent('pause-card-draw');
    }

    if(event.key === 'l') {
        if(!playersJoined[1]) {
            playerPhysicsHands.push(manifestHand(players[1], window.innerWidth / 2 - 100, linkHeight/2, true, 0));
            playersJoined[1] = true;
        } else {
            removeHand(1);
            playersJoined[1] = false;
        }
    }

    if (event.key === 'd') { // Player 1 slap
        handleIntent('player-1-slap')
    } else if (event.key === 'k') { // Player 2 slap
        handleIntent('player-2-slap')
    }
});