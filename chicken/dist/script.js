define("lib/util/global", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Global = void 0;
    exports.Global = Object.freeze({
        PLAY_AREA_WIDTH: 600,
        PLAY_AREA_HEIGHT: 600,
        PLAYER_AREA_BACKGROUND_STYLE: "black",
        HUD_AREA_BACKGROUND_STYLE: "rgb(192,192,192)",
        GRAVITY_PER_MS: 0.8,
        CHICKEN_SPRITE: function () {
            return document.getElementById("chicken");
        },
        CHICKEN_FLY_SPRITE: function () {
            return document.getElementById("chicken-fly");
        },
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
     * If multiple input buttons are mapped to an input, they will
     * compete for onkeyup and onkeydown.
     *
     * {@link init()} must be called exactly once globally.
     */
    class Input {
        constructor(id) {
            this.removeAfterFrame = false;
            this.framesHeld = 0;
            this.id = id;
            Input.inputs.set(id, this);
        }
        static keyHandler(e) {
            if (e.defaultPrevented || e.repeat) {
                return;
            }
            let value = e.type == "keydown" ? 1 : 0;
            switch (e.code) {
                case "Space":
                    Input.inputs.get(Input.JUMP.id).applyChange(value);
                    break;
                case "KeyU":
                    Input.inputs.get(Input.DEBUG_ACTION_1.id).applyChange(value);
                    break;
                default:
                    return;
            }
        }
        static touchHandler(e) {
            if (e.defaultPrevented || e.repeat) {
                return;
            }
            let value = e.type == "touchstart" ? 1 : 0;
            Input.inputs.get(Input.JUMP.id).applyChange(value);
            e.preventDefault();
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
            window.addEventListener("touchstart", this.touchHandler.bind(this), true);
            window.addEventListener("touchend", this.touchHandler.bind(this), true);
            Input.initCalled = true;
        }
        /**
         * The number of frames this input has been held.
         */
        get held() {
            return this.framesHeld;
        }
        applyChange(value) {
            if (value == 0 && this.framesHeld == 1) {
                this.removeAfterFrame = true;
            }
            else {
                this.framesHeld = value;
                this.removeAfterFrame = false;
            }
        }
        increment() {
            if (this.removeAfterFrame && this.framesHeld > 1) {
                this.framesHeld = 0;
            }
            if (this.framesHeld > 0) {
                this.framesHeld++;
            }
        }
        /**
         * Must be called after each frame. The duration of the frame is irrelevant.
         */
        static onFrameEnd() {
            this.inputs.forEach((input) => input.increment());
        }
    }
    exports.Input = Input;
    Input.initCalled = false;
    Input.inputs = new Map();
    /**
     * Tracks how many frame any Jump input has been held.
     */
    Input.JUMP = new Input("SPACE");
    Input.DEBUG_ACTION_1 = new Input("DEBUG_ACTION_1");
    Input.DEBUG_ACTION_2 = new Input("DEBUG_ACTION_2");
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
        rotate(radians) {
            return new Vector(Math.cos(radians), Math.sin(radians));
        }
        static inDirection(radians) {
            return Vector.RIGHT.rotate(radians);
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
    Vector.RENDER_ORIGIN = new Vector(0, global_1.Global.PLAY_AREA_HEIGHT);
});
define("lib/util/rectangle", ["require", "exports", "lib/util/global", "lib/util/vector"], function (require, exports, global_2, vector_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Rectangle = void 0;
    /**
     * A geometric rectangle.
     *
     * Represented by a 2d Vector for the upper-left corner as well as the width and height.
     */
    class Rectangle {
        constructor(location, width, height) {
            this.location = location;
            this.width = width;
            this.height = height;
        }
        get left() {
            return this.location.x;
        }
        get top() {
            return this.location.y;
        }
        get right() {
            return this.location.x + this.width;
        }
        get bottom() {
            return this.location.y + this.height;
        }
        /**
         * Returns a new location with the same width and height with a location offset from the input.
         */
        add(offset) {
            return new Rectangle(this.location.add(offset), this.width, this.height);
        }
        addX(offset) {
            return new Rectangle(this.location.add(new vector_1.Vector(offset, 0)), this.width, this.height);
        }
        /**
         * Returns whether this rectangle overlaps the other.
         */
        collides(other) {
            let otherBoundsHorizontally = this.left >= other.left && this.left <= other.right ||
                this.right >= other.left && this.right <= other.right;
            let otherBoundsVertically = this.top >= other.top && this.top <= other.bottom ||
                this.bottom >= other.top && this.bottom <= other.bottom;
            return otherBoundsHorizontally && otherBoundsVertically;
        }
        /**
         * Draws this rectangle to the canvas with the given fillStyle.
         */
        draw(ctx, color) {
            ctx.fillStyle = color;
            ctx.fillRect(this.location.x, this.location.y, this.width, this.height);
        }
    }
    exports.Rectangle = Rectangle;
    Rectangle.PLAY_AREA = new Rectangle(vector_1.Vector.ZERO, global_2.Global.PLAY_AREA_WIDTH, global_2.Global.PLAY_AREA_HEIGHT);
    Rectangle.HUD_AREA = new Rectangle(new vector_1.Vector(global_2.Global.PLAY_AREA_WIDTH, 0), 800 - global_2.Global.PLAY_AREA_WIDTH, global_2.Global.PLAY_AREA_HEIGHT);
});
define("lib/actor/actor", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Actor = void 0;
    /**
     * Any game object.
     */
    class Actor {
    }
    exports.Actor = Actor;
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
            this.cooldownMs = 0;
            this.setCooldown = cooldownMs;
        }
        /**
         * Returns whether the cooldown has finished after the provided time has passed.
         * If so, the cooldown is also reset and begins immediately.
         *
         * @param msSinceLastFrame
         * @returns Whether the cooldown is over.
         */
        get checkAndTrigger() {
            if (this.cooldownMs > 0) {
                return false;
            }
            this.cooldownMs = this.setCooldown;
            return true;
        }
        step(msSinceLastFrame) {
            this.cooldownMs = Math.max(0, this.cooldownMs - msSinceLastFrame);
            msSinceLastFrame;
        }
    }
    exports.WithCooldown = WithCooldown;
});
define("lib/util/particles", ["require", "exports", "lib/actor/actor", "lib/util/rectangle", "lib/util/vector", "lib/util/with_cooldown"], function (require, exports, actor_1, rectangle_1, vector_2, with_cooldown_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ParticleSystem = void 0;
    class Particle extends actor_1.Actor {
        constructor(color, location, velocity, lifespanMS) {
            super();
            this.timeSinceSpawn = 0;
            this.color = color;
            this.location = location;
            this.velocity = velocity;
            this.lifespanMS = lifespanMS;
        }
        draw(ctx) {
            this.location.draw(ctx, this.color);
        }
        step(msSinceLastFrame) {
            this.timeSinceSpawn += msSinceLastFrame;
            this.location = this.location.add(this.velocity);
        }
        get dead() {
            return this.timeSinceSpawn >= this.lifespanMS;
        }
    }
    class ParticleSystem extends actor_1.Actor {
        constructor(
        // The fillStyle to render individual particles
        color, 
        // How many particles this system will spawn total.
        numParticles, 
        // How long this system lives.
        // This is used to determine how frequently to spawn particles.
        // A particle system is not considered dead until all particles have been spawned and are considered dead.
        lifespanMs, 
        // How long particles live
        particleLifespanMs, 
        // The starting location of this system's spawner.
        location, 
        // Velocity of this system's spawner.
        velocity, 
        // The range of directions in radians.
        directionRadiansMin, directionRadiansMax, 
        // Speed of spawned particles
        particleSpeed) {
            super();
            this.particles = [];
            this.timeSinceSpawn = 0;
            this.color = color;
            this.velocity = velocity;
            this.location = location;
            this.particleLifespanMs = particleLifespanMs;
            this.numParticlesToSpawn = numParticles;
            this.particleSpawnTime = new with_cooldown_1.WithCooldown(lifespanMs / numParticles);
            this.directionRadiansMin = directionRadiansMin;
            this.directionRadiansMax = directionRadiansMax;
            this.particleSpeed = particleSpeed;
        }
        draw(ctx) {
            this.particles.forEach(particle => particle.draw(ctx));
        }
        get dead() {
            return this.numParticlesToSpawn == 0 && this.particles.length == 0;
        }
        step(msSinceLastFrame) {
            this.timeSinceSpawn += msSinceLastFrame;
            this.location = this.location.add(this.velocity.scale(msSinceLastFrame));
            for (let i = this.particles.length - 1; i >= 0; i--) {
                this.particles[i].step(msSinceLastFrame);
                if (this.particles[i].dead) {
                    this.particles.splice(i, 1);
                }
            }
            if (this.numParticlesToSpawn > 0) {
                this.particleSpawnTime.step(msSinceLastFrame);
                if (this.particleSpawnTime.checkAndTrigger) {
                    this.numParticlesToSpawn--;
                    let angle = this.directionRadiansMin + (this.directionRadiansMax - this.directionRadiansMin) * Math.random();
                    let velocity = vector_2.Vector.RIGHT.rotate(angle).scale(this.particleSpeed);
                    // console.log("spawning particle with velocity (" + velocity.x + "," + velocity.y + ")");
                    console.log("spawning particle at location (" + this.location.x + "," + this.location.y + ")");
                    this.particles.push(new Particle(this.color, new rectangle_1.Rectangle(this.location, ParticleSystem.PARTICLE_SIZE, ParticleSystem.PARTICLE_SIZE), velocity, this.particleLifespanMs));
                }
            }
        }
    }
    exports.ParticleSystem = ParticleSystem;
    ParticleSystem.PARTICLE_SIZE = 5;
});
define("lib/actor/player", ["require", "exports", "lib/util/global", "lib/util/input", "lib/util/particles", "lib/util/rectangle", "lib/util/vector", "lib/util/with_cooldown", "lib/actor/actor"], function (require, exports, global_3, input_1, particles_1, rectangle_2, vector_3, with_cooldown_2, actor_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Player = void 0;
    /**
     * The player of the game.
     *
     * It is considered a singleton, as the Game is a singleton and contains exactly one reference to the player.
     *
     * The player's step function is responsible for:
     * - Determining the end state of the game.
     * - Responding to any user input.
     */
    class Player extends actor_2.Actor {
        constructor(game) {
            super();
            this.color = Player.COLOR;
            this.jumpSpeed = new with_cooldown_2.WithCooldown(100);
            this.velocity = vector_3.Vector.ZERO;
            this.loc = new rectangle_2.Rectangle(new vector_3.Vector(Player.START_HORIZONTAL, Player.START_VERTICAL), Player.RADIUS, Player.RADIUS);
            this.game = game;
            this.loc = Player.START_LOCATION;
        }
        get location() {
            return this.loc;
        }
        get hurtbox() {
            return new rectangle_2.Rectangle(this.loc.location.add(new vector_3.Vector(Player.HURTBOX_SHRINK, Player.HURTBOX_SHRINK)), Player.HURTBOX_SIZE, Player.HURTBOX_SIZE);
        }
        step(msSinceLastFrame) {
            if (this.location.bottom >= global_3.Global.PLAY_AREA_HEIGHT) {
                this.game.gameOver();
                return;
            }
            if (this.game.walls.some(wall => wall.collides(this.hurtbox))) {
                this.game.gameOver();
                return;
            }
            this.jumpSpeed.step(msSinceLastFrame);
            if (input_1.Input.JUMP.held == 1 && this.jumpSpeed.checkAndTrigger) {
                this.velocity = Player.JUMP_VELOCITY;
                this.game.spawnParticleSystem(new particles_1.ParticleSystem("red", 20, 250, 300, this.location.location.addX(2), Player.JETPACK_FLAME_SYTEM_VELOCITY, Player.JETPACK_FLAME_ANGLE_MIN, Player.JETPACK_FLAME_ANGLE_MAX, 5));
            }
            this.velocity = this.velocity.addY(global_3.Global.GRAVITY_PER_MS);
            let newLocation = this.loc.add(this.velocity);
            if (newLocation.location.y <= 0) {
                newLocation = new rectangle_2.Rectangle(new vector_3.Vector(newLocation.location.x, 0), newLocation.width, newLocation.height);
            }
            this.loc = newLocation;
        }
        draw(ctx) {
            let sprite = this.velocity.y < 0 ? global_3.Global.CHICKEN_FLY_SPRITE() : global_3.Global.CHICKEN_SPRITE();
            ctx.drawImage(sprite, this.location.left, this.location.top);
        }
    }
    exports.Player = Player;
    Player.COLOR = "red";
    Player.START_HORIZONTAL = global_3.Global.PLAY_AREA_WIDTH / 4;
    Player.START_VERTICAL = global_3.Global.PLAY_AREA_HEIGHT * 2 / 4;
    Player.RADIUS = 45;
    Player.START_LOCATION = new rectangle_2.Rectangle(new vector_3.Vector(Player.START_HORIZONTAL, Player.START_VERTICAL), Player.RADIUS, Player.RADIUS);
    Player.JUMP_VELOCITY = new vector_3.Vector(0, -11);
    Player.HURTBOX_SHRINK = 2;
    Player.HURTBOX_SIZE = Player.RADIUS - Player.HURTBOX_SHRINK * 2;
    Player.JETPACK_FLAME_ANGLE_MIN = Math.PI / 2;
    Player.JETPACK_FLAME_ANGLE_MAX = Math.PI * 3 / 4;
    Player.JETPACK_FLAME_SYTEM_VELOCITY = new vector_3.Vector(0, -0.1);
});
define("lib/actor/wall", ["require", "exports", "lib/util/global", "lib/util/rectangle", "lib/util/vector", "lib/actor/actor"], function (require, exports, global_4, rectangle_3, vector_4, actor_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Wall = void 0;
    class Wall extends actor_3.Actor {
        get location() {
            return this.lower;
        }
        constructor(game, startingX) {
            super();
            this.scoreReady = false;
            this.color = "green";
            this.game = game;
            this.upper = new rectangle_3.Rectangle(new vector_4.Vector(startingX, 0), Wall.WIDTH, 0);
            this.lower = this.upper;
        }
        setGap() {
            let gapActual = Wall.GAP_MIN + Math.random() * Wall.GAP_MAX;
            let upperHeight = gapActual;
            this.upper = new rectangle_3.Rectangle(new vector_4.Vector(Wall.SPAWN_X, 0), Wall.WIDTH, upperHeight);
            let lowerHeight = global_4.Global.PLAY_AREA_HEIGHT - Wall.GAP_SPAN - upperHeight;
            this.lower = new rectangle_3.Rectangle(new vector_4.Vector(Wall.SPAWN_X, global_4.Global.PLAY_AREA_HEIGHT - lowerHeight), Wall.WIDTH, lowerHeight);
            this.scoreReady = true;
        }
        collides(other) {
            return other.collides(this.upper) || other.collides(this.lower);
        }
        draw(ctx) {
            this.upper.draw(ctx, "purple");
            this.lower.draw(ctx, "green");
        }
        step(msSinceLastFrame) {
            let oldRight = this.location.right;
            this.upper = this.upper.addX(Wall.SPEED_PER_MS / msSinceLastFrame);
            this.lower = this.lower.addX(Wall.SPEED_PER_MS / msSinceLastFrame);
            let newRight = this.location.right;
            let scoreLine = this.game.player.location.left;
            if (this.scoreReady && oldRight > scoreLine && newRight <= scoreLine) {
                this.game.score++;
            }
            if (this.upper.location.x <= Wall.RESPAWN_X) {
                this.setGap();
            }
        }
    }
    exports.Wall = Wall;
    Wall.RESPAWN_X = -50;
    Wall.WIDTH = 50;
    Wall.SPAWN_X = global_4.Global.PLAY_AREA_WIDTH;
    Wall.SPEED_PER_MS = -50;
    Wall.WALL_MIN_HEIGHT = 100;
    Wall.GAP_SPAN = 200;
    Wall.GAP_MIN = Wall.WALL_MIN_HEIGHT;
    Wall.GAP_MAX = global_4.Global.PLAY_AREA_HEIGHT - 2 * Wall.WALL_MIN_HEIGHT - Wall.GAP_SPAN;
});
define("lib/util/fps", ["require", "exports", "lib/util/global", "lib/util/with_cooldown"], function (require, exports, global_5, with_cooldown_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FPS = void 0;
    /**
     * Utility to track the FPS of the game and draw the value to the desired location.
     */
    class FPS {
        constructor() {
            this.frameCount = 0;
            this.display = 0;
            this.everySecond = new with_cooldown_3.WithCooldown(1000);
        }
        update(msSinceLastFrame) {
            this.frameCount += 1;
            this.everySecond.step(msSinceLastFrame);
            if (this.everySecond.checkAndTrigger) {
                this.display = this.frameCount;
                this.frameCount = 0;
            }
        }
        draw(ctx) {
            ctx.fillStyle = "black";
            ctx.font = "20px courier";
            ctx.fillText("FPS: " + this.display, FPS.DRAW_LEFT, FPS.DRAW_TOP);
        }
    }
    exports.FPS = FPS;
    FPS.DRAW_LEFT = global_5.Global.PLAY_AREA_WIDTH + 20;
    FPS.DRAW_TOP = global_5.Global.PLAY_AREA_HEIGHT - 20;
});
define("lib/game", ["require", "exports", "lib/actor/player", "lib/actor/wall", "lib/util/fps", "lib/util/global", "lib/util/input", "lib/util/rectangle", "lib/util/with_cooldown"], function (require, exports, player_1, wall_1, fps_1, global_6, input_2, rectangle_4, with_cooldown_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Game = void 0;
    var MODE;
    (function (MODE) {
        MODE["READY"] = "READY";
        MODE["PLAY"] = "PLAY";
        MODE["GAME_OVER"] = "GAME OVER";
    })(MODE || (MODE = {}));
    class Game {
        constructor() {
            this.fps = new fps_1.FPS();
            this.blinkGameOver = new with_cooldown_4.WithCooldown(750);
            this.showGameOver = false;
            this.frameTime = 0;
            this.msSinceLastFrame = 0;
            this.mode = MODE.READY;
            this.highScore = 0;
            input_2.Input.init();
            this.canvas = document.getElementById("canvas");
            this.ctx = this.canvas.getContext("2d");
            this.initalizeState();
            this.mode = MODE.READY;
            window.requestAnimationFrame(this.step.bind(this));
        }
        spawnParticleSystem(particleSystem) {
            this.particleSystems.push(particleSystem);
        }
        initalizeState() {
            this.score = 0;
            this.walls = [];
            this.particleSystems = [];
            for (let i = 0; i < 3; i++) {
                this.walls.push(new wall_1.Wall(this, i * (global_6.Global.PLAY_AREA_WIDTH - wall_1.Wall.RESPAWN_X) / 3));
            }
            this.player = new player_1.Player(this);
            this.mode = MODE.PLAY;
        }
        stepReady() {
            if (input_2.Input.JUMP.held) {
                this.initalizeState();
                this.player.step(this.msSinceLastFrame);
            }
        }
        stepGame() {
            if (input_2.Input.DEBUG_ACTION_1.held) {
                return;
            }
            this.player.step(this.msSinceLastFrame);
            this.walls.forEach(wall => wall.step(this.msSinceLastFrame));
            for (let i = this.particleSystems.length - 1; i >= 0; i--) {
                this.particleSystems[i].step(this.msSinceLastFrame);
                if (this.particleSystems[i].dead) {
                    this.particleSystems.splice(i, 1);
                }
            }
        }
        stepGameOver() {
            this.blinkGameOver.step(this.msSinceLastFrame);
            if (this.blinkGameOver.checkAndTrigger) {
                this.showGameOver = !this.showGameOver;
            }
            if (input_2.Input.JUMP.held) {
                this.initalizeState();
                this.player.step(this.msSinceLastFrame);
            }
        }
        draw() {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            rectangle_4.Rectangle.PLAY_AREA.draw(this.ctx, global_6.Global.PLAYER_AREA_BACKGROUND_STYLE);
            this.player.draw(this.ctx);
            if (this.mode == MODE.PLAY) {
                this.walls.forEach(wall => wall.draw(this.ctx));
                this.particleSystems.forEach(particleSystem => particleSystem.draw(this.ctx));
            }
            this.drawHUD();
            this.fps.draw(this.ctx);
        }
        drawHUD() {
            rectangle_4.Rectangle.HUD_AREA.draw(this.ctx, global_6.Global.HUD_AREA_BACKGROUND_STYLE);
            this.ctx.font = "20px courier";
            let row = 0;
            this.ctx.fillStyle = "blue";
            this.ctx.fillText("Score:      " + this.score, Game.HUD_LEFT, Game.HUD_TOP + row * Game.HUD_ROW_HEIGHT);
            row++;
            this.ctx.fillStyle = "red";
            this.ctx.fillText("High Score: " + this.highScore, Game.HUD_LEFT, Game.HUD_TOP + row * Game.HUD_ROW_HEIGHT);
            row++;
            switch (this.mode) {
                case MODE.READY:
                case MODE.GAME_OVER:
                    this.ctx.fillStyle = "white";
                    this.ctx.fillText("Touch or spacebar to start.", 50, global_6.Global.PLAY_AREA_HEIGHT / 2 - 100);
                    break;
                case MODE.GAME_OVER:
                    if (this.showGameOver) {
                        this.ctx.fillStyle = "red";
                        this.ctx.fillText("GAME OVER", Game.HUD_LEFT, Game.HUD_TOP + row * Game.HUD_ROW_HEIGHT);
                    }
                    break;
            }
        }
        gameOver() {
            this.mode = MODE.GAME_OVER;
        }
        // Public only for access from script.
        // There is probably a better way to do this.
        step(msSinceLastFrame) {
            let oldFrameTime = this.frameTime;
            this.frameTime = msSinceLastFrame;
            this.msSinceLastFrame = this.frameTime - oldFrameTime;
            this.fps.update(this.msSinceLastFrame);
            switch (this.mode) {
                case MODE.READY:
                    this.stepReady();
                    break;
                case MODE.PLAY:
                    this.stepGame();
                    break;
                case MODE.GAME_OVER:
                    this.stepGameOver();
                    break;
            }
            this.highScore = Math.max(this.score, this.highScore);
            input_2.Input.onFrameEnd();
            this.draw();
            window.requestAnimationFrame(this.step.bind(this));
        }
    }
    exports.Game = Game;
    Game.HUD_TOP = 20;
    Game.HUD_LEFT = global_6.Global.PLAY_AREA_WIDTH + 5;
    Game.HUD_ROW_HEIGHT = global_6.Global.PLAY_AREA_HEIGHT / 20;
});
define("script", ["require", "exports", "lib/game"], function (require, exports, game_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const game = new game_1.Game();
});
