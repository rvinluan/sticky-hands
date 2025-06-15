// Game state
let deck = [];
let unusedCards = []; // Array to store unused cards
let cardPile = [];
let discardPile = []; // Track discarded cards
let player1Score = 0;
let player2Score = 0;
let gameInterval;
let isGameActive = false;
let isPaused = false;
let isDebugPaused = false; // New debug pause state
let currentRound = 1;
let player_count = 1; // Default to 1 player
const CARDS_PER_ROUND = 6; // Cards to add each round
const INITIAL_DECK_SIZE = 10; // Starting deck size
const WINNING_SCORE = 30; // Score needed to win the game
const ROUNDS_TO_MAX_SPEED = 9; // Number of rounds until max speed is reached
const INCORRECT_SLAP_PENALTY = 2; // Points deducted for incorrect slaps
const COMPUTER_SLAP_CHANCE = 0.5; // Chance for computer to slap
const COMPUTER_SLAP_DELAY = 600; // Delay before computer slaps in ms

// Array of hand pun loss messages
const LOSS_MESSAGES = [
    "Give your friend a hand. You scored ",
    "You need some more hands-on experience! You scored ",
    "You do in fact have to hand it to them. You scored ",
    "Sometimes you're just dealt a bad hand! You scored ",
    "Don't you know what they say about idle hands? You scored ",
    "I'm going to hold your hand when I say this: You scored ",
    "You played right into their hand. You scored ",
    "Looks like it just wasn't in the cards for you. You scored "
];

let drawInterval = 500 + ((ROUNDS_TO_MAX_SPEED - 1) * 100); // Start slower, get faster
let currentDeckSize = 0; // Track current deck size
let activeConditions = new Set(); // Track which conditions are active

// Track current colors for each player's chain
let player1ColorIndex = 0;
let player2ColorIndex = 1;

// Variables to track player swipes
let player1LastTouchStart = { x: 0, y: 0, time: 0 };
let player2LastTouchStart = { x: 0, y: 0, time: 0 };
let lastSlapTime = 0;
let justSlapped = false;
const MIN_SLAP_INTERVAL = 300; // Minimum time between slaps in ms
const SWIPE_THRESHOLD = 70; // Minimum distance for a swipe in pixels
// Track recent slaps from both players
let player1RecentSlap = { time: 0, valid: false };
let player2RecentSlap = { time: 0, valid: false };
const SIMULTANEOUS_THRESHOLD = 150; // ms - threshold for considering slaps simultaneous

// DOM elements
const welcomeScreen = document.getElementById('welcome-screen');
const lobbyScreen = document.getElementById('lobby-screen');
const gameplayScreen = document.getElementById('gameplay-screen');
const roundStartScreen = document.getElementById('round-start-screen');
const newConditionScreen = document.getElementById('new-condition-screen');
const initialConditionsScreen = document.getElementById('initial-conditions-screen');
const endScreen = document.getElementById('end-screen');
const pauseScreen = document.getElementById('pause-screen');
const playButton = document.getElementById('play-button');
const replayButton = document.getElementById('replay-button');
const resumeButton = document.getElementById('resume-button');
const rotateButton = document.getElementById('rotate-button');
const cardPileElement = document.getElementById('card-pile');
const finalScoreElement = document.getElementById('final-score');   
const finalScoreElement2 = document.getElementById('final-score-2');
const roundNumberElement = document.getElementById('round-number');
const roundNumberElement2 = document.getElementById('round-number-2');
const countdownBar = document.getElementById('countdown-bar');
const newConditionCountdownBar = document.getElementById('new-condition-countdown-bar');
const player1ScoreElement = document.getElementById('player1-score');
const player2ScoreElement = document.getElementById('player2-score');
const player1StatusText = document.querySelector('.player1 .status-text');
const player2StatusText = document.querySelector('.player2 .status-text');
const conditionEmojiLarge = document.querySelector('.condition-emoji-large');
const conditionName = document.querySelector('.condition-name');
const conditionDescription = document.querySelector('.condition-description');
const burstEffect = document.getElementById('burst-effect');
const physicsCanvas = document.getElementById('physics-canvas');
const playerToggle = document.getElementById('player-toggle');
const continueButton = document.getElementById('continue-button');
const aboutButton = document.getElementById('about-button');
const aboutScreen = document.getElementById('about-screen');
const closeAboutButton = document.getElementById('close-about-button');

// Card suits and ranks
const suits = ['♠', '♥', '♦', '♣'];
const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

// Access conditions from the imported gameConditions object
const conditions = window.gameConditions.conditionsObject;
const getCardValue = window.gameConditions.getCardValueFunction;
const areConsecutive = window.gameConditions.areConsecutiveFunction;

// Sound effects
let slapSound = null;
let correctSound = null;
let incorrectSound = null;
let drawSound = null;
let pointSound = null;
let wooshSound = null;
let changeSound = null;
let interactBigSound = null;
let interactSmallSound = null;
let t1Sound = null;
let t2Sound = null;
let t3Sound = null;
let t4Sound = null;
let t5Sound = null;
let winSound = null;
let backgroundMusic = null;

