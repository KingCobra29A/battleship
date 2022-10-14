const Player = require("../player/player");
const Board = require("../gameboard/gameboard");

const GameLoop = async () => {
  const humanBoard = Board();
  const enemyBoard = Board();

  const human = Player("human", humanBoard, enemyBoard);
  const enemy = Player("computer", humanBoard, enemyBoard);

  //  SETUP BLOCK
  //  Ships get placed by each player
  //    Human player will place ships via UI. This will need to be via eventlistener
  //    Computer player will need algorithm inside player object to place ships
  await human.placeShips();
  await enemy.placeShips();

  //  INITIALIZATION BLOCK
  //  Game is now initialized to begin. Gameloop should notify UI
  //    At this point, board receives attacks, not ships
  const emitGameStartEvent = (() => {})();

  // TURN BLOCK
  // Check if game is won/lost
  //    if won/lost, goto endgame
  //    else
  //      Next player goes
  while (true) {
    await human.takeMove();
    if (enemyBoard.checkForVictory) {
      // Human player won
      break;
    }
    await enemy.takeMove();
    if (humanBoard.checkForVictory) {
      // Human player won
      break;
    }
  }

  // ENDGAME BLOCK
  const winner = enemyBoard.checkForVictory ? human : enemy;
  const emitGameWonEvent = ((winningPlayer) => {})(winner);

  return {};
};

module.exports = GameLoop;
