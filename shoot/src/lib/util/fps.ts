import { Global } from "./global";
import { WithCooldown } from "./with_cooldown";

export class FPS {
    static readonly DRAW_LEFT = Global.PLAY_AREA_WIDTH + 20;
    static readonly DRAW_TOP = Global.PLAY_AREA_HEIGHT - 20;

    private frameCount: number = 0;
    private display: number = 0;
    private everySecond = new WithCooldown(1000);

    update(msSinceLastFrame: number) {
        this.frameCount += 1;
        if (this.everySecond.checkAndTrigger(msSinceLastFrame)) {
            this.display = this.frameCount;
            this.frameCount = 0;
        }
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = "black";
        ctx.font = "20px courier";
        ctx.fillText("FPS: " + this.display, FPS.DRAW_LEFT, FPS.DRAW_TOP);
    }
}