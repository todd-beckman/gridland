import { Path } from "../../util/path";
import { Item } from "../friendly/item";
import { Enemy } from "./enemy";

export class BasicMob extends Enemy {
    static readonly RADIUS = 50;
    static readonly RADIUS_SQUARED = BasicMob.RADIUS * BasicMob.RADIUS;
    static readonly COLOR = "green";

    get radius() {
        return BasicMob.RADIUS;
    }

    get radiusSquared() {
        return BasicMob.RADIUS_SQUARED;
    }

    readonly loot: () => Item[];

    constructor(path: Path, health: number, loot: () => Item[]) {
        super(path, health);
        this.loot = loot;
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