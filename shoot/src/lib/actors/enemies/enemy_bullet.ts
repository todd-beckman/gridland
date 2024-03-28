import { Game } from "../../game";
import { Path } from "../../util/path";
import { Script, ScriptAction } from "../../util/scriptable";
import { Enemy } from "./enemy";

export class EnemyBullet extends Enemy {
    static readonly RADIUS = 5;
    static readonly RADIUS_SQUARED = EnemyBullet.RADIUS * EnemyBullet.RADIUS;
    static readonly COLOR = "white";

    private didGraze = false;

    constructor(script: Script, path: Path) {
        super(script, path);
    }

    get radius(): number {
        return EnemyBullet.RADIUS;
    }

    get radiusSquared(): number {
        return EnemyBullet.RADIUS_SQUARED;
    }

    get grazed(): boolean {
        return this.didGraze;
    }

    graze(game: Game) {
        this.didGraze = true;
        game.graze();
    }

    draw(ctx: CanvasRenderingContext2D): void {
        let canvasLocation = this.location.toScreenSpace;
        ctx.fillStyle = EnemyBullet.COLOR;
        ctx.fillRect(
            canvasLocation.x - EnemyBullet.RADIUS / 2,
            canvasLocation.y - EnemyBullet.RADIUS / 2,
            EnemyBullet.RADIUS,
            EnemyBullet.RADIUS);
    }
}