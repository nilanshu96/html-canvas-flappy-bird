export const HIT_BOX_MARGIN = 15; //used to decrease the enemy hit box for better gameplay

//Game States
export const START = "start";
export const READY = "ready";
export const GAME = "game";
export const FINISH = "finish";

// Following are the constants that locate a particular image in the sprite sheet using coordinates
/* Sprite constants */
export const SPRITE_SRC = "./assets/flappy-sprite.png";
export const SPRITE_SCALE = 3;

/* background */
export const BG_DAY_X = 0;
export const BG_DAY_Y = 0;
export const BG_WIDTH = 142;
export const BG_HEIGHT = 256;

/* Ground */
export const GROUND_X = 292;
export const GROUND_Y = 0;
export const GROUND_WIDTH = 168;
export const GROUND_HEIGHT = 56;

/* pipes */
export const PIPE_GAP = 110;

export const PIPE_WIDTH = 26;
export const PIPE_HEIGHT = 160;

export const GREEN_PIPE_UP_X = 56;
export const GREEN_PIPE_UP_Y = 323;

export const GREEN_PIPE_DOWN_X = 84;
export const GREEN_PIPE_DOWN_Y = 323;

/* birds */
export const BIRD_FRAMES = 3;
export const BIRD_WIDTH = 17;
export const BIRD_HEIGHT = 12;

/* Red Bird */
export const RED_BIRD = [
    { x: 115, y: 381 },
    { x: 115, y: 407 },
    { x: 115, y: 433 }
];

/* Text */
export const TITLE_TEXT_X = 351;
export const TITLE_TEXT_Y = 91;
export const TITLE_TEXT_WIDTH = 89;
export const TITLE_TEXT_HEIGHT = 24;

/* Play Button */
export const PLAY_BUTTON_X = 354;
export const PLAY_BUTTON_Y = 118;
export const PLAY_BUTTON_WIDTH = 52;
export const PLAY_BUTTON_HEIGHT = 29;

