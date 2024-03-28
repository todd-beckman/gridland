import { Actor } from "../actors/actor";
import { BasicMob } from "../actors/enemies/basic_mob";
import { Enemy } from "../actors/enemies/enemy";
import { EnemyBullet } from "../actors/enemies/enemy_bullet";
import { Game } from "../game";
import { LinearPath } from "./path";
import { Vector } from "./vector";

export class ScriptAction {
    readonly act: (game: Game, actor: Actor) => void;
    constructor(action: (game: Game, actor: Actor) => void) {
        this.act = action;
    }

    static SHOOT_PLAYER(speed: number): ScriptAction {
        return new ScriptAction((game, actor: Actor) => {
            let direction = game.player.location.subtract(actor.location);
            let velocity = direction.toUnit.scale(speed);
            let path = new LinearPath(actor.location, velocity);
            let enemyBullet = new EnemyBullet(new NoopScript(), path);
            game.spawnEnemyBullet(enemyBullet);
        });
    }

    static SHOOT_RANDOM(speed: number): ScriptAction {
        return new ScriptAction((game, actor: Actor) => {
            var direction = Vector.inDirection(Math.random() * 2 * Math.PI);
            let velocity = direction.toUnit.scale(speed);
            let path = new LinearPath(actor.location, velocity);
            let enemyBullet = new EnemyBullet(new NoopScript(), path);
            game.spawnEnemyBullet(enemyBullet);
        });
    }
}

export abstract class Script {
    abstract actionsInRange(fromMs: number, toMs: number): ScriptAction[];
    invokeActions(game: Game, actor: Actor, fromMs: number, toMs: number) {
        this.actionsInRange(fromMs, toMs).forEach(action => action.act(game, actor));
    }
}

export class NoopScript extends Script {
    actionsInRange(_1: number, _2: number): ScriptAction[] {
        return [];
    }
}

export class CompositeScript extends Script {
    private readonly scripts: Script[];

    constructor(scripts: Script[]) {
        super();
        this.scripts = scripts;
    }

    actionsInRange(fromMs: number, toMs: number): ScriptAction[] {
        let actions: ScriptAction[] = [];
        this.scripts.map(script => {
            actions = actions.concat(script.actionsInRange(fromMs, toMs));
        });
        return actions;
    }
}

/**
 * Runs the ScriptAction every time intervalMs has elapsed.
 */
export class Every extends Script {
    private readonly intervalMs: number;
    private readonly action: ScriptAction;

    constructor(intervalMS: number, action: ScriptAction) {
        super();
        this.intervalMs = intervalMS;
        this.action = action;
    }

    actionsInRange(fromMs: number, toMs: number): ScriptAction[] {
        let from = fromMs % this.intervalMs;
        let to = toMs % this.intervalMs;
        if (to < from) {
            return [this.action];
        }
        return [];
    }
}

/**
 * At each key milliseconds, runs the value action.
 */
class AtTimes extends Script {
    private readonly actionMap: Map<number, ScriptAction>;
    constructor(actionMap: Map<number, ScriptAction>) {
        super();
        this.actionMap = actionMap;
    }

    actionsInRange(fromMs: number, toMs: number): ScriptAction[] {
        let matchingEntries: ScriptAction[] = [];
        this.actionMap.forEach((action, time) => {
            if (fromMs < time && toMs >= time) {
                matchingEntries.push(action);
            }
        });
        return matchingEntries;
    }
}