import Ship from "../ship/ship";
import shipTypes from "../ship/shiptypes";
import myArray from "../utilities/myArray";

const Gameboard = () => {
  // Todo: change methods to getters/setters
  const Square = () => {
    let isVacant = true;
    let intact = true;
    let shipPointer;
    let shipLocations; // { length, coordinate, orientation }

    const blowUp = () => {
      const report = {
        intact: false,
        hit: false,
        sunk: false,
        type: false,
        graveyard: false,
      };
      intact = false;
      if (!isVacant) {
        report.hit = shipPointer.hit();
        if (shipPointer.isSunk()) {
          report.sunk = true;
          report.type = shipPointer.type;
          report.graveyard = shipLocations;
        }
      }
      return report;
    };

    const occupy = (ship, placementInfo) => {
      isVacant = false;
      shipPointer = ship;
      shipLocations = placementInfo;
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
  const checkVacancy = (type, coordinate, orientation) => {
    let vacancy = true;
    const length = shipTypes[type];
    board.checkCoordinates(length, coordinate, orientation);
    board.traverseBoard(length, coordinate, orientation, (square) => {
      vacancy = vacancy && square.vacancy;
    });
    if (vacancy) return 0;
    throw new Error("Placement is occupied");
  };

  const provisionAndAttachShip = (shipType, coordinate, orientation) => {
    const boatyMcBoatFace = Ship(shipType);
    const length = shipTypes[shipType];
    const placementInfo = { length, coordinate, orientation };
    const callback = (square) => square.occupy(boatyMcBoatFace, placementInfo);
    board.traverseBoard(length, coordinate, orientation, callback);
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
    try {
      checkVacancy(shipType, startCoord, orientation);
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
      battleReport.coord = coord;
      if (battleReport.sunk === true) explodedForces += 1;
      return battleReport;
    } catch (e) {
      return e.message;
    }
  };

  return {
    placeShip,
    checkVacancy,
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

export default Gameboard;