// Preload sound effects
function preloadSounds() {
    slapSound = new Audio('sounds/slap1.mp3');
    correctSound = new Audio('sounds/brass.mp3');
    incorrectSound = new Audio('sounds/incorrect.mp3');
    drawSound = new Audio('sounds/draw.mp3');
    pointSound = new Audio('sounds/bell.mp3');
    wooshSound = new Audio('sounds/woosh.mp3');
    changeSound = new Audio('sounds/pan.mp3');
    interactBigSound = new Audio('sounds/snap.mp3');
    interactSmallSound = new Audio('sounds/woodblock.mp3');
    t1Sound = new Audio('sounds/transition-1.mp3');
    t2Sound = new Audio('sounds/transition-2.mp3');
    t3Sound = new Audio('sounds/transition-3.mp3');
    t4Sound = new Audio('sounds/transition-4.mp3');
    t5Sound = new Audio('sounds/transition-5.mp3');
    winSound = new Audio('sounds/win.mp3');
    backgroundMusic = new Audio('sounds/Sticky Hands Music.mp3');

    // Set volume for all sounds
    // slapSound.volume = 0.5;
    correctSound.volume = 0.5;
    incorrectSound.volume = 0.1;
    drawSound.volume = 0.5;
    pointSound.volume = 0.5;
    wooshSound.volume = 1;
    changeSound.volume = 0.5;
    t1Sound.volume = 0.5;
    t2Sound.volume = 0.5;
    t3Sound.volume = 0.5;
    t4Sound.volume = 0.5;
    t5Sound.volume = 0.5;
    winSound.volume = 0.5;
    backgroundMusic.volume = 0.3;

    slapSound.load();
    correctSound.load();
    incorrectSound.load();
    drawSound.load();
    pointSound.load();  
    wooshSound.load();
    changeSound.load();
    interactBigSound.load();
    interactSmallSound.load();
    t1Sound.load();
    t2Sound.load();
    t3Sound.load();
    t4Sound.load();
    t5Sound.load();
    winSound.load();
    backgroundMusic.load();
}

// Play a sound effect
function playSound(sound) {
    if (sound) {
        sound.currentTime = 0; // Reset to start
        sound.play().catch(error => {
            console.log('Error playing sound:', error);
        });
    }
}

function playRandomTransitionSound() {
    const transitionSounds = [t1Sound, t2Sound, t3Sound, t4Sound, t5Sound];
    const randomSound = transitionSounds[Math.floor(Math.random() * transitionSounds.length)];
    playSound(randomSound);
    return randomSound;
}

// Play background music with looping
function playBackgroundMusic() {
    if (backgroundMusic) {
        backgroundMusic.loop = true;
        backgroundMusic.currentTime = 0;
        backgroundMusic.play().catch(error => {
            console.log('Error playing background music:', error);
        });
    }
}

// Smoothly transition audio volume
function transitionVolume(audioElement, targetVolume, duration = 200) {
    const startTime = performance.now();
    const startVolume = audioElement.volume;
    
    function animateVolume(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Calculate new volume
        const newVolume = startVolume + (targetVolume - startVolume) * progress;
        audioElement.volume = newVolume;
        
        if (progress < 1) {
            requestAnimationFrame(animateVolume);
        }
    }
    
    requestAnimationFrame(animateVolume);
}

// Duck background music for a sound effect
function duckBackgroundMusicForSound(soundEffect, duckVolume = 0.01, duckDuration = 200) {
    const originalVolume = backgroundMusic.volume;
    
    // Lower volume
    transitionVolume(backgroundMusic, duckVolume, duckDuration);
    
    const sound = soundEffect;
    // Listen for when the sound ends
    sound.addEventListener('ended', () => {
        console.log('sound ended');
        // Raise volume back to original
        transitionVolume(backgroundMusic, originalVolume, duckDuration);
    }, { once: true });
}

// Display game conditions
function displayConditions() {
    const conditionsDisplay = document.getElementById('conditions-display');
    conditionsDisplay.innerHTML = '';
    
    // Only show active conditions
    Object.entries(conditions).forEach(([key, condition]) => {
        if (activeConditions.has(key)) {
            const conditionItem = document.createElement('div');
            conditionItem.className = 'condition-item';
            
            const emojiSpan = document.createElement('span');
            emojiSpan.className = 'condition-emoji';
            emojiSpan.textContent = condition.emoji;
            
            conditionItem.appendChild(emojiSpan);
            conditionsDisplay.appendChild(conditionItem);

            // Add click handler to pause game
            conditionItem.addEventListener('click', () => {
                if (isGameActive && !isPaused) {
                    pauseGame();
                }
            });
        }
    });
}

// Pause game
function pauseGame() {
    isPaused = true;
    clearInterval(gameInterval);
    
    // Update pause screen with current conditions
    const conditionsList = pauseScreen.querySelector('.initial-conditions-list');
    
    // Clear existing conditions
    conditionsList.innerHTML = '';
    
    // Add each active condition to the list
    for (const conditionKey of activeConditions) {
        const condition = conditions[conditionKey];
        
        // Create condition element
        const conditionElement = document.createElement('div');
        conditionElement.className = 'initial-condition';
        
        // Create emoji span
        const emojiSpan = document.createElement('span');
        emojiSpan.className = 'condition-emoji';
        emojiSpan.textContent = condition.emoji;
        
        // Create content container
        const contentDiv = document.createElement('div');
        contentDiv.className = 'condition-content';
        
        // Create title span
        const titleSpan = document.createElement('span');
        titleSpan.className = 'condition-title';
        titleSpan.textContent = condition.name;
        
        // Create description paragraph
        const descriptionP = document.createElement('p');
        descriptionP.textContent = condition.description;
        
        // Add title and description to content container
        contentDiv.appendChild(titleSpan);
        contentDiv.appendChild(descriptionP);
        
        // Add elements to condition element
        conditionElement.appendChild(emojiSpan);
        conditionElement.appendChild(contentDiv);
        
        // Add condition element to the list
        conditionsList.appendChild(conditionElement);
    }
    
    // Show pause screen
    gameplayScreen.classList.add('hidden');
    pauseScreen.classList.remove('hidden');
}

// Resume game
function resumeGame() {
    isPaused = false;
    pauseScreen.classList.add('hidden');
    gameplayScreen.classList.remove('hidden');
    gameInterval = setInterval(drawCard, drawInterval);
}

