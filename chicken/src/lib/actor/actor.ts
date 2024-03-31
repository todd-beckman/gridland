import { Rectangle } from "../util/rectangle";

/**
 * Any game object.
 */
export abstract class Actor {
    abstract get location(): Rectangle;
    abstract get color(): string;

    abstract step(msSinceLastFrame: number): void;

    /**
     * Returns whether this actor collides with the other.
     * Collision uses rectangle collusion.
     */
    collides(other: Actor): boolean {
        return this.location.collides(other.location);
    }

    /**
     * Shorthand for drawing this actor's location and color.
     */
    draw(ctx: CanvasRenderingContext2D): void {
        this.location.draw(ctx, this.color);
    }
}
