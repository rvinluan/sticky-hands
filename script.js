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
let drawInterval = 1000; // Start with 1 second interval
const CARDS_PER_ROUND = 6; // Cards to add each round
const INITIAL_DECK_SIZE = 15; // Starting deck size
const WINNING_ROUNDS = 1; // Number of rounds to win the game
let currentDeckSize = 0; // Track current deck size
let activeConditions = new Set(); // Track which conditions are active

// Variables to track player swipes
let player1LastTouchStart = { x: 0, y: 0, time: 0 };
let player2LastTouchStart = { x: 0, y: 0, time: 0 };
let lastSlapTime = 0;
let justSlapped = false;
const MIN_SLAP_INTERVAL = 300; // Minimum time between slaps in ms

// Track recent slaps from both players
let player1RecentSlap = { time: 0, valid: false };
let player2RecentSlap = { time: 0, valid: false };
const SIMULTANEOUS_THRESHOLD = 150; // ms - threshold for considering slaps simultaneous

// DOM elements
const welcomeScreen = document.getElementById('welcome-screen');
const gameplayScreen = document.getElementById('gameplay-screen');
const roundStartScreen = document.getElementById('round-start-screen');
const newConditionScreen = document.getElementById('new-condition-screen');
const endScreen = document.getElementById('end-screen');
const playButton = document.getElementById('play-button');
const replayButton = document.getElementById('replay-button');
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
    joker: {
        check: (pile) => {
            if (pile.length < 1) return false;
            const lastCard = pile[pile.length - 1];
            return lastCard.rank === 'joker';
        },
        points: 2,
        name: 'Joker',
        description: 'Slap when a joker appears',
        emoji: '🤡'
    },
    nice: {
        check: (pile) => {
            if (pile.length < 2) return false;
            const lastCard = pile[pile.length - 1];
            const secondLastCard = pile[pile.length - 2];
            return lastCard.rank === '9' && secondLastCard.rank === '6';
        },
        points: 5,
        name: 'Nice',
        description: 'Slap when a 6 is followed by a 9',
        emoji: '😏'
    },
    sandwich: {
        check: (pile) => {
            if (pile.length < 3) return false;
            const lastCard = pile[pile.length - 1];
            const middleCard = pile[pile.length - 2];
            const firstCard = pile[pile.length - 3];
            return lastCard.rank === firstCard.rank && lastCard.rank !== middleCard.rank;
        },
        points: 8,
        name: 'Sandwich',
        description: 'Slap when the top card matches the 3rd card with a different card in between',
        emoji: '🥪'
    },
    flush: {
        check: (pile) => {
            if (pile.length < 3) return false;
            const lastCard = pile[pile.length - 1];
            const secondLastCard = pile[pile.length - 2];
            const thirdLastCard = pile[pile.length - 3];
            return lastCard.suit === secondLastCard.suit && 
                   lastCard.suit === thirdLastCard.suit;
        },
        points: 12,
        name: 'Flush',
        description: 'Slap when the top 3 cards are all the same suit',
        emoji: '🚽'
    },
    double: {
        check: (pile) => {
            if (pile.length < 2) return false;
            const lastCard = pile[pile.length - 1];
            const secondLastCard = pile[pile.length - 2];
            return lastCard.rank === secondLastCard.rank;
        },
        points: 10,
        name: 'Double',
        description: 'Last two cards are the same rank',
        emoji: '👯‍♀️'
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
        description: 'Last two cards sum to 13 (A=11, J/Q/K=10)',
        emoji: '🍀'
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
        description: 'Last two cards are consecutive (A can connect to K or 2)',
        emoji: '➡️'
    }
};

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
        }
    });
}

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
        // Create joker card
        const jokerContent = document.createElement('div');
        jokerContent.className = 'joker-content';
        jokerContent.innerHTML = `
            <div class="joker-emoji">🤡</div>
            <div class="joker-text">JOKER</div>
        `;
        cardElement.appendChild(jokerContent);
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
            cardElement.style.color = 'red';
        } else {
            cardElement.style.color = 'black';
        }
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
function showToast(message, type = 'error', duration = 500, player = null) {
    const toast = document.createElement('div');
    toast.className = `toast ${type} toast-invisible`;
    
    // Add player-specific class if provided
    if (player === 'player1') {
        toast.classList.add('player1');
    } else if (player === 'player2') {
        toast.classList.add('player2');
    }
    
    toast.textContent = message;
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

// Handle slap
async function handleSlap(event, player) {    
    if (!isGameActive || isDebugPaused || justSlapped) {
        console.log('Game not active or paused or just slapped');
        return;
    }

    justSlapped = true;
    setTimeout(() => {
        justSlapped = false;
    }, 1000);
    
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
            clearInterval(gameInterval);
            triggerPhysicsHitstop();
        }, 50);
        
        // Update score for the correct player
        if (player === 'player1') {
            player1Score += conditionsMet[0].points;
            player1ScoreElement.textContent = player1Score;
        } else {
            player2Score += conditionsMet[0].points;
            player2ScoreElement.textContent = player2Score;
        }
        
        // Show success message
        showToast(`${conditionsMet[0].name}! +${conditionsMet[0].points} points`, 'success', 1000, player);
        
        // Wait for 0.5 seconds
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // After 1 second, clear the card pile
        await new Promise(resolve => setTimeout(resolve, 500));
        cardPile = [];
        cardPileElement.innerHTML = '';
        
        // Resume the game
        isPaused = false;
        gameInterval = setInterval(drawCard, drawInterval);
    } else if (animatedCards.length > 0) { // Only penalize if there are cards that have finished animating
        // Pause the game
        isPaused = true;
        clearInterval(gameInterval);
        
        // Pause all card animations
        const cardElements = cardPileElement.querySelectorAll('.card');
        cardElements.forEach(card => {
            card.style.animationPlayState = 'paused';
        });
        
        // Apply penalty to the player who slapped incorrectly
        if (player === 'player1') {
            player1Score -= 5;
            player1ScoreElement.textContent = player1Score;
        } else {
            player2Score -= 5;
            player2ScoreElement.textContent = player2Score;
        }
        
        // Show incorrect slap message with penalty
        showToast('Incorrect Slap! -5 points', 'error', 1000, player);
        
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
    discardPile.push(card); // Add to discard pile
    console.log(deck.length);
    card.fullyAnimated = false; // Initialize animation state
    cardPile.push(card);
    
    // Create and display the card
    const cardElement = createCardElement(card, cardPile.length - 1);
    cardPileElement.appendChild(cardElement);
}

