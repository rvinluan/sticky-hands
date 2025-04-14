// Matter.js setup
const { Engine, Render, World, Bodies, Body, Composite, Constraint, Vector } = Matter;

// Create an engine
const engine = Engine.create();
const world = engine.world;

// Create a renderer
const render = Render.create({
    canvas: document.getElementById('physics-canvas'),
    engine: engine,
    options: {
        width: window.innerWidth,
        height: window.innerHeight,
        wireframes: false,
        background: 'transparent'
    }
});

// Create world boundaries
const ground = Bodies.rectangle(window.innerWidth / 2, window.innerHeight + 50, window.innerWidth, 100, { 
    isStatic: true,
    render: {
        fillStyle: 'transparent'
    }
});

const leftWall = Bodies.rectangle(-50, window.innerHeight / 2, 100, window.innerHeight, {
    isStatic: true,
    render: {
        fillStyle: 'transparent'
    }
});

const rightWall = Bodies.rectangle(window.innerWidth + 50, window.innerHeight / 2, 100, window.innerHeight, {
    isStatic: true,
    render: {
        fillStyle: 'transparent'
    }
});

// Function to create a ball and chain
function createBallAndChain(x, linkCount) {
    const chainLinks = [];
    const constraints = [];
    const linkWidth = 10;
    const linkHeight = 30;
    const ballRadius = 30;
    
    // Create the ball
    const ball = Bodies.circle(x, window.innerHeight - (linkHeight*linkCount), ballRadius, {
        restitution: 0,
        friction: 0.4,
        sleepThreshold: 10,
        render: {
            sprite: {
                texture: 'hand.png',
                xScale: 0.24,
                yScale: 0.24
            }
        }
    });
    
    // Create chain links
    for (let i = 0; i < linkCount; i++) {
        const link = Bodies.rectangle(x, window.innerHeight - (i * (linkHeight*1.5)), linkWidth, linkHeight, {
            isStatic: i === 0, // First link is static
            restitution: 0,
            friction: 0.8,
            render: {
                fillStyle: '#C0FF52'
            }
        });
        chainLinks.push(link);
        
        // Create constraints between links
        if (i > 0) {
            const constraint = Constraint.create({
                bodyA: chainLinks[i - 1],
                bodyB: link,
                pointA: { x: 0, y: -linkHeight/2 },
                pointB: { x: 0, y: linkHeight/2 },
                stiffness: .3, // Less stiffness for more elasticity
                render: {
                    type: 'line',
                    strokeStyle: '#C0FF52',
                    lineWidth: linkWidth
                }
            });
            constraints.push(constraint);
        }
    }
    
    // Connect the last link to the ball
    const ballConstraint = Constraint.create({
        bodyA: ball,
        bodyB: chainLinks[chainLinks.length - 1],
        pointA: { x: 0, y: ballRadius-5 },
        pointB: { x: 0, y: -linkHeight/2 },
        stiffness: 1,
        render: {
            type: 'line',
            strokeStyle: '#C0FF52',
            lineWidth: linkWidth
        }
    });
    constraints.push(ballConstraint);
    
    // Add all bodies and constraints to the world
    World.add(world, [...chainLinks, ball, ...constraints]);
    
    return {
        ball,
        chainLinks,
        constraints
    };
}

// Create a ball and chain
const ballAndChain = createBallAndChain(window.innerWidth / 2, 6);

// Function to fling the ball toward center
function fling() {
    // Get the ball's current position
    const ballPos = ballAndChain.ball.position;
    
    // Center of screen coordinates
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    // Calculate the direction vector from ball to center
    const dx = centerX - ballPos.x;
    const dy = centerY - ballPos.y;
    
    // Normalize the direction vector
    const length = Math.sqrt(dx * dx + dy * dy);
    const normalizedDx = dx / length;
    const normalizedDy = dy / length;
    
    // Apply force in the direction of the center
    const force = Vector.create(
        normalizedDx * .6, // Scale the force
        normalizedDy * .6
    );
    
    // Apply the force to the ball
    Body.applyForce(ballAndChain.ball, ballAndChain.ball.position, force);
}

// Double tap detection
let lastTapTime = 0;
const doubleTapThreshold = 300; // milliseconds between taps

document.addEventListener('touchstart', (event) => {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTapTime;
    
    if (tapLength < doubleTapThreshold && tapLength > 0) {
        event.preventDefault(); // Prevent zoom
    }
    fling();
    lastTapTime = currentTime;
});

// Add keyboard event listener for 'p' key
document.addEventListener('keydown', (event) => {
    if (event.key.toLowerCase() === 'p') {
        fling();
    }
});

// Add bodies to the world
World.add(world, [ground, leftWall, rightWall]);

// Run the engine
Engine.run(engine);
Render.run(render);

// Add center detection and pause effect
let hitstop = false;
let justHit = false;
const centerThreshold = 10; // Distance from center to trigger effect
const bottomThreshold = window.innerHeight - 200; // Y position to consider "bottom"
let hitstopTimeout = null;

function checkCenterAndPause() {        
    const ballPos = ballAndChain.ball.position;
    const centerY = window.innerHeight / 2;
    
    if (!hitstop && !justHit) {        
        if (ballPos.y < centerY + centerThreshold) {
            hitstop = true;
            justHit = true;
            engine.timing.timeScale = 0; // Pause physics
            
            // Resume after 0.5 seconds
            hitstopTimeout = setTimeout(() => {
                engine.timing.timeScale = 1;
                hitstop = false;
                hitstopTimeout = null;
            }, 300);
        }
    }
    //Check if ball has returned to bottom
    if (justHit && ballPos.y > bottomThreshold) {
        justHit = false;
    }
}

// Add the check to the engine update
Matter.Events.on(engine, 'afterUpdate', checkCenterAndPause);

// Create falling objects
function createFallingObject() {
    const x = Math.random() * window.innerWidth;
    const size = Math.random() * 30 + 20;
    const shape = Math.random() > 0.5 ? 'circle' : 'rectangle';
    
    let body;
    if (shape === 'circle') {
        body = Bodies.circle(x, -50, size / 2, {
            restitution: 0.6,
            friction: 0.1,
            render: {
                fillStyle: '#ff0000'
            }
        });
    } else {
        body = Bodies.rectangle(x, -50, size, size, {
            restitution: 0.6,
            friction: 0.1,
            render: {
                fillStyle: '#ff0000'
            }
        });
    }
    
    World.add(world, body);
    
    // Remove the object after 5 seconds
    setTimeout(() => {
        World.remove(world, body);
    }, 5000);
}

// Create falling objects periodically
// setInterval(createFallingObject, 1000);

// Handle window resize
window.addEventListener('resize', () => {
    render.options.width = window.innerWidth;
    render.options.height = window.innerHeight;
    render.canvas.width = window.innerWidth;
    render.canvas.height = window.innerHeight;
    
    // Update ground position
    Body.setPosition(ground, { x: window.innerWidth / 2, y: window.innerHeight + 50 });
    Body.setVertices(ground, [
        { x: 0, y: window.innerHeight + 50 },
        { x: window.innerWidth, y: window.innerHeight + 50 },
        { x: window.innerWidth, y: window.innerHeight + 150 },
        { x: 0, y: window.innerHeight + 150 }
    ]);

    // Update wall positions
    Body.setPosition(leftWall, { x: -50, y: window.innerHeight / 2 });
    Body.setPosition(rightWall, { x: window.innerWidth + 50, y: window.innerHeight / 2 });
}); 