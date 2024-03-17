const HORIZONTAL_DELAY_FRAMES = 8;

const LINE_CLEAR_DELAY = 500;
const LOCK_DELAY = 500;
const SHOW_NEXT_PIECES = 6;
const GHOST_COLOR = "rgb(128,128,128)";

const BLOCK_SIZE = 30;

const HOLD_TOP = 5;
const HOLD_LEFT = 10;
const HOLD_SIZE = 4 * BLOCK_SIZE;

const GRID_TOP = 5;
const GRID_LEFT = HOLD_LEFT + HOLD_SIZE + 10;

const PREVIEW_TOP = 5;
const PREVIEW_LEFT = GRID_LEFT + 10 * BLOCK_SIZE + 10;

const GRAVITY = {
    SOFT_DROP: 1000 / 30 * 2,
    SPEEDS: [
        1000.00, 793.00, 617.80, 472.73, 355.20,
        262.00, 189.68, 134.73, 93.88, 64.15,
        42.98, 28.22, 18.15, 11.44, 7.06,
    ],
    speed(lines) {
        return this.SPEEDS[Math.min(lines / 10, 15)];
    }
};

const SPRITES = {
    CYAN() {
        return document.getElementById("cyan");
    },
    YELLOW() {
        return document.getElementById("yellow");
    },
    PURPLE() {
        return document.getElementById("purple");
    },
    GREEN() {
        return document.getElementById("green");
    },
    RED() {
        return document.getElementById("red");
    },
    BLUE() {
        return document.getElementById("blue");
    },
    ORANGE() {
        return document.getElementById("orange");
    },
    GHOST() {
        return document.getElementById("ghost");
    }
};

class Cell {
    constructor(row, col) {
        this.row = row;
        this.col = col;
    }

    offsetBy(row, col) {
        return new Cell(this.row + row, this.col + col);
    }

    static fromPair(pair) {
        return new Cell(pair[0], pair[1]);
    }

    static fromPairs(pairs) {
        return pairs.map(Cell.fromPair);
    }
}

const TETRIMINO = Object.freeze({
    EMPTY: {},
    I: {
        sprite: SPRITES.CYAN,
        startingRow: 18,
        rotations: [
            Cell.fromPairs([[2, 0], [2, 1], [2, 2], [2, 3]]),
            Cell.fromPairs([[0, 2], [1, 2], [2, 2], [3, 2]]),
            Cell.fromPairs([[1, 0], [1, 1], [1, 2], [1, 3]]),
            Cell.fromPairs([[0, 1], [1, 1], [2, 1], [3, 1]]),
        ],
    },
    O: {
        sprite: SPRITES.YELLOW,
        startingRow: 19,
        rotations: [
            Cell.fromPairs([[1, 1], [1, 2], [2, 1], [2, 2]]),
            Cell.fromPairs([[1, 1], [1, 2], [2, 1], [2, 2]]),
            Cell.fromPairs([[1, 1], [1, 2], [2, 1], [2, 2]]),
            Cell.fromPairs([[1, 1], [1, 2], [2, 1], [2, 2]]),
        ],
    },
    J: {
        sprite: SPRITES.BLUE,
        startingRow: 19,
        rotations: [
            Cell.fromPairs([[1, 0], [1, 1], [1, 2], [2, 0]]),
            Cell.fromPairs([[0, 1], [1, 1], [2, 1], [2, 2]]),
            Cell.fromPairs([[1, 0], [1, 1], [1, 2], [0, 2]]),
            Cell.fromPairs([[0, 1], [1, 1], [2, 1], [0, 0]]),
        ],
    },
    T: {
        sprite: SPRITES.PURPLE,
        startingRow: 19,
        rotations: [
            Cell.fromPairs([[1, 0], [1, 1], [1, 2], [2, 1]]),
            Cell.fromPairs([[0, 1], [1, 1], [2, 1], [1, 2]]),
            Cell.fromPairs([[1, 0], [1, 1], [1, 2], [0, 1]]),
            Cell.fromPairs([[0, 1], [1, 1], [2, 1], [1, 0]]),
        ],
    },
    L: {
        sprite: SPRITES.ORANGE,
        startingRow: 19,
        rotations: [
            Cell.fromPairs([[1, 0], [1, 1], [1, 2], [2, 2]]),
            Cell.fromPairs([[0, 1], [1, 1], [2, 1], [0, 2]]),
            Cell.fromPairs([[1, 0], [1, 1], [1, 2], [0, 0]]),
            Cell.fromPairs([[0, 1], [1, 1], [2, 1], [2, 0]]),
        ],
    },
    S: {
        sprite: SPRITES.GREEN,
        startingRow: 19,
        rotations: [
            Cell.fromPairs([[1, 0], [1, 1], [2, 1], [2, 2]]),
            Cell.fromPairs([[2, 1], [1, 1], [1, 2], [0, 2]]),
            Cell.fromPairs([[0, 0], [0, 1], [1, 1], [1, 2]]),
            Cell.fromPairs([[2, 0], [1, 0], [1, 1], [0, 1]]),
        ],
    },
    Z: {
        sprite: SPRITES.RED,
        startingRow: 19,
        rotations: [
            Cell.fromPairs([[2, 0], [2, 1], [1, 1], [1, 2]]),
            Cell.fromPairs([[2, 2], [1, 2], [1, 1], [0, 1]]),
            Cell.fromPairs([[1, 0], [1, 1], [0, 1], [0, 2]]),
            Cell.fromPairs([[2, 2], [1, 2], [1, 1], [0, 1]]),
        ],
    },
});

const KICK = {
    kick(tetrimino, oldRotation, clockwise) {
        let kickData = (tetrimino == TETRIMINO.I) ? this.KICK_I : this.KICK_STANDARD;
        switch (oldRotation) {
            case 0:
                return clockwise ? kickData[0] : kickData[7];
            case 1:
                return clockwise ? kickData[2] : kickData[1];
            case 2:
                return clockwise ? kickData[4] : kickData[3];
            case 3:
                return clockwise ? kickData[6] : kickData[5];
            default:
                // should not happen
                return []
        }
    },

    // Does not have standard rotation, which is always [0, 0].
    KICK_STANDARD: [
        // 0 >> 1
        Cell.fromPairs([[-1, 0], [-1, 1], [0, -2], [-1, -2]]),
        // 1 >> 0
        Cell.fromPairs([[1, 0], [1, -1], [0, 2], [1, 2]]),
        // 1 >> 2
        Cell.fromPairs([[1, 0], [1, -1], [0, 2], [1, 2]]),
        // 2 >> 1
        Cell.fromPairs([[-1, 0], [-1, 1], [0, -2], [-1, -2]]),
        // 2 >> 3
        Cell.fromPairs([[1, 0], [1, 1], [0, -2], [1, -2]]),
        // 3 >> 2
        Cell.fromPairs([[-1, 0], [-1, -1], [0, 2], [-1, 2]]),
        // 3 >> 0
        Cell.fromPairs([[-1, 0], [-1, -1], [0, 2], [-1, 2]]),
        // 0 >> 3
        Cell.fromPairs([[1, 0], [1, 1], [0, -2], [1, -2]]),
    ],
    KICK_I: [
        // 0 >> 1
        Cell.fromPairs([[-2, 0], [1, 0], [-2, -1], [1, 2]]),
        // 1 >> 0
        Cell.fromPairs([[2, 0], [-1, 0], [2, 1], [-1, -2]]),
        // 1 >> 2
        Cell.fromPairs([[-1, 0], [2, 0], [-1, 2], [2, -1]]),
        // 2 >> 1
        Cell.fromPairs([[1, 0], [-2, 0], [1, -2], [-2, 1]]),
        // 2 >> 3
        Cell.fromPairs([[2, 0], [-1, 0], [2, 1], [-1, -2]]),
        // 3 >> 2
        Cell.fromPairs([[-2, 0], [1, 0], [-2, -1], [1, 2]]),
        // 3 >> 0
        Cell.fromPairs([[1, 0], [-2, 0], [1, -2], [-2, 1]]),
        // 0 >> 3
        Cell.fromPairs([[-1, 0], [2, 0], [-1, 2], [2, -1]]),
    ],
};

const TetriminoBag = {
    queue: [],
    previewRef: null,

    fill() {
        let newBatch = [
            TETRIMINO.I,
            TETRIMINO.O,
            TETRIMINO.J,
            TETRIMINO.T,
            TETRIMINO.L,
            TETRIMINO.S,
            TETRIMINO.Z,
        ];
        for (let i = 6; i >= 0; i--) {
            let swapIndex = Math.floor(Math.random() * 7);
            let temp = newBatch[i];
            newBatch[i] = newBatch[swapIndex];
            newBatch[swapIndex] = temp;
        }
        this.queue.push.apply(this.queue, newBatch);
        return this.queue;
    },

    peek() {
        if (this.queue.length <= SHOW_NEXT_PIECES) {
            this.fill();
        }
        return this.queue.slice(0, SHOW_NEXT_PIECES);
    },

    pop() {
        if (this.queue.length <= SHOW_NEXT_PIECES) {
            this.fill();
        }
        return this.queue.shift();
    },
};

class Block {
    constructor(tetrimino, currentRotation, frameLocation) {
        this.tetrimino = tetrimino;
        this.currentRotation = currentRotation;
        this.frameLocation = frameLocation;
    }

    offsetBy(row, col) {
        return new Block(this.tetrimino, this.currentRotation, this.frameLocation.offsetBy(row, col));
    }

    get ghost() {
        let candidate = this;
        let nextCandidate = this;
        do {
            candidate = nextCandidate;
            nextCandidate = candidate.offsetBy(-1, 0);
        }
        while (State.allAvailable(nextCandidate.cellLocations));
        return candidate;
    }

    get rotatedCW() {
        return new Block(this.tetrimino, (this.currentRotation + 1) % 4, this.frameLocation);
    }

    get rotatedCCW() {
        return new Block(this.tetrimino, (this.currentRotation + 3) % 4, this.frameLocation);
    }

    get cellLocations() {
        return this.tetrimino.rotations[this.currentRotation].map(cell => this.frameLocation.offsetBy(cell.row, cell.col));
    }
};

const Input = {
    LEFT: 0,
    RIGHT: 1,
    ROTATE_CW: 2,
    ROTATE_CCW: 3,
    SOFT_DROP: 4,
    HARD_DROP: 5,
    HOLD: 6,
    PAUSE: 7,
    // The frame number that a given number has been held.
    inputs: [0, 0, 0, 0, 0, 0, 0, 0, 0],

    keyHandler(e) {
        if (e.defaultPrevented || e.repeat) {
            return;
        }

        let value = e.type == "keydown" ? 1 : 0;

        switch (e.code) {
            case "ArrowUp":
            case "KeyX":
                this.inputs[Input.ROTATE_CW] = value;
                break;
            case "Space":
                this.inputs[Input.HARD_DROP] = value;
                break;
            case "ShiftLeft":
            case "ShiftRight":
            case "KeyC":
                this.inputs[Input.HOLD] = value;
                break;
            case "ControlLeft":
            case "ControlRight":
            case "KeyZ":
                this.inputs[Input.ROTATE_CCW] = value;
                break;
            case "Escape":
            case "F1":
                this.inputs[Input.PAUSE] = value;
                break;
            case "ArrowLeft":
                this.inputs[Input.LEFT] = value;
                break;
            case "ArrowRight":
                this.inputs[Input.RIGHT] = value;
                break;
            case "ArrowDown":
                this.inputs[Input.SOFT_DROP] = value;
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

    justPressed(input) {
        return this.inputs[input] === 1;
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
    PAUSE: "PAUSE",
};

const BEHAVIOR = {
    FALLING: "FALLING",
    LOCKING: "LOCKING",
    CLEARING: "CLEARING",
};

class state {
    constructor() {
        this.activeBlock = new Block(TETRIMINO.EMPTY, 0, new Cell(0, 0));
        this.holdBlock = new Block(TETRIMINO.EMPTY, 0, new Cell(0, 0));
        this.heldBlock = false;

        this.mode = MODE.PLAY;
        this.behavior = BEHAVIOR.FALLING;
        this.lines = 0;
        this.score = 0;
        this.fallSpeed = GRAVITY.speed(0);
        this.lastFrameTime = Date.now();
        this.timeSinceLastFrame = 0;
        this.timeSinceLastDrop = 0;
        this.timeSinceBeginLocking = 0;
        this.rotationsDuringLock = 0;
        let canvas = document.getElementById("canvas");
        this.canvasContext = canvas.getContext("2d");

        this.grid = [];
        for (let row = 0; row < 40; row++) {
            this.grid[row] = [
                TETRIMINO.EMPTY,
                TETRIMINO.EMPTY,
                TETRIMINO.EMPTY,
                TETRIMINO.EMPTY,
                TETRIMINO.EMPTY,
                TETRIMINO.EMPTY,
                TETRIMINO.EMPTY,
                TETRIMINO.EMPTY,
                TETRIMINO.EMPTY,
                TETRIMINO.EMPTY,
            ];
        }
    }

    allAvailable(cells) {
        return cells.every(cell => {
            if (cell.row < 0 || cell.row > 40) {
                return false;
            }
            if (cell.col < 0 || cell.col > 10) {
                return false;
            }
            return this.grid[cell.row][cell.col] === TETRIMINO.EMPTY;
        });
    }

    spawnTetrimino() {
        this.placeTetrimino(TetriminoBag.pop());
    }

    holdTetrimino() {
        if (this.heldBlock || !Input.justPressed(Input.HOLD)) {
            return;
        }

        let newHoldBlock = new Block(this.activeBlock.tetrimino);
        if (this.holdBlock.tetrimino !== TETRIMINO.EMPTY) {
            this.placeTetrimino(this.holdBlock.tetrimino);
        }
        this.holdBlock = newHoldBlock;
        // set this after place so that it is always false from here but true otherwise
        this.heldBlock = true;

    }

    placeTetrimino(nextTetrimino) {
        this.activeBlock = new Block(nextTetrimino, 0, new Cell(nextTetrimino.startingRow, 3));

        if (!this.allAvailable(this.activeBlock.cellLocations)) {
            this.mode = MODE.GAME_OVER;
            return;
        }

        this.activeBlock = this.activeBlock.offsetBy(-1, 0);
        if (!this.allAvailable(this.activeBlock.cellLocations)) {
            this.mode = MODE.GAME_OVER;
            return;
        }
        this.behavior = BEHAVIOR.FALLING;
        this.rotationsDuringLock = 0;
        this.heldBlock = false;
    }

    lockTetrimino() {
        let affectedRows = new Set();
        this.activeBlock.cellLocations.forEach(cell => {
            affectedRows.add(cell.row);
            this.grid[cell.row][cell.col] = this.activeBlock.tetrimino;
        });

        this.clearLines(Array.from(affectedRows).sort());

        this.activeBlock = new Block(TETRIMINO.EMPTY, 0, null);
        this.spawnTetrimino();
    }

    clearLines(affectedRows) {
        // idk how I got a cleared row that wasn't cleaned up
        // but it is somehow possible. Just check all rows for now.
        // let clearedRows = affectedRows.filter(row => {
        let clearedRows = [...Array(40).keys()].filter(row => {
            for (let col = 0; col < 10; col++) {
                if (this.grid[row][col] === TETRIMINO.EMPTY) {
                    return false;
                }
            }
            return true;
        }).sort();

        // concurrent modification: go from highest to lowest
        for (let i = clearedRows.length - 1; i >= 0; i--) {
            let row = clearedRows[i];
            this.grid.splice(row, 1);

            this.grid.push([
                TETRIMINO.EMPTY,
                TETRIMINO.EMPTY,
                TETRIMINO.EMPTY,
                TETRIMINO.EMPTY,
                TETRIMINO.EMPTY,
                TETRIMINO.EMPTY,
                TETRIMINO.EMPTY,
                TETRIMINO.EMPTY,
                TETRIMINO.EMPTY,
                TETRIMINO.EMPTY,
            ]);
        }
    }

    checkHardDrop() {
        if (!Input.justPressed(Input.HARD_DROP)) {
            return false;
        }
        this.activeBlock = this.activeBlock.ghost;
        this.lockTetrimino();
        return true;
    }

    dropTetrimino() {
        if (this.checkHardDrop()) {
            return;
        }

        this.timeSinceLastDrop += this.timeSinceLastFrame;
        let useSpeed = Input.held(Input.SOFT_DROP) ? GRAVITY.SOFT_DROP : this.fallSpeed;

        if (this.timeSinceLastDrop > useSpeed) {
            this.timeSinceLastDrop = 0;

            // TODO: we can only drop a max of once per frame with this logic
            let candidateBlock = this.activeBlock.offsetBy(-1, 0);
            if (this.allAvailable(candidateBlock.cellLocations)) {
                this.activeBlock = candidateBlock;
            } else {
                this.timeSinceBeginLocking = 0;
                this.rotationsDuringLock = 0;
                this.behavior = BEHAVIOR.LOCKING;
            }
        }
    }

    moveHorizontally() {
        let leftHeld = Input.held(Input.LEFT);
        let rightHeld = Input.held(Input.RIGHT);
        if (leftHeld > 0 && rightHeld > 0) {
            return;
        }

        let horizontalMovement = (leftHeld % HORIZONTAL_DELAY_FRAMES === 1 ? -1 : 0) + (rightHeld % HORIZONTAL_DELAY_FRAMES === 1 ? 1 : 0);
        if (horizontalMovement == 0) {
            return;
        }

        let candidateBlock = this.activeBlock.offsetBy(0, horizontalMovement);
        if (this.allAvailable(candidateBlock.cellLocations)) {
            this.activeBlock = candidateBlock;
        }
    }

    rotate() {
        if (this.rotationsDuringLock >= 15) {
            return;
        }

        let rotateCW = Input.justPressed(Input.ROTATE_CW);
        let rotateCCW = Input.justPressed(Input.ROTATE_CCW);
        if (rotateCW == rotateCCW) {
            return;
        }

        // Standard rotation
        let candidateBlock = rotateCW ? this.activeBlock.rotatedCW : this.activeBlock.rotatedCCW;
        if (this.allAvailable(candidateBlock.cellLocations)) {
            this.activeBlock = candidateBlock;
            this.timeSinceBeginLocking = 0;
            if (this.behavior == BEHAVIOR.LOCKING) {
                this.rotationsDuringLock++;
            }
            return;
        }

        let kicks = KICK.kick(this.activeBlock.tetrimino, this.activeBlock.currentRotation, rotateCW);

        for (let i = 0; i < kicks.length; i++) {
            let kick = kicks[i];
            let kickedCandidate = candidateBlock.offsetBy(kick.row, kick.col);
            if (this.allAvailable(kickedCandidate.cellLocations)) {
                this.activeBlock = kickedCandidate;
                this.timeSinceBeginLocking = 0;
                if (this.behavior == BEHAVIOR.LOCKING) {
                    this.rotationsDuringLock++;
                }
                return;
            }
        }
    }

    stepGame() {
        if (this.activeBlock.tetrimino === TETRIMINO.EMPTY) {
            this.spawnTetrimino();
            return;
        }

        this.holdTetrimino();
        if (this.behavior == BEHAVIOR.FALLING) {
            this.rotate();
            this.moveHorizontally();
            this.dropTetrimino();
        } else if (this.behavior == BEHAVIOR.LOCKING) {
            if (this.checkHardDrop()) {
                this.lockTetrimino();
            }
            this.rotate();

            this.timeSinceBeginLocking += this.timeSinceLastFrame;
            if (this.timeSinceBeginLocking > LOCK_DELAY) {
                this.lockTetrimino();
            }
        }
    }

    drawBlock(sprite, top, left, row, col) {
        let x = left + col * BLOCK_SIZE;
        let y = top + (19 - row) * BLOCK_SIZE;
        this.canvasContext.drawImage(sprite(), x, y)
    }

    draw() {
        this.canvasContext.clearRect(0, 0, canvas.width, canvas.height);

        let activeLocations = this.activeBlock.cellLocations;
        let ghostLocations = (this.activeBlock.tetrimino === TETRIMINO.EMPTY) ? [] : this.activeBlock.ghost.cellLocations;


        // Draw hold
        this.canvasContext.fillStyle = "black";
        this.canvasContext.fillRect(HOLD_LEFT, HOLD_TOP, BLOCK_SIZE * 4, BLOCK_SIZE * 3);


        // Draw game state
        this.canvasContext.fillStyle = "black";
        this.canvasContext.fillRect(GRID_LEFT, GRID_TOP, BLOCK_SIZE * 10, BLOCK_SIZE * 20);
        for (let row = 0; row < 20; row++) {
            for (let col = 0; col < 10; col++) {
                let sprite = this.grid[row][col].sprite;
                if (activeLocations.some(cell => { return cell.row == row && cell.col == col; })) {
                    sprite = this.activeBlock.tetrimino.sprite;
                } else if (ghostLocations.some(cell => { return cell.row == row && cell.col == col; })) {
                    sprite = SPRITES.GHOST;
                } else if (this.grid[row][col] === TETRIMINO.EMPTY) {
                    continue;
                }
                this.drawBlock(sprite, GRID_TOP, GRID_LEFT, row, col);
            }
        }

        // Draw preview
        let previews = TetriminoBag.peek();
        this.canvasContext.fillStyle = "black";
        this.canvasContext.fillRect(PREVIEW_LEFT, PREVIEW_TOP, BLOCK_SIZE * 4, BLOCK_SIZE * 20);
        for (let i = 0; i < previews.length; i++) {
            let tetrimino = previews[i];

            let tetriminoTop = PREVIEW_TOP + i * 3 * BLOCK_SIZE;
            tetrimino.rotations[0].forEach(cell => {
                this.drawBlock(tetrimino.sprite, tetriminoTop, PREVIEW_LEFT, 15 + cell.row, cell.col);
            });
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

let State;

function init() {
    State = new state();
    Input.init();

    window.requestAnimationFrame(State.step.bind(State));
}
