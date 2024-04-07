export class Global {
    static readonly PLAY_AREA_WIDTH = 600;
    static readonly PLAY_AREA_HEIGHT = 600;
    static readonly GRID_CELL_SIZE = 50;
    static readonly GRID_ROWS = Global.PLAY_AREA_HEIGHT - Global.GRID_CELL_SIZE;
    static readonly SCREEN_WIDTH = 800;
    static readonly PLAYER_AREA_BACKGROUND_STYLE = "black";
    static readonly HUD_AREA_BACKGROUND_STYLE = "rgb(192,192,192)";
    static readonly MAX_FRAMEFRATE = 60 / 1000;
    static readonly GRAVITY_PER_MS = 0.05;

    static readonly HUD_TOP = 20;
    static readonly HUD_LEFT = Global.PLAY_AREA_WIDTH + 5;
    static readonly HUD_ROW_HEIGHT = Global.PLAY_AREA_HEIGHT / 20;

    static readonly CAMERA_SPEED_PER_MS = 0.2;
    static readonly GOAL_CAMERA_FOCUS_RIGHT = -Global.PLAY_AREA_WIDTH / 4;
    static readonly GOAL_CAMERA_FOCUS_LEFT = -3 * Global.PLAY_AREA_WIDTH / 4;
    static readonly BOUND_CAMERA_FOCUS_RIGHT = -Global.PLAY_AREA_WIDTH / 2;
    static readonly BOUND_CAMERA_FOCUS_LEFT = -Global.PLAY_AREA_WIDTH / 2;

    static ROWTOP(row: number) {
        return this.PLAY_AREA_HEIGHT - Math.floor(row * this.GRID_CELL_SIZE);
    }
}