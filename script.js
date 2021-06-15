const canvas = document.getElementById('canvas'); //main canvas where the actions will take place
const backgroundCanvas = document.getElementById('background-canvas'); //another canvas because this canvas will be translating with time

const TRANSLATE_SPEED = 1;
const pipes = [];

// bird Coordiantes
const birdX = 100;
let birdY = 200; //y coordinate will change on clicking

/*Sprite Constants and Dimensions*/
const SPRITE_SRC = "./assets/flappy-sprite.png";
const SPRITE_SCALE = 3;

/* background */
const BG_DAY_X = 0;
const BG_DAY_Y = 0;
const BG_WIDTH = 142;
const BG_HEIGHT = 256;

/* Ground */
const GROUND_X = 292;
const GROUND_Y = 0;
const GROUND_WIDTH = 168;
const GROUND_HEIGHT = 56;

const groundCanvasWidth = canvas.width;
const groundCanvasHeight = Math.floor((GROUND_HEIGHT / GROUND_WIDTH) * groundCanvasWidth);
const groundClearance = groundCanvasHeight / 2; //part of ground that would appear on canvas
const groundCanvasX = 0;
const groundCanvasY = canvas.height - groundCanvasHeight / 2;

/* pipes */
const PIPE_GAP = 100;

const PIPE_WIDTH = 26;
const PIPE_HEIGHT = 160;

const GREEN_PIPE_UP_X = 56;
const GREEN_PIPE_UP_Y = 323;

const GREEN_PIPE_DOWN_X = 84;
const GREEN_PIPE_DOWN_Y = 323;

/* birds */
const BIRD_FRAMES = 3;
const BIRD_WIDTH = 17;
const BIRD_HEIGHT = 12;

/* Red Bird */
const RED_BIRD = [
    { x: 115, y: 381 },
    { x: 115, y: 407 },
    { x: 115, y: 433 }
];

if (canvas.getContext && backgroundCanvas.getContext) {
    const ctx = canvas.getContext('2d');
    const bgCtx = backgroundCanvas.getContext('2d');
    const sprite = new Image();
    sprite.src = SPRITE_SRC;

    let birdFrameCnt = 0; // will always be between 0 and 2 as there are 3 bird frames

    // function to help change the bird frame being used from the sprite by changing the frame count 
    // at a slower speed than requestAnimationFrame()
    function birdAnimationHelper() {
        setInterval(() => {
            birdFrameCnt++;
            birdFrameCnt = birdFrameCnt % BIRD_FRAMES;
        }, 90);
    }

    function drawPipePair({ x_up, y_up, x_down, y_down }) {
        ctx.drawImage(sprite, GREEN_PIPE_UP_X, GREEN_PIPE_UP_Y, PIPE_WIDTH, PIPE_HEIGHT, x_up, y_up, PIPE_WIDTH * SPRITE_SCALE, PIPE_HEIGHT * SPRITE_SCALE);
        ctx.drawImage(sprite, GREEN_PIPE_DOWN_X, GREEN_PIPE_DOWN_Y, PIPE_WIDTH, PIPE_HEIGHT, x_down, y_down, PIPE_WIDTH * SPRITE_SCALE, PIPE_HEIGHT * SPRITE_SCALE)
    }

    function getNewPipePairCoordinates() {
        const high = -PIPE_GAP - groundClearance;
        const low = -PIPE_HEIGHT * SPRITE_SCALE + PIPE_GAP;
        const pipe_up_y = Math.floor(Math.random() * (high - low) + low);

        return { x_up: canvas.width, y_up: pipe_up_y, x_down: canvas.width, y_down: pipe_up_y + PIPE_HEIGHT * SPRITE_SCALE + PIPE_GAP };
    }

    function managePipes() {

        for (let i = 0; i < pipes.length; i++) {
            drawPipePair(pipes[i]);
            pipes[i].x_up -= 2;
            pipes[i].x_down -= 2;
        }

        if (pipes[pipes.length - 1].x_up <= canvas.width / 2) {
            pipes.push(getNewPipePairCoordinates());
        }

        if (pipes[0].x_up <= -PIPE_WIDTH * SPRITE_SCALE) {
            pipes.shift();
        }
    }


    // Canvas to create the background image using sprite
    // This canvas will later be used by backgroundCanvas as an image for creating a repeating background pattern
    function getBackgroundPatternCanvas() {
        const pattern_canvas = document.createElement('canvas');
        pattern_canvas.height = backgroundCanvas.height;
        pattern_canvas.width = Math.ceil(backgroundCanvas.height * BG_WIDTH / BG_HEIGHT);
        return pattern_canvas;
    }

    const bgPatternCanvas = getBackgroundPatternCanvas();
    const pattern_ctx = bgPatternCanvas.getContext("2d");

    birdAnimationHelper();
    let bg_dx = 0; //used for translating the background on x axis

    pipes.push(getNewPipePairCoordinates());

    function draw() {

        /* BACKGROUND */
        bgCtx.clearRect(0, 0, backgroundCanvas.width, backgroundCanvas.height);
        pattern_ctx.clearRect(0, 0, bgPatternCanvas.width, bgPatternCanvas.height);
        pattern_ctx.drawImage(sprite, BG_DAY_X, BG_DAY_Y, BG_WIDTH, BG_HEIGHT, 0, 0, bgPatternCanvas.width, bgPatternCanvas.height);

        bgCtx.fillStyle = bgCtx.createPattern(bgPatternCanvas, "repeat-x"); //creates a repeating pattern on x axis using the bgPatternCanvas

        bgCtx.fillRect(bg_dx, 0, backgroundCanvas.width, backgroundCanvas.height); //stars drawing a rectangle from (bg_dx,0) position of canvas
        //the bg_dx also represents the x starting point from where the pattern would be drawn. Hence the pattern appears moving.
        //the pattern used in fillStyle never moves. fillRect here takes a rectangular part from the pattern from (bg_dx,0) location of pattern of size canvas width and height.

        bgCtx.translate(-TRANSLATE_SPEED, 0); //here canvas is gradually moving left on x-axis due to the negative translate
        bg_dx += TRANSLATE_SPEED; //bg_dx is added equal to the translate speed because the x origin or the zero point of x axis has moved left by translate speed
        //in simple words the the x origin has moved left of the screen due to negative translate which is not inside the canvas hence not visible anymore
        //therefore we add the translate speed to bg_dx to draw the pattern from the point where the canvas screen starts or the point from where the canvas becomes visible


        /* GAME */
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



        managePipes();
        ctx.drawImage(sprite, GROUND_X, GROUND_Y, GROUND_WIDTH, GROUND_HEIGHT, groundCanvasX, groundCanvasY, groundCanvasWidth, groundCanvasHeight);
        ctx.drawImage(sprite, RED_BIRD[birdFrameCnt].x, RED_BIRD[birdFrameCnt].y, BIRD_WIDTH, BIRD_HEIGHT, birdX, birdY, BIRD_WIDTH * SPRITE_SCALE, BIRD_HEIGHT * SPRITE_SCALE);
        // pipe_dx -= 2;
        birdY += 1;
        birdY = Math.min(canvas.height - groundClearance - BIRD_HEIGHT * SPRITE_SCALE, birdY);
        requestAnimationFrame(draw);
    }

    canvas.onclick = () => {
        birdY -= 50;
    }


    draw();
}

