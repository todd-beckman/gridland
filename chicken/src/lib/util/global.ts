export const Global = Object.freeze({
    PLAY_AREA_WIDTH: 600,
    PLAY_AREA_HEIGHT: 600,
    SCREEN_WIDTH: 800,
    PLAYER_AREA_BACKGROUND_STYLE: "black",
    HUD_AREA_BACKGROUND_STYLE: "rgb(192,192,192)",
    MAX_FRAMEFRATE: 60 / 1000,

    GRAVITY_PER_MS: 0.05,

    CHICKEN_SPRITE: function (): HTMLImageElement {
        return document.getElementById("chicken") as HTMLImageElement;
    },

    CHICKEN_FLY_SPRITE: function (): HTMLImageElement {
        return document.getElementById("chicken-fly") as HTMLImageElement;
    },
});