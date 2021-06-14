const canvas = document.getElementById('canvas');
const backgroundCanvas = document.getElementById('background-canvas');

/*Sprite Constants*/
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

    sprite.onload = () => {
        ctx.drawImage(sprite, GREEN_PIPE_X, GREEN_PIPE_Y, GREEN_PIPE_WIDTH, GREEN_PIPE_HEIGHT, 0, 0, GREEN_PIPE_WIDTH, GREEN_PIPE_HEIGHT);
    }

    let birdFrameCnt = 0;

    function birdAnimationHelper() {
        setInterval(() => {
            birdFrameCnt++;
        }, 90);
    }

    function getBackgroundPattern() {
        const pattern_canvas = document.createElement('canvas');
        pattern_canvas.height = backgroundCanvas.height;
        pattern_canvas.width = Math.ceil(backgroundCanvas.height * BG_WIDTH / BG_HEIGHT);

        const pattern_ctx = pattern_canvas.getContext("2d");
        pattern_ctx.drawImage(sprite, BG_DAY_X, BG_DAY_Y, BG_WIDTH, BG_HEIGHT, 0, 0, pattern_canvas.width, pattern_canvas.height);
        return bgCtx.createPattern(pattern_canvas, "repeat");
    }

    birdAnimationHelper();
    let dx = 0;
    function draw() {

        /* Background */ 
        bgCtx.clearRect(0, 0, backgroundCanvas.width, backgroundCanvas.height);
        bgCtx.fillStyle = getBackgroundPattern();
        bgCtx.fillRect(dx, 0, backgroundCanvas.width, backgroundCanvas.height);
        bgCtx.translate(-1, 0);
        dx += 1;

        /* Game */
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(sprite, GREEN_PIPE_X, GREEN_PIPE_Y, GREEN_PIPE_WIDTH, GREEN_PIPE_HEIGHT, 0, 400, GREEN_PIPE_WIDTH*SPRITE_SCALE, GREEN_PIPE_HEIGHT*SPRITE_SCALE);
        birdFrameCnt = birdFrameCnt % BIRD_FRAMES;
        ctx.drawImage(sprite, RED_BIRD[birdFrameCnt].x, RED_BIRD[birdFrameCnt].y, BIRD_WIDTH, BIRD_HEIGHT, 100, 200, BIRD_WIDTH*SPRITE_SCALE, BIRD_HEIGHT*SPRITE_SCALE);
        
        
        requestAnimationFrame(draw);
    }
    draw();
}

