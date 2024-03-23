import { Global } from "./util/global";
import { Input } from "./util/input";
import { Item, PointItem, PowerItem } from "./actors/friendly/item";
import { Player } from "./actors/friendly/player";
import { PlayerBullet } from "./actors/friendly/player_bullet";
import { Vector } from "./util/vector";
import { WithCooldown } from "./util/with_cooldown";

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

    msSinceLastFrame: number = 0;
    mode: MODE = MODE.PLAY;
    private score: number = 0;

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

        if (Input.DEBUG_SPAWN_ITEM.held && this.doDebug.checkAndTrigger(this.msSinceLastFrame)) {
            if (Math.random() < 0.5) {
                this.spawnPowerItem(this.player.location.add(new Vector(0, 200)));
            } else {
                this.spawnPointItem(this.player.location.add(new Vector(0, 200)));
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

    drawHUD() {
        this.ctx.fillStyle = "blue";
        this.ctx.font = "20px courier";
        let row = 0;
        this.ctx.fillText("Score: " + scoreToString(this.score), Game.HUD_LEFT, Game.HUD_TOP + row * Game.HUD_ROW_HEIGHT);
        row++;
        this.ctx.fillText("Power: " + powerToString(this.player.powerTier), Game.HUD_LEFT, Game.HUD_TOP + row * Game.HUD_ROW_HEIGHT);
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = "black";
        this.ctx.fillRect(Global.PLAY_AREA_LEFT, Global.PLAY_AREA_TOP, Global.PLAY_AREA_WIDTH, Global.PLAY_AREA_HEIGHT);

        this.player.draw(this.ctx);
        this.playerBullets.forEach(b => b.draw(this.ctx));

        this.items.forEach(i => i.draw(this.ctx));
        this.drawHUD();
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

    addScore(add: number) {
        this.score = Math.floor(this.score + add);
    }
}
