const PLAY_AREA_TOP = 0;
const PLAY_AREA_LEFT = 40;
const PLAY_AREA_WIDTH = 480;
const PLAY_AREA_HEIGHT = 480;
const PLAYER_START_X = PLAY_AREA_WIDTH / 2;
const PLAYER_START_Y = PLAY_AREA_HEIGHT / 4;
const FOCUS_SPEED = 0.125;
const FAST_SPEED = 0.25;
const HURTBOX_RADIUS = 4;
const HURTBOX_RADIUS_SQUARED = HURTBOX_RADIUS * HURTBOX_RADIUS;
const GRAZEBOX_RADIUS = 8;
const GRAZEBOX_RADIUS_SQUARED = GRAZEBOX_RADIUS * GRAZEBOX_RADIUS;
const FIRE_RATE = 100;
const PLAYER_BULLET_SPEED = 0.5;
const PLAYER_BULLET_RADIUS = 5;
const PLAYER_BULLET_SPREAD = 17;
const PLAYER_BULLET_ANGLE = 0.2;
const PLAYER_BULLET_FOCUS_ANGLE = 0.05;
const PLAYER_BULLET_OFFSET_SPAWN = PLAYER_BULLET_SPREAD / 2;
var COLOR;
(function (COLOR) {
    COLOR["HURTBOX"] = "red";
    COLOR["GRAZEBOX"] = "yellow";
    COLOR["BULLET"] = "rgb(128,128,128)";
})(COLOR || (COLOR = {}));
;
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
                break;
            case "KeyZ":
            case "KeyF":
                Input.inputs[Input.SHOOT.id] = value;
                break;
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
Input.inputs = [0, 0, 0, 0, 0, 0];
Input.LEFT = new Input(0);
Input.RIGHT = new Input(1);
Input.UP = new Input(2);
Input.DOWN = new Input(3);
Input.FOCUS = new Input(4);
Input.SHOOT = new Input(5);
;
var MODE;
(function (MODE) {
    MODE["PLAY"] = "PLAY";
    MODE["GAME_OVER"] = "GAME OVER";
})(MODE || (MODE = {}));
class Player {
    constructor() {
        this.location = new Vector(PLAYER_START_X, PLAYER_START_Y);
    }
    moveOrDelete(msSinceLastFrame) {
        this.location = this.pushIntoBounds(this.location.add(this.moveDirection.scale(this.moveSpeed(msSinceLastFrame))));
        return false;
    }
    draw(ctx) {
        let canvasLocation = this.location.toScreenSpace;
        ctx.fillStyle = COLOR.GRAZEBOX;
        ctx.fillRect(canvasLocation.x - GRAZEBOX_RADIUS, canvasLocation.y - GRAZEBOX_RADIUS, GRAZEBOX_RADIUS * 2, GRAZEBOX_RADIUS * 2);
        ctx.fillStyle = COLOR.HURTBOX;
        ctx.fillRect(canvasLocation.x - HURTBOX_RADIUS, canvasLocation.y - HURTBOX_RADIUS, HURTBOX_RADIUS * 2, HURTBOX_RADIUS * 2);
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
    moveSpeed(msSinceLastFrame) {
        return (Input.FOCUS.held ? FOCUS_SPEED : FAST_SPEED) * msSinceLastFrame;
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
}
class PlayerBullet {
    constructor(location, direction) {
        this.location = location;
        this.direction = direction;
    }
    moveOrDelete(msSinceLastFrame) {
        let newLocation = this.location.add(this.direction.scale(PLAYER_BULLET_SPEED)
            .scale(msSinceLastFrame));
        if (newLocation.y > PLAY_AREA_HEIGHT) {
            return true;
        }
        this.location = newLocation;
        return false;
    }
    draw(ctx) {
        let canvasLocation = this.location.toScreenSpace;
        ctx.fillStyle = COLOR.BULLET;
        ctx.fillRect(canvasLocation.x - PLAYER_BULLET_RADIUS / 2, canvasLocation.y - PLAYER_BULLET_RADIUS / 2, PLAYER_BULLET_RADIUS, PLAYER_BULLET_RADIUS);
    }
}
class State {
    constructor() {
        Input.init();
        this.mode = MODE.PLAY;
        this.msSinceLastFrame = 0;
        this.frameTime = Date.now();
        this.lastFireTime = 0;
        this.player = new Player();
        this.playerBullets = [];
        this.powerLevel = 0;
        this.canvas = document.getElementById("canvas");
        this.ctx = this.canvas.getContext("2d");
    }
    get powerTier() {
        if (this.powerLevel < 10) {
            return 0;
        }
        if (this.powerLevel < 20) {
            return 1;
        }
        if (this.powerLevel < 30) {
            return 2;
        }
        return 3;
    }
    get playerLeftBulletSpawn() {
        return this.player.location.add(new Vector(-PLAYER_BULLET_OFFSET_SPAWN, 0));
    }
    get playerRightBulletSpawn() {
        return this.player.location.add(new Vector(PLAYER_BULLET_OFFSET_SPAWN, 0));
    }
    spawnCenterStream() {
        this.playerBullets.push(new PlayerBullet(this.player.location, Vector.UP));
    }
    spawnSideStreams(spreadAngle) {
        this.playerBullets.push(new PlayerBullet(this.playerLeftBulletSpawn, new Vector(-spreadAngle, 1)));
        this.playerBullets.push(new PlayerBullet(this.playerRightBulletSpawn, new Vector(spreadAngle, 1)));
    }
    spawnPlayerBullets() {
        let spreadAngle = Input.FOCUS.held ? PLAYER_BULLET_FOCUS_ANGLE : PLAYER_BULLET_ANGLE;
        switch (this.powerTier) {
            case 0:
                this.spawnSideStreams(0);
                break;
            case 1:
                this.spawnCenterStream();
                this.spawnSideStreams(spreadAngle);
                break;
            case 2:
                this.spawnSideStreams(0);
                this.spawnSideStreams(spreadAngle);
                break;
            case 3:
                this.spawnSideStreams(0);
                this.spawnSideStreams(spreadAngle);
                this.spawnSideStreams(spreadAngle * 2);
                break;
        }
    }
    shoot() {
        if (Input.SHOOT.held) {
            if (FIRE_RATE <= this.frameTime - this.lastFireTime) {
                this.spawnPlayerBullets();
                this.lastFireTime = Date.now();
            }
        }
        else {
            this.lastFireTime = 0;
        }
    }
    stepGame() {
        this.player.moveOrDelete(this.msSinceLastFrame);
        this.shoot();
        // Read backwards to prevent concurrent modification
        for (let i = this.playerBullets.length - 1; i >= 0; i--) {
            if (this.playerBullets[i].moveOrDelete(this.msSinceLastFrame)) {
                this.playerBullets.splice(i, 1);
            }
        }
    }
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = "black";
        this.ctx.fillRect(PLAY_AREA_LEFT, PLAY_AREA_TOP, PLAY_AREA_WIDTH, PLAY_AREA_HEIGHT);
        this.player.draw(this.ctx);
        this.playerBullets.forEach(b => b.draw(this.ctx));
    }
    step() {
        let now = Date.now();
        this.msSinceLastFrame = now - this.frameTime;
        this.frameTime = now;
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
    window.requestAnimationFrame(state.step.bind(state));
}
