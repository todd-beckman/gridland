import { Game } from "./lib/game";

let game: Game = new Game();
window.requestAnimationFrame(game.step.bind(game));