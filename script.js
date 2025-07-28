//  ┌─────────────────────────────────────────────────────────────────────────┐
//  | Configuration Variables                                                 │
//  └─────────────────────────────────────────────────────────────────────────┘
const CARDS_PER_ROUND = 5; // Cards to add each round
const INITIAL_DECK_SIZE = 10; // Starting deck size
const WINNING_SCORE = 20; // Score needed to win the game
const SINGLE_PLAYER_TOTAL_ROUNDS = 5; // Total rounds for single player mode
const INCORRECT_SLAP_PENALTY = 2; // Points deducted for incorrect slaps
//Computer difficulty settings
var DIFFICULTY = 2; // 1 = easy, 2 = medium, 3 = hard
var COMPUTER_SLAP_CHANCE = 0.5; // Chance for computer to slap
var COMPUTER_SLAP_DELAY = 600; // Delay before computer slaps in ms
var MIN_DRAW_INTERVAL = 800; // Minimum draw interval in ms (fastest speed)
var MAX_DRAW_INTERVAL = 1400; // Maximum draw interval in ms (slowest speed)
const ROUNDS_TO_MAX_SPEED = 9; // Number of rounds until max speed is reached
const SWIPE_THRESHOLD = 70; // Minimum distance for a swipe in pixels
const X_POSITION_OFFSET = 200; // Position offset for player hands
const SIMULTANEOUS_SLAP_THRESHOLD = 100; // Time threshold for simultaneous slaps in ms

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

//  ┌─────────────────────────────────────────────────────────────────────────┐
//  | Gameplay Logic                                                          │
//  └─────────────────────────────────────────────────────────────────────────┘

let mode = 'arcade';

let deck = [];
let unusedCards = []; // Array to store unused cards
let cardPile = [];
let discardPile = []; // Track discarded cards
let gameInterval; // Main loop function
let isGameActive = false;
let isPaused = false;
let isDebugPaused = false; // New debug pause state
let currentRound = 1;
let drawInterval = MAX_DRAW_INTERVAL; // Start at maximum interval (slowest speed)
let drawIntervalDelta = 0; // Amount to reduce draw interval each round
let currentDeckSize = 0; // Track current deck size
let activeConditions = new Set(); // Track which conditions are active

let player_count = 1; // Default to 1 player

class Player {
    constructor(id, colorIndex) {
        this.id = id;
        this.colorIndex = colorIndex;
        this.score = 0;
        this.scoreElement = document.getElementById(`player${id}-score`);
        this.statusTextElement = document.querySelector(`.player${id} .status-text`);
        this.position = { x: 0, y: 0 };
        this.joined = false;
        this.ready = false;
        this.hand = null;
        this.lastSlappedTimestamp = 0; // Track when player last slapped
        this.isThumbsUp = false;
    }

    updateScore(points) {
        this.score += points;
        this.scoreElement.textContent = this.score;
    }

    reset() {
        this.score = 0;
        this.scoreElement.textContent = this.score;
        this.ready = false;
        this.lastSlappedTimestamp = 0;
        // this.statusTextElement.textContent = "";
    }

    updateStatusText(text) {
        this.statusTextElement.textContent = text;
    }
}

let players = [new Player(1, 0), new Player(2, 1), new Player(3, 2), new Player(4, 3)];
// playerPhysicsHands.push(manifestHand(players[0], window.innerWidth / 2 + X_POSITION_OFFSET, window.innerHeight - 15, false, 1));
// players[0].joined = true;
// players[0].ready = true;
// handleIntent('player-1-ready');

let lastSlapTime = 0;
let justSlapped = false;// Track recent slaps from both players
let justChangedColor = false;

//  ┌─────────────────────────────────────────────────────────────────────────┐
//  | DOM Elements                                                            │
//  └─────────────────────────────────────────────────────────────────────────┘
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
const summaryStatusText = document.getElementById('summary-status-text');
const winningPlayerIcon = document.getElementById('winning-player-icon');
const countdownBar = document.getElementById('countdown-bar');
const newConditionCountdownBar = document.getElementById('new-condition-countdown-bar');
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
const debugStatsElement = document.getElementById('debug-stats');
const settingsScreen = document.getElementById('settings-screen');

// Card suits and ranks
const suits = ['♠', '♥', '♦', '♣'];
const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

// Access conditions from the imported gameConditions object
const conditions = window.gameConditions.conditionsObject;

//  ┌─────────────────────────────────────────────────────────────────────────┐
//  | Sound Effects                                                           │
//  └─────────────────────────────────────────────────────────────────────────┘
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

// Settings state
let soundEffectsEnabled = true;
let backgroundMusicEnabled = true;

// Function to update debug stats
function updateDebugStats() {
    if (debugStatsElement) {
        // Only show debug stats on localhost
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            debugStatsElement.textContent = `${window.innerWidth} × ${window.innerHeight}`;
            debugStatsElement.style.display = 'block';
        } else {
            debugStatsElement.style.display = 'none';
        }
    }
}

//  ┌─────────────────────────────────────────────────────────────────────────┐
//  | Settings Functionality                                                  │
//  └─────────────────────────────────────────────────────────────────────────┘

