import { Game } from "../../game";
import { Path } from "../../util/path";
import { Vector } from "../../util/vector";
import { Actor } from "../actor";
import { Item } from "../friendly/item";

export abstract class Enemy extends Actor {
    private readonly path: Path;
    private msTraveledTotal: number = 0
    location: Vector;
    private health: number

    constructor(path: Path, health: number) {
        super();
        this.health = health;
        this.path = path;
        this.location = path.locationSinceSpawn(0);
    }

    abstract get radius(): number;
    abstract get radiusSquared(): number;
    abstract get loot(): () => Item[];

    takeDamage(damage: number): void {
        this.health = Math.max(this.health - damage, 0);
    }

    updateOrDelete(game: Game, msSinceLastFrame: number): boolean {
        if (game.outOfBounds(this.location, this.radius)) {
            return true;
        }

        if (this.health <= 0) {
            game.spawnItems(this.loot(), this.location);
            return true;
        }

        this.msTraveledTotal += msSinceLastFrame;
        this.location = this.path.locationSinceSpawn(this.msTraveledTotal);

        return;
    }

    abstract draw(ctx: CanvasRenderingContext2D): void;
}