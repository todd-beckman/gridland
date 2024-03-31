import { Rectangle } from "../util/rectangle";

/**
 * Any game object.
 */
export abstract class Actor {
    abstract get color(): string;

    abstract step(msSinceLastFrame: number): void;

    abstract draw(ctx: CanvasRenderingContext2D): void;
}
