const canvas = document.getElementById('canvas'); //main canvas where the actions will take place
const backgroundCanvas = document.getElementById('background-canvas'); //another canvas because this canvas will be translating with time

const TRANSLATE_SPEED = 1;
/*Sprite Constants and Dimensions*/
const SPRITE_SRC = "./assets/flappy-sprite.png";
const SPRITE_SCALE = 3;

/* background */
const BG_DAY_X = 0;
const BG_DAY_Y = 0;
const BG_WIDTH = 142;
const BG_HEIGHT = 256;

/* pipes */
const GREEN_PIPE_X = 84;
const GREEN_PIPE_Y = 323;
const GREEN_PIPE_WIDTH = 26;
const GREEN_PIPE_HEIGHT = 160;

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
    let dx = 0; //used for translating the background on x axis

    function draw() {

        /* Background */
        bgCtx.clearRect(0, 0, backgroundCanvas.width, backgroundCanvas.height);
        pattern_ctx.clearRect(0, 0, bgPatternCanvas.width, bgPatternCanvas.height);
        pattern_ctx.drawImage(sprite, BG_DAY_X, BG_DAY_Y, BG_WIDTH, BG_HEIGHT, 0, 0, bgPatternCanvas.width, bgPatternCanvas.height);
        bgCtx.fillStyle = bgCtx.createPattern(bgPatternCanvas, "repeat");;
        bgCtx.fillRect(dx, 0, backgroundCanvas.width, backgroundCanvas.height);
        bgCtx.translate(-TRANSLATE_SPEED, 0); //here canvas is gradually moving left on x-axis due to the negative translate
        dx += TRANSLATE_SPEED; //dx is added equal to the translate speed because the x origin or the zero point of x axis has moved left by translate speed
        //in simple words the the x origin has moved left of the screen due to negative translate which is not inside the canvas hence not visible anymore
        //therefore we add the translate speed to dx to draw the pattern from the point where the canvas screen starts or the point from where the canvas becomes visible

        /* Game */
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(sprite, GREEN_PIPE_X, GREEN_PIPE_Y, GREEN_PIPE_WIDTH, GREEN_PIPE_HEIGHT, 0, 400, GREEN_PIPE_WIDTH * SPRITE_SCALE, GREEN_PIPE_HEIGHT * SPRITE_SCALE);
        ctx.drawImage(sprite, RED_BIRD[birdFrameCnt].x, RED_BIRD[birdFrameCnt].y, BIRD_WIDTH, BIRD_HEIGHT, 100, 200, BIRD_WIDTH * SPRITE_SCALE, BIRD_HEIGHT * SPRITE_SCALE);


        requestAnimationFrame(draw);
    }
    draw();
}