// Initialize settings from localStorage
function initializeSettings() {
    const savedSoundEffects = localStorage.getItem('soundEffectsEnabled');
    const savedBackgroundMusic = localStorage.getItem('backgroundMusicEnabled');
    const savedDifficulty = localStorage.getItem('difficulty');
    
    if (savedSoundEffects !== null) {
        soundEffectsEnabled = savedSoundEffects === 'true';
        document.getElementById('sound-effects-toggle').checked = soundEffectsEnabled;
    }
    
    if (savedBackgroundMusic !== null) {
        backgroundMusicEnabled = savedBackgroundMusic === 'true';
        document.getElementById('background-music-toggle').checked = backgroundMusicEnabled;
    }
    
    if (savedDifficulty !== null) {
        DIFFICULTY = parseInt(savedDifficulty);
        document.getElementById(`difficulty-${DIFFICULTY === 1 ? 'easy' : DIFFICULTY === 2 ? 'medium' : 'hard'}`).checked = true;
    }
}

// Save settings to localStorage
function saveSettings() {
    localStorage.setItem('soundEffectsEnabled', soundEffectsEnabled.toString());
    localStorage.setItem('backgroundMusicEnabled', backgroundMusicEnabled.toString());
    localStorage.setItem('difficulty', DIFFICULTY.toString());
}

//  ┌─────────────────────────────────────────────────────────────────────────┐
//  | Audio                                                          │
//  └─────────────────────────────────────────────────────────────────────────┘

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
    if (sound && soundEffectsEnabled) {
        sound.currentTime = 0; // Reset to start
        sound.play().catch(error => {
            console.log('Error playing sound:', error);
        });
    }
}

function playRandomTransitionSound() {
    if (!backgroundMusicEnabled) return null;
    
    const transitionSounds = [t1Sound, t2Sound, t3Sound, t4Sound, t5Sound];
    const randomSound = transitionSounds[Math.floor(Math.random() * transitionSounds.length)];
    //bypass the playSound function because this isn't a sound effect
    randomSound.currentTime = 0; // Reset to start
    randomSound.play().catch(error => {
        console.log('Error playing sound:', error);
    });
    return randomSound;
}

// Play background music with looping
function playBackgroundMusic() {
    if (backgroundMusic && backgroundMusicEnabled) {
        backgroundMusic.loop = true;
        backgroundMusic.currentTime = 0;
        backgroundMusic.play().catch(error => {
            console.log('Error playing background music:', error);
        });
    }
}

// Smoothly transition audio volume
function transitionVolume(audioElement, targetVolume, duration = 200) {
    if (!backgroundMusicEnabled) return;
    
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

//  ┌─────────────────────────────────────────────────────────────────────────┐
//  | Helper Functions                                                        │
//  └─────────────────────────────────────────────────────────────────────────┘

/*
Player Areas Diagram Depending on Player Count:
2 Players:          3 Players:          4 Players:
┌────────┐         ┌────────┐         ┌────────┐
│   2    │         │ 2    3 │         │ 2    3 │
├────────┤         ├────────┤         ├────────┤
│   1    │         │   1    │         │ 4    1 │
└────────┘         └────────┘         └────────┘
*/

function getPlayerArea(x, y, playerCount=4) {
    if(y < window.innerHeight / 2) {
        //top half
        if(playerCount < 3) {
            return 2;
        }
        if(x < window.innerWidth / 2) {
            //left
            return 2;
        } else {
            //right
            return 3;
        }
    } else {
        //bottom half
        if(playerCount < 3) {
            return 1;
        }
        if(x < window.innerWidth / 2) {
            //left
            if(playerCount < 4) {
                return 1;
            } else {
                return 4;
            }
        } else {
            //right
            return 1;
        }
    }   
}

function isScreenActive(screenName) {
    return !document.getElementById(screenName).classList.contains('hidden');
}


//  ┌─────────────────────────────────────────────────────────────────────────┐
//  | Pause Screen Logic                                                      │
//  └─────────────────────────────────────────────────────────────────────────┘

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

//  ┌─────────────────────────────────────────────────────────────────────────┐
//  | Gameplay Logic - Cards                                                  │
//  └─────────────────────────────────────────────────────────────────────────┘

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
        deck = unusedCards.splice(0, INITIAL_DECK_SIZE);
        // // Add jokers to deck
        // deck.push({ rank: 'joker' });
        // deck.push({ rank: 'joker' });   
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

//  ┌─────────────────────────────────────────────────────────────────────────┐
//  | Gameplay Logic - UI                                                     │
//  └─────────────────────────────────────────────────────────────────────────┘

// Show toast message
function showToast(message, type = 'error', duration = 500, player = null, points = null) {
    const toast = document.createElement('div');
    toast.className = `toast ${type} toast-invisible`;
    
    // Add player-specific class if provided
    toast.classList.add(`player${player.id}`);
    
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
    const pileAnimatedOnly = pile.filter(card => card.fullyAnimated);
    const metConditions = [];
    // Only check active conditions
    for (const [key, condition] of Object.entries(conditions)) {
        if (activeConditions.has(key) && condition.check(pileAnimatedOnly)) {
            metConditions.push({ name: condition.name, points: condition.points });
        }
    }
    return metConditions;
}

function changeColor(player) {
    if(justChangedColor) {
        console.log('just changed color');
        return;
    } else {
        playSound(changeSound);
        player.colorIndex = (player.colorIndex + 1) % colors.length;
        Composite.allBodies(player.hand.composite).forEach(body => {
            if (body.render) {
                body.render.fillStyle = colors[player.colorIndex];
            }
            if (body.label == "Circle Body") {
                body.render.sprite.texture = `hand-${colorNames[player.colorIndex]}.png`;
            }
        });
        Composite.allConstraints(player.hand.composite).forEach(constraint => {
            if (constraint.render) {
                constraint.render.strokeStyle = colors[player.colorIndex];
            }
        });
        justChangedColor = true;
        setTimeout(() => {
            justChangedColor = false;
        }, 10);
    }
}

// Function to animate cards flying off screen
async function animateCardsFlyOff(player) {
    const cardElements = cardPileElement.querySelectorAll('.card');
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    
    // Calculate target x position based on player
    let targetX = 0;
    if (player.id === 1) {
        // Player 1: bottom-right
        targetX = viewportWidth * 0.25;
    } else if (player.id === 2) {
        // Player 2: top-left
        targetX = -viewportWidth * 0.25;
    } else if (player.id === 3) {
        // Player 3: top-right
        targetX = viewportWidth * 0.25;
    } else if (player.id === 4) {
        // Player 4: bottom-left
        targetX = -viewportWidth * 0.25;
    }
    
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
            card.style.setProperty('--target-x', `${targetX}px`);
            card.style.animationDelay = `${delay}ms`;
            
            // Add fly-off animation
            if(player.position.y < window.innerHeight / 2) {
                card.classList.add('should-fly-off-top');
            } else {
                card.classList.add('should-fly-off-bottom');
            }
            
            // Resolve after animation completes
            card.addEventListener('animationend', () => {
                console.log('card animation resolution');
                // Update score for the correct player
                playSound(pointSound);
                player.updateScore(1);
                if(player.score >= WINNING_SCORE) {
                    endGame();
                    resolve();
                }
                resolve();
            }, { once: true });
        });
    });
    
    // Wait for all animations to complete
    await Promise.all(animations);
    console.log('cards are done flying off screen');
}

