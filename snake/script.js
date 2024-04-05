const BLOCK_SIZE = 20;
const GRID_SIZE = 30;
const STARTING_LENGTH = 10;
const LENGTH_INCREMEMENT_PER_APPLE = 2;
const SCORE_TOP = 20;
const SCORE_LEFT = GRID_SIZE * BLOCK_SIZE + 10;
const PLAYER_MOVE_EVERY_MS = 100;
const ROW_SIZE = 20;

const Global = Object.freeze({
    PLAY_AREA_WIDTH: 600,
    PLAY_AREA_HEIGHT: 600,
    SCREEN_WIDTH: 800,
});

class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    add(other) {
        return new Vector(this.x + other.x, this.y + other.y);
    }

    static UP = new Vector(0, -1);
    static DOWN = new Vector(0, 1);
    static LEFT = new Vector(-1, 0);
    static RIGHT = new Vector(1, 0);
}

class WithCooldown {
    constructor(cooldownMs) {
        this.cooldownMs = 0;
        this.setCooldown = cooldownMs;
    }

    getAndTrigger() {
        if (this.cooldowmMs > 0) {
            return false;
        }
        this.cooldowmMs = this.setCooldown;
        return true;
    }

    step(msSinceLastFrame) {
        this.cooldowmMs = Math.max(0, this.cooldowmMs - msSinceLastFrame);
    }
}

function V(x, y) {
    return new Vector(x, y);
}

const Input = {
    LEFT: 0,
    RIGHT: 1,
    UP: 2,
    DOWN: 3,
    inputs: [0, 0, 0, 0],

    keyHandler(e) {
        if (e.defaultPrevented || e.repeat) {
            return;
        }

        let value = e.type == "keydown" ? 1 : 0;

        switch (e.code) {
            case "ArrowUp":
            case "KeyW":
                this.inputs[Input.UP] = value;
                break;
            case "ArrowLeft":
            case "KeyA":
                this.inputs[Input.LEFT] = value;
                break;
            case "ArrowRight":
            case "KeyD":
                this.inputs[Input.RIGHT] = value;
                break;
            case "ArrowDown":
            case "KeyS":
                this.inputs[Input.DOWN] = value;
                break;
            default:
                return;
        }

        if (e.code !== "Tab") {
            e.preventDefault();
        }
    },

    checkDirection() {
        this.inputs[Input.LEFT] = 0;
        this.inputs[Input.RIGHT] = 0;
        this.inputs[Input.UP] = 0;
        this.inputs[Input.DOWN] = 0;

        let xdiff = touchendX - touchstartX;
        let ydiff = touchendY - touchstartY;

        // Determine which direction had the higher magnitude to tiebreak horizonal vs vertical
        let xmag = xdiff < 0 ? -xdiff : xdiff;
        let ymag = ydiff < 0 ? -ydiff : ydiff;

        if (xmag > ymag) {
            if (xdiff < 0) {
                this.inputs[Input.LEFT] = 1;
            } else {
                this.inputs[Input.RIGHT] = 1;
            }
        } else {
            if (ydiff < 0) {
                this.inputs[Input.UP] = 1;
            } else {
                this.inputs[Input.DOWN] = 1;
            }
        }
    },

    init() {
        window.addEventListener("keyup", this.keyHandler.bind(this), true);
        window.addEventListener("keydown", this.keyHandler.bind(this), true);

        document.addEventListener('touchstart', (e => {
            touchstartX = e.changedTouches[0].screenX;
            touchstartY = e.changedTouches[0].screenY;
        }).bind(this), true)

        document.addEventListener('touchend', (e => {
            touchendX = e.changedTouches[0].screenX;
            touchendY = e.changedTouches[0].screenY;
            this.checkDirection();
        }).bind(this), true);
    },

    held(input) {
        return this.inputs[input];
    },

    onFrameEnd() {
        for (let i = 0; i < this.inputs.length; i++) {
            if (this.inputs[i]) {
                this.inputs[i]++;
            }
        }
    },
};

const MODE = {
    PLAY: "PLAY",
    GAME_OVER: "GAME OVER",
};

const COLOR = {
    EMPTY: "black",
    SNAKE: "white",
    APPLE: "red",
};

class State {
    constructor() {
        Input.init();
        this.mode = MODE.PLAY;
        let canvas = document.getElementById("canvas");
        this.canvasContext = canvas.getContext("2d");
        this.playerMovesEvery = new WithCooldown(PLAYER_MOVE_EVERY_MS);
        this.highScore = 0;

        if (window.innerWidth < Global.SCREEN_WIDTH ||
            window.innerHeight < Global.PLAY_AREA_HEIGHT) {
            let scaleWidth = window.innerWidth / Global.SCREEN_WIDTH;
            let scaleHeight = window.innerHeight / Global.PLAY_AREA_HEIGHT;
            let scale = Math.min(scaleHeight, scaleWidth);

            canvas.width *= scale;
            canvas.height *= scale;
            this.canvasContext.scale(scale, scale);
        }

        this.restartGame()
    }

    restartGame() {
        this.length = STARTING_LENGTH;
        this.direction = Vector.DOWN;
        this.lastMoveDirection = this.direction;
        this.score = 0;


        this.grid = [];
        for (let x = 0; x < GRID_SIZE; x++) {
            this.grid[x] = [];
            for (let y = 0; y < GRID_SIZE; y++) {
                this.grid[x][y] = 0;
            }
        }

        this.playerLocation = V(Math.floor(GRID_SIZE) / 2, Math.floor(GRID_SIZE) / 2);
        this.grid[this.playerLocation.x][this.playerLocation.y] = this.length;
        this.apple = V();
        this.placeApple();
    }

    placeApple() {
        do {
            this.apple = V(Math.floor(Math.random() * GRID_SIZE), Math.floor(Math.random() * GRID_SIZE));
        } while (!this.availableLocation(this.apple));
        this.grid[this.apple.x][this.apple.y] = -1;
    }

    availableLocation(v) {
        return v.x >= 0 &&
            v.y >= 0 &&
            v.x < GRID_SIZE &&
            v.y < GRID_SIZE &&
            this.grid[v.x][v.y] <= 0;
    }

    drawBlock(x, y) {
        let color = this.colorAt(x, y);
        this.canvasContext.fillStyle = color;
        this.canvasContext.fillRect(
            x * BLOCK_SIZE,
            y * BLOCK_SIZE,
            BLOCK_SIZE,
            BLOCK_SIZE,
        );
    }

    colorAt(x, y) {
        switch (this.grid[x][y]) {
            case 0: return COLOR.EMPTY;
            case -1: return COLOR.APPLE;
            default: return COLOR.SNAKE;
        }
    }

    draw() {
        this.canvasContext.clearRect(0, 0, Global.SCREEN_WIDTH, Global.PLAY_AREA_HEIGHT);

        this.canvasContext.fillStyle = "rgb(80,80,80)"
        this.canvasContext.fillRect(0, 0, Global.SCREEN_WIDTH, Global.PLAY_AREA_HEIGHT);
        this.canvasContext.fillStyle = "black";
        this.canvasContext.fillRect(0, 0, Global.PLAY_AREA_WIDTH, Global.PLAY_AREA_HEIGHT);

        for (let x = 0; x < GRID_SIZE; x++) {
            for (let y = 0; y < GRID_SIZE; y++) {
                if (this.grid[x][y] != 0) {
                    this.drawBlock(x, y);
                }
            }
        }

        let row = 0;
        this.canvasContext.fillStyle = "white";
        this.canvasContext.font = "14pt courier";
        this.canvasContext.fillText("Score:      " + this.score, SCORE_LEFT, SCORE_TOP + row);
        row += ROW_SIZE;
        this.canvasContext.fillText("High Score: " + this.highScore, SCORE_LEFT, SCORE_TOP + row);

        row += ROW_SIZE;
        if (this.mode === MODE.GAME_OVER) {
            this.canvasContext.fillText("GAME OVER", SCORE_LEFT, SCORE_TOP + row);
            row += ROW_SIZE;
            this.canvasContext.fillText("Move to restart", SCORE_LEFT, SCORE_TOP + row);
        }
    }

    setDirection() {
        if (Input.held(Input.UP) == 1 && this.lastMoveDirection != Vector.DOWN) {
            this.direction = Vector.UP;
            return;
        }
        if (Input.held(Input.DOWN) == 1 && this.lastMoveDirection != Vector.UP) {
            this.direction = Vector.DOWN;
            return;
        }
        if (Input.held(Input.LEFT) == 1 && this.lastMoveDirection != Vector.RIGHT) {
            this.direction = Vector.LEFT;
            return;
        }
        if (Input.held(Input.RIGHT) == 1 && this.lastMoveDirection != Vector.LEFT) {
            this.direction = Vector.RIGHT;
            return;
        }
    }

    stepGame() {
        this.setDirection();
        this.playerMovesEvery.step(this.msSinceLastFrame);
        if (this.playerMovesEvery.getAndTrigger()) {
            let nextLocation = V(
                this.playerLocation.x + this.direction.x,
                this.playerLocation.y + this.direction.y);
            if (!this.availableLocation(nextLocation)) {
                this.mode = MODE.GAME_OVER;
                return;
            }
            this.lastMoveDirection = this.direction

            if (this.grid[nextLocation.x][nextLocation.y] == -1) {
                this.length += LENGTH_INCREMEMENT_PER_APPLE;
                this.score++;
                if (this.score > this.highScore) {
                    this.highScore = this.score;
                }
                this.placeApple();
            }

            this.playerLocation = nextLocation;
            this.grid[this.playerLocation.x][this.playerLocation.y] = this.length;

            for (let x = 0; x < GRID_SIZE; x++) {
                for (let y = 0; y < GRID_SIZE; y++) {
                    let value = this.grid[x][y];
                    if (value > 0) {
                        this.grid[x][y] = value - 1;
                    }
                }
            }
        }
    }

    stepGameOver() {
        if (Input.inputs[Input.LEFT] == 1 ||
            Input.inputs[Input.RIGHT] == 1 ||
            Input.inputs[Input.UP] == 1 ||
            Input.inputs[Input.DOWN] == 1) {
            this.restartGame();
            this.setDirection();
            this.mode = MODE.PLAY
        }
    }

    step(msSinceLoad) {
        let oldFrameTime = this.frameTime;
        this.frameTime = msSinceLoad;
        this.msSinceLastFrame = this.frameTime - oldFrameTime;

        if (this.mode === MODE.PLAY) {
            this.stepGame();
        } else if (this.mode === MODE.GAME_OVER) {
            this.stepGameOver();
        }

        Input.onFrameEnd();
        this.draw();
        window.requestAnimationFrame(this.step.bind(this));
    }
};

let state;

function init() {
    state = new State();
    Input.init();

    window.requestAnimationFrame(state.step.bind(state));
}