// Update round start screen
function updateRoundStartScreen() {
    // Update round numbers for next round
    roundNumberElement.textContent = currentRound;
    roundNumberElement2.textContent = currentRound;
    
    // Update status text based on scores
    if (player1Score > player2Score) {
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
    
    // Check if we've reached the winning number of rounds
    if (currentRound >= WINNING_ROUNDS) {
        endGame();
        return;
    }
    
    // Show round start screen
    gameplayScreen.classList.add('hidden');
    roundStartScreen.classList.remove('hidden');
        
    // Reset countdown bar
    countdownBar.style.width = '350px';

    // Increment round and decrease interval
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
    // Increment round and decrease interval
    drawInterval = Math.max(500, drawInterval - 100); // Don't go below 100ms
    
    // Add a new random condition if there are still inactive ones
    if (currentRound > 1 && currentRound % 2 == 0) {
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

// Start game
async function startGame() {
    // Reset game state
    player1Score = 0;
    player2Score = 0;
    cardPile = [];
    isGameActive = true;
    currentRound = 1;
    drawInterval = 1000;
    
    // Reset active conditions to only joker
    activeConditions.clear();
    activeConditions.add('joker');
    
    // Initialize deck and UI
    initializeDeck();
    displayConditions();
    player1ScoreElement.textContent = '0';
    player2ScoreElement.textContent = '0';
    
    // Clear only the cards, not the overlay
    const cards = cardPileElement.querySelectorAll('.card');
    cards.forEach(card => card.remove());
    
    // Show round start screen
    welcomeScreen.classList.add('hidden');
    gameplayScreen.classList.add('hidden');
    endScreen.classList.add('hidden');
    roundStartScreen.classList.remove('hidden');
    
    // Update round start screen
    updateRoundStartScreen();
    
    // Reset countdown bar
    countdownBar.style.width = '350px';
    
    // Animate countdown
    await animateCountdown(countdownBar);
    
    // Start the game
    roundStartScreen.classList.add('hidden');
    gameplayScreen.classList.remove('hidden');
    gameInterval = setInterval(drawCard, drawInterval);
}

// End game
function endGame() {
    isGameActive = false;
    clearInterval(gameInterval);
    
    // Update final score
    finalScoreElement.textContent = player1Score;
    finalScoreElement2.textContent = player2Score;

    
    // Show end screen
    gameplayScreen.classList.add('hidden');
    roundStartScreen.classList.add('hidden');
    endScreen.classList.remove('hidden');
}

// Event listeners
playButton.addEventListener('click', (event) => {
    console.log('Play button clicked');
    // event.stopPropagation();
    startGame();
});
replayButton.addEventListener('click', (event) => {
    event.stopPropagation();
    startGame();
});

// Keyboard controls
document.addEventListener('keydown', (event) => {
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
        newConditionScreen.classList.contains('hidden') === false) {
        return;
    }

    const viewportHeight = window.innerHeight;
    
    // Determine which player based on the touch identifier
    const index = e.changedTouches[0].identifier;
    const touchStartedOriginal = originalTouches[index].y;
    const isPlayer1Area = touchStartedOriginal < viewportHeight / 2;
    
    if (true) {                
        const player = isPlayer1Area ? 'player1' : 'player2';
        console.log(`${player} swipe detected`);
        
        // Create mock event
        const mockEvent = {
            clientY: isPlayer1Area ? viewportHeight * 0.25 : viewportHeight * 0.75,
            preventDefault: () => {}
        };
        
        // Trigger fling animation
        fling(isPlayer1Area);
        
        // Handle the slap
        handleSlap(mockEvent, player);
    }
});