// Import the conditions and helper functions
const { conditionsObject, getCardValueFunction, areConsecutiveFunction } = require('./conditions.js');

// Create a standard deck of cards
function createDeck() {
    const suits = ['♠', '♥', '♦', '♣'];
    const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const deck = [];
    
    // Add standard cards
    for (const suit of suits) {
        for (const rank of ranks) {
            deck.push({ suit, rank });
        }
    }
    
    // Add jokers
    deck.push({ suit: '🃏', rank: 'joker' });
    deck.push({ suit: '🃏', rank: 'joker' });
    
    return deck;
}

// Fisher-Yates shuffle algorithm
function shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}

// Simulate a single game
function simulateGame() {
    const deck = shuffleDeck(createDeck());
    const pile = [];
    const conditionCounts = {};
    
    // Initialize condition counts
    for (const conditionName in conditionsObject) {
        conditionCounts[conditionName] = 0;
    }
    
    // Deal cards and check conditions
    while (deck.length > 0) {
        pile.push(deck.pop());
        
        // Check each condition
        for (const [conditionName, condition] of Object.entries(conditionsObject)) {
            if (condition.check(pile)) {
                conditionCounts[conditionName]++;
            }
        }
    }
    
    return conditionCounts;
}

// Run multiple simulations and calculate averages
function runSimulations(numSimulations) {
    const totalCounts = {};
    const conditionNames = Object.keys(conditionsObject);
    
    // Initialize total counts
    for (const conditionName of conditionNames) {
        totalCounts[conditionName] = 0;
    }
    
    // Run simulations
    for (let i = 0; i < numSimulations; i++) {
        const counts = simulateGame();
        for (const conditionName of conditionNames) {
            totalCounts[conditionName] += counts[conditionName];
        }
    }
    
    // Calculate averages
    const averages = {};
    for (const conditionName of conditionNames) {
        averages[conditionName] = totalCounts[conditionName] / numSimulations;
    }
    
    return averages;
}

// Analyze and display results
function analyzeConditions() {
    const numSimulations = 10000;
    console.log(`Running ${numSimulations} simulations...`);
    
    const averages = runSimulations(numSimulations);
    
    // Sort conditions by frequency
    const sortedConditions = Object.entries(averages)
        .sort((a, b) => b[1] - a[1]);
    
    console.log('\nAverage occurrences per game:');
    console.log('----------------------------');
    for (const [conditionName, average] of sortedConditions) {
        const condition = conditionsObject[conditionName];
        console.log(`${condition.emoji} ${condition.name}: ${average.toFixed(2)}`);
        console.log(`   Points: ${condition.points}`);
        console.log(`   Description: ${condition.description}`);
        console.log('----------------------------');
    }
}

// Run the analysis
analyzeConditions(); 