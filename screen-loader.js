// Screen Loader - Loads screen templates into the main HTML
class ScreenLoader {
    constructor() {
        this.screens = [
            'loading-screen',
            'about-screen', 
            'lobby-screen',
            'gameplay-screen'
        ];
        // Check if HTML has 'arcade' class and set welcome screen accordingly
        const htmlElement = document.documentElement;
        if (htmlElement.classList.contains('arcade')) {
            this.screens.push('pause-screen-arcade');
            this.screens.push('welcome-screen-arcade');
            this.screens.push('round-start-screen-arcade');
            this.screens.push('initial-conditions-screen-arcade');
            this.screens.push('end-screen-arcade');
            this.screens.push('new-condition-screen-arcade');
        } else {
            this.screens.push('pause-screen');
            this.screens.push('welcome-screen');
            this.screens.push('round-start-screen');
            this.screens.push('initial-conditions-screen');
            this.screens.push('end-screen');
            this.screens.push('new-condition-screen');
        }
        this.loadedScreens = 0;
        this.totalScreens = this.screens.length;
    }

    async loadAllScreens() {
        console.log('Loading screen templates...');
        
        const loadPromises = this.screens.map(screenName => this.loadScreen(screenName));
        
        try {
            await Promise.all(loadPromises);
            console.log('All screen templates loaded successfully');
            this.onAllScreensLoaded();
        } catch (error) {
            console.error('Error loading screen templates:', error);
            // Even if some screens fail, try to load the game scripts
            this.onAllScreensLoaded();
        }
    }

    async loadScreen(screenName) {
        try {
            const response = await fetch(`screens/${screenName}.html`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const content = await response.text();
            
            // Find the corresponding screen div and replace its content
            // Extract base screen name by removing everything after 'screen'
            const baseScreenName = screenName.split('screen')[0] + 'screen';
            const screenElement = document.getElementById(baseScreenName);
            if (screenElement) {
                screenElement.innerHTML = content;
                this.loadedScreens++;
                // console.log(`Loaded ${screenName} (${this.loadedScreens}/${this.totalScreens})`);
            } else {
                console.warn(`Screen element with id "${screenName}" not found`);
            }
        } catch (error) {
            console.error(`Failed to load screen ${screenName}:`, error);
            // Don't throw here, just log the error and continue
            this.loadedScreens++;
        }
    }

    onAllScreensLoaded() {
        console.log('Loading game scripts...');
        this.loadGameScripts();
        // // Load Matter.js first (if not already loaded)
        // if (typeof Matter === 'undefined') {
        //     this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.19.0/matter.min.js')
        //         .then(() => this.loadGameScripts())
        //         .catch(error => {
        //             console.error('Failed to load Matter.js:', error);
        //             // Try to load game scripts anyway
        //             this.loadGameScripts();
        //         });
        // } else {
        //     this.loadGameScripts();
        // }
    }

    async loadGameScripts() {
        try {
            // Load asset loader first
            await this.loadScript('asset-loader.js');
            
            // Load scripts in order
            await this.loadScript('matter.min.js');
            await this.loadScript('conditions.js?v=4');
            await this.loadScript('physics.js?v=1');
            await this.loadScript('script.js?v=11');
            await this.loadScript('input.js?v=1');
            
            console.log('All game scripts loaded successfully');
            
            // Start asset loading process
            this.startAssetLoading();
        } catch (error) {
            console.error('Failed to load game scripts:', error);
            // Even if scripts fail, try to start asset loading
            this.startAssetLoading();
        }
    }

    startAssetLoading() {
        // Show loading screen
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.remove('hidden');
        }
        
        // Hide welcome screen initially
        const welcomeScreen = document.getElementById('welcome-screen');
        if (welcomeScreen) {
            welcomeScreen.classList.add('hidden');
        }
        
        // Start asset loading
        if (window.AssetLoader) {
            const assetLoader = new AssetLoader();
            assetLoader.loadAllAssets().then(() => {
                // Dispatch event for any remaining initialization
                const event = new CustomEvent('screensLoaded');
                document.dispatchEvent(event);
            });
        } else {
            console.error('AssetLoader not available');
            // Fallback: show welcome screen anyway
            if (loadingScreen) {
                loadingScreen.classList.add('hidden');
            }
            if (welcomeScreen) {
                welcomeScreen.classList.remove('hidden');
            }
        }
    }

    loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => {
                console.log(`Loaded script: ${src}`);
                resolve();
            };
            script.onerror = () => {
                console.error(`Failed to load script: ${src}`);
                reject(new Error(`Failed to load script: ${src}`));
            };
            document.head.appendChild(script);
        });
    }
}

// Initialize and start loading screens when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const screenLoader = new ScreenLoader();
    screenLoader.loadAllScreens();
}); 