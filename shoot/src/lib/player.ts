import { Vector } from "./vector";
import { Actor } from "./actor";
import { Global } from "./global";
import { Input } from "./input";
import { PlayerBullet } from "./player_bullet";
import { Game } from "./game";

export class Player implements Actor {
    static readonly FIRE_RATE = 70;
    static readonly FOCUS_SPEED = 0.10;
    static readonly FAST_SPEED = 0.25;
    static readonly START_X = Global.PLAY_AREA_WIDTH / 2;
    static readonly START_Y = Global.PLAY_AREA_HEIGHT / 4;
    static readonly HURTBOX_RADIUS = 4;
    static readonly HURTBOX_RADIUS_SQUARED = Player.HURTBOX_RADIUS * Player.HURTBOX_RADIUS;

    static readonly GRAZEBOX_RADIUS = 8;
    static readonly GRAZEBOX_RADIUS_SQUARED = Player.GRAZEBOX_RADIUS * Player.GRAZEBOX_RADIUS;

    static readonly ITEMBOX_RADIUS = 20
    static readonly ITEMBOX_RADIUS_SQUARED = Player.ITEMBOX_RADIUS * Player.ITEMBOX_RADIUS;

    static readonly BULLET_SPREAD = 17;
    static readonly BULLET_OFFSET_SPAWN = Player.BULLET_SPREAD / 2
    static readonly BULLET_ANGLE = 0.2;
    static readonly BULLET_FOCUS_ANGLE = 0.05;

    static readonly HURTBOX = "red";
    static readonly GRAZEBOX = "yellow";
    static readonly ITEMBOX = "green";
    static readonly ITEM_GET_BORDER_LINE = Global.PLAY_AREA_HEIGHT * 3 / 4;

    private powerLevel: number = 0;
    private fireCooldown: number = 0;
    location: Vector = new Vector(Player.START_X, Player.START_Y);

    get radiusSquared(): number {
        return Player.HURTBOX_RADIUS_SQUARED;
    }

    updateOrDelete(game: Game, msSinceLastFrame: number) {
        this.shoot(game, msSinceLastFrame);

        this.location = this.pushIntoBounds(
            this.location.add(
                this.moveDirection.scale(
                    this.moveSpeed(msSinceLastFrame))));

        if (this.location.y >= Player.ITEM_GET_BORDER_LINE) {
            this.collectItems(game);
        }

        for (let i = game.items.length - 1; i >= 0; i--) {
            if (game.items[i].collides(this.location, Player.ITEMBOX_RADIUS_SQUARED)) {
                game.items[i].onCollect(game);
                game.items.splice(i, 1);
            }
        }

        return false;
    }

    draw(ctx: CanvasRenderingContext2D) {
        let canvasLocation = this.location.toScreenSpace;

        ctx.fillStyle = Player.ITEMBOX;
        ctx.fillRect(
            canvasLocation.x - Player.ITEMBOX_RADIUS,
            canvasLocation.y - Player.ITEMBOX_RADIUS,
            Player.ITEMBOX_RADIUS * 2,
            Player.ITEMBOX_RADIUS * 2,
        );

        ctx.fillStyle = Player.GRAZEBOX;
        ctx.fillRect(
            canvasLocation.x - Player.GRAZEBOX_RADIUS,
            canvasLocation.y - Player.GRAZEBOX_RADIUS,
            Player.GRAZEBOX_RADIUS * 2,
            Player.GRAZEBOX_RADIUS * 2,
        );

        ctx.fillStyle = Player.HURTBOX;
        ctx.fillRect(
            canvasLocation.x - Player.HURTBOX_RADIUS,
            canvasLocation.y - Player.HURTBOX_RADIUS,
            Player.HURTBOX_RADIUS * 2,
            Player.HURTBOX_RADIUS * 2,
        );
    }

    collectPowerItem() {
        this.powerLevel = Math.min(40, this.powerLevel + 1);
    }

    collectPointItem(game: Game) {
        game.score += (this.location.y / Global.PLAY_AREA_HEIGHT) * 1000;
    }

    private get playerLeftBulletSpawn(): Vector {

        return this.location.add(new Vector(-Player.BULLET_OFFSET_SPAWN, 0));
    }

    private get playerRightBulletSpawn(): Vector {
        return this.location.add(new Vector(Player.BULLET_OFFSET_SPAWN, 0));
    }

