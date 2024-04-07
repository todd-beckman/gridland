import { Actor } from "../actor/actor";
import { Rectangle } from "./rectangle";
import { Vector } from "./vector";
import { WithCooldown } from "./with_cooldown";

class Particle extends Actor {
    readonly color: string;
    readonly velocity: Vector
    readonly lifespanMS: number;
    region: Rectangle;
    private timeSinceSpawn: number = 0;

    constructor(color: string, location: Rectangle, velocity: Vector, lifespanMS: number) {
        super();
        this.color = color;
        this.region = location;
        this.velocity = velocity;
        this.lifespanMS = lifespanMS;
    }

    draw(ctx: CanvasRenderingContext2D, camera: Vector): void {
        this.region.draw(ctx, camera, this.color);
    }

    step(msSinceLastFrame: number): void {
        this.timeSinceSpawn += msSinceLastFrame;

        this.region = this.region.add(this.velocity);
    }

    get dead(): boolean {
        return this.timeSinceSpawn >= this.lifespanMS;
    }

}

export class ParticleSystem extends Actor {
    private static readonly PARTICLE_SIZE = 3;

    readonly color: string;
    private readonly particleLifespanMs: number
    private readonly velocity: Vector;
    private readonly directionRadiansMin: number;
    private readonly directionRadiansMax: number;
    private readonly particleSpeed: number;

    private readonly particles: Particle[] = [];
    private readonly particleSpawnTime: WithCooldown;

    private numParticlesToSpawn: number;
    private location: Vector;
    private timeSinceSpawn: number = 0;

    public readonly region = new Rectangle(0, 0, 0, 0);

    constructor(
        // The fillStyle to render individual particles
        color: string,
        // How many particles this system will spawn total.
        numParticles: number,
        // How long this system lives.
        // This is used to determine how frequently to spawn particles.
        // A particle system is not considered dead until all particles have been spawned and are considered dead.
        lifespanMs: number,
        // How long particles live
        particleLifespanMs: number,
        // The starting location of this system's spawner.
        location: Vector,
        // Velocity of this system's spawner.
        velocity: Vector,
        // The range of directions in radians.
        directionRadiansMin: number, directionRadiansMax: number,
        // Speed of spawned particles
        particleSpeed: number,
    ) {
        super();
        this.color = color;
        this.velocity = velocity;
        this.location = location;
        this.particleLifespanMs = particleLifespanMs;
        this.numParticlesToSpawn = numParticles;
        this.particleSpawnTime = new WithCooldown(lifespanMs / numParticles);
        this.directionRadiansMin = directionRadiansMin;
        this.directionRadiansMax = directionRadiansMax
        this.particleSpeed = particleSpeed;
    }

    override draw(ctx: CanvasRenderingContext2D, camera: Vector): void {
        this.particles.forEach(particle => particle.draw(ctx, camera));
    }

    get dead(): boolean {
        return this.numParticlesToSpawn == 0 && this.particles.length == 0;
    }

    override step(msSinceLastFrame: number): void {
        this.timeSinceSpawn += msSinceLastFrame;
        this.location = this.location.add(this.velocity.scale(msSinceLastFrame));

        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].step(msSinceLastFrame);
            if (this.particles[i].dead) {
                this.particles.splice(i, 1);
            }
        }

        if (this.numParticlesToSpawn > 0) {
            this.particleSpawnTime.step(msSinceLastFrame);
            if (this.particleSpawnTime.checkAndTrigger) {
                this.numParticlesToSpawn--;

                let angle = this.directionRadiansMin + (this.directionRadiansMax - this.directionRadiansMin) * Math.random();
                let velocity = Vector.RIGHT.rotate(angle).scale(this.particleSpeed);

                this.particles.push(new Particle(
                    this.color,
                    new Rectangle(this.location.x, this.location.y, ParticleSystem.PARTICLE_SIZE, ParticleSystem.PARTICLE_SIZE),
                    velocity,
                    this.particleLifespanMs,
                ));
            }
        }
    }
}