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

    private static readonly START_HORIZONTAL = Global.PLAY_AREA_WIDTH / 4;
    private static readonly START_VERTICAL = Global.PLAY_AREA_HEIGHT * 2 / 4;
    private static readonly RADIUS = 45;
    private static readonly START_LOCATION: Rectangle = new Rectangle(new Vector(Player.START_HORIZONTAL, Player.START_VERTICAL), Player.RADIUS, Player.RADIUS);
    private static readonly JUMP_VELOCITY = new Vector(0, -10);
    private static readonly HURTBOX_SHRINK = 2;
    private static readonly HURTBOX_SIZE = Player.RADIUS - Player.HURTBOX_SHRINK * 2;

    private static readonly JETPACK_FLAME_ANGLE_MIN = Math.PI / 2;
    private static readonly JETPACK_FLAME_ANGLE_MAX = Math.PI * 3 / 4;
    private static readonly JETPACK_FLAME_SYTEM_VELOCITY = new Vector(0, -0.1);

    readonly color = Player.COLOR;

    private readonly jumpSpeed = new WithCooldown(100);
    private velocity: Vector = Vector.ZERO;
    private loc: Rectangle = new Rectangle(new Vector(Player.START_HORIZONTAL, Player.START_VERTICAL), Player.RADIUS, Player.RADIUS);
    private readonly game: Game;

    constructor(game: Game) {
        super();
        this.game = game;
        this.loc = Player.START_LOCATION;
    }

    get location(): Rectangle {
        return this.loc;
    }

    get hurtbox(): Rectangle {
        return new Rectangle(
            this.loc.location.add(new Vector(Player.HURTBOX_SHRINK, Player.HURTBOX_SHRINK)),
            Player.HURTBOX_SIZE,
            Player.HURTBOX_SIZE,
        );
    }

    step(msSinceLastFrame: number): void {
        if (this.location.bottom >= Global.PLAY_AREA_HEIGHT) {
            this.game.gameOver();
            return;
        }
        if (this.game.walls.some(wall => wall.collides(this.hurtbox))) {
            this.game.gameOver();
            return;
        }

        this.jumpSpeed.step(msSinceLastFrame);
        if (Input.JUMP.held == 1 && this.jumpSpeed.checkAndTrigger) {
            this.velocity = Player.JUMP_VELOCITY;

            this.game.spawnParticleSystem(new ParticleSystem(
                "red",
                20,
                250, 300,
                this.location.location.addX(2),
                Player.JETPACK_FLAME_SYTEM_VELOCITY,
                Player.JETPACK_FLAME_ANGLE_MIN,
                Player.JETPACK_FLAME_ANGLE_MAX,
                5,
            ));
        }

        this.velocity = this.velocity.addY(Global.GRAVITY_PER_MS * msSinceLastFrame);
        let newLocation = this.loc.add(this.velocity);

        if (newLocation.location.y <= 0) {
            newLocation = new Rectangle(new Vector(newLocation.location.x, 0), newLocation.width, newLocation.height);
        }

        this.loc = newLocation;
    }

    override draw(ctx: CanvasRenderingContext2D): void {
        let sprite = this.velocity.y < 0 ? Global.CHICKEN_FLY_SPRITE() : Global.CHICKEN_SPRITE();
        ctx.drawImage(sprite, this.location.left, this.location.top);
    }
}