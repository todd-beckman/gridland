import { Global } from "./global";
import { WithCooldown } from "./with_cooldown";

/**
 * Utility to track the FPS of the game and draw the value to the desired location.
 */
export class FPS {
    static readonly DRAW_LEFT = Global.PLAY_AREA_WIDTH + 20;
    static readonly DRAW_TOP = Global.PLAY_AREA_HEIGHT - 20;

    private frameCount: number = 0;
    private display: number = 0;
    private everySecond = new WithCooldown(1000);
    private msSinceLastFrame: number = 0;

    update(msSinceLastFrame: number) {
        this.frameCount += 1;
        this.everySecond.step(msSinceLastFrame);
        this.msSinceLastFrame = msSinceLastFrame;
        if (this.everySecond.checkAndTrigger) {
            this.display = this.frameCount;
            this.frameCount = 0;
        }
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = "black";
        ctx.font = "20px courier";
        ctx.fillText("FPS: " + this.display + " (" + this.msSinceLastFrame + ")", FPS.DRAW_LEFT, FPS.DRAW_TOP);
    }
}