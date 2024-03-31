import { Game } from "../game";
import { Global } from "../util/global";
import { Input } from "../util/input";
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

    static readonly START_HORIZONTAL = Global.PLAY_AREA_WIDTH / 4;
    static readonly START_VERTICAL = Global.PLAY_AREA_HEIGHT * 2 / 4;
    static readonly RADIUS = 45;
    static readonly START_LOCATION: Rectangle = new Rectangle(new Vector(Player.START_HORIZONTAL, Player.START_VERTICAL), Player.RADIUS, Player.RADIUS);
    private static readonly JUMP_VELOCITY = new Vector(0, -11);

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

    step(msSinceLastFrame: number): void {
        console.log(this.loc.bottom);

        if (this.location.bottom >= Global.PLAY_AREA_HEIGHT) {
            this.game.gameOver();
            return;
        }
        if (this.game.walls.some(wall => wall.collides(this))) {
            this.game.gameOver();
            return;
        }

        this.jumpSpeed.step(msSinceLastFrame);
        if (Input.JUMP.held == 1 && this.jumpSpeed.checkAndTrigger) {
            this.velocity = Player.JUMP_VELOCITY;
        }

        this.velocity = this.velocity.addY(Global.GRAVITY_PER_MS);
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