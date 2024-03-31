import { Player } from "./actor/player";
import { Wall } from "./actor/wall";
import { FPS } from "./util/fps";
import { Global } from "./util/global";
import { Input } from "./util/input";
import { Rectangle } from "./util/rectangle";
import { WithCooldown } from "./util/with_cooldown";

enum MODE {
    READY = "READY",
    PLAY = "PLAY",
    GAME_OVER = "GAME OVER",
}

export class Game {
    static readonly HUD_TOP = 20;
    static readonly HUD_LEFT = Global.PLAY_AREA_WIDTH + 5;
    static readonly HUD_ROW_HEIGHT = Global.PLAY_AREA_HEIGHT / 20;

    private readonly fps = new FPS();
    private frameTime: number = Date.now();
    private readonly canvas: HTMLCanvasElement;
    private readonly ctx: CanvasRenderingContext2D;
    private readonly blinkGameOver = new WithCooldown(750);
    private showGameOver = false;
    private msSinceLastFrame: number = 0;
    private mode: MODE = MODE.READY;
    private highScore: number = 0;

    player: Player;
    walls: Wall[];
    score: number;

    constructor() {
        Input.init();
        this.canvas = document.getElementById("canvas") as HTMLCanvasElement;
        this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;

        this.initalizeState();
        window.requestAnimationFrame(this.step.bind(this));
    }

    private initalizeState() {
        this.score = 0;
        this.walls = [];
        for (let i = 0; i < 3; i++) {
            this.walls.push(new Wall(this, (Global.PLAY_AREA_WIDTH - Wall.RESPAWN_X) / 3 * i));
        }
        this.player = new Player(this);
        this.mode = MODE.PLAY;
    }

    private stepReady() {
        if (Input.JUMP.held) {
            this.initalizeState();
        }
    }

    private stepGame(): void {
        if (Input.DEBUG_ACTION_1.held) {
            return;
        }
        this.player.step(this.msSinceLastFrame);
        this.walls.forEach(wall => wall.step(this.msSinceLastFrame));
    }

    private stepGameOver(): void {
        this.blinkGameOver.step(this.msSinceLastFrame);
        if (this.blinkGameOver.checkAndTrigger) {
            this.showGameOver = !this.showGameOver;
        }
        if (Input.JUMP.held) {
            this.initalizeState();
            this.player.step(this.msSinceLastFrame);
        }
    }

    private draw(): void {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        Rectangle.PLAY_AREA.draw(this.ctx, Global.PLAYER_AREA_BACKGROUND_STYLE);

        this.player.draw(this.ctx);
        if (this.mode == MODE.PLAY) {
            this.walls.forEach(wall => wall.draw(this.ctx));
        }

        this.drawHUD();
        this.fps.draw(this.ctx);
    }

    private drawHUD(): void {
        Rectangle.HUD_AREA.draw(this.ctx, Global.HUD_AREA_BACKGROUND_STYLE);

        this.ctx.font = "20px courier";
        let row = 0;
        this.ctx.fillStyle = "blue";
        this.ctx.fillText("Score:      " + this.score, Game.HUD_LEFT, Game.HUD_TOP + row * Game.HUD_ROW_HEIGHT);

        row++;
        this.ctx.fillStyle = "red";
        this.ctx.fillText("High Score: " + this.highScore, Game.HUD_LEFT, Game.HUD_TOP + row * Game.HUD_ROW_HEIGHT);

        row++;
        switch (this.mode) {
            case MODE.READY:
            case MODE.GAME_OVER:
                this.ctx.fillStyle = "white";
                this.ctx.fillText("Touch or spacebar to start.", 50, Global.PLAY_AREA_HEIGHT / 2 - 100);

                break;
            case MODE.GAME_OVER:
                if (this.showGameOver) {
                    this.ctx.fillStyle = "red";
                    this.ctx.fillText("GAME OVER", Game.HUD_LEFT, Game.HUD_TOP + row * Game.HUD_ROW_HEIGHT);
                }
                break;
        }
    }

    gameOver(): void {
        this.mode = MODE.GAME_OVER;
    }

    // Public only for access from script.
    // There is probably a better way to do this.
    step(): void {
        let now = Date.now();
        this.msSinceLastFrame = now - this.frameTime;
        this.frameTime = now;
        this.fps.update(this.msSinceLastFrame);

        switch (this.mode) {
            case MODE.READY:
                this.stepReady();
                break;
            case MODE.PLAY:
                this.stepGame();
                break;
            case MODE.GAME_OVER:
                this.stepGameOver();
                break;
        }
        this.highScore = Math.max(this.score, this.highScore);

        Input.onFrameEnd();
        this.draw();
        window.requestAnimationFrame(this.step.bind(this));
    }
}