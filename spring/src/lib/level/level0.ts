import { Wall } from "../actor/wall";
import { Game } from "../game";
import { Global } from "../util/global";
import { Rectangle } from "../util/rectangle";
import { Level } from "./level";

export class Level0 extends Level {
    override load(game: Game): void {
        for (let i = 0; i < Global.GRID_ROWS; i++) {
            for (let h = 1; h < 1 + (i / 10); h++) {
                game.walls.push(new Wall(game, new Rectangle(Wall.WIDTH * i, Global.ROWTOP(h), Wall.WIDTH, Wall.WIDTH), "green"));
            }
        }

    }

}