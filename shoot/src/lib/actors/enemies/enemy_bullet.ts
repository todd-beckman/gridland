import { Path } from "../../util/path";
import { Enemy } from "./enemy";

export class EnemyBullet extends Enemy {
    static readonly RADIUS = 5;
    static readonly RADIUS_SQUARED = EnemyBullet.RADIUS * EnemyBullet.RADIUS;
    static readonly COLOR = "white";

    constructor(path: Path) {
        super(path, Number.POSITIVE_INFINITY);
    }

    override takeDamage(_: number): void { }

    loot = () => { return [] };

    get radius(): number {
        return EnemyBullet.RADIUS;
    }

    get radiusSquared(): number {
        return EnemyBullet.RADIUS_SQUARED;
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