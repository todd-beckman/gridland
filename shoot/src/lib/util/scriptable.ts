import { BasicMob } from "../actors/enemies/basic_mob";
import { Game } from "../game";
import { LinearPath } from "./path";
import { Vector } from "./vector";

export class Script {
    readonly action: (game: Game, location: Vector) => void;
    constructor(action: (game: Game, location: Vector) => void) {
        this.action = action;
    }

    static SHOOT_PLAYER(speed: number): Script {
        return new Script((game, location: Vector) => {
            let vectorToPlayer = game.player.location.subtract(location);
            let velocity = vectorToPlayer.toUnit.scale(speed);
            let path = new LinearPath(location, velocity);
            let enemy = new BasicMob(path, Number.POSITIVE_INFINITY, () => { return []; });
            game.spawnEnemy(enemy);
        });
    }

    static SHOOT_RANDOM(speed: number): Script {
        return new Script((game, location: Vector) => {
            let vectorToPlayer = game.player.location.subtract(location);
            let velocity = vectorToPlayer.toUnit.scale(speed);
            let path = new LinearPath(location, velocity);
            let enemy = new BasicMob(path, Number.POSITIVE_INFINITY, () => { return []; });
            game.spawnEnemy(enemy);
        });
    }
}

export abstract class Scriptable {
    readonly actionSet: Map<number, Script>;
    private msSinceSpawn: number = 0;
    abstract get location(): Vector;

    act(game: Game, msSinceLastFrame: number): void {
        let oldMsSinceSpawn = this.msSinceSpawn;
        this.msSinceSpawn += msSinceLastFrame;
        this.actionSet.forEach((script, time) => {
            if (oldMsSinceSpawn < time && this.msSinceSpawn >= time) {
                script.action(game, this.location);
            }
        });
    }
}