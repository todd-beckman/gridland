define("lib/util/global", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Global = void 0;
    /**
     * Defines global variables from which all other constants should be derived.
     */
    exports.Global = Object.freeze({
        /**
         * Should be set to false before release.
         */
        DEBUG: true,
        /**
         * Where to render the top of the arena.
         *
         * This should not be used outside of rendering, as the Y-Axis is inverted in world-space.
         */
        PLAY_AREA_TOP: 0,
        /**
         * Where to render the left of the arena.
         */
        PLAY_AREA_LEFT: 0,
        /**
         * The width of the arena, from which all %-based locations should be derived.
         */
        PLAY_AREA_WIDTH: 550,
        /**
         * The height of the arena, from which all %-based locations should be derived.
         */
        PLAY_AREA_HEIGHT: 600,
    });
});
define("lib/util/input", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Input = void 0;
    /**
     * A singleton class tracking the input state.
     * At any given time, as long as {@link onFrameEnd()} is called,
     * any button's {@link held} represents the number of frames that
     * the button has been held.
     *
     * If multiple input bottons are mapped to an input, they will
     * compete for onkeyup and onkeydown.
     *
     * {@link init()} must be called exactly once globally.
     */
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
        /**
         * Wires up the required listeners.
         *
         * This must be called exactly once per
         */
        static init() {
            if (Input.initCalled) {
                return;
            }
            window.addEventListener("keyup", this.keyHandler.bind(this), true);
            window.addEventListener("keydown", this.keyHandler.bind(this), true);
            Input.initCalled = true;
        }
        /**
         * The number of frames this input has been held.
         */
        get held() {
            return Input.inputs.get(this.id);
        }
        /**
         * Must be called after each frame. The duration of the frame is irrelevant.
         */
        static onFrameEnd() {
            this.inputs.forEach((value, key) => {
                if (value > 0) {
                    this.inputs.set(key, value + 1);
                }
            });
        }
    }
    exports.Input = Input;
    Input.initCalled = false;
    Input.inputs = new Map();
    /**
     * Tracks how many frame any Left input has been held.
     */
    Input.LEFT = new Input("LEFT");
    /**
     * Tracks how many frame any Right input has been held.
     */
    Input.RIGHT = new Input("RIGHT");
    /**
     * Tracks how many frame any Up input has been held.
     */
    Input.UP = new Input("UP");
    /**
     * Tracks how many frame any Down input has been held.
     */
    Input.DOWN = new Input("DOWN");
    /**
     * Tracks how many frame the Focus input has been held.
     */
    Input.FOCUS = new Input("FOCUS");
    /**
     * Tracks how many frame the Shoot Left input has been held.
     */
    Input.SHOOT = new Input("SHOOT");
    /**
     * Tracks how many frame any Debug input has been held.
     */
    Input.DEBUG_SPAWN_ITEM = new Input("DEBUG_SPAWN_ITEM");
    ;
});
define("lib/util/vector", ["require", "exports", "lib/util/global"], function (require, exports, global_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Vector = void 0;
    /**
     * World-space coordinate system, useful for location and physics.
     * This should not be used for rendering except by use of
     * {@link toScreenSpace}.
     *
     * World-space coordinates has Up represented by a positive Y,
     * which is opposite of render space.
     */
    class Vector {
        /**
         * Represents either a location or a direction in world-space.
         */
        constructor(x, y) {
            this.x = x;
            this.y = y;
        }
        /**
         * @returns a vector consisting of the sum of this vector and the other.
         */
        add(other) {
            return new Vector(this.x + other.x, this.y + other.y);
        }
        /**
         * Shorthand for {@link add} where only the X coordinate should be shifted.
         */
        addX(x) {
            return new Vector(this.x + x, this.y);
        }
        /**
         * Shorthand for {@link add} where only the Y coordinate should be shifted.
         */
        addY(y) {
            return new Vector(this.x, this.y + y);
        }
        /**
         * Shorthand for {@link add} except with the coordinates negated.
         */
        subtract(other) {
            return new Vector(this.x - other.x, this.y - other.y);
        }
        /**
         * @returns a scaled copy of the vector.
         */
        scale(scalar) {
            return new Vector(this.x * scalar, this.y * scalar);
        }
        /**
         * @returns the squared distance between vectors.
         */
        distanceSquared(other) {
            let x = this.x - other.x;
            let y = this.y - other.y;
            return x * x + y * y;
        }
        get toString() {
            return "(" + this.x + "," + this.y + ")";
        }
        /**
         * @returns the magnitude of the vector.
         */
        get magnitude() {
            return Math.sqrt(this.x * this.x + this.y * this.y);
        }
        /**
         * @returns a copy of the vector scaled to a magnitude of 1.
         */
        get toUnit() {
            return this.scale(1 / this.magnitude);
        }
        /**
         * @returns the equivalent location of this vector in render-space.
         */
        get toScreenSpace() {
            return new Vector(this.x, -this.y).add(Vector.RENDER_ORIGIN);
        }
    }
    exports.Vector = Vector;
    /**
     * The zero vector, representing no direction.
     */
    Vector.ZERO = new Vector(0, 0);
    /**
     * The unit vector for up in world-space.
     */
    Vector.UP = new Vector(0, 1);
    /**
     * The unit vector for diagonally up and right in world-space.
     */
    Vector.UP_RIGHT = new Vector(1 / Math.SQRT2, 1 / Math.SQRT2);
    /**
     * The unit vector for right in world-space.
     */
    Vector.RIGHT = new Vector(1, 0);
    /**
     * The unit vector for diagonally down and right for up in world-space.
     */
    Vector.DOWN_RIGHT = new Vector(1 / Math.SQRT2, -1 / Math.SQRT2);
    /**
     * The unit vector for down in world-space.
     */
    Vector.DOWN = new Vector(0, -1);
    /**
     * The unit vector for diagonally down and left in world-space.
     */
    Vector.DOWN_LEFT = new Vector(-1 / Math.SQRT2, -1 / Math.SQRT2);
    /**
     * The unit vector for left in world-space.
     */
    Vector.LEFT = new Vector(-1, 0);
    /**
     * The unit vector for diagonally up and left in world-space.
     */
    Vector.UP_LEFT = new Vector(-1 / Math.SQRT2, 1 / Math.SQRT2);
    /**
     * The (0, 0) location in render-space.
     */
    Vector.RENDER_ORIGIN = new Vector(global_1.Global.PLAY_AREA_LEFT, global_1.Global.PLAY_AREA_TOP + global_1.Global.PLAY_AREA_HEIGHT);
});
define("lib/actors/actor", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("lib/actors/friendly/item", ["require", "exports", "lib/util/vector"], function (require, exports, vector_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PointItem = exports.PowerItem = exports.Item = void 0;
    class Item {
        get radiusSquared() {
            return Item.RADIUS_SQUARED;
        }
        constructor(location) {
            this.shouldChasePlayer = false;
            this.location = location;
            let spread = (Math.random() - 0.5) * Item.SPAWN_SPREAD;
            this.velocity = new vector_1.Vector(spread, Item.SPAWN_VERTICAL_SPEED);
        }
        chasePlayer() {
            this.shouldChasePlayer = true;
        }
        updateOrDelete(game, msSinceLastFrame) {
            if (this.shouldChasePlayer) {
                this.chasePlayerOrDelete(game, msSinceLastFrame);
                return false;
            }
            return this.fallOrDelete(msSinceLastFrame);
        }
        chasePlayerOrDelete(game, msSinceLastFrame) {
            let vectorToPlayer = game.player.location.subtract(this.location);
            this.velocity = vectorToPlayer.toUnit.scale(Item.CHASE_SPEED * msSinceLastFrame);
            this.location = this.location.add(this.velocity);
        }
        fallOrDelete(msSinceLastFrame) {
            let newVelocity = this.velocity.add(Item.ACCELERATION.scale(msSinceLastFrame));
            this.velocity = new vector_1.Vector(newVelocity.x * Item.SPREAD_REDUCTION, newVelocity.y);
            if (this.velocity.y < Item.MAX_VELOCITY.y) {
                this.velocity = Item.MAX_VELOCITY;
            }
            this.location = this.location.add(this.velocity);
            return this.location.y <= -10;
        }
        collides(otherLocation, otherRadiusSquared) {
            return this.location.distanceSquared(otherLocation) <= Item.RADIUS_SQUARED + otherRadiusSquared;
        }
        draw(ctx) {
            let canvasLocation = this.location.toScreenSpace;
            ctx.fillStyle = this.color;
            ctx.fillRect(canvasLocation.x - Item.RADIUS / 2, canvasLocation.y - Item.RADIUS / 2, Item.RADIUS, Item.RADIUS);
        }
    }
    exports.Item = Item;
    Item.RADIUS = 20;
    Item.RADIUS_SQUARED = Item.RADIUS * Item.RADIUS;
    Item.ACCELERATION = new vector_1.Vector(0, -0.001);
    Item.MAX_VELOCITY = new vector_1.Vector(0, -5);
    Item.CHASE_SPEED = 0.40;
    Item.SPAWN_VERTICAL_SPEED = 1;
    Item.SPAWN_SPREAD = 1;
    Item.SPREAD_REDUCTION = 0.99;
    class PowerItem extends Item {
        get color() {
            return "red";
        }
        onCollect(game) {
            game.player.collectPowerItem(game);
        }
    }
    exports.PowerItem = PowerItem;
    class PointItem extends Item {
        get color() {
            return "blue";
        }
        onCollect(game) {
            game.player.collectPointItem(game);
        }
    }
    exports.PointItem = PointItem;
});
define("lib/actors/friendly/player_bullet", ["require", "exports", "lib/util/global", "lib/actors/friendly/player"], function (require, exports, global_2, player_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PlayerBullet = void 0;
    class PlayerBullet {
        get radiusSquared() {
            return PlayerBullet.RADIUS_SQUARED;
        }
        constructor(location, direction) {
            this.location = location;
            this.direction = direction;
        }
        updateOrDelete(game, msSinceLastFrame) {
            for (let i = game.items.length - 1; i >= 0; i--) {
                if (game.items[i].collides(game.player.location, player_1.Player.ITEMBOX_RADIUS_SQUARED)) {
                    game.items[i].onCollect(game);
                    game.items.splice(i, 1);
                }
            }
            let newLocation = this.location.add(this.direction.scale(PlayerBullet.SPEED)
                .scale(msSinceLastFrame));
            if (newLocation.y > global_2.Global.PLAY_AREA_HEIGHT) {
                return true;
            }
            this.location = newLocation;
            return false;
        }
        draw(ctx) {
            let canvasLocation = this.location.toScreenSpace;
            ctx.fillStyle = PlayerBullet.COLOR;
            ctx.fillRect(canvasLocation.x - PlayerBullet.RADIUS / 2, canvasLocation.y - PlayerBullet.RADIUS / 2, PlayerBullet.RADIUS, PlayerBullet.RADIUS);
        }
        collides(otherLocation, otherRadiusSquared) {
            return this.location.distanceSquared(otherLocation) <= this.radiusSquared + otherRadiusSquared;
        }
    }
    exports.PlayerBullet = PlayerBullet;
    PlayerBullet.SPEED = 0.5;
    PlayerBullet.RADIUS = 5;
    PlayerBullet.RADIUS_SQUARED = PlayerBullet.RADIUS * PlayerBullet.RADIUS;
    PlayerBullet.COLOR = "rgb(128,128,128)";
});
define("lib/util/with_cooldown", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WithCooldown = void 0;
    /**
     * Tracks an interval that happens at a minimum of the given rate.
     */
    class WithCooldown {
        constructor(cooldownMs) {
            this.cooldownMs = cooldownMs;
            this.setCooldown = cooldownMs;
        }
        /**
         * Returns whether the cooldown has finished after the provided time has passed.
         * If so, also calls {@link trigger()} to reset the cooldown countdown.
         *
         * @param msSinceLastFrame
         * @returns Whether the cooldown is over.
         */
        checkAndTrigger(msSinceLastFrame) {
            if (this.check(msSinceLastFrame)) {
                this.trigger();
                return true;
            }
            return false;
        }
        /**
         * Returns whether the cooldown has finished after the provided time has passed.
         * @param msSinceLastFrame
         * @returns
         */
        check(msSinceLastFrame) {
            this.cooldownMs = Math.max(0, this.cooldownMs - msSinceLastFrame);
            return this.cooldownMs == 0;
        }
        /**
         * Resets the cooldown countdown.
         */
        trigger() {
            this.cooldownMs = this.setCooldown;
        }
    }
    exports.WithCooldown = WithCooldown;
});
define("lib/actors/friendly/player", ["require", "exports", "lib/util/vector", "lib/util/global", "lib/util/input", "lib/actors/friendly/player_bullet", "lib/util/with_cooldown"], function (require, exports, vector_2, global_3, input_1, player_bullet_1, with_cooldown_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Player = void 0;
    class Player {
        constructor() {
            this.powerLevel = 0;
            this.fire = new with_cooldown_1.WithCooldown(Player.FIRE_RATE);
            this.location = new vector_2.Vector(Player.START_X, Player.START_Y);
        }
        get radiusSquared() {
            return Player.HURTBOX_RADIUS_SQUARED;
        }
        updateOrDelete(game, msSinceLastFrame) {
            this.shoot(game, msSinceLastFrame);
            this.location = this.pushIntoBounds(this.location.add(this.moveDirection.scale(this.moveSpeed(msSinceLastFrame))));
            if (this.location.y >= Player.ITEM_GET_BORDER_LINE) {
                this.collectItems(game);
            }
            for (let i = game.items.length - 1; i >= 0; i--) {
                if (game.items[i].collides(this.location, Player.ITEMBOX_RADIUS_SQUARED)) {
                    game.items[i].onCollect(game);
                    game.items.splice(i, 1);
                }
            }
            return false;
        }
        draw(ctx) {
            let canvasLocation = this.location.toScreenSpace;
            ctx.fillStyle = Player.ITEMBOX;
            ctx.fillRect(canvasLocation.x - Player.ITEMBOX_RADIUS, canvasLocation.y - Player.ITEMBOX_RADIUS, Player.ITEMBOX_RADIUS * 2, Player.ITEMBOX_RADIUS * 2);
            ctx.fillStyle = Player.GRAZEBOX;
            ctx.fillRect(canvasLocation.x - Player.GRAZEBOX_RADIUS, canvasLocation.y - Player.GRAZEBOX_RADIUS, Player.GRAZEBOX_RADIUS * 2, Player.GRAZEBOX_RADIUS * 2);
            ctx.fillStyle = Player.HURTBOX;
            ctx.fillRect(canvasLocation.x - Player.HURTBOX_RADIUS, canvasLocation.y - Player.HURTBOX_RADIUS, Player.HURTBOX_RADIUS * 2, Player.HURTBOX_RADIUS * 2);
        }
        collectPowerItem(game) {
            this.powerLevel = Math.min(40, this.powerLevel + 1);
            game.addScore(100);
        }
        collectPointItem(game) {
            let percent = Math.min(this.location.y, Player.ITEM_GET_BORDER_LINE) / Player.ITEM_GET_BORDER_LINE;
            game.addScore(percent * 10000);
        }
        collides(otherLocation, otherRadiusSquared) {
            return this.location.distanceSquared(otherLocation) <= this.radiusSquared + otherRadiusSquared;
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
            return this.location.add(new vector_2.Vector(-Player.BULLET_OFFSET_SPAWN, 0));
        }
        get playerRightBulletSpawn() {
            return this.location.add(new vector_2.Vector(Player.BULLET_OFFSET_SPAWN, 0));
        }
        collectItems(game) {
            game.items.forEach(i => i.chasePlayer());
        }
        spawnCenterStream(game) {
            game.playerBullets.push(new player_bullet_1.PlayerBullet(this.location, vector_2.Vector.UP));
        }
        spawnSideStreams(game, spreadAngle) {
            game.playerBullets.push(new player_bullet_1.PlayerBullet(this.playerLeftBulletSpawn, new vector_2.Vector(-spreadAngle, 1)));
            game.playerBullets.push(new player_bullet_1.PlayerBullet(this.playerRightBulletSpawn, new vector_2.Vector(spreadAngle, 1)));
        }
        spawnPlayerBullets(game) {
            let spreadAngle = input_1.Input.FOCUS.held ? Player.BULLET_FOCUS_ANGLE : Player.BULLET_ANGLE;
            switch (this.powerTier) {
                case 0:
                    this.spawnSideStreams(game, 0);
                    break;
                case 1:
                    this.spawnCenterStream(game);
                    this.spawnSideStreams(game, spreadAngle);
                    break;
                case 2:
                    this.spawnSideStreams(game, 0);
                    this.spawnSideStreams(game, spreadAngle);
                    break;
                case 3:
                    this.spawnSideStreams(game, 0);
                    this.spawnSideStreams(game, spreadAngle);
                    this.spawnSideStreams(game, spreadAngle * 2);
                    break;
            }
        }
        shoot(game, msSinceLastFrame) {
            if (input_1.Input.SHOOT.held && this.fire.checkAndTrigger(msSinceLastFrame)) {
                this.spawnPlayerBullets(game);
            }
        }
        get moveDirection() {
            let up = input_1.Input.UP.held;
            let right = input_1.Input.RIGHT.held;
            let down = input_1.Input.DOWN.held;
            let left = input_1.Input.LEFT.held;
            let vertical = -1 * (down ? 1 : 0) + (up ? 1 : 0);
            let horizontal = -1 * (left ? 1 : 0) + (right ? 1 : 0);
            switch (vertical) {
                case -1:
                    switch (horizontal) {
                        case -1:
                            return vector_2.Vector.DOWN_LEFT;
                        case 1:
                            return vector_2.Vector.DOWN_RIGHT;
                        case 0:
                            return vector_2.Vector.DOWN;
                    }
                case 1:
                    switch (horizontal) {
                        case -1:
                            return vector_2.Vector.UP_LEFT;
                        case 1:
                            return vector_2.Vector.UP_RIGHT;
                        case 0:
                            return vector_2.Vector.UP;
                    }
                case 0:
                    switch (horizontal) {
                        case -1:
                            return vector_2.Vector.LEFT;
                        case 1:
                            return vector_2.Vector.RIGHT;
                    }
            }
            return vector_2.Vector.ZERO;
        }
        moveSpeed(msSinceLastFrame) {
            return (input_1.Input.FOCUS.held ? Player.FOCUS_SPEED : Player.FAST_SPEED) * msSinceLastFrame;
        }
        pushIntoBounds(location) {
            let newLocation = location;
            if (newLocation.x - Player.GRAZEBOX_RADIUS < 0) {
                newLocation = new vector_2.Vector(Player.GRAZEBOX_RADIUS, newLocation.y);
            }
            if (newLocation.y - Player.GRAZEBOX_RADIUS < 0) {
                newLocation = new vector_2.Vector(newLocation.x, Player.GRAZEBOX_RADIUS);
            }
            if (newLocation.x + Player.GRAZEBOX_RADIUS >= global_3.Global.PLAY_AREA_WIDTH) {
                newLocation = new vector_2.Vector(global_3.Global.PLAY_AREA_WIDTH - Player.GRAZEBOX_RADIUS, newLocation.y);
            }
            if (newLocation.y + Player.GRAZEBOX_RADIUS >= global_3.Global.PLAY_AREA_HEIGHT) {
                newLocation = new vector_2.Vector(newLocation.x, global_3.Global.PLAY_AREA_HEIGHT - Player.GRAZEBOX_RADIUS);
            }
            return newLocation;
        }
    }
    exports.Player = Player;
    Player.FIRE_RATE = 70;
    Player.FOCUS_SPEED = 0.10;
    Player.FAST_SPEED = 0.25;
    Player.START_X = global_3.Global.PLAY_AREA_WIDTH / 2;
    Player.START_Y = global_3.Global.PLAY_AREA_HEIGHT / 4;
    Player.HURTBOX_RADIUS = 4;
    Player.HURTBOX_RADIUS_SQUARED = Player.HURTBOX_RADIUS * Player.HURTBOX_RADIUS;
    Player.GRAZEBOX_RADIUS = 8;
    Player.GRAZEBOX_RADIUS_SQUARED = Player.GRAZEBOX_RADIUS * Player.GRAZEBOX_RADIUS;
    Player.ITEMBOX_RADIUS = 20;
    Player.ITEMBOX_RADIUS_SQUARED = Player.ITEMBOX_RADIUS * Player.ITEMBOX_RADIUS;
    Player.BULLET_SPREAD = 17;
    Player.BULLET_OFFSET_SPAWN = Player.BULLET_SPREAD / 2;
    Player.BULLET_ANGLE = 0.2;
    Player.BULLET_FOCUS_ANGLE = 0.05;
    Player.HURTBOX = "red";
    Player.GRAZEBOX = "yellow";
    Player.ITEMBOX = "green";
    Player.ITEM_GET_BORDER_LINE = global_3.Global.PLAY_AREA_HEIGHT * 3 / 4;
});
define("lib/game", ["require", "exports", "lib/util/global", "lib/util/input", "lib/actors/friendly/item", "lib/actors/friendly/player", "lib/util/vector", "lib/util/with_cooldown"], function (require, exports, global_4, input_2, item_1, player_2, vector_3, with_cooldown_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Game = void 0;
    var MODE;
    (function (MODE) {
        MODE["PLAY"] = "PLAY";
        MODE["GAME_OVER"] = "GAME OVER";
    })(MODE || (MODE = {}));
    function scoreToString(score) {
        let thousandsSegment = Math.floor(score % 1000).toString().padStart(3, "0");
        let millionsSegment = Math.floor((score / 1000) % 1000).toString().padStart(3, "0");
        let billionsSegment = Math.floor((score / 1000000) % 1000).toString().padStart(3, " ");
        return billionsSegment + "," + millionsSegment + "," + thousandsSegment;
    }
    function powerToString(power) {
        return "".padStart(power - 3, " ").padEnd(power + 1, "*");
    }
    class Game {
        constructor() {
            this.frameTime = Date.now();
            this.doDebug = new with_cooldown_2.WithCooldown(100);
            this.msSinceLastFrame = 0;
            this.mode = MODE.PLAY;
            this.score = 0;
            this.player = new player_2.Player();
            this.playerBullets = [];
            this.items = [];
            input_2.Input.init();
            this.canvas = document.getElementById("canvas");
            this.ctx = this.canvas.getContext("2d");
        }
        spawnPowerItem(location) {
            this.items.push(new item_1.PowerItem(location));
        }
        spawnPointItem(location) {
            this.items.push(new item_1.PointItem(location));
        }
        debug() {
            if (!global_4.Global.DEBUG) {
                return;
            }
            if (input_2.Input.DEBUG_SPAWN_ITEM.held && this.doDebug.checkAndTrigger(this.msSinceLastFrame)) {
                if (Math.random() < 0.5) {
                    this.spawnPowerItem(this.player.location.add(new vector_3.Vector(0, 200)));
                }
                else {
                    this.spawnPointItem(this.player.location.add(new vector_3.Vector(0, 200)));
                }
            }
        }
        stepGame() {
            this.debug();
            this.player.updateOrDelete(this, this.msSinceLastFrame);
            for (let i = this.playerBullets.length - 1; i >= 0; i--) {
                if (this.playerBullets[i].updateOrDelete(this, this.msSinceLastFrame)) {
                    this.playerBullets.splice(i, 1);
                }
            }
            for (let i = this.items.length - 1; i >= 0; i--) {
                if (this.items[i].updateOrDelete(this, this.msSinceLastFrame)) {
                    this.items.splice(i, 1);
                }
            }
        }
        drawHUD() {
            this.ctx.fillStyle = "blue";
            this.ctx.font = "20px courier";
            let row = 0;
            this.ctx.fillText("Score: " + scoreToString(this.score), Game.HUD_LEFT, Game.HUD_TOP + row * Game.HUD_ROW_HEIGHT);
            row++;
            this.ctx.fillText("Power: " + powerToString(this.player.powerTier), Game.HUD_LEFT, Game.HUD_TOP + row * Game.HUD_ROW_HEIGHT);
        }
        draw() {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = "black";
            this.ctx.fillRect(global_4.Global.PLAY_AREA_LEFT, global_4.Global.PLAY_AREA_TOP, global_4.Global.PLAY_AREA_WIDTH, global_4.Global.PLAY_AREA_HEIGHT);
            this.player.draw(this.ctx);
            this.playerBullets.forEach(b => b.draw(this.ctx));
            this.items.forEach(i => i.draw(this.ctx));
            this.drawHUD();
        }
        step() {
            let now = Date.now();
            this.msSinceLastFrame = now - this.frameTime;
            this.frameTime = now;
            if (this.mode === MODE.PLAY) {
                this.stepGame();
            }
            input_2.Input.onFrameEnd();
            this.draw();
            window.requestAnimationFrame(this.step.bind(this));
        }
        addScore(add) {
            this.score = Math.floor(this.score + add);
        }
    }
    exports.Game = Game;
    Game.HUD_TOP = global_4.Global.PLAY_AREA_TOP + 20;
    Game.HUD_LEFT = global_4.Global.PLAY_AREA_LEFT + global_4.Global.PLAY_AREA_WIDTH + 5;
    Game.HUD_ROW_HEIGHT = global_4.Global.PLAY_AREA_HEIGHT / 20;
});
define("script", ["require", "exports", "lib/game"], function (require, exports, game_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let game = new game_1.Game();
    window.requestAnimationFrame(game.step.bind(game));
});
define("lib/actors/enemies/enemy", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Enemy = void 0;
    class Enemy {
        get location() {
            throw new Error("Method not implemented.");
        }
        get radiusSquared() {
            throw new Error("Method not implemented.");
        }
        updateOrDelete(game, msSinceLastFrame) {
            throw new Error("Method not implemented.");
        }
        draw(ctx) {
            throw new Error("Method not implemented.");
        }
        collides(otherLocation, otherRadiusSquared) {
            throw new Error("Method not implemented.");
        }
    }
    exports.Enemy = Enemy;
});
define("lib/util/path", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LinearPath = exports.Path = void 0;
    class Path {
        constructor() {
            this.msTraveledTotal = 0;
        }
        location(msSinceLastFrame) {
            this.msTraveledTotal += msSinceLastFrame;
            return this.locationSinceSpawn(this.msTraveledTotal);
        }
    }
    exports.Path = Path;
    class LinearPath extends Path {
        constructor(velocityPerMs) {
            super();
            this.velocityPerMs = velocityPerMs;
        }
        locationSinceSpawn(msTraveledTotal) {
            return this.velocityPerMs.scale(msTraveledTotal);
        }
    }
    exports.LinearPath = LinearPath;
});
