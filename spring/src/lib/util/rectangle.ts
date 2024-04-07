import { Global } from "./global";
import { Vector } from "./vector";

/**
 * A geometric rectangle.
 * 
 * Represented by a 2d Vector for the upper-left corner as well as the width and height.
 */
export class Rectangle {
    static readonly PLAY_AREA = new Rectangle(0, 0, Global.PLAY_AREA_WIDTH, Global.PLAY_AREA_HEIGHT);
    static readonly HUD_AREA = new Rectangle(Global.PLAY_AREA_WIDTH, 0, 800 - Global.PLAY_AREA_WIDTH, Global.PLAY_AREA_HEIGHT);

    readonly top: number;
    readonly left: number;
    readonly width: number;
    readonly height: number;

    constructor(left: number, top: number, width: number, height: number) {
        this.left = left;
        this.top = top;
        this.width = width;
        this.height = height;
    }

    get right(): number {
        return this.left + this.width;
    }

    get bottom(): number {
        return this.top + this.height;
    }

    get location(): Vector {
        return new Vector(this.left, this.top);
    }

    get center(): Vector {
        return new Vector(this.left + this.width / 2, this.top + this.height / 2);
    }

    /**
     * Returns a new location with the same width and height with a location offset from the input.
     */
    add(offset: Vector): Rectangle {
        return new Rectangle(this.left + offset.x, this.top + offset.y, this.width, this.height);
    }

    addX(x: number): Rectangle {
        return new Rectangle(this.left + x, this.top, this.width, this.height);
    }

    addY(y: number): Rectangle {
        return new Rectangle(this.left, this.top + y, this.width, this.height);
    }

    inXInterval(xmin: number, xmax: number): boolean {
        return this.left >= xmin && this.left <= xmax ||
            this.right >= xmin && this.right <= xmax ||
            xmin >= this.left && xmin <= this.right ||
            xmax >= this.left && xmax <= this.right;
    }

    inYInterval(ymin: number, ymax: number): boolean {
        return this.top >= ymin && this.top <= ymax ||
            this.bottom >= ymin && this.bottom <= ymax ||
            ymin >= this.top && ymin <= this.top ||
            ymax >= this.bottom && ymax <= this.bottom;
    }

    collides(other: Rectangle): boolean {
        return this.inXInterval(other.left, other.right) && this.inYInterval(other.top, other.bottom);
    }

    draw(ctx: CanvasRenderingContext2D, camera: Vector, color: string): void {
        ctx.fillStyle = color;
        ctx.fillRect(Math.floor(this.left - camera.x), Math.floor(this.top - camera.y), this.width, this.height);
    }
}