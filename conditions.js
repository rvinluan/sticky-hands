// Game conditions
const conditionsObject = {
    joker: {
        check: (pile) => {
            if (pile.length < 1) return false;
            const lastCard = pile[pile.length - 1];
            return lastCard.rank === 'joker';
        },
        name: 'Joker',
        description: 'Slap when a joker appears',
        emoji: '🤡',
        chipImage: 'chips/joker.png',
        simplicity: 1,
        startingConditionEligible: true,
        example: 'Joker'
    },
    jackblack: {
        check: (pile) => {
            if (pile.length < 1) return false;
            const lastCard = pile[pile.length - 1];
            return lastCard.rank === 'J' && (lastCard.suit === '♠' || lastCard.suit === '♣');
        },
        name: 'Jack Black',
        description: 'Slap when a black Jack appears',
        emoji: '🐼',
        chipImage: 'chips/blackjack.png',
        simplicity: 1,
        startingConditionEligible: true,
        example: 'J♠ or J♣'
    },
    lucky7: {
        check: (pile) => {
            if (pile.length < 1) return false;
            const lastCard = pile[pile.length - 1];
            return lastCard.rank === '7';
        },
        name: 'Lucky 7',
        description: 'Slap when a 7 appears',
        emoji: '🍀',
        chipImage: 'chips/seven.png',
        simplicity: 1,
        startingConditionEligible: true,
        example: '7<span style="color: red;">♥</span>, 7<span style="color: red;">♦</span>, 7♣, or 7♠'
    },
    spiders: {
        check: (pile) => {
            if (pile.length < 1) return false;
            const lastCard = pile[pile.length - 1];
            return lastCard.rank === '8';
        },
        name: 'Spiders!',
        description: 'Slap when an 8 appears',
        emoji: '🕷️',
        chipImage: 'chips/eight.png',
        simplicity: 1,
        startingConditionEligible: true,
        example: '8<span style="color: red;">♥</span>, 8<span style="color: red;">♦</span>, 8♣, or 8♠'
    },
    six: {
        check: (pile) => {
            if (pile.length < 1) return false;
            const lastCard = pile[pile.length - 1];
            return lastCard.rank === '6';
        },
        name: 'Six!',
        description: 'Slap when a 6 appears',
        emoji: '🎲',
        chipImage: 'chips/six.png',
        simplicity: 1,
        startingConditionEligible: true,
        example: '6<span style="color: red;">♥</span>, 6<span style="color: red;">♦</span>, 6♣, or 6♠'
    },
    highFive: {
        check: (pile) => {
            if (pile.length < 1) return false;
            const lastCard = pile[pile.length - 1];
            return lastCard.rank === '5';
        },
        name: 'High Five',
        description: 'Slap when a 5 appears',
        emoji: '✋',
        chipImage: 'chips/five.png',
        simplicity: 1,
        startingConditionEligible: true,
        example: '5<span style="color: red;">♥</span>, 5<span style="color: red;">♦</span>, 5♣, or 5♠'
    },
    redQueen: {
        check: (pile) => {
            if (pile.length < 1) return false;
            const lastCard = pile[pile.length - 1];
            return lastCard.rank === 'Q' && (lastCard.suit === '♥' || lastCard.suit === '♦');
        },
        name: 'Red Queen',
        description: 'Slap when a red Queen appears',
        emoji: '👑',
        chipImage: 'chips/redqueen.png',
        simplicity: 1,
        startingConditionEligible: true,
        example: 'Q<span style="color: red;">♥</span> or Q<span style="color: red;">♦</span>'
    },
    nice: {
        check: (pile) => {
            if (pile.length < 2) return false;
            const lastCard = pile[pile.length - 1];
            const secondLastCard = pile[pile.length - 2];
            return lastCard.rank === '9' && secondLastCard.rank === '6';
        },
        name: 'Nice',
        description: 'Slap when a 6 is followed by a 9',
        emoji: '😏',
        chipImage: 'chips/nice.png',
        simplicity: 2,
        startingConditionEligible: false,
        example: '6<span style="color: red;">♥</span>, 9♠'
    },
    double: {
        check: (pile) => {
            if (pile.length < 2) return false;
            const lastCard = pile[pile.length - 1];
            const secondLastCard = pile[pile.length - 2];
            return lastCard.rank === secondLastCard.rank;
        },
        name: 'Double',
        description: 'Slap when two cards in a row are equal rank',
        emoji: '👯‍♀️',
        chipImage: 'chips/doubles.png',
        simplicity: 2,
        startingConditionEligible: true,
        example: '7<span style="color: red;">♥</span>, 7♠'
    },
    sumTo12: {
        check: (pile) => {
            if (pile.length < 2) return false;
            const lastCard = pile[pile.length - 1];
            const secondLastCard = pile[pile.length - 2];
            // Return false if either card is a face card (J, Q, K, A)
            if (['J', 'Q', 'K', 'A'].includes(lastCard.rank) || 
                ['J', 'Q', 'K', 'A'].includes(secondLastCard.rank)) {
                return false;
            }
            const sum = getCardValueFunction(lastCard.rank) + getCardValueFunction(secondLastCard.rank);
            return sum === 12;
        },
        name: 'Sum to 12',
        description: 'Slap when two cards in a row sum to 12 (face cards are 0)',
        emoji: '🕛',
        chipImage: 'chips/twelve.png',
        simplicity: 2,
        startingConditionEligible: false,
        example: '5<span style="color: red;">♥</span>, 7♠ (5+7=12)'
    },
    consecutive: {
        check: (pile) => {
            if (pile.length < 2) return false;
            const lastCard = pile[pile.length - 1];
            const secondLastCard = pile[pile.length - 2];
            return areConsecutiveFunction(lastCard.rank, secondLastCard.rank);
        },
        name: 'Consecutive',
        description: 'Slap when two cards in a row are consecutive',
        emoji: '➡️',
        chipImage: 'chips/consecutive.png',
        simplicity: 2,
        startingConditionEligible: true,
        example: '4<span style="color: red;">♥</span>, 5♠ or J<span style="color: red;">♥</span>, 10♠'
    },
    radio: {
        check: (pile) => {
            if (pile.length < 2) return false;
            const lastCard = pile[pile.length - 1];
            const secondLastCard = pile[pile.length - 2];
            return lastCard.rank === '4' && secondLastCard.rank === '10';
        },
        name: 'Radio',
        description: 'Slap when a 10 is followed by a 4',
        emoji: '📻',
        chipImage: 'chips/radio.png',
        simplicity: 2,
        startingConditionEligible: false,
        example: '10<span style="color: red;">♥</span>, 4♠'
    },
    lovers: {
        check: (pile) => {
            if (pile.length < 2) return false;
            const lastCard = pile[pile.length - 1];
            const secondLastCard = pile[pile.length - 2];
            return lastCard.suit === '♥' && secondLastCard.suit === '♥';
        },
        name: 'Lovers',
        description: 'Slap when two cards in a row are hearts',
        emoji: '💕',
        chipImage: 'chips/hearts.png',
        simplicity: 2,
        startingConditionEligible: true,
        example: '7<span style="color: red;">♥</span>, 2<span style="color: red;">♥</span>'
    },
    spades: {
        check: (pile) => {
            if (pile.length < 2) return false;
            const lastCard = pile[pile.length - 1];
            const secondLastCard = pile[pile.length - 2];
            return lastCard.suit === '♠' && secondLastCard.suit === '♠';
        },
        name: 'Dig It',
        description: 'Slap when two cards in a row are spades',
        emoji: '🕳️',
        chipImage: 'chips/spades.png',
        simplicity: 2,
        startingConditionEligible: true,
        example: 'K♠, 3♠'
    },
    clubs: {
        check: (pile) => {
            if (pile.length < 2) return false;
            const lastCard = pile[pile.length - 1];
            const secondLastCard = pile[pile.length - 2];
            return lastCard.suit === '♣' && secondLastCard.suit === '♣';
        },
        name: 'Party Night',
        description: 'Slap when two cards in a row are clubs',
        emoji: '🕺',
        chipImage: 'chips/clubs.png',
        simplicity: 2,
        startingConditionEligible: true,
        example: 'A♣, 8♣'
    },
    diamonds: {
        check: (pile) => {
            if (pile.length < 2) return false;
            const lastCard = pile[pile.length - 1];
            const secondLastCard = pile[pile.length - 2];
            return lastCard.suit === '♦' && secondLastCard.suit === '♦';
        },
        name: 'Rich Vein',
        description: 'Slap when two cards in a row are diamonds',
        emoji: '💎',
        chipImage: 'chips/diamonds.png',
        simplicity: 2,
        startingConditionEligible: true,
        example: 'Q<span style="color: red;">♦</span>, 6<span style="color: red;">♦</span>'
    },
    evenSteven: {
        check: (pile) => {
            if (pile.length < 2) return false;
            const lastCard = pile[pile.length - 1];
            const secondLastCard = pile[pile.length - 2];
            
            // Check if both cards are even (2, 4, 6, 8, 10)
            const isEven = rank => ['2', '4', '6', '8', '10'].includes(rank);
            
            return isEven(lastCard.rank) && 
                   isEven(secondLastCard.rank);
        },
        name: 'Even Steven',
        description: 'Slap when 2 number cards in a row are both even',
        emoji: '👱‍♂️',
        chipImage: 'chips/evensteven.png',
        simplicity: 2,
        startingConditionEligible: true,
        example: '4<span style="color: red;">♥</span>, 8♠'
    },
    oddTodd: {
        check: (pile) => {
            if (pile.length < 2) return false;
            const lastCard = pile[pile.length - 1];
            const secondLastCard = pile[pile.length - 2];
            
            // Check if both cards are odd (3, 5, 7, 9)
            const isOdd = rank => ['3', '5', '7', '9'].includes(rank);
            
            return isOdd(lastCard.rank) && 
                   isOdd(secondLastCard.rank);
        },
        name: 'Odd Todd',
        description: 'Slap when 2 number cards in a row are both odd',
        emoji: '👨‍🦰',
        chipImage: 'chips/oddtodd.png',
        simplicity: 2,
        startingConditionEligible: false,
        example: '3<span style="color: red;">♥</span>, 7♠'
    },
    paperSizes: {
        check: (pile) => {
            if (pile.length < 2) return false;
            const lastCard = pile[pile.length - 1];
            const secondLastCard = pile[pile.length - 2];
            
            // Check if first card is Ace and second card is a number
            const isNumber = rank => ['2', '3', '4', '5', '6', '7', '8', '9', '10'].includes(rank);
            
            return secondLastCard.rank === 'A' && isNumber(lastCard.rank);
        },
        name: 'Paper Sizes',
        description: 'Slap when an Ace is followed by any number',
        emoji: '📄',
        chipImage: 'chips/papersizes.png',
        simplicity: 2,
        startingConditionEligible: false,
        example: 'A<span style="color: red;">♥</span>, 5♠'
    },
    bestDecade: {
        check: (pile) => {
            if (pile.length < 2) return false;
            const lastCard = pile[pile.length - 1];
            const secondLastCard = pile[pile.length - 2];
            
            // Check if first card is 9 and second card is a number
            const isNumber = rank => ['2', '3', '4', '5', '6', '7', '8', '9', '10'].includes(rank);
            
            return secondLastCard.rank === '9' && isNumber(lastCard.rank);
        },
        name: 'Best Decade',
        description: 'Slap when a 9 is followed by any number',
        emoji: '🎵',
        chipImage: 'chips/bestdecade.png',
        simplicity: 2,
        startingConditionEligible: false,
        example: '9<span style="color: red;">♥</span>, 3♠'
    },
    sandwich: {
        check: (pile) => {
            if (pile.length < 3) return false;
            const lastCard = pile[pile.length - 1];
            const middleCard = pile[pile.length - 2];
            const firstCard = pile[pile.length - 3];
            return lastCard.rank === firstCard.rank && lastCard.rank !== middleCard.rank;
        },
        name: 'Sandwich',
        description: 'Slap when two of the same card sandwich another',
        emoji: '🥪',
        chipImage: 'chips/sandwich.png',
        simplicity: 3,
        startingConditionEligible: false,
        example: '4<span style="color: red;">♥</span>, 7♠, 4♣'
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
        name: 'Flush',
        description: 'Slap when 3 cards in a row are the same suit',
        emoji: '🚽',
        chipImage: 'chips/flush.png',
        simplicity: 3,
        startingConditionEligible: true,
        example: '2<span style="color: red;">♥</span>, 7<span style="color: red;">♥</span>, K<span style="color: red;">♥</span>'
    },
    deserted: {
        check: (pile) => {
            if (pile.length < 4) return false;
            const lastCard = pile[pile.length - 1];
            const secondLastCard = pile[pile.length - 2];
            const thirdLastCard = pile[pile.length - 3];
            const fourthLastCard = pile[pile.length - 4];

            // Check that none are face cards (J, Q, K, A)
            const faceCards = ['J', 'Q', 'K', 'A'];
            return ![lastCard, secondLastCard, thirdLastCard, fourthLastCard]
                .some(card => faceCards.includes(card.rank));
        },
        name: 'Deserted',
        description: 'Slap when 4 cards in a row are not face cards',
        emoji: '🌵',
        chipImage: 'chips/faceless.png',
        simplicity: 4,
        startingConditionEligible: false,
        example: '2<span style="color: red;">♥</span>, 5♠, 8<span style="color: red;">♦</span>, 3♣'
    },
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