import { Vector } from "./vector";

export abstract class Path {
    private msTraveledTotal: number = 0;

    location(msSinceLastFrame: number): Vector {
        this.msTraveledTotal += msSinceLastFrame;

        return this.locationSinceSpawn(this.msTraveledTotal);
    }

    abstract locationSinceSpawn(msTraveledTotal: number): Vector;
}

export class LinearPath extends Path {
    private readonly velocityPerMs: Vector;

    constructor(velocityPerMs: Vector) {
        super();
        this.velocityPerMs = velocityPerMs;
    }

    locationSinceSpawn(msTraveledTotal: number): Vector {
        return this.velocityPerMs.scale(msTraveledTotal);
    }
}
