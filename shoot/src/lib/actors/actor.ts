import { Game } from "../game";
import { Script } from "../util/scriptable";
import { Vector } from "../util/vector";

export abstract class Actor {
    abstract get location(): Vector;
    abstract get radius(): number;
    abstract get radiusSquared(): number;
    abstract draw(ctx: CanvasRenderingContext2D): void;

    protected msSinceSpawn: number = 0;
    private readonly script: Script;

    constructor(script: Script) {
        this.script = script;
    }

    updateOrDelete(game: Game, msSinceLastFrame: number): boolean {
        let oldMsSinceSpawn = this.msSinceSpawn;
        this.msSinceSpawn += msSinceLastFrame;
        this.script.invokeActions(game, this, oldMsSinceSpawn, this.msSinceSpawn);

        return false;
    }

    collides(other: Actor): boolean {
        return this.location.distanceSquared(other.location) <= this.radiusSquared + other.radiusSquared;
    }
}