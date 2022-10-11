const Gameboard = () => {
  const Square = () => {
    let isVacant = true;
    let intact = true;
    let callback = () => "pasta";

    const fill = () => {
      isVacant = false;
    };

    const checkVacancy = () => isVacant;

    const blowUp = () => {
      intact = false;
    };

    const stillIntact = () => intact;

    const setCallback = (cbk) => {
      callback = cbk;
    };

    return {
      fill,
      checkVacancy,
      blowUp,
      stillIntact,
      setCallback,
      callback,
    };
  };

  // boardSize (length and width) used when initializing the board
  const boardSize = 10;
  // Board object is created by IIFE based on boardSize
  const board = (function initializeBoard() {
    const boardObj = {};
    for (let i = 0; i < boardSize; i += 1) {
      boardObj[i] = {};
      for (let j = 0; j < boardSize; j += 1) {
        boardObj[i][j] = Square();
      }
    }
    return boardObj;
  })();

  console.log(board);

  const placeShip = (shipType, startCoord, orientation) => {};

  const receiveAttack = (row, column) => {};

  return {
    placeShip,
    receiveAttack,
  };
};

Gameboard();

module.exports = Gameboard;
