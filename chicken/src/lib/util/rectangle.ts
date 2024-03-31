import { Global } from "./global";
import { Vector } from "./vector";

/**
 * A geometric rectangle.
 * 
 * Represented by a 2d Vector for the upper-left corner as well as the width and height.
 */
export class Rectangle {
    static readonly PLAY_AREA = new Rectangle(Vector.ZERO, Global.PLAY_AREA_WIDTH, Global.PLAY_AREA_HEIGHT);
    static readonly HUD_AREA = new Rectangle(new Vector(Global.PLAY_AREA_WIDTH, 0), 800 - Global.PLAY_AREA_WIDTH, Global.PLAY_AREA_HEIGHT);

    readonly location: Vector;
    readonly width: number;
    readonly height: number;

    constructor(location: Vector, width: number, height: number) {
        this.location = location;
        this.width = width;
        this.height = height;
    }

    get left(): number {
        return this.location.x;
    }

    get top(): number {
        return this.location.y;
    }

    get right(): number {
        return this.location.x + this.width;
    }

    get bottom(): number {
        return this.location.y + this.height;
    }

    /**
     * Returns a new location with the same width and height with a location offset from the input.
     */
    add(offset: Vector): Rectangle {
        return new Rectangle(this.location.add(offset), this.width, this.height);
    }

    addX(offset: number): Rectangle {
        return new Rectangle(this.location.add(new Vector(offset, 0)), this.width, this.height);
    }

    /**
     * Returns whether this rectangle overlaps the other.
     */
    collides(other: Rectangle): boolean {
        let otherBoundsHorizontally =
            this.left >= other.left && this.left <= other.right ||
            this.right >= other.left && this.right <= other.right;

        let otherBoundsVertically =
            this.top >= other.top && this.top <= other.bottom ||
            this.bottom >= other.top && this.bottom <= other.bottom;

        return otherBoundsHorizontally && otherBoundsVertically;
    }

    /**
     * Draws this rectangle to the canvas with the given fillStyle.
     */
    draw(ctx: CanvasRenderingContext2D, color: string): void {
        ctx.fillStyle = color;
        ctx.fillRect(this.location.x, this.location.y, this.width, this.height);
    }
}