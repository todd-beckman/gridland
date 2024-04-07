import { Wall } from "../actor/wall";
import { Game } from "../game";
import { Global } from "../util/global";
import { Rectangle } from "../util/rectangle";
import { Vector } from "../util/vector";
import { Level } from "./level";

export class Level0 extends Level {
    readonly walls: Map<number, number[]> = new Map<number, number[]>([
        // This is super unreadable lol
        [2, [5, 7]],
        [1, [4, 5, 6, 7]],
        [0, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]],
    ]);
}