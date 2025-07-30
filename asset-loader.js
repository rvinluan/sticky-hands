// Asset Loader - Preloads all game assets
class AssetLoader {
    constructor() {
        this.sounds = [
            'sounds/bell.mp3',
            'sounds/brass.mp3',
            'sounds/change.mp3',
            'sounds/correct-major.mp3',
            'sounds/correct.mp3',
            'sounds/correct.aif',
            'sounds/draw.mp3',
            'sounds/incorrect.mp3',
            'sounds/incorrect.aif',
            'sounds/pan.mp3',
            'sounds/Point.mp3',
            'sounds/slap1.mp3',
            'sounds/slap1.aif',
            'sounds/snap.mp3',
            'sounds/transition-1.mp3',
            'sounds/transition-2.mp3',
            'sounds/transition-3.mp3',
            'sounds/transition-4.mp3',
            'sounds/transition-5.mp3',
            'sounds/win.mp3',
            'sounds/woodblock.mp3',
            'sounds/woosh.mp3'
        ];
        
        this.cardImages = [
            'Card Images/2-Clubs.png',
            'Card Images/2-Diamonds.png',
            'Card Images/2-Hearts.png',
            'Card Images/2-Spades.png',
            'Card Images/3-Clubs.png',
            'Card Images/3-Diamonds.png',
            'Card Images/3-Hearts.png',
            'Card Images/3-Spades.png',
            'Card Images/4-Clubs.png',
            'Card Images/4-Diamonds.png',
            'Card Images/4-Hearts.png',
            'Card Images/4-Spades.png',
            'Card Images/5-Clubs.png',
            'Card Images/5-Diamonds.png',
            'Card Images/5-Hearts.png',
            'Card Images/5-Spades.png',
            'Card Images/6-Clubs.png',
            'Card Images/6-Diamonds.png',
            'Card Images/6-Hearts.png',
            'Card Images/6-Spades.png',
            'Card Images/7-Clubs.png',
            'Card Images/7-Diamonds.png',
            'Card Images/7-Hearts.png',
            'Card Images/7-Spades.png',
            'Card Images/8-Clubs.png',
            'Card Images/8-Diamonds.png',
            'Card Images/8-Hearts.png',
            'Card Images/8-Spades.png',
            'Card Images/9-Clubs.png',
            'Card Images/9-Diamonds.png',
            'Card Images/9-Hearts.png',
            'Card Images/9-Spades.png',
            'Card Images/10-Clubs.png',
            'Card Images/10-Diamonds.png',
            'Card Images/10-Hearts.png',
            'Card Images/10-Spades.png',
            'Card Images/A-Clubs.png',
            'Card Images/A-Diamonds.png',
            'Card Images/A-Hearts.png',
            'Card Images/A-Spades.png',
            'Card Images/J-Clubs.png',
            'Card Images/J-Diamonds.png',
            'Card Images/J-Hearts.png',
            'Card Images/J-Spades.png',
            'Card Images/Q-Clubs.png',
            'Card Images/Q-Diamonds.png',
            'Card Images/Q-Hearts.png',
            'Card Images/Q-Spades.png',
            'Card Images/K-Clubs.png',
            'Card Images/K-Diamonds.png',
            'Card Images/K-Hearts.png',
            'Card Images/K-Spades.png',
            'Card Images/Joker1.png',
            'Card Images/Joker2.png',
            'card-back.png',
            'hand.png',
            'hand-brown.png',
            'hand-green.png',
            'hand-indigo.png',
            'hand-indigo-thumb.png',
            'hand-orange.png',
            'hand-orange-thumb.png',
            'hand-raspberry.png',
            'hand-raspberry-thumb.png',
            'hand-red.png',
            'hand-sky.png',
            'hand-yellow.png',
            'hand-yellow-thumb.png',
            'pointer.png',
            'swipe-instruction.png',
            'swipe-instruction-big.png',
            'burst.svg'
        ];
        
        this.fonts = [
            'Gooper7-Super.woff2',
            'DepartureMono-Regular.woff2',
            'FragmentMono-Regular.woff2',
            'ChakraPetch-Regular.woff2'
        ];
        
        this.totalAssets = this.sounds.length + this.cardImages.length + this.fonts.length;
        this.loadedAssets = 0;
        this.progressFill = document.getElementById('progress-fill');
        this.progressText = document.getElementById('progress-text');
    }

    async loadAllAssets() {
        console.log('Starting asset preload...');
        
        try {
            // Load fonts first
            await this.loadFonts();
            
            // Load sounds and images in parallel
            await Promise.all([
                this.loadSounds(),
                this.loadCardImages()
            ]);
            
            console.log('All assets loaded successfully');
            this.hideLoadingScreen();
        } catch (error) {
            console.error('Error loading assets:', error);
            // Even if some assets fail, try to continue
            this.hideLoadingScreen();
        }
    }

