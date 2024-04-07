import { Game } from "../game";

export abstract class Level {
    abstract load(game: Game): void;
    get next(): Level { return null; }
}