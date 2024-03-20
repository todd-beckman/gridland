const DEBUG = true;
const PLAY_AREA_TOP = 0;
const PLAY_AREA_LEFT = 0;
const PLAY_AREA_WIDTH = 550;
const PLAY_AREA_HEIGHT = 600;
const ITEM_GET_BORDER_LINE = PLAY_AREA_HEIGHT * 3 / 4;
const PLAYER_START_X = PLAY_AREA_WIDTH / 2;
const PLAYER_START_Y = PLAY_AREA_HEIGHT / 4;
const FOCUS_SPEED = 0.10;
const FAST_SPEED = 0.25;
const HURTBOX_RADIUS = 4;
const HURTBOX_RADIUS_SQUARED = HURTBOX_RADIUS * HURTBOX_RADIUS;
const GRAZEBOX_RADIUS = 8;
const GRAZEBOX_RADIUS_SQUARED = GRAZEBOX_RADIUS * GRAZEBOX_RADIUS;
const ITEMBOX_RADIUS = 20;
const ITEMBOX_RADIUS_SQUARED = ITEMBOX_RADIUS * ITEMBOX_RADIUS;
const FIRE_RATE = 70;
const PLAYER_BULLET_SPEED = 0.5;
const PLAYER_BULLET_SPREAD = 17;
const PLAYER_BULLET_ANGLE = 0.2;
const PLAYER_BULLET_FOCUS_ANGLE = 0.05;
const PLAYER_BULLET_OFFSET_SPAWN = PLAYER_BULLET_SPREAD / 2;
const PLAYER_BULLET_RADIUS = 5;
const PLAYER_BULLET_RADIUS_SQUARED = PLAYER_BULLET_RADIUS * PLAYER_BULLET_RADIUS;
const ITEM_RADIUS = 20;
const ITEM_RADIUS_SQUARED = ITEM_RADIUS * ITEM_RADIUS;
var COLOR;
(function (COLOR) {
    COLOR["HURTBOX"] = "red";
    COLOR["GRAZEBOX"] = "yellow";
    COLOR["ITEMBOX"] = "green";
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
    addX(x) {
        return new Vector(this.x + x, this.y);
    }
    addY(y) {
        return new Vector(this.x, this.y + y);
    }
    subtract(other) {
        return new Vector(this.x - other.x, this.y - other.y);
    }
    scale(scalar) {
        return new Vector(this.x * scalar, this.y * scalar);
    }
    distanceSquared(other) {
        let x = this.x - other.x;
        let y = this.y - other.y;
        return x * x + y * y;
    }
    get toString() {
        return "(" + this.x + "," + this.y + ")";
    }
    get toScreenSpace() {
        return new Vector(this.x, -this.y).add(Vector.ORIGIN);
    }
    get magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    get toUnit() {
        return this.scale(1 / this.magnitude);
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
                Input.inputs.set(Input.UP.id, value);
                break;
            case "ArrowLeft":
            case "KeyA":
                Input.inputs.set(Input.LEFT.id, value);
                break;
            case "ArrowRight":
            case "KeyD":
                Input.inputs.set(Input.RIGHT.id, value);
                break;
            case "ArrowDown":
            case "KeyS":
                Input.inputs.set(Input.DOWN.id, value);
                break;
            case "ShiftLeft":
            case "ShiftRight":
                Input.inputs.set(Input.FOCUS.id, value);
                break;
            case "KeyZ":
            case "KeyF":
                Input.inputs.set(Input.SHOOT.id, value);
                break;
            case "KeyI":
                Input.inputs.set(Input.DEBUG_SPAWN_ITEM.id, value);
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
        return Input.inputs.get(this.id);
    }
    static onFrameEnd() {
        this.inputs.forEach((value, key) => {
            if (value > 0) {
                this.inputs.set(key, value + 1);
            }
        });
    }
}
Input.inputs = new Map();
Input.LEFT = new Input("LEFT");
Input.RIGHT = new Input("RIGHT");
Input.UP = new Input("UP");
Input.DOWN = new Input("DOWN");
Input.FOCUS = new Input("FOCUS");
Input.SHOOT = new Input("SHOOT");
Input.DEBUG_SPAWN_ITEM = new Input("DEBUG_SPAWN_ITEM");
;
var MODE;
(function (MODE) {
    MODE["PLAY"] = "PLAY";
    MODE["GAME_OVER"] = "GAME OVER";
})(MODE || (MODE = {}));
class Player {
    get radiusSquared() {
        return HURTBOX_RADIUS_SQUARED;
    }
    constructor() {
        this.location = new Vector(PLAYER_START_X, PLAYER_START_Y);
    }
    moveOrDelete(msSinceLastFrame) {
        this.location = this.pushIntoBounds(this.location.add(this.moveDirection.scale(this.moveSpeed(msSinceLastFrame))));
        return false;
    }
    draw(ctx) {
        let canvasLocation = this.location.toScreenSpace;
        ctx.fillStyle = COLOR.ITEMBOX;
        ctx.fillRect(canvasLocation.x - ITEMBOX_RADIUS, canvasLocation.y - ITEMBOX_RADIUS, ITEMBOX_RADIUS * 2, ITEMBOX_RADIUS * 2);
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
    collides(otherLocation, otherRadiusSquared) {
        return this.location.distanceSquared(otherLocation) <= this.radiusSquared + otherRadiusSquared;
    }
}
class PlayerBullet {
    get radiusSquared() {
        return PLAYER_BULLET_RADIUS_SQUARED;
    }
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
    collides(otherLocation, otherRadiusSquared) {
        return this.location.distanceSquared(otherLocation) <= this.radiusSquared + otherRadiusSquared;
    }
}
class Item {
    get radiusSquared() {
        return ITEM_RADIUS_SQUARED;
    }
    constructor(location) {
        this.shouldChasePlayer = false;
        this.location = location;
        let spread = (Math.random() - 0.5) * Item.SPAWN_SPREAD;
        this.velocity = new Vector(spread, Item.SPAWN_VERTICAL_SPEED);
    }
    chasePlayer() {
        this.shouldChasePlayer = true;
    }
    moveOrDelete(msSinceLastFrame) {
        if (this.shouldChasePlayer) {
            this.chasePlayerOrDelete(msSinceLastFrame);
            return false;
        }
        return this.fallOrDelete(msSinceLastFrame);
    }
    chasePlayerOrDelete(msSinceLastFrame) {
        let vectorToPlayer = state.player.location.subtract(this.location);
        this.velocity = vectorToPlayer.toUnit.scale(Item.CHASE_SPEED * msSinceLastFrame);
        this.location = this.location.add(this.velocity);
    }
    fallOrDelete(msSinceLastFrame) {
        let newVelocity = this.velocity.add(Item.ACCELERATION.scale(msSinceLastFrame));
        this.velocity = new Vector(newVelocity.x * Item.SPREAD_REDUCTION, newVelocity.y);
        if (this.velocity.y < Item.MAX_VELOCITY.y) {
            this.velocity = Item.MAX_VELOCITY;
        }
        this.location = this.location.add(this.velocity);
        return this.location.y <= -10;
    }
    collides(otherLocation, otherRadiusSquared) {
        return this.location.distanceSquared(otherLocation) <= ITEMBOX_RADIUS_SQUARED + otherRadiusSquared;
    }
    draw(ctx) {
        let canvasLocation = this.location.toScreenSpace;
        ctx.fillStyle = this.color;
        ctx.fillRect(canvasLocation.x - ITEM_RADIUS / 2, canvasLocation.y - ITEM_RADIUS / 2, ITEMBOX_RADIUS, ITEMBOX_RADIUS);
    }
}
Item.ACCELERATION = new Vector(0, -0.001);
Item.MAX_VELOCITY = new Vector(0, -5);
Item.CHASE_SPEED = 0.40;
Item.SPAWN_VERTICAL_SPEED = 1;
Item.SPAWN_SPREAD = 1;
Item.SPREAD_REDUCTION = 0.99;
class PowerItem extends Item {
    get color() {
        return "red";
    }
    onCollect() {
        state.collectPowerItem();
    }
}
class PointItem extends Item {
    get color() {
        return "blue";
    }
    onCollect() {
        state.collectPointItem();
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
        this.score = 0;
        this.items = [];
        this.debugItemSpawnTime = Date.now();
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
    collectItems() {
        this.items.forEach(i => i.chasePlayer());
    }
    spawnPowerItem(location) {
        this.items.push(new PowerItem(location));
    }
    collectPowerItem() {
        this.powerLevel = Math.min(40, this.powerLevel + 1);
    }
    spawnPointItem(location) {
        this.items.push(new PointItem(location));
    }
    collectPointItem() {
        this.score += 1000 * (this.player.location.y / PLAY_AREA_HEIGHT);
    }
    debug() {
        if (!DEBUG) {
            return;
        }
        if (Input.DEBUG_SPAWN_ITEM.held) {
            if (100 <= this.frameTime - this.debugItemSpawnTime) {
                if (Math.random() < 0.5) {
                    this.spawnPowerItem(this.player.location.add(new Vector(0, 200)));
                }
                else {
                    this.spawnPointItem(this.player.location.add(new Vector(0, 200)));
                }
                this.debugItemSpawnTime = Date.now();
            }
        }
    }
    stepGame() {
        this.debug();
        this.player.moveOrDelete(this.msSinceLastFrame);
        this.shoot();
        // Read backwards to prevent concurrent modification
        for (let i = this.playerBullets.length - 1; i >= 0; i--) {
            if (this.playerBullets[i].moveOrDelete(this.msSinceLastFrame)) {
                this.playerBullets.splice(i, 1);
            }
        }
        if (this.player.location.y >= ITEM_GET_BORDER_LINE) {
            this.collectItems();
        }
        for (let i = this.items.length - 1; i >= 0; i--) {
            if (this.items[i].moveOrDelete(this.msSinceLastFrame)) {
                this.items.splice(i, 1);
            }
        }
        for (let i = this.items.length - 1; i >= 0; i--) {
            if (this.items[i].collides(this.player.location, ITEMBOX_RADIUS_SQUARED)) {
                this.items[i].onCollect();
                this.items.splice(i, 1);
            }
        }
    }
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = "black";
        this.ctx.fillRect(PLAY_AREA_LEFT, PLAY_AREA_TOP, PLAY_AREA_WIDTH, PLAY_AREA_HEIGHT);
        this.player.draw(this.ctx);
        this.playerBullets.forEach(b => b.draw(this.ctx));
        this.items.forEach(i => i.draw(this.ctx));
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
