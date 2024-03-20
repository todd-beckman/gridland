const BLOCK_SIZE = 19;
const BLOCK_PADDING = 0;
const GRID_SIZE = 30;
const STARTING_LENGTH = 10;
const LENGTH_INCREMEMENT_PER_APPLE = 2;
const SPEED_PER_SECOND = 10;
const SCORE_TOP = 20;
const SCORE_LEFT = GRID_SIZE * (BLOCK_SIZE + BLOCK_PADDING) + 20;

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
        this.direction = Vector.DOWN;
        this.lastMoveTime = Date.now();
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

        this.canvasContext.fillStyle = "black";
        this.canvasContext.font = "16px courier";
        this.canvasContext.fillText("Score: " + this.score, SCORE_LEFT, SCORE_TOP);
    }

    setDirection() {
        if (Input.held(Input.UP) == 1) {
            this.direction = Vector.UP;
            return;
        }
        if (Input.held(Input.DOWN) == 1) {
            this.direction = Vector.DOWN;
            return;
        }
        if (Input.held(Input.LEFT) == 1) {
            this.direction = Vector.LEFT;
            return;
        }
        if (Input.held(Input.RIGHT) == 1) {
            this.direction = Vector.RIGHT;
            return;
        }
    }

    stepGame() {
        this.setDirection();
        if (this.lastFrameTime - this.lastMoveTime < 1000 / SPEED_PER_SECOND) {
            return;
        }
        this.lastMoveTime = this.lastFrameTime;

        let nextLocation = V(
            this.playerLocation.x + this.direction.x,
            this.playerLocation.y + this.direction.y);
        if (!this.availableLocation(nextLocation)) {
            this.mode = MODE.GAME_OVER;
            return;
        }

        if (this.grid[nextLocation.x][nextLocation.y] == -1) {
            this.length += LENGTH_INCREMEMENT_PER_APPLE;
            this.score++;
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
