import { Game } from "../../game";
import { Vector } from "../../util/vector";
import { Actor } from "../actor";

export class Enemy implements Actor {
    get location(): Vector {
        throw new Error("Method not implemented.");
    }
    get radiusSquared(): number {
        throw new Error("Method not implemented.");
    }
    updateOrDelete(game: Game, msSinceLastFrame: number): boolean {
        throw new Error("Method not implemented.");
    }

    draw(ctx: CanvasRenderingContext2D): void {
        throw new Error("Method not implemented.");
    }

    collides(otherLocation: Vector, otherRadiusSquared: number): boolean {
        throw new Error("Method not implemented.");
    }
}