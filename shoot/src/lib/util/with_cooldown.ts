
/**
 * Tracks an interval that happens at a minimum of the given rate.
 */
export class WithCooldown {
    private cooldownMs: number;
    private readonly setCooldown: number;

    constructor(cooldownMs: number) {
        this.cooldownMs = cooldownMs
        this.setCooldown = cooldownMs;
    }

    /**
     * Returns whether the cooldown has finished after the provided time has passed.
     * If so, also calls {@link trigger()} to reset the cooldown countdown.
     * 
     * @param msSinceLastFrame
     * @returns Whether the cooldown is over.
     */
    checkAndTrigger(msSinceLastFrame: number): boolean {
        if (this.check(msSinceLastFrame)) {
            this.trigger();
            return true;
        }
        return false;
    }

    /**
     * Returns whether the cooldown has finished after the provided time has passed.
     * @param msSinceLastFrame
     * @returns 
     */
    check(msSinceLastFrame: number): boolean {
        this.cooldownMs = Math.max(0, this.cooldownMs - msSinceLastFrame);

        return this.cooldownMs == 0
    }

    /**
     * Resets the cooldown countdown.
     */
    trigger() {
        this.cooldownMs = this.setCooldown;
    }
}