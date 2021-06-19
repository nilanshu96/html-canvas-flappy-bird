import * as constants from './modules/constants.mjs';

const canvas = document.getElementById('canvas'); //main canvas where the actions will take place
const backgroundCanvas = document.getElementById('background-canvas'); //another canvas because this canvas will be translating with time

let currentState = constants.START;

let translateSpeed = 0;
const pipes = [];
let pipe_dx = 0;

let birdWingsInterval;

// Scoring
let score = 0;
let enemyId = 0;

// bird Coordiantes
const birdX = 100;
let birdY = 200; //y coordinate will change on clicking
let birdY_dx = 0; //distance in Y axis by which bird coordinate will change
let birdGravity = 0 //velocity at which the bird will fall

// ground values within the canvas
const groundCanvasWidth = canvas.width;
const groundCanvasHeight = Math.floor((constants.GROUND_HEIGHT / constants.GROUND_WIDTH) * groundCanvasWidth);
const groundClearance = groundCanvasHeight / 2; //part of ground that would appear on canvas
const groundCanvasX = 0;
const groundCanvasY = canvas.height - groundCanvasHeight / 2;

// Title text values within the canvas
const titleCanvasWidth = constants.TITLE_TEXT_WIDTH * constants.SPRITE_SCALE;
const titleCanvasHeight = constants.TITLE_TEXT_HEIGHT * constants.SPRITE_SCALE;
const titleCanvasX = canvas.width / 2 - titleCanvasWidth / 2;
const titleCanvasY = canvas.height / 4;

// Bird values on start screen
const birdCanvasX = canvas.width/2 - constants.BIRD_WIDTH * constants.SPRITE_SCALE/2;
const birdCanvasY = titleCanvasY + titleCanvasHeight + 30;

// Play button values within canvas
const playBtnCanvasWidth = constants.PLAY_BUTTON_WIDTH * constants.SPRITE_SCALE;
const playBtnCanvasHeight = constants.PLAY_BUTTON_HEIGHT * constants.SPRITE_SCALE;
const playBtnCanvasX = canvas.width/2 - playBtnCanvasWidth/2;
const playBtnCanvasY = birdCanvasY + constants.BIRD_HEIGHT * constants.SPRITE_SCALE + 70;

