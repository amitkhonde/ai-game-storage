class Game {
    constructor() {
        this.engine = new GameEngine();
        this.physics = new PhysicsEngine();
        this.ai = new AI();
        
        this.setupEventListeners();
        this.start();
    }

    setupEventListeners() {
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleTouch(e.touches[0]);
        });
        
        document.querySelectorAll('#species-panel button').forEach(button => {
            button.addEventListener('click', () => {
                this.selectedSpecies = button.dataset.species;
            });
        });
    }

    handleTouch(touch) {
        const x = touch.clientX;
        const y = touch.clientY;
        
        if (this.selectedSpecies) {
            this.placeEntity(this.selectedSpecies, x, y);
            this.trackBehavior('placement', {x, y, species: this.selectedSpecies});
        }
    }

    placeEntity(type, x, y) {
        const entity = this.createEntity(type, x, y);
        this.engine.entities.push(entity);
        if (entity.hasPhysics) this.physics.addEntity(entity);
        if (entity.hasAI) this.ai.entities.push(entity);
    }

    start() {
        requestAnimationFrame((t) => this.engine.update(t));
    }
}

// Initialize game
const game = new Game();