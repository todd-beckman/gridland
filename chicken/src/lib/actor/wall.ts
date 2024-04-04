import { Game } from "../game";
import { Global } from "../util/global";
import { Rectangle } from "../util/rectangle";
import { Vector } from "../util/vector";
import { Actor } from "./actor";

export class Wall extends Actor {
    static readonly RESPAWN_X: number = -50;
    static readonly WIDTH: number = 50;
    static readonly SPAWN_X: number = Global.PLAY_AREA_WIDTH;
    static readonly SPEED_PER_MS: number = -0.3;
    static readonly WALL_MIN_HEIGHT = 100;
    static readonly GAP_SPAN: number = 200;
    static readonly GAP_MIN: number = Wall.WALL_MIN_HEIGHT;
    static readonly GAP_MAX: number = Global.PLAY_AREA_HEIGHT - 2 * Wall.WALL_MIN_HEIGHT - Wall.GAP_SPAN;

    static readonly colors: string[] = ["rgb(30, 30, 200)", "green", "rgb(128, 128, 0)", "red", "purple", "pink"];

    private upper: Rectangle;
    private lower: Rectangle;
    private readonly game: Game;
    private scoreReady: boolean = false;

    static COLOR(score: number): string {
        let colorIndex = Math.min(Math.floor(score / 10), Wall.colors.length);
        console.log("colorIndex = " + colorIndex);
        return Wall.colors[colorIndex];
    }

    get color() {
        return Wall.COLOR(this.game.score);
    }

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

    collides(other: Rectangle): boolean {
        return other.collides(this.upper) || other.collides(this.lower);
    }

    override draw(ctx: CanvasRenderingContext2D): void {
        this.upper.draw(ctx, this.color);
        this.lower.draw(ctx, this.color);
    }

    override step(msSinceLastFrame: number): void {
        let oldRight = this.location.right;

        this.upper = this.upper.addX(Wall.SPEED_PER_MS * msSinceLastFrame);
        this.lower = this.lower.addX(Wall.SPEED_PER_MS * msSinceLastFrame);

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
