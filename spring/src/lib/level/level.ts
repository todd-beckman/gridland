import { Wall } from "../actor/wall";
import { Game } from "../game";
import { Global } from "../util/global";
import { Rectangle } from "../util/rectangle";

export abstract class Level {
    get nextLevel(): Level { return null; }
    abstract get walls(): Map<number, number[]>;

    load(game: Game): void {
        this.walls.forEach((wallList, rowNum) => {
            for (let wall of wallList) {
                game.walls.push(new Wall(game,
                    new Rectangle(Wall.WIDTH * wall, Global.ROWTOP(rowNum + 1), Wall.WIDTH, Wall.WIDTH), "green"));
            }
        });
    }
}