function checkForSimultaneousSlaps(player) {    
    let simultaneousSlaps = players
        .filter(p => p.joined) // Only check ready players who have joined
        .every(p => {
            const timeDelta = Math.abs(player.lastSlappedTimestamp - p.lastSlappedTimestamp);
            return timeDelta < SIMULTANEOUS_SLAP_THRESHOLD;
        });

    return simultaneousSlaps;
}
// Handle slap
async function handleSlap(player) {    
    if (!isGameActive) {
        //just do a fling animation but nothing else
        playSound(wooshSound);
        fling(player);
        // Check for slaps, we only do this here because during gameplay it's irrelevant
        const currentTime = Date.now();
        player.lastSlappedTimestamp = currentTime;
        if (checkForSimultaneousSlaps(player)) {
            // Wait 500ms before starting the game
            isGameActive = true;
            playSound(slapSound);
            playSound(correctSound);
            setTimeout(() => {
                triggerPhysicsHitstop(player);
            }, 150);
            setTimeout(() => {
                if(!welcomeScreen.classList.contains('hidden')) {
                    progressToLobbyScreen();
                } else if (!endScreen.classList.contains('hidden')) {
                    endScreen.classList.add('hidden');
                    welcomeScreen.classList.remove('hidden');
                    resetPlayers();
                    resetGame();
                }
            }, 500);
            return;
        }
        return;
    } else if (isDebugPaused || justSlapped || isPaused) {
        console.log('Game not active or paused or just slapped');
        return;
    }

    justSlapped = true;

    // Stop any new cards from being drawn
    console.log('stopping game');
    clearInterval(gameInterval);

    // Trigger fling animation
    playSound(wooshSound);
    fling(player);

    const conditionsMet = checkConditions(cardPile);
    
    if (conditionsMet.length > 0) {
        await resolveSuccessfulSlap(conditionsMet, player);
    } else if (cardPile.length > 0) { // Only penalize if there are cards in the pile
        await resolveIncorrectSlap(player);
    }

    // Clear the card pile
    cardPile = [];
    cardPileElement.innerHTML = '';
    
    // Resume the game
    isPaused = false;
    gameInterval = setInterval(drawCard, drawInterval);
    
    // Reset justSlapped
    justSlapped = false; 
}

async function resolveSuccessfulSlap(conditionsMet, player) {
    // Get top card and second-most top card for positioning
    const cardElements = cardPileElement.querySelectorAll('.card');
    let targetCardOffset = 0;
    let topCardElement = cardElements[cardElements.length - 1];

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
        cardElements.forEach(card => {
            card.style.animationPlayState = 'running';
        });
    }, 500);

    // Physics hitstop AFTER a small delay to allow fling
    setTimeout(() => {
        triggerPhysicsHitstop(player);
        playSound(slapSound);
        playSound(correctSound); // Play correct sound
    }, 100);

    // Show success message with points
    showToast(conditionsMet[0].name, 'success', 1000, player, cardPile.length);

    // Animate cards flying off screen
    await animateCardsFlyOff(player);
}

