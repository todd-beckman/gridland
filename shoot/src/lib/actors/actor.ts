import { Game } from "../game";
import { Vector } from "../util/vector";

export interface Actor {
    get location(): Vector;
    get radiusSquared(): number;

    updateOrDelete(game: Game, msSinceLastFrame: number): boolean;
    draw(ctx: CanvasRenderingContext2D): void;

    collides(otherLocation: Vector, otherRadiusSquared: number): boolean;
}