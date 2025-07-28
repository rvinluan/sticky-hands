// Matter.js setup
const { Engine, Render, World, Bodies, Body, Composite, Constraint, Vector } = Matter;

// Color palette array
const colors = ['#614EF1', '#FF7252', '#D03291', '#FFEC3D', '#C0FF52', '#90EDFF', '#462D08', '#FF3232'];
const colorNames = ['indigo', 'orange', 'raspberry', 'yellow', 'green', 'sky', 'brown', 'red'];

const linkWidth = 10;
const linkHeight = 30;
const ballRadius = 30;
const linkCount = 6;

// Physics engine variables
let engine, world, render;
let playerPhysicsHands = [];
let tempConstraints = [];
let centerBody = new Bodies.rectangle(window.innerWidth / 2, window.innerHeight / 2, 100, 100, {
    isStatic: true,
    render: {
        visible: false
    }
});
// Initialize physics after screens are loaded
function initializePhysics() {
    // Create an engine
    engine = Engine.create();
    engine.gravity.y = 0; // Disable gravity
    world = engine.world;

    // Create a renderer
    render = Render.create({
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

    World.add(world, centerBody);
    // World.add(world, tempConstraints);

    // Add constant downward force
    const gravityForce = Vector.create(0, 0.001); // Custom gravity force
    const reverseGravityForce = Vector.create(0, -0.001); // Upward gravity force

    function applyGravity() {
        // Apply force to chain depending on which side of the screen it is on
        playerPhysicsHands.forEach(hand => {
            if (hand.ball.render.sprite.texture.indexOf('thumb') !== -1) {
                Matter.Body.setAngle(hand.ball, Math.PI/4);
            }
            Composite.allBodies(hand.composite).forEach(body => {
                if(hand.composite.bodies[0].position.y <= window.innerHeight / 2) {
                    Body.applyForce(body, body.position, reverseGravityForce);
                } else {
                    Body.applyForce(body, body.position, gravityForce);
                }
            });
        });
    }

    // Add gravity force to the engine update
    Matter.Events.on(engine, 'beforeUpdate', applyGravity);

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

    function triggerPhysicsHitstop(player) {
        engine.timing.timeScale = 0; // Pause physics
        stopAllForces(player);
                
        // Resume after 0.3 seconds
        hitstopTimeout = setTimeout(() => {
            engine.timing.timeScale = 1;
            hitstop = false;
            hitstopTimeout = null;
        }, 500);
    }

    window.triggerPhysicsHitstop = triggerPhysicsHitstop;
}

// Function to create a ball and chain
function createBallAndChain(x, y, anchorTop = false, colorIndex = 0) {
    const chainLinks = [];
    const constraints = [];
    
    // Calculate starting position based on anchor point
    const yDirection = anchorTop ? 1 : -1;
    
    // Create the ball
    const ball = Bodies.circle(x, y + (linkCount*linkHeight*yDirection), ballRadius, {
        restitution: 0,
        friction: 0.4,
        sleepThreshold: 10,
        render: {
            sprite: {
                texture: `hand-${colorNames[colorIndex]}.png`,
                xScale: 0.24,
                yScale: 0.24
            }
        }
    });
    
    // Create chain links
    for (let i = 0; i < linkCount; i++) {
        const link = Bodies.rectangle(x, y + (i * (linkHeight*1.5) * yDirection), linkWidth, linkHeight, {
            isStatic: i === 0, // First link is static
            restitution: 0,
            friction: 0.8,
            render: {
                fillStyle: colors[colorIndex]
            }
        });
        chainLinks.push(link);
        
        // Create constraints between links
        if (i > 0) {
            const constraint = Constraint.create({
                bodyA: chainLinks[i - 1],
                bodyB: link,
                pointA: { x: 0, y: linkHeight/2 * yDirection },
                pointB: { x: 0, y: linkHeight/2 * yDirection * -1 },
                stiffness: .3, // Less stiffness for more elasticity
                render: {
                    type: 'line',
                    strokeStyle: colors[colorIndex],
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
        pointB: { x: 0, y: linkHeight/2 * yDirection},
        stiffness: 1,
        render: {
            type: 'line',
            strokeStyle: colors[colorIndex],
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

function manifestHand(player, x, y, is_top) {
    let h = createBallAndChain(x, y, is_top, player.colorIndex);
    World.add(world, [h.composite]);
    playerPhysicsHands.push(h);
    player.hand = h;
    player.position = h.composite.bodies[0].position;
    return h;
}

function removeHand(player) {
    if (!player.hand) return;

    let playerIndex = playerPhysicsHands.indexOf(player.hand);
    
    // Remove the composite from the world
    World.remove(world, playerPhysicsHands[playerIndex].composite);
    
    playerPhysicsHands.splice(playerIndex, 1);
}

// Function to fling the ball toward center
function fling(player) {
    if (!player.hand) return;
    
    const whichChain = player.hand;
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

function makeThumbsUp(player) {
    if(!player.hand) return;
    if(player.isThumbsUp) return;

    let squareEdge = 220;
    let destX = 0;
    let destY = 0;
    if(player.position.y > window.innerHeight / 2) {
        destY = squareEdge;
    } else {
        destY = -squareEdge;
    }
    if(player.position.x > window.innerWidth / 2) {
        destX = squareEdge;
    } else {
        destX = -squareEdge;
    }
    // vectorToCenter = Vector.normalise(vectorToCenter);
    let c = Constraint.create({
        bodyA: player.hand.ball,
        bodyB: centerBody,
        pointA: { x: 0, y: 0 },
        pointB: { x: destX, y: destY },
        length: 30,
        stiffness: 0,
        render: {
            visible: false
        }
    });
    tempConstraints.push(c);
    World.add(world, c);
    let textureString = player.hand.ball.render.sprite.texture;
    player.hand.ball.render.sprite.texture = textureString.replace('.png', '-thumb.png');
    player.isThumbsUp = true;
}

function putThumbsDown(player) {
    if(!player.hand) return;
    if(!player.isThumbsUp) return;
    let oldTex = player.hand.ball.render.sprite.texture.replace('-thumb', '');
    player.hand.ball.render.sprite.texture = oldTex;
    World.remove(world, tempConstraints);
    player.isThumbsUp = false;
}

function stopAllForces(player) {
    if (!player.hand) return;
    
    const whichChain = player.hand;
    Composite.allBodies(whichChain.composite).forEach(body => {
        Body.setVelocity(body, { x: 0, y: 0 });
    });
}

// Initialize physics immediately since scripts are loaded after screens
initializePhysics(); 