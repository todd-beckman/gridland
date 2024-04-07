import { Player } from "./actor/player";
import { Wall } from "./actor/wall";
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

        this.initalizeState();
        this.mode = MODE.READY;
        window.requestAnimationFrame(this.step.bind(this));
    }

    spawnParticleSystem(particleSystem: ParticleSystem): void {
        this.particleSystems.push(particleSystem);
    }

    followPlayerCamera(): void {
        // Add a tracker to tell if we have entered the desired zone since last changing direction

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

        if (this.player.lastFacingLeft) {
            this.camera = this.camera.addX(-cameraOffset);
            if (this.camera.x < wantX) {
                this.camera = new Vector(wantX, this.camera.y);
            } else if (this.camera.x > boundX) {
                this.camera = new Vector(boundX, this.camera.y);
            }
        } else {
            let newCameraLocation = this.camera.addX(cameraOffset);
            if (newCameraLocation.x > wantX) {
                this.camera = new Vector(wantX, this.camera.y);
            } else if (newCameraLocation.x < boundX) {
                this.camera = new Vector(boundX, this.camera.y);
            } else {
                this.camera = newCameraLocation;
            }
        }
    }

    wallsInXInterval(xmin: number, xmax: number): Wall[] {
        return this.walls.filter(wall => {
            return wall.region.inXInterval(xmin, xmax);
        });
    }

    private initalizeState() {
        this.score = 0;
        this.walls = [];
        this.particleSystems = [];
        this.player = new Player(this);
        this.mode = MODE.PLAY;

        for (let i = 0; i < Global.GRID_ROWS; i++) {
            for (let h = 1; h < 1 + (i / 10); h++) {
                this.walls.push(new Wall(this, new Rectangle(Wall.WIDTH * i, Global.ROWTOP(h), Wall.WIDTH, Wall.WIDTH), "green"));
            }
        }
    }

    private stepReady() {
        if (Input.JUMP.held) {
            this.initalizeState();
            this.player.step(this.msSinceLastFrame);
        }
    }

    private stepGame(): void {
        if (Input.DEBUG_ACTION_1.held) {
            // Testing freezing player

            let left = this.player.region.left;
            let right = this.player.region.right;
            let candidateWalls = this.wallsInXInterval(left, right);
            let collidingWalls = candidateWalls.filter(wall => {
                return this.player.region.collides(wall.region);
            });

            console.log("player at (" + left + "," + right +
                ") has the same interval as " + candidateWalls.length +
                " and collides with " + collidingWalls.length + ".");
        } else {
            this.player.step(this.msSinceLastFrame);
        }

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

        switch (this.mode) {
            case MODE.READY:
            case MODE.GAME_OVER:
                ctx.fillStyle = "white";
                ctx.fillText("Touch or spacebar to start.", 50, Global.PLAY_AREA_HEIGHT / 2 - 100);

                break;
            case MODE.GAME_OVER:
                if (this.showGameOver) {
                    ctx.fillStyle = "red";
                    ctx.fillText("GAME OVER", Global.HUD_LEFT, Global.HUD_TOP + Global.HUD_ROW_HEIGHT);
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