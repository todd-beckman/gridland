import { Actor } from "./actor";
import { Global } from "./global";
import { Vector } from "./vector";
import { Game } from "./game";
import { Player } from "./player";

export class PlayerBullet implements Actor {
    static readonly SPEED = 0.5;
    static readonly RADIUS = 5;
    static readonly RADIUS_SQUARED = PlayerBullet.RADIUS * PlayerBullet.RADIUS;
    static readonly COLOR = "rgb(128,128,128)";

    get radiusSquared() {
        return PlayerBullet.RADIUS_SQUARED;
    }

    location: Vector;
    direction: Vector;
    constructor(location: Vector, direction: Vector) {
        this.location = location;
        this.direction = direction;
    }

    updateOrDelete(game: Game, msSinceLastFrame: number): boolean {
        for (let i = game.items.length - 1; i >= 0; i--) {
            if (game.items[i].collides(game.player.location, Player.ITEMBOX_RADIUS_SQUARED)) {
                game.items[i].onCollect(game);
                game.items.splice(i, 1);
            }
        }

        let newLocation = this.location.add(
            this.direction.scale(PlayerBullet.SPEED)
                .scale(
                    msSinceLastFrame));
        if (newLocation.y > Global.PLAY_AREA_HEIGHT) {
            return true;
        }
        this.location = newLocation;
        return false;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        let canvasLocation = this.location.toScreenSpace;
        ctx.fillStyle = PlayerBullet.COLOR;
        ctx.fillRect(
            canvasLocation.x - PlayerBullet.RADIUS / 2,
            canvasLocation.y - PlayerBullet.RADIUS / 2,
            PlayerBullet.RADIUS,
            PlayerBullet.RADIUS);
    }

    collides(otherLocation: Vector, otherRadiusSquared: number): boolean {
        return this.location.distanceSquared(otherLocation) <= this.radiusSquared + otherRadiusSquared;
    }
}

