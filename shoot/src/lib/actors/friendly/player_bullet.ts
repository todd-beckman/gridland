import { Actor } from "actor";
import { Global } from "../../util/global";
import { Vector } from "../../util/vector";
import { Game } from "../../game";

export class PlayerBullet extends Actor {
    static readonly SPEED = 0.5;
    static readonly RADIUS = 5;
    static readonly RADIUS_SQUARED = PlayerBullet.RADIUS * PlayerBullet.RADIUS;
    static readonly COLOR = "rgb(128,128,128)";

    get radius() {
        return PlayerBullet.RADIUS;
    }
    get radiusSquared() {
        return PlayerBullet.RADIUS_SQUARED;
    }

    location: Vector;
    direction: Vector;
    constructor(location: Vector, direction: Vector) {
        super();
        this.location = location;
        this.direction = direction;
    }

    updateOrDelete(game: Game, msSinceLastFrame: number): boolean {
        if (game.outOfBounds(this.location, this.radius)) {
            return true;
        }

        for (let i = 0; i < game.mobs.length; i++) {
            if (this.collides(game.mobs[i])) {
                game.mobs[i].takeDamage(1);
                return true;
            }
        }

        this.location = this.location.add(this.direction.scale(PlayerBullet.SPEED).scale(msSinceLastFrame));

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
}

