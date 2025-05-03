// Game conditions
const conditionsObject = {
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
        points: 20,
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
        points: 10,
        name: 'Sandwich',
        description: 'Slap when two of the same card sandwich another (e.g. 4, 7, 4)',
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
        description: 'Slap when 3 cards in a row are the same suit',
        emoji: '🚽'
    },
    double: {
        check: (pile) => {
            if (pile.length < 2) return false;
            const lastCard = pile[pile.length - 1];
            const secondLastCard = pile[pile.length - 2];
            return lastCard.rank === secondLastCard.rank;
        },
        points: 8,
        name: 'Double',
        description: 'Slap when two cards are the same rank',
        emoji: '👯‍♀️'
    },
    sumTo13: {
        check: (pile) => {
            if (pile.length < 2) return false;
            const lastCard = pile[pile.length - 1];
            const secondLastCard = pile[pile.length - 2];
            const sum = getCardValueFunction(lastCard.rank) + getCardValueFunction(secondLastCard.rank);
            return sum === 13;
        },
        points: 8,
        name: 'Sum to 13',
        description: 'Slap when the last two cards sum to 13 (A=11, J/Q/K=10)',
        emoji: '🍀'
    },
    consecutive: {
        check: (pile) => {
            if (pile.length < 2) return false;
            const lastCard = pile[pile.length - 1];
            const secondLastCard = pile[pile.length - 2];
            return areConsecutiveFunction(lastCard.rank, secondLastCard.rank);
        },
        points: 5,
        name: 'Consecutive',
        description: 'Slap when two cards are consecutive (A can connect to K or 2)',
        emoji: '➡️'
    },
    blackjack: {
        check: (pile) => {
            if (pile.length < 1) return false;
            const lastCard = pile[pile.length - 1];
            return lastCard.rank === 'J' && (lastCard.suit === '♠' || lastCard.suit === '♣');
        },
        points: 5,
        name: 'Blackjack',
        description: 'Slap when a black Jack appears',
        emoji: '⚫️'
    },
    radio: {
        check: (pile) => {
            if (pile.length < 2) return false;
            const lastCard = pile[pile.length - 1];
            const secondLastCard = pile[pile.length - 2];
            return lastCard.rank === '4' && secondLastCard.rank === '10';
        },
        points: 20,
        name: 'Radio',
        description: 'Slap when a 10 is followed by a 4',
        emoji: '📻'
    },
    marriage: {
        check: (pile) => {
            if (pile.length < 2) return false;
            const lastCard = pile[pile.length - 1];
            const secondLastCard = pile[pile.length - 2];
            return (lastCard.rank === 'K' && secondLastCard.rank === 'Q') || 
                   (lastCard.rank === 'Q' && secondLastCard.rank === 'K');
        },
        points: 12,
        name: 'Marriage',
        description: 'Slap when a king and a queen are adjacent',
        emoji: '💍'
    },
    lovers: {
        check: (pile) => {
            if (pile.length < 2) return false;
            const lastCard = pile[pile.length - 1];
            const secondLastCard = pile[pile.length - 2];
            return lastCard.suit === '♥' && secondLastCard.suit === '♥';
        },
        points: 8,
        name: 'Lovers',
        description: 'Slap when the top two cards are hearts',
        emoji: '💕'
    },
    evenSteven: {
        check: (pile) => {
            if (pile.length < 3) return false;
            const lastCard = pile[pile.length - 1];
            const secondLastCard = pile[pile.length - 2];
            const thirdLastCard = pile[pile.length - 3];
            
            // Check if all three are even (2, 4, 6, 8, 10)
            const isEven = rank => ['2', '4', '6', '8', '10'].includes(rank);
            
            return isEven(lastCard.rank) && 
                   isEven(secondLastCard.rank) && 
                   isEven(thirdLastCard.rank);
        },
        points: 12,
        name: 'Even Steven',
        description: 'Slap when 3 cards in a row are even',
        emoji: '✌️'
    }
};

// Helper functions needed by the conditions
function getCardValueFunction(rank) {
    if (rank === 'A') return 11;
    if (['K', 'Q', 'J'].includes(rank)) return 10;
    return parseInt(rank);
}

// Check if two cards are consecutive
function areConsecutiveFunction(rank1, rank2) {
    // Handle face cards and 10
    const faceCardOrder = ['9', '10', 'J', 'Q', 'K', 'A', '2'];
    if (faceCardOrder.includes(rank1) && faceCardOrder.includes(rank2)) {
        const index1 = faceCardOrder.indexOf(rank1);
        const index2 = faceCardOrder.indexOf(rank2);
        return Math.abs(index1 - index2) === 1;
    }
    
    // Handle regular number cards
    const val1 = getCardValueFunction(rank1);
    const val2 = getCardValueFunction(rank2);
    return Math.abs(val1 - val2) === 1;
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        conditionsObject,
        getCardValueFunction,
        areConsecutiveFunction
    };
}

// Export for browser
if (typeof window !== 'undefined') {
    window.gameConditions = {
        conditionsObject,
        getCardValueFunction,
        areConsecutiveFunction
    };
} 