import * as constants from './modules/constants.mjs';

const canvas = document.getElementById('canvas'); //main canvas where the actions will take place
const backgroundCanvas = document.getElementById('background-canvas'); //another canvas because this canvas will be translating with time
// const container = document.getElementById('game-container');
var scaleX = (window.innerWidth / constants.BG_WIDTH);
var scaleY = (window.innerHeight / constants.BG_HEIGHT);

const scale = Math.min(scaleX, scaleY);

canvas.width = canvas.width * scale;
// canvas.width = window.innerWidth;
canvas.height = canvas.height * scale;

backgroundCanvas.width = backgroundCanvas.width * scale;
// backgroundCanvas.width = window.innerWidth;
backgroundCanvas.height = backgroundCanvas.height * scale;

let currentState = constants.START;

let translateSpeed = 0;
const pipes = [];
let pipeGap = Math.floor(canvas.height * 0.2); //gap between top and bottom pipes
let pipe_dx = 0;
const pipeDist = canvas.width - 105 * scale; //distance between two pipe pairs
let drawing = false;

let birdWingsInterval;

//animation timing - to control the rate of painting on canvas

let startTime = -1;
const animationLength = 33;
let progress = 0;

// Scoring
let score = 0;
let gameOver = false;

const font = "bold " + Math.floor(canvas.height * 0.1) + "px" + " Serif";
const hitBoxMargin = Math.floor(canvas.width * 0.03); //used to decrease the enemy hit box for better gameplay

// Coordinates and dimension values to be used for positioning and drawing on canvas

// bird
const birdX = Math.floor(canvas.width * 0.2);
const birdYInitial = Math.floor(canvas.height / 2 - constants.BIRD_HEIGHT * scale / 2);
let birdY = birdYInitial; //y coordinate will change on clicking
const birdY_dx_initial = Math.floor(canvas.height * 0.08);
let birdY_dx = 0; //distance in Y axis by which bird coordinate will change
let birdGravity = 0 //velocity at which the bird will fall
const birdGravityInitial = Math.floor(canvas.height * 0.005);

// ground
const groundCanvasWidth = canvas.width;
const groundCanvasHeight = Math.floor((constants.GROUND_HEIGHT / constants.GROUND_WIDTH) * groundCanvasWidth);
const groundClearance = Math.floor(0.1 * canvas.height); //part of ground that would appear on canvas
const groundCanvasX = 0;
const groundCanvasY = Math.floor(canvas.height - groundClearance);

// Title text
const titleCanvasWidth = constants.TITLE_TEXT_WIDTH * scale;
const titleCanvasHeight = constants.TITLE_TEXT_HEIGHT * scale;
const titleCanvasX = Math.floor(canvas.width / 2 - titleCanvasWidth / 2);
const titleCanvasY = Math.floor(canvas.height / 4);

// Bird pos on start screen
const birdCanvasX = Math.floor(canvas.width / 2 - constants.BIRD_WIDTH * scale / 2);
const birdCanvasY = titleCanvasY + titleCanvasHeight + Math.floor(canvas.height * 0.06);

// Play button
const playBtnCanvasWidth = constants.PLAY_BUTTON_WIDTH * scale;
const playBtnCanvasHeight = constants.PLAY_BUTTON_HEIGHT * scale;
const playBtnCanvasX = Math.floor(canvas.width / 2 - playBtnCanvasWidth / 2);
const playBtnCanvasY = birdCanvasY + constants.BIRD_HEIGHT * scale + Math.floor(canvas.height * 0.14);

// Get Ready Text
const getReadyCanvasWidth = constants.READY_TEXT_WIDTH * scale;
const getReadyCanvasHeight = constants.READY_TEXT_HEIGHT * scale;
const getReadyCanvasX = canvas.width / 2 - getReadyCanvasWidth / 2;
const getReadyCanvasY = Math.floor(canvas.height * 0.2);

// Jump instruction image
const jumpInstructionCanvasWidth = constants.JUMP_INSTRUCTION_WIDTH * scale;
const jumpInstructionCanvasHeight = constants.JUMP_INSTRUCTION_HEIGHT * scale;
const jumpInstructionX = canvas.width / 2 - jumpInstructionCanvasWidth / 2;
const jumpInstructionY = getReadyCanvasY + getReadyCanvasHeight + Math.floor(canvas.height * 0.1);

// Game Over Text
const gameOverWidth = constants.GAME_OVER_WIDTH * scale;
const gameOverHeight = constants.GAME_OVER_HEIGHT * scale;
const gameOverX = Math.floor(canvas.width / 2 - gameOverWidth / 2);
const gameOverY = Math.floor(canvas.height * 0.2);

// Game over score
const gameOverScoreY = gameOverY + gameOverHeight + Math.floor(canvas.height * 0.14);

// Game Over Play Button
const gameOverPlayBtnY = gameOverScoreY + Math.floor(canvas.height * 0.2);

if (canvas.getContext && backgroundCanvas.getContext) {
    const ctx = canvas.getContext('2d');
    const bgCtx = backgroundCanvas.getContext('2d');

    /*
        imageSmoothingEnabled determines whether scaled images are smoothed. Default is true.
        Here there is no need of image smoothing as the sprite is pixel art.
    */
    ctx.imageSmoothingEnabled = false;
    bgCtx.imageSmoothingEnabled = false;

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
            constants.PIPE_WIDTH * scale, constants.PIPE_HEIGHT * scale);
        ctx.drawImage(sprite,
            constants.GREEN_PIPE_DOWN_X, constants.GREEN_PIPE_DOWN_Y,
            constants.PIPE_WIDTH, constants.PIPE_HEIGHT,
            x_down, y_down,
            constants.PIPE_WIDTH * scale, constants.PIPE_HEIGHT * scale)
    }

    const low = Math.floor(canvas.height / 5) - constants.PIPE_HEIGHT * scale;
    const high = 0;
    function getNewPipePair() {
        const pipe_up_y = Math.floor(Math.random() * (high - low) + low);

        return { x_up: canvas.width, y_up: pipe_up_y, x_down: canvas.width, y_down: pipe_up_y + constants.PIPE_HEIGHT * scale + pipeGap, crossed: false };
    }

    function onPlayButtonClick(event) {
        const canvasRect = canvas.getBoundingClientRect();
        const mouseCanvasX = event.clientX - canvasRect["left"];
        const mouseCanvasY = event.clientY - canvasRect["top"];
        if (mouseCanvasX >= playBtnCanvasX && mouseCanvasX <= playBtnCanvasX + playBtnCanvasWidth) {
            if (currentState === constants.START &&
                mouseCanvasY >= playBtnCanvasY && mouseCanvasY <= playBtnCanvasY + playBtnCanvasHeight) {
                //condition for start screen play button
                currentState = constants.READY;

                canvas.onclick = initializeGameValues;
            } else if (currentState === constants.FINISH &&
                mouseCanvasY >= gameOverPlayBtnY && mouseCanvasY <= gameOverPlayBtnY + playBtnCanvasHeight) {
                //condition for game Over screen play button
                currentState = constants.READY;
                resetBirdPos();

                canvas.onclick = initializeGameValues;
            }
        }
    }

    function resetBirdPos() {
        birdY = birdYInitial;
    }

    function initializeGameValues() {
        pipe_dx = Math.floor(canvas.width * 0.008);
        birdY_dx = birdY_dx_initial;
        pipes.splice(0, pipes.length); //clear the pipes
        pipes.push(getNewPipePair());
        bg_dx = 0; //represents the x position on background canvas as well as x position on the background pattern which is reset to 0
        bgCtx.resetTransform(); //resets the background canvas matrix to identity matrix as the matrix changes because of translation
        resetBirdPos();
        currentState = constants.GAME;
        translateSpeed = 1;
        gameOver = false;
        birdGravity = birdGravityInitial;
        score = 0;
        birdJump();
        birdAnimationHelper();
        canvas.onclick = birdJump;
    }

    //this functions stops all kind of movements happening on canvas by changing their rate of change to 0
    function stopGameValues() {
        pipe_dx = 0;
        birdY_dx = 0;
        translateSpeed = 0;
        gameOver = true;
        birdGravity = 0;
        canvas.onclick = onPlayButtonClick;
        clearInterval(birdWingsInterval);
    }

    //draws the current score on screen
    function drawScore(y_pos) {
        ctx.font = font; //sets the font based on the css font property
        ctx.fillStyle = "white"; //specifies the color, gradient, or pattern to use inside shapes
        ctx.textAlign = "center"; //aligns text based on the css property
        ctx.fillText(score, canvas.width / 2, y_pos); //text to be drawn, x pos, y pos
    }

    function drawPipes() {
        for (let i = 0; i < pipes.length; i++) {
            drawPipePair(pipes[i]);

            pipes[i].x_up -= pipe_dx;
            pipes[i].x_down -= pipe_dx;

        }
    }

    function managePipes() {
        for (let i = 0; i < pipes.length; i++) {
            if (checkCollision(pipes[i].x_up, pipes[i].y_up, pipes[i].y_down)) {
                if (!gameOver) stopGameValues();
                break;
            } else if (!pipes[i].crossed && checkPipeCrossed(pipes[i].x_up)) {
                score++;
                pipes[i].crossed = true;
            }
        }

        drawPipes();

        if (pipes.length > 0 && pipes[pipes.length - 1].x_up <= pipeDist) {
            pipes.push(getNewPipePair());
        }

        if (pipes.length > 0 && pipes[0].x_up <= -constants.PIPE_WIDTH * scale) {
            pipes.shift();
        }
    }

    function checkGameOver() {
        if (gameOver) {
            drawGameOverScreen();
            currentState = constants.FINISH;
        } else {
            drawScore(Math.floor(canvas.height * 0.14));
        }
    }

    //A simple collision checker to see if the bird is colliding with a pipe
    function checkCollision(enemy_x, enemy_yup, enemy_ydown) {

        const enemy_yup_bottom = enemy_yup + constants.PIPE_HEIGHT * scale;

        if ((birdX + constants.BIRD_WIDTH * scale >= enemy_x + hitBoxMargin) &&
            (birdX <= enemy_x + constants.PIPE_WIDTH * scale - hitBoxMargin)) {
            if ((birdY >= enemy_yup_bottom - hitBoxMargin) &&
                (birdY + constants.BIRD_HEIGHT * scale <= enemy_ydown + hitBoxMargin)) {
                return false;
            } else {
                return true;
            }
        } else {
            return false;
        }
    }

    function checkPipeCrossed(enemy_x) {
        if ((birdX < enemy_x + constants.PIPE_WIDTH * scale) &&
            (birdX + constants.BIRD_WIDTH * scale > enemy_x + constants.PIPE_WIDTH * scale)) {
            return true;
        }
        return false;
    }

    //checks the collision between bird and ground
    function checkGroundCollision() {
        if (birdY + constants.BIRD_HEIGHT * scale >= groundCanvasY) {
            if (!gameOver) stopGameValues();
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
    pattern_ctx.imageSmoothingEnabled = false;

    birdAnimationHelper();
    let bg_dx = 0; //used for translating the background on x axis



    function draw(timestamp) {

        if (startTime < 0) {
            startTime = timestamp;
        } else {
            progress = timestamp - startTime;
        }

        //This makes sure that drawing happens in almost 30fps
        if (progress > animationLength) {
            drawing = true;
            switch (currentState) {
                case constants.START:
                    drawBackground(timestamp);
                    drawStartScreen();
                    break;
                case constants.READY:
                    drawBackground();
                    drawGetReadyScreen();
                    break;
                case constants.GAME:
                    drawBackground();
                    drawGame(timestamp);
                    break;
                case constants.FINISH:
                    /*
                        Do nothing here. There would be no repainting on canvas until the play button is clicked again.
                        This is an optimization to avoid unnecessary paintings.
                    */
                    break;
                default:
                    drawStartScreen();
            }
            startTime = timestamp;
            progress = 0;
            drawing = false;
        }
        requestAnimationFrame(draw);
    }

    //draws the background for game using the background canvas
    function drawBackground(timestamp) {
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

        /* 
            The order in which images are drawn is important. Hence maintaining the following order of drawImage is important.
            Here the bird is drawn first, then the pipes and then the ground which is why the pipes appear on top of bird on 
            collision and the pipes appear to comes from the ground because the ground is drawn over the pipes thus hiding the
            bottom of pipes. 
        */
        checkGroundCollision();
        ctx.drawImage(sprite, constants.RED_BIRD[birdFrameCnt].x, constants.RED_BIRD[birdFrameCnt].y, constants.BIRD_WIDTH, constants.BIRD_HEIGHT, birdX, birdY, constants.BIRD_WIDTH * scale, constants.BIRD_HEIGHT * scale);
        managePipes();
        checkGameOver();
        ctx.drawImage(sprite, constants.GROUND_X, constants.GROUND_Y, constants.GROUND_WIDTH, constants.GROUND_HEIGHT, groundCanvasX, groundCanvasY, groundCanvasWidth, groundCanvasHeight);

        birdY += birdGravity;
        birdGravity += 0.03;
        birdY = Math.min(canvas.height - groundClearance - constants.BIRD_HEIGHT * scale, birdY);
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
            constants.BIRD_WIDTH * scale, constants.BIRD_HEIGHT * scale);

        ctx.drawImage(sprite,
            constants.PLAY_BUTTON_X, constants.PLAY_BUTTON_Y,
            constants.PLAY_BUTTON_WIDTH, constants.PLAY_BUTTON_HEIGHT,
            playBtnCanvasX, playBtnCanvasY,
            playBtnCanvasWidth, playBtnCanvasHeight);
    }

    function drawGetReadyScreen() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.drawImage(sprite,
            constants.READY_TEXT_X, constants.READY_TEXT_Y,
            constants.READY_TEXT_WIDTH, constants.READY_TEXT_HEIGHT,
            getReadyCanvasX, getReadyCanvasY,
            getReadyCanvasWidth, getReadyCanvasHeight);

        ctx.drawImage(sprite,
            constants.JUMP_INSTRUCTION_X, constants.JUMP_INSTRUCTION_Y,
            constants.JUMP_INSTRUCTION_WIDTH, constants.JUMP_INSTRUCTION_HEIGHT,
            jumpInstructionX, jumpInstructionY,
            jumpInstructionCanvasWidth, jumpInstructionCanvasHeight);

        ctx.drawImage(sprite, constants.RED_BIRD[birdFrameCnt].x, constants.RED_BIRD[birdFrameCnt].y, constants.BIRD_WIDTH, constants.BIRD_HEIGHT, birdX, birdY, constants.BIRD_WIDTH * scale, constants.BIRD_HEIGHT * scale);
    }

    function drawGameOverScreen() {

        ctx.drawImage(sprite,
            constants.GAME_OVER_X, constants.GAME_OVER_Y,
            constants.GAME_OVER_WIDTH, constants.GAME_OVER_HEIGHT,
            gameOverX, gameOverY,
            gameOverWidth, gameOverHeight);

        drawScore(gameOverScoreY);

        ctx.drawImage(sprite,
            constants.PLAY_BUTTON_X, constants.PLAY_BUTTON_Y,
            constants.PLAY_BUTTON_WIDTH, constants.PLAY_BUTTON_HEIGHT,
            playBtnCanvasX, gameOverPlayBtnY,
            playBtnCanvasWidth, playBtnCanvasHeight);
    }


    function birdJump() {
        //to avoid jump getting executed if there's a delay in drawing frames
        if (!drawing) {
            birdGravity = birdGravityInitial;
            birdY -= birdY_dx;
        }
    }

    canvas.onclick = onPlayButtonClick;

    requestAnimationFrame(draw);
}

