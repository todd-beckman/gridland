import { Vector } from "./vector";
import { Actor } from "./actor";
import { Global } from "./global";
import { Player } from "./player";
import { Game } from "./game";

export abstract class Item implements Actor {
    static readonly RADIUS = 20
    static readonly RADIUS_SQUARED = Item.RADIUS * Item.RADIUS;

    static ACCELERATION = new Vector(0, -0.001);
    static MAX_VELOCITY = new Vector(0, -5);
    static CHASE_SPEED = 0.40;

    static SPAWN_VERTICAL_SPEED = 1;
    static SPAWN_SPREAD = 1;
    static SPREAD_REDUCTION = 0.99;

    private shouldChasePlayer: boolean = false;

    get radiusSquared() {
        return Item.RADIUS_SQUARED;
    }

    location: Vector;
    velocity: Vector;
    constructor(location: Vector) {
        this.location = location;
        let spread = (Math.random() - 0.5) * Item.SPAWN_SPREAD;
        this.velocity = new Vector(spread, Item.SPAWN_VERTICAL_SPEED);
    }

    chasePlayer(): void {
        this.shouldChasePlayer = true;
    }

    updateOrDelete(game: Game, msSinceLastFrame: number): boolean {
        if (this.shouldChasePlayer) {
            this.chasePlayerOrDelete(game, msSinceLastFrame);
            return false;
        }
        return this.fallOrDelete(msSinceLastFrame);
    }

    private chasePlayerOrDelete(game: Game, msSinceLastFrame: number): void {
        let vectorToPlayer = game.player.location.subtract(this.location);
        this.velocity = vectorToPlayer.toUnit.scale(Item.CHASE_SPEED * msSinceLastFrame);
        this.location = this.location.add(this.velocity);
    }

    private fallOrDelete(msSinceLastFrame: number): boolean {
        let newVelocity = this.velocity.add(Item.ACCELERATION.scale(msSinceLastFrame));
        this.velocity = new Vector(newVelocity.x * Item.SPREAD_REDUCTION, newVelocity.y);

        if (this.velocity.y < Item.MAX_VELOCITY.y) {
            this.velocity = Item.MAX_VELOCITY;
        }
        this.location = this.location.add(this.velocity);

        return this.location.y <= -10;
    }

    abstract get color(): string;

    collides(otherLocation: Vector, otherRadiusSquared: number): boolean {
        return this.location.distanceSquared(otherLocation) <= Item.RADIUS_SQUARED + otherRadiusSquared;
    }

    abstract onCollect(game: Game): void;

    draw(ctx: CanvasRenderingContext2D): void {
        let canvasLocation = this.location.toScreenSpace;
        ctx.fillStyle = this.color;
        ctx.fillRect(
            canvasLocation.x - Item.RADIUS / 2,
            canvasLocation.y - Item.RADIUS / 2,
            Item.RADIUS,
            Item.RADIUS);
    }
}

export class PowerItem extends Item {
    get color() {
        return "red";
    }

    onCollect(game: Game): void {
        game.player.collectPowerItem();
    }
}

export class PointItem extends Item {
    get color() {
        return "blue";
    }

    onCollect(game: Game): void {
        game.player.collectPointItem(game);
    }
}