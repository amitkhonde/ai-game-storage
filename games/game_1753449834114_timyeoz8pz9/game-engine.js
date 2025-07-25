class GameEngine {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        this.entities = new Map();
        this.systems = new Map();
        this.lastTime = 0;
        this.deltaTime = 0;
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    update(timestamp) {
        this.deltaTime = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;

        this.systems.forEach(system => system.update(this.deltaTime));
        this.entities.forEach(entity => entity.update(this.deltaTime));
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.entities.forEach(entity => entity.render(this.ctx));
    }

    gameLoop(timestamp) {
        this.update(timestamp);
        this.render();
        requestAnimationFrame((t) => this.gameLoop(t));
    }

    start() {
        requestAnimationFrame((t) => this.gameLoop(t));
    }
}