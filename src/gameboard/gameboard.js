const Ship = require("../ship/ship");
const shipTypes = require("../ship/shiptypes");
const myArray = require("../utilities/myArray");

const Gameboard = () => {
  // Todo: change methods to getters/setters
  const Square = () => {
    let isVacant = true;
    let intact = true;
    let shipPointer;

    const blowUp = () => {
      const report = { hit: false, sunk: false, type: "unknown" };
      intact = false;
      if (!isVacant) {
        report.hit = shipPointer.hit();
        if (shipPointer.isSunk()) {
          report.sunk = true;
          report.type = shipPointer.type;
        }
      }
      return report;
    };

    const occupy = (ship) => {
      isVacant = false;
      shipPointer = ship;
    };

    return {
      get vacancy() {
        return isVacant;
      },
      get status() {
        return intact;
      },
      blowUp,
      occupy,
    };
  };

  // occupiedForces, explodedForces will track game win conditions
  let occupiedForces = 0;
  let explodedForces = 0;

  // Create the board array
  const board = myArray(10, Square);

  // lower order fn for placeShip
  // returns 0 if placement is vacant
  // throws an error if occupied
  const checkVacancy = (length, coordinate, orientation) => {
    let vacancy = true;
    board.traverseBoard(length, coordinate, orientation, (square) => {
      vacancy = vacancy && square.vacancy;
    });
    if (vacancy) return 0;
    throw new Error("Placement is occupied");
  };

  const provisionAndAttachShip = (shipType, coordinate, orientation) => {
    const boatyMcBoatFace = Ship(shipType);
    const callback = (square) => square.occupy(boatyMcBoatFace);
    board.traverseBoard(shipTypes[shipType], coordinate, orientation, callback);
    return 0;
  };

  // check if placement is possible
  // if impossible, return rejecting promise
  // if possible:
  //    create ship
  //    fill squares with:
  //      callback for ship
  //      vacancy attribute
  /** shipType enumeration: {carrier:5, battleship:4, destroyer:3, submarine:3, patrolboat:2}
   ** startCoord: {row, column}
   ** orientation enumeration: horizontal, vertical
   */
  const placeShip = (shipType, startCoord, orientation) => {
    const length = shipTypes[shipType];
    try {
      board.checkCoordinates(length, startCoord, orientation);
      checkVacancy(length, startCoord, orientation);
      provisionAndAttachShip(shipType, startCoord, orientation);
      occupiedForces += 1;
    } catch (e) {
      return e.message;
    }
    return true;
  };

  /** Processes an attack on the passed coordinate
   **   input parameter coord:         {row, column}
   **   returns battle report object:  {hit, sunk, type}
   **
   */
  const receiveAttack = (coord) => {
    const square = board[coord.row][coord.column];
    try {
      if (!square.status) throw new Error("Position was already attacked");
      const battleReport = square.blowUp();
      if (battleReport.sunk) explodedForces += 1;
      return battleReport;
    } catch (e) {
      return e.message;
    }
  };

  return {
    placeShip,
    receiveAttack,
    get size() {
      return board.length;
    },
    get checkForVictory() {
      return occupiedForces === explodedForces;
    },
    board,
  };
};

module.exports = Gameboard;
