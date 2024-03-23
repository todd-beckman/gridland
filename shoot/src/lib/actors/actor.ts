import { Game } from "../game";
import { Vector } from "../util/vector";

export abstract class Actor {
    abstract get location(): Vector;
    abstract get radius(): number;
    abstract get radiusSquared(): number;

    abstract updateOrDelete(game: Game, msSinceLastFrame: number): boolean;
    abstract draw(ctx: CanvasRenderingContext2D): void;

    collides(other: Actor): boolean {
        return this.location.distanceSquared(other.location) <= this.radiusSquared + other.radiusSquared;
    }
}