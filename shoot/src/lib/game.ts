import { Global } from "./global";
import { Input } from "./input";
import { Item, PointItem, PowerItem } from "./item";
import { Player } from "./player";
import { PlayerBullet } from "./player_bullet";
import { Vector } from "./vector";

enum MODE {
    PLAY = "PLAY",
    GAME_OVER = "GAME OVER",
}

export class Game {
    private frameTime: number = Date.now();
    private debugItemSpawnTime: number = 0;
    private readonly canvas: HTMLCanvasElement;
    private readonly ctx: CanvasRenderingContext2D;
    msSinceLastFrame: number = 0;
    mode: MODE = MODE.PLAY;
    score: number;

    player: Player = new Player();
    playerBullets: PlayerBullet[] = [];
    items: Item[] = [];

    constructor() {
        Input.init();
        this.canvas = document.getElementById("canvas") as HTMLCanvasElement;
        this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
    }

    spawnPowerItem(location: Vector): void {
        this.items.push(new PowerItem(location));
    }

    spawnPointItem(location: Vector): void {
        this.items.push(new PointItem(location));
    }

    debug() {
        if (!Global.DEBUG) {
            return;
        }

        if (Input.DEBUG_SPAWN_ITEM.held) {
            if (100 <= this.frameTime - this.debugItemSpawnTime) {
                if (Math.random() < 0.5) {
                    this.spawnPowerItem(this.player.location.add(new Vector(0, 200)));
                } else {
                    this.spawnPointItem(this.player.location.add(new Vector(0, 200)));
                }
                this.debugItemSpawnTime = Date.now();
            }
        }
    }


    stepGame() {
        this.debug();
        this.player.updateOrDelete(this, this.msSinceLastFrame);

        for (let i = this.playerBullets.length - 1; i >= 0; i--) {
            if (this.playerBullets[i].updateOrDelete(this, this.msSinceLastFrame)) {
                this.playerBullets.splice(i, 1);
            }
        }

        for (let i = this.items.length - 1; i >= 0; i--) {
            if (this.items[i].updateOrDelete(this, this.msSinceLastFrame)) {
                this.items.splice(i, 1);
            }
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = "black";
        this.ctx.fillRect(Global.PLAY_AREA_LEFT, Global.PLAY_AREA_TOP, Global.PLAY_AREA_WIDTH, Global.PLAY_AREA_HEIGHT);

        this.player.draw(this.ctx);
        this.playerBullets.forEach(b => b.draw(this.ctx));

        this.items.forEach(i => i.draw(this.ctx));
    }

    step() {
        let now = Date.now();
        this.msSinceLastFrame = now - this.frameTime;
        this.frameTime = now;

        if (this.mode === MODE.PLAY) {
            this.stepGame();
        }

        Input.onFrameEnd();
        this.draw();
        window.requestAnimationFrame(this.step.bind(this));
    }
}
