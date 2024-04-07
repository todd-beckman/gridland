import { Game } from "../game";
import { Global } from "../util/global";
import { Input } from "../util/input";
import { ParticleSystem } from "../util/particles";
import { Rectangle } from "../util/rectangle";
import { Vector } from "../util/vector";
import { WithCooldown } from "../util/with_cooldown";
import { Actor } from "./actor";

/**
 * The player of the game.
 * 
 * It is considered a singleton, as the Game is a singleton and contains exactly one reference to the player.
 * 
 * The player's step function is responsible for:
 * - Determining the end state of the game.
 * - Responding to any user input.
 */
export class Player extends Actor {
    static readonly COLOR: string = "red";

    private static readonly SIZE = 45;
    private static readonly START_HORIZONTAL = Global.PLAY_AREA_WIDTH / 4 - this.SIZE / 2;
    private static readonly START_VERTICAL = Global.PLAY_AREA_HEIGHT * 2 / 4;
    private static readonly START_LOCATION: Rectangle = new Rectangle(Player.START_HORIZONTAL, Player.START_VERTICAL, Player.SIZE, Player.SIZE);
    private static readonly JUMP_SPEED_PER_MS = -1.0;
    private static readonly COLLISION_SAMPLES = 4;

    private static readonly HORIZONTAL_ACCELERATION_PER_MS = 0.01;
    private static readonly HORIZONTAL_DECELERATION_PER_MS = 0.01;

    private static readonly MAX_SPEED_PERS_MS = 5;
    private static readonly MIN_SPEED_PERS_MS = 0.1;

    lastFacingLeft: boolean = false;
    velocity: Vector = Vector.ZERO;
    region: Rectangle;
    private landed: boolean = false;
    private pSpeed: boolean = false;

    private readonly game: Game;

    constructor(game: Game) {
        super();
        this.game = game;
        this.region = Player.START_LOCATION;
    }

    private get canJump(): boolean {
        return this.velocity.y <= 0 && this.velocity.y > -0.1;
    }

    private get acceleration(): Vector {
        let acceleration = new Vector(0, Global.GRAVITY_PER_MS);

        if (Input.JUMP.held == 1 && this.canJump) {
            acceleration = acceleration.addY(Player.JUMP_SPEED_PER_MS);
            this.game.doJump();
            this.landed = false;
        }
        if ((Input.RIGHT.held == 0) == (Input.LEFT.held == 0)) {
            if (this.velocity.x < 0) {
                acceleration = acceleration.addX(Player.HORIZONTAL_DECELERATION_PER_MS);
            } else if (this.velocity.x > 0) {
                acceleration = acceleration.addX(-Player.HORIZONTAL_DECELERATION_PER_MS);
            }
        }
        if (Input.RIGHT.held && !Input.LEFT.held) {
            if (this.velocity.y == 0 || this.velocity.x <= 0) {
                acceleration = acceleration.addX(Player.HORIZONTAL_ACCELERATION_PER_MS);
            }
            this.lastFacingLeft = false;
        }
        if (Input.LEFT.held && !Input.RIGHT.held) {
            if (this.velocity.y == 0 || this.velocity.x >= 0) {
                acceleration = acceleration.addX(-Player.HORIZONTAL_ACCELERATION_PER_MS);
            }
            this.lastFacingLeft = true;
        }
        return acceleration;
    }

    private clampVelocity(velocity: Vector): Vector {
        if (velocity.x > Player.MAX_SPEED_PERS_MS) {
            this.pSpeed = true;
            return new Vector(Player.MAX_SPEED_PERS_MS, velocity.y);
        } else if (velocity.x < -Player.MAX_SPEED_PERS_MS) {
            this.pSpeed = true;
            return new Vector(-Player.MAX_SPEED_PERS_MS, velocity.y);
        }
        this.pSpeed = false;
        if (Math.abs(velocity.x) < Player.MIN_SPEED_PERS_MS) {
            return new Vector(0, velocity.y);
        }
        return velocity;
    }

    private findNextLocation(): Rectangle {
        let acceptedRegion: Rectangle = this.region;
        let xStep = this.velocity.x / Player.COLLISION_SAMPLES;
        let yStep = this.velocity.y / Player.COLLISION_SAMPLES;

        let stopX = false;
        let stopY = false;

        for (let i = 1; i <= Player.COLLISION_SAMPLES; i++) {
            if (stopX && stopY) {
                break;
            }

            let newLocation = acceptedRegion.addX(xStep);
            let candidateWalls = this.game.wallsInXInterval(newLocation.left, newLocation.right);
            if (candidateWalls.some(wall => {
                return newLocation.collides(wall.region);
            })) {
                stopX = true;
                this.velocity = new Vector(0, this.velocity.y);
                newLocation = acceptedRegion;
            } else {
                acceptedRegion = newLocation;
            }

            newLocation = newLocation.addY(yStep);
            if (candidateWalls.some(wall => newLocation.collides(wall.region))) {
                stopY = true;
                this.velocity = new Vector(this.velocity.x, 0);
                newLocation = acceptedRegion;
            } else {
                acceptedRegion = newLocation;
            }

        }
        return acceptedRegion;
    }

    override step(msSinceLastFrame: number): void {
        if (this.region.top >= Global.PLAY_AREA_HEIGHT) {
            this.game.gameOver();
        }

        let wasLanded = this.landed;

        this.velocity = this.clampVelocity(this.velocity.add(this.acceleration.scale(msSinceLastFrame)));
        let newRegion = this.findNextLocation();

        if (this.region.left == newRegion.left) {
            this.velocity = new Vector(0, this.velocity.y);
        }

        if (this.region.top == newRegion.top) {
            this.velocity = new Vector(this.velocity.x, 0);
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

    private spawnSprintDust(): void {
        if (this.velocity.x > 0) {
            this.game.spawnParticleSystem(new ParticleSystem(
                "yellow",
                5,
                50, 100,
                new Vector(this.region.left, this.region.bottom),
                Vector.ZERO,
                -Math.PI * 7 / 8,
                -Math.PI,
                6,
            ));
        } else {
            this.game.spawnParticleSystem(new ParticleSystem(
                "yellow",
                5,
                50, 100,
                new Vector(this.region.right, this.region.bottom),
                Vector.ZERO,
                0,
                -Math.PI / 8,
                6,
            ));
        }

    }

    private spawnLandingDust(): void {
        this.game.spawnParticleSystem(new ParticleSystem(
            "white",
            10,
            50, 100,
            new Vector(this.region.right, this.region.bottom),
            Vector.ZERO,
            0, -Math.PI / 4,
            4.5,
        ));
        this.game.spawnParticleSystem(new ParticleSystem(
            "white",
            10,
            50, 100,
            new Vector(this.region.left, this.region.bottom),
            Vector.ZERO,
            -Math.PI * 3 / 4,
            -Math.PI,
            4.5,
        ));
    }

    override draw(ctx: CanvasRenderingContext2D, camera: Vector): void {
        this.region.draw(ctx, camera, "red");
    }
}