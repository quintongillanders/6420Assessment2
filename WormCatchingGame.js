var timer;
var timeLeft = 60; // 1 minute
var timeUp = document.getElementById('timeUp');

//when the timer runs out
function gameOver() {
    var gameOver = document.getElementById('gameOver');
    gameMusic.pause();
    
        gameOver.currentTime = 0;
    //play sound
            gameOver.play();

        clearInterval(timer); // stop the timer

        // show the time up message once the timer has ended. 
        timeUp.style.display = 'block';
    }
    
function updateTimer() {
    timeLeft = timeLeft -1;
    if(timeLeft >= 0)
        $('#timer').html(timeLeft);
     else {
        gameOver();
    }
}


function startGame() {
    var audio = document.getElementById('gameMusic');

    audio.volume = 0.5; // game music volume 
    
    gameMusic.currentTime = 0;
    
    //play sound
    if(audio.paused) {
        audio.play();
        audio
        timer = setInterval(updateTimer, 1000);
        timeUp.style.hide = 'block';
        player();
        draw();
        drawWorm();
        updateTimer();
    }
    
}

document.getElementById('startGame').addEventListener("click" , startGame);

function restartGame() {
    var audio = document.getElementById('gameMusic');
   audio.pause("SunshineBliss.mp3");
    timeUp.style.display = 'none';
   // reset the timer when the restart button is clicked
   clearInterval(timer);
   timeLeft = 60; // reset timer to 1 minute

   
}

document.getElementById('restartGame').addEventListener("click", restartGame);
document.getElementById('startGame').addEventListener("click" , startGame);

function wormMiss() {
    var audio = document.getElementById("missWorm");
    audio.play();
    audio
}

function wormCaught() {
    var audio = document.getElementById("wormCaught");
    audio.play();
    audio
}


function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage()
    

}
function drawWorm() {
    var canvas = document.getElementById('gameCanvas');
    var ctx = canvas.getContext('2d');

    ctx.beginPath();
    ctx.arc(300, 400, 100, 0, Math.PI, true);
    ctx.StrokeStyle = 'black';
    ctx.lineWidth = 4;
    ctx.fillStyle = 'sandybrown';
    ctx.fill();
    ctx.stroke();
    
}


