# Tetris

Tetris clone according to the 2009 Tetris Guideline specification.

## Use

Use in any modern browser.
No extra resources necessary; simply open index.html and all paths are relative.

### Controls

Controls are configured per Tetris Guideline specification for keyboard controls:

* Arrow Left: Move block left
* Arrow Right: Move block right
* Arrow Down: Move block down
* Arrow Up / X Key: Rotate Clockwise
* Control / Z Key: Rotate Counter-clockwise
* Space: Hard Drop
* Shift / C Key: Hold
* Escape / F1: Pause (Tracked but not implemented)

## Known problems:

Bugs:
* Occasionally, a race condition may cause a tetrimino spawn to load in a game over state.
  The cause of this problem is not known.
* Horizontal movement speed is non-standard.
* Hold tetrimino:
    * There are cases where a tetrimino may appear to fail when a rotation should cause a valid kick,
      but lines will clear as if the kick was successful.
    * When a tetrimino is held for the first time, it simultaneously continues to be held and
      exists in the playing field, resulting in a piece duplication.
      Subseqeuent holds function as expected.

Not implemented requirements of the Tetris Guideline:
* Lock delay. This was originally in the game but kept causing problems.
* Music and sound effects.
* Only Keyboard control.
* Score counter.
* Pause.
* Restart game.