// Add event listener for resume button
resumeButton.addEventListener('click', () => {
    playSound(interactBigSound);
    resumeGame();
});

// Initialize deck
function initializeDeck() {
    if (currentRound === 1) {
        // First round: create initial deck and unused cards
        deck = [];
        unusedCards = [];
        discardPile = [];
        
        // Create all possible cards
        for (const suit of suits) {
            for (const rank of ranks) {
                unusedCards.push({ suit, rank });
            }
        }
        
        // Shuffle unused cards
        shuffleDeck(unusedCards);
        
        // Take initial cards for the deck
        deck = unusedCards.splice(0, INITIAL_DECK_SIZE - 2);
        // Add jokers to deck
        deck.push({ rank: 'joker' });
        deck.push({ rank: 'joker' });   
        // Shuffle deck
        shuffleDeck(deck);   
        currentDeckSize = deck.length;
    } else {
        // Subsequent rounds: add new cards from unused cards to existing deck
        const newCardsNeeded = CARDS_PER_ROUND;
        
        // Add discard pile back to deck
        deck.push(...discardPile);
        discardPile = [];
        
        // If we don't have enough unused cards, reshuffle the used cards back into unused
        if (unusedCards.length < newCardsNeeded) {
            // Get all cards that have been played
            const playedCards = cardPile;
            // Add them back to unused cards
            unusedCards.push(...playedCards);
            // Remove jokers from unused cards (we want to keep them in the deck)
            unusedCards = unusedCards.filter(card => card.rank !== 'joker');
            // Shuffle the unused cards
            shuffleDeck(unusedCards);
        }
        
        // Take new cards from unused cards and add to existing deck
        const newCards = unusedCards.splice(0, newCardsNeeded);
        deck.push(...newCards);
        shuffleDeck();
        
        currentDeckSize += newCardsNeeded;
    }
    
    // Clear the card pile at the start of each round
    cardPile = [];
    cardPileElement.innerHTML = '';
}

// Update deck count display
// function updateDeckCount() {
//     deckCountElement.textContent = `Cards: ${deck.length}`;
// }

// Fisher-Yates shuffle algorithm
function shuffleDeck(deckToShuffle = deck) {
    for (let i = deckToShuffle.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deckToShuffle[i], deckToShuffle[j]] = [deckToShuffle[j], deckToShuffle[i]];
    }
}

// Create card element
function createCardElement(card, index) {
    const cardElement = document.createElement('div');
    cardElement.className = 'card';
    
    // Set the final position for the animation
    const offset = index * 7;
    const maxOffset = 50; // Maximum offset in pixels
    const finalPosition = Math.min(offset - 60, maxOffset);
    
    // Add random rotation between -5 and 5 degrees
    const rotation = (Math.random() * 10) - 5;
    
    // Combine translation and rotation in the transform property
    cardElement.style.setProperty('--final-position', `${finalPosition}px`);
    cardElement.style.setProperty('--rotation', `${rotation}deg`);
    
    if (card.rank === 'joker') {
        // Add joker class to the card element
        cardElement.classList.add('joker');
        
        // Create top left corner (rotated 180 degrees)
        const topLeftContainer = document.createElement('div');
        topLeftContainer.className = 'card-corner top-left';
        
        const topLeftText = document.createElement('span');
        topLeftText.className = 'card-rank';
        topLeftText.textContent = 'JOKER';
        topLeftContainer.appendChild(topLeftText);
        
        cardElement.appendChild(topLeftContainer);
        
        // Create joker content for the center
        const jokerContent = document.createElement('div');
        jokerContent.className = 'joker-content';
        jokerContent.innerHTML = `
            <div class="joker-emoji">🤡</div>
        `;
        cardElement.appendChild(jokerContent);
        
        // Create bottom right corner
        const bottomRightContainer = document.createElement('div');
        bottomRightContainer.className = 'card-corner bottom-right';
        
        const bottomRightText = document.createElement('span');
        bottomRightText.className = 'card-rank';
        bottomRightText.textContent = 'JOKER';
        bottomRightContainer.appendChild(bottomRightText);
        
        cardElement.appendChild(bottomRightContainer);
    } else {
        // Create regular card corners
        const topLeftContainer = document.createElement('div');
        topLeftContainer.className = 'card-corner top-left';
        
        const topLeftRank = document.createElement('span');
        topLeftRank.className = 'card-rank';
        topLeftRank.textContent = card.rank;
        topLeftContainer.appendChild(topLeftRank);
        
        const topLeftSuit = document.createElement('span');
        topLeftSuit.className = 'card-suit';
        topLeftSuit.textContent = card.suit;
        topLeftContainer.appendChild(topLeftSuit);
        
        cardElement.appendChild(topLeftContainer);
        
        // Create bottom right rank and suit (rotated)
        const bottomRightContainer = document.createElement('div');
        bottomRightContainer.className = 'card-corner bottom-right';
        
        const bottomRightRank = document.createElement('span');
        bottomRightRank.className = 'card-rank';
        bottomRightRank.textContent = card.rank;
        bottomRightContainer.appendChild(bottomRightRank);
        
        const bottomRightSuit = document.createElement('span');
        bottomRightSuit.className = 'card-suit';
        bottomRightSuit.textContent = card.suit;
        bottomRightContainer.appendChild(bottomRightSuit);
        
        cardElement.appendChild(bottomRightContainer);
        
        // Set card color based on suit
        if (card.suit === '♥' || card.suit === '♦') {
            cardElement.classList.add('red');
        } else {
            cardElement.classList.add('black');
        }

        // Add background image based on suit and rank
        const suitName = card.suit === '♠' ? 'Spades' :
                        card.suit === '♥' ? 'Hearts' :
                        card.suit === '♦' ? 'Diamonds' : 'Clubs';
        
        // Convert rank to match file naming convention
        let rankName = card.rank;
        if (card.rank === '10') rankName = '10';
        if (card.rank === 'A') rankName = 'A';
        if (card.rank === 'J') rankName = 'J';
        if (card.rank === 'Q') rankName = 'Q';
        if (card.rank === 'K') rankName = 'K';
        
        // Set the background image
        cardElement.style.backgroundImage = `url('Card Images/${rankName}-${suitName}.png')`;
        cardElement.style.backgroundSize = 'cover';
        cardElement.style.backgroundPosition = 'center';
    }
    
    // Initialize animation state
    card.fullyAnimated = false;
    
    // Add animation class after a small delay to ensure the initial position is set
    setTimeout(() => {
        cardElement.classList.add('animate');
        
        // Listen for animation end
        cardElement.addEventListener('animationend', () => {
            // Mark the card as fully animated
            card.fullyAnimated = true;
        });
    }, 10);
    
    return cardElement;
}

