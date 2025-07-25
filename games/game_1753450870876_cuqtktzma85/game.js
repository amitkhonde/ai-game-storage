class EcoSystem {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        
        this.entities = {
            trees: [],
            animals: [],
            waterSources: []
        };
        
        this.resources = {
            water: 100,
            food: 100,
            wood: 100
        };
        
        this.populations = {
            predators: 10,
            prey: 50,
            plants: 200
        };
        
        this.weather = {
            season: 'Spring',
            temperature: 20,
            rainfall: 50
        };
        
        this.behaviorTracker = new BehaviorTracker();
        this.setupEventListeners();
        this.startGameLoop();
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.resizeCanvas());
        
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            this.handleClick(x, y);
        });

        document.getElementById('plant-trees').addEventListener('click', () => {
            this.plantTrees();
        });

        document.getElementById('add-water').addEventListener('click', () => {
            this.addWaterSource();
        });

        document.getElementById('build-shelter').addEventListener('click', () => {
            this.buildShelter();
        });
    }

    handleClick(x, y) {
        this.behaviorTracker.trackAction('click', { x, y });
    }

    plantTrees() {
        if (this.resources.wood >= 10) {
            this.resources.wood -= 10;
            this.populations.plants += 5;
            this.updateUI();
            this.behaviorTracker.trackAction('plant-trees');
        }
    }

    addWaterSource() {
        if (this.resources.water >= 20) {
            this.resources.water -= 20;
            this.entities.waterSources.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height
            });
            this.updateUI();
            this.behaviorTracker.trackAction('add-water');
        }
    }

    buildShelter() {
        if (this.resources.wood >= 30) {
            this.resources.wood -= 30;
            this.populations.prey += 2;
            this.updateUI();
            this.behaviorTracker.trackAction('build-shelter');
        }
    }

    updateUI() {
        document.getElementById('water').textContent = `💧 ${this.resources.water}`;
        document.getElementById('food').textContent = `🍎 ${this.resources.food}`;
        document.getElementById('wood').textContent = `🌳 ${this.resources.wood}`;
        document.getElementById('predators').textContent = this.populations.predators;
        document.getElementById('prey').textContent = this.populations.prey;
        document.getElementById('plants').textContent = this.populations.plants;
    }

    update() {
        this.updatePopulations();
        this.updateResources();
        this.updateWeather();
    }

    updatePopulations() {
        // Predator-prey dynamics
        const preyGrowth = this.populations.prey * 0.1;
        const predatorHunting = this.populations.predators * 0.2;
        
        this.populations.prey += preyGrowth - predatorHunting;
        this.populations.predators += predatorHunting * 0.1;
        
        // Natural constraints
        this.populations.prey = Math.max(0, Math.min(this.populations.prey, 200));
        this.populations.predators = Math.max(0, Math.min(this.populations.predators, 50));
    }

    updateResources() {
        // Resource regeneration and consumption
        this.resources.water += (this.weather.rainfall / 100) * 5;
        this.resources.food += (this.populations.plants / 100) * 2;
        this.resources.wood += (this.populations.plants / 200);
        
        // Resource consumption
        this.resources.water -= (this.populations.prey * 0.1 + this.populations.predators * 0.2);
        this.resources.food -= (this.populations.prey * 0.2 + this.populations.predators * 0.3);
        
        // Resource constraints
        Object.keys(this.resources).forEach(key => {
            this.resources[key] = Math.max(0, Math.min(this.resources[key], 200));
        });
    }

    updateWeather() {
        // Seasonal changes
        this.weather.temperature += Math.sin(Date.now() / 10000) * 0.1;
        this.weather.rainfall += Math.cos(Date.now() / 15000) * 0.2;
        
        // Weather constraints
        this.weather.temperature = Math.max(0, Math.min(this.weather.temperature, 40));
        this.weather.rainfall = Math.max(0, Math.min(this.weather.rainfall, 100));
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background based on season
        this.ctx.fillStyle = `rgb(${100 + this.weather.temperature * 2}, 
                                ${150 + this.weather.rainfall}, 
                                100)`;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw entities
        this.renderEntities();
    }

    renderEntities() {
        // Draw water sources
        this.ctx.fillStyle = '#4a90e2';
        this.entities.waterSources.forEach(water => {
            this.ctx.beginPath();
            this.ctx.arc(water.x, water.y, 20, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        // Draw simplified representations of animals and plants
        // In a full implementation, this would include more sophisticated
        // entity rendering with proper sprites and animations
    }

    startGameLoop() {
        const gameLoop = () => {
            this.update();
            this.render();
            this.updateUI();
            requestAnimationFrame(gameLoop);
        };
        gameLoop();
    }
}

class BehaviorTracker {
    constructor() {
        this.actions = [];
        this.startTime = Date.now();
    }

    trackAction(action, data = {}) {
        this.actions.push({
            action,
            timestamp: Date.now() - this.startTime,
            data
        });
        
        this.analyzePatterns();
    }

    analyzePatterns() {
        // Analyze recent actions to identify patterns
        const recentActions = this.actions.slice(-10);
        
        // In a full implementation, this would include more sophisticated
        // pattern recognition and player behavior analysis
    }
}

// Start the game when the window loads
window.addEventListener('load', () => {
    const game = new EcoSystem();
});