async function resolveIncorrectSlap(player) {
    // Pause the game
    isPaused = true;
        
    // Pause all card animations
    const cardElements = cardPileElement.querySelectorAll('.card');
    cardElements.forEach(card => {
        card.style.animationPlayState = 'paused';
    });
    
    // Apply penalty to the player who slapped incorrectly
    // No need to check for win since this deducts points
    player.updateScore(-INCORRECT_SLAP_PENALTY);
    
    // Show incorrect slap message with penalty
    showToast('Incorrect Slap', 'error', 1000, player, -INCORRECT_SLAP_PENALTY);
    
    // Play incorrect sound
    playSound(slapSound);
    playSound(incorrectSound);
    
    // Clear the card pile after 1 second
    await new Promise(resolve => setTimeout(resolve, 1000));
}

// Function to handle computer's slap decision
async function handleComputerSlap() {    
    const conditionsMet = checkConditions(cardPile);
    if (conditionsMet.length > 0) {
        // 50% chance to slap
        if (Math.random() < COMPUTER_SLAP_CHANCE) {
            // Wait 0.6 seconds before slapping
            await new Promise(resolve => setTimeout(resolve, COMPUTER_SLAP_DELAY));            
            handleSlap(players[0]);
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

function seeWhosWinning() {
    let playingPlayers = players.filter(p => p.ready);
    var currentWinner = playingPlayers[0].id;
    var currentWinnerScore = playingPlayers[0].score;
    var isTied = true;
    for(let i = 0; i < playingPlayers.length; i++) {
        if(playingPlayers[i].score > currentWinnerScore) {
            currentWinner = playingPlayers[i].id;
            currentWinnerScore = playingPlayers[i].score;
            isTied = false;
        } else if(playingPlayers[i].score < currentWinnerScore) {
            isTied = false;
        }
    }
    if(isTied) {
        return 0;
    } else {
        return currentWinner;
    }
}

function getPlayerIcon(player) {
    let color = colorNames[player.colorIndex];
    let imagepath = 'hand-' + color + '.png';
    console.log(imagepath);
    return imagepath;
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
    // roundNumberElement2.textContent = currentRound;

    const winner = seeWhosWinning();
    
    // Update status text based on game mode
    if (mode === 'arcade') {
        if(currentRound === 1) {
            summaryStatusText.textContent = "First to " + WINNING_SCORE + " points wins!";
        } else {
            if(winner === 0) {  
                summaryStatusText.textContent = "It's a tie!";
                winningPlayerIcon.classList.add('hidden');
            } else {
                console.log(getPlayerIcon(players[winner - 1]));
                winningPlayerIcon.classList.remove('hidden');
                winningPlayerIcon.src = getPlayerIcon(players[winner - 1]);
                var winnerSummary = "Player " + (winner) + " is winning!";
                summaryStatusText.textContent = winnerSummary;
            }
        }
    } else if(player_count === 1) {
        // Single player mode: show rounds left
        const roundsLeft = SINGLE_PLAYER_TOTAL_ROUNDS - currentRound + 1;
        if(roundsLeft === 1) {
            summaryStatusText.textContent = "Final round!";
        } else {
            summaryStatusText.textContent = roundsLeft + " rounds left";
        }
    } else {
        // Two player mode: show who's winning for each player
        for (let i = 0; i < player_count; i++) {
            players[i].updateStatusText(i === winner ? "You're winning!" : "You're losing!");
        }
    }
}

// End round
function endRound() {
    isGameActive = false;
    clearInterval(gameInterval);
    
    // Check if game should end (single player mode: after 8 rounds)
    if (player_count === 1 && currentRound >= SINGLE_PLAYER_TOTAL_ROUNDS) {
        endGame();
        return;
    }
    
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
    // Reduce draw interval by the calculated delta for faster speed
    drawInterval = Math.max(MIN_DRAW_INTERVAL, drawInterval - drawIntervalDelta);
    
    // Add a new random condition if there are still inactive ones
    const newConditionRounds = [3, 5, 7];
    if (newConditionRounds.includes(currentRound)) {
        const inactiveConditions = Object.keys(conditions).filter(key => !activeConditions.has(key));
        if (inactiveConditions.length > 0) {
            const randomIndex = Math.floor(Math.random() * inactiveConditions.length);
            let newCondition = inactiveConditions[randomIndex];
            activeConditions.add(newCondition);

            if (newCondition === 'joker') {                
                // Add jokers if joker condition is active
                deck.push({ rank: 'joker' });
                deck.push({ rank: 'joker' });
            }
            
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

function configureInitialConditionsScreen() {
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
    displayInitialConditions();
    
    // Add click event listener
    if(mode === 'touch') {
        // Handle tap interactions
        let tapCount = 0;
        let tapText = document.querySelector('.tap-text');
        const handleTap = () => {
            tapCount++;
            playSound(interactSmallSound);
            if (tapCount === 1) {
                tapText.textContent = 'tap once to advance';
            } else if (tapCount === 2) {
                beginRoundOne();
            }
        };
        initialConditionsScreen.addEventListener('click', handleTap);
    } else {
        //the logic for checking if all players are ready lives in handleIntent()
    }
    
}

function checkForAllPlayersReady() {
    let allPlayersReady = true;
    players.forEach(player => {
        if (player.joined && !player.ready) {
            allPlayersReady = false;
        }
    });
    if(allPlayersReady) {
        startCountdown();
    }
}

function startCountdown() {
    const COUNTDOWN_TOTAL = 5;
    let countdown = COUNTDOWN_TOTAL;
    const tapText = document.querySelector('.tap-text');
    
    // Update text to show countdown starting
    tapText.textContent = 'Game starting in ' + COUNTDOWN_TOTAL + '...';
    initialConditionsScreen.querySelector('.countdown-bar').classList.remove('hidden');
    animateCountdown(initialConditionsScreen.querySelector('.countdown-bar'), COUNTDOWN_TOTAL * 1000);
    initialConditionsScreen.querySelector('h3').classList.add('hidden');
    
    const countdownInterval = setInterval(() => {
        countdown--;
        
        if (countdown > 0) {
            tapText.textContent = `Game starting in ${countdown}...`;
        } else {
            // Countdown finished
            clearInterval(countdownInterval);
            beginRoundOne();
        }
    }, 1000);
}
// Update initial conditions screen
function displayInitialConditions() {
    // Get both player's condition lists
    const bothConditionsList = document.querySelectorAll('.initial-conditions-list');
    
    bothConditionsList.forEach(list => {
        list.innerHTML = '';
        // Add each active condition to both players' lists
        for (const conditionKey of activeConditions) {
            const condition = conditions[conditionKey];
            
            // Create condition element
            const conditionElement = document.createElement('div');
            conditionElement.className = 'initial-condition';
            conditionElement.classList.add('card-style');

            // Add face-down class in arcade mode
            if (document.documentElement.classList.contains('arcade')) {
                conditionElement.classList.add('face-down');
            }

            // Create card back face
            const cardBack = document.createElement('div');
            cardBack.className = 'card-face back';
            
            // Create card front face
            const cardFront = document.createElement('div');
            cardFront.className = 'card-face front';

            // Create title span
            const titleSpan = document.createElement('h4');
            titleSpan.className = 'condition-title';
            titleSpan.textContent = condition.name;
            
            // Create emoji span
            const emojiSpan = document.createElement('span');
            emojiSpan.className = 'condition-emoji';
            emojiSpan.textContent = condition.emoji;
            
            // Create description paragraph
            const descriptionP = document.createElement('p');
            descriptionP.textContent = condition.description;
            
            // Add elements to front face
            cardFront.appendChild(titleSpan);
            cardFront.appendChild(emojiSpan);
            cardFront.appendChild(descriptionP);
            
            // Add both faces to condition element
            conditionElement.appendChild(cardBack);
            conditionElement.appendChild(cardFront);
            
            // Add condition element to both players' lists
            list.appendChild(conditionElement.cloneNode(true));
        }
    });

    initialConditionsScreen.classList.remove('hidden');
    
    // Start card flipping animation in arcade mode after 1 second
    if (document.documentElement.classList.contains('arcade')) {
        setTimeout(() => {
            flipInitialConditionCards();
        }, 1000);
    }
}

// Function to flip initial condition cards one by one
function flipInitialConditionCards() {
    const cardElements = document.querySelectorAll('.initial-condition.card-style.face-down');
    
    cardElements.forEach((card, index) => {
        setTimeout(() => {
            card.classList.remove('face-down');
        }, index * 300); // Flip each card 300ms apart
    });
}

function resetPlayers() {
    players[0].reset();
    players[1].reset();
    players[2].reset();
    players[3].reset();
}

function resetGame() {
    // Reset game state
    if (gameInterval) {
        clearInterval(gameInterval);
    }
    cardPile = [];
    isGameActive = false;
    isPaused = false;
    isDebugPaused = false;
    justSlapped = false;
    currentRound = 1;

    // Clear only the cards, not the overlay
    const cards = cardPileElement.querySelectorAll('.card');
    cards.forEach(card => card.remove());        
}

// Start game
async function startGame() {    
    resetGame();
    
    isGameActive = true;
    
    // Set difficulty
    if (DIFFICULTY === 1) {
        COMPUTER_SLAP_CHANCE = 0.5;
        COMPUTER_SLAP_DELAY = 700;
        MIN_DRAW_INTERVAL = 1200;
    } else if (DIFFICULTY === 2) {
        COMPUTER_SLAP_CHANCE = 0.5;
        COMPUTER_SLAP_DELAY = 500;
        MIN_DRAW_INTERVAL = 800;
    } else if (DIFFICULTY === 3) {
        COMPUTER_SLAP_CHANCE = 0.9;
        COMPUTER_SLAP_DELAY = 400;
        MIN_DRAW_INTERVAL = 700;
    }

    // Calculate draw interval delta based on rounds to max speed
    drawIntervalDelta = (MAX_DRAW_INTERVAL - MIN_DRAW_INTERVAL) / (ROUNDS_TO_MAX_SPEED - 1);
    drawInterval = MAX_DRAW_INTERVAL; // Start at maximum interval (slowest speed)
    
    // Initialize deck
    initializeDeck();
    // Add jokers if joker condition is active
    if (activeConditions.has('joker')) {
        // Remove two random cards from the deck
        deck.splice(Math.floor(Math.random() * deck.length), 1);
        deck.splice(Math.floor(Math.random() * deck.length), 1);
        
        // Add two jokers to the deck
        deck.push({ rank: 'joker' });
        deck.push({ rank: 'joker' });
        
        // Shuffle deck again after adding jokers
        shuffleDeck();
    }

    // display the conditions on the gameplay screen
    displayConditions();
    
    // Show score elements for joined players
    players.forEach(player => {
        const scoreElement = document.getElementById(`player${player.id}-score`);
        if (scoreElement) {
            if (player.joined) {
                scoreElement.classList.remove('hidden');
                if(player.id == 2 || player.id == 3) {
                    if(mode === 'arcade') {
                        scoreElement.classList.remove('mirrored');
                    } else {
                        scoreElement.classList.add('mirrored');
                    }
                }
            } else {
                scoreElement.classList.add('hidden');
            }
        }
    });
}

function beginRoundOne() {
    // Remove event listener and proceed to round start
    // initialConditionsScreen.removeEventListener('click', handleTap);
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
        players.forEach(player => putThumbsDown(player));
    });
}
// End game
function endGame() {
    isGameActive = false;
    clearInterval(gameInterval);
    
    const endScreen = document.getElementById('end-screen');
    const winnerScoreElement = document.getElementById('winner-score');
    const winnerTitle = endScreen.querySelector('h2');
    const loserMessage = endScreen.querySelector('.loser-message');
    
    // Play win sound and duck background music
    duckBackgroundMusicForSound(winSound);
    playSound(winSound);
    
    if(mode === 'arcade') {
        let winner = seeWhosWinning();
        let winnerPlayerTextElement = endScreen.querySelector('#winner-player');
        let winnerPlayerIcon = endScreen.querySelector('#winner-player-icon');
        winnerPlayerTextElement.textContent = winner;
        winnerPlayerIcon.src = getPlayerIcon(players[winner - 1]);
    } else {
        if (player_count === 1) {
            // Single player mode: show final score
            endScreen.classList.add('player2-won'); // Always show player 2 side
            endScreen.classList.remove('player1-won');
            winnerScoreElement.textContent = players[1].score;
            winnerTitle.textContent = 'Game Complete!';
            loserMessage.textContent = '';
        } else {
            // Two player mode: determine the winner
            const player1Won = players[0].score > players[1].score;
            
            // Set appropriate class for positioning
            if (player1Won) {
                endScreen.classList.add('player1-won');
                endScreen.classList.remove('player2-won');
                winnerScoreElement.textContent = players[0].score;
                
                winnerTitle.textContent = 'You Win!';
                // Get random loss message
                const randomMessage = LOSS_MESSAGES[Math.floor(Math.random() * LOSS_MESSAGES.length)];
                loserMessage.textContent = randomMessage + players[1].score + ' points.';
            } else {
                endScreen.classList.add('player2-won');
                endScreen.classList.remove('player1-won');
                winnerScoreElement.textContent = players[1].score;
                
                winnerTitle.textContent = 'You Win!';
                // Get random loss message
                const randomMessage = LOSS_MESSAGES[Math.floor(Math.random() * LOSS_MESSAGES.length)];
                loserMessage.textContent = randomMessage + players[0].score + ' points.';
            }
        }
    }
    
    // Hide all score elements when game ends
    for (let i = 1; i <= 4; i++) {
        const scoreElement = document.getElementById(`player${i}-score`);
        if (scoreElement) {
            scoreElement.classList.add('hidden');
        }
    }
    
    // Show end screen
    gameplayScreen.classList.add('hidden');
    roundStartScreen.classList.add('hidden');
    endScreen.classList.remove('hidden');
    justSlapped = false;
}

//  ┌─────────────────────────────────────────────────────────────────────────┐
//  | Lobby Functionality                                                     │
//  └─────────────────────────────────────────────────────────────────────────┘

function progressToLobbyScreen() {
    welcomeScreen.classList.add('hidden');
    if(mode === 'arcade') {
        lobbyScreen.classList.add('hidden');
        player_count = players.filter(p => p.ready).length;
        configureInitialConditionsScreen();
        startGame();
    } else {
        lobbyScreen.classList.remove('hidden');
        // playerToggle.addEventListener('change', () => {
        //     playSound(interactSmallSound);
        //     player_count = playerToggle.checked ? 2 : 1;
        // });
    
        // continueButton.addEventListener('click', () => {
        //     playSound(interactBigSound);
        //     welcomeScreen.classList.add('hidden');
        //     lobbyScreen.classList.remove('hidden');
        //     physicsCanvas.style.display = 'block';
        //     configureLobbyScreen();
        // });
    }
}

function configureLobbyScreen() {
    // Update lobby screen based on player count
    const player2Tutorial = document.querySelector('.tutorial.mirrored');
    if (player_count === 1) {
        player2Tutorial.style.visibility = 'hidden';
        document.querySelector('.color-change-instruction.mirrored').style.visibility = 'hidden';
    } else {
        player2Tutorial.style.visibility = 'visible';
    }
}

// replayButton.addEventListener('click', (event) => {
//     playSound(interactBigSound);
//     event.stopPropagation();
//     startGame();
// });

document.querySelectorAll('.color-change-instruction').forEach(instruction => {
    instruction.addEventListener('click', () => {
        changeColor(instruction.classList.contains('mirrored') ? players[0] : players[1]);
    });
});

//  ┌─────────────────────────────────────────────────────────────────────────┐
//  | Settings and About Functionality                                        │
//  └─────────────────────────────────────────────────────────────────────────┘

if(!document.documentElement.classList.contains('arcade')) {
    aboutButton.addEventListener('click', () => {
        playSound(interactBigSound);
        welcomeScreen.classList.add('hidden');
        aboutScreen.classList.remove('hidden');
        populateRulesTab();
    });

    closeAboutButton.addEventListener('click', () => {
        playSound(interactBigSound);
        aboutScreen.classList.add('hidden');
        welcomeScreen.classList.remove('hidden');
    });
}

// Tab switching functionality
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanels = document.querySelectorAll('.tab-panel');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            
            // Remove active class from all buttons and panels
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanels.forEach(panel => panel.classList.remove('active'));
            
            // Add active class to clicked button and corresponding panel
            button.classList.add('active');
            document.getElementById(`${targetTab}-tab`).classList.add('active');
            
            // Play sound effect
            playSound(interactSmallSound);
        });
    });
}