// Show toast message
function showToast(message, type = 'error', duration = 500, player = null, points = null) {
    const toast = document.createElement('div');
    toast.className = `toast ${type} toast-invisible`;
    
    // Add player-specific class if provided
    if (player === 'player1') {
        toast.classList.add('player1');
    } else if (player === 'player2') {
        toast.classList.add('player2');
    }
    
    // Create message text element
    const messageText = document.createElement('div');
    messageText.className = 'toast-message';
    messageText.textContent = message + '!';
    toast.appendChild(messageText);
    
    // Add points element if points are provided
    if (points !== null) {
        const pointsElement = document.createElement('div');
        pointsElement.className = 'toast-points';
        pointsElement.textContent = points > 0 ? `+${points}` : points;
        toast.appendChild(pointsElement);
    }
    
    document.body.appendChild(toast);
    
    // Force reflow to ensure initial state is applied before transition
    toast.offsetHeight;
    
    // Transition to visible state
    requestAnimationFrame(() => {
        toast.classList.remove('toast-invisible');
        toast.classList.add('toast-visible');
        
        // After a delay, transition back to invisible
        setTimeout(() => {
            toast.classList.remove('toast-visible');
            toast.classList.add('toast-invisible');
            
            // Remove element after transition completes
            toast.addEventListener('transitionend', () => {
                toast.remove();
            }, { once: true });
        }, 800); // Stay visible for 0.8 seconds
    });
}

// Check for conditions
function checkConditions(pile) {
    const metConditions = [];
    // Only check active conditions
    for (const [key, condition] of Object.entries(conditions)) {
        if (activeConditions.has(key) && condition.check(pile)) {
            metConditions.push({ name: condition.name, points: condition.points });
        }
    }
    return metConditions;
}

function changeColor(player) {
    playSound(changeSound);
    if (player === 'player1') {
        player1ColorIndex = (player1ColorIndex + 1) % colors.length;
        // Update chain1 color
        Composite.allBodies(chain1.composite).forEach(body => {
            if (body.render) {
                body.render.fillStyle = colors[player1ColorIndex];
            }
            if (body.label == "Circle Body") {
                body.render.sprite.texture = `hand-${colorNames[player1ColorIndex]}.png`;
            }
        });
        Composite.allConstraints(chain1.composite).forEach(constraint => {
            if (constraint.render) {
                constraint.render.strokeStyle = colors[player1ColorIndex];
            }
        });
    } else {
        player2ColorIndex = (player2ColorIndex + 1) % colors.length;
        // Update chain2 color
        Composite.allBodies(chain2.composite).forEach(body => {
            if (body.render) {
                body.render.fillStyle = colors[player2ColorIndex];
            }
            if (body.label == "Circle Body") {
                body.render.sprite.texture = `hand-${colorNames[player2ColorIndex]}.png`;
            }
        });
        Composite.allConstraints(chain2.composite).forEach(constraint => {
            if (constraint.render) {
                constraint.render.strokeStyle = colors[player2ColorIndex];
            }
        });
    }
}

// Function to animate cards flying off screen
async function animateCardsFlyOff(player) {
    const cardElements = cardPileElement.querySelectorAll('.card');
    const viewportHeight = window.innerHeight;
    
    // Set the animation direction based on player
    const direction = player === 'player1' ? -1 : 1;
    const targetY = direction * (viewportHeight + 100); // Fly off screen with some extra distance

    // Create and apply the animation to each card
    const animations = Array.from(cardElements).map((card, index) => {
        return new Promise(resolve => {
            // Add a slight delay based on card position for a cascading effect
            const delay = (cardElements.length - index) * 100;
            
            // Preserve current transform in inline style
            const currentTransform = card.style.transform || '';
            //get current position
            var style = window.getComputedStyle(card);
            var matrix = new WebKitCSSMatrix(style.transform);
            const currentPosition = matrix.m41;
            //set final position to current position
            card.style.setProperty('--final-position', `${currentPosition}px`);
            card.style.animationDelay = `${delay}ms`;
            
            // Add fly-off animation
            if(player === 'player1') {
                card.classList.add('should-fly-off-top');
            } else {
                card.classList.add('should-fly-off-bottom');
            }
            // debugger;
            
            // Resolve after animation completes
            card.addEventListener('animationend', () => {
                console.log('card animation resolution');
                // Update score for the correct player
                playSound(pointSound);
                if (updatePlayerScore(player, 1)) {
                    return;
                }
                resolve();
            }, { once: true });
        });
    });
    
    // Wait for all animations to complete
    await Promise.all(animations);
    console.log('cards are done flying off screen');
}

