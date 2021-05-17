const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

canvas.width = innerWidth;
canvas.height = innerHeight;

let scoreElement = document.querySelector('#scoreElement');

class Player {
    constructor(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}

class Projectile {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
    update() {
        this.draw();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
}

class Enemy {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
    update() {
        this.draw();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
}

const friction = 0.99;
class Particle {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
        this.alpha = 1;
    }
    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.restore();
    }
    update() {
        this.draw();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
        this.alpha -= 0.01;
    }
}

var x = canvas.width / 2;
var y = canvas.height / 2;
const player = new Player(x, y, 10, 'white');
const projectiles = [];
const enemies = [];
const particles = [];

function spawnEnemies() {
    setInterval(() => {
        var radius = Math.random() * (30 - 5) + 5;
        var x;
        var y;
        if (Math.random < 0.5) {
            x = Math.random() < 0.5 ? 0 - radius: canvas.width + radius;
            y = Math.random() * canvas.height;
        } else {
            x = Math.random() * canvas.width;
            y = Math.random() < 0.5 ? 0 - radius: canvas.height + radius;
        }
        var color = `hsl(${Math.random() * 360}, 50%, 50%)`;
        var angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x);
        var velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        }
       enemies.push(new Enemy(x, y, radius, color, velocity));
    }, 1000)
}

let animationId;
let score = 0;

function animate() {
    animationId = requestAnimationFrame(animate);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    player.draw();
    particles.forEach((particle, partIndex) => {
        if (particle.alpha <= 0) {
            particles.splice(partIndex, 1);
        } else {
            particle.update();
        }
    })
    projectiles.forEach((projectile, projIndex) => {
        projectile.update();
        if (projectile.x + projectile.radius < 0 || projectile.x - projectile.radius > canvas.width ||
            projectile.y + projectile.radius < 0 ||projectile.y - projectile.radius > canvas.height) {
            setTimeout(() => {
                projectiles.splice(projIndex, 1);
            }, 0)
        }
    })
    
    enemies.forEach((enemy, index) => {
        enemy.update();
        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
        if (dist - enemy.radius - player.radius < 1) {
            cancelAnimationFrame(animationId);
        }
        projectiles.forEach((projectile, projIndex) => {
            const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);
            if (dist - enemy.radius - projectile.radius < 1) {
                for (var i = 0; i < enemy.radius * 2; i++) {
                    particles.push(new Particle(projectile.x, projectile.y, Math.random() * 2, enemy.color, {
                        x: (Math.random() - 0.5) * (Math.random() * enemy.radius / 2),
                        y: (Math.random() - 0.5) * (Math.random() * enemy.radius / 2)
                    }))
                }
                if (enemy.radius - 10 > 5) {
                    score += 25;
                    scoreElement.innerHTML = score;
                    enemy.radius -= 10;
                    setTimeout(() => {
                        projectiles.splice(projIndex, 1);
                    }, 0)
                } else {
                    score += 50;
                    scoreElement.innerHTML = score;
                    setTimeout(() => {
                        enemies.splice(index, 1);
                        projectiles.splice(projIndex, 1);
                    }, 0)
                } 
            }
        })
    })
}

window.addEventListener('click', (event) => {
    var angle = Math.atan2(event.clientY - canvas.height / 2, event.clientX - canvas.width / 2);
    var velocity = {
        x: Math.cos(angle) * 3,
        y: Math.sin(angle) * 3
    }
    projectiles.push(new Projectile(canvas.width / 2, canvas.height / 2, 5, 'grey', velocity));
})

animate();
spawnEnemies();