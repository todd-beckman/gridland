/**
 * Tracks an interval that happens at a minimum of the given rate.
 */
export class WithCooldown {
    private cooldownMs: number;
    private readonly setCooldown: number;

    constructor(cooldownMs: number) {
        this.cooldownMs = 0;
        this.setCooldown = cooldownMs;
    }

    /**
     * Returns whether the cooldown has finished after the provided time has passed.
     * If so, the cooldown is also reset and begins immediately.
     * 
     * @param msSinceLastFrame
     * @returns Whether the cooldown is over.
     */
    get checkAndTrigger(): boolean {
        if (this.cooldownMs > 0) {
            return false;
        }
        this.cooldownMs = this.setCooldown;
        return true;
    }

    step(msSinceLastFrame: number) {
        this.cooldownMs = Math.max(0, this.cooldownMs - msSinceLastFrame);
        msSinceLastFrame
    }
}