// Update player score, return true if player has won
function updatePlayerScore(player, points) {
    if (player === 'player1') {
        player1Score += points;
        player1ScoreElement.textContent = player1Score;
        // Check if player 1 has won
        if (player1Score >= WINNING_SCORE) {
            endGame();
            return true;
        }
    } else {
        player2Score += points;
        player2ScoreElement.textContent = player2Score;
        // Check if player 2 has won
        if (player2Score >= WINNING_SCORE) {
            endGame();
            return true;
        }
    }
    return false;
}

// Handle slap
async function handleSlap(event, player) {    
    if (!isGameActive || isDebugPaused || justSlapped || isPaused) {
        console.log('Game not active or paused or just slapped');
        return;
    } else {
        // debugger;
    }

    justSlapped = true;

    // Stop any new cards from being drawn
    console.log('stopping game');
    clearInterval(gameInterval);

    playSound(slapSound); // Play slap sound

    // Only check conditions for fully animated cards
    const animatedCards = cardPile.filter(card => card.fullyAnimated);
    const conditionsMet = checkConditions(animatedCards);
    
    if (conditionsMet.length > 0) {
        // Get top card and second-most top card for positioning
        const cardElements = cardPileElement.querySelectorAll('.card');
        let topCardElement = null;
        let targetCardOffset = 0;
        
        if (cardElements.length > 0) {
            // Get the top card for insertion point
            topCardElement = cardElements[cardElements.length - 1];
            
            // Get the offset from second-most card if available, or top card if not
            const offsetCardElement = cardElements.length > 1 ? 
                cardElements[cardElements.length - 2] : 
                topCardElement;
                
            if (offsetCardElement) {
                // Extract the final position from the card's style
                const finalPositionStyle = offsetCardElement.style.getPropertyValue('--final-position');
                // Parse the offset value from the CSS value
                targetCardOffset = parseInt(finalPositionStyle) || 0;
            }
            
            // Insert the burst effect after the top card
            // This places it visually behind the top card but above all other cards
            if (offsetCardElement) {
                cardPileElement.insertBefore(burstEffect, offsetCardElement);
            } else {
                cardPileElement.appendChild(burstEffect);
            }
            
            // Pause all card animations
            cardElements.forEach(card => {
                card.style.animationPlayState = 'paused';
            });
        } else {
            // If no cards, add to card pile directly
            cardPileElement.appendChild(burstEffect);
        }
        
        // Show burst effect at the target card's position
        burstEffect.style.transform = `translate(calc(-50% + ${targetCardOffset}px), -50%)`;
        burstEffect.classList.remove('hidden');
        burstEffect.classList.add('show');
        
        // Hide burst effect after 500ms
        setTimeout(() => {
            burstEffect.classList.remove('show');
            burstEffect.classList.add('hidden');
            // Reset transform
            burstEffect.style.transform = 'translate(-50%, -50%)';
            
            // Resume all card animations
            const allCardElements = cardPileElement.querySelectorAll('.card');
            allCardElements.forEach(card => {
                card.style.animationPlayState = 'running';
            });
        }, 500);
        
        // Pause game AFTER a small delay to allow fling animation to start
        setTimeout(() => {
            isPaused = true;
            triggerPhysicsHitstop(player === 'player1');
            playSound(correctSound); // Play correct sound
        }, 100);
        
        // Show success message with points
        showToast(conditionsMet[0].name, 'success', 1000, player, cardPile.length);
        
        // Animate cards flying off screen
        await animateCardsFlyOff(player);
        
        // Clear the card pile after animation
        cardPile = [];
        cardPileElement.innerHTML = '';
        
        // Resume the game
        isPaused = false;
        console.log('resuming game');
        gameInterval = setInterval(drawCard, drawInterval);
        
        // Reset justSlapped after all animations are complete
        justSlapped = false;
    } else if (animatedCards.length > 0) { // Only penalize if there are cards that have finished animating
        // Pause the game
        isPaused = true;
        
        // Pause all card animations
        const cardElements = cardPileElement.querySelectorAll('.card');
        cardElements.forEach(card => {
            card.style.animationPlayState = 'paused';
        });
        
        // Apply penalty to the player who slapped incorrectly
        if (updatePlayerScore(player, -INCORRECT_SLAP_PENALTY)) {
            return;
        }
        
        // Show incorrect slap message with penalty
        showToast('Incorrect Slap', 'error', 1000, player, -INCORRECT_SLAP_PENALTY);
        
        // Play incorrect sound
        playSound(incorrectSound);
        
        // Wait for 0.5 seconds
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Resume all card animations before clearing
        cardElements.forEach(card => {
            card.style.animationPlayState = 'running';
        });
        
        // Clear the card pile after 1 second
        await new Promise(resolve => setTimeout(resolve, 500));
        cardPile = [];
        cardPileElement.innerHTML = '';
        
        // Resume the game
        isPaused = false;
        gameInterval = setInterval(drawCard, drawInterval);
        
        // Reset justSlapped after all animations are complete
        justSlapped = false;
    } else {
        //pile is empty, so just resume the game
        isPaused = false;
        gameInterval = setInterval(drawCard, drawInterval);
        
        // Reset justSlapped immediately since there are no animations
        justSlapped = false;
    }
}

// Function to handle computer's slap decision
async function handleComputerSlap() {
    if (player_count !== 1) return; // Only run in single player mode
    
    // Only check conditions for fully animated cards
    const animatedCards = cardPile.filter(card => card.fullyAnimated);
    const conditionsMet = checkConditions(animatedCards);
    
    if (conditionsMet.length > 0) {
        // 50% chance to slap
        if (Math.random() < COMPUTER_SLAP_CHANCE) {
            // Wait 0.6 seconds before slapping
            await new Promise(resolve => setTimeout(resolve, COMPUTER_SLAP_DELAY));
            
            // Create mock event for handleSlap
            const mockEvent = {
                preventDefault: () => {}
            };
            
            // Trigger fling animation
            playSound(wooshSound);
            fling(true); // true for player 1
            
            // Handle the slap
            handleSlap(mockEvent, 'player1');
        }
    }
}

