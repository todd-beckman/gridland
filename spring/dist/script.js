define("lib/util/global", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Global = void 0;
    class Global {
        static ROWTOP(row) {
            return this.PLAY_AREA_HEIGHT - Math.floor(row * this.GRID_CELL_SIZE);
        }
    }
    exports.Global = Global;
    Global.PLAY_AREA_WIDTH = 600;
    Global.PLAY_AREA_HEIGHT = 600;
    Global.GRID_CELL_SIZE = 50;
    Global.GRID_ROWS = Global.PLAY_AREA_HEIGHT - Global.GRID_CELL_SIZE;
    Global.SCREEN_WIDTH = 800;
    Global.PLAYER_AREA_BACKGROUND_STYLE = "black";
    Global.HUD_AREA_BACKGROUND_STYLE = "rgb(192,192,192)";
    Global.MAX_FRAMEFRATE = 60 / 1000;
    Global.GRAVITY_PER_MS = 0.05;
    Global.HUD_TOP = 20;
    Global.HUD_LEFT = Global.PLAY_AREA_WIDTH + 5;
    Global.HUD_ROW_HEIGHT = Global.PLAY_AREA_HEIGHT / 20;
    Global.CAMERA_SPEED_PER_MS = 0.2;
    Global.GOAL_CAMERA_FOCUS_RIGHT = -Global.PLAY_AREA_WIDTH / 4;
    Global.GOAL_CAMERA_FOCUS_LEFT = -3 * Global.PLAY_AREA_WIDTH / 4;
    Global.BOUND_CAMERA_FOCUS_RIGHT = -Global.PLAY_AREA_WIDTH / 2;
    Global.BOUND_CAMERA_FOCUS_LEFT = -Global.PLAY_AREA_WIDTH / 2;
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
                case "KeyD":
                case "ArrowRight":
                    Input.inputs.get(Input.RIGHT.id).applyChange(value);
                    break;
                case "KeyA":
                case "ArrowLeft":
                    Input.inputs.get(Input.LEFT.id).applyChange(value);
                    break;
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
    Input.JUMP = new Input("SPACE");
    Input.LEFT = new Input("LEFT");
    Input.RIGHT = new Input("RIGHT");
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
        constructor(left, top, width, height) {
            this.left = left;
            this.top = top;
            this.width = width;
            this.height = height;
        }
        get right() {
            return this.left + this.width;
        }
        get bottom() {
            return this.top + this.height;
        }
        get location() {
            return new vector_1.Vector(this.left, this.top);
        }
        get center() {
            return new vector_1.Vector(this.left + this.width / 2, this.top + this.height / 2);
        }
        /**
         * Returns a new location with the same width and height with a location offset from the input.
         */
        add(offset) {
            return new Rectangle(this.left + offset.x, this.top + offset.y, this.width, this.height);
        }
        addX(x) {
            return new Rectangle(this.left + x, this.top, this.width, this.height);
        }
        addY(y) {
            return new Rectangle(this.left, this.top + y, this.width, this.height);
        }
        inXInterval(xmin, xmax) {
            return this.left >= xmin && this.left <= xmax ||
                this.right >= xmin && this.right <= xmax ||
                xmin >= this.left && xmin <= this.right ||
                xmax >= this.left && xmax <= this.right;
        }
        inYInterval(ymin, ymax) {
            return this.top >= ymin && this.top <= ymax ||
                this.bottom >= ymin && this.bottom <= ymax ||
                ymin >= this.top && ymin <= this.top ||
                ymax >= this.bottom && ymax <= this.bottom;
        }
        collides(other) {
            return this.inXInterval(other.left, other.right) && this.inYInterval(other.top, other.bottom);
        }
        draw(ctx, camera, color) {
            ctx.fillStyle = color;
            ctx.fillRect(Math.floor(this.left - camera.x), Math.floor(this.top - camera.y), this.width, this.height);
        }
    }
    exports.Rectangle = Rectangle;
    Rectangle.PLAY_AREA = new Rectangle(0, 0, global_2.Global.PLAY_AREA_WIDTH, global_2.Global.PLAY_AREA_HEIGHT);
    Rectangle.HUD_AREA = new Rectangle(global_2.Global.PLAY_AREA_WIDTH, 0, 800 - global_2.Global.PLAY_AREA_WIDTH, global_2.Global.PLAY_AREA_HEIGHT);
});
define("lib/actor/actor", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Actor = void 0;
    class Actor {
        step(msSinceLastFrame) { }
        draw(ctx, camera) { }
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
            this.region = location;
            this.velocity = velocity;
            this.lifespanMS = lifespanMS;
        }
        draw(ctx, camera) {
            this.region.draw(ctx, camera, this.color);
        }
        step(msSinceLastFrame) {
            this.timeSinceSpawn += msSinceLastFrame;
            this.region = this.region.add(this.velocity);
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
            this.region = new rectangle_1.Rectangle(0, 0, 0, 0);
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
        draw(ctx, camera) {
            this.particles.forEach(particle => particle.draw(ctx, camera));
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
                    this.particles.push(new Particle(this.color, new rectangle_1.Rectangle(this.location.x, this.location.y, ParticleSystem.PARTICLE_SIZE, ParticleSystem.PARTICLE_SIZE), velocity, this.particleLifespanMs));
                }
            }
        }
    }
    exports.ParticleSystem = ParticleSystem;
    ParticleSystem.PARTICLE_SIZE = 3;
});
define("lib/actor/player", ["require", "exports", "lib/util/global", "lib/util/input", "lib/util/particles", "lib/util/rectangle", "lib/util/vector", "lib/actor/actor"], function (require, exports, global_3, input_1, particles_1, rectangle_2, vector_3, actor_2) {
    "use strict";
    var _a;
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
            this.lastFacingLeft = false;
            this.velocity = vector_3.Vector.ZERO;
            this.landed = false;
            this.pSpeed = false;
            this.game = game;
            this.region = _a.START_LOCATION;
        }
        get canJump() {
            return this.velocity.y <= 0 && this.velocity.y > -0.1;
        }
        get acceleration() {
            let acceleration = new vector_3.Vector(0, global_3.Global.GRAVITY_PER_MS);
            if (input_1.Input.JUMP.held == 1 && this.canJump) {
                acceleration = acceleration.addY(_a.JUMP_SPEED_PER_MS);
                this.game.doJump();
                this.landed = false;
            }
            if ((input_1.Input.RIGHT.held == 0) == (input_1.Input.LEFT.held == 0)) {
                if (this.velocity.x < 0) {
                    acceleration = acceleration.addX(_a.HORIZONTAL_DECELERATION_PER_MS);
                }
                else if (this.velocity.x > 0) {
                    acceleration = acceleration.addX(-_a.HORIZONTAL_DECELERATION_PER_MS);
                }
            }
            if (input_1.Input.RIGHT.held && !input_1.Input.LEFT.held) {
                if (this.velocity.y == 0 || this.velocity.x <= 0) {
                    acceleration = acceleration.addX(_a.HORIZONTAL_ACCELERATION_PER_MS);
                }
                this.lastFacingLeft = false;
            }
            if (input_1.Input.LEFT.held && !input_1.Input.RIGHT.held) {
                if (this.velocity.y == 0 || this.velocity.x >= 0) {
                    acceleration = acceleration.addX(-_a.HORIZONTAL_ACCELERATION_PER_MS);
                }
                this.lastFacingLeft = true;
            }
            return acceleration;
        }
        clampVelocity(velocity) {
            if (velocity.x > _a.MAX_SPEED_PERS_MS) {
                this.pSpeed = true;
                return new vector_3.Vector(_a.MAX_SPEED_PERS_MS, velocity.y);
            }
            else if (velocity.x < -_a.MAX_SPEED_PERS_MS) {
                this.pSpeed = true;
                return new vector_3.Vector(-_a.MAX_SPEED_PERS_MS, velocity.y);
            }
            this.pSpeed = false;
            if (Math.abs(velocity.x) < _a.MIN_SPEED_PERS_MS) {
                return new vector_3.Vector(0, velocity.y);
            }
            return velocity;
        }
        findNextLocation() {
            let acceptedRegion = this.region;
            let xStep = this.velocity.x / _a.COLLISION_SAMPLES;
            let yStep = this.velocity.y / _a.COLLISION_SAMPLES;
            let stopX = false;
            let stopY = false;
            for (let i = 1; i <= _a.COLLISION_SAMPLES; i++) {
                if (stopX && stopY) {
                    break;
                }
                let newLocation = acceptedRegion.addX(xStep);
                let candidateWalls = this.game.wallsInXInterval(newLocation.left, newLocation.right);
                if (candidateWalls.some(wall => {
                    return newLocation.collides(wall.region);
                })) {
                    stopX = true;
                    this.velocity = new vector_3.Vector(0, this.velocity.y);
                    newLocation = acceptedRegion;
                }
                else {
                    acceptedRegion = newLocation;
                }
                newLocation = newLocation.addY(yStep);
                if (candidateWalls.some(wall => newLocation.collides(wall.region))) {
                    stopY = true;
                    this.velocity = new vector_3.Vector(this.velocity.x, 0);
                    newLocation = acceptedRegion;
                }
                else {
                    acceptedRegion = newLocation;
                }
            }
            return acceptedRegion;
        }
        step(msSinceLastFrame) {
            if (this.region.top >= global_3.Global.PLAY_AREA_HEIGHT) {
                this.game.gameOver();
            }
            let wasLanded = this.landed;
            this.velocity = this.clampVelocity(this.velocity.add(this.acceleration.scale(msSinceLastFrame)));
            let newRegion = this.findNextLocation();
            if (this.region.left == newRegion.left) {
                this.velocity = new vector_3.Vector(0, this.velocity.y);
            }
            if (this.region.top == newRegion.top) {
                this.velocity = new vector_3.Vector(this.velocity.x, 0);
                this.landed = true;
            }
            if (this.landed && !wasLanded) {
                this.spawnLandingDust();
            }
            if (this.pSpeed && this.velocity.y == 0) {
                this.spawnSprintDust();
            }
            this.region = newRegion;
        }
        spawnSprintDust() {
            if (this.velocity.x > 0) {
                this.game.spawnParticleSystem(new particles_1.ParticleSystem("yellow", 5, 50, 100, new vector_3.Vector(this.region.left, this.region.bottom), vector_3.Vector.ZERO, -Math.PI * 7 / 8, -Math.PI, 6));
            }
            else {
                this.game.spawnParticleSystem(new particles_1.ParticleSystem("yellow", 5, 50, 100, new vector_3.Vector(this.region.right, this.region.bottom), vector_3.Vector.ZERO, 0, -Math.PI / 8, 6));
            }
        }
        spawnLandingDust() {
            this.game.spawnParticleSystem(new particles_1.ParticleSystem("white", 10, 50, 100, new vector_3.Vector(this.region.right, this.region.bottom), vector_3.Vector.ZERO, 0, -Math.PI / 4, 4.5));
            this.game.spawnParticleSystem(new particles_1.ParticleSystem("white", 10, 50, 100, new vector_3.Vector(this.region.left, this.region.bottom), vector_3.Vector.ZERO, -Math.PI * 3 / 4, -Math.PI, 4.5));
        }
        draw(ctx, camera) {
            this.region.draw(ctx, camera, "red");
        }
    }
    exports.Player = Player;
    _a = Player;
    Player.COLOR = "red";
    Player.SIZE = 45;
    Player.START_HORIZONTAL = global_3.Global.PLAY_AREA_WIDTH / 4 - _a.SIZE / 2;
    Player.START_VERTICAL = global_3.Global.PLAY_AREA_HEIGHT * 2 / 4;
    Player.START_LOCATION = new rectangle_2.Rectangle(_a.START_HORIZONTAL, _a.START_VERTICAL, _a.SIZE, _a.SIZE);
    Player.JUMP_SPEED_PER_MS = -1.0;
    Player.COLLISION_SAMPLES = 4;
    Player.HORIZONTAL_ACCELERATION_PER_MS = 0.01;
    Player.HORIZONTAL_DECELERATION_PER_MS = 0.01;
    Player.MAX_SPEED_PERS_MS = 5;
    Player.MIN_SPEED_PERS_MS = 0.1;
});
define("lib/actor/wall", ["require", "exports", "lib/util/global", "lib/actor/actor"], function (require, exports, global_4, actor_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Wall = void 0;
    class Wall extends actor_3.Actor {
        constructor(game, region, color) {
            super();
            this.game = game;
            this.region = region;
            this.color = color === undefined ? Wall.COLOR : color;
        }
        draw(ctx, camera) {
            this.region.draw(ctx, camera, this.color);
        }
    }
    exports.Wall = Wall;
    Wall.WIDTH = global_4.Global.GRID_CELL_SIZE;
    Wall.WALL_MIN_HEIGHT = 100;
    Wall.COLOR = "brown";
});
define("lib/level/level", ["require", "exports", "lib/actor/wall", "lib/util/global", "lib/util/rectangle"], function (require, exports, wall_1, global_5, rectangle_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Level = void 0;
    class Level {
        get nextLevel() { return null; }
        load(game) {
            this.walls.forEach((wallList, rowNum) => {
                for (let wall of wallList) {
                    game.walls.push(new wall_1.Wall(game, new rectangle_3.Rectangle(wall_1.Wall.WIDTH * wall, global_5.Global.ROWTOP(rowNum + 1), wall_1.Wall.WIDTH, wall_1.Wall.WIDTH), "green"));
                }
            });
        }
    }
    exports.Level = Level;
});
define("lib/level/level0", ["require", "exports", "lib/level/level"], function (require, exports, level_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Level0 = void 0;
    class Level0 extends level_1.Level {
        constructor() {
            super(...arguments);
            this.walls = new Map([
                // This is super unreadable lol
                [2, [5, 7]],
                [1, [4, 5, 6, 7]],
                [0, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]],
            ]);
        }
    }
    exports.Level0 = Level0;
});
define("lib/util/fps", ["require", "exports", "lib/util/with_cooldown"], function (require, exports, with_cooldown_2) {
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
            this.everySecond = new with_cooldown_2.WithCooldown(1000);
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
            ctx.fillStyle = "gray";
            ctx.font = "12pt courier";
            ctx.fillText("FPS: " + this.display, FPS.DRAW_LEFT, FPS.DRAW_TOP);
        }
    }
    exports.FPS = FPS;
    FPS.DRAW_LEFT = 5;
    FPS.DRAW_TOP = 15;
});
define("lib/game", ["require", "exports", "lib/actor/player", "lib/level/level0", "lib/util/fps", "lib/util/global", "lib/util/input", "lib/util/rectangle", "lib/util/vector", "lib/util/with_cooldown"], function (require, exports, player_1, level0_1, fps_1, global_6, input_2, rectangle_4, vector_4, with_cooldown_3) {
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
        lerpBounceY(msSinceLastFrame) {
            if (!this.bouncing) {
                return 0;
            }
            this.bounceProgressMs += msSinceLastFrame;
            let percentProgress = this.bounceProgressMs / Game.JUMP_DURATION_MS;
            if (percentProgress >= 1) {
                percentProgress = 1;
                this.bouncing = false;
                this.bounceProgressMs = 0;
                return 0;
            }
            let firstBounce = 0.7;
            if (percentProgress < firstBounce) {
                let magnitude = Math.sin(percentProgress / firstBounce * Math.PI);
                return (Game.JUMP_SCREEN_BOUNCE * magnitude);
            }
            let magnitude = Math.sin(percentProgress / (1 - firstBounce) * Math.PI);
            return (Game.JUMP_SCREEN_BOUNCE / 5 * magnitude);
        }
        constructor() {
            this.fps = new fps_1.FPS();
            this.blinkGameOver = new with_cooldown_3.WithCooldown(750);
            this.showGameOver = false;
            this.frameTime = 0;
            this.msSinceLastFrame = 0;
            this.mode = MODE.READY;
            this.highScore = 0;
            this.camera = vector_4.Vector.ZERO;
            this.bouncing = false;
            this.bounceProgressMs = 0;
            input_2.Input.init();
            this.canvas = document.getElementById("canvas");
            this.canvasContext = this.canvas.getContext("2d");
            if (window.innerWidth < global_6.Global.SCREEN_WIDTH ||
                window.innerHeight < global_6.Global.PLAY_AREA_HEIGHT) {
                let scaleWidth = window.innerWidth / global_6.Global.SCREEN_WIDTH;
                let scaleHeight = window.innerHeight / global_6.Global.PLAY_AREA_HEIGHT;
                let scale = Math.min(scaleHeight, scaleWidth);
                this.canvas.width *= scale;
                this.canvas.height *= scale;
                this.canvasContext.scale(scale, scale);
            }
            this.currentLevel = new level0_1.Level0();
            this.initalizeState();
            this.mode = MODE.READY;
            window.requestAnimationFrame(this.step.bind(this));
        }
        spawnParticleSystem(particleSystem) {
            this.particleSystems.push(particleSystem);
        }
        followPlayerCamera() {
            let playerCenter = this.player.region.center;
            let wantX = playerCenter.x +
                (this.player.lastFacingLeft ?
                    global_6.Global.GOAL_CAMERA_FOCUS_LEFT :
                    global_6.Global.GOAL_CAMERA_FOCUS_RIGHT);
            let boundX = playerCenter.x +
                (this.player.lastFacingLeft ?
                    global_6.Global.BOUND_CAMERA_FOCUS_LEFT :
                    global_6.Global.BOUND_CAMERA_FOCUS_RIGHT);
            let cameraOffset = this.msSinceLastFrame * global_6.Global.CAMERA_SPEED_PER_MS;
            let cameraX = this.camera.x;
            if (this.player.lastFacingLeft) {
                cameraX -= cameraOffset;
                if (cameraX < wantX) {
                    cameraX = wantX;
                }
                else if (cameraX > boundX) {
                    cameraX -= cameraOffset;
                }
            }
            else {
                cameraX += cameraOffset;
                if (cameraX > wantX) {
                    cameraX = wantX;
                }
                else if (cameraX < boundX) {
                    cameraX += cameraOffset;
                }
            }
            let cameraY = this.lerpBounceY(this.msSinceLastFrame);
            this.camera = new vector_4.Vector(cameraX, cameraY);
        }
        wallsInXInterval(xmin, xmax) {
            return this.walls.filter(wall => {
                return wall.region.inXInterval(xmin, xmax);
            });
        }
        doJump() {
            this.bouncing = true;
        }
        initalizeState() {
            this.score = 0;
            this.walls = [];
            this.particleSystems = [];
            this.player = new player_1.Player(this);
            this.mode = MODE.PLAY;
            this.currentLevel.load(this);
        }
        stepReady() {
            if (input_2.Input.JUMP.held) {
                this.initalizeState();
            }
        }
        stepGame() {
            this.player.step(this.msSinceLastFrame);
            for (let i = this.particleSystems.length - 1; i >= 0; i--) {
                this.particleSystems[i].step(this.msSinceLastFrame);
                if (this.particleSystems[i].dead) {
                    this.particleSystems.splice(i, 1);
                }
            }
            this.followPlayerCamera();
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
            let buffer = document.createElement("canvas");
            buffer.width = global_6.Global.PLAY_AREA_WIDTH;
            buffer.height = global_6.Global.PLAY_AREA_HEIGHT;
            let ctx = buffer.getContext("2d");
            rectangle_4.Rectangle.PLAY_AREA.draw(ctx, vector_4.Vector.ZERO, global_6.Global.PLAYER_AREA_BACKGROUND_STYLE);
            this.player.draw(ctx, this.camera);
            if (this.mode == MODE.PLAY) {
                this.walls.forEach(wall => wall.draw(ctx, this.camera));
                this.particleSystems.forEach(particleSystem => particleSystem.draw(ctx, this.camera));
            }
            this.drawHUD(ctx);
            this.fps.draw(ctx);
            this.canvasContext.drawImage(buffer, 0, 0);
        }
        drawHUD(ctx) {
            rectangle_4.Rectangle.HUD_AREA.draw(ctx, vector_4.Vector.ZERO, global_6.Global.HUD_AREA_BACKGROUND_STYLE);
            ctx.font = "12pt courier";
            switch (this.mode) {
                case MODE.READY:
                case MODE.GAME_OVER:
                    ctx.fillStyle = "white";
                    ctx.fillText("Touch or spacebar to start.", 50, global_6.Global.PLAY_AREA_HEIGHT / 2 - 100);
                    break;
                case MODE.GAME_OVER:
                    if (this.showGameOver) {
                        ctx.fillStyle = "red";
                        ctx.fillText("GAME OVER", 20, 20);
                    }
                    break;
            }
        }
        gameOver() {
            this.mode = MODE.GAME_OVER;
        }
        // Public only for access from script.
        // There is probably a better way to do this.
        step(msSinceLoad) {
            let oldFrameTime = this.frameTime;
            this.frameTime = msSinceLoad;
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
            let frameDuration = window.performance.now() - this.frameTime;
            let waitForNextFrame = global_6.Global.MAX_FRAMEFRATE - frameDuration;
            window.setTimeout(() => window.requestAnimationFrame(this.step.bind(this)), waitForNextFrame);
        }
    }
    exports.Game = Game;
    Game.JUMP_DURATION_MS = 300;
    Game.JUMP_SCREEN_BOUNCE = 100;
});
define("script", ["require", "exports", "lib/game"], function (require, exports, game_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const game = new game_1.Game();
});
