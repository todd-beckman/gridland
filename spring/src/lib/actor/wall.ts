import { Game } from "../game";
import { Global } from "../util/global";
import { Rectangle } from "../util/rectangle";
import { Vector } from "../util/vector";
import { Actor } from "./actor";

export class Wall extends Actor {
    static readonly WIDTH: number = Global.GRID_CELL_SIZE;
    static readonly WALL_MIN_HEIGHT = 100;

    private readonly game: Game;
    readonly region: Rectangle;

    static readonly COLOR = "brown";

    private readonly color: string;

    constructor(game: Game, region: Rectangle, color?: string) {
        super();
        this.game = game;
        this.region = region;
        this.color = color === undefined ? Wall.COLOR : color;
    }

    override draw(ctx: CanvasRenderingContext2D, camera: Vector): void {
        this.region.draw(ctx, camera, this.color);
    }
}
