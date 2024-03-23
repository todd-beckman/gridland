/**
 * A singleton class tracking the input state.
 * At any given time, as long as {@link onFrameEnd()} is called,
 * any button's {@link held} represents the number of frames that
 * the button has been held.
 * 
 * If multiple input bottons are mapped to an input, they will
 * compete for onkeyup and onkeydown.
 * 
 * {@link init()} must be called exactly once globally.
 */
export class Input {
    private static initCalled = false;
    private id: string;
    private constructor(id: string) {
        this.id = id;
    }

    private static inputs: Map<string, number> = new Map<string, number>();

    /**
     * Tracks how many frame any Left input has been held.
     */
    static LEFT = new Input("LEFT");

    /**
     * Tracks how many frame any Right input has been held.
     */
    static RIGHT = new Input("RIGHT");

    /**
     * Tracks how many frame any Up input has been held.
     */
    static UP = new Input("UP");

    /**
     * Tracks how many frame any Down input has been held.
     */
    static DOWN = new Input("DOWN");

    /**
     * Tracks how many frame the Focus input has been held.
     */
    static FOCUS = new Input("FOCUS");

    /**
     * Tracks how many frame the Shoot Left input has been held.
     */
    static SHOOT = new Input("SHOOT");

    /**
     * Tracks how many frame any Debug input has been held.
     */

    static DEBUG_SPAWN_ITEM = new Input("DEBUG_SPAWN_ITEM");

    private static keyHandler(e: KeyboardEvent) {
        if (e.defaultPrevented || e.repeat) {
            return;
        }

        let value = e.type == "keydown" ? 1 : 0;

        switch (e.code) {
            case "ArrowUp":
            case "KeyW":
                Input.inputs.set(Input.UP.id, value);
                break;
            case "ArrowLeft":
            case "KeyA":
                Input.inputs.set(Input.LEFT.id, value);
                break;
            case "ArrowRight":
            case "KeyD":
                Input.inputs.set(Input.RIGHT.id, value);
                break;
            case "ArrowDown":
            case "KeyS":
                Input.inputs.set(Input.DOWN.id, value);
                break;
            case "ShiftLeft":
            case "ShiftRight":
                Input.inputs.set(Input.FOCUS.id, value);
                break;
            case "KeyZ":
            case "KeyF":
                Input.inputs.set(Input.SHOOT.id, value);
                break;
            case "KeyI":
                Input.inputs.set(Input.DEBUG_SPAWN_ITEM.id, value);
                break;
            default:
                return;
        }
    }

    /**
     * Wires up the required listeners.
     * 
     * This must be called exactly once per
     */
    static init() {
        if (Input.initCalled) {
            return;
        }
        window.addEventListener("keyup", this.keyHandler.bind(this), true);
        window.addEventListener("keydown", this.keyHandler.bind(this), true);
        Input.initCalled = true;
    }

    /**
     * The number of frames this input has been held.
     */
    get held(): number {
        return Input.inputs.get(this.id);
    }


    /**
     * Must be called after each frame. The duration of the frame is irrelevant.
     */
    static onFrameEnd() {
        this.inputs.forEach((value, key) => {
            if (value > 0) {
                this.inputs.set(key, value + 1);
            }
        });
    }
};

