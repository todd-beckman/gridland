import { Global } from "./util/global";
import { Input } from "./util/input";
import { Item, PointItem, PowerItem } from "./actors/friendly/item";
import { Player } from "./actors/friendly/player";
import { PlayerBullet } from "./actors/friendly/player_bullet";
import { Vector } from "./util/vector";
import { WithCooldown } from "./util/with_cooldown";
import { Enemy } from "./actors/enemies/enemy";
import { LinearPath } from "./util/path";
import { BasicMob } from "./actors/enemies/basic_mob";
import { FPS } from "./util/fps";

enum MODE {
    PLAY = "PLAY",
    GAME_OVER = "GAME OVER",
}

function scoreToString(score: number): string {
    let thousandsSegment = Math.floor(score % 1000).toString().padStart(3, "0");
    let millionsSegment = Math.floor((score / 1000) % 1000).toString().padStart(3, "0");
    let billionsSegment = Math.floor((score / 1000000) % 1000).toString().padStart(3, " ");
    return billionsSegment + "," + millionsSegment + "," + thousandsSegment;
}

function powerToString(power: number): string {
    return "".padStart(power - 3, " ").padEnd(power + 1, "*");
}

export class Game {
    static readonly HUD_TOP = Global.PLAY_AREA_TOP + 20;
    static readonly HUD_LEFT = Global.PLAY_AREA_LEFT + Global.PLAY_AREA_WIDTH + 5;
    static readonly HUD_ROW_HEIGHT = Global.PLAY_AREA_HEIGHT / 20;

    private frameTime: number = Date.now();
    private readonly canvas: HTMLCanvasElement;
    private readonly ctx: CanvasRenderingContext2D;
    private readonly doDebug = new WithCooldown(100);
    private readonly fps = new FPS();

    msSinceLastFrame: number = 0;
    mode: MODE = MODE.PLAY;
    private score: number = 0;

    player: Player = new Player();
    playerBullets: PlayerBullet[] = [];
    items: Item[] = [];
    enemies: Enemy[] = [];

    constructor() {
        Input.init();
        this.canvas = document.getElementById("canvas") as HTMLCanvasElement;
        this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
        window.requestAnimationFrame(this.step.bind(this));
    }

    // ACTIONS

    /**
     * @param item The item to spawn into the game.
     * @param location If provided, moves the item to this location.
     */
    spawnItem(item: Item, location?: Vector): void {
        if (typeof location !== "undefined") {
            item.location = location;
        }
        this.items.push(item);
    }

    /**
     * @param items The items to spawn into the game.
     * @param location If provided, moves all of the items to this location.
     */
    spawnItems(items: Item[], location?: Vector): void {
        items.forEach(item => this.spawnItem(item, location));
    }

    addScore(add: number): void {
        this.score = Math.floor(this.score + add);
    }

    spawnEnemy(enemy: Enemy): void {
        this.enemies.push(enemy);
    }

    // UTILITIES

    /**
     * @returns whether the bounding box of the given circle is outside of the playable area.
     */
    outOfBounds(location: Vector, radius: number): boolean {
        let left = location.x - radius;
        let right = location.x + radius
        let bottom = location.y - radius;
        let top = location.y + radius

        return left > Global.PLAY_AREA_WIDTH ||
            bottom > Global.PLAY_AREA_HEIGHT ||
            top < 0 || right < 0;
    }

    // INTERNAL

    private debug(): void {
        if (!Global.DEBUG) {
            return;
        }

        if (Input.DEBUG_ACTION.held && this.doDebug.checkAndTrigger(this.msSinceLastFrame)) {
            let location = this.player.location.addY(200);
            let velocity =
                [
                    Vector.UP, Vector.UP_LEFT, Vector.RIGHT, Vector.DOWN_RIGHT,
                    Vector.DOWN, Vector.DOWN_LEFT, Vector.LEFT, Vector.UP_LEFT,
                ]
                [Math.floor(Math.random() * 8)].scale(0.05);

            let path = new LinearPath(location, velocity);
            let mob = new BasicMob(path, 10, () => {
                return [
                    new PointItem(Vector.ZERO),
                    new PointItem(Vector.ZERO),
                    new PointItem(Vector.ZERO),
                    new PowerItem(Vector.ZERO),
                    new PowerItem(Vector.ZERO),
                ];
            });
            this.spawnEnemy(mob);
        }
    }

    private stepGame(): void {
        this.debug();
        this.player.updateOrDelete(this, this.msSinceLastFrame);

        for (let i = this.items.length - 1; i >= 0; i--) {
            if (this.items[i].updateOrDelete(this, this.msSinceLastFrame)) {
                this.items.splice(i, 1);
            }
        }

        for (let i = this.playerBullets.length - 1; i >= 0; i--) {
            if (this.playerBullets[i].updateOrDelete(this, this.msSinceLastFrame)) {
                this.playerBullets.splice(i, 1);
            }
        }

        for (let i = this.enemies.length - 1; i >= 0; i--) {
            if (this.enemies[i].updateOrDelete(this, this.msSinceLastFrame)) {
                this.enemies.splice(i, 1);
            }
        }
    }

    private drawHUD(): void {
        this.ctx.fillStyle = "blue";
        this.ctx.font = "20px courier";
        let row = 0;
        this.ctx.fillText("Score: " + scoreToString(this.score), Game.HUD_LEFT, Game.HUD_TOP + row * Game.HUD_ROW_HEIGHT);
        this.ctx.fillStyle = "red";
        row++;
        this.ctx.fillText("Power: " + powerToString(this.player.powerTier), Game.HUD_LEFT, Game.HUD_TOP + row * Game.HUD_ROW_HEIGHT);
    }

    private draw(): void {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.fps.draw(this.ctx);

        this.ctx.fillStyle = "black";
        this.ctx.fillRect(Global.PLAY_AREA_LEFT, Global.PLAY_AREA_TOP, Global.PLAY_AREA_WIDTH, Global.PLAY_AREA_HEIGHT);

        this.player.draw(this.ctx);
        this.playerBullets.forEach(b => b.draw(this.ctx));
        this.items.forEach(i => i.draw(this.ctx));
        this.enemies.forEach(e => e.draw(this.ctx));

        this.drawHUD();
    }

    // Public only for access from script.
    // There is probably a better way to do this.
    step(): void {
        let now = Date.now();
        this.msSinceLastFrame = now - this.frameTime;
        this.frameTime = now;
        this.fps.update(this.msSinceLastFrame);

        if (this.mode === MODE.PLAY) {
            this.stepGame();
        }

        Input.onFrameEnd();
        this.draw();
        window.requestAnimationFrame(this.step.bind(this));
    }
}