function player() {
    // Character Sprite sheet image from https://opengameart.org/content/base-character-spritesheet-16x16
    const characterSpriteSheet = new Image();
    characterSpriteSheet.src = "./assets/main_character.png";
    characterSpriteSheet.onload = load;

    // Background image Hand painted sand texture from https://opengameart.org/content/hand-painted-sand-texture-0
    const backgroundImage = new Image();
    backgroundImage.src = "./assets/Sand.png";
    backgroundImage.onload = load;

    // set this to the number of elements you want to load before initalising
    const awaitLoadCount = 3;
    let loadCount = 0;

    // time tracking
    let lastTimeStamp = 0;
    let tick = 0;

    // canvas and context, not const as we don't set the value until document ready
    let canvas;
    let ctx;

    // game objects
    let character;

    // run when the website has finished loading
    $('document').ready(function () {
        console.log("ready");
        load();
    });

    // call this function after each loadable element has finished loading.
    // Once all elements are loaded, loadCount threshold will be met to init.
    function load() {
        loadCount++;
        console.log("load " + loadCount);
        if (loadCount >= awaitLoadCount) {
            init();
        }
    }

    // initialise canvas and game elements
    function init() {
        console.log("init");
        canvas = document.getElementById('gameCanvas');
        ctx = canvas.getContext('2d');

        character = Character(
            characterSpriteSheet,
            [64, 64],

        

            [ // main character set
                [ // walk up track
                    [0, 0], [64, 0], [128, 0], [192, 0]
                ],
                [ // walk down track 
                    [256, 0], [320, 0], [384, 0], [448, 0]
                ],
                [ // walk left track
                    [0, 64], [64, 64], [128, 64], [192, 64]
                ],
                [ // walk right track 
                    [256, 64], [320, 64], [384, 64], [448, 64]
                ],
            ],

            1
        );
        
        character.init();

        document.addEventListener("keydown", doKeyDown);
        document.addEventListener("keyup", doKeyUp);

        window.requestAnimationFrame(run);
    }

    // Game loop function
    function run(timeStamp) {
        tick = (timeStamp - lastTimeStamp);
        lastTimeStamp = timeStamp;

        update(tick);
        draw();

        window.requestAnimationFrame(run);
    }

    function update() {
        character.update(tick);
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(backgroundImage, 0, 0, 800, 800);
        character.draw(ctx);
    }

    function doKeyDown(e) {
        e.preventDefault();
        if (character != undefined) { character.doKeyInput(e.key, true); }
    }

    function doKeyUp(e) {
        e.preventDefault();
        if (character != undefined) { character.doKeyInput(e.key, false); }
    }

    // Create and return a new Character object.
    // Param: spritesheet = Image object
    // Param: spriteSize = Array of 2 numbers [width, height]
    // Param: spriteFrames = 3D array[Tracks[Frames[Frame X, Y]]]
    // Param: spriteScale = Number to scale sprite size -> canvas size
    function Character(spritesheet, spriteSize, spriteFrames, spriteScale) {
        return {

            spriteSheet: spritesheet,       // image containing the sprites
            spriteFrameSize: spriteSize,    // dimensions of the sprites in the spritesheet
            spriteFrames: spriteFrames,     // 3d array. X = animation track, Y = animation frame, Z = X & Y of frame
            spriteScale: spriteScale,       // amount to scale sprites by (numbers except 1 will be linearly interpolated)
            spriteCanvasSize: spriteSize,   // Calculated size after scale. temp value set, overwritten in init

            animationTrack: 0,              // current animation frame set to use
            animationFrame: 0,              // current frame in animation to draw
            frameTime: 125,                 // milliseconds to wait between animation frame updates
            timeSinceLastFrame: 0,          // track time since the last frame update was performed
            lastAction: "",                 // Last user input action performed

            position: [0, 0],               // position of the character (X, Y)
            direction: [0, 0],              // X and Y axis movement amount
            velocity: 0.2,                   // rate of position change for each axis

            // Initialise variables that cannot be calculated during
            // object creation.
            init() {
                console.log("init");
                // Apply scale multiplier to sprite frame dimensions
                this.spriteCanvasSize = [
                    this.spriteFrameSize[0] * this.spriteScale,
                    this.spriteFrameSize[1] * this.spriteScale
                ];
            },

            // Handle actions for the character to perform.
            // param: action = string of action name.
            action(action) {
                console.log(`action: ${action}. Animation Frame ${this.animationFrame}`);
                // ignore duplicate actions.
                if (action === this.lastAction) return;

                // Handle each action type as cases.
                switch (action) {
                    case "moveLeft":
                        this.animationTrack = 2;
                        this.animationFrame = 0;
                        this.direction[0] = -this.velocity;
                        break;
                    case "moveRight":
                        this.animationTrack = 3;
                        this.animationFrame = 0;
                        this.direction[0] = this.velocity;
                        break;
                    case "moveUp":
                        this.animationTrack = 0;
                        this.animationFrame = 0;
                        this.direction[1] = -this.velocity;
                        break;
                    case "moveDown":
                        this.animationTrack = 1;
                        this.animationFrame = 0;
                        this.direction[1] = this.velocity;
                        break;
                    case "noMoveHorizontal":
                        this.direction[0] = 0;
                        this.animationFrame = 0;
                        break;
                    case "noMoveVertical":
                        this.direction[1] = 0;
                        this.animationFrame = 0;
                        break;
                    case "catchWorm":
                        this.animationTrack = 3;
                        this.animationFrame = 0;
                    default:
                        this.direction = [0, 0];
                        break;
                }

                // keep track of last action to avoid reinitialising the current action.
                this.lastAction = action;
            },

            update(tick) {
                // increase time keeper by last update delta
                this.timeSinceLastFrame += tick;
                // check if time since last frame meets threshold for new frame
                if (this.timeSinceLastFrame >= this.frameTime) {
                    // reset frame time keeper
                    this.timeSinceLastFrame = 0;

                    // update frame to next frame on the track. 
                    // Modulo wraps the frames from last frame to first.
                    if (this.direction[0] !== 0 || this.direction[1] !== 0) {
                        this.animationFrame = (this.animationFrame + 1) % this.spriteFrames[this.animationTrack].length;
                    }
                }

                // Calculate how much movement to perform based on how long
                // it has been since the last position update.
                this.position[0] += this.direction[0] * tick;
                this.position[1] += this.direction[1] * tick;
                
                
                
            },

            // Draw character elements using the passed context (canvas).
            // Param: context = canvas 2D context.
            draw(context) {
                // Draw image to canvas.
                // Params: (spritesheet Image, 
                //          sprite X, sprite Y, sprite width, sprite height
                //          position on canvas X, position on canvas Y, scaled width, scaled height).
                context.drawImage(
                    this.spriteSheet,
                    this.spriteFrames[this.animationTrack][this.animationFrame][0],
                    this.spriteFrames[this.animationTrack][this.animationFrame][1],
                    this.spriteFrameSize[0],
                    this.spriteFrameSize[1],
                    this.position[0],
                    this.position[1],
                    this.spriteCanvasSize[0],
                    this.spriteCanvasSize[1]
                );
            },

            // Handle input from keyboard for the character.
            // Param: e = event key string.
            // Param: isKeyDown = boolean, true = key pressed, false = key released
            doKeyInput(e, isKeydown = true) {
                switch (e) {
                    case "w": // move up
                        if (isKeydown) this.action("moveUp");
                        else this.action("noMoveVertical");
                        break;
                    case "a": // move right
                        if (isKeydown) this.action("moveLeft");
                        else this.action("noMoveHorizontal");
                        break;
                    case "s": // move down
                        if (isKeydown) this.action("moveDown");
                        else this.action("noMoveVertical");
                        break;
                    case "d": // move left
                        if (isKeydown) this.action("moveRight");
                        else this.action("noMoveHorizontal");
                        break;
                        case "": // space bar to catch the worms
                        if(isKeydown) {
                            if (wormClose()) {
                            this.action("catchWorm");
                                wormCaught();
                            } else {
                                wormMiss();
                            }
                        }
                        break;
                    default:
                        if (!isKeydown) this.action("stop");
                        break;
                }

            }
        };
    }
}


    





















