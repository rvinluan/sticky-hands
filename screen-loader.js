// Screen Loader - Loads screen templates into the main HTML
class ScreenLoader {
    constructor() {
        this.screens = [
            'about-screen', 
            'lobby-screen',
            'initial-conditions-screen',
            'gameplay-screen',
            'round-start-screen',
            'new-condition-screen',
            'pause-screen',
            'end-screen'
        ];
        // Check if HTML has 'arcade' class and set welcome screen accordingly
        const htmlElement = document.documentElement;
        if (htmlElement.classList.contains('arcade')) {
            this.screens.push('welcome-screen-arcade');
        } else {
            this.screens.push('welcome-screen');
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
                console.log(`Loaded ${screenName} (${this.loadedScreens}/${this.totalScreens})`);
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
        
        // Load Matter.js first (if not already loaded)
        if (typeof Matter === 'undefined') {
            this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.19.0/matter.min.js')
                .then(() => this.loadGameScripts())
                .catch(error => {
                    console.error('Failed to load Matter.js:', error);
                    // Try to load game scripts anyway
                    this.loadGameScripts();
                });
        } else {
            this.loadGameScripts();
        }
    }

    async loadGameScripts() {
        try {
            // Load scripts in order
            await this.loadScript('conditions.js');
            await this.loadScript('physics.js');
            await this.loadScript('script.js');
            await this.loadScript('input.js');
            
            console.log('All game scripts loaded successfully');
            
            // Dispatch event for any remaining initialization
            const event = new CustomEvent('screensLoaded');
            document.dispatchEvent(event);
            // Show welcome screen
            const welcomeScreen = document.getElementById('welcome-screen');
            welcomeScreen.classList.remove('hidden');
        } catch (error) {
            console.error('Failed to load game scripts:', error);
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