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
      shipPointer,
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

  // lower order fn for placeShip
  const checkCoordinates = (length, coordinate, orientation) => {
    // check if starting coordinate is valid
    if (
      coordinate.row < 0 ||
      coordinate.row > boardSize - 1 ||
      coordinate.column < 0 ||
      coordinate.column > boardSize - 1
    )
      return Promise.reject(new Error("Coordinates are outside of bounds"));
    // check if ship fits within bounds
    if (
      (orientation === "horizontal" &&
        coordinate.column + length > boardSize) ||
      (orientation === "vertical" && coordinate.row + length > boardSize)
    )
      return Promise.reject(new Error("Ship does not fit"));
    // check if correct orientation was passed
    if (orientation !== "horizontal" && orientation !== "vertical")
      return Promise.reject(new Error("Invalid orientation"));
    // No errors, so return resovled promise
    return Promise.resolve("Coordinates are within bounds");
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
  const checkVacancy = (length, coordinate, orientation) => {
    traverseBoard(length, coordinate, orientation, (square) => {
      console.log(square.checkVacancy());
      if (!square.checkVacancy()) {
        console.log("Placement is already occupied");
        return Promise.reject(new Error("Placement is already occupied"));
      }
    });
    console.log("Placement is possible");
    return Promise.resolve("Placement is possible");
  };

  const provisionAndAttachShip = (length, coordinate, orientation) => {
    const boatyMcBoatFace = Ship(length);
    traverseBoard(length, coordinate, orientation, (square) => {
      square.shipPointer = boatyMcBoatFace;
      console.log(square.checkVacancy());
      square.fill();
    });
    return Promise.resolve("Ship of length " + length + " was placed");
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
    let meow = checkCoordinates(length, startCoord, orientation)
      .then(
        () => checkVacancy(length, startCoord, orientation),
        (err) => Promise.reject(err)
      )
      .then(
        () => provisionAndAttachShip(length, startCoord, orientation),
        (err) => Promise.reject(err)
      )
      .catch((error) => console.log(error.message));

    return meow;
  };

  const receiveAttack = (row, column) => {};

  return {
    placeShip,
    receiveAttack,
  };
};

const testBoard = Gameboard();
testBoard
  .placeShip("battleship", { row: 0, column: 0 }, "horizontal")
  .then((data) => console.log(data));
testBoard
  .placeShip("battleship", { row: 0, column: 0 }, "horizontal")
  .then((data) => console.log(data));

module.exports = Gameboard;
