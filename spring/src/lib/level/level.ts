import { Wall } from "../actor/wall";
import { Game } from "../game";
import { Global } from "../util/global";
import { Rectangle } from "../util/rectangle";

export abstract class Level {
    get nextLevel(): Level { return null; }
    abstract get serialized(): string;

    load(game: Game): void {
        let rows = this.serialized.split("\n");
        for (let i = 0; i < rows.length; i++) {
            let row = rows[i];
            // This off by one is intentional
            // This makes things render on the first visible row, as 0 is just out of sight.
            let rowNum = rows.length - i;


            console.log("adding wall at row " + rowNum + " which is: " + row);

            for (let col = 0; col < row.length; col++) {
                switch (row.charAt(col)) {
                    case "G":
                        game.walls.push(new Wall(game,
                            new Rectangle(Wall.WIDTH * col, Global.ROWTOP(rowNum), Wall.WIDTH, Wall.WIDTH), "green"));

                        break;
                    default:
                }
            }
        }
    }
}
