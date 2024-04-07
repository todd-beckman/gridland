import { Wall } from "../actor/wall";
import { Game } from "../game";
import { Global } from "../util/global";
import { Rectangle } from "../util/rectangle";
import { Vector } from "../util/vector";
import { Level } from "./level";

export class Level0 extends Level {
    private static readonly SERIALIZED: string = `
                  G
                  G                              G
                 GG                              G
                GGG               GG  GG         G
GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG  GGGGGGGGGGGG`;
    get serialized(): string {
        return Level0.SERIALIZED;
    }
}