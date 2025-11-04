const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game constants
const CANVAS_SIZE = 600;
const CENTER_X = CANVAS_SIZE / 2;
const CENTER_Y = CANVAS_SIZE / 2;
const CIRCLE_RADIUS = 280;
const PADDLE_LENGTH = 10; // degrees
const PADDLE_THICKNESS = 15;
const BALL_RADIUS = 8;
const BALL_SPEED = 3;
const PADDLE_SPEED = 2; // degrees per frame

// Game state
let gameRunning = false;
let keys = {};

// Paddle objects
const paddle1 = {
    angle: 45, // degrees
    color: '#ff4444'
};

const paddle2 = {
    angle: 225, // degrees (opposite side)
    color: '#4444ff'
};

// Ball object
const ball = {
    x: CENTER_X,
    y: CENTER_Y,
    dx: 0,
    dy: 0,
    color: '#ffff44'
};

// Utility functions
function degreesToRadians(degrees) {
    return degrees * Math.PI / 180;
}

function radiansToDegrees(radians) {
    return radians * 180 / Math.PI;
}

function getPointOnCircle(centerX, centerY, radius, angle) {
    const rad = degreesToRadians(angle);
    return {
        x: centerX + radius * Math.cos(rad),
        y: centerY + radius * Math.sin(rad)
    };
}

function normalizeAngle(angle) {
    while (angle < 0) angle += 360;
    while (angle >= 360) angle -= 360;
    return angle;
}

// Initialize ball with random direction
function initializeBall() {
    const randomAngle = Math.random() * 360;
    const rad = degreesToRadians(randomAngle);
    
    ball.x = CENTER_X;
    ball.y = CENTER_Y;
    ball.dx = Math.cos(rad) * BALL_SPEED;
    ball.dy = Math.sin(rad) * BALL_SPEED;
}

// Draw functions
function drawCircleBorder() {
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(CENTER_X, CENTER_Y, CIRCLE_RADIUS, 0, Math.PI * 2);
    ctx.stroke();
}

function drawPaddle(paddle) {
    const startAngle = paddle.angle - PADDLE_LENGTH / 2;
    const endAngle = paddle.angle + PADDLE_LENGTH / 2;
    
    ctx.strokeStyle = paddle.color;
    ctx.lineWidth = PADDLE_THICKNESS;
    ctx.beginPath();
    ctx.arc(CENTER_X, CENTER_Y, CIRCLE_RADIUS, 
            degreesToRadians(startAngle), 
            degreesToRadians(endAngle));
    ctx.stroke();
}

function drawBall() {
    ctx.fillStyle = ball.color;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fill();
}

// Game logic
function updatePaddles() {
    // Player 1 controls (Z and X keys)
    if (keys['KeyZ']) {
        paddle1.angle = normalizeAngle(paddle1.angle - PADDLE_SPEED);
    }
    if (keys['KeyX']) {
        paddle1.angle = normalizeAngle(paddle1.angle + PADDLE_SPEED);
    }
    
    // Player 2 controls (Arrow keys)
    if (keys['ArrowLeft']) {
        paddle2.angle = normalizeAngle(paddle2.angle - PADDLE_SPEED);
    }
    if (keys['ArrowRight']) {
        paddle2.angle = normalizeAngle(paddle2.angle + PADDLE_SPEED);
    }
}

function updateBall() {
    if (!gameRunning) return;
    
    // Move ball
    ball.x += ball.dx;
    ball.y += ball.dy;
    
    // Check collision with circle boundary
    const distFromCenter = Math.sqrt(
        Math.pow(ball.x - CENTER_X, 2) + 
        Math.pow(ball.y - CENTER_Y, 2)
    );
    
    if (distFromCenter + BALL_RADIUS >= CIRCLE_RADIUS) {
        // Calculate angle of ball position
        const ballAngle = normalizeAngle(radiansToDegrees(
            Math.atan2(ball.y - CENTER_Y, ball.x - CENTER_X)
        ));
        
        // Check collision with paddles
        const paddle1Start = normalizeAngle(paddle1.angle - PADDLE_LENGTH / 2);
        const paddle1End = normalizeAngle(paddle1.angle + PADDLE_LENGTH / 2);
        const paddle2Start = normalizeAngle(paddle2.angle - PADDLE_LENGTH / 2);
        const paddle2End = normalizeAngle(paddle2.angle + PADDLE_LENGTH / 2);
        
        let hitPaddle = false;
        
        // Check paddle 1 collision
        if (isAngleInRange(ballAngle, paddle1Start, paddle1End)) {
            hitPaddle = true;
        }
        
        // Check paddle 2 collision
        if (isAngleInRange(ballAngle, paddle2Start, paddle2End)) {
            hitPaddle = true;
        }
        
        if (hitPaddle) {
            // Reflect ball off paddle
            const centerToBall = {
                x: ball.x - CENTER_X,
                y: ball.y - CENTER_Y
            };
            const length = Math.sqrt(centerToBall.x * centerToBall.x + centerToBall.y * centerToBall.y);
            const normal = {
                x: -centerToBall.x / length,
                y: -centerToBall.y / length
            };
            
            // Reflect velocity
            const dot = ball.dx * normal.x + ball.dy * normal.y;
            ball.dx = ball.dx - 2 * dot * normal.x;
            ball.dy = ball.dy - 2 * dot * normal.y;
            
            // Move ball back inside circle
            ball.x = CENTER_X + centerToBall.x / length * (CIRCLE_RADIUS - BALL_RADIUS - 5);
            ball.y = CENTER_Y + centerToBall.y / length * (CIRCLE_RADIUS - BALL_RADIUS - 5);
        } else {
            // Ball escaped - game over
            gameRunning = false;
            setTimeout(() => {
                alert('FIM! Tecle espaço para reiniciar');
            }, 100);
        }
    }
}

function isAngleInRange(angle, start, end) {
    // Handle wrap-around cases
    if (start > end) {
        return angle >= start || angle <= end;
    }
    return angle >= start && angle <= end;
}

// Main game loop
function gameLoop() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    
    // Update game objects
    updatePaddles();
    updateBall();
    
    // Draw everything
    drawCircleBorder();
    drawPaddle(paddle1);
    drawPaddle(paddle2);
    drawBall();
    
    requestAnimationFrame(gameLoop);
}

// Event listeners
document.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    
    if (e.code === 'Space') {
        e.preventDefault();
        if (!gameRunning) {
            initializeBall();
            gameRunning = true;
        }
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});

// Start the game
initializeBall();
gameLoop();
