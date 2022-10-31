import Player from "../player/player";
import Board from "../gameboard/gameboard";
import PubSub from "../utilities/pubSub";

function displayTurn(player) {
  const message = player === "human" ? "Your turn" : "Computers turn";
  PubSub.publish("display-message", { message, duration: false });
}

function waitXmiliSec(x) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), x);
  });
}

const GameLoop = async () => {
  const humanBoard = Board();
  const enemyBoard = Board();

  const human = Player("human", humanBoard, enemyBoard);
  const enemy = Player("computer", enemyBoard, humanBoard);

  //  SETUP BLOCK
  //  Ships get placed by each player
  //    Human player will place ships via UI. This will need to be via eventlistener
  //    Computer player will need algorithm inside player object to place ships
  await human.placeShips();
  await enemy.placeShips();

  //  INITIALIZATION BLOCK
  //  Game is now initialized to begin. Gameloop should notify UI
  //    At this point, board receives attacks, not ships
  PubSub.publish("game-start", "");
  await waitXmiliSec(1000);

  // TURN BLOCK
  // Check if game is won/lost
  //    if won/lost, goto endgame
  //    else
  //      Next player goes
  while (true) {
    displayTurn("human");
    await human.takeMove();
    if (enemyBoard.checkForVictory) {
      // Human player won
      break;
    }
    displayTurn("computer");
    await enemy.takeMove();
    if (humanBoard.checkForVictory) {
      // Computer player won
      break;
    }
  }

  // ENDGAME BLOCK
  const winner = enemyBoard.checkForVictory ? "human" : "computer";
  PubSub.publish("game-won", winner);
};

export default GameLoop;
