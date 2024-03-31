import { Game } from "../game";
import { Global } from "../util/global";
import { Rectangle } from "../util/rectangle";
import { Vector } from "../util/vector";
import { Actor } from "./actor";

export class Wall extends Actor {
    static readonly RESPAWN_X: number = -50;
    static readonly WIDTH: number = 50;
    static readonly SPAWN_X: number = Global.PLAY_AREA_WIDTH;
    static readonly SPEED_PER_MS: number = -50;
    static readonly WALL_MIN_HEIGHT = 100;
    static readonly GAP_SPAN: number = 200;
    static readonly GAP_MIN: number = Wall.WALL_MIN_HEIGHT;
    static readonly GAP_MAX: number = Global.PLAY_AREA_HEIGHT - 2 * Wall.WALL_MIN_HEIGHT - Wall.GAP_SPAN;

    private upper: Rectangle;
    private lower: Rectangle;
    private readonly game: Game;
    private scoreReady: boolean = false;

    readonly color = "green";

    get location(): Rectangle {
        return this.lower;
    }

    constructor(game: Game, startingX: number) {
        super();
        this.game = game;
        this.upper = new Rectangle(new Vector(startingX, 0), Wall.WIDTH, 0);
        this.lower = this.upper;
    }

    private setGap(): void {
        let gapActual = Wall.GAP_MIN + Math.random() * Wall.GAP_MAX;

        let upperHeight = gapActual;
        this.upper = new Rectangle(new Vector(Wall.SPAWN_X, 0), Wall.WIDTH, upperHeight);

        let lowerHeight = Global.PLAY_AREA_HEIGHT - Wall.GAP_SPAN - upperHeight;
        this.lower = new Rectangle(new Vector(Wall.SPAWN_X, Global.PLAY_AREA_HEIGHT - lowerHeight), Wall.WIDTH, lowerHeight);

        this.scoreReady = true;
    }

    override collides(other: Actor): boolean {
        return other.location.collides(this.upper) || other.location.collides(this.lower);
    }

    override draw(ctx: CanvasRenderingContext2D): void {
        this.upper.draw(ctx, "purple");
        this.lower.draw(ctx, "green");
    }

    override step(msSinceLastFrame: number): void {
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
