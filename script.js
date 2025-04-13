// Game state
let deck = [];
let cardPile = [];
let player1Score = 0;
let player2Score = 0;
let gameInterval;
let isGameActive = false;
let isPaused = false;
let isDebugPaused = false; // New debug pause state
let currentRound = 1;
let drawInterval = 1000; // Start with 1 second interval
const CARDS_PER_ROUND = 3; // Cards to add each round
const INITIAL_DECK_SIZE = 22; // Starting deck size
const WINNING_ROUNDS = 10; // Number of rounds to win

// DOM elements
const welcomeScreen = document.getElementById('welcome-screen');
const gameplayScreen = document.getElementById('gameplay-screen');
const roundEndScreen = document.getElementById('round-end-screen');
const endScreen = document.getElementById('end-screen');
const playButton = document.getElementById('play-button');
const replayButton = document.getElementById('replay-button');
const continueButton = document.getElementById('continue-button');
const cardPileElement = document.getElementById('card-pile');
const finalScoreElement = document.getElementById('final-score');
const roundScoreElement = document.getElementById('round-score');
const roundNumberElement = document.getElementById('round-number');
const countdownOverlay = document.getElementById('countdown-overlay');
const countdownNumber = document.getElementById('countdown-number');
const player1ScoreElement = document.getElementById('player1-score');
const player2ScoreElement = document.getElementById('player2-score');

// Card suits and ranks
const suits = ['♠', '♥', '♦', '♣'];
const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

// Convert card rank to numerical value
function getCardValue(rank) {
    if (rank === 'A') return 11;
    if (['K', 'Q', 'J'].includes(rank)) return 10;
    return parseInt(rank);
}

// Check if two cards are consecutive
function areConsecutive(rank1, rank2) {
    // Handle face cards and 10
    const faceCardOrder = ['9', '10', 'J', 'Q', 'K', 'A', '2'];
    if (faceCardOrder.includes(rank1) && faceCardOrder.includes(rank2)) {
        const index1 = faceCardOrder.indexOf(rank1);
        const index2 = faceCardOrder.indexOf(rank2);
        return Math.abs(index1 - index2) === 1;
    }
    
    // Handle regular number cards
    const val1 = getCardValue(rank1);
    const val2 = getCardValue(rank2);
    return Math.abs(val1 - val2) === 1;
}

// Game conditions
const conditions = {
    double: {
        check: (pile) => {
            if (pile.length < 2) return false;
            const lastCard = pile[pile.length - 1];
            const secondLastCard = pile[pile.length - 2];
            return lastCard.rank === secondLastCard.rank;
        },
        points: 10,
        name: 'Double',
        description: 'Last two cards are the same rank'
    },
    sumTo13: {
        check: (pile) => {
            if (pile.length < 2) return false;
            const lastCard = pile[pile.length - 1];
            const secondLastCard = pile[pile.length - 2];
            const sum = getCardValue(lastCard.rank) + getCardValue(secondLastCard.rank);
            return sum === 13;
        },
        points: 10,
        name: 'Sum to 13',
        description: 'Last two cards sum to 13 (A=11, J/Q/K=10)'
    },
    consecutive: {
        check: (pile) => {
            if (pile.length < 2) return false;
            const lastCard = pile[pile.length - 1];
            const secondLastCard = pile[pile.length - 2];
            return areConsecutive(lastCard.rank, secondLastCard.rank);
        },
        points: 5,
        name: 'Consecutive',
        description: 'Last two cards are consecutive (A can connect to K or 2)'
    }
};

// Display game conditions
function displayConditions() {
    conditionsListElement.innerHTML = '';
    Object.values(conditions).forEach((condition, index) => {
        const span = document.createElement('span');
        span.textContent = `${condition.name} (+${condition.points})`;
        conditionsListElement.appendChild(span);
    });
}

