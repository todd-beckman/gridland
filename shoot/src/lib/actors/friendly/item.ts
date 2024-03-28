import { Vector } from "../../util/vector";
import { Actor } from "actor";
import { Game } from "../../game";
import { NoopScript, Script } from "../../util/scriptable";

export abstract class Item extends Actor {
    static readonly RADIUS = 20
    static readonly RADIUS_SQUARED = Item.RADIUS * Item.RADIUS;

    static ACCELERATION = new Vector(0, -0.001);
    static MAX_VELOCITY = new Vector(0, -5);
    static CHASE_SPEED = 0.40;

    static SPAWN_VERTICAL_SPEED = 2;
    static SPAWN_SPREAD = 1;
    static SPREAD_REDUCTION = 0.99;

    private shouldChasePlayer: boolean = false;

    get radius() {
        return Item.RADIUS;
    }
    get radiusSquared() {
        return Item.RADIUS_SQUARED;
    }

    location: Vector;
    velocity: Vector;
    constructor(location: Vector) {
        super(NoopScript.SINGLETON);
        this.location = location;
        let spread = (Math.random() - 0.5) * Item.SPAWN_SPREAD;
        this.velocity = new Vector(spread, Item.SPAWN_VERTICAL_SPEED);
    }

    chasePlayer(): void {
        this.shouldChasePlayer = true;
    }

    updateOrDelete(game: Game, msSinceLastFrame: number): boolean {
        if (this.shouldChasePlayer) {
            this.doChasePlayer(game, msSinceLastFrame);
            return false;
        }
        return this.fallOrDelete(game, msSinceLastFrame);
    }

    private doChasePlayer(game: Game, msSinceLastFrame: number): void {
        let vectorToPlayer = game.player.location.subtract(this.location);
        this.velocity = vectorToPlayer.toUnit.scale(Item.CHASE_SPEED * msSinceLastFrame);
        this.location = this.location.add(this.velocity);
    }

    private fallOrDelete(game: Game, msSinceLastFrame: number): boolean {
        let newVelocity = this.velocity.add(Item.ACCELERATION.scale(msSinceLastFrame));
        this.velocity = new Vector(newVelocity.x * Item.SPREAD_REDUCTION, newVelocity.y);

        if (this.velocity.y < Item.MAX_VELOCITY.y) {
            this.velocity = Item.MAX_VELOCITY;
        }
        this.location = this.location.add(this.velocity);

        return game.outOfBounds(this.location, this.radius, true);
    }

    abstract get color(): string;

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
        game.player.collectPowerItem(game);
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