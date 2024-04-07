/**
 * A singleton class tracking the input state.
 * At any given time, as long as {@link onFrameEnd()} is called,
 * any button's {@link held} represents the number of frames that
 * the button has been held.
 * 
 * If multiple input buttons are mapped to an input, they will
 * compete for onkeyup and onkeydown.
 * 
 * {@link init()} must be called exactly once globally.
 */
export class Input {
    private static initCalled = false;
    private id: string;
    private removeAfterFrame: boolean = false;
    private framesHeld: number = 0;

    private constructor(id: string) {
        this.id = id;
        Input.inputs.set(id, this);
    }

    private static inputs: Map<string, Input> = new Map<string, Input>();

    static JUMP = new Input("SPACE");
    static LEFT = new Input("LEFT");
    static RIGHT = new Input("RIGHT");

    static DEBUG_ACTION_1 = new Input("DEBUG_ACTION_1");
    static DEBUG_ACTION_2 = new Input("DEBUG_ACTION_2");

    private static keyHandler(e: KeyboardEvent) {
        if (e.defaultPrevented || e.repeat) {
            return;
        }

        let value = e.type == "keydown" ? 1 : 0;
        switch (e.code) {
            case "KeyD":
            case "ArrowRight":
                Input.inputs.get(Input.RIGHT.id).applyChange(value);
                break;
            case "KeyA":
            case "ArrowLeft":
                Input.inputs.get(Input.LEFT.id).applyChange(value);
                break;
            case "Space":
                Input.inputs.get(Input.JUMP.id).applyChange(value);
                break;
            case "KeyU":
                Input.inputs.get(Input.DEBUG_ACTION_1.id).applyChange(value);
                break;
            default:
                return;
        }
    }

    private static touchHandler(e: KeyboardEvent) {
        if (e.defaultPrevented || e.repeat) {
            return;
        }

        let value = e.type == "touchstart" ? 1 : 0;
        Input.inputs.get(Input.JUMP.id).applyChange(value);
        e.preventDefault();
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

        window.addEventListener("touchstart", this.touchHandler.bind(this), true);
        window.addEventListener("touchend", this.touchHandler.bind(this), true);
        Input.initCalled = true;
    }

    /**
     * The number of frames this input has been held.
     */
    get held(): number {
        return this.framesHeld;
    }

    private applyChange(value: number) {
        if (value == 0 && this.framesHeld == 1) {
            this.removeAfterFrame = true;
        } else {
            this.framesHeld = value;
            this.removeAfterFrame = false;
        }
    }

    private increment() {
        if (this.removeAfterFrame && this.framesHeld > 1) {
            this.framesHeld = 0;
        }
        if (this.framesHeld > 0) {
            this.framesHeld++;
        }
    }


    /**
     * Must be called after each frame. The duration of the frame is irrelevant.
     */
    static onFrameEnd() {
        this.inputs.forEach((input) => input.increment());
    }
};