if (canvas.getContext && backgroundCanvas.getContext) {
    const ctx = canvas.getContext('2d');
    const bgCtx = backgroundCanvas.getContext('2d');
    const sprite = new Image();
    sprite.src = constants.SPRITE_SRC;

    let birdFrameCnt = 0; // will always be between 0 and 2 as there are 3 bird frames

    // function to help change the bird frame being used from the sprite by changing the frame count 
    // at a slower speed than requestAnimationFrame()
    function birdAnimationHelper() {
        birdWingsInterval = setInterval(() => {
            birdFrameCnt++;
            birdFrameCnt = birdFrameCnt % constants.BIRD_FRAMES;
        }, 90);
    }

    function drawPipePair({ x_up, y_up, x_down, y_down }) {
        ctx.drawImage(sprite,
            constants.GREEN_PIPE_UP_X, constants.GREEN_PIPE_UP_Y,
            constants.PIPE_WIDTH, constants.PIPE_HEIGHT,
            x_up, y_up,
            constants.PIPE_WIDTH * constants.SPRITE_SCALE, constants.PIPE_HEIGHT * constants.SPRITE_SCALE);
        ctx.drawImage(sprite,
            constants.GREEN_PIPE_DOWN_X, constants.GREEN_PIPE_DOWN_Y,
            constants.PIPE_WIDTH, constants.PIPE_HEIGHT,
            x_down, y_down,
            constants.PIPE_WIDTH * constants.SPRITE_SCALE, constants.PIPE_HEIGHT * constants.SPRITE_SCALE)
    }

    function getNewPipePair() {
        const high = -constants.PIPE_GAP - groundClearance;
        const low = -constants.PIPE_HEIGHT * constants.SPRITE_SCALE + constants.PIPE_GAP;
        const pipe_up_y = Math.floor(Math.random() * (high - low) + low);

        return { x_up: canvas.width, y_up: pipe_up_y, x_down: canvas.width, y_down: pipe_up_y + constants.PIPE_HEIGHT * constants.SPRITE_SCALE + constants.PIPE_GAP, crossed: false };
    }

    function onPlayButtonClick(event) {
        const canvasRect = canvas.getBoundingClientRect();
        const mouseCanvasX = event.clientX - canvasRect["left"];
        const mouseCanvasY = event.clientY - canvasRect["top"];
        if(mouseCanvasX >= playBtnCanvasX && mouseCanvasX <= playBtnCanvasX + playBtnCanvasWidth) {
            if(mouseCanvasY >= playBtnCanvasY && mouseCanvasY <= playBtnCanvasY + playBtnCanvasHeight) {
                console.log("button clicked");
            }
        }
    }

    function initializeGameValues() {
        pipe_dx = 2;
        birdY_dx = 50;
        translateSpeed = 1;
        birdGravity = 2;
        canvas.removeEventListener("click", initializeGameValues);
        canvas.addEventListener("click", birdJump);
    }

    //this functions stops all kind of movements happening on canvas by changing their rate of change to 0
    function stopGameValues() {
        pipe_dx = 0;
        birdY_dx = 0;
        translateSpeed = 0;
        birdGravity = 0;
        canvas.removeEventListener("click", birdJump);
        clearInterval(birdWingsInterval);
    }

    //draws the current score on screen
    function drawScore() {
        ctx.font = "bold 50px Serif"; //sets the font based on the css font property
        ctx.fillStyle = "white"; //specifies the color, gradient, or pattern to use inside shapes
        ctx.textAlign = "center"; //aligns text based on the css property
        ctx.fillText(score, canvas.width / 2, 70); //text to be drawn, x pos, y pos
    }

    function managePipes() {
        for (let i = 0; i < pipes.length; i++) {
            if (checkCollision(pipes[i].x_up, pipes[i].y_up, pipes[i].y_down)) {
                stopGameValues();
            } else if (!pipes[i].crossed && checkPipeCrossed(pipes[i].x_up)) {
                score++;
                console.log(score);
                pipes[i].crossed = true;
            }
            drawPipePair(pipes[i]);
            pipes[i].x_up -= pipe_dx;
            pipes[i].x_down -= pipe_dx;
        }

        if (pipes[pipes.length - 1].x_up <= canvas.width / 2) {
            pipes.push(getNewPipePair());
        }

        if (pipes[0].x_up <= -constants.PIPE_WIDTH * constants.SPRITE_SCALE) {
            pipes.shift();
        }
    }

    //A simple collision checker to see if the bird is colliding with a pipe
    function checkCollision(enemy_x, enemy_yup, enemy_ydown) {

        const enemy_yup_bottom = enemy_yup + constants.PIPE_HEIGHT * constants.SPRITE_SCALE;

        if ((birdX + constants.BIRD_WIDTH * constants.SPRITE_SCALE >= enemy_x + constants.HIT_BOX_MARGIN) &&
            (birdX <= enemy_x + constants.PIPE_WIDTH * constants.SPRITE_SCALE - constants.HIT_BOX_MARGIN)) {
            if ((birdY >= enemy_yup_bottom - constants.HIT_BOX_MARGIN) &&
                (birdY + constants.BIRD_HEIGHT * constants.SPRITE_SCALE <= enemy_ydown + constants.HIT_BOX_MARGIN)) {
                return false;
            } else {
                return true;
            }
        } else {
            return false;
        }
    }

    function checkPipeCrossed(enemy_x) {
        if ((birdX < enemy_x + constants.PIPE_WIDTH * constants.SPRITE_SCALE) &&
            (birdX + constants.BIRD_WIDTH * constants.SPRITE_SCALE > enemy_x + constants.PIPE_WIDTH * constants.SPRITE_SCALE)) {
            return true;
        }
        return false;
    }

    //checks the collision between bird and ground
    function checkGroundCollision() {
        if (birdY + constants.BIRD_HEIGHT * constants.SPRITE_SCALE >= groundCanvasY) {
            stopGameValues();
        }
    }


    // Canvas to create the background image using sprite
    // This canvas will later be used by backgroundCanvas as an image for creating a repeating background pattern
    function getBackgroundPatternCanvas() {
        const pattern_canvas = document.createElement('canvas');
        pattern_canvas.height = backgroundCanvas.height;
        pattern_canvas.width = Math.ceil(backgroundCanvas.height * constants.BG_WIDTH / constants.BG_HEIGHT);
        return pattern_canvas;
    }

    const bgPatternCanvas = getBackgroundPatternCanvas();
    const pattern_ctx = bgPatternCanvas.getContext("2d");

    birdAnimationHelper();
    let bg_dx = 0; //used for translating the background on x axis

    pipes.push(getNewPipePair());

    function draw() {

        drawBackground();
        // drawGame();
        drawStartScreen();
        requestAnimationFrame(draw);
    }

    //draws the background for game using the background canvas
    function drawBackground() {
        bgCtx.clearRect(0, 0, backgroundCanvas.width, backgroundCanvas.height);
        pattern_ctx.clearRect(0, 0, bgPatternCanvas.width, bgPatternCanvas.height);
        pattern_ctx.drawImage(sprite, constants.BG_DAY_X, constants.BG_DAY_Y, constants.BG_WIDTH, constants.BG_HEIGHT, 0, 0, bgPatternCanvas.width, bgPatternCanvas.height);

        bgCtx.fillStyle = bgCtx.createPattern(bgPatternCanvas, "repeat-x"); //creates a repeating pattern on x axis using the bgPatternCanvas

        bgCtx.fillRect(bg_dx, 0, backgroundCanvas.width, backgroundCanvas.height); //stars drawing a rectangle from (bg_dx,0) position of canvas
        //the bg_dx also represents the x starting point from where the pattern would be drawn. Hence the pattern appears moving.
        //the pattern used in fillStyle never moves. fillRect here takes a rectangular part from the pattern from (bg_dx,0) location of pattern of size canvas width and height.

        bgCtx.translate(-translateSpeed, 0); //here canvas is gradually moving left on x-axis due to the negative translate
        bg_dx += translateSpeed; //bg_dx is added equal to the translate speed because the x origin or the zero point of x axis has moved left by translate speed
        //in simple words the the x origin has moved left of the screen due to negative translate which is not inside the canvas hence not visible anymore
        //therefore we add the translate speed to bg_dx to draw the pattern from the point where the canvas screen starts or the point from where the canvas becomes visible
    }

    //draws the game in the main canvas
    function drawGame() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        /*drawImage params 
            image - png, jpg, canvas etc,
            x_pos_in_img - represents the x position inside the image file from where the drawing would begin
            y_pos_in_img - same as above but for y axis,
            width_in_img - width of the section withing the image file which would be drawn in canvas
            height_in_img - same as above but for height,
            x_pos_canvas - x position in canvas,
            y_pos_canvas - y position in canvas,
            width_in_canvas - width of the image withing the canvas, this width property can be used to scale the section of the image being drawn
            height_in_canvas - same as above but for height
        */

        checkGroundCollision();
        managePipes();
        ctx.drawImage(sprite, constants.GROUND_X, constants.GROUND_Y, constants.GROUND_WIDTH, constants.GROUND_HEIGHT, groundCanvasX, groundCanvasY, groundCanvasWidth, groundCanvasHeight);
        ctx.drawImage(sprite, constants.RED_BIRD[birdFrameCnt].x, constants.RED_BIRD[birdFrameCnt].y, constants.BIRD_WIDTH, constants.BIRD_HEIGHT, birdX, birdY, constants.BIRD_WIDTH * constants.SPRITE_SCALE, constants.BIRD_HEIGHT * constants.SPRITE_SCALE);
        drawScore();
        birdY += birdGravity;
        birdY = Math.min(canvas.height - groundClearance - constants.BIRD_HEIGHT * constants.SPRITE_SCALE, birdY);
    }

    function drawStartScreen() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.drawImage(sprite,
            constants.TITLE_TEXT_X, constants.TITLE_TEXT_Y,
            constants.TITLE_TEXT_WIDTH, constants.TITLE_TEXT_HEIGHT,
            titleCanvasX, titleCanvasY,
            titleCanvasWidth, titleCanvasHeight);

        ctx.drawImage(sprite, 
            constants.RED_BIRD[birdFrameCnt].x, constants.RED_BIRD[birdFrameCnt].y, 
            constants.BIRD_WIDTH, constants.BIRD_HEIGHT, 
            birdCanvasX, birdCanvasY, 
            constants.BIRD_WIDTH * constants.SPRITE_SCALE, constants.BIRD_HEIGHT * constants.SPRITE_SCALE);

        ctx.drawImage(sprite,
            constants.PLAY_BUTTON_X, constants.PLAY_BUTTON_Y, 
            constants.PLAY_BUTTON_WIDTH, constants.PLAY_BUTTON_HEIGHT,
            playBtnCanvasX, playBtnCanvasY,
            playBtnCanvasWidth, playBtnCanvasHeight);
    }


    function birdJump() {
        birdY -= birdY_dx;
    }
    // canvas.addEventListener("click", initializeGameValues);
    canvas.addEventListener("click", onPlayButtonClick);

    draw();
}

