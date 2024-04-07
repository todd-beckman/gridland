import { Player } from "./actor/player";
import { Wall } from "./actor/wall";
import { Level } from "./level/level";
import { Level0 } from "./level/level0";
import { FPS } from "./util/fps";
import { Global } from "./util/global";
import { Input } from "./util/input";
import { ParticleSystem } from "./util/particles";
import { Rectangle } from "./util/rectangle";
import { Vector } from "./util/vector";
import { WithCooldown } from "./util/with_cooldown";

enum MODE {
    READY = "READY",
    PLAY = "PLAY",
    GAME_OVER = "GAME OVER",
}

export class Game {
    private readonly fps = new FPS();
    private readonly blinkGameOver = new WithCooldown(750);
    private showGameOver = false;
    private frameTime: number = 0;
    private msSinceLastFrame: number = 0;
    private mode: MODE = MODE.READY;
    private highScore: number = 0;
    private camera: Vector = Vector.ZERO;
    private canvas: HTMLCanvasElement;
    private canvasContext: CanvasRenderingContext2D;

    private static readonly JUMP_DURATION_MS: number = 300;
    private static readonly JUMP_SCREEN_BOUNCE: number = 100;
    private currentLevel: Level;

    private bouncing: boolean = false;
    private bounceProgressMs: number = 0;
    private lerpBounceY(msSinceLastFrame: number): number {
        if (!this.bouncing) {
            return 0;
        }

        this.bounceProgressMs += msSinceLastFrame;
        let percentProgress = this.bounceProgressMs / Game.JUMP_DURATION_MS;
        if (percentProgress >= 1) {
            percentProgress = 1;
            this.bouncing = false;
            this.bounceProgressMs = 0;
            return 0;
        }

        let firstBounce = 0.7;
        if (percentProgress < firstBounce) {
            let magnitude = Math.sin(percentProgress / firstBounce * Math.PI);
            return (Game.JUMP_SCREEN_BOUNCE * magnitude);
        }

        let magnitude = Math.sin(percentProgress / (1 - firstBounce) * Math.PI);
        return (Game.JUMP_SCREEN_BOUNCE / 5 * magnitude);
    }

    player: Player;
    walls: Wall[];
    particleSystems: ParticleSystem[];
    score: number;

    constructor() {
        Input.init();
        this.canvas = document.getElementById("canvas") as HTMLCanvasElement;
        this.canvasContext = this.canvas.getContext("2d") as CanvasRenderingContext2D;
        if (window.innerWidth < Global.SCREEN_WIDTH ||
            window.innerHeight < Global.PLAY_AREA_HEIGHT) {
            let scaleWidth = window.innerWidth / Global.SCREEN_WIDTH;
            let scaleHeight = window.innerHeight / Global.PLAY_AREA_HEIGHT;
            let scale = Math.min(scaleHeight, scaleWidth);

            this.canvas.width *= scale;
            this.canvas.height *= scale;
            this.canvasContext.scale(scale, scale);
        }

        this.currentLevel = new Level0();
        this.initalizeState();
        this.mode = MODE.READY;
        window.requestAnimationFrame(this.step.bind(this));
    }

    spawnParticleSystem(particleSystem: ParticleSystem): void {
        this.particleSystems.push(particleSystem);
    }

    followPlayerCamera(): void {
        let playerCenter = this.player.region.center

        let wantX = playerCenter.x +
            (this.player.lastFacingLeft ?
                Global.GOAL_CAMERA_FOCUS_LEFT :
                Global.GOAL_CAMERA_FOCUS_RIGHT);

        let boundX = playerCenter.x +
            (this.player.lastFacingLeft ?
                Global.BOUND_CAMERA_FOCUS_LEFT :
                Global.BOUND_CAMERA_FOCUS_RIGHT);

        let cameraOffset = this.msSinceLastFrame * Global.CAMERA_SPEED_PER_MS;
        let cameraX = this.camera.x


        if (this.player.lastFacingLeft) {
            cameraX -= cameraOffset;
            if (cameraX < wantX) {
                cameraX = wantX;
            } else if (cameraX > boundX) {
                cameraX -= cameraOffset;
            }
        } else {
            cameraX += cameraOffset;
            if (cameraX > wantX) {
                cameraX = wantX;
            } else if (cameraX < boundX) {
                cameraX += cameraOffset;
            }
        }

        let cameraY = this.lerpBounceY(this.msSinceLastFrame);

        this.camera = new Vector(cameraX, cameraY);
    }

    wallsInXInterval(xmin: number, xmax: number): Wall[] {
        return this.walls.filter(wall => {
            return wall.region.inXInterval(xmin, xmax);
        });
    }

    doJump(): void {
        this.bouncing = true;
    }

    private initalizeState() {
        this.score = 0;
        this.walls = [];
        this.particleSystems = [];
        this.player = new Player(this);
        this.mode = MODE.PLAY;
        this.currentLevel.load(this);
    }

    private stepReady() {
        if (Input.JUMP.held) {
            this.initalizeState();
        }
    }

    private stepGame(): void {
        this.player.step(this.msSinceLastFrame);

        for (let i = this.particleSystems.length - 1; i >= 0; i--) {
            this.particleSystems[i].step(this.msSinceLastFrame);
            if (this.particleSystems[i].dead) {
                this.particleSystems.splice(i, 1);
            }
        }

        this.followPlayerCamera();
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
        let buffer = document.createElement("canvas");
        buffer.width = Global.PLAY_AREA_WIDTH;
        buffer.height = Global.PLAY_AREA_HEIGHT;
        let ctx = buffer.getContext("2d");

        Rectangle.PLAY_AREA.draw(ctx, Vector.ZERO, Global.PLAYER_AREA_BACKGROUND_STYLE);

        this.player.draw(ctx, this.camera);
        if (this.mode == MODE.PLAY) {
            this.walls.forEach(wall => wall.draw(ctx, this.camera));
            this.particleSystems.forEach(particleSystem => particleSystem.draw(ctx, this.camera));
        }

        this.drawHUD(ctx);
        this.fps.draw(ctx);

        this.canvasContext.drawImage(buffer, 0, 0);
    }

    private drawHUD(ctx: CanvasRenderingContext2D): void {
        Rectangle.HUD_AREA.draw(ctx, Vector.ZERO, Global.HUD_AREA_BACKGROUND_STYLE);
        ctx.font = "12pt courier";

        switch (this.mode) {
            case MODE.READY:
            case MODE.GAME_OVER:
                ctx.fillStyle = "white";
                ctx.fillText("Touch or spacebar to start.", 50, Global.PLAY_AREA_HEIGHT / 2 - 100);

                break;
            case MODE.GAME_OVER:
                if (this.showGameOver) {
                    ctx.fillStyle = "red";
                    ctx.fillText("GAME OVER", 20, 20);
                }
                break;
        }
    }

    gameOver(): void {
        this.mode = MODE.GAME_OVER;
    }

    // Public only for access from script.
    // There is probably a better way to do this.
    step(msSinceLoad: DOMHighResTimeStamp): void {
        let oldFrameTime = this.frameTime;
        this.frameTime = msSinceLoad;
        this.msSinceLastFrame = this.frameTime - oldFrameTime;
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

        let frameDuration = window.performance.now() - this.frameTime;
        let waitForNextFrame = Global.MAX_FRAMEFRATE - frameDuration;
        window.setTimeout(() => window.requestAnimationFrame(this.step.bind(this)), waitForNextFrame);
    }
}