    async loadFonts() {
        console.log('Loading fonts...');
        const fontPromises = this.fonts.map(font => this.loadFont(font));
        
        for (const fontPromise of fontPromises) {
            await fontPromise;
            this.updateProgress();
        }
    }

    async loadFont(fontPath) {
        return new Promise((resolve) => {
            const font = new FontFace('temp', `url(${fontPath})`);
            font.load().then(() => {
                resolve();
            }).catch(() => {
                // Font loading failed, but don't block the game
                console.warn(`Failed to load font: ${fontPath}`);
                resolve();
            });
        });
    }

    async loadSounds() {
        console.log('Loading sounds...');
        
        // Preload sounds and store them in global variables that script.js expects
        const soundMappings = {
            'sounds/slap1.mp3': 'slapSound',
            'sounds/brass.mp3': 'correctSound',
            'sounds/incorrect.mp3': 'incorrectSound',
            'sounds/draw.mp3': 'drawSound',
            'sounds/bell.mp3': 'pointSound',
            'sounds/woosh.mp3': 'wooshSound',
            'sounds/pan.mp3': 'changeSound',
            'sounds/snap.mp3': 'interactBigSound',
            'sounds/woodblock.mp3': 'interactSmallSound',
            'sounds/transition-1.mp3': 't1Sound',
            'sounds/transition-2.mp3': 't2Sound',
            'sounds/transition-3.mp3': 't3Sound',
            'sounds/transition-4.mp3': 't4Sound',
            'sounds/transition-5.mp3': 't5Sound',
            'sounds/win.mp3': 'winSound',
            'sounds/Sticky Hands Music.mp3': 'backgroundMusic'
        };
        
        const soundPromises = Object.entries(soundMappings).map(([soundPath, globalVar]) => 
            this.loadSound(soundPath, globalVar)
        );
        
        for (const soundPromise of soundPromises) {
            await soundPromise;
            this.updateProgress();
        }
    }

    async loadSound(soundPath, globalVarName) {
        return new Promise((resolve) => {
            const audio = new Audio();
            audio.oncanplaythrough = () => {
                // Store the loaded audio in the global variable
                if (globalVarName) {
                    window[globalVarName] = audio;
                    
                    // Set volume for specific sounds
                    if (globalVarName === 'correctSound') audio.volume = 0.5;
                    if (globalVarName === 'incorrectSound') audio.volume = 0.1;
                    if (globalVarName === 'drawSound') audio.volume = 0.5;
                    if (globalVarName === 'pointSound') audio.volume = 0.5;
                    if (globalVarName === 'wooshSound') audio.volume = 1;
                    if (globalVarName === 'changeSound') audio.volume = 0.5;
                    if (globalVarName === 't1Sound') audio.volume = 0.5;
                    if (globalVarName === 't2Sound') audio.volume = 0.5;
                    if (globalVarName === 't3Sound') audio.volume = 0.5;
                    if (globalVarName === 't4Sound') audio.volume = 0.5;
                    if (globalVarName === 't5Sound') audio.volume = 0.5;
                    if (globalVarName === 'winSound') audio.volume = 0.5;
                    if (globalVarName === 'backgroundMusic') audio.volume = 0.3;
                }
                resolve();
            };
            audio.onerror = () => {
                console.warn(`Failed to load sound: ${soundPath}`);
                resolve(); // Don't block on sound loading failures
            };
            audio.src = soundPath;
        });
    }

    async loadCardImages() {
        console.log('Loading card images...');
        const imagePromises = this.cardImages.map(image => this.loadImage(image));
        
        for (const imagePromise of imagePromises) {
            await imagePromise;
            this.updateProgress();
        }
    }

    async loadImage(imagePath) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve();
            img.onerror = () => {
                console.warn(`Failed to load image: ${imagePath}`);
                resolve(); // Don't block on image loading failures
            };
            img.src = imagePath;
        });
    }

    updateProgress() {
        this.loadedAssets++;
        const percentage = Math.round((this.loadedAssets / this.totalAssets) * 100);
        
        if (this.progressFill) {
            this.progressFill.style.width = `${percentage}%`;
        }
        
        if (this.progressText) {
            this.progressText.textContent = `${percentage}%`;
        }
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
        }
        
        // Show welcome screen
        const welcomeScreen = document.getElementById('welcome-screen');
        if (welcomeScreen) {
            welcomeScreen.classList.remove('hidden');
        }
        
        // Initialize the game after assets are loaded
        if (typeof initializeGame === 'function') {
            initializeGame();
        }
    }
}

// Export for use in other scripts
window.AssetLoader = AssetLoader; 