// Initialize deck
function initializeDeck() {
    deck = [];
    for (const suit of suits) {
        for (const rank of ranks) {
            deck.push({ suit, rank });
        }
    }
    shuffleDeck();
    
    // If it's the first round, take INITIAL_DECK_SIZE cards
    if (currentRound === 1) {
        deck = deck.slice(0, INITIAL_DECK_SIZE);
    } else {
        // For subsequent rounds, take INITIAL_DECK_SIZE + (round-1) * CARDS_PER_ROUND cards
        const cardsForRound = INITIAL_DECK_SIZE + (currentRound - 1) * CARDS_PER_ROUND;
        deck = deck.slice(0, cardsForRound);
    }
    
    // updateDeckCount();
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
    const finalPosition = offset - 60;
    
    // Add random rotation between -5 and 5 degrees
    const rotation = (Math.random() * 10) - 5;
    
    // Combine translation and rotation in the transform property
    cardElement.style.setProperty('--final-position', `${finalPosition}px`);
    cardElement.style.setProperty('--rotation', `${rotation}deg`);
    
    // Create top left rank and suit
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
        cardElement.style.color = 'red';
    } else {
        cardElement.style.color = 'black';
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
            console.log('Card animation complete:', card);
        });
    }, 10);
    
    return cardElement;
}

// Show toast message
function showToast(message, type = 'error', duration = 500) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    // Set the animation duration using CSS variable
    toast.style.setProperty('--toast-duration', `${duration}ms`);
    
    // Position toast above the card pile
    const pileRect = cardPileElement.getBoundingClientRect();
    toast.style.left = `${pileRect.left + pileRect.width / 2}px`;
    toast.style.top = `${pileRect.top - 30}px`;
    
    document.body.appendChild(toast);
    
    // Remove toast after animation
    setTimeout(() => {
        toast.remove();
    }, duration);
}

// Check for conditions
function checkConditions(pile) {
    const metConditions = [];
    for (const [key, condition] of Object.entries(conditions)) {
        if (condition.check(pile)) {
            metConditions.push({ name: condition.name, points: condition.points });
        }
    }
    return metConditions;
}

// Handle slap
async function handleSlap(event) {
    console.log('Slap detected');
    console.log('Tap position:', event.clientY);
    
    if (!isGameActive || isPaused || isDebugPaused) {
        console.log('Game not active or paused');
        return;
    }
    
    // Only check conditions for fully animated cards
    const animatedCards = cardPile.filter(card => card.fullyAnimated);
    console.log('Animated cards:', animatedCards);
    const conditionsMet = checkConditions(animatedCards);
    console.log('Conditions met:', conditionsMet);
    
    // Determine which player slapped based on tap position
    const viewportHeight = window.innerHeight;
    const tapY = event.clientY;
    const isPlayer1 = tapY < viewportHeight / 2;
    console.log('Is Player 1:', isPlayer1);
    
    if (conditionsMet.length > 0) {
        // Pause the game
        isPaused = true;
        clearInterval(gameInterval);
        
        // Update score for the correct player
        if (isPlayer1) {
            player1Score += conditionsMet[0].points;
            player1ScoreElement.textContent = player1Score;
        } else {
            player2Score += conditionsMet[0].points;
            player2ScoreElement.textContent = player2Score;
        }
        
        // Show success message
        showToast(`${conditionsMet[0].name}! +${conditionsMet[0].points} points`, 'success');
        
        // Wait for 0.5 seconds
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Clear pile after 1 second
        await new Promise(resolve => setTimeout(resolve, 500));
        cardPile = [];
        cardPileElement.innerHTML = '';
        
        // Resume the game
        isPaused = false;
        gameInterval = setInterval(drawCard, drawInterval);
    } else {
        // Pause the game
        isPaused = true;
        clearInterval(gameInterval);
        
        // Apply penalty to the player who slapped incorrectly
        if (isPlayer1) {
            player1Score -= 5;
            player1ScoreElement.textContent = player1Score;
        } else {
            player2Score -= 5;
            player2ScoreElement.textContent = player2Score;
        }
        
        // Show incorrect slap message with penalty
        showToast('Incorrect Slap! -5 points', 'error');
        
        // Wait for 0.5 seconds
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Clear the card pile after 1 second
        await new Promise(resolve => setTimeout(resolve, 500));
        cardPile = [];
        cardPileElement.innerHTML = '';
        
        // Resume the game
        isPaused = false;
        gameInterval = setInterval(drawCard, drawInterval);
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
    
    const card = deck.pop();
    card.fullyAnimated = false; // Initialize animation state
    cardPile.push(card);
    
    // Create and display the card
    const cardElement = createCardElement(card, cardPile.length - 1);
    cardPileElement.appendChild(cardElement);
}

// End round
function endRound() {
    isGameActive = false;
    clearInterval(gameInterval);
    
    // Update round end screen
    roundScoreElement.textContent = player1Score + player2Score;
    roundNumberElement.textContent = currentRound;
    
    // Show round end screen
    gameplayScreen.classList.add('hidden');
    roundEndScreen.classList.remove('hidden');
}

// Start new round
async function startNewRound() {
    // Increment round and decrease interval
    currentRound++;
    drawInterval = Math.max(100, drawInterval - 100); // Don't go below 100ms
    
    // Reset round state
    cardPile = [];
    // Clear only the cards, not the overlay
    const cards = cardPileElement.querySelectorAll('.card');
    cards.forEach(card => card.remove());
    isGameActive = true;
    
    // Initialize deck and UI
    initializeDeck();
    
    // Show gameplay screen
    roundEndScreen.classList.add('hidden');
    gameplayScreen.classList.remove('hidden');
    
    // Show countdown overlay
    countdownOverlay.classList.remove('hidden');
    
    // Start countdown
    for (let i = 3; i > 0; i--) {
        countdownNumber.textContent = i;
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Hide countdown and start game
    countdownOverlay.classList.add('hidden');
    gameInterval = setInterval(drawCard, drawInterval);
}

// Start game
async function startGame() {
    // Reset game state
    player1Score = 0;
    player2Score = 0;
    cardPile = [];
    isGameActive = true;
    currentRound = 1;
    drawInterval = 1000;
    
    // Initialize deck and UI
    initializeDeck();
    player1ScoreElement.textContent = '0';
    player2ScoreElement.textContent = '0';
    
    // Clear only the cards, not the overlay
    const cards = cardPileElement.querySelectorAll('.card');
    cards.forEach(card => card.remove());
    
    // Show gameplay screen
    welcomeScreen.classList.add('hidden');
    gameplayScreen.classList.remove('hidden');
    endScreen.classList.add('hidden');
    roundEndScreen.classList.add('hidden');
    
    // Show countdown overlay
    countdownOverlay.classList.remove('hidden');
    
    // Start countdown
    for (let i = 3; i > 0; i--) {
        countdownNumber.textContent = i;
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Hide countdown and start game
    countdownOverlay.classList.add('hidden');
    gameInterval = setInterval(drawCard, drawInterval);
}

// End game
function endGame() {
    isGameActive = false;
    clearInterval(gameInterval);
    
    // Update final score
    finalScoreElement.textContent = player1Score + player2Score;
    
    // Show end screen
    gameplayScreen.classList.add('hidden');
    roundEndScreen.classList.add('hidden');
    endScreen.classList.remove('hidden');
}

// Event listeners
playButton.addEventListener('click', startGame);
replayButton.addEventListener('click', startGame);
continueButton.addEventListener('click', startNewRound);

// Touch controls
document.body.addEventListener('click', (event) => {
    // Only handle slaps if the gameplay screen is visible and countdown is not showing
    if (!gameplayScreen.classList.contains('hidden') && 
        countdownOverlay.classList.contains('hidden')) {
        handleSlap(event);
    }
});

// Keyboard controls
document.addEventListener('keydown', (event) => {
    // Welcome screen: Enter to start game
    if (!welcomeScreen.classList.contains('hidden')) {
        if (event.key === 'Enter') {
            startGame();
        }
    }
    
    // Round end screen: Enter to continue
    if (!roundEndScreen.classList.contains('hidden')) {
        if (event.key === 'Enter') {
            startNewRound();
        }
    }

    // Gameplay screen: Keyboard shortcuts for slaps and debug
    if (!gameplayScreen.classList.contains('hidden') && 
        countdownOverlay.classList.contains('hidden')) {
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
            clientY: event.key === 'd' ? 0 : window.innerHeight, // Top for player 1, bottom for player 2
            preventDefault: () => {}
        };

        if (event.key === 'd') { // Player 1 slap
            handleSlap(mockEvent);
        } else if (event.key === 'k') { // Player 2 slap
            handleSlap(mockEvent);
        }
    }
}); 