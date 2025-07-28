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

// Gamepad input handling
window.addEventListener("gamepadconnected", (e) => {
    console.log("Gamepad connected:", e.gamepad);
    // Start checking for gamepad input
    gamepadStatesLast[e.gamepad.index] = e.gamepad;
    // p2GamepadOld = navigator.getGamepads()[1];
    checkGamepadInput();
});

let gamepadStatesLast = [];

function wasButtonJustPressed(gamepad, buttonIndex) {
    return gamepad.buttons[buttonIndex].pressed && !gamepadStatesLast[gamepad.index].buttons[buttonIndex].pressed;
}

function checkAllButtons(gamepad) {
    for(let i = 0; i < gamepad.buttons.length; i++) {
        if(wasButtonJustPressed(gamepad, i)) {
            console.log("player " + (gamepad.index + 1) + " just pressed " + i);
        }
    }
}

function checkGamepadInput() {
    navigator.getGamepads().forEach((gamepad) => {
        if(!gamepad) return;
        if(gamepad.index == 0) {
            if(wasButtonJustPressed(gamepad, 1)) {
                console.log("player 1 just pressed A");
                handleIntent('player-1-primary');
            }
        } else if(gamepad.index == 1) {
            if(wasButtonJustPressed(gamepad, 14)) {
                console.log("player 2 just pressed A");
                handleIntent('player-2-primary');
            }
        }
        gamepadStatesLast[gamepad.index] = gamepad;
    });
    requestAnimationFrame(checkGamepadInput);
}
//keyboard input
document.addEventListener('keydown', (event) => {
    if (event.key === '9') {
        debugger;
    }

    if(event.key === '1') {
        handleIntent('pause-card-draw');
    }
    if(event.key == PLAYER_KEYBINDS[1].primary) {
        handleIntent('player-1-primary');
    }
    if(event.key == PLAYER_KEYBINDS[1].secondary) {
        handleIntent('player-1-secondary');
    }
    if(event.key == PLAYER_KEYBINDS[2].primary) {
        handleIntent('player-2-primary');
    }
    if(event.key == PLAYER_KEYBINDS[2].secondary) {
        handleIntent('player-2-secondary');
    }
    if(event.key == PLAYER_KEYBINDS[3].primary) {
        handleIntent('player-3-primary');
    }
    if(event.key == PLAYER_KEYBINDS[3].secondary) {
        handleIntent('player-3-secondary');
    }
    if(event.key == PLAYER_KEYBINDS[4].primary) {
        handleIntent('player-4-primary');
    }
    if(event.key == PLAYER_KEYBINDS[4].secondary) {
        handleIntent('player-4-secondary');
    }
});