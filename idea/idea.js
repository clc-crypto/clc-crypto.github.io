// Create a new file called effects.js and add this code

// Particle Background Effect
class ParticleNetwork {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.className = 'particle-network';
        document.body.appendChild(this.canvas);

        this.particles = [];
        this.particleCount = 100;
        this.colors = ['#0ff', '#f0f', '#ff0'];

        this.resize();
        this.initParticles();
        this.animate();

        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    initParticles() {
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 2 + 1,
                color: this.colors[Math.floor(Math.random() * this.colors.length)]
            });
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;

            if (particle.x < 0) particle.x = this.canvas.width;
            if (particle.x > this.canvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = this.canvas.height;
            if (particle.y > this.canvas.height) particle.y = 0;

            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fillStyle = particle.color;
            this.ctx.fill();

            // Draw connections
            this.particles.forEach(otherParticle => {
                const dx = particle.x - otherParticle.x;
                const dy = particle.y - otherParticle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 100) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(particle.x, particle.y);
                    this.ctx.lineTo(otherParticle.x, otherParticle.y);
                    this.ctx.strokeStyle = `rgba(0, 255, 255, ${1 - distance / 100})`;
                    this.ctx.stroke();
                }
            });
        });

        requestAnimationFrame(() => this.animate());
    }
}

// Glitch Text Effect
class GlitchText {
    constructor(element) {
        this.element = element;
        this.originalText = element.getAttribute('data-text');
        this.chars = '!<>-_\\/[]{}—=+*^?#________';
        this.update();
    }

    randomChar() {
        return this.chars[Math.floor(Math.random() * this.chars.length)];
    }

    update() {
        let iterations = 0;
        const maxIterations = 10;

        const interval = setInterval(() => {
            this.element.innerText = this.originalText
                .split('')
                .map((char, index) => {
                    if (index < iterations) {
                        return this.originalText[index];
                    }
                    return this.randomChar();
                })
                .join('');

            iterations += 1/3;

            if (iterations >= this.originalText.length) {
                clearInterval(interval);
                this.element.innerText = this.originalText;

                // Schedule next update
                setTimeout(() => this.update(), Math.random() * 5000 + 3000);
            }
        }, 30);
    }
}

// Cyber Button Effect
class CyberButton {
    constructor(button) {
        this.button = button;
        this.initializeEvents();
    }

    initializeEvents() {
        this.button.addEventListener('mousemove', (e) => {
            const rect = this.button.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            this.button.style.setProperty('--x', `${x}px`);
            this.button.style.setProperty('--y', `${y}px`);
        });
    }
}

// Scroll Reveal Effect
class ScrollReveal {
    constructor() {
        this.elements = document.querySelectorAll('.feature-tile');
        this.observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('revealed');
                    }
                });
            },
            {
                threshold: 0.1
            }
        );

        this.elements.forEach(element => {
            this.observer.observe(element);
        });
    }
}

// Matrix Rain Effect
class MatrixRain {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.canvas.className = 'matrix-rain';
        document.body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');

        this.characters = '1234567890abcdef#=';
        this.fontSize = 16;
        this.columns = 0;
        this.drops = [];

        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        this.columns = Math.floor(this.canvas.width / this.fontSize);
        this.drops = Array(this.columns).fill(1);
    }

    animate() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = 'rgba(0,255,170,0.08)';
        this.ctx.font = `${this.fontSize}px monospace`;

        for (let i = 0; i < this.drops.length; i++) {
            const text = this.characters[Math.floor(Math.random() * this.characters.length)];
            this.ctx.fillText(text, i * this.fontSize, this.drops[i] * this.fontSize);

            if (this.drops[i] * this.fontSize > this.canvas.height && Math.random() > 0.975) {
                this.drops[i] = 0;
            }
            this.drops[i]++;
        }

        requestAnimationFrame(() => this.animate());
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Add necessary CSS
    const style = document.createElement('style');
    style.textContent = `
        .particle-network, .matrix-rain {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: -1;
            opacity: 0.5;
        }
        
        .feature-tile {
            opacity: 0;
            transform: translateY(50px);
            transition: opacity 0.8s, transform 0.8s, box-shadow ease-in-out 0.1s;
        }
        
        .feature-tile.revealed {
            opacity: 1;
            transform: translateY(0);
        }
        
        .cyber-button {
            --x: 0;
            --y: 0;
            position: relative;
            overflow: hidden;
        }
        
        .cyber-button::after {
            content: '';
            position: absolute;
            left: var(--x);
            top: var(--y);
            width: 5px;
            height: 5px;
            background: rgba(255, 255, 255, 0.5);
            border-radius: 50%;
            transform: translate(-50%, -50%);
            transition: width 0.2s, height 0.2s;
        }
        
        .cyber-button:hover::after {
            width: 200px;
            height: 200px;
        }
    `;
    document.head.appendChild(style);

    // Initialize all effects
    new ParticleNetwork();
    new MatrixRain();

    // Initialize glitch effect for all glitch text elements
    document.querySelectorAll('.glitch').forEach(element => {
        new GlitchText(element);
    });

    // Initialize cyber button effects
    document.querySelectorAll('.cyber-button').forEach(button => {
        new CyberButton(button);
    });

    // Initialize scroll reveal
    new ScrollReveal();
});