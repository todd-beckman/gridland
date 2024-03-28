import { Game } from "../../game";
import { Path } from "../../util/path";
import { Script } from "../../util/scriptable";
import { Vector } from "../../util/vector";
import { Actor } from "../actor";
import { Item } from "../friendly/item";

export abstract class Enemy extends Actor {
    private readonly path: Path;
    location: Vector;

    constructor(script: Script, path: Path) {
        super(script);
        this.path = path;
        this.location = path.locationSinceSpawn(0);
    }

    get allowUnlimitedVertical(): boolean {
        return true;
    }

    updateOrDelete(game: Game, msSinceLastFrame: number): boolean {
        if (super.updateOrDelete(game, msSinceLastFrame)) {
            return true;
        }

        if (game.outOfBounds(this.location, this.radius, this.allowUnlimitedVertical)) {
            return true;
        }

        this.location = this.path.locationSinceSpawn(this.msSinceSpawn);
        return false;
    }

    abstract draw(ctx: CanvasRenderingContext2D): void;
}


export abstract class Mob extends Enemy {
    static NO_LOOT = () => { return []; };

    readonly loot: () => Item[];
    private health: number

    constructor(script: Script, path: Path, health: number, loot: () => Item[]) {
        super(script, path);
        this.loot = loot;
        this.health = health;
    }

    takeDamage(damage: number): void {
        this.health = Math.max(this.health - damage, 0);
    }

    updateOrDelete(game: Game, msSinceLastFrame: number): boolean {
        if (super.updateOrDelete(game, msSinceLastFrame)) {
            return true;
        }
        if (this.health <= 0) {
            game.spawnItems(this.loot(), this.location);
            return true;
        }
        return false;
    }
}