// Draw card
async function drawCard() {
    if (!isGameActive || isPaused || isDebugPaused) {
        return;
    }
    
    if (deck.length === 0) {
        clearInterval(gameInterval);
        endRound();
        return;
    }

    playSound(drawSound);
    
    const card = deck.pop();
    discardPile.push(card); // Add to discard pile
    console.log(deck.length);
    card.fullyAnimated = false; // Initialize animation state
    cardPile.push(card);
    
    // Create and display the card
    const cardElement = createCardElement(card, cardPile.length - 1);
    cardPileElement.appendChild(cardElement);
    
    // Wait for card animation to complete before checking conditions
    await new Promise(resolve => {
        cardElement.addEventListener('animationend', () => {
            card.fullyAnimated = true;
            resolve();
        }, { once: true });
    });
    
    // Check for computer slap in single player mode
    if (player_count === 1) {
        handleComputerSlap();
    }
}

// Update round start screen
function updateRoundStartScreen() {
    // Duck background music for transition sound
    setTimeout(() => {
        const transitionSound = playRandomTransitionSound();
        duckBackgroundMusicForSound(transitionSound);
    }, 200);
    
    // Update round numbers for next round
    roundNumberElement.textContent = currentRound;
    roundNumberElement2.textContent = currentRound;
    
    // Update status text based on scores
    if (currentRound === 1) {
        player1StatusText.textContent = `First to ${WINNING_SCORE} points wins`;
        player2StatusText.textContent = `First to ${WINNING_SCORE} points wins`;
    } else if (player1Score > player2Score) {
        player1StatusText.textContent = "you're winning";
        player2StatusText.textContent = "you're losing";
    } else if (player2Score > player1Score) {
        player1StatusText.textContent = "you're losing";
        player2StatusText.textContent = "you're winning";
    } else {
        player1StatusText.textContent = "you're tied";
        player2StatusText.textContent = "you're tied";
    }
}

// End round
function endRound() {
    isGameActive = false;
    clearInterval(gameInterval);
    
    // Show round start screen
    gameplayScreen.classList.add('hidden');
    roundStartScreen.classList.remove('hidden');
        
    // Reset countdown bar
    countdownBar.style.width = '350px';

    // Increment round
    currentRound++;
    // Update round start screen
    updateRoundStartScreen();
    
    // Start countdown and then start new round
    animateCountdown(countdownBar).then(() => {
        startNewRound();
    });
}

// Show new condition screen
async function showNewConditionScreen(condition) {
    // Update condition info for both players
    const conditionEmojiLargeElements = document.querySelectorAll('.condition-emoji-large');
    const conditionNameElements = document.querySelectorAll('.condition-name');
    const conditionDescriptionElements = document.querySelectorAll('.condition-description');
    
    conditionEmojiLargeElements.forEach(el => el.textContent = condition.emoji);
    conditionNameElements.forEach(el => el.textContent = condition.name);
    conditionDescriptionElements.forEach(el => el.textContent = condition.description);
    
    // Show new condition screen
    gameplayScreen.classList.add('hidden');
    newConditionScreen.classList.remove('hidden');
    
    // Reset countdown bar
    newConditionCountdownBar.style.width = '350px';
    
    // Animate countdown with 6 second duration
    await animateCountdown(newConditionCountdownBar, 6000);
    
    // Hide new condition screen
    newConditionScreen.classList.add('hidden');
    gameplayScreen.classList.remove('hidden');
}

// Start new round
async function startNewRound() {
    // Calculate draw interval based on current round
    drawInterval = 500 + ((ROUNDS_TO_MAX_SPEED - currentRound) * 100);
    
    // Add a new random condition if there are still inactive ones
    const newConditionRounds = [3, 5, 7];
    if (newConditionRounds.includes(currentRound)) {
        const inactiveConditions = Object.keys(conditions).filter(key => !activeConditions.has(key));
        if (inactiveConditions.length > 0) {
            const randomIndex = Math.floor(Math.random() * inactiveConditions.length);
            const newCondition = inactiveConditions[randomIndex];
            activeConditions.add(newCondition);
            
            // Show new condition screen
            await showNewConditionScreen(conditions[newCondition]);
        }
    }
    
    // Reset round state
    cardPile = [];
    // Clear only the cards, not the overlay
    const cards = cardPileElement.querySelectorAll('.card');
    cards.forEach(card => card.remove());
    isGameActive = true;
    
    // Initialize deck and UI
    initializeDeck();
    displayConditions();
    
    // Show gameplay screen
    roundStartScreen.classList.add('hidden');
    gameplayScreen.classList.remove('hidden');
    
    // Start the game
    gameInterval = setInterval(drawCard, drawInterval);
}

// Helper function to animate the countdown bar
function animateCountdown(bar, duration = 3000) {
    return new Promise(resolve => {
        const startTime = performance.now();
        const startWidth = 350;
        
        function animate(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Calculate new width
            const newWidth = startWidth * (1 - progress);
            bar.style.width = `${newWidth}px`;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                resolve();
            }
        }
        
        requestAnimationFrame(animate);
    });
}

// Update initial conditions screen
function updateInitialConditionsScreen() {
    // Get both player's condition lists
    const player1ConditionsList = document.querySelector('.player1 .initial-conditions-list');
    const player2ConditionsList = document.querySelector('.player2 .initial-conditions-list');
    
    // Clear existing conditions
    player1ConditionsList.innerHTML = '';
    player2ConditionsList.innerHTML = '';
    
    // Add each active condition to both players' lists
    for (const conditionKey of activeConditions) {
        const condition = conditions[conditionKey];
        
        // Create condition element
        const conditionElement = document.createElement('div');
        conditionElement.className = 'initial-condition';
        
        // Create emoji span
        const emojiSpan = document.createElement('span');
        emojiSpan.className = 'condition-emoji';
        emojiSpan.textContent = condition.emoji;
        
        // Create description paragraph
        const descriptionP = document.createElement('p');
        descriptionP.textContent = condition.description;
        
        // Add elements to condition element
        conditionElement.appendChild(emojiSpan);
        conditionElement.appendChild(descriptionP);
        
        // Add condition element to both players' lists
        player1ConditionsList.appendChild(conditionElement.cloneNode(true));
        player2ConditionsList.appendChild(conditionElement.cloneNode(true));
    }
}

// Start game
async function startGame() {    
    // Clear any existing game interval
    if (gameInterval) {
        clearInterval(gameInterval);
    }
    
    // Reset game state
    player1Score = 0;
    player2Score = 0;
    cardPile = [];
    isGameActive = true;
    isPaused = false;
    isDebugPaused = false;
    currentRound = 1;
    drawInterval = 500 + ((ROUNDS_TO_MAX_SPEED - 1) * 100);
    
    // Clear active conditions from previous game
    activeConditions.clear();
    
    // Get all conditions of simplicity 1 that are eligible for starting conditions
    const simplicity1Conditions = Object.entries(conditionsObject)
        .filter(([_, condition]) => condition.simplicity === 1 && condition.startingConditionEligible);
    
    // Get all conditions of simplicity 2 that are eligible for starting conditions
    const simplicity2Conditions = Object.entries(conditionsObject)
        .filter(([_, condition]) => condition.simplicity === 2 && condition.startingConditionEligible);
    
    // Randomly select 1 condition of simplicity 1
    const randomSimplicity1 = simplicity1Conditions[Math.floor(Math.random() * simplicity1Conditions.length)];
    
    // Randomly select 2 conditions of simplicity 2
    const randomSimplicity2 = shuffleArray(simplicity2Conditions).slice(0, 2);
    
    // Helper function to shuffle array
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // Add the selected conditions to activeConditions
    activeConditions.add(randomSimplicity1[0]);
    activeConditions.add(randomSimplicity2[0][0]);
    activeConditions.add(randomSimplicity2[1][0]);
    
    // Update initial conditions screen with selected conditions
    updateInitialConditionsScreen();
    
    // Initialize deck and UI
    initializeDeck();
    displayConditions();
    player1ScoreElement.textContent = '0';
    player2ScoreElement.textContent = '0';
    
    // Clear only the cards, not the overlay
    const cards = cardPileElement.querySelectorAll('.card');
    cards.forEach(card => card.remove());
    
    // Hide all screens except initial conditions
    welcomeScreen.classList.add('hidden');
    lobbyScreen.classList.add('hidden');
    gameplayScreen.classList.add('hidden');
    endScreen.classList.add('hidden');
    roundStartScreen.classList.add('hidden');
    
    // Show initial conditions screen
    const tapText = document.querySelector('.tap-text');
    tapText.textContent = 'tap twice to advance';
    initialConditionsScreen.classList.remove('hidden');
    
    // Handle tap interactions
    let tapCount = 0;
    const handleTap = () => {
        tapCount++;
        playSound(interactSmallSound);
        if (tapCount === 1) {
            tapText.textContent = 'tap once to advance';
        } else if (tapCount === 2) {
            // Remove event listener and proceed to round start
            initialConditionsScreen.removeEventListener('click', handleTap);
            initialConditionsScreen.classList.add('hidden');
            
            // Show round start screen
            roundStartScreen.classList.remove('hidden');
            updateRoundStartScreen();
            countdownBar.style.width = '350px';
            
            // Animate countdown and then start game
            animateCountdown(countdownBar).then(() => {
                playBackgroundMusic();
                roundStartScreen.classList.add('hidden');
                gameplayScreen.classList.remove('hidden');
                physicsCanvas.style.display = 'block';
                gameInterval = setInterval(drawCard, drawInterval);
            });
        }
    };
    
    // Add click event listener
    initialConditionsScreen.addEventListener('click', handleTap);
}

// End game
function endGame() {
    isGameActive = false;
    clearInterval(gameInterval);
    
    const endScreen = document.getElementById('end-screen');
    const winnerScoreElement = document.getElementById('winner-score');
    const winnerTitle = endScreen.querySelector('h2');
    const loserMessage = endScreen.querySelector('.loser-message');
    
    // Determine the winner
    const player1Won = player1Score > player2Score;
    
    // Play win sound and duck background music
    duckBackgroundMusicForSound(winSound);
    playSound(winSound);
    
    // Set appropriate class for positioning
    if (player1Won) {
        endScreen.classList.add('player1-won');
        endScreen.classList.remove('player2-won');
        winnerScoreElement.textContent = player1Score;
        // loserScoreElement.textContent = player2Score;
        
        if (player_count === 1) {
            winnerTitle.textContent = 'Computer Wins!';
            // Get random loss message
            const randomMessage = LOSS_MESSAGES[Math.floor(Math.random() * LOSS_MESSAGES.length)];
            loserMessage.textContent = randomMessage + player2Score + ' points.';
        } else {
            winnerTitle.textContent = 'You Win!';
            // Get random loss message
            const randomMessage = LOSS_MESSAGES[Math.floor(Math.random() * LOSS_MESSAGES.length)];
            loserMessage.textContent = randomMessage + player2Score + ' points.';
        }
    } else {
        endScreen.classList.add('player2-won');
        endScreen.classList.remove('player1-won');
        winnerScoreElement.textContent = player2Score;
        // loserScoreElement.textContent = player1Score;
        
        if (player_count === 1) {
            winnerTitle.textContent = 'You Win!';
            loserMessage.textContent = 'Computer scored ' + player1Score + ' points.';
        } else {
            winnerTitle.textContent = 'You Win!';
            // Get random loss message
            const randomMessage = LOSS_MESSAGES[Math.floor(Math.random() * LOSS_MESSAGES.length)];
            loserMessage.textContent = randomMessage + player1Score + ' points.';
        }
    }
    
    // Show end screen
    gameplayScreen.classList.add('hidden');
    roundStartScreen.classList.add('hidden');
    endScreen.classList.remove('hidden');
}

// Event listeners
playerToggle.addEventListener('change', () => {
    playSound(interactSmallSound);
    player_count = playerToggle.checked ? 2 : 1;
});

continueButton.addEventListener('click', () => {
    playSound(interactBigSound);
    welcomeScreen.classList.add('hidden');
    lobbyScreen.classList.remove('hidden');
    physicsCanvas.style.display = 'block';
    
    // Update lobby screen based on player count
    const player2Tutorial = document.querySelector('.tutorial.player1');
    if (player_count === 1) {
        player2Tutorial.style.visibility = 'hidden';
    } else {
        player2Tutorial.style.visibility = 'visible';
    }
});

playButton.addEventListener('click', (event) => {
    playSound(interactBigSound);
    event.stopPropagation();
    startGame();
});

replayButton.addEventListener('click', (event) => {
    playSound(interactBigSound);
    event.stopPropagation();
    startGame();
});

// Keyboard controls
document.addEventListener('keydown', (event) => {
    if (event.key === '9') {
        debugger;
    }
    // Welcome screen: Enter to start game
    if (!welcomeScreen.classList.contains('hidden')) {
        if (event.key === 'Enter') {
            startGame();
        }
    }
    
    // Round start screen: Enter to continue
    if (!roundStartScreen.classList.contains('hidden')) {
        if (event.key === 'Enter') {
            startNewRound();
        }
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
        
        // Create a mock event object for handleSlap
        const mockEvent = {
            preventDefault: () => {}
        };

        if (event.key === 'd') { // Player 1 slap
            handleSlap(mockEvent, 'player1');
        } else if (event.key === 'k') { // Player 2 slap
            handleSlap(mockEvent, 'player2');
        }
    }
});

var originalTouches = [];

document.addEventListener('touchstart', function(e) {
    let index = e.changedTouches[0].identifier;
    originalTouches[index] = {
        x: e.changedTouches[0].clientX,
        y: e.changedTouches[0].clientY
    };
}, { passive: false });

// Detect swipes for slapping
document.addEventListener('touchend', function(e) {
    // Only process swipes when game is active
    if (isDebugPaused || 
        roundStartScreen.classList.contains('hidden') === false ||
        initialConditionsScreen.classList.contains('hidden') === false ||
        newConditionScreen.classList.contains('hidden') === false ||
        pauseScreen.classList.contains('hidden') === false) {
            console.log('touchend ignored because game is paused or a screen other than the gameplay screen is visible');
        return;
    }

    const viewportHeight = window.innerHeight;
    
    // Determine which player based on the touch identifier
    const index = e.changedTouches[0].identifier;
    const touchStartedOriginal = originalTouches[index].y;
    const isPlayer1Area = touchStartedOriginal < viewportHeight / 2;
    const yDelta = e.changedTouches[0].clientY - originalTouches[index].y;
    const xDelta = e.changedTouches[0].clientX - originalTouches[index].x;
    const distance = Math.sqrt(xDelta * xDelta + yDelta * yDelta);
    const player = isPlayer1Area ? 'player1' : 'player2';

    // In single player mode, ignore swipes on player 1's side
    if (player_count === 1 && isPlayer1Area) {
        return;
    }

    if (distance > SWIPE_THRESHOLD) {                
        console.log(`${player} swipe detected`);
        
        // Create mock event
        const mockEvent = {
            clientY: isPlayer1Area ? viewportHeight * 0.25 : viewportHeight * 0.75,
            preventDefault: () => {}
        };
        
        // Trigger fling animation
        playSound(wooshSound);
        console.log('woosh sound played');
        fling(isPlayer1Area);
        
        // Handle the slap
        handleSlap(mockEvent, player);
    } else {
        // Handle color cycling on welcome screen
        if (lobbyScreen && !lobbyScreen.classList.contains('hidden')) {
            // Check if the touch was on the play button
            const playButton = document.getElementById('play-button');
            const touchX = e.changedTouches[0].clientX;
            const touchY = e.changedTouches[0].clientY;
            const buttonRect = playButton.getBoundingClientRect();
            
            // Only change color if the touch was not on the play button
            if (!(touchX >= buttonRect.left && 
                  touchX <= buttonRect.right && 
                  touchY >= buttonRect.top && 
                  touchY <= buttonRect.bottom)) {
                changeColor(player);
            }
        }
    }
});

// About screen functionality
aboutButton.addEventListener('click', () => {
    playSound(interactBigSound);
    welcomeScreen.classList.add('hidden');
    aboutScreen.classList.remove('hidden');
});

closeAboutButton.addEventListener('click', () => {
    playSound(interactBigSound);
    aboutScreen.classList.add('hidden');
    welcomeScreen.classList.remove('hidden');
});

// Add event listener for rotate button
rotateButton.addEventListener('click', () => {
    playSound(interactSmallSound);
    pauseScreen.classList.toggle('rotated');
});

// Preload sounds
preloadSounds();
