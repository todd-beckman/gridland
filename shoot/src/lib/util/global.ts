
/**
 * Defines global variables from which all other constants should be derived.
 */
export const Global = Object.freeze({
    /** 
     * Should be set to false before release.
     */
    DEBUG: true,

    /**
     * Where to render the top of the arena.
     * 
     * This should not be used outside of rendering, as the Y-Axis is inverted in world-space.
     */
    PLAY_AREA_TOP: 0,

    /**
     * Where to render the left of the arena.
     */
    PLAY_AREA_LEFT: 0,

    /**
     * The width of the arena, from which all %-based locations should be derived.
     */
    PLAY_AREA_WIDTH: 550,

    /**
     * The height of the arena, from which all %-based locations should be derived.
     */
    PLAY_AREA_HEIGHT: 600,
});