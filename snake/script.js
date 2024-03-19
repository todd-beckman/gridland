const BLOCK_SIZE = 19;
const BLOCK_PADDING = 0;
const GRID_SIZE = 30;
const STARTING_LENGTH = 10;
const LENGTH_INCREMEMENT_PER_APPLE = 2;
const SPEED_PER_SECOND = 10;

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

    init() {
        window.addEventListener("keyup", this.keyHandler.bind(this), true);
        window.addEventListener("keydown", this.keyHandler.bind(this), true);
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

const DIRECTION = {
    UP: { x: 0, y: -1 },
    DOWN: { x: 0, y: 1 },
    LEFT: { x: -1, y: 0 },
    RIGHT: { x: 1, y: 0 },
}

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
        this.length = STARTING_LENGTH;
        this.direction = DIRECTION.DOWN;
        this.lastMoveTime = Date.now();

        this.grid = [];
        for (let x = 0; x < GRID_SIZE; x++) {
            this.grid[x] = [];
            for (let y = 0; y < GRID_SIZE; y++) {
                this.grid[x][y] = 0;
            }
        }

        this.playerLocation = { x: Math.floor(GRID_SIZE) / 2, y: Math.floor(GRID_SIZE) / 2 };
        this.setValue(this.playerLocation, this.length);
        this.apple = {};
        this.placeApple();
    }

    placeApple() {
        do {
            this.apple = {
                x: Math.floor(Math.random() * GRID_SIZE),
                y: Math.floor(Math.random() * GRID_SIZE),
            };
        } while (!this.availableLocation(this.apple));
        this.setValue(this.apple, -1);
    }

    setValue(loc, value) {
        this.grid[loc.x][loc.y] = value;
    }

    availableLocation(loc) {
        return loc.x >= 0 &&
            loc.y >= 0 &&
            loc.x < GRID_SIZE &&
            loc.y < GRID_SIZE &&
            this.grid[loc.x][loc.y] <= 0;
    }



    drawBlock(x, y) {
        let color = this.colorAt(x, y);
        this.canvasContext.fillStyle = color;
        this.canvasContext.fillRect(
            x * (BLOCK_SIZE + BLOCK_PADDING),
            y * (BLOCK_SIZE + BLOCK_PADDING),
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
        this.canvasContext.clearRect(0, 0, canvas.width, canvas.height);

        for (let x = 0; x < GRID_SIZE; x++) {
            for (let y = 0; y < GRID_SIZE; y++) {
                this.drawBlock(x, y);
            }
        }
    }

    setDirection() {
        if (Input.held(Input.UP) == 1) {
            this.direction = DIRECTION.UP;
            return;
        }
        if (Input.held(Input.DOWN) == 1) {
            this.direction = DIRECTION.DOWN;
            return;
        }
        if (Input.held(Input.LEFT) == 1) {
            this.direction = DIRECTION.LEFT;
            return;
        }
        if (Input.held(Input.RIGHT) == 1) {
            this.direction = DIRECTION.RIGHT;
            return;
        }
    }

    stepGame() {
        this.setDirection();
        if (this.lastFrameTime - this.lastMoveTime < 1000 / SPEED_PER_SECOND) {
            return;
        }
        this.lastMoveTime = this.lastFrameTime;

        let nextLocation = {
            x: this.playerLocation.x + this.direction.x,
            y: this.playerLocation.y + this.direction.y,
        };
        if (!this.availableLocation(nextLocation)) {
            this.mode = MODE.GAME_OVER;
            return;
        }

        if (this.grid[nextLocation.x][nextLocation.y] == -1) {
            this.length += LENGTH_INCREMEMENT_PER_APPLE;
            this.placeApple();
        }

        this.playerLocation = nextLocation;
        this.setValue(this.playerLocation, this.length);

        for (let x = 0; x < GRID_SIZE; x++) {
            for (let y = 0; y < GRID_SIZE; y++) {
                let value = this.grid[x][y];
                if (value > 0) {
                    this.grid[x][y] = value - 1;
                }
            }
        }
    }

    step() {
        let now = Date.now();
        this.timeSinceLastFrame = now - this.lastFrameTime;
        this.lastFrameTime = now;

        if (this.mode === MODE.PLAY) {
            this.stepGame();
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
