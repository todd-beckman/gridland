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
const PLAYER_BULLET_SPREAD = 20;
const PLAYER_BULLET_ANGLE = 0.2;
const PLAYER_BULLET_FOCUS_ANGLE = 0.05;

enum COLOR {
    HURTBOX = "red",
    GRAZEBOX = "yellow",
    BULLET = "rgb(128,128,128)",
};

class Vector {
    readonly x: number;
    readonly y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    add(other: Vector): Vector {
        return new Vector(this.x + other.x, this.y + other.y);
    }

    scale(scalar: number): Vector {
        return new Vector(this.x * scalar, this.y * scalar);
    }

    get toString(): String {
        return "(" + this.x + "," + this.y + ")";
    }

    get toScreenSpace(): Vector {
        return new Vector(this.x, -this.y).add(Vector.ORIGIN);
    }

    static ZERO = new Vector(0, 0);
    static UP = new Vector(0, 1);
    static UP_RIGHT = new Vector(1 / Math.SQRT2, 1 / Math.SQRT2);
    static RIGHT = new Vector(1, 0);
    static DOWN_RIGHT = new Vector(1 / Math.SQRT2, -1 / Math.SQRT2);
    static DOWN = new Vector(0, -1);
    static DOWN_LEFT = new Vector(-1 / Math.SQRT2, -1 / Math.SQRT2);
    static LEFT = new Vector(-1, 0);
    static UP_LEFT = new Vector(-1 / Math.SQRT2, 1 / Math.SQRT2);

    static ORIGIN = new Vector(
        PLAY_AREA_LEFT,
        PLAY_AREA_TOP + PLAY_AREA_HEIGHT);
}

function V(x: number, y: number): Vector {
    return new Vector(x, y);
}

class Input {
    private id: number;
    private constructor(id: number) {
        this.id = id;
    }

    static inputs: number[] = [0, 0, 0, 0, 0, 0];
    static LEFT = new Input(0);
    static RIGHT = new Input(1);
    static UP = new Input(2);
    static DOWN = new Input(3);
    static FOCUS = new Input(4);
    static SHOOT = new Input(5);

    static keyHandler(e: KeyboardEvent) {
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

    get held(): number {
        return Input.inputs[this.id];
    }

    static onFrameEnd() {
        for (let i = 0; i < this.inputs.length; i++) {
            if (this.inputs[i]) {
                this.inputs[i]++;
            }
        }
    }
};

enum MODE {
    PLAY = "PLAY",
    GAME_OVER = "GAME OVER",
};

interface Actor {
    get location(): Vector;
    moveOrDelete(msSinceLastFrame: number): boolean;
    draw(ctx: CanvasRenderingContext2D): void;
}

class Player implements Actor {
    location: Vector;
    constructor() {
        this.location = new Vector(PLAYER_START_X, PLAYER_START_Y);
    }

    moveOrDelete(msSinceLastFrame: number) {
        this.location = this.pushIntoBounds(
            this.location.add(
                this.moveDirection.scale(
                    this.moveSpeed(msSinceLastFrame))));
        return false;
    }

    draw(ctx: CanvasRenderingContext2D) {
        let canvasLocation = this.location.toScreenSpace;
        ctx.fillStyle = COLOR.GRAZEBOX;
        ctx.fillRect(
            canvasLocation.x - GRAZEBOX_RADIUS,
            canvasLocation.y - GRAZEBOX_RADIUS,
            GRAZEBOX_RADIUS * 2,
            GRAZEBOX_RADIUS * 2,
        );

        ctx.fillStyle = COLOR.HURTBOX;
        ctx.fillRect(
            canvasLocation.x - HURTBOX_RADIUS,
            canvasLocation.y - HURTBOX_RADIUS,
            HURTBOX_RADIUS * 2,
            HURTBOX_RADIUS * 2,
        );
    }

    private get moveDirection(): Vector {
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

    private moveSpeed(msSinceLastFrame: number): number {
        return (Input.FOCUS.held ? FOCUS_SPEED : FAST_SPEED) * msSinceLastFrame;
    }

    private pushIntoBounds(location: Vector): Vector {
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

class PlayerBullet implements Actor {
    location: Vector;
    direction: Vector;
    constructor(location: Vector, direction: Vector) {
        this.location = location;
        this.direction = direction;
    }

    moveOrDelete(msSinceLastFrame: number): boolean {
        let newLocation = this.location.add(
            this.direction.scale(PLAYER_BULLET_SPEED)
                .scale(
                    msSinceLastFrame));
        if (newLocation.y > PLAY_AREA_HEIGHT) {
            return true;
        }
        this.location = newLocation;
        return false;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        let canvasLocation = this.location.toScreenSpace;
        ctx.fillStyle = COLOR.BULLET;
        ctx.fillRect(
            canvasLocation.x - PLAYER_BULLET_RADIUS / 2,
            canvasLocation.y - PLAYER_BULLET_RADIUS / 2,
            PLAYER_BULLET_RADIUS,
            PLAYER_BULLET_RADIUS);
    }
}

class State {
    private mode: MODE;
    private msSinceLastFrame: number;
    private frameTime: number;
    private lastFireTime: number;
    private player: Actor;
    private playerBullets: Actor[];

    private readonly canvas: HTMLCanvasElement;
    private readonly ctx: CanvasRenderingContext2D;

    constructor() {
        Input.init();
        this.mode = MODE.PLAY;
        this.msSinceLastFrame = 0;
        this.frameTime = Date.now();
        this.lastFireTime = 0;
        this.player = new Player();
        this.playerBullets = [];

        this.canvas = document.getElementById("canvas") as HTMLCanvasElement;
        this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
    }

    shoot() {
        if (Input.SHOOT.held) {
            if (FIRE_RATE <= this.frameTime - this.lastFireTime) {
                this.playerBullets.push(new PlayerBullet(this.player.location.add(new Vector(PLAYER_BULLET_SPREAD / 2, 0)), Vector.UP));
                this.playerBullets.push(new PlayerBullet(this.player.location.add(new Vector(-PLAYER_BULLET_SPREAD / 2, 0)), Vector.UP));

                // this should only be done for certain power levels
                let spreadAngle = Input.FOCUS.held ? PLAYER_BULLET_FOCUS_ANGLE : PLAYER_BULLET_ANGLE;

                this.playerBullets.push(new PlayerBullet(this.player.location.add(new Vector(PLAYER_BULLET_SPREAD / 2, 0)), new Vector(spreadAngle, 1)));
                this.playerBullets.push(new PlayerBullet(this.player.location.add(new Vector(-PLAYER_BULLET_SPREAD / 2, 0)), new Vector(-spreadAngle, 1)));

                this.lastFireTime = Date.now();
            }
        } else {
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
};

let state: State;

function init() {
    state = new State();
    window.requestAnimationFrame(state.step.bind(state));
}
