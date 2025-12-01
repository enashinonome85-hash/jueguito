const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');

let playerLives = 3;

// Tanque jugador
const tank = { 
    x: 300, 
    y: 400, 
    size: 32, 
    speed: 2, 
    color: 'green', 
    direction: 'up' 
};

// Balas jugador
const bullets = [];

// Muros
const walls = [
    { x: 100, y: 100, width: 32, height: 32 },
    { x: 140, y: 100, width: 32, height: 32 },
    { x: 180, y: 100, width: 32, height: 32 },
    { x: 100, y: 140, width: 32, height: 32 }
];

// Enemigos
const enemies = [
    { x: 50, y: 50, size: 32, color: 'red', direction: 'down', speed: 1, bullets: [] },
    { x: 500, y: 50, size: 32, color: 'red', direction: 'down', speed: 1, bullets: [] }
];

// Dibujar elementos
function drawTank() {
    ctx.fillStyle = tank.color;
    ctx.fillRect(tank.x, tank.y, tank.size, tank.size);
}

function drawBullets() {
    ctx.fillStyle = 'yellow';
    bullets.forEach(bullet => {
        ctx.fillRect(bullet.x, bullet.y, bullet.size, bullet.size);
    });
}

function drawWalls() {
    ctx.fillStyle = 'brown';
    walls.forEach(wall => {
        ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
    });
}

function drawEnemies() {
    enemies.forEach(enemy => {
        ctx.fillStyle = enemy.color;
        ctx.fillRect(enemy.x, enemy.y, enemy.size, enemy.size);
        ctx.fillStyle = 'orange';
        enemy.bullets.forEach(bullet => {
            ctx.fillRect(bullet.x, bullet.y, bullet.size, bullet.size);
        });
    });
}

// Colisión rectángulo-rectángulo
function isColliding(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.size > b.x &&
           a.y < b.y + b.height &&
           a.y + a.size > b.y;
}

// Actualizar enemigos
function updateEnemies() {
    enemies.forEach(enemy => {
        let nextX = enemy.x;
        let nextY = enemy.y;

        switch(enemy.direction) {
            case 'up': nextY -= enemy.speed; break;
            case 'down': nextY += enemy.speed; break;
            case 'left': nextX -= enemy.speed; break;
            case 'right': nextX += enemy.speed; break;
        }

        const enemyNext = { x: nextX, y: nextY, size: enemy.size };
        let collision = false;

        walls.forEach(wall => {
            if (isColliding(enemyNext, wall)) collision = true;
        });

        if (nextX < 0 || nextX + enemy.size > canvas.width || nextY < 0 || nextY + enemy.size > canvas.height) {
            collision = true;
        }

        if (collision) {
            const directions = ['up','down','left','right'];
            enemy.direction = directions[Math.floor(Math.random()*4)];
        } else {
            enemy.x = nextX;
            enemy.y = nextY;
        }

        // Disparo aleatorio
        if (Math.random() < 0.01) shootEnemy(enemy);

        // Mover balas de enemigos
        enemy.bullets.forEach((bullet, index) => {
            switch(bullet.direction) {
                case 'up': bullet.y -= bullet.speed; break;
                case 'down': bullet.y += bullet.speed; break;
                case 'left': bullet.x -= bullet.speed; break;
                case 'right': bullet.x += bullet.speed; break;
            }

            walls.forEach((wall, wIndex) => {
                if (isColliding(bullet, wall)) enemy.bullets.splice(index, 1);
            });

            if (isColliding(bullet, tank)) {
                enemy.bullets.splice(index, 1);
                playerLives--;
                updateScore();
                if (playerLives <= 0) alert("¡Game Over!");
            }

            if (bullet.x < 0 || bullet.x > canvas.width || bullet.y < 0 || bullet.y > canvas.height) {
                enemy.bullets.splice(index, 1);
            }
        });
    });
}

// Función disparo enemigo
function shootEnemy(enemy) {
    const size = 8;
    const speed = 3;
    let x = enemy.x + enemy.size/2 - size/2;
    let y = enemy.y + enemy.size/2 - size/2;
    enemy.bullets.push({ x, y, size, speed, direction: enemy.direction });
}

// Actualizar pantalla
function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawTank();
    drawBullets();
    drawWalls();
    drawEnemies();
    updateEnemies();

    // Mover balas jugador
    bullets.forEach((bullet, index) => {
        switch(bullet.direction) {
            case 'up': bullet.y -= bullet.speed; break;
            case 'down': bullet.y += bullet.speed; break;
            case 'left': bullet.x -= bullet.speed; break;
            case 'right': bullet.x += bullet.speed; break;
        }

        walls.forEach((wall, wIndex) => {
            if (isColliding(bullet, wall)) {
                bullets.splice(index, 1);
                walls.splice(wIndex, 1);
            }
        });

        enemies.forEach((enemy, eIndex) => {
            if (isColliding(bullet, enemy)) {
                bullets.splice(index, 1);
                enemies.splice(eIndex, 1);
            }
        });

        if (bullet.x < 0 || bullet.x > canvas.width || bullet.y < 0 || bullet.y > canvas.height) {
            bullets.splice(index, 1);
        }
    });

    requestAnimationFrame(update);
}

// Control tanque jugador
document.addEventListener('keydown', (e) => {
    let nextX = tank.x;
    let nextY = tank.y;

    switch(e.key) {
        case 'ArrowUp': nextY -= tank.speed; tank.direction = 'up'; break;
        case 'ArrowDown': nextY += tank.speed; tank.direction = 'down'; break;
        case 'ArrowLeft': nextX -= tank.speed; tank.direction = 'left'; break;
        case 'ArrowRight': nextX += tank.speed; tank.direction = 'right'; break;
        case 'c':
        case 'C': shoot(); return;
    }

    const tankNext = { x: nextX, y: nextY, size: tank.size };
    let collision = false;
    walls.forEach(wall => {
        if (isColliding(tankNext, wall)) collision = true;
    });

    enemies.forEach(enemy => {
        if (isColliding(tankNext, enemy)) collision = true;
    });

    if (!collision) {
        tank.x = nextX;
        tank.y = nextY;
    }
});

// Disparo jugador
function shoot() {
    const size = 12;
    const speed = 5;
    let x = tank.x + tank.size/2 - size/2;
    let y = tank.y + tank.size/2 - size/2;
    bullets.push({ x, y, size, speed, direction: tank.direction });
}

// Actualizar marcador
function updateScore() {
    scoreDisplay.textContent = `Vidas: ${playerLives}`;
}

// Iniciar juego
update();
