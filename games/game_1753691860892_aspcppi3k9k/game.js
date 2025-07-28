class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.state = 'menu';
        this.score = 0;
        this.timeLeft = 60;
        this.particles = [];
        this.currentRiddle = null;
        this.behaviorTracker = new BehaviorTracker();
        this.audioSystem = new AudioSystem();
        this.setupEventListeners();
        this.resize();
        this.riddleBank = [
            { question: 'I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?', answer: 'echo' },
            { question: 'What has keys, but no locks; space, but no room; and you can enter, but not go in?', answer: 'keyboard' },
            { question: 'The more you take, the more you leave behind. What am I?', answer: 'footsteps' },
            { question: 'What has a head and a tail that will never meet?', answer: 'coin' }
        ];
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.resize());
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('restartBtn').addEventListener('click', () => this.startGame());
        document.getElementById('submitAnswer').addEventListener('click', () => this.checkAnswer());
        document.getElementById('playerAnswer').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.checkAnswer();
        });
    }

    startGame() {
        this.state = 'playing';
        this.score = 0;
        this.timeLeft = 60;
        this.behaviorTracker.startSession();
        this.showScreen('game');
        this.nextRiddle();
        this.gameLoop();
        this.startTimer();
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => screen.classList.add('hidden'));
        document.getElementById(screenId).classList.remove('hidden');
    }

    nextRiddle() {
        const index = Math.floor(Math.random() * this.riddleBank.length);
        this.currentRiddle = this.riddleBank[index];
        document.getElementById('riddle-display').textContent = this.currentRiddle.question;
        document.getElementById('playerAnswer').value = '';
        this.behaviorTracker.startRiddle();
    }

    checkAnswer() {
        const playerAnswer = document.getElementById('playerAnswer').value.toLowerCase().trim();
        const correct = playerAnswer === this.currentRiddle.answer;
        
        if (correct) {
            this.score += 10;
            this.audioSystem.playSuccess();
            this.createParticles();
        } else {
            this.audioSystem.playError();
        }

        this.behaviorTracker.recordAnswer(correct, playerAnswer);
        document.getElementById('scoreValue').textContent = this.score;
        
        if (correct) this.nextRiddle();
    }

    createParticles() {
        for (let i = 0; i < 20; i++) {
            this.particles.push(new Particle(this.canvas.width / 2, this.canvas.height / 2));
        }
    }

    startTimer() {
        this.timer = setInterval(() => {
            this.timeLeft--;
            document.getElementById('timeValue').textContent = this.timeLeft;
            if (this.timeLeft <= 0) this.endGame();
        }, 1000);
    }

    endGame() {
        clearInterval(this.timer);
        this.state = 'gameOver';
        this.showScreen('gameOver');
        document.getElementById('finalScore').textContent = this.score;
        this.behaviorTracker.endSession();
    }

    update() {
        this.particles = this.particles.filter(particle => particle.life > 0);
        this.particles.forEach(particle => particle.update());
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.particles.forEach(particle => particle.draw(this.ctx));
    }

    gameLoop() {
        if (this.state === 'playing') {
            this.update();
            this.render();
            requestAnimationFrame(() => this.gameLoop());
        }
    }
}

class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 10;
        this.vy = (Math.random() - 0.5) * 10;
        this.life = 60;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life--;
    }

    draw(ctx) {
        ctx.fillStyle = `rgba(74, 144, 226, ${this.life / 60})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 5, 0, Math.PI * 2);
        ctx.fill();
    }
}

class AudioSystem {
    constructor() {
        this.context = new (window.AudioContext || window.webkitAudioContext)();
    }

    playSuccess() {
        const oscillator = this.context.createOscillator();
        const gain = this.context.createGain();
        oscillator.connect(gain);
        gain.connect(this.context.destination);
        oscillator.frequency.setValueAtTime(440, this.context.currentTime);
        gain.gain.setValueAtTime(0.1, this.context.currentTime);
        oscillator.start();
        oscillator.stop(this.context.currentTime + 0.1);
    }

    playError() {
        const oscillator = this.context.createOscillator();
        const gain = this.context.createGain();
        oscillator.connect(gain);
        gain.connect(this.context.destination);
        oscillator.frequency.setValueAtTime(220, this.context.currentTime);
        gain.gain.setValueAtTime(0.1, this.context.currentTime);
        oscillator.start();
        oscillator.stop(this.context.currentTime + 0.2);
    }
}

class BehaviorTracker {
    constructor() {
        this.session = {
            startTime: null,
            endTime: null,
            riddles: [],
            currentRiddle: null
        };
    }

    startSession() {
        this.session.startTime = Date.now();
        this.session.riddles = [];
    }

    startRiddle() {
        this.session.currentRiddle = {
            startTime: Date.now(),
            attempts: []
        };
    }

    recordAnswer(correct, answer) {
        this.session.currentRiddle.attempts.push({
            answer: answer,
            correct: correct,
            timeSpent: Date.now() - this.session.currentRiddle.startTime
        });

        if (correct) {
            this.session.riddles.push(this.session.currentRiddle);
        }
    }

    endSession() {
        this.session.endTime = Date.now();
        const analysis = this.analyzeSession();
        console.log('Session Analysis:', analysis);
    }

    analyzeSession() {
        return {
            totalTime: this.session.endTime - this.session.startTime,
            riddlesSolved: this.session.riddles.length,
            averageTimePerRiddle: this.session.riddles.reduce((acc, r) => acc + r.attempts[r.attempts.length - 1].timeSpent, 0) / this.session.riddles.length,
            totalAttempts: this.session.riddles.reduce((acc, r) => acc + r.attempts.length, 0)
        };
    }
}

window.onload = () => new Game();
