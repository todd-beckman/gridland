import { Rectangle } from "../util/rectangle";

/**
 * Any game object.
 */
export abstract class Actor {
    abstract get location(): Rectangle;
    abstract get color(): string;

    abstract step(msSinceLastFrame: number): void;

    /**
     * Shorthand for drawing this actor's location and color.
     */
    draw(ctx: CanvasRenderingContext2D): void {
        this.location.draw(ctx, this.color);
    }
}