    private collectItems(game: Game) {
        game.items.forEach(i => i.chasePlayer());
    }

    private get powerTier() {
        if (this.powerLevel < 10) {
            return 0;
        }
        if (this.powerLevel < 20) {
            return 1;
        }
        if (this.powerLevel < 30) {
            return 2;
        }
        return 3;
    }

    private spawnCenterStream(game: Game): void {
        game.playerBullets.push(new PlayerBullet(this.location, Vector.UP));
    }

    private spawnSideStreams(game: Game, spreadAngle: number): void {
        game.playerBullets.push(new PlayerBullet(this.playerLeftBulletSpawn, new Vector(-spreadAngle, 1)));
        game.playerBullets.push(new PlayerBullet(this.playerRightBulletSpawn, new Vector(spreadAngle, 1)));
    }

    private spawnPlayerBullets(game: Game): void {
        let spreadAngle = Input.FOCUS.held ? Player.BULLET_FOCUS_ANGLE : Player.BULLET_ANGLE;

        switch (this.powerTier) {
            case 0:
                this.spawnSideStreams(game, 0);
                break;
            case 1:
                this.spawnCenterStream(game,);
                this.spawnSideStreams(game, spreadAngle);
                break;
            case 2:
                this.spawnSideStreams(game, 0);
                this.spawnSideStreams(game, spreadAngle);
                break;
            case 3:
                this.spawnSideStreams(game, 0);
                this.spawnSideStreams(game, spreadAngle);
                this.spawnSideStreams(game, spreadAngle * 2);
                break;
        }
    }

    private shoot(game: Game, msSinceLastFrame: number): void {
        this.fireCooldown = Math.max(this.fireCooldown - msSinceLastFrame, 0);

        if (Input.SHOOT.held) {
            if (this.fireCooldown == 0) {
                this.spawnPlayerBullets(game);
                this.fireCooldown = Player.FIRE_RATE;
            }
        }
    }

    private get moveDirection(): Vector {
        let up = Input.UP.held;
        let right = Input.RIGHT.held;
        let down = Input.DOWN.held;
        let left = Input.LEFT.held;

        let vertical = -1 * (down ? 1 : 0) + (up ? 1 : 0);
        let horizontal = -1 * (left ? 1 : 0) + (right ? 1 : 0);

        switch (vertical) {
            case -1:
                switch (horizontal) {
                    case -1:
                        return Vector.DOWN_LEFT;
                    case 1:
                        return Vector.DOWN_RIGHT;
                    case 0:
                        return Vector.DOWN;
                }
            case 1:
                switch (horizontal) {
                    case -1:
                        return Vector.UP_LEFT;
                    case 1:
                        return Vector.UP_RIGHT;
                    case 0:
                        return Vector.UP;
                }
            case 0:
                switch (horizontal) {
                    case -1:
                        return Vector.LEFT;
                    case 1:
                        return Vector.RIGHT;
                }
        }
        return Vector.ZERO;
    }

    private moveSpeed(msSinceLastFrame: number): number {
        return (Input.FOCUS.held ? Player.FOCUS_SPEED : Player.FAST_SPEED) * msSinceLastFrame;
    }

    private pushIntoBounds(location: Vector): Vector {
        let newLocation = location;
        if (newLocation.x - Player.GRAZEBOX_RADIUS < 0) {
            newLocation = new Vector(Player.GRAZEBOX_RADIUS, newLocation.y);
        }
        if (newLocation.y - Player.GRAZEBOX_RADIUS < 0) {
            newLocation = new Vector(newLocation.x, Player.GRAZEBOX_RADIUS);
        }
        if (newLocation.x + Player.GRAZEBOX_RADIUS >= Global.PLAY_AREA_WIDTH) {
            newLocation = new Vector(Global.PLAY_AREA_WIDTH - Player.GRAZEBOX_RADIUS, newLocation.y);
        }
        if (newLocation.y + Player.GRAZEBOX_RADIUS >= Global.PLAY_AREA_HEIGHT) {
            newLocation = new Vector(newLocation.x, Global.PLAY_AREA_HEIGHT - Player.GRAZEBOX_RADIUS);
        }
        return newLocation;
    }

    collides(otherLocation: Vector, otherRadiusSquared: number): boolean {
        return this.location.distanceSquared(otherLocation) <= this.radiusSquared + otherRadiusSquared;
    }
}