// Populate rules tab with all conditions
function populateRulesTab() {
    const allRulesContainer = document.getElementById('all-rules');
    
    // Clear existing content
    allRulesContainer.innerHTML = '';
    
    // Get all conditions from the conditions object
    const allConditions = Object.entries(window.gameConditions.conditionsObject);
    
    // Sort conditions by simplicity for better organization
    allConditions.sort(([_, a], [__, b]) => a.simplicity - b.simplicity);
    
    // Populate all rules in one list
    allConditions.forEach(([key, condition]) => {
        const ruleItem = createRuleItem(condition);
        allRulesContainer.appendChild(ruleItem);
    });
}

// Create a rule item element
function createRuleItem(condition) {
    const ruleItem = document.createElement('div');
    ruleItem.className = 'rule-item';
    
    const ruleHeader = document.createElement('div');
    ruleHeader.className = 'rule-header';
    
    const ruleEmoji = document.createElement('span');
    ruleEmoji.className = 'rule-emoji';
    ruleEmoji.textContent = condition.emoji;
    
    const ruleName = document.createElement('span');
    ruleName.className = 'rule-name';
    ruleName.textContent = condition.name;
    
    ruleHeader.appendChild(ruleEmoji);
    ruleHeader.appendChild(ruleName);
    
    const ruleDescription = document.createElement('div');
    ruleDescription.className = 'rule-description';
    ruleDescription.textContent = condition.description;
    
    ruleItem.appendChild(ruleHeader);
    ruleItem.appendChild(ruleDescription);
    
    return ruleItem;
}

// Add event listener for rotate button
rotateButton.addEventListener('click', () => {
    playSound(interactSmallSound);
    pauseScreen.classList.toggle('rotated');
});

// Settings toggle event listeners
document.getElementById('sound-effects-toggle').addEventListener('change', (event) => {
    soundEffectsEnabled = event.target.checked;
    saveSettings();
    playSound(interactSmallSound); // Play a sound to confirm the setting works
});

document.getElementById('background-music-toggle').addEventListener('change', (event) => {
    backgroundMusicEnabled = event.target.checked;
    saveSettings();
    
    if (!backgroundMusicEnabled && backgroundMusic) {
        // Stop background music if disabled
        backgroundMusic.pause();
        backgroundMusic.currentTime = 0;
    } else if (backgroundMusicEnabled && isGameActive && backgroundMusic) {
        // Resume background music if enabled and game is active
        playBackgroundMusic();
    }
    
    playSound(interactSmallSound); // Play a sound to confirm the setting works
});

// Difficulty radio button event listeners
document.getElementById('difficulty-easy').addEventListener('change', (event) => {
    if (event.target.checked) {
        DIFFICULTY = 1;
        saveSettings();
        playSound(interactSmallSound);
    }
});

document.getElementById('difficulty-medium').addEventListener('change', (event) => {
    if (event.target.checked) {
        DIFFICULTY = 2;
        saveSettings();
        playSound(interactSmallSound);
    }
});

document.getElementById('difficulty-hard').addEventListener('change', (event) => {
    if (event.target.checked) {
        DIFFICULTY = 3;
        saveSettings();
        playSound(interactSmallSound);
    }
});
//  ┌─────────────────────────────────────────────────────────────────────────┐
//  | Event Handling from Input.js                                            │
//  └─────────────────────────────────────────────────────────────────────────┘

function isCurrentScreenSwipeable() {
    const swipeableScreens = [gameplayScreen, lobbyScreen, welcomeScreen, endScreen];
    return swipeableScreens.some(screen => !screen.classList.contains('hidden'));
}

function handleIntent(intent) {
    switch(intent) {
        case 'player-1-join':
            updateJoinMessage(1, 'join');
            break;
        case 'player-2-join':
            updateJoinMessage(2, 'join');
            break;
        case 'player-3-join':
            updateJoinMessage(3, 'join');
            break;
        case 'player-4-join':
            updateJoinMessage(4, 'join');
            break;
        case 'player-1-unjoin':
            updateJoinMessage(1, 'unjoin');
            break;
        case 'player-2-unjoin':
            updateJoinMessage(2, 'unjoin');
            break;
        case 'player-3-unjoin':
            updateJoinMessage(3, 'unjoin');
            break;
        case 'player-4-unjoin':
            updateJoinMessage(4, 'unjoin');
            break;
        case 'player-1-ready':
            updateJoinMessage(1, 'ready');
            checkForAllPlayersReady();
            break;
        case 'player-2-ready':
            updateJoinMessage(2, 'ready');
            checkForAllPlayersReady();
            break;
        case 'player-3-ready':
            updateJoinMessage(3, 'ready');
            checkForAllPlayersReady();
            break;
        case 'player-4-ready':
            updateJoinMessage(4, 'ready');
            checkForAllPlayersReady();
            break;
        case 'player-1-slap':
        case 'player-2-slap':
        case 'player-3-slap':
        case 'player-4-slap':
            if(!isCurrentScreenSwipeable()) {
                return;
            }
            console.log(intent);
            handleSlap(players[intent.split('-')[1] - 1]);
            break;
        case 'pause-card-draw':
            if(!gameplayScreen.classList.contains('hidden')) {
                isDebugPaused = !isDebugPaused;
                if (isDebugPaused) {
                    console.log('Debug: Game timer paused');
                } else {
                    console.log('Debug: Game timer resumed');
                }
            }
            break;
        default:
            console.log(`Unknown intent: ${intent}`);
            break;
    }
}

function updateJoinMessage(playerNum, state) {
    console.log("player did something");
    // Map playerNum to class
    const classMap = {1: 'player1', 2: 'player2', 3: 'player3', 4: 'player4'};
    // Use PLAYER_KEYBINDS from input.js
    const keyMap = window.PLAYER_KEYBINDS || {
        1: { primary: 'k', secondary: 'l' },
        2: { primary: 'w', secondary: 'q' },
        3: { primary: 'o', secondary: 'p' },
        4: { primary: 'd', secondary: 's' }
    };
    const joinDiv = document.querySelector(`.screen:not(.hidden) .player-join-status .${classMap[playerNum]}`);
    if (joinDiv) {
        const joinText = joinDiv.querySelector('.join-text');
        const unjoinText = joinDiv.querySelector('.unjoin-text');
        if (state === 'join') {
            // joinText.textContent = `Press `;
            // const keySpan = document.createElement('span');
            // keySpan.className = 'key-code';
            // keySpan.textContent = keyMap[playerNum].primary;
            // joinText.appendChild(keySpan);
            // joinText.appendChild(document.createTextNode(' to ready!'));
            joinText.classList.add('hidden');
            unjoinText.innerHTML = `Press <span class="key-code">${keyMap[playerNum].secondary}</span> to un-join`;
            unjoinText.classList.remove('hidden');
        } else if (state === 'unjoin') {
            joinText.textContent = `Press `;
            const keySpan = document.createElement('span');
            keySpan.className = 'key-code';
            keySpan.textContent = keyMap[playerNum].primary;
            joinText.appendChild(keySpan);
            joinText.appendChild(document.createTextNode(' to join'));
            joinText.classList.remove('hidden');
            unjoinText.innerHTML = `Press <span class="key-code">${keyMap[playerNum].secondary}</span> to un-join`;
            unjoinText.classList.add('hidden');
        } else if (state === 'ready') {
            // const readyText = joinDiv.querySelector('.ready-text');
            // readyText.classList.remove('hidden');
        }
    }
    
    // Update player selection text based on whether any players have joined
    updatePlayerSelectionText();
}

function updatePlayerSelectionText() {
    const playerSelectionDiv = document.querySelector('.player-selection p');
    if (playerSelectionDiv) {
        const hasJoinedPlayers = players.some(p => p.joined);
        if (hasJoinedPlayers) {
            playerSelectionDiv.textContent = 'All players slap simultaneously to start the game';
        } else {
            playerSelectionDiv.textContent = 'Waiting for players to join...';
        }
    }
}

function configureWelcomeScreen() {
    playerToggle.addEventListener('change', () => {
        playSound(interactSmallSound);
        player_count = playerToggle.checked ? 2 : 1;
    });

    continueButton.addEventListener('click', () => {
        playSound(interactBigSound);
        welcomeScreen.classList.add('hidden');
        lobbyScreen.classList.remove('hidden');
        physicsCanvas.style.display = 'block';
        configureLobbyScreen();
    });   
}

//  ┌─────────────────────────────────────────────────────────────────────────┐
//  | Initialize Game                                                         │
//  └─────────────────────────────────────────────────────────────────────────┘
function initializeGame() {
    // Preload sounds
    preloadSounds();

    // Initialize settings
    initializeSettings();

    // Initialize tabs
    initializeTabs();

    // Initialize debug stats
    updateDebugStats();

    // Add window resize event listener for debug stats
    window.addEventListener('resize', updateDebugStats);
    
    // Initialize player selection text
    updatePlayerSelectionText();

    if(document.documentElement.classList.contains('arcade')) {
        mode = 'arcade';
    } else {
        mode = 'touch';
        configureWelcomeScreen();
        playButton.addEventListener('click', (event) => {
            playSound(interactBigSound);
            event.stopPropagation();
            lobbyScreen.classList.add('hidden');
            configureInitialConditionsScreen();
            startGame();
        });
        replayButton.addEventListener('click', (event) => {
            playSound(interactBigSound);
            event.stopPropagation();
            endScreen.classList.add('hidden');
            configureInitialConditionsScreen();
            startGame();
        });
    }
}

initializeGame();
