import { Vector } from "./vector";

export abstract class Path {
    abstract locationSinceSpawn(msTraveledTotal: number): Vector;
}

export class LinearPath extends Path {
    private startingLocation: Vector
    private readonly velocityPerMs: Vector;

    constructor(startingLocation: Vector, velocityPerMs: Vector) {
        super();
        this.startingLocation = startingLocation;
        this.velocityPerMs = velocityPerMs;
    }

    locationSinceSpawn(msTraveledTotal: number): Vector {
        return this.startingLocation.add(this.velocityPerMs.scale(msTraveledTotal));
    }
}
