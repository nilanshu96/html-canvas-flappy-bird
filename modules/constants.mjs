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

export const READY_TEXT_X = 295;
export const READY_TEXT_Y = 59;
export const READY_TEXT_WIDTH = 92;
export const READY_TEXT_HEIGHT = 25;

export const GAME_OVER_X = 395;
export const GAME_OVER_Y = 59;
export const GAME_OVER_WIDTH = 96;
export const GAME_OVER_HEIGHT = 21;

/* Play Button */
export const PLAY_BUTTON_X = 354;
export const PLAY_BUTTON_Y = 118;
export const PLAY_BUTTON_WIDTH = 52;
export const PLAY_BUTTON_HEIGHT = 29;

/* Jump Instruction Image */
export const JUMP_INSTRUCTION_X = 292;
export const JUMP_INSTRUCTION_Y = 91;
export const JUMP_INSTRUCTION_WIDTH = 57;
export const JUMP_INSTRUCTION_HEIGHT = 49;

