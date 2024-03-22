import { Global } from "./global";
export class Vector {
    readonly x: number;
    readonly y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    add(other: Vector): Vector {
        return new Vector(this.x + other.x, this.y + other.y);
    }

    addX(x: number): Vector {
        return new Vector(this.x + x, this.y);
    }

    addY(y: number): Vector {
        return new Vector(this.x, this.y + y);
    }

    subtract(other: Vector): Vector {
        return new Vector(this.x - other.x, this.y - other.y);
    }

    scale(scalar: number): Vector {
        return new Vector(this.x * scalar, this.y * scalar);
    }

    distanceSquared(other: Vector): number {
        let x = this.x - other.x;
        let y = this.y - other.y;
        return x * x + y * y;
    }

    get toString(): string {
        return "(" + this.x + "," + this.y + ")";
    }

    get magnitude(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    get toUnit(): Vector {
        return this.scale(1 / this.magnitude);
    }

    static ZERO = new Vector(0, 0);
    static UP = new Vector(0, 1);
    static UP_RIGHT = new Vector(1 / Math.SQRT2, 1 / Math.SQRT2);
    static RIGHT = new Vector(1, 0);
    static DOWN_RIGHT = new Vector(1 / Math.SQRT2, -1 / Math.SQRT2);
    static DOWN = new Vector(0, -1);
    static DOWN_LEFT = new Vector(-1 / Math.SQRT2, -1 / Math.SQRT2);
    static LEFT = new Vector(-1, 0);
    static UP_LEFT = new Vector(-1 / Math.SQRT2, 1 / Math.SQRT2);

    get toScreenSpace(): Vector {
        return new Vector(this.x, -this.y).add(Vector.ORIGIN);
    }
    static ORIGIN = new Vector(Global.PLAY_AREA_LEFT, Global.PLAY_AREA_TOP + Global.PLAY_AREA_HEIGHT);
}