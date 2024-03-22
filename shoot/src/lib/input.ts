export class Input {
    private id: string;
    private constructor(id: string) {
        this.id = id;
    }

    static inputs: Map<string, number> = new Map<string, number>();
    static LEFT = new Input("LEFT");
    static RIGHT = new Input("RIGHT");
    static UP = new Input("UP");
    static DOWN = new Input("DOWN");
    static FOCUS = new Input("FOCUS");
    static SHOOT = new Input("SHOOT");

    static DEBUG_SPAWN_ITEM = new Input("DEBUG_SPAWN_ITEM");

    static keyHandler(e: KeyboardEvent) {
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

    static init() {
        window.addEventListener("keyup", this.keyHandler.bind(this), true);
        window.addEventListener("keydown", this.keyHandler.bind(this), true);
    }

    get held(): number {
        return Input.inputs.get(this.id);
    }

    static onFrameEnd() {
        this.inputs.forEach((value, key) => {
            if (value > 0) {
                this.inputs.set(key, value + 1);
            }
        });
    }
};

