import { Rectangle } from "../util/rectangle";
import { Vector } from "../util/vector";

/**
 * Any game object.
 */
export abstract class Actor {
    abstract get region(): Rectangle
    step(msSinceLastFrame: number): void { }
    draw(ctx: CanvasRenderingContext2D, camera: Vector): void { }
}
