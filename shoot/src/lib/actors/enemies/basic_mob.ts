import { Path } from "../../util/path";
import { Script, ScriptAction } from "../../util/scriptable";
import { Item } from "../friendly/item";
import { Mob } from "./enemy";

export class BasicMob extends Mob {
    static readonly RADIUS = 50;
    static readonly RADIUS_SQUARED = BasicMob.RADIUS * BasicMob.RADIUS;
    static readonly COLOR = "green";

    get radius() {
        return BasicMob.RADIUS;
    }

    get radiusSquared() {
        return BasicMob.RADIUS_SQUARED;
    }

    constructor(script: Script, path: Path, health: number, loot: () => Item[]) {
        super(script, path, health, loot);
    }

    draw(ctx: CanvasRenderingContext2D): void {
        let canvasLocation = this.location.toScreenSpace;
        ctx.fillStyle = BasicMob.COLOR;
        ctx.fillRect(
            canvasLocation.x - BasicMob.RADIUS / 2,
            canvasLocation.y - BasicMob.RADIUS / 2,
            BasicMob.RADIUS,
            BasicMob.RADIUS);
    }
}