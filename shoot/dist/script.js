const PLAY_AREA_TOP = 0;
const PLAY_AREA_LEFT = 40;
const PLAY_AREA_WIDTH = 480;
const PLAY_AREA_HEIGHT = 480;
const PLAYER_START_X = PLAY_AREA_WIDTH / 2;
const PLAYER_START_Y = PLAY_AREA_HEIGHT / 3;
const FOCUS_SPEED_PER_SECOND = 75;
const FAST_SPEED_PER_SECOND = 150;
const HURTBOX_RADIUS = 4;
const HURTBOX_RADIUS_SQUARED = HURTBOX_RADIUS * HURTBOX_RADIUS;
const GRAZEBOX_RADIUS = 8;
const GRAZEBOX_RADIUS_SQUARED = GRAZEBOX_RADIUS * GRAZEBOX_RADIUS;
const COLOR = {
    HURTBOX: "red",
    GRAZEBOX: "white",
};
class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    add(other) {
        return new Vector(this.x + other.x, this.y + other.y);
    }
    scale(scalar) {
        return new Vector(this.x * scalar, this.y * scalar);
    }
    get toString() {
        return "(" + this.x + "," + this.y + ")";
    }
    get toScreenSpace() {
        return new Vector(this.x, -this.y).add(Vector.ORIGIN);
    }
}
Vector.ZERO = new Vector(0, 0);
Vector.UP = new Vector(0, 1);
Vector.UP_RIGHT = new Vector(1 / Math.SQRT2, 1 / Math.SQRT2);
Vector.RIGHT = new Vector(1, 0);
Vector.DOWN_RIGHT = new Vector(1 / Math.SQRT2, -1 / Math.SQRT2);
Vector.DOWN = new Vector(0, -1);
Vector.DOWN_LEFT = new Vector(-1 / Math.SQRT2, -1 / Math.SQRT2);
Vector.LEFT = new Vector(-1, 0);
Vector.UP_LEFT = new Vector(-1 / Math.SQRT2, 1 / Math.SQRT2);
Vector.ORIGIN = new Vector(PLAY_AREA_LEFT, PLAY_AREA_TOP + PLAY_AREA_HEIGHT);
function V(x, y) {
    return new Vector(x, y);
}
class Input {
    constructor(id) {
        this.id = id;
    }
    static keyHandler(e) {
        if (e.defaultPrevented || e.repeat) {
            return;
        }
        let value = e.type == "keydown" ? 1 : 0;
        switch (e.code) {
            case "ArrowUp":
            case "KeyW":
                Input.inputs[Input.UP.id] = value;
                break;
            case "ArrowLeft":
            case "KeyA":
                Input.inputs[Input.LEFT.id] = value;
                break;
            case "ArrowRight":
            case "KeyD":
                Input.inputs[Input.RIGHT.id] = value;
                break;
            case "ArrowDown":
            case "KeyS":
                Input.inputs[Input.DOWN.id] = value;
                break;
            case "ShiftLeft":
            case "ShiftRight":
                Input.inputs[Input.FOCUS.id] = value;
            default:
                return;
        }
    }
    static init() {
        window.addEventListener("keyup", this.keyHandler.bind(this), true);
        window.addEventListener("keydown", this.keyHandler.bind(this), true);
    }
    get held() {
        return Input.inputs[this.id];
    }
    static onFrameEnd() {
        for (let i = 0; i < this.inputs.length; i++) {
            if (this.inputs[i]) {
                this.inputs[i]++;
            }
        }
    }
}
Input.inputs = [0, 0, 0, 0, 0];
Input.LEFT = new Input(0);
Input.RIGHT = new Input(1);
Input.UP = new Input(2);
Input.DOWN = new Input(3);
Input.FOCUS = new Input(4);
;
var MODE;
(function (MODE) {
    MODE["PLAY"] = "PLAY";
    MODE["GAME_OVER"] = "GAME OVER";
})(MODE || (MODE = {}));
;
class State {
    constructor() {
        Input.init();
        this.mode = MODE.PLAY;
        this.timeSinceLastFrame = 0;
        this.lastFrameTime = Date.now();
        this.canvas = document.getElementById("canvas");
        this.ctx = this.canvas.getContext("2d");
        this.playerLocation = new Vector(PLAYER_START_X, PLAYER_START_Y);
    }
    get moveDirection() {
        let up = Input.UP.held;
        let right = Input.RIGHT.held;
        let down = Input.DOWN.held;
        let left = Input.LEFT.held;
        let vertical = -1 * (down ? 1 : 0) + (up ? 1 : 0);
        let horizontal = -1 * (left ? 1 : 0) + (right ? 1 : 0);
        switch (vertical) {
            case -1:
                switch (horizontal) {
                    case -1:
                        return Vector.DOWN_LEFT;
                    case 1:
                        return Vector.DOWN_RIGHT;
                    case 0:
                        return Vector.DOWN;
                }
            case 1:
                switch (horizontal) {
                    case -1:
                        return Vector.UP_LEFT;
                    case 1:
                        return Vector.UP_RIGHT;
                    case 0:
                        return Vector.UP;
                }
            case 0:
                switch (horizontal) {
                    case -1:
                        return Vector.LEFT;
                    case 1:
                        return Vector.RIGHT;
                }
        }
        return Vector.ZERO;
    }
    get moveSpeed() {
        return (Input.FOCUS.held ? FOCUS_SPEED_PER_SECOND : FAST_SPEED_PER_SECOND) * this.timeSinceLastFrame / 1000;
    }
    pushIntoBounds(location) {
        let newLocation = location;
        if (newLocation.x - GRAZEBOX_RADIUS < 0) {
            newLocation = new Vector(GRAZEBOX_RADIUS, newLocation.y);
        }
        if (newLocation.y - GRAZEBOX_RADIUS < 0) {
            newLocation = new Vector(newLocation.x, GRAZEBOX_RADIUS);
        }
        if (newLocation.x + GRAZEBOX_RADIUS >= PLAY_AREA_WIDTH) {
            newLocation = new Vector(PLAY_AREA_WIDTH - GRAZEBOX_RADIUS, newLocation.y);
        }
        if (newLocation.y + GRAZEBOX_RADIUS >= PLAY_AREA_HEIGHT) {
            newLocation = new Vector(newLocation.x, PLAY_AREA_HEIGHT - GRAZEBOX_RADIUS);
        }
        return newLocation;
    }
    movePlayer() {
        this.playerLocation = this.pushIntoBounds(this.playerLocation.add(this.moveDirection.scale(this.moveSpeed)));
    }
    stepGame() {
        this.movePlayer();
    }
    drawPlayer() {
        let canvasLocation = this.playerLocation.toScreenSpace;
        this.ctx.fillStyle = COLOR.GRAZEBOX;
        this.ctx.fillRect(canvasLocation.x - GRAZEBOX_RADIUS, canvasLocation.y - GRAZEBOX_RADIUS, GRAZEBOX_RADIUS * 2, GRAZEBOX_RADIUS * 2);
        this.ctx.fillStyle = COLOR.HURTBOX;
        this.ctx.fillRect(canvasLocation.x - HURTBOX_RADIUS, canvasLocation.y - HURTBOX_RADIUS, HURTBOX_RADIUS * 2, HURTBOX_RADIUS * 2);
    }
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = "black";
        this.ctx.fillRect(PLAY_AREA_LEFT, PLAY_AREA_TOP, PLAY_AREA_WIDTH, PLAY_AREA_HEIGHT);
        this.drawPlayer();
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
}
;
let state;
function init() {
    state = new State();
    Input.init();
    window.requestAnimationFrame(state.step.bind(state));
}
