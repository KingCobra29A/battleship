const Ship = require("../ship/ship");

const Gameboard = () => {
  const shipTypes = {
    carrier: 5,
    battleship: 4,
    destroyer: 3,
    submarine: 3,
    patrolboat: 2,
  };

  // Todo: change methods to getters/setters
  const Square = () => {
    let isVacant = true;
    let intact = true;
    let shipPointer;
    let callback = () => "pasta";

    const blowUp = () => {
      intact = false;
    };

    return {
      blowUp,
      get vacancy() {
        return isVacant;
      },
      get status() {
        return intact;
      },
      set occupy(ship) {
        isVacant = false;
        shipPointer = ship;
      },
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

  // Error codes:
  //  10 : Coordinates are outside of bounds
  //  20 : Ship does not fit
  //  30 : garbage inputs
  //
  // lower order fn for placeShip
  const checkCoordinates = (length, coordinate, orientation) => {
    // check if starting coordinate is valid
    if (
      coordinate.row < 0 ||
      coordinate.row > boardSize - 1 ||
      coordinate.column < 0 ||
      coordinate.column > boardSize - 1
    ) {
      throw new Error("Coordinates are outside of bounds");
    }

    // check if ship fits within bounds
    if (
      (orientation === "horizontal" &&
        coordinate.column + length > boardSize) ||
      (orientation === "vertical" && coordinate.row + length > boardSize)
    ) {
      throw new Error("Ship does not fit");
    }

    // check if correct orientation was passed
    if (orientation !== "horizontal" && orientation !== "vertical") {
      throw new Error("Garbage inputs");
    }

    // No errors, so return resovled promise
    return 0;
  };

  // lower order fn which traverses the board, applies the callback to each square
  const traverseBoard = (length, coordinate, orientation, cbk) => {
    let traversingVar;
    let row;
    let column;
    if (orientation === "horizontal") {
      traversingVar = { value: coordinate.column };
      row = { value: coordinate.row };
      column = traversingVar;
    } else {
      traversingVar = { value: coordinate.row };
      row = traversingVar;
      column = { value: coordinate.column };
    }
    for (let i = 0; i < length; i += 1) {
      cbk(board[row.value][column.value]);
      traversingVar.value += 1;
    }
  };

  // lower order fn for placeShip
  // returns 0 if placement is vacant
  // returns 1 if placement is occupied
  const checkVacancy = (length, coordinate, orientation) => {
    let vacancy = true;
    traverseBoard(length, coordinate, orientation, (square) => {
      vacancy = vacancy && square.vacancy;
    });
    if (vacancy) return 0;
    throw new Error("Placement is occupied");
  };

  const provisionAndAttachShip = (length, coordinate, orientation) => {
    const boatyMcBoatFace = Ship(length);
    traverseBoard(length, coordinate, orientation, (square) => {
      square.occupy = boatyMcBoatFace;
    });
    return 0;
  };

  // check if placement is possible
  // if impossible, return rejecting promise
  // if possible:
  //    create ship
  //    fill squares with:
  //      callback for ship
  //      vacancy attribute
  /* shipType enumeration: {carrier:5, battleship:4, destroyer:3, submarine:3, patrolboat:2}
   ** startCoord: {row, column}
   ** orientation enumeration: horizontal, vertical
   */
  const placeShip = (shipType, startCoord, orientation) => {
    const length = shipTypes[shipType];
    try {
      checkCoordinates(length, startCoord, orientation);
      checkVacancy(length, startCoord, orientation);
      provisionAndAttachShip(length, startCoord, orientation);
    } catch (e) {
      return e.message;
    }
    return true;
  };

  const receiveAttack = (row, column) => {};

  return {
    placeShip,
    receiveAttack,
    get size() {
      return boardSize;
    },
  };
};

module.exports = Gameboard;
