import { Global } from "./global";
import { WithCooldown } from "./with_cooldown";

/**
 * Utility to track the FPS of the game and draw the value to the desired location.
 */
export class FPS {
    static readonly DRAW_LEFT = 5;
    static readonly DRAW_TOP = 15;

    private frameCount: number = 0;
    private display: number = 0;
    private everySecond = new WithCooldown(1000);

    update(msSinceLastFrame: number) {
        this.frameCount += 1;
        this.everySecond.step(msSinceLastFrame);
        if (this.everySecond.checkAndTrigger) {
            this.display = this.frameCount;
            this.frameCount = 0;
        }
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = "gray";
        ctx.font = "12pt courier";
        ctx.fillText("FPS: " + this.display, FPS.DRAW_LEFT, FPS.DRAW_TOP);
    }
}