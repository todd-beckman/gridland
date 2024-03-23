import { Global } from "./global";

/**
 * World-space coordinate system, useful for location and physics.
 * This should not be used for rendering except by use of
 * {@link toScreenSpace}.
 * 
 * World-space coordinates has Up represented by a positive Y,
 * which is opposite of render space.
 */
export class Vector {
    readonly x: number;
    readonly y: number;

    /**
     * Represents either a location or a direction in world-space.
     */
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    /**
     * @returns a vector consisting of the sum of this vector and the other.
     */
    add(other: Vector): Vector {
        return new Vector(this.x + other.x, this.y + other.y);
    }

    /**
     * Shorthand for {@link add} where only the X coordinate should be shifted.
     */
    addX(x: number): Vector {
        return new Vector(this.x + x, this.y);
    }

    /**
     * Shorthand for {@link add} where only the Y coordinate should be shifted.
     */
    addY(y: number): Vector {
        return new Vector(this.x, this.y + y);
    }

    /**
     * Shorthand for {@link add} except with the coordinates negated.
     */
    subtract(other: Vector): Vector {
        return new Vector(this.x - other.x, this.y - other.y);
    }

    /**
     * @returns a scaled copy of the vector.
     */
    scale(scalar: number): Vector {
        return new Vector(this.x * scalar, this.y * scalar);
    }

    /**
     * @returns the squared distance between vectors.
     */
    distanceSquared(other: Vector): number {
        let x = this.x - other.x;
        let y = this.y - other.y;
        return x * x + y * y;
    }

    get toString(): string {
        return "(" + this.x + "," + this.y + ")";
    }

    /**
     * @returns the magnitude of the vector.
     */
    get magnitude(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    /**
     * @returns a copy of the vector scaled to a magnitude of 1.
     */
    get toUnit(): Vector {
        return this.scale(1 / this.magnitude);
    }

    /**
     * The zero vector, representing no direction.
     */
    static ZERO = new Vector(0, 0);

    /**
     * The unit vector for up in world-space.
     */
    static UP = new Vector(0, 1);

    /**
     * The unit vector for diagonally up and right in world-space.
     */
    static UP_RIGHT = new Vector(1 / Math.SQRT2, 1 / Math.SQRT2);

    /**
     * The unit vector for right in world-space.
     */
    static RIGHT = new Vector(1, 0);

    /**
     * The unit vector for diagonally down and right for up in world-space.
     */
    static DOWN_RIGHT = new Vector(1 / Math.SQRT2, -1 / Math.SQRT2);

    /**
     * The unit vector for down in world-space.
     */
    static DOWN = new Vector(0, -1);

    /**
     * The unit vector for diagonally down and left in world-space.
     */
    static DOWN_LEFT = new Vector(-1 / Math.SQRT2, -1 / Math.SQRT2);

    /**
     * The unit vector for left in world-space.
     */
    static LEFT = new Vector(-1, 0);

    /**
     * The unit vector for diagonally up and left in world-space.
     */
    static UP_LEFT = new Vector(-1 / Math.SQRT2, 1 / Math.SQRT2);

    /**
     * @returns the equivalent location of this vector in render-space.
     */
    get toScreenSpace(): Vector {
        return new Vector(this.x, -this.y).add(Vector.RENDER_ORIGIN);
    }

    /**
     * The (0, 0) location in render-space.
     */
    static RENDER_ORIGIN = new Vector(Global.PLAY_AREA_LEFT, Global.PLAY_AREA_TOP + Global.PLAY_AREA_HEIGHT);
}