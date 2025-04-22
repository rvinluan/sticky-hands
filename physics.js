// Matter.js setup
const { Engine, Render, World, Bodies, Body, Composite, Constraint, Vector } = Matter;

// Create an engine
const engine = Engine.create();
engine.gravity.y = 0; // Disable gravity
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

const ceiling = Bodies.rectangle(window.innerWidth / 2, -50, window.innerWidth, 100, { 
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
function createBallAndChain(x, linkCount, anchorTop = false) {
    const chainLinks = [];
    const constraints = [];
    const linkWidth = 10;
    const linkHeight = 30;
    const ballRadius = 30;
    
    // Calculate starting position based on anchor point
    const startY = anchorTop ? 0 : window.innerHeight;
    const yDirection = anchorTop ? 1 : -1;
    
    // Create the ball
    const ball = Bodies.circle(x, startY + (linkCount*linkHeight*yDirection), ballRadius, {
        restitution: 0,
        friction: 0.4,
        sleepThreshold: 10,
        render: {
            sprite: {
                texture: 'hand-raspberry.png',
                xScale: 0.24,
                yScale: 0.24
            }
        }
    });
    
    // Create chain links
    for (let i = 0; i < linkCount; i++) {
        const link = Bodies.rectangle(x, startY + (i * (linkHeight*1.5) * yDirection), linkWidth, linkHeight, {
            isStatic: i === 0, // First link is static
            restitution: 0,
            friction: 0.8,
            render: {
                fillStyle: '#D03291'
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
                    strokeStyle: '#D03291',
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
            strokeStyle: '#D03291',
            lineWidth: linkWidth
        }
    });
    constraints.push(ballConstraint);
    
    // Create a composite containing all parts
    const composite = Composite.create({
        bodies: [...chainLinks, ball],
        constraints: constraints
    });
    
    return {
        composite,
        ball,
        chainLinks,
        constraints
    };
}

// Create two ball and chains
const chain1 = createBallAndChain(window.innerWidth / 2 - 100, 6, true); // Top chain
const chain2 = createBallAndChain(window.innerWidth / 2 + 100, 6, false);  // Bottom chain

// Add the composites to the world
World.add(world, [chain1.composite, chain2.composite]);

// Add constant downward force
const gravityForce = Vector.create(0, 0.001); // Custom gravity force
const reverseGravityForce = Vector.create(0, -0.001); // Upward gravity force

function applyGravity() {
    // Apply downward force to chain1
    Composite.allBodies(chain1.composite).forEach(body => {
        Body.applyForce(body, body.position, reverseGravityForce);
    });
    
    // Apply upward force to chain2
    Composite.allBodies(chain2.composite).forEach(body => {
        Body.applyForce(body, body.position, gravityForce);
    });
}

// Add gravity force to the engine update
Matter.Events.on(engine, 'beforeUpdate', applyGravity);

// Function to fling the ball toward center
function fling(isPlayer1 = true) {
    const whichChain = isPlayer1 ? chain1 : chain2;
    // Get the ball's current position
    const ballPos = whichChain.ball.position;
    
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
    Body.applyForce(whichChain.ball, whichChain.ball.position, force);
}

// Add bodies to the world
World.add(world, [ground, ceiling, leftWall, rightWall]);

// Run the engine
Engine.run(engine);
Render.run(render);

// Add center detection and pause effect
let hitstop = false;
let justHit = false;
const centerThreshold = 10; // Distance from center to trigger effect
const bottomThreshold = window.innerHeight - 200; // Y position to consider "bottom" for chain2
const topThreshold = 200; // Y position to consider "top" for chain1
let hitstopTimeout = null;

function triggerPhysicsHitstop() {
    engine.timing.timeScale = 0; // Pause physics
            
    // Resume after 0.3 seconds
    hitstopTimeout = setTimeout(() => {
        engine.timing.timeScale = 1;
        hitstop = false;
        hitstopTimeout = null;
    }, 500);
}

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

    // Update ceiling position
    Body.setPosition(ceiling, { x: window.innerWidth / 2, y: -50 });
    Body.setVertices(ceiling, [
        { x: 0, y: -50 },
        { x: window.innerWidth, y: -50 },
        { x: window.innerWidth, y: -150 },
        { x: 0, y: -150 }
    ]);

    // Update wall positions
    Body.setPosition(leftWall, { x: -50, y: window.innerHeight / 2 });
    Body.setPosition(rightWall, { x: window.innerWidth + 50, y: window.innerHeight / 2 });
}); 