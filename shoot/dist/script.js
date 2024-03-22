define("lib/global", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Global = void 0;
    exports.Global = Object.freeze({
        DEBUG: true,
        PLAY_AREA_TOP: 0,
        PLAY_AREA_LEFT: 0,
        PLAY_AREA_WIDTH: 550,
        PLAY_AREA_HEIGHT: 600,
    });
});
define("lib/input", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Input = void 0;
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
    exports.Input = Input;
    Input.inputs = new Map();
    Input.LEFT = new Input("LEFT");
    Input.RIGHT = new Input("RIGHT");
    Input.UP = new Input("UP");
    Input.DOWN = new Input("DOWN");
    Input.FOCUS = new Input("FOCUS");
    Input.SHOOT = new Input("SHOOT");
    Input.DEBUG_SPAWN_ITEM = new Input("DEBUG_SPAWN_ITEM");
    ;
});
define("lib/vector", ["require", "exports", "lib/global"], function (require, exports, global_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Vector = void 0;
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
        get magnitude() {
            return Math.sqrt(this.x * this.x + this.y * this.y);
        }
        get toUnit() {
            return this.scale(1 / this.magnitude);
        }
        get toScreenSpace() {
            return new Vector(this.x, -this.y).add(Vector.ORIGIN);
        }
    }
    exports.Vector = Vector;
    Vector.ZERO = new Vector(0, 0);
    Vector.UP = new Vector(0, 1);
    Vector.UP_RIGHT = new Vector(1 / Math.SQRT2, 1 / Math.SQRT2);
    Vector.RIGHT = new Vector(1, 0);
    Vector.DOWN_RIGHT = new Vector(1 / Math.SQRT2, -1 / Math.SQRT2);
    Vector.DOWN = new Vector(0, -1);
    Vector.DOWN_LEFT = new Vector(-1 / Math.SQRT2, -1 / Math.SQRT2);
    Vector.LEFT = new Vector(-1, 0);
    Vector.UP_LEFT = new Vector(-1 / Math.SQRT2, 1 / Math.SQRT2);
    Vector.ORIGIN = new Vector(global_1.Global.PLAY_AREA_LEFT, global_1.Global.PLAY_AREA_TOP + global_1.Global.PLAY_AREA_HEIGHT);
});
define("lib/actor", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("lib/player_bullet", ["require", "exports", "lib/global", "lib/player"], function (require, exports, global_2, player_1) {
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
define("lib/player", ["require", "exports", "lib/vector", "lib/global", "lib/input", "lib/player_bullet"], function (require, exports, vector_1, global_3, input_1, player_bullet_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Player = void 0;
    class Player {
        constructor() {
            this.powerLevel = 0;
            this.fireCooldown = 0;
            this.location = new vector_1.Vector(Player.START_X, Player.START_Y);
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
        collectPowerItem() {
            this.powerLevel = Math.min(40, this.powerLevel + 1);
        }
        collectPointItem(game) {
            game.score += (this.location.y / global_3.Global.PLAY_AREA_HEIGHT) * 1000;
        }
        get playerLeftBulletSpawn() {
            return this.location.add(new vector_1.Vector(-Player.BULLET_OFFSET_SPAWN, 0));
        }
        get playerRightBulletSpawn() {
            return this.location.add(new vector_1.Vector(Player.BULLET_OFFSET_SPAWN, 0));
        }
        collectItems(game) {
            game.items.forEach(i => i.chasePlayer());
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
        spawnCenterStream(game) {
            game.playerBullets.push(new player_bullet_1.PlayerBullet(this.location, vector_1.Vector.UP));
        }
        spawnSideStreams(game, spreadAngle) {
            game.playerBullets.push(new player_bullet_1.PlayerBullet(this.playerLeftBulletSpawn, new vector_1.Vector(-spreadAngle, 1)));
            game.playerBullets.push(new player_bullet_1.PlayerBullet(this.playerRightBulletSpawn, new vector_1.Vector(spreadAngle, 1)));
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
            this.fireCooldown = Math.max(this.fireCooldown - msSinceLastFrame, 0);
            if (input_1.Input.SHOOT.held) {
                if (this.fireCooldown == 0) {
                    this.spawnPlayerBullets(game);
                    this.fireCooldown = Player.FIRE_RATE;
                }
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
                            return vector_1.Vector.DOWN_LEFT;
                        case 1:
                            return vector_1.Vector.DOWN_RIGHT;
                        case 0:
                            return vector_1.Vector.DOWN;
                    }
                case 1:
                    switch (horizontal) {
                        case -1:
                            return vector_1.Vector.UP_LEFT;
                        case 1:
                            return vector_1.Vector.UP_RIGHT;
                        case 0:
                            return vector_1.Vector.UP;
                    }
                case 0:
                    switch (horizontal) {
                        case -1:
                            return vector_1.Vector.LEFT;
                        case 1:
                            return vector_1.Vector.RIGHT;
                    }
            }
            return vector_1.Vector.ZERO;
        }
        moveSpeed(msSinceLastFrame) {
            return (input_1.Input.FOCUS.held ? Player.FOCUS_SPEED : Player.FAST_SPEED) * msSinceLastFrame;
        }
        pushIntoBounds(location) {
            let newLocation = location;
            if (newLocation.x - Player.GRAZEBOX_RADIUS < 0) {
                newLocation = new vector_1.Vector(Player.GRAZEBOX_RADIUS, newLocation.y);
            }
            if (newLocation.y - Player.GRAZEBOX_RADIUS < 0) {
                newLocation = new vector_1.Vector(newLocation.x, Player.GRAZEBOX_RADIUS);
            }
            if (newLocation.x + Player.GRAZEBOX_RADIUS >= global_3.Global.PLAY_AREA_WIDTH) {
                newLocation = new vector_1.Vector(global_3.Global.PLAY_AREA_WIDTH - Player.GRAZEBOX_RADIUS, newLocation.y);
            }
            if (newLocation.y + Player.GRAZEBOX_RADIUS >= global_3.Global.PLAY_AREA_HEIGHT) {
                newLocation = new vector_1.Vector(newLocation.x, global_3.Global.PLAY_AREA_HEIGHT - Player.GRAZEBOX_RADIUS);
            }
            return newLocation;
        }
        collides(otherLocation, otherRadiusSquared) {
            return this.location.distanceSquared(otherLocation) <= this.radiusSquared + otherRadiusSquared;
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
define("lib/item", ["require", "exports", "lib/vector"], function (require, exports, vector_2) {
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
            this.velocity = new vector_2.Vector(spread, Item.SPAWN_VERTICAL_SPEED);
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
            this.velocity = new vector_2.Vector(newVelocity.x * Item.SPREAD_REDUCTION, newVelocity.y);
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
    Item.ACCELERATION = new vector_2.Vector(0, -0.001);
    Item.MAX_VELOCITY = new vector_2.Vector(0, -5);
    Item.CHASE_SPEED = 0.40;
    Item.SPAWN_VERTICAL_SPEED = 1;
    Item.SPAWN_SPREAD = 1;
    Item.SPREAD_REDUCTION = 0.99;
    class PowerItem extends Item {
        get color() {
            return "red";
        }
        onCollect(game) {
            game.player.collectPowerItem();
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
define("lib/game", ["require", "exports", "lib/global", "lib/input", "lib/item", "lib/player", "lib/vector"], function (require, exports, global_4, input_2, item_1, player_2, vector_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Game = void 0;
    var MODE;
    (function (MODE) {
        MODE["PLAY"] = "PLAY";
        MODE["GAME_OVER"] = "GAME OVER";
    })(MODE || (MODE = {}));
    class Game {
        constructor() {
            this.frameTime = Date.now();
            this.debugItemSpawnTime = 0;
            this.msSinceLastFrame = 0;
            this.mode = MODE.PLAY;
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
            if (input_2.Input.DEBUG_SPAWN_ITEM.held) {
                if (100 <= this.frameTime - this.debugItemSpawnTime) {
                    if (Math.random() < 0.5) {
                        this.spawnPowerItem(this.player.location.add(new vector_3.Vector(0, 200)));
                    }
                    else {
                        this.spawnPointItem(this.player.location.add(new vector_3.Vector(0, 200)));
                    }
                    this.debugItemSpawnTime = Date.now();
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
        draw() {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = "black";
            this.ctx.fillRect(global_4.Global.PLAY_AREA_LEFT, global_4.Global.PLAY_AREA_TOP, global_4.Global.PLAY_AREA_WIDTH, global_4.Global.PLAY_AREA_HEIGHT);
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
            input_2.Input.onFrameEnd();
            this.draw();
            window.requestAnimationFrame(this.step.bind(this));
        }
    }
    exports.Game = Game;
});
define("script", ["require", "exports", "lib/game"], function (require, exports, game_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let game = new game_1.Game();
    window.requestAnimationFrame(game.step.bind(game));
});
