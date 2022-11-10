"use strict";
(self["webpackChunkbattleship"] = self["webpackChunkbattleship"] || []).push([["main"],{

/***/ "./src/gameboard/gameboard.js":
/*!************************************!*\
  !*** ./src/gameboard/gameboard.js ***!
  \************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _ship_ship__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../ship/ship */ "./src/ship/ship.js");
/* harmony import */ var _ship_shiptypes__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../ship/shiptypes */ "./src/ship/shiptypes.js");
/* harmony import */ var _utilities_myArray__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utilities/myArray */ "./src/utilities/myArray.js");



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
        graveyard: false
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
      occupy
    };
  };

  // occupiedForces, explodedForces will track game win conditions
  let occupiedForces = 0;
  let explodedForces = 0;

  // Create the board array
  const board = (0,_utilities_myArray__WEBPACK_IMPORTED_MODULE_2__["default"])(10, Square);

  // lower order fn for placeShip
  // returns 0 if placement is vacant
  // throws an error if occupied
  const checkVacancy = (type, coordinate, orientation) => {
    let vacancy = true;
    const length = _ship_shiptypes__WEBPACK_IMPORTED_MODULE_1__["default"][type];
    board.checkCoordinates(length, coordinate, orientation);
    board.traverseBoard(length, coordinate, orientation, square => {
      vacancy = vacancy && square.vacancy;
    });
    if (vacancy) return 0;
    throw new Error("Placement is occupied");
  };
  const provisionAndAttachShip = (shipType, coordinate, orientation) => {
    const boatyMcBoatFace = (0,_ship_ship__WEBPACK_IMPORTED_MODULE_0__["default"])(shipType);
    const length = _ship_shiptypes__WEBPACK_IMPORTED_MODULE_1__["default"][shipType];
    const placementInfo = {
      length,
      coordinate,
      orientation
    };
    const callback = square => square.occupy(boatyMcBoatFace, placementInfo);
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
  const receiveAttack = coord => {
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
    board
  };
};
/* harmony default export */ __webpack_exports__["default"] = (Gameboard);

/***/ }),

/***/ "./src/gameloop/gameloop.js":
/*!**********************************!*\
  !*** ./src/gameloop/gameloop.js ***!
  \**********************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _player_player__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../player/player */ "./src/player/player.js");
/* harmony import */ var _gameboard_gameboard__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../gameboard/gameboard */ "./src/gameboard/gameboard.js");
/* harmony import */ var _utilities_pubSub__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utilities/pubSub */ "./src/utilities/pubSub.js");



function displayTurn(player) {
  const message = player === "human" ? "Your turn" : "Computers turn";
  _utilities_pubSub__WEBPACK_IMPORTED_MODULE_2__["default"].publish("display-message", {
    message,
    duration: false
  });
}
function waitXmiliSec(x) {
  return new Promise(resolve => {
    setTimeout(() => resolve(), x);
  });
}
const GameLoop = async () => {
  const humanBoard = (0,_gameboard_gameboard__WEBPACK_IMPORTED_MODULE_1__["default"])();
  const enemyBoard = (0,_gameboard_gameboard__WEBPACK_IMPORTED_MODULE_1__["default"])();
  const human = (0,_player_player__WEBPACK_IMPORTED_MODULE_0__["default"])("human", humanBoard, enemyBoard);
  const enemy = (0,_player_player__WEBPACK_IMPORTED_MODULE_0__["default"])("computer", enemyBoard, humanBoard);

  //  SETUP BLOCK
  //  Ships get placed by each player
  //    Human player will place ships via UI. This will need to be via eventlistener
  //    Computer player will need algorithm inside player object to place ships
  await human.placeShips();
  await enemy.placeShips();

  //  INITIALIZATION BLOCK
  //  Game is now initialized to begin. Gameloop should notify UI
  //    At this point, board receives attacks, not ships
  _utilities_pubSub__WEBPACK_IMPORTED_MODULE_2__["default"].publish("game-start", "");
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
  _utilities_pubSub__WEBPACK_IMPORTED_MODULE_2__["default"].publish("game-won", winner);
};
/* harmony default export */ __webpack_exports__["default"] = (GameLoop);

/***/ }),

/***/ "./src/player/manageShipSearch.js":
/*!****************************************!*\
  !*** ./src/player/manageShipSearch.js ***!
  \****************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _ship_shiptypes__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../ship/shiptypes */ "./src/ship/shiptypes.js");

const shipSearch = () => {
  let remainingShips = ["carrier", "battleship", "destroyer", "submarine", "patrolboat"];
  function remove(ship) {
    remainingShips = remainingShips.filter(e => e !== ship);
  }
  function getlengths() {
    return remainingShips.map(e => _ship_shiptypes__WEBPACK_IMPORTED_MODULE_0__["default"][e]);
  }
  function largest() {
    return Math.max(...remainingShips);
  }
  function smallest() {
    return Math.min(...remainingShips);
  }
  return {
    remove,
    getlengths,
    largest,
    smallest,
    get ships() {
      return remainingShips;
    }
  };
};
/* harmony default export */ __webpack_exports__["default"] = (shipSearch);

/***/ }),

/***/ "./src/player/player.js":
/*!******************************!*\
  !*** ./src/player/player.js ***!
  \******************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _utilities_pubSub__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utilities/pubSub */ "./src/utilities/pubSub.js");
/* harmony import */ var _ship_shiptypes__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../ship/shiptypes */ "./src/ship/shiptypes.js");
/* harmony import */ var _view_coordSelectorTools__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../view/coordSelectorTools */ "./src/view/coordSelectorTools.js");
/* harmony import */ var _utilities_myArray__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../utilities/myArray */ "./src/utilities/myArray.js");
/* harmony import */ var _random__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./random */ "./src/player/random.js");
/* harmony import */ var _manageShipSearch__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./manageShipSearch */ "./src/player/manageShipSearch.js");







// utility function for passing coordinates to gameboard
//    passCoord(2,9) returns { row:2 , column:9 }
const passCoord = (row, column) => ({
  row,
  column
});
const Player = (typeIn, playerBoard, enemyBoard) => {
  const type = typeIn;
  const garrison = playerBoard;
  const battlefield = enemyBoard;
  const attackEvent = type === "human" ? "player-attack-result" : "enemy-attack-result";
  const remainingShips = (0,_manageShipSearch__WEBPACK_IMPORTED_MODULE_5__["default"])();
  function getNeighbors(coord, dir) {
    const returnSet = [];
    const checkLow = num => num - 1 > -1;
    const checkHigh = num => num + 1 < 10;
    const {
      row
    } = coord;
    const {
      column
    } = coord;
    if (dir === "horizontal") {
      if (checkLow(column)) returnSet.push({
        row,
        column: coord.column - 1
      });
      if (checkHigh(column)) returnSet.push({
        row,
        column: coord.column + 1
      });
    } else if (dir === "vertical") {
      if (checkLow(row)) returnSet.push({
        row: coord.row - 1,
        column
      });
      if (checkHigh(row)) returnSet.push({
        row: coord.row + 1,
        column
      });
    } else {
      if (checkLow(column)) returnSet.push({
        row,
        column: coord.column - 1
      });
      if (checkHigh(column)) returnSet.push({
        row,
        column: coord.column + 1
      });
      if (checkLow(row)) returnSet.push({
        row: coord.row - 1,
        column
      });
      if (checkHigh(row)) returnSet.push({
        row: coord.row + 1,
        column
      });
    }
    return returnSet;
  }

  // Used in checkMove
  // returns false if the coord is valid
  // returns true if the coord is invalid
  function validateCoordRange(coord) {
    if (coord > -1 && coord < 10) return false;
    return true;
  }

  // battlePlan factory function is used by computer player
  //  is responsible for determining each move taken by AI
  const battlePlan = (() => {
    const objProto = {
      hit: false,
      sunk: false,
      intact: true,
      heur: 0
    };
    const pastMoves = (0,_utilities_myArray__WEBPACK_IMPORTED_MODULE_3__["default"])(10, () => structuredClone(objProto));
    let highestHeuristic = 0;

    // turnLatch, turnPromise, turnPromiseResolver all used by human player
    let turnLatch = 1;
    let turnPromise;
    let turnPromiseResolver = () => {};

    // Returns true if the coord has not yet been attacked
    //  returns false otherwise
    const checkMove = coord => {
      if (validateCoordRange(coord.row) || validateCoordRange(coord.column)) {
        return false;
      }
      if (pastMoves[coord.row][coord.column].intact === true) {
        return true;
      }
      return false;
    };

    // Returns a random coord that has not yet been attacked
    // If optionalSet paramter is passed, return a random coord from that set
    // Otherwise return a random, unattacked coord
    const randomMove = optionalSet => {
      let coord;
      const coordGenerator = typeof optionalSet === "undefined" ? _random__WEBPACK_IMPORTED_MODULE_4__["default"].coord : _random__WEBPACK_IMPORTED_MODULE_4__["default"].fromSet(optionalSet);
      do {
        coord = coordGenerator();
      } while (!checkMove(coord));
      return coord;
    };

    // eval function used to see if a square has an unsunk ship
    function evalUnsunk(report) {
      return report.hit && !report.sunk;
    }
    // eval function to see if a square has not been hit
    function evalUnhit(report) {
      return report.intact === true;
    }

    // Checks to see if a ship could exist at passed placement info
    function checkFit(length, coord, ori) {
      let fits = true;
      try {
        pastMoves.checkCoordinates(length, coord, ori);
        pastMoves.traverseBoard(length, coord, ori, report => {
          fits = fits && report.intact;
        });
      } catch {
        // Error was thrown due to imposible placement
        return false;
      }
      return fits;
    }
    function heurPlusOne(length, coord, ori) {
      pastMoves.traverseBoard(length, coord, ori, report => {
        report.heur += 1;
        if (report.heur > highestHeuristic) highestHeuristic = report.heur;
      });
    }
    function updateReportHeur(length, coord) {
      const fitsHorizontally = checkFit(length, coord, "horizontal");
      const fitsVertically = checkFit(length, coord, "vertical");
      if (fitsHorizontally === true) heurPlusOne(length, coord, "horizontal");
      if (fitsVertically === true) heurPlusOne(length, coord, "vertical");
    }
    function updateHeuristicValue() {
      // Reset the heuristic values
      highestHeuristic = 0;
      pastMoves.applyToEach(report => {
        report.heur = 0;
      });
      // get the ship lengths that remain
      const lengths = remainingShips.getlengths();
      // iterate across each report in the pastmoves array
      for (let i = 0; i < 10; i += 1) {
        for (let j = 0; j < 10; j += 1) {
          let thisCoord = passCoord(i, j);
          // iterate across each remaining ship length
          for (let k = 0; k < lengths.length; k += 1) {
            updateReportHeur(lengths[k], thisCoord);
          }
        }
      }
    }
    function getHighestHeuristicSet() {
      const coords = [];
      for (let i = 0; i < 10; i += 1) {
        for (let j = 0; j < 10; j += 1) {
          if (pastMoves[i][j].heur === highestHeuristic) {
            coords.push(passCoord(i, j));
          }
        }
      }
      return coords;
    }

    // returns the first "unsunk" coordinate with attackable adjacent squares
    function findUnsunkShip() {
      // incremened incase more than on linearSearch is necessary
      let nthMatch = 0;
      // look for an unsunk ship
      let unsunk = pastMoves.linearSearch(evalUnsunk, nthMatch);
      // if there is none, return false
      if (unsunk === false) return false;
      while (!pastMoves.checkAdjacent(unsunk, evalUnhit)) {
        nthMatch += 1;
        unsunk = pastMoves.linearSearch(evalUnsunk, nthMatch);
      }
      return unsunk;
    }

    // Function used by computer player to decide where to attack
    const decideMove = () =>
    // Create and return an unresolved promise
    new Promise(resolve => {
      let attackCoord;
      let coordinateSet;
      let unsunk;
      let unsunkAttempt2;
      const timeoutDelay = 100;
      /*
       *  Decide where to attack block
       */
      // Check to see if there are any partially damaged ships
      //    if so, continue to target them
      unsunk = findUnsunkShip();
      if (unsunk === false) {
        // No partially damaged ships;
        // calculate hurisitc value for each square
        updateHeuristicValue();
        // find set of squares with the highest heuristic value
        const mostProbableLocations = getHighestHeuristicSet();
        //  attack randomly based on heuristic function
        attackCoord = randomMove(mostProbableLocations);
      } else if (pastMoves.checkAdjacent(unsunk, evalUnsunk, "horizontal")) {
        try {
          // attack horizontally
          coordinateSet = getNeighbors(unsunk, "horizontal");
          attackCoord = randomMove(coordinateSet);
        } catch {
          try {
            // find the last element in this row
            unsunkAttempt2 = pastMoves.lastInRow(unsunk, evalUnsunk);
            // get its horizontal neighbors
            coordinateSet = getNeighbors(unsunkAttempt2, "horizontal");
            // attack horizontally
            attackCoord = randomMove(coordinateSet);
          } catch {
            // attack vertically
            coordinateSet = getNeighbors(unsunk, "vertical");
            attackCoord = randomMove(coordinateSet);
          }
        }
      } else {
        try {
          // attack vertically
          coordinateSet = getNeighbors(unsunk, "vertical");
          attackCoord = randomMove(coordinateSet);
        } catch {
          try {
            // find the last element in this column
            unsunkAttempt2 = pastMoves.lastInColumn(unsunk, evalUnsunk);
            // get its vertical neighbors
            coordinateSet = getNeighbors(unsunkAttempt2, "vertical");
            // attack vertically
            attackCoord = randomMove(coordinateSet);
          } catch {
            // attack horizontally
            coordinateSet = getNeighbors(unsunk, "horizontal");
            attackCoord = randomMove(coordinateSet);
          }
        }
      }

      // Resolve the promise with the desired coordinate
      setTimeout(() => resolve(attackCoord), timeoutDelay);
    });

    //  Invoked on "player-attack" event
    function resolveTurnPromise(coord) {
      // if turn latch is "closed", do nothing
      if (turnLatch === 1) {
        turnPromiseResolver(coord);
        // "close" turn latch
        turnLatch = 0;
      }
    }

    //  Used in decideHumanMove method
    function resetTurnPromise() {
      //  Overwrite old turn promise with new turn promise
      turnPromise = new Promise(resolve => {
        //  make the resolver available to battlePlan root scope
        //  this will be used by resolveTurnPromise on "player-attack" event
        turnPromiseResolver = resolve;
      });
      //  "open" turn latch
      turnLatch = 1;
      //  return the (currently) unfulfilled promise
      return turnPromise;
    }

    // Used in takeMove to remember the result of each move
    // Updates elements of the pastMoves array to hold the attack report
    function remember(report) {
      const {
        row
      } = report.coord;
      const {
        column
      } = report.coord;
      pastMoves[row][column] = report;
      // if the ship is sunk, update all relevant reports to reflect this
      if (report.sunk === true) {
        // delete the ship from the search
        remainingShips.remove(report.type);
        // get all relevant coordinates
        const coordsToUpdate = _view_coordSelectorTools__WEBPACK_IMPORTED_MODULE_2__["default"].getCoordinateList(report.graveyard.length, report.graveyard.coordinate, report.graveyard.orientation);
        // update sunk, graveyard properties for each coordinate
        for (let i = 0; i < coordsToUpdate.length; i += 1) {
          const r = coordsToUpdate[i][0];
          const c = coordsToUpdate[i][1];
          pastMoves[r][c].sunk = true;
          pastMoves[r][c].graveyard = report.graveyard;
        }
      }
    }
    return {
      remember,
      resetTurnPromise,
      resolveTurnPromise,
      checkMove,
      decideMove
    };
  })();

  //  Used in takeMove method
  //  Publishes the attackEvent (defined at root of Player object
  //    attack event is either "player-attack-result" or "enemy-attack-result"
  //  Notifies the View Module of the attack result so the DOM can be updated
  function publishMove(report) {
    _utilities_pubSub__WEBPACK_IMPORTED_MODULE_0__["default"].publish(attackEvent, report);
  }

  //  Used by human player to attack enemy board via UI
  //  Returns an unfulfilled promise
  //    The promise is later resolved by battleplan.resolveTurnPromise on "player-attack" event
  async function decideMoveHuman() {
    return battlePlan.resetTurnPromise();
  }

  // HACK Does not work as is.
  //  should not throw an error.needs to do own error handling.
  //  should not finish until viable move has been taken
  const takeMove = async () => {
    const chooseAttackFn = type === "human" ? decideMoveHuman : battlePlan.decideMove;
    const attackCoord = await chooseAttackFn();
    if (battlePlan.checkMove(attackCoord)) {
      const report = battlefield.receiveAttack(attackCoord);
      battlePlan.remember(report);
      publishMove(report);
      return Promise.resolve(true);
    }
    throw new Error("Repeat move");
  };

  // Used by computer player in placeShipsAuto
  //  Input parameters are the ship placement info
  //  returns false if the surronding area is empty
  //    throws an error otherwise
  function checkSeclusion(currentType, randomChoice, orientation) {
    const length = _ship_shiptypes__WEBPACK_IMPORTED_MODULE_1__["default"][currentType];
    // create array of coordinate objects
    const allCoords = _view_coordSelectorTools__WEBPACK_IMPORTED_MODULE_2__["default"].allCoords(length, randomChoice, orientation);
    // checkAdjacent returns false if everything is vacant
    // each call to an elements callback should return false if vacant
    const outerVacancyFn = garrison.board.checkAdjacent;
    // square.vacancy returns true if vacant
    const innerVacancyFn = square => !square.vacancy;
    for (let i = 0; i < allCoords.length; i += 1) {
      if (outerVacancyFn(allCoords[i], innerVacancyFn)) throw new Error("Too crowded");
    }
    return false;
  }

  // Used by computer player to place ships
  //    algorithm is used to decide locations
  //    ships are placed synchronously via Gameboard.placeShip() method
  //    a promise is returned in order to avoid zalgo inside of Player.placeShips()
  const placeShipsAuto = () => {
    for (let i = 0; i < Object.keys(_ship_shiptypes__WEBPACK_IMPORTED_MODULE_1__["default"]).length; i += 1) {
      // initialize while loop condition
      let shipIsNotPlaced = true;
      // initialize/declare parameters for ship placement
      const currentType = Object.keys(_ship_shiptypes__WEBPACK_IMPORTED_MODULE_1__["default"])[i];
      let randomChoice;
      let orientation;
      while (shipIsNotPlaced) {
        try {
          // select random coordinate
          randomChoice = _random__WEBPACK_IMPORTED_MODULE_4__["default"].coord();
          // select random orientation
          orientation = _random__WEBPACK_IMPORTED_MODULE_4__["default"].orientation();
          // check if the random placement is unoccupied
          garrison.checkVacancy(currentType, randomChoice, orientation);
          // check if all adjacent squares are secluded
          checkSeclusion(currentType, randomChoice, orientation);
          // Place the ship
          garrison.placeShip(currentType, randomChoice, orientation);
          shipIsNotPlaced = false;
        } catch {
          // Either the placement was occupied, or the neighborhood was busy
          //   either way, try again, since shipIsNotPlaced === true
        }
      }
    }
    return Promise.resolve(true);
  };

  //  Subscription to "place-*****" event (passed as shipEvent)
  //  Creates and returns a promise.
  //  On shipEvent, The promise is resolved with the event payload
  async function waitForPlacement(shipEvent) {
    // Create a promise
    return new Promise(resolve => {
      // Subscribe to shipEvent. Resolve the promise when the event happens
      _utilities_pubSub__WEBPACK_IMPORTED_MODULE_0__["default"].subscribe(shipEvent, data => {
        resolve(data);
      });
    });
  }

  //  Wrapper around GameBoard.placeShip
  //    Makes a call to the method using a promise which contains the relevant parameters
  const placeShipFromPromiseResult = placement => {
    garrison.placeShip(placement.type, placement.coordinate, placement.orientation);
  };

  //  Used by human player to place ships via UI
  //    pub/sub pattern is used here between View, Player
  const placeShipsUI = async () => {
    const carrierPromise = waitForPlacement("place-carrier");
    const battleshipPromise = waitForPlacement("place-battleship");
    const submarinePromise = waitForPlacement("place-submarine");
    const destroyerPromise = waitForPlacement("place-destroyer");
    const patrolboatPromise = waitForPlacement("place-patrolboat");
    let placement;

    // Recieve placement of Carrier
    placement = await carrierPromise;
    placeShipFromPromiseResult(placement);
    placement = await battleshipPromise;
    placeShipFromPromiseResult(placement);
    placement = await destroyerPromise;
    placeShipFromPromiseResult(placement);
    placement = await submarinePromise;
    placeShipFromPromiseResult(placement);
    placement = await patrolboatPromise;
    placeShipFromPromiseResult(placement);
    return Promise.resolve(true);
  };

  // Used in game loop to place all of the players ships
  const placeShips = async () => {
    const placeShipsFunction = type === "human" ? placeShipsUI : placeShipsAuto;
    await placeShipsFunction();
    return Promise.resolve(true);
  };

  /**
   **  Publish Events:
   **    place-ship-hover-result
   **
   **  Subscribe Events:
   **     place-ship-hover
   */
  function initShipPlacementSubscriptions() {
    _utilities_pubSub__WEBPACK_IMPORTED_MODULE_0__["default"].subscribe("place-ship-hover", data => {
      try {
        garrison.checkVacancy(data.type, data.coordinate, data.orientation);
        _utilities_pubSub__WEBPACK_IMPORTED_MODULE_0__["default"].publish("place-ship-hover-result", 1);
      } catch {
        _utilities_pubSub__WEBPACK_IMPORTED_MODULE_0__["default"].publish("place-ship-hover-result", 0);
      }
    });
  }

  /**
   **  Publish Events:
   **    none
   **
   **  Subscribe Events:
   **     game-start
   **     player-attack
   */
  function initTakeTurnSubscriptions() {
    _utilities_pubSub__WEBPACK_IMPORTED_MODULE_0__["default"].subscribe("game-start", () => {
      _utilities_pubSub__WEBPACK_IMPORTED_MODULE_0__["default"].subscribe("player-attack", data => {
        //  Check to see if the square has already been attacked
        if (battlePlan.checkMove(data)) {
          //  attack is possible, resolve battlePlan.turnPromise
          battlePlan.resolveTurnPromise(data);
        }
      });
    });
  }
  function initEventSubscriptions() {
    if (type === "human") {
      initShipPlacementSubscriptions();
      initTakeTurnSubscriptions();
    }
  }
  initEventSubscriptions();
  return {
    takeMove,
    placeShips
  };
};
/* harmony default export */ __webpack_exports__["default"] = (Player);

/***/ }),

/***/ "./src/player/random.js":
/*!******************************!*\
  !*** ./src/player/random.js ***!
  \******************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
// utility function for passing coordinates to gameboard
//    passCoord(2,9) returns { row:2 , column:9 }
const passCoord = (row, column) => ({
  row,
  column
});
const random = (() => {
  // Used in randomMove
  // returns a random coord between {row:0, column:0} and {row:9, column:9}
  function coord() {
    const randomRow = Math.floor(Math.random() * 10);
    const randomColumn = Math.floor(Math.random() * 10);
    return passCoord(randomRow, randomColumn);
  }

  // Used in placeShipsAuto
  // either returns "horizontal" or "vertical"
  function orientation() {
    const randomIndex = Math.round(Math.random());
    const val = randomIndex === 0 ? "horizontal" : "vertical";
    return val;
  }

  // Used in randomMove
  // returns a function which can be called (without parameters)
  //  to return a random element fromt he original set parameter
  function fromSet(set) {
    const {
      length
    } = set;
    const possibleCoords = set;
    // store which indexs have been used so far, so that no index is returned twice
    const usedIndexes = [];
    return function getRandomCoordFromSet() {
      // if we have used up all possible indexes, throw an error
      if (usedIndexes.length === possibleCoords.length) {
        throw new Error("out of choices");
      }

      // create a random index
      let randomindex = Math.floor(Math.random() * length);
      // if the index has been used already, create more until we find an unused one
      if (usedIndexes.includes(randomindex)) {
        for (let i = 0; i < 100; i += 1) {
          randomindex = Math.floor(Math.random() * length);
          if (!usedIndexes.includes(randomindex)) {
            break;
          }
        }
      }
      usedIndexes.push(randomindex);
      // return the coordinate at the index we have found
      return possibleCoords[randomindex];
    };
  }
  return {
    coord,
    orientation,
    fromSet
  };
})();
/* harmony default export */ __webpack_exports__["default"] = (random);

/***/ }),

/***/ "./src/ship/ship.js":
/*!**************************!*\
  !*** ./src/ship/ship.js ***!
  \**************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _shiptypes__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./shiptypes */ "./src/ship/shiptypes.js");

const Ship = typeIn => {
  const shiptype = typeIn;
  const length = _shiptypes__WEBPACK_IMPORTED_MODULE_0__["default"][shiptype];
  let hits = 0;
  const hit = () => {
    if (hits < length) {
      hits += 1;
      return true;
    }
    return false;
  };
  const isSunk = () => {
    if (hits === length) return true;
    return false;
  };
  return {
    hit,
    isSunk,
    get type() {
      return shiptype;
    }
  };
};
/* harmony default export */ __webpack_exports__["default"] = (Ship);

/***/ }),

/***/ "./src/ship/shiptypes.js":
/*!*******************************!*\
  !*** ./src/ship/shiptypes.js ***!
  \*******************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
const shipTypes = {
  carrier: 5,
  battleship: 4,
  destroyer: 3,
  submarine: 3,
  patrolboat: 2
};
/* harmony default export */ __webpack_exports__["default"] = (shipTypes);

/***/ }),

/***/ "./src/utilities/myArray.js":
/*!**********************************!*\
  !*** ./src/utilities/myArray.js ***!
  \**********************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
const myArray = (sizeIn, populator) => {
  const size = sizeIn;
  const array2D = function initializeArray() {
    const boardObj = [];
    for (let i = 0; i < size; i += 1) {
      boardObj[i] = Array.from({
        length: size
      });
      for (let j = 0; j < size; j += 1) {
        boardObj[i][j] = populator();
      }
    }
    return boardObj;
  }();

  // lower order fn for placeShip
  array2D.checkCoordinates = (length, coordinate, orientation) => {
    // check if starting coordinate is valid
    if (coordinate.row < 0 || coordinate.row > size - 1 || coordinate.column < 0 || coordinate.column > size - 1) {
      throw new Error("Coordinates are outside of bounds");
    }

    // check if ship fits within bounds
    if (orientation === "horizontal" && coordinate.column + length > size || orientation === "vertical" && coordinate.row + length > size) {
      throw new Error("Object does not fit");
    }

    // check if correct orientation was passed
    if (orientation !== "horizontal" && orientation !== "vertical") {
      throw new Error("Garbage inputs");
    }

    // No errors, so return resovled promise
    return 0;
  };

  // lower order fn which traverses the board, applies the callback to each square
  array2D.traverseBoard = (length, coordinate, orientation, cbk) => {
    let traversingVar;
    let row;
    let column;
    if (orientation === "horizontal") {
      traversingVar = {
        value: coordinate.column
      };
      row = {
        value: coordinate.row
      };
      column = traversingVar;
    } else {
      traversingVar = {
        value: coordinate.row
      };
      row = traversingVar;
      column = {
        value: coordinate.column
      };
    }
    for (let i = 0; i < length; i += 1) {
      cbk(array2D[row.value][column.value]);
      traversingVar.value += 1;
    }
  };

  // Applies a callback to elements adjacent to coordinate
  // if the callback returns true on any "checked" element, returns true
  //  else returns false
  // dir parameter:
  //    undefined: all four adjacent elements are checked
  //    "horizontal": only two horizontal neighbors are checked
  //    "vertical": only two vertical neighbors are checked
  array2D.checkAdjacent = (coordinate, cbk, dir) => {
    const {
      row
    } = coordinate;
    const {
      column
    } = coordinate;
    let val = false;
    function action(r, c) {
      val = val || cbk(array2D[r][c]);
    }
    if (typeof dir === "undefined") {
      if (row - 1 > -1) action(row - 1, column);
      if (row + 1 < size - 1) action(row + 1, column);
      if (column - 1 > -1) action(row, column - 1);
      if (column + 1 < size - 1) action(row, column + 1);
    } else if (dir === "horizontal") {
      if (column - 1 > -1) action(row, column - 1);
      if (column + 1 < size - 1) action(row, column + 1);
    } else {
      if (row - 1 > -1) action(row - 1, column);
      if (row + 1 < size - 1) action(row + 1, column);
    }
    return val;
  };

  // Applies the cbk to each element of the array
  //  returns the index (in coord form) of the first element for which cbk evaluates to true
  array2D.linearSearch = (cbk, nthMatch) => {
    let thisMatch = 0;
    for (let i = 0; i < size; i += 1) {
      for (let j = 0; j < size; j += 1) {
        if (cbk(array2D[i][j])) {
          if (thisMatch === nthMatch) return {
            row: i,
            column: j
          };
          thisMatch += 1;
        }
      }
    }
    return false;
  };

  // applies the callback to each element in the array
  array2D.applyToEach = cbk => {
    for (let i = 0; i < size; i += 1) {
      for (let j = 0; j < size; j += 1) {
        cbk(array2D[i][j]);
      }
    }
  };

  // returns the coord of each element for which the callback evaluates true
  array2D.eachCoord = cbk => {
    const arr = [];
    for (let i = 0; i < size; i += 1) {
      for (let j = 0; j < size; j += 1) {
        if (cbk(array2D[i][j])) {
          arr.push({
            row: i,
            column: j
          });
        }
      }
    }
    return arr;
  };
  array2D.lastInRow = (startingCoord, cbk) => {
    const {
      row
    } = startingCoord;
    const {
      column
    } = startingCoord;
    let columnResult = column;
    for (let i = column; i < size; i += 1) {
      if (cbk(array2D[row][i])) {
        columnResult = i;
      } else {
        break;
      }
    }
    return {
      row,
      column: columnResult
    };
  };
  array2D.lastInColumn = (startingCoord, cbk) => {
    const {
      row
    } = startingCoord;
    const {
      column
    } = startingCoord;
    let rowResult = row;
    for (let i = row; i < size; i += 1) {
      if (cbk(array2D[i][column])) {
        rowResult = i;
      } else {
        break;
      }
    }
    return {
      row: rowResult,
      column
    };
  };
  return array2D;
};
/* harmony default export */ __webpack_exports__["default"] = (myArray);

/***/ }),

/***/ "./src/utilities/pubSub.js":
/*!*********************************!*\
  !*** ./src/utilities/pubSub.js ***!
  \*********************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
const PubSub = (() => {
  let subscribers = {};
  function publish(eventName, data) {
    if (!Array.isArray(subscribers[eventName])) {
      return;
    }
    subscribers[eventName].forEach(callback => {
      callback(data);
    });
  }
  function subscribe(eventName, callback) {
    if (!Array.isArray(subscribers[eventName])) {
      subscribers[eventName] = [];
    }
    subscribers[eventName].push(callback);
  }
  function reset() {
    subscribers = {};
  }
  return {
    publish,
    subscribe,
    reset
  };
})();
/* harmony default export */ __webpack_exports__["default"] = (PubSub);

/***/ }),

/***/ "./src/utilities/removeChildren.js":
/*!*****************************************!*\
  !*** ./src/utilities/removeChildren.js ***!
  \*****************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
function removeChildren() {
  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }
  for (let i = 0; i < args.length; i += 1) {
    while (args[i].firstChild) {
      args[i].removeChild(args[i].lastChild);
    }
  }
}
/* harmony default export */ __webpack_exports__["default"] = (removeChildren);

/***/ }),

/***/ "./src/view/coordSelectorTools.js":
/*!****************************************!*\
  !*** ./src/view/coordSelectorTools.js ***!
  \****************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
const coordTools = (() => {
  //  Used to create an array of coord arrays
  //  ex: getcoordinateList(4, {row:0, column:0}, horizontal)
  //    will return: [[0,0],[0,1],[0,2],[0,3]]
  function getCoordinateList(length, coord, ori) {
    const coords = [];
    let {
      row
    } = coord;
    let {
      column
    } = coord;
    for (let i = 0; i < length; i += 1) {
      coords.push([row, column]);
      if (ori === "horizontal") {
        column += 1;
      } else {
        row += 1;
      }
    }
    return coords;
  }
  function allCoords(length, coord, ori) {
    const coords = [];
    let {
      row
    } = coord;
    let {
      column
    } = coord;
    for (let i = 0; i < length; i += 1) {
      coords.push({
        row,
        column
      });
      if (ori === "horizontal") {
        column += 1;
      } else {
        row += 1;
      }
    }
    return coords;
  }

  // Used in getAllSelectors
  //  is passed an array: [row, column]
  //  returns a css selector
  function makeSelectorFromArray(coordArr) {
    const row = coordArr[0];
    const column = coordArr[1];
    return `.grid-square[data-row="${row}"].grid-square[data-column="${column}"]`;
  }

  // Iterates through an array of coord arrays,
  //   returns a css selector which will grab all relevant dom elements
  function getAllSelectors(coordList) {
    let selector = makeSelectorFromArray(coordList[0]);
    const {
      length
    } = coordList;
    for (let i = 1; i < length; i += 1) {
      selector = `${selector},${makeSelectorFromArray(coordList[i])}`;
    }
    return selector;
  }
  return {
    getCoordinateList,
    makeSelectorFromArray,
    getAllSelectors,
    allCoords
  };
})();
/* harmony default export */ __webpack_exports__["default"] = (coordTools);

/***/ }),

/***/ "./src/view/getCoordFromElement.js":
/*!*****************************************!*\
  !*** ./src/view/getCoordFromElement.js ***!
  \*****************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
// Helper function for queryPlacement
// Input parameter element is expected to be a "grid-square"
// returns coordinate object which can be used by the player object
function getCoordFromElement(element) {
  const row = Number(element.getAttribute("data-row"));
  const column = Number(element.getAttribute("data-column"));
  return {
    row,
    column
  };
}
/* harmony default export */ __webpack_exports__["default"] = (getCoordFromElement);

/***/ }),

/***/ "./src/view/shipPlaceControls.js":
/*!***************************************!*\
  !*** ./src/view/shipPlaceControls.js ***!
  \***************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _utilities_pubSub__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utilities/pubSub */ "./src/utilities/pubSub.js");
/* harmony import */ var _getCoordFromElement__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./getCoordFromElement */ "./src/view/getCoordFromElement.js");
/* harmony import */ var _coordSelectorTools__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./coordSelectorTools */ "./src/view/coordSelectorTools.js");
/* harmony import */ var _ship_shiptypes__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../ship/shiptypes */ "./src/ship/shiptypes.js");





/*  Factory function
 ** Returns a controller to handle the ship placement controls
 ** Used in gameReset(), gameStart()
 **
 */
function ShipPlaceControls() {
  const hoverController = new AbortController();
  const placeController = new AbortController();
  const waters = document.querySelector(".allied-waters");
  let currentSquare;
  let currentPlacementInfo;
  const shipTypesArr = ["carrier", "battleship", "destroyer", "submarine", "patrolboat"];
  let currentShipPlacement = 0;
  const controlDomElements = document.querySelectorAll(".place-ship-control");
  const orientations = ["horizontal", "vertical"];
  let currentOrientation = 0;
  let placeShipLatch = false;
  function displayShipPlacementMessage() {
    if (currentShipPlacement < shipTypesArr.length) {
      const message = `Place your ${shipTypesArr[currentShipPlacement]}`;
      _utilities_pubSub__WEBPACK_IMPORTED_MODULE_0__["default"].publish("display-message", {
        message,
        duration: false
      });
    }
  }
  function displayPlacementPossibilityMessage(possible) {
    let message;
    if (possible === true) {
      message = `${shipTypesArr[currentShipPlacement]} can be placed here`;
    } else {
      message = `${shipTypesArr[currentShipPlacement]} does not fit here`;
    }
    _utilities_pubSub__WEBPACK_IMPORTED_MODULE_0__["default"].publish("display-message", {
      message,
      duration: 1000
    });
  }
  function changeOrientationListener() {
    const btn = document.getElementById("orientation-btn");
    const {
      signal
    } = hoverController;
    btn.addEventListener("click", e => {
      currentOrientation = currentOrientation === 0 ? 1 : 0;
      e.target.innerText = orientations[currentOrientation];
    }, {
      signal
    });
  }

  // Helper function used in queryPlacement, init
  // Turns off "invalid-placement", "valid-placement" classes, if they exist
  function removeShipPlacementIndications() {
    const elements = document.querySelectorAll(".invalid-placement,.valid-placement");
    for (let i = 0; i < elements.length; i += 1) {
      elements[i].classList.remove("invalid-placement", "valid-placement");
    }
  }

  // Check to see if placement is possible
  // this is going to publish "place-ship-hover"
  function queryPlacement(e) {
    removeShipPlacementIndications();
    currentSquare = e.currentTarget;
    const coordinate = (0,_getCoordFromElement__WEBPACK_IMPORTED_MODULE_1__["default"])(currentSquare);
    const type = shipTypesArr[currentShipPlacement];
    const orientation = orientations[currentOrientation];
    currentPlacementInfo = {
      type,
      coordinate,
      orientation
    };
    _utilities_pubSub__WEBPACK_IMPORTED_MODULE_0__["default"].publish("place-ship-hover", currentPlacementInfo);
  }
  function setClassOnSquares(placement, classIn) {
    const length = _ship_shiptypes__WEBPACK_IMPORTED_MODULE_3__["default"][placement.type];
    const {
      orientation
    } = placement;
    const {
      coordinate
    } = placement;
    const coordList = _coordSelectorTools__WEBPACK_IMPORTED_MODULE_2__["default"].getCoordinateList(length, coordinate, orientation);
    const selector = _coordSelectorTools__WEBPACK_IMPORTED_MODULE_2__["default"].getAllSelectors(coordList);
    const domElements = waters.querySelectorAll(selector);
    for (let i = 0; i < domElements.length; i += 1) {
      domElements[i].classList.add(classIn);
    }
  }
  function displayStatus(status) {
    if (status === "placed") {
      setClassOnSquares(currentPlacementInfo, "occupied");
    } else if (status === "query") {
      setClassOnSquares(currentPlacementInfo, "valid-placement");
    }
  }
  function showPossibility(possible) {
    const btn = document.querySelector(".place-ship-control:not(.display-disabled)");
    if (possible) {
      // Placement works
      btn.classList.remove("btn-disabled");
      displayPlacementPossibilityMessage(true);
    } else {
      // Placement doesnt work
      btn.classList.add("btn-disabled");
      displayPlacementPossibilityMessage(false);
    }
  }

  // Called once, in init method
  // sets up subscription for "place-ship-hover-result"
  function displayPossibility() {
    _utilities_pubSub__WEBPACK_IMPORTED_MODULE_0__["default"].subscribe("place-ship-hover-result", result => {
      if (result) {
        displayStatus("query");
        placeShipLatch = true;
        showPossibility(true);
      } else {
        placeShipLatch = false;
        currentSquare.classList.add("invalid-placement");
        showPossibility(false);
      }
    });
  }
  function enableView() {
    const element = document.getElementById("placement-controls");
    element.classList.remove("display-disabled", "opacity-zero");
    updatePlaceShipControlsView();
  }
  function disableView() {
    const element = document.getElementById("placement-controls");
    element.classList.add("opacity-zero");
    setTimeout(() => element.classList.add("display-disabled"), 1000);
  }

  // Used in placeShipListener
  // Updates the view to show which controls are currently relevant
  //    Changes which ship is being shown in controls
  //    Removes the controls entirely when all ships are placed
  function updatePlaceShipControlsView() {
    const {
      signal
    } = placeController;
    if (currentShipPlacement < controlDomElements.length) {
      // Disable display of all place-ship-buttons
      for (let i = 0; i < controlDomElements.length; i += 1) {
        controlDomElements[i].classList.add("display-disabled");
        controlDomElements[i].classList.remove("place-button-enabled");
      }
      // Enable display of only the current place-ship-button
      controlDomElements[currentShipPlacement].classList.remove("display-disabled");
      // Add event listener for ship placement
      controlDomElements[currentShipPlacement].addEventListener("click", () => {
        if (placeShipLatch) {
          placeShipLatch = false;
          _utilities_pubSub__WEBPACK_IMPORTED_MODULE_0__["default"].publish(`place-${shipTypesArr[currentShipPlacement]}`, currentPlacementInfo);
          currentShipPlacement += 1;
          displayStatus("placed");
          updatePlaceShipControlsView();
          displayShipPlacementMessage();
        }
      }, {
        signal
      });
    } else {
      disableView();
    }
  }

  // Disables the event listeners assocaited with the ship placement controls
  function disable() {
    hoverController.abort();
    placeController.abort();
  }

  // Initializes the controls
  // Subscribes to game-start event (inside of placeShipCanceler()),
  //  which then handles disabling the controls
  function init() {
    enableView();
    displayPossibility();
    changeOrientationListener();
    displayShipPlacementMessage();
  }

  // Passed to initGrid to set up shipPlacement eventlisteners
  function query() {
    return {
      cbk: queryPlacement,
      signal: hoverController.signal
    };
  }
  return {
    init,
    query,
    disable
  };
}
/* harmony default export */ __webpack_exports__["default"] = (ShipPlaceControls);

/***/ }),

/***/ "./src/view/takeTurnControls.js":
/*!**************************************!*\
  !*** ./src/view/takeTurnControls.js ***!
  \**************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _utilities_pubSub__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utilities/pubSub */ "./src/utilities/pubSub.js");
/* harmony import */ var _getCoordFromElement__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./getCoordFromElement */ "./src/view/getCoordFromElement.js");


function attackViaDom(e) {
  const target = e.currentTarget;
  const coord = (0,_getCoordFromElement__WEBPACK_IMPORTED_MODULE_1__["default"])(target);
  _utilities_pubSub__WEBPACK_IMPORTED_MODULE_0__["default"].publish("player-attack", coord);
}
function turnControls() {
  const enemyWaters = document.querySelector(".enemy-waters");
  const squares = enemyWaters.querySelectorAll(".grid-square");
  for (let i = 0; i < squares.length; i += 1) {
    squares[i].addEventListener("click", e => {
      attackViaDom(e);
    });
  }
  return {};
}
/* harmony default export */ __webpack_exports__["default"] = (turnControls);

/***/ }),

/***/ "./src/view/view.js":
/*!**************************!*\
  !*** ./src/view/view.js ***!
  \**************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _utilities_pubSub__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utilities/pubSub */ "./src/utilities/pubSub.js");
/* harmony import */ var _utilities_removeChildren__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utilities/removeChildren */ "./src/utilities/removeChildren.js");
/* harmony import */ var _gameloop_gameloop__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../gameloop/gameloop */ "./src/gameloop/gameloop.js");
/* harmony import */ var _shipPlaceControls__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./shipPlaceControls */ "./src/view/shipPlaceControls.js");
/* harmony import */ var _takeTurnControls__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./takeTurnControls */ "./src/view/takeTurnControls.js");
/* harmony import */ var _coordSelectorTools__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./coordSelectorTools */ "./src/view/coordSelectorTools.js");
/* harmony import */ var _ship_shiptypes__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../ship/shiptypes */ "./src/ship/shiptypes.js");
/* harmony import */ var _style_css_reset_css__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./style/css-reset.css */ "./src/view/style/css-reset.css");
/* harmony import */ var _style_index_css__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./style/index.css */ "./src/view/style/index.css");










/**
 **  Publish Events:
 **    place-carrier, place-battleship, place-destroyer, place-submarine, place-patrolboat
 **    place-ship-hover
 **    player-attack
 **    player-attack-hover
 **
 **  Subscribe Events:
 **    place-ship-hover-result
 **    game-reset
 **    game-start
 **    game-won
 **    player-attack-hover-result
 **    enemy-attack-result
 **    player-attack-result
 */

const view = (() => {
  const waters = [document.querySelector(".allied-waters"), document.querySelector(".enemy-waters")];
  const messageOne = document.getElementById("message-one");
  const messageTwo = document.getElementById("message-two");
  const resetBtn = document.getElementById("reset-btn");
  function initGrid(domElement, size, CBK) {
    for (let i = 0; i < size; i += 1) {
      const row = document.createElement("div");
      row.classList.add("grid-row");
      for (let j = 0; j < size; j += 1) {
        const square = document.createElement("div");
        square.classList.add("grid-square");
        square.setAttribute("data-row", i);
        square.setAttribute("data-column", j);
        if (CBK) {
          square.addEventListener("click", e => CBK.cbk(e), {
            signal: CBK.signal
          });
        }
        row.appendChild(square);
      }
      domElement.appendChild(row);
    }
  }
  function removeMessage(element) {
    try {
      element.removeChild(element.firstChild);
    } catch {
      /* no text node to remove */
    }
  }
  function displayMessage(message, optionalDuration) {
    const textnode = document.createTextNode(message);
    if (message === "") {
      removeMessage(messageOne);
      removeMessage(messageTwo);
    } else if (optionalDuration) {
      removeMessage(messageTwo);
      messageTwo.classList.remove("opacity-zero");
      messageTwo.appendChild(textnode);
      setTimeout(() => {
        if (messageTwo.firstChild === textnode) {
          messageTwo.classList.add("opacity-zero");
          setTimeout(() => {
            try {
              messageTwo.removeChild(textnode);
            } catch {
              /* */
            }
            messageTwo.classList.remove("opacity-zero");
          }, 500);
        }
      }, optionalDuration);
    } else {
      removeMessage(messageOne);
      messageOne.appendChild(textnode);
    }
  }

  //  Shifts boards up if direction === true
  //  Shifts boards down if direction === false
  function shift(direction) {
    if (direction === true) {
      waters[0].classList.add("board-shift");
      waters[1].classList.add("board-shift");
    } else {
      waters[0].classList.remove("board-shift");
      waters[1].classList.remove("board-shift");
    }
  }
  function displaySunkShip(victim, graveyard, type) {
    const message = `${victim} player's ${type} was destroyed`;
    const {
      length
    } = graveyard;
    const {
      coordinate
    } = graveyard;
    const {
      orientation
    } = graveyard;
    const coordList = _coordSelectorTools__WEBPACK_IMPORTED_MODULE_5__["default"].getCoordinateList(length, coordinate, orientation);
    const selector = _coordSelectorTools__WEBPACK_IMPORTED_MODULE_5__["default"].getAllSelectors(coordList);
    const board = victim === "human" ? waters[0] : waters[1];
    const elements = board.querySelectorAll(selector);
    for (let i = 0; i < elements.length; i += 1) {
      elements[i].classList.add("exploded");
    }
    displayMessage(message, 3000);
  }

  // Used in getAllSelectors
  //  is passed an array: [row, column]
  //  returns a css selector
  function makeSelectorFromCoord(coord) {
    const {
      row
    } = coord;
    const {
      column
    } = coord;
    return `.grid-square[data-row="${row}"].grid-square[data-column="${column}"]`;
  }

  // Function-returning function to add "board" closure
  //  returned "displayAttackResult" function:
  //    happens on "enemy-attack-result" or "player-attack-result" event
  //    updates the DOM to display the result of an attack
  function attackResult(player) {
    const board = player === "human" ? waters[1] : waters[0];
    return function displayAttackResult(payload) {
      const selector = makeSelectorFromCoord(payload.coord);
      const gridSquare = board.querySelector(selector);
      const addClass = payload.hit === true ? "hit" : "miss";
      if (payload.sunk) {
        const victim = player === "human" ? "computer" : "human";
        displaySunkShip(victim, payload.graveyard, payload.type);
      }
      gridSquare.classList.add(addClass);
    };
  }

  // Asynchronous callback
  // Happens on "game-won" subscribe event
  // Ends the "Turn block", displays the winner
  function gameComplete(winner) {
    let message;
    if (winner === "human") {
      message = `VICTORY`;
    } else {
      message = `YOU LOSE`;
    }
    displayMessage(message);
    resetBtn.classList.remove("display-disabled");
  }

  // Asynchronous callback
  // Happens on "game-start" subscribe event
  // Prepares the view for the "Turn block" of the game loop
  function gameStart() {
    shift(false);
    displayMessage("");
    // Turn off display of ship placement controls
    // Turn on controls for attacking enemy waters
    const turnController = (0,_takeTurnControls__WEBPACK_IMPORTED_MODULE_4__["default"])();
    // Grid:
    //    clear event listeners
    //    Enemy waters:
    //      subscribe to successful attacks, sunken ships
    _utilities_pubSub__WEBPACK_IMPORTED_MODULE_0__["default"].subscribe("enemy-attack-result", attackResult("computer"));
    //    Allied waters:
    //      subscribe to "enemy-attack"
    _utilities_pubSub__WEBPACK_IMPORTED_MODULE_0__["default"].subscribe("player-attack-result", attackResult("human"));
    //    Subscribe to game win/over
    _utilities_pubSub__WEBPACK_IMPORTED_MODULE_0__["default"].subscribe("game-won", gameComplete);
  }

  // Asyncronous callback
  // Happens on "game-reset" subscribe event
  // Returns the view to the initial state
  async function gameReset() {
    // Clear subscriptions
    _utilities_pubSub__WEBPACK_IMPORTED_MODULE_0__["default"].reset();
    // Initialize a new game loop
    (0,_gameloop_gameloop__WEBPACK_IMPORTED_MODULE_2__["default"])();
    // disable view of enemy board
    shift(true);
    // disable view of the reset button
    resetBtn.classList.add("display-disabled");
    // clear victory/gamelost message
    displayMessage("");
    // subsribe to display-message event
    _utilities_pubSub__WEBPACK_IMPORTED_MODULE_0__["default"].subscribe("display-message", data => displayMessage(data.message, data.duration));

    // initialize ship placement control object
    const placeCntrl = (0,_shipPlaceControls__WEBPACK_IMPORTED_MODULE_3__["default"])();
    // Grid:
    // clear grid
    (0,_utilities_removeChildren__WEBPACK_IMPORTED_MODULE_1__["default"])(...waters);
    // initialize grid
    initGrid(waters[0], 10, placeCntrl.query());
    initGrid(waters[1], 10);
    // initialize the ship placement controls / event listeners
    placeCntrl.init();
    // subscribe to game-start event:
    //    Create a promise
    const gameStartIndication = new Promise(resolve => {
      //  Subscribe to game-start. Resolve the promise when the event happens
      _utilities_pubSub__WEBPACK_IMPORTED_MODULE_0__["default"].subscribe("game-start", data => {
        resolve(data);
      });
    });
    await gameStartIndication;
    placeCntrl.disable();
    gameStart();
  }
  gameReset();

  //  Transition effect is add 1 second after initializing view (done in init)
  //  This is done so that the initial shift is not visible
  function addTransition() {
    waters[0].classList.add("board-shift-transition");
    waters[1].classList.add("board-shift-transition");
  }
  function initResetBtn() {
    resetBtn.addEventListener("click", () => gameReset());
  }

  // IIFE is used on init
  (function init() {
    setTimeout(addTransition, 1000);
    initResetBtn();
  })();
  return {};
})();

/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js!./src/view/style/css-reset.css":
/*!****************************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./src/view/style/css-reset.css ***!
  \****************************************************************************/
/***/ (function(module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../node_modules/css-loader/dist/runtime/sourceMaps.js */ "./node_modules/css-loader/dist/runtime/sourceMaps.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, "/* http://meyerweb.com/eric/tools/css/reset/ \n   v2.0 | 20110126\n   License: none (public domain)\n*/\n\nhtml, body, div, span, applet, object, iframe,\nh1, h2, h3, h4, h5, h6, p, blockquote, pre,\na, abbr, acronym, address, big, cite, code,\ndel, dfn, em, img, ins, kbd, q, s, samp,\nsmall, strike, strong, sub, sup, tt, var,\nb, u, i, center,\ndl, dt, dd, ol, ul, li,\nfieldset, form, label, legend,\ntable, caption, tbody, tfoot, thead, tr, th, td,\narticle, aside, canvas, details, embed, \nfigure, figcaption, footer, header, hgroup, \nmenu, nav, output, ruby, section, summary,\ntime, mark, audio, video {\n\tmargin: 0;\n\tpadding: 0;\n\tborder: 0;\n\tfont-size: 100%;\n\tfont: inherit;\n\tvertical-align: baseline;\n}\n/* HTML5 display-role reset for older browsers */\narticle, aside, details, figcaption, figure, \nfooter, header, hgroup, menu, nav, section {\n\tdisplay: block;\n}\nbody {\n\tline-height: 1;\n}\nol, ul {\n\tlist-style: none;\n}\nli {\n\tlist-style-type: none;\n}\nblockquote, q {\n\tquotes: none;\n}\nblockquote:before, blockquote:after,\nq:before, q:after {\n\tcontent: '';\n\tcontent: none;\n}\ntable {\n\tborder-collapse: collapse;\n\tborder-spacing: 0;\n}", "",{"version":3,"sources":["webpack://./src/view/style/css-reset.css"],"names":[],"mappings":"AAAA;;;CAGC;;AAED;;;;;;;;;;;;;CAaC,SAAS;CACT,UAAU;CACV,SAAS;CACT,eAAe;CACf,aAAa;CACb,wBAAwB;AACzB;AACA,gDAAgD;AAChD;;CAEC,cAAc;AACf;AACA;CACC,cAAc;AACf;AACA;CACC,gBAAgB;AACjB;AACA;CACC,qBAAqB;AACtB;AACA;CACC,YAAY;AACb;AACA;;CAEC,WAAW;CACX,aAAa;AACd;AACA;CACC,yBAAyB;CACzB,iBAAiB;AAClB","sourcesContent":["/* http://meyerweb.com/eric/tools/css/reset/ \n   v2.0 | 20110126\n   License: none (public domain)\n*/\n\nhtml, body, div, span, applet, object, iframe,\nh1, h2, h3, h4, h5, h6, p, blockquote, pre,\na, abbr, acronym, address, big, cite, code,\ndel, dfn, em, img, ins, kbd, q, s, samp,\nsmall, strike, strong, sub, sup, tt, var,\nb, u, i, center,\ndl, dt, dd, ol, ul, li,\nfieldset, form, label, legend,\ntable, caption, tbody, tfoot, thead, tr, th, td,\narticle, aside, canvas, details, embed, \nfigure, figcaption, footer, header, hgroup, \nmenu, nav, output, ruby, section, summary,\ntime, mark, audio, video {\n\tmargin: 0;\n\tpadding: 0;\n\tborder: 0;\n\tfont-size: 100%;\n\tfont: inherit;\n\tvertical-align: baseline;\n}\n/* HTML5 display-role reset for older browsers */\narticle, aside, details, figcaption, figure, \nfooter, header, hgroup, menu, nav, section {\n\tdisplay: block;\n}\nbody {\n\tline-height: 1;\n}\nol, ul {\n\tlist-style: none;\n}\nli {\n\tlist-style-type: none;\n}\nblockquote, q {\n\tquotes: none;\n}\nblockquote:before, blockquote:after,\nq:before, q:after {\n\tcontent: '';\n\tcontent: none;\n}\ntable {\n\tborder-collapse: collapse;\n\tborder-spacing: 0;\n}"],"sourceRoot":""}]);
// Exports
/* harmony default export */ __webpack_exports__["default"] = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js!./src/view/style/index.css":
/*!************************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./src/view/style/index.css ***!
  \************************************************************************/
/***/ (function(module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../node_modules/css-loader/dist/runtime/sourceMaps.js */ "./node_modules/css-loader/dist/runtime/sourceMaps.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
___CSS_LOADER_EXPORT___.push([module.id, "@import url(https://fonts.googleapis.com/css2?family=Patua+One&family=Space+Mono&display=swap);"]);
// Module
___CSS_LOADER_EXPORT___.push([module.id, ":root {\n  --max-board-size: 500px;\n  --board-size: 500px;\n  --header-text-size: 5rem;\n  --header-height: 5rem;\n  --controls-wrapper-margin: 1rem auto 1rem auto;\n  --controls-wrapper-height-factor: calc(var(--board-size) * 3 / 10);\n  --message-center-top-margin: 1rem;\n  --player-board-color: antiquewhite;\n  --reset-btn-height: 2.5rem;\n}\n\nbody {\n  width: 100%;\n  position: fixed;\n}\n\nhtml {\n  background-color: darkslategray;\n  width: 100%;\n}\n\nheader {\n  height: var(--header-height);\n  text-align: center;\n  font-family: \"Patua One\";\n  font-size: var(--header-text-size);\n}\n\n.game-wrapper {\n  height: calc(100% - var(--header-height));\n  display: flex;\n  flex-direction: column;\n  justify-content: center;\n}\n\n#board-wrapper {\n  overflow: hidden;\n  display: flex;\n  flex-direction: column;\n  gap: 10px;\n}\n\n#board-wrapper > div {\n  width: var(--board-size);\n  height: var(--board-size);\n  margin: auto;\n  display: flex;\n  flex-direction: column;\n  gap: 1px;\n}\n\n.board-shift-transition {\n  transition: transform 1s ease-in-out;\n}\n\n.board-shift {\n  transform: translate(0, calc(-1 * var(--board-size)));\n}\n\n.allied-waters .grid-square {\n  background-color: var(--player-board-color);\n}\n.enemy-waters .grid-square {\n  background-color: lightcoral;\n}\n\n.grid-row {\n  height: 10%;\n  width: 100%;\n  display: flex;\n  gap: 1px;\n}\n\n.grid-square {\n  height: 100%;\n  width: 10%;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}\n\n#controls-wrapper {\n  width: var(--board-size);\n  height: var(--controls-wrapper-height-factor);\n  margin: var(--controls-wrapper-margin);\n  display: flex;\n  flex-direction: column;\n  justify-content: space-between;\n}\n\n#message-center {\n  width: var(--board-size);\n  height: var(--controls-wrapper-height);\n  display: flex;\n  gap: 5px;\n  margin-top: var(--message-center-top-margin);\n  flex-direction: column;\n  justify-content: center;\n  align-items: center;\n  font-family: \"Space Mono\";\n}\n\n#message-center > div {\n  height: calc(var(--board-size) * 0.75 / 10);\n}\n\n#message-two {\n  transition: opacity 0.5s linear;\n  text-align: center;\n}\n\n#placement-controls {\n  width: 100%;\n  display: flex;\n  flex-direction: row;\n  justify-content: space-between;\n  gap: 5px;\n  transition: opacity 0.25s linear;\n}\n\n.opacity-zero {\n  opacity: 0;\n}\n\n#orientation-btn {\n  height: calc(var(--board-size) / 10);\n  width: calc(var(--board-size) * 3 / 10);\n  background-color: antiquewhite;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  margin: 0 10px 0 0;\n  font-family: \"Space Mono\";\n  text-align: center;\n  font-size: 0.9rem;\n\n  border-radius: 0.25rem;\n  box-shadow: 5px 5px 25px 3px rgb(49, 49, 49);\n}\n\n.place-ship-control {\n  height: calc(var(--board-size) / 10);\n\n  background-color: bisque;\n  margin: 0 0 0 10px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  font-family: \"Space Mono\";\n  text-align: center;\n  font-size: 0.9rem;\n\n  border-radius: 0.25rem;\n  box-shadow: 5px 5px 25px 3px rgb(49, 49, 49);\n}\n\n#place-carrier {\n  width: calc(var(--board-size) / 2);\n}\n\n#place-battleship {\n  width: calc(var(--board-size) * 4 / 10);\n}\n\n#place-destroyer {\n  width: calc(var(--board-size) * 3 / 10);\n}\n\n#place-submarine {\n  width: calc(var(--board-size) * 3 / 10);\n}\n\n#place-patrolboat {\n  width: calc(var(--board-size) / 5);\n}\n\n#reset-btn {\n  margin: auto;\n  cursor: pointer;\n  height: var(--reset-btn-height);\n  width: 7rem;\n  background-color: var(--player-board-color);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  border-radius: 0.25rem;\n  box-shadow: 5px 5px 25px 3px rgb(49, 49, 49);\n}\n\n.hit::after {\n  content: \"\";\n  width: 1rem;\n  height: 1rem;\n  border-radius: 0.5rem;\n  background-color: red;\n}\n\n.miss::after {\n  content: \"\";\n  width: 1rem;\n  height: 1rem;\n  border-radius: 0.5rem;\n  background-color: white;\n  box-shadow: 1px 1px 10px rgb(49, 49, 49);\n}\n\n.enemy-waters .grid-square:not(.hit):not(.miss):hover {\n  filter: brightness(0.75);\n  cursor: pointer;\n}\n\n.grid-square.valid-placement {\n  background-color: green;\n}\n\n.grid-square.invalid-placement {\n  background-color: red;\n}\n\n.grid-square.occupied {\n  background-color: brown;\n}\n\n.exploded {\n  filter: invert();\n}\n\n#placement-controls.display-disabled,\n#reset-btn.display-disabled,\n.display-disabled {\n  display: none;\n}\n\n.place-button-enabled {\n  background-color: green;\n}\n\n.btn-disabled {\n  opacity: 60%;\n}\n\n@media only screen and (max-width: 500px) {\n  :root {\n    --board-size: 80vw;\n    --header-text-size: 3rem;\n    --header-height: 3rem;\n    --controls-wrapper-margin: 0.25rem auto 0.5rem auto;\n    --controls-wrapper-height-factor: calc(var(--board-size) * 4 / 10);\n    --message-center-top-margin: 0.25rem;\n    --reset-btn-height: 1.75rem;\n  }\n}\n", "",{"version":3,"sources":["webpack://./src/view/style/index.css"],"names":[],"mappings":"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","sourcesContent":["@import url(\"https://fonts.googleapis.com/css2?family=Patua+One&family=Space+Mono&display=swap\");\n\n:root {\n  --max-board-size: 500px;\n  --board-size: 500px;\n  --header-text-size: 5rem;\n  --header-height: 5rem;\n  --controls-wrapper-margin: 1rem auto 1rem auto;\n  --controls-wrapper-height-factor: calc(var(--board-size) * 3 / 10);\n  --message-center-top-margin: 1rem;\n  --player-board-color: antiquewhite;\n  --reset-btn-height: 2.5rem;\n}\n\nbody {\n  width: 100%;\n  position: fixed;\n}\n\nhtml {\n  background-color: darkslategray;\n  width: 100%;\n}\n\nheader {\n  height: var(--header-height);\n  text-align: center;\n  font-family: \"Patua One\";\n  font-size: var(--header-text-size);\n}\n\n.game-wrapper {\n  height: calc(100% - var(--header-height));\n  display: flex;\n  flex-direction: column;\n  justify-content: center;\n}\n\n#board-wrapper {\n  overflow: hidden;\n  display: flex;\n  flex-direction: column;\n  gap: 10px;\n}\n\n#board-wrapper > div {\n  width: var(--board-size);\n  height: var(--board-size);\n  margin: auto;\n  display: flex;\n  flex-direction: column;\n  gap: 1px;\n}\n\n.board-shift-transition {\n  transition: transform 1s ease-in-out;\n}\n\n.board-shift {\n  transform: translate(0, calc(-1 * var(--board-size)));\n}\n\n.allied-waters .grid-square {\n  background-color: var(--player-board-color);\n}\n.enemy-waters .grid-square {\n  background-color: lightcoral;\n}\n\n.grid-row {\n  height: 10%;\n  width: 100%;\n  display: flex;\n  gap: 1px;\n}\n\n.grid-square {\n  height: 100%;\n  width: 10%;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}\n\n#controls-wrapper {\n  width: var(--board-size);\n  height: var(--controls-wrapper-height-factor);\n  margin: var(--controls-wrapper-margin);\n  display: flex;\n  flex-direction: column;\n  justify-content: space-between;\n}\n\n#message-center {\n  width: var(--board-size);\n  height: var(--controls-wrapper-height);\n  display: flex;\n  gap: 5px;\n  margin-top: var(--message-center-top-margin);\n  flex-direction: column;\n  justify-content: center;\n  align-items: center;\n  font-family: \"Space Mono\";\n}\n\n#message-center > div {\n  height: calc(var(--board-size) * 0.75 / 10);\n}\n\n#message-two {\n  transition: opacity 0.5s linear;\n  text-align: center;\n}\n\n#placement-controls {\n  width: 100%;\n  display: flex;\n  flex-direction: row;\n  justify-content: space-between;\n  gap: 5px;\n  transition: opacity 0.25s linear;\n}\n\n.opacity-zero {\n  opacity: 0;\n}\n\n#orientation-btn {\n  height: calc(var(--board-size) / 10);\n  width: calc(var(--board-size) * 3 / 10);\n  background-color: antiquewhite;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  margin: 0 10px 0 0;\n  font-family: \"Space Mono\";\n  text-align: center;\n  font-size: 0.9rem;\n\n  border-radius: 0.25rem;\n  box-shadow: 5px 5px 25px 3px rgb(49, 49, 49);\n}\n\n.place-ship-control {\n  height: calc(var(--board-size) / 10);\n\n  background-color: bisque;\n  margin: 0 0 0 10px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  font-family: \"Space Mono\";\n  text-align: center;\n  font-size: 0.9rem;\n\n  border-radius: 0.25rem;\n  box-shadow: 5px 5px 25px 3px rgb(49, 49, 49);\n}\n\n#place-carrier {\n  width: calc(var(--board-size) / 2);\n}\n\n#place-battleship {\n  width: calc(var(--board-size) * 4 / 10);\n}\n\n#place-destroyer {\n  width: calc(var(--board-size) * 3 / 10);\n}\n\n#place-submarine {\n  width: calc(var(--board-size) * 3 / 10);\n}\n\n#place-patrolboat {\n  width: calc(var(--board-size) / 5);\n}\n\n#reset-btn {\n  margin: auto;\n  cursor: pointer;\n  height: var(--reset-btn-height);\n  width: 7rem;\n  background-color: var(--player-board-color);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  border-radius: 0.25rem;\n  box-shadow: 5px 5px 25px 3px rgb(49, 49, 49);\n}\n\n.hit::after {\n  content: \"\";\n  width: 1rem;\n  height: 1rem;\n  border-radius: 0.5rem;\n  background-color: red;\n}\n\n.miss::after {\n  content: \"\";\n  width: 1rem;\n  height: 1rem;\n  border-radius: 0.5rem;\n  background-color: white;\n  box-shadow: 1px 1px 10px rgb(49, 49, 49);\n}\n\n.enemy-waters .grid-square:not(.hit):not(.miss):hover {\n  filter: brightness(0.75);\n  cursor: pointer;\n}\n\n.grid-square.valid-placement {\n  background-color: green;\n}\n\n.grid-square.invalid-placement {\n  background-color: red;\n}\n\n.grid-square.occupied {\n  background-color: brown;\n}\n\n.exploded {\n  filter: invert();\n}\n\n#placement-controls.display-disabled,\n#reset-btn.display-disabled,\n.display-disabled {\n  display: none;\n}\n\n.place-button-enabled {\n  background-color: green;\n}\n\n.btn-disabled {\n  opacity: 60%;\n}\n\n@media only screen and (max-width: 500px) {\n  :root {\n    --board-size: 80vw;\n    --header-text-size: 3rem;\n    --header-height: 3rem;\n    --controls-wrapper-margin: 0.25rem auto 0.5rem auto;\n    --controls-wrapper-height-factor: calc(var(--board-size) * 4 / 10);\n    --message-center-top-margin: 0.25rem;\n    --reset-btn-height: 1.75rem;\n  }\n}\n"],"sourceRoot":""}]);
// Exports
/* harmony default export */ __webpack_exports__["default"] = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/api.js":
/*!*****************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/api.js ***!
  \*****************************************************/
/***/ (function(module) {



/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
module.exports = function (cssWithMappingToString) {
  var list = []; // return the list of modules as css string

  list.toString = function toString() {
    return this.map(function (item) {
      var content = "";
      var needLayer = typeof item[5] !== "undefined";

      if (item[4]) {
        content += "@supports (".concat(item[4], ") {");
      }

      if (item[2]) {
        content += "@media ".concat(item[2], " {");
      }

      if (needLayer) {
        content += "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {");
      }

      content += cssWithMappingToString(item);

      if (needLayer) {
        content += "}";
      }

      if (item[2]) {
        content += "}";
      }

      if (item[4]) {
        content += "}";
      }

      return content;
    }).join("");
  }; // import a list of modules into the list


  list.i = function i(modules, media, dedupe, supports, layer) {
    if (typeof modules === "string") {
      modules = [[null, modules, undefined]];
    }

    var alreadyImportedModules = {};

    if (dedupe) {
      for (var k = 0; k < this.length; k++) {
        var id = this[k][0];

        if (id != null) {
          alreadyImportedModules[id] = true;
        }
      }
    }

    for (var _k = 0; _k < modules.length; _k++) {
      var item = [].concat(modules[_k]);

      if (dedupe && alreadyImportedModules[item[0]]) {
        continue;
      }

      if (typeof layer !== "undefined") {
        if (typeof item[5] === "undefined") {
          item[5] = layer;
        } else {
          item[1] = "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {").concat(item[1], "}");
          item[5] = layer;
        }
      }

      if (media) {
        if (!item[2]) {
          item[2] = media;
        } else {
          item[1] = "@media ".concat(item[2], " {").concat(item[1], "}");
          item[2] = media;
        }
      }

      if (supports) {
        if (!item[4]) {
          item[4] = "".concat(supports);
        } else {
          item[1] = "@supports (".concat(item[4], ") {").concat(item[1], "}");
          item[4] = supports;
        }
      }

      list.push(item);
    }
  };

  return list;
};

/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/sourceMaps.js":
/*!************************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/sourceMaps.js ***!
  \************************************************************/
/***/ (function(module) {



module.exports = function (item) {
  var content = item[1];
  var cssMapping = item[3];

  if (!cssMapping) {
    return content;
  }

  if (typeof btoa === "function") {
    var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(cssMapping))));
    var data = "sourceMappingURL=data:application/json;charset=utf-8;base64,".concat(base64);
    var sourceMapping = "/*# ".concat(data, " */");
    var sourceURLs = cssMapping.sources.map(function (source) {
      return "/*# sourceURL=".concat(cssMapping.sourceRoot || "").concat(source, " */");
    });
    return [content].concat(sourceURLs).concat([sourceMapping]).join("\n");
  }

  return [content].join("\n");
};

/***/ }),

/***/ "./src/view/style/css-reset.css":
/*!**************************************!*\
  !*** ./src/view/style/css-reset.css ***!
  \**************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! !../../../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! !../../../node_modules/style-loader/dist/runtime/styleDomAPI.js */ "./node_modules/style-loader/dist/runtime/styleDomAPI.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! !../../../node_modules/style-loader/dist/runtime/insertBySelector.js */ "./node_modules/style-loader/dist/runtime/insertBySelector.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! !../../../node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js */ "./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! !../../../node_modules/style-loader/dist/runtime/insertStyleElement.js */ "./node_modules/style-loader/dist/runtime/insertStyleElement.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! !../../../node_modules/style-loader/dist/runtime/styleTagTransform.js */ "./node_modules/style-loader/dist/runtime/styleTagTransform.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_css_reset_css__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! !!../../../node_modules/css-loader/dist/cjs.js!./css-reset.css */ "./node_modules/css-loader/dist/cjs.js!./src/view/style/css-reset.css");

      
      
      
      
      
      
      
      
      

var options = {};

options.styleTagTransform = (_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default());
options.setAttributes = (_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default());

      options.insert = _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default().bind(null, "head");
    
options.domAPI = (_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default());
options.insertStyleElement = (_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default());

var update = _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_node_modules_css_loader_dist_cjs_js_css_reset_css__WEBPACK_IMPORTED_MODULE_6__["default"], options);




       /* harmony default export */ __webpack_exports__["default"] = (_node_modules_css_loader_dist_cjs_js_css_reset_css__WEBPACK_IMPORTED_MODULE_6__["default"] && _node_modules_css_loader_dist_cjs_js_css_reset_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals ? _node_modules_css_loader_dist_cjs_js_css_reset_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals : undefined);


/***/ }),

/***/ "./src/view/style/index.css":
/*!**********************************!*\
  !*** ./src/view/style/index.css ***!
  \**********************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! !../../../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! !../../../node_modules/style-loader/dist/runtime/styleDomAPI.js */ "./node_modules/style-loader/dist/runtime/styleDomAPI.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! !../../../node_modules/style-loader/dist/runtime/insertBySelector.js */ "./node_modules/style-loader/dist/runtime/insertBySelector.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! !../../../node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js */ "./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! !../../../node_modules/style-loader/dist/runtime/insertStyleElement.js */ "./node_modules/style-loader/dist/runtime/insertStyleElement.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! !../../../node_modules/style-loader/dist/runtime/styleTagTransform.js */ "./node_modules/style-loader/dist/runtime/styleTagTransform.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_index_css__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! !!../../../node_modules/css-loader/dist/cjs.js!./index.css */ "./node_modules/css-loader/dist/cjs.js!./src/view/style/index.css");

      
      
      
      
      
      
      
      
      

var options = {};

options.styleTagTransform = (_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default());
options.setAttributes = (_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default());

      options.insert = _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default().bind(null, "head");
    
options.domAPI = (_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default());
options.insertStyleElement = (_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default());

var update = _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_node_modules_css_loader_dist_cjs_js_index_css__WEBPACK_IMPORTED_MODULE_6__["default"], options);




       /* harmony default export */ __webpack_exports__["default"] = (_node_modules_css_loader_dist_cjs_js_index_css__WEBPACK_IMPORTED_MODULE_6__["default"] && _node_modules_css_loader_dist_cjs_js_index_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals ? _node_modules_css_loader_dist_cjs_js_index_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals : undefined);


/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js":
/*!****************************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js ***!
  \****************************************************************************/
/***/ (function(module) {



var stylesInDOM = [];

function getIndexByIdentifier(identifier) {
  var result = -1;

  for (var i = 0; i < stylesInDOM.length; i++) {
    if (stylesInDOM[i].identifier === identifier) {
      result = i;
      break;
    }
  }

  return result;
}

function modulesToDom(list, options) {
  var idCountMap = {};
  var identifiers = [];

  for (var i = 0; i < list.length; i++) {
    var item = list[i];
    var id = options.base ? item[0] + options.base : item[0];
    var count = idCountMap[id] || 0;
    var identifier = "".concat(id, " ").concat(count);
    idCountMap[id] = count + 1;
    var indexByIdentifier = getIndexByIdentifier(identifier);
    var obj = {
      css: item[1],
      media: item[2],
      sourceMap: item[3],
      supports: item[4],
      layer: item[5]
    };

    if (indexByIdentifier !== -1) {
      stylesInDOM[indexByIdentifier].references++;
      stylesInDOM[indexByIdentifier].updater(obj);
    } else {
      var updater = addElementStyle(obj, options);
      options.byIndex = i;
      stylesInDOM.splice(i, 0, {
        identifier: identifier,
        updater: updater,
        references: 1
      });
    }

    identifiers.push(identifier);
  }

  return identifiers;
}

function addElementStyle(obj, options) {
  var api = options.domAPI(options);
  api.update(obj);

  var updater = function updater(newObj) {
    if (newObj) {
      if (newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap && newObj.supports === obj.supports && newObj.layer === obj.layer) {
        return;
      }

      api.update(obj = newObj);
    } else {
      api.remove();
    }
  };

  return updater;
}

module.exports = function (list, options) {
  options = options || {};
  list = list || [];
  var lastIdentifiers = modulesToDom(list, options);
  return function update(newList) {
    newList = newList || [];

    for (var i = 0; i < lastIdentifiers.length; i++) {
      var identifier = lastIdentifiers[i];
      var index = getIndexByIdentifier(identifier);
      stylesInDOM[index].references--;
    }

    var newLastIdentifiers = modulesToDom(newList, options);

    for (var _i = 0; _i < lastIdentifiers.length; _i++) {
      var _identifier = lastIdentifiers[_i];

      var _index = getIndexByIdentifier(_identifier);

      if (stylesInDOM[_index].references === 0) {
        stylesInDOM[_index].updater();

        stylesInDOM.splice(_index, 1);
      }
    }

    lastIdentifiers = newLastIdentifiers;
  };
};

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/insertBySelector.js":
/*!********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/insertBySelector.js ***!
  \********************************************************************/
/***/ (function(module) {



var memo = {};
/* istanbul ignore next  */

function getTarget(target) {
  if (typeof memo[target] === "undefined") {
    var styleTarget = document.querySelector(target); // Special case to return head of iframe instead of iframe itself

    if (window.HTMLIFrameElement && styleTarget instanceof window.HTMLIFrameElement) {
      try {
        // This will throw an exception if access to iframe is blocked
        // due to cross-origin restrictions
        styleTarget = styleTarget.contentDocument.head;
      } catch (e) {
        // istanbul ignore next
        styleTarget = null;
      }
    }

    memo[target] = styleTarget;
  }

  return memo[target];
}
/* istanbul ignore next  */


function insertBySelector(insert, style) {
  var target = getTarget(insert);

  if (!target) {
    throw new Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");
  }

  target.appendChild(style);
}

module.exports = insertBySelector;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/insertStyleElement.js":
/*!**********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/insertStyleElement.js ***!
  \**********************************************************************/
/***/ (function(module) {



/* istanbul ignore next  */
function insertStyleElement(options) {
  var element = document.createElement("style");
  options.setAttributes(element, options.attributes);
  options.insert(element, options.options);
  return element;
}

module.exports = insertStyleElement;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js":
/*!**********************************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js ***!
  \**********************************************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {



/* istanbul ignore next  */
function setAttributesWithoutAttributes(styleElement) {
  var nonce =  true ? __webpack_require__.nc : 0;

  if (nonce) {
    styleElement.setAttribute("nonce", nonce);
  }
}

module.exports = setAttributesWithoutAttributes;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/styleDomAPI.js":
/*!***************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/styleDomAPI.js ***!
  \***************************************************************/
/***/ (function(module) {



/* istanbul ignore next  */
function apply(styleElement, options, obj) {
  var css = "";

  if (obj.supports) {
    css += "@supports (".concat(obj.supports, ") {");
  }

  if (obj.media) {
    css += "@media ".concat(obj.media, " {");
  }

  var needLayer = typeof obj.layer !== "undefined";

  if (needLayer) {
    css += "@layer".concat(obj.layer.length > 0 ? " ".concat(obj.layer) : "", " {");
  }

  css += obj.css;

  if (needLayer) {
    css += "}";
  }

  if (obj.media) {
    css += "}";
  }

  if (obj.supports) {
    css += "}";
  }

  var sourceMap = obj.sourceMap;

  if (sourceMap && typeof btoa !== "undefined") {
    css += "\n/*# sourceMappingURL=data:application/json;base64,".concat(btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))), " */");
  } // For old IE

  /* istanbul ignore if  */


  options.styleTagTransform(css, styleElement, options.options);
}

function removeStyleElement(styleElement) {
  // istanbul ignore if
  if (styleElement.parentNode === null) {
    return false;
  }

  styleElement.parentNode.removeChild(styleElement);
}
/* istanbul ignore next  */


function domAPI(options) {
  var styleElement = options.insertStyleElement(options);
  return {
    update: function update(obj) {
      apply(styleElement, options, obj);
    },
    remove: function remove() {
      removeStyleElement(styleElement);
    }
  };
}

module.exports = domAPI;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/styleTagTransform.js":
/*!*********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/styleTagTransform.js ***!
  \*********************************************************************/
/***/ (function(module) {



/* istanbul ignore next  */
function styleTagTransform(css, styleElement) {
  if (styleElement.styleSheet) {
    styleElement.styleSheet.cssText = css;
  } else {
    while (styleElement.firstChild) {
      styleElement.removeChild(styleElement.firstChild);
    }

    styleElement.appendChild(document.createTextNode(css));
  }
}

module.exports = styleTagTransform;

/***/ })

},
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ var __webpack_exec__ = function(moduleId) { return __webpack_require__(__webpack_require__.s = moduleId); }
/******/ var __webpack_exports__ = (__webpack_exec__("./src/view/view.js"));
/******/ }
]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBQWdDO0FBQ1U7QUFDQztBQUUzQyxNQUFNRyxTQUFTLEdBQUcsTUFBTTtFQUN0QjtFQUNBLE1BQU1DLE1BQU0sR0FBRyxNQUFNO0lBQ25CLElBQUlDLFFBQVEsR0FBRyxJQUFJO0lBQ25CLElBQUlDLE1BQU0sR0FBRyxJQUFJO0lBQ2pCLElBQUlDLFdBQVc7SUFDZixJQUFJQyxhQUFhLENBQUMsQ0FBQzs7SUFFbkIsTUFBTUMsTUFBTSxHQUFHLE1BQU07TUFDbkIsTUFBTUMsTUFBTSxHQUFHO1FBQ2JKLE1BQU0sRUFBRSxLQUFLO1FBQ2JLLEdBQUcsRUFBRSxLQUFLO1FBQ1ZDLElBQUksRUFBRSxLQUFLO1FBQ1hDLElBQUksRUFBRSxLQUFLO1FBQ1hDLFNBQVMsRUFBRTtNQUNiLENBQUM7TUFDRFIsTUFBTSxHQUFHLEtBQUs7TUFDZCxJQUFJLENBQUNELFFBQVEsRUFBRTtRQUNiSyxNQUFNLENBQUNDLEdBQUcsR0FBR0osV0FBVyxDQUFDSSxHQUFHLEVBQUU7UUFDOUIsSUFBSUosV0FBVyxDQUFDUSxNQUFNLEVBQUUsRUFBRTtVQUN4QkwsTUFBTSxDQUFDRSxJQUFJLEdBQUcsSUFBSTtVQUNsQkYsTUFBTSxDQUFDRyxJQUFJLEdBQUdOLFdBQVcsQ0FBQ00sSUFBSTtVQUM5QkgsTUFBTSxDQUFDSSxTQUFTLEdBQUdOLGFBQWE7UUFDbEM7TUFDRjtNQUNBLE9BQU9FLE1BQU07SUFDZixDQUFDO0lBRUQsTUFBTU0sTUFBTSxHQUFHLENBQUNDLElBQUksRUFBRUMsYUFBYSxLQUFLO01BQ3RDYixRQUFRLEdBQUcsS0FBSztNQUNoQkUsV0FBVyxHQUFHVSxJQUFJO01BQ2xCVCxhQUFhLEdBQUdVLGFBQWE7SUFDL0IsQ0FBQztJQUVELE9BQU87TUFDTCxJQUFJQyxPQUFPLEdBQUc7UUFDWixPQUFPZCxRQUFRO01BQ2pCLENBQUM7TUFDRCxJQUFJZSxNQUFNLEdBQUc7UUFDWCxPQUFPZCxNQUFNO01BQ2YsQ0FBQztNQUNERyxNQUFNO01BQ05PO0lBQ0YsQ0FBQztFQUNILENBQUM7O0VBRUQ7RUFDQSxJQUFJSyxjQUFjLEdBQUcsQ0FBQztFQUN0QixJQUFJQyxjQUFjLEdBQUcsQ0FBQzs7RUFFdEI7RUFDQSxNQUFNQyxLQUFLLEdBQUdyQiw4REFBTyxDQUFDLEVBQUUsRUFBRUUsTUFBTSxDQUFDOztFQUVqQztFQUNBO0VBQ0E7RUFDQSxNQUFNb0IsWUFBWSxHQUFHLENBQUNYLElBQUksRUFBRVksVUFBVSxFQUFFQyxXQUFXLEtBQUs7SUFDdEQsSUFBSVAsT0FBTyxHQUFHLElBQUk7SUFDbEIsTUFBTVEsTUFBTSxHQUFHMUIsdURBQVMsQ0FBQ1ksSUFBSSxDQUFDO0lBQzlCVSxLQUFLLENBQUNLLGdCQUFnQixDQUFDRCxNQUFNLEVBQUVGLFVBQVUsRUFBRUMsV0FBVyxDQUFDO0lBQ3ZESCxLQUFLLENBQUNNLGFBQWEsQ0FBQ0YsTUFBTSxFQUFFRixVQUFVLEVBQUVDLFdBQVcsRUFBR0ksTUFBTSxJQUFLO01BQy9EWCxPQUFPLEdBQUdBLE9BQU8sSUFBSVcsTUFBTSxDQUFDWCxPQUFPO0lBQ3JDLENBQUMsQ0FBQztJQUNGLElBQUlBLE9BQU8sRUFBRSxPQUFPLENBQUM7SUFDckIsTUFBTSxJQUFJWSxLQUFLLENBQUMsdUJBQXVCLENBQUM7RUFDMUMsQ0FBQztFQUVELE1BQU1DLHNCQUFzQixHQUFHLENBQUNDLFFBQVEsRUFBRVIsVUFBVSxFQUFFQyxXQUFXLEtBQUs7SUFDcEUsTUFBTVEsZUFBZSxHQUFHbEMsc0RBQUksQ0FBQ2lDLFFBQVEsQ0FBQztJQUN0QyxNQUFNTixNQUFNLEdBQUcxQix1REFBUyxDQUFDZ0MsUUFBUSxDQUFDO0lBQ2xDLE1BQU1mLGFBQWEsR0FBRztNQUFFUyxNQUFNO01BQUVGLFVBQVU7TUFBRUM7SUFBWSxDQUFDO0lBQ3pELE1BQU1TLFFBQVEsR0FBSUwsTUFBTSxJQUFLQSxNQUFNLENBQUNkLE1BQU0sQ0FBQ2tCLGVBQWUsRUFBRWhCLGFBQWEsQ0FBQztJQUMxRUssS0FBSyxDQUFDTSxhQUFhLENBQUNGLE1BQU0sRUFBRUYsVUFBVSxFQUFFQyxXQUFXLEVBQUVTLFFBQVEsQ0FBQztJQUM5RCxPQUFPLENBQUM7RUFDVixDQUFDOztFQUVEO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7QUFDRjtBQUNBO0FBQ0E7RUFDRSxNQUFNQyxTQUFTLEdBQUcsQ0FBQ0gsUUFBUSxFQUFFSSxVQUFVLEVBQUVYLFdBQVcsS0FBSztJQUN2RCxJQUFJO01BQ0ZGLFlBQVksQ0FBQ1MsUUFBUSxFQUFFSSxVQUFVLEVBQUVYLFdBQVcsQ0FBQztNQUMvQ00sc0JBQXNCLENBQUNDLFFBQVEsRUFBRUksVUFBVSxFQUFFWCxXQUFXLENBQUM7TUFDekRMLGNBQWMsSUFBSSxDQUFDO0lBQ3JCLENBQUMsQ0FBQyxPQUFPaUIsQ0FBQyxFQUFFO01BQ1YsT0FBT0EsQ0FBQyxDQUFDQyxPQUFPO0lBQ2xCO0lBQ0EsT0FBTyxJQUFJO0VBQ2IsQ0FBQzs7RUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0VBQ0UsTUFBTUMsYUFBYSxHQUFJQyxLQUFLLElBQUs7SUFDL0IsTUFBTVgsTUFBTSxHQUFHUCxLQUFLLENBQUNrQixLQUFLLENBQUNDLEdBQUcsQ0FBQyxDQUFDRCxLQUFLLENBQUNFLE1BQU0sQ0FBQztJQUM3QyxJQUFJO01BQ0YsSUFBSSxDQUFDYixNQUFNLENBQUNWLE1BQU0sRUFBRSxNQUFNLElBQUlXLEtBQUssQ0FBQywrQkFBK0IsQ0FBQztNQUNwRSxNQUFNYSxZQUFZLEdBQUdkLE1BQU0sQ0FBQ3JCLE1BQU0sRUFBRTtNQUNwQ21DLFlBQVksQ0FBQ0gsS0FBSyxHQUFHQSxLQUFLO01BQzFCLElBQUlHLFlBQVksQ0FBQ2hDLElBQUksS0FBSyxJQUFJLEVBQUVVLGNBQWMsSUFBSSxDQUFDO01BQ25ELE9BQU9zQixZQUFZO0lBQ3JCLENBQUMsQ0FBQyxPQUFPTixDQUFDLEVBQUU7TUFDVixPQUFPQSxDQUFDLENBQUNDLE9BQU87SUFDbEI7RUFDRixDQUFDO0VBRUQsT0FBTztJQUNMSCxTQUFTO0lBQ1RaLFlBQVk7SUFDWmdCLGFBQWE7SUFDYixJQUFJSyxJQUFJLEdBQUc7TUFDVCxPQUFPdEIsS0FBSyxDQUFDSSxNQUFNO0lBQ3JCLENBQUM7SUFDRCxJQUFJbUIsZUFBZSxHQUFHO01BQ3BCLE9BQU96QixjQUFjLEtBQUtDLGNBQWM7SUFDMUMsQ0FBQztJQUNEQztFQUNGLENBQUM7QUFDSCxDQUFDO0FBRUQsK0RBQWVwQixTQUFTOzs7Ozs7Ozs7Ozs7OztBQ3RJYztBQUNLO0FBQ0Y7QUFFekMsU0FBUytDLFdBQVcsQ0FBQ0MsTUFBTSxFQUFFO0VBQzNCLE1BQU1aLE9BQU8sR0FBR1ksTUFBTSxLQUFLLE9BQU8sR0FBRyxXQUFXLEdBQUcsZ0JBQWdCO0VBQ25FRixpRUFBYyxDQUFDLGlCQUFpQixFQUFFO0lBQUVWLE9BQU87SUFBRWMsUUFBUSxFQUFFO0VBQU0sQ0FBQyxDQUFDO0FBQ2pFO0FBRUEsU0FBU0MsWUFBWSxDQUFDQyxDQUFDLEVBQUU7RUFDdkIsT0FBTyxJQUFJQyxPQUFPLENBQUVDLE9BQU8sSUFBSztJQUM5QkMsVUFBVSxDQUFDLE1BQU1ELE9BQU8sRUFBRSxFQUFFRixDQUFDLENBQUM7RUFDaEMsQ0FBQyxDQUFDO0FBQ0o7QUFFQSxNQUFNSSxRQUFRLEdBQUcsWUFBWTtFQUMzQixNQUFNQyxVQUFVLEdBQUdaLGdFQUFLLEVBQUU7RUFDMUIsTUFBTWEsVUFBVSxHQUFHYixnRUFBSyxFQUFFO0VBRTFCLE1BQU1jLEtBQUssR0FBR2YsMERBQU0sQ0FBQyxPQUFPLEVBQUVhLFVBQVUsRUFBRUMsVUFBVSxDQUFDO0VBQ3JELE1BQU1FLEtBQUssR0FBR2hCLDBEQUFNLENBQUMsVUFBVSxFQUFFYyxVQUFVLEVBQUVELFVBQVUsQ0FBQzs7RUFFeEQ7RUFDQTtFQUNBO0VBQ0E7RUFDQSxNQUFNRSxLQUFLLENBQUNFLFVBQVUsRUFBRTtFQUN4QixNQUFNRCxLQUFLLENBQUNDLFVBQVUsRUFBRTs7RUFFeEI7RUFDQTtFQUNBO0VBQ0FmLGlFQUFjLENBQUMsWUFBWSxFQUFFLEVBQUUsQ0FBQztFQUNoQyxNQUFNSyxZQUFZLENBQUMsSUFBSSxDQUFDOztFQUV4QjtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0EsT0FBTyxJQUFJLEVBQUU7SUFDWEosV0FBVyxDQUFDLE9BQU8sQ0FBQztJQUNwQixNQUFNWSxLQUFLLENBQUNHLFFBQVEsRUFBRTtJQUN0QixJQUFJSixVQUFVLENBQUNmLGVBQWUsRUFBRTtNQUM5QjtNQUNBO0lBQ0Y7SUFDQUksV0FBVyxDQUFDLFVBQVUsQ0FBQztJQUN2QixNQUFNYSxLQUFLLENBQUNFLFFBQVEsRUFBRTtJQUN0QixJQUFJTCxVQUFVLENBQUNkLGVBQWUsRUFBRTtNQUM5QjtNQUNBO0lBQ0Y7RUFDRjs7RUFFQTtFQUNBLE1BQU1vQixNQUFNLEdBQUdMLFVBQVUsQ0FBQ2YsZUFBZSxHQUFHLE9BQU8sR0FBRyxVQUFVO0VBQ2hFRyxpRUFBYyxDQUFDLFVBQVUsRUFBRWlCLE1BQU0sQ0FBQztBQUNwQyxDQUFDO0FBRUQsK0RBQWVQLFFBQVE7Ozs7Ozs7Ozs7OztBQzVEbUI7QUFFMUMsTUFBTVEsVUFBVSxHQUFHLE1BQU07RUFDdkIsSUFBSUMsY0FBYyxHQUFHLENBQ25CLFNBQVMsRUFDVCxZQUFZLEVBQ1osV0FBVyxFQUNYLFdBQVcsRUFDWCxZQUFZLENBQ2I7RUFFRCxTQUFTQyxNQUFNLENBQUNwRCxJQUFJLEVBQUU7SUFDcEJtRCxjQUFjLEdBQUdBLGNBQWMsQ0FBQ0UsTUFBTSxDQUFFaEMsQ0FBQyxJQUFLQSxDQUFDLEtBQUtyQixJQUFJLENBQUM7RUFDM0Q7RUFFQSxTQUFTc0QsVUFBVSxHQUFHO0lBQ3BCLE9BQU9ILGNBQWMsQ0FBQ0ksR0FBRyxDQUFFbEMsQ0FBQyxJQUFLckMsdURBQVMsQ0FBQ3FDLENBQUMsQ0FBQyxDQUFDO0VBQ2hEO0VBRUEsU0FBU21DLE9BQU8sR0FBRztJQUNqQixPQUFPQyxJQUFJLENBQUNDLEdBQUcsQ0FBQyxHQUFHUCxjQUFjLENBQUM7RUFDcEM7RUFFQSxTQUFTUSxRQUFRLEdBQUc7SUFDbEIsT0FBT0YsSUFBSSxDQUFDRyxHQUFHLENBQUMsR0FBR1QsY0FBYyxDQUFDO0VBQ3BDO0VBRUEsT0FBTztJQUNMQyxNQUFNO0lBQ05FLFVBQVU7SUFDVkUsT0FBTztJQUNQRyxRQUFRO0lBQ1IsSUFBSUUsS0FBSyxHQUFHO01BQ1YsT0FBT1YsY0FBYztJQUN2QjtFQUNGLENBQUM7QUFDSCxDQUFDO0FBRUQsK0RBQWVELFVBQVU7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDdENnQjtBQUNDO0FBQ1U7QUFDVDtBQUNiO0FBQ2M7O0FBRTVDO0FBQ0E7QUFDQSxNQUFNYyxTQUFTLEdBQUcsQ0FBQ3ZDLEdBQUcsRUFBRUMsTUFBTSxNQUFNO0VBQUVELEdBQUc7RUFBRUM7QUFBTyxDQUFDLENBQUM7QUFFcEQsTUFBTUksTUFBTSxHQUFHLENBQUNtQyxNQUFNLEVBQUVDLFdBQVcsRUFBRXRCLFVBQVUsS0FBSztFQUNsRCxNQUFNaEQsSUFBSSxHQUFHcUUsTUFBTTtFQUNuQixNQUFNRSxRQUFRLEdBQUdELFdBQVc7RUFDNUIsTUFBTUUsV0FBVyxHQUFHeEIsVUFBVTtFQUM5QixNQUFNeUIsV0FBVyxHQUNmekUsSUFBSSxLQUFLLE9BQU8sR0FBRyxzQkFBc0IsR0FBRyxxQkFBcUI7RUFDbkUsTUFBTXVELGNBQWMsR0FBR0QsNkRBQVUsRUFBRTtFQUVuQyxTQUFTb0IsWUFBWSxDQUFDOUMsS0FBSyxFQUFFK0MsR0FBRyxFQUFFO0lBQ2hDLE1BQU1DLFNBQVMsR0FBRyxFQUFFO0lBQ3BCLE1BQU1DLFFBQVEsR0FBSUMsR0FBRyxJQUFLQSxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUN0QyxNQUFNQyxTQUFTLEdBQUlELEdBQUcsSUFBS0EsR0FBRyxHQUFHLENBQUMsR0FBRyxFQUFFO0lBQ3ZDLE1BQU07TUFBRWpEO0lBQUksQ0FBQyxHQUFHRCxLQUFLO0lBQ3JCLE1BQU07TUFBRUU7SUFBTyxDQUFDLEdBQUdGLEtBQUs7SUFDeEIsSUFBSStDLEdBQUcsS0FBSyxZQUFZLEVBQUU7TUFDeEIsSUFBSUUsUUFBUSxDQUFDL0MsTUFBTSxDQUFDLEVBQUU4QyxTQUFTLENBQUNJLElBQUksQ0FBQztRQUFFbkQsR0FBRztRQUFFQyxNQUFNLEVBQUVGLEtBQUssQ0FBQ0UsTUFBTSxHQUFHO01BQUUsQ0FBQyxDQUFDO01BQ3ZFLElBQUlpRCxTQUFTLENBQUNqRCxNQUFNLENBQUMsRUFBRThDLFNBQVMsQ0FBQ0ksSUFBSSxDQUFDO1FBQUVuRCxHQUFHO1FBQUVDLE1BQU0sRUFBRUYsS0FBSyxDQUFDRSxNQUFNLEdBQUc7TUFBRSxDQUFDLENBQUM7SUFDMUUsQ0FBQyxNQUFNLElBQUk2QyxHQUFHLEtBQUssVUFBVSxFQUFFO01BQzdCLElBQUlFLFFBQVEsQ0FBQ2hELEdBQUcsQ0FBQyxFQUFFK0MsU0FBUyxDQUFDSSxJQUFJLENBQUM7UUFBRW5ELEdBQUcsRUFBRUQsS0FBSyxDQUFDQyxHQUFHLEdBQUcsQ0FBQztRQUFFQztNQUFPLENBQUMsQ0FBQztNQUNqRSxJQUFJaUQsU0FBUyxDQUFDbEQsR0FBRyxDQUFDLEVBQUUrQyxTQUFTLENBQUNJLElBQUksQ0FBQztRQUFFbkQsR0FBRyxFQUFFRCxLQUFLLENBQUNDLEdBQUcsR0FBRyxDQUFDO1FBQUVDO01BQU8sQ0FBQyxDQUFDO0lBQ3BFLENBQUMsTUFBTTtNQUNMLElBQUkrQyxRQUFRLENBQUMvQyxNQUFNLENBQUMsRUFBRThDLFNBQVMsQ0FBQ0ksSUFBSSxDQUFDO1FBQUVuRCxHQUFHO1FBQUVDLE1BQU0sRUFBRUYsS0FBSyxDQUFDRSxNQUFNLEdBQUc7TUFBRSxDQUFDLENBQUM7TUFDdkUsSUFBSWlELFNBQVMsQ0FBQ2pELE1BQU0sQ0FBQyxFQUFFOEMsU0FBUyxDQUFDSSxJQUFJLENBQUM7UUFBRW5ELEdBQUc7UUFBRUMsTUFBTSxFQUFFRixLQUFLLENBQUNFLE1BQU0sR0FBRztNQUFFLENBQUMsQ0FBQztNQUN4RSxJQUFJK0MsUUFBUSxDQUFDaEQsR0FBRyxDQUFDLEVBQUUrQyxTQUFTLENBQUNJLElBQUksQ0FBQztRQUFFbkQsR0FBRyxFQUFFRCxLQUFLLENBQUNDLEdBQUcsR0FBRyxDQUFDO1FBQUVDO01BQU8sQ0FBQyxDQUFDO01BQ2pFLElBQUlpRCxTQUFTLENBQUNsRCxHQUFHLENBQUMsRUFBRStDLFNBQVMsQ0FBQ0ksSUFBSSxDQUFDO1FBQUVuRCxHQUFHLEVBQUVELEtBQUssQ0FBQ0MsR0FBRyxHQUFHLENBQUM7UUFBRUM7TUFBTyxDQUFDLENBQUM7SUFDcEU7SUFDQSxPQUFPOEMsU0FBUztFQUNsQjs7RUFFQTtFQUNBO0VBQ0E7RUFDQSxTQUFTSyxrQkFBa0IsQ0FBQ3JELEtBQUssRUFBRTtJQUNqQyxJQUFJQSxLQUFLLEdBQUcsQ0FBQyxDQUFDLElBQUlBLEtBQUssR0FBRyxFQUFFLEVBQUUsT0FBTyxLQUFLO0lBQzFDLE9BQU8sSUFBSTtFQUNiOztFQUVBO0VBQ0E7RUFDQSxNQUFNc0QsVUFBVSxHQUFHLENBQUMsTUFBTTtJQUN4QixNQUFNQyxRQUFRLEdBQUc7TUFBRXJGLEdBQUcsRUFBRSxLQUFLO01BQUVDLElBQUksRUFBRSxLQUFLO01BQUVOLE1BQU0sRUFBRSxJQUFJO01BQUUyRixJQUFJLEVBQUU7SUFBRSxDQUFDO0lBQ25FLE1BQU1DLFNBQVMsR0FBR2hHLDhEQUFPLENBQUMsRUFBRSxFQUFFLE1BQU1pRyxlQUFlLENBQUNILFFBQVEsQ0FBQyxDQUFDO0lBQzlELElBQUlJLGdCQUFnQixHQUFHLENBQUM7O0lBRXhCO0lBQ0EsSUFBSUMsU0FBUyxHQUFHLENBQUM7SUFDakIsSUFBSUMsV0FBVztJQUNmLElBQUlDLG1CQUFtQixHQUFHLE1BQU0sQ0FBQyxDQUFDOztJQUVsQztJQUNBO0lBQ0EsTUFBTUMsU0FBUyxHQUFJL0QsS0FBSyxJQUFLO01BQzNCLElBQUlxRCxrQkFBa0IsQ0FBQ3JELEtBQUssQ0FBQ0MsR0FBRyxDQUFDLElBQUlvRCxrQkFBa0IsQ0FBQ3JELEtBQUssQ0FBQ0UsTUFBTSxDQUFDLEVBQUU7UUFDckUsT0FBTyxLQUFLO01BQ2Q7TUFDQSxJQUFJdUQsU0FBUyxDQUFDekQsS0FBSyxDQUFDQyxHQUFHLENBQUMsQ0FBQ0QsS0FBSyxDQUFDRSxNQUFNLENBQUMsQ0FBQ3JDLE1BQU0sS0FBSyxJQUFJLEVBQUU7UUFDdEQsT0FBTyxJQUFJO01BQ2I7TUFDQSxPQUFPLEtBQUs7SUFDZCxDQUFDOztJQUVEO0lBQ0E7SUFDQTtJQUNBLE1BQU1tRyxVQUFVLEdBQUlDLFdBQVcsSUFBSztNQUNsQyxJQUFJakUsS0FBSztNQUNULE1BQU1rRSxjQUFjLEdBQ2xCLE9BQU9ELFdBQVcsS0FBSyxXQUFXLEdBQzlCMUIscURBQVksR0FDWkEsdURBQWMsQ0FBQzBCLFdBQVcsQ0FBQztNQUNqQyxHQUFHO1FBQ0RqRSxLQUFLLEdBQUdrRSxjQUFjLEVBQUU7TUFDMUIsQ0FBQyxRQUFRLENBQUNILFNBQVMsQ0FBQy9ELEtBQUssQ0FBQztNQUMxQixPQUFPQSxLQUFLO0lBQ2QsQ0FBQzs7SUFFRDtJQUNBLFNBQVNvRSxVQUFVLENBQUNuRyxNQUFNLEVBQUU7TUFDMUIsT0FBT0EsTUFBTSxDQUFDQyxHQUFHLElBQUksQ0FBQ0QsTUFBTSxDQUFDRSxJQUFJO0lBQ25DO0lBQ0E7SUFDQSxTQUFTa0csU0FBUyxDQUFDcEcsTUFBTSxFQUFFO01BQ3pCLE9BQU9BLE1BQU0sQ0FBQ0osTUFBTSxLQUFLLElBQUk7SUFDL0I7O0lBRUE7SUFDQSxTQUFTeUcsUUFBUSxDQUFDcEYsTUFBTSxFQUFFYyxLQUFLLEVBQUV1RSxHQUFHLEVBQUU7TUFDcEMsSUFBSUMsSUFBSSxHQUFHLElBQUk7TUFDZixJQUFJO1FBQ0ZmLFNBQVMsQ0FBQ3RFLGdCQUFnQixDQUFDRCxNQUFNLEVBQUVjLEtBQUssRUFBRXVFLEdBQUcsQ0FBQztRQUM5Q2QsU0FBUyxDQUFDckUsYUFBYSxDQUFDRixNQUFNLEVBQUVjLEtBQUssRUFBRXVFLEdBQUcsRUFBR3RHLE1BQU0sSUFBSztVQUN0RHVHLElBQUksR0FBR0EsSUFBSSxJQUFJdkcsTUFBTSxDQUFDSixNQUFNO1FBQzlCLENBQUMsQ0FBQztNQUNKLENBQUMsQ0FBQyxNQUFNO1FBQ047UUFDQSxPQUFPLEtBQUs7TUFDZDtNQUNBLE9BQU8yRyxJQUFJO0lBQ2I7SUFFQSxTQUFTQyxXQUFXLENBQUN2RixNQUFNLEVBQUVjLEtBQUssRUFBRXVFLEdBQUcsRUFBRTtNQUN2Q2QsU0FBUyxDQUFDckUsYUFBYSxDQUFDRixNQUFNLEVBQUVjLEtBQUssRUFBRXVFLEdBQUcsRUFBR3RHLE1BQU0sSUFBSztRQUN0REEsTUFBTSxDQUFDdUYsSUFBSSxJQUFJLENBQUM7UUFDaEIsSUFBSXZGLE1BQU0sQ0FBQ3VGLElBQUksR0FBR0csZ0JBQWdCLEVBQUVBLGdCQUFnQixHQUFHMUYsTUFBTSxDQUFDdUYsSUFBSTtNQUNwRSxDQUFDLENBQUM7SUFDSjtJQUVBLFNBQVNrQixnQkFBZ0IsQ0FBQ3hGLE1BQU0sRUFBRWMsS0FBSyxFQUFFO01BQ3ZDLE1BQU0yRSxnQkFBZ0IsR0FBR0wsUUFBUSxDQUFDcEYsTUFBTSxFQUFFYyxLQUFLLEVBQUUsWUFBWSxDQUFDO01BQzlELE1BQU00RSxjQUFjLEdBQUdOLFFBQVEsQ0FBQ3BGLE1BQU0sRUFBRWMsS0FBSyxFQUFFLFVBQVUsQ0FBQztNQUMxRCxJQUFJMkUsZ0JBQWdCLEtBQUssSUFBSSxFQUFFRixXQUFXLENBQUN2RixNQUFNLEVBQUVjLEtBQUssRUFBRSxZQUFZLENBQUM7TUFDdkUsSUFBSTRFLGNBQWMsS0FBSyxJQUFJLEVBQUVILFdBQVcsQ0FBQ3ZGLE1BQU0sRUFBRWMsS0FBSyxFQUFFLFVBQVUsQ0FBQztJQUNyRTtJQUVBLFNBQVM2RSxvQkFBb0IsR0FBRztNQUM5QjtNQUNBbEIsZ0JBQWdCLEdBQUcsQ0FBQztNQUNwQkYsU0FBUyxDQUFDcUIsV0FBVyxDQUFFN0csTUFBTSxJQUFLO1FBQ2hDQSxNQUFNLENBQUN1RixJQUFJLEdBQUcsQ0FBQztNQUNqQixDQUFDLENBQUM7TUFDRjtNQUNBLE1BQU11QixPQUFPLEdBQUdwRCxjQUFjLENBQUNHLFVBQVUsRUFBRTtNQUMzQztNQUNBLEtBQUssSUFBSWtELENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBRyxFQUFFLEVBQUVBLENBQUMsSUFBSSxDQUFDLEVBQUU7UUFDOUIsS0FBSyxJQUFJQyxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUcsRUFBRSxFQUFFQSxDQUFDLElBQUksQ0FBQyxFQUFFO1VBQzlCLElBQUlDLFNBQVMsR0FBRzFDLFNBQVMsQ0FBQ3dDLENBQUMsRUFBRUMsQ0FBQyxDQUFDO1VBQy9CO1VBQ0EsS0FBSyxJQUFJRSxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUdKLE9BQU8sQ0FBQzdGLE1BQU0sRUFBRWlHLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDMUNULGdCQUFnQixDQUFDSyxPQUFPLENBQUNJLENBQUMsQ0FBQyxFQUFFRCxTQUFTLENBQUM7VUFDekM7UUFDRjtNQUNGO0lBQ0Y7SUFFQSxTQUFTRSxzQkFBc0IsR0FBRztNQUNoQyxNQUFNQyxNQUFNLEdBQUcsRUFBRTtNQUNqQixLQUFLLElBQUlMLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBRyxFQUFFLEVBQUVBLENBQUMsSUFBSSxDQUFDLEVBQUU7UUFDOUIsS0FBSyxJQUFJQyxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUcsRUFBRSxFQUFFQSxDQUFDLElBQUksQ0FBQyxFQUFFO1VBQzlCLElBQUl4QixTQUFTLENBQUN1QixDQUFDLENBQUMsQ0FBQ0MsQ0FBQyxDQUFDLENBQUN6QixJQUFJLEtBQUtHLGdCQUFnQixFQUFFO1lBQzdDMEIsTUFBTSxDQUFDakMsSUFBSSxDQUFDWixTQUFTLENBQUN3QyxDQUFDLEVBQUVDLENBQUMsQ0FBQyxDQUFDO1VBQzlCO1FBQ0Y7TUFDRjtNQUNBLE9BQU9JLE1BQU07SUFDZjs7SUFFQTtJQUNBLFNBQVNDLGNBQWMsR0FBRztNQUN4QjtNQUNBLElBQUlDLFFBQVEsR0FBRyxDQUFDO01BQ2hCO01BQ0EsSUFBSUMsTUFBTSxHQUFHL0IsU0FBUyxDQUFDZ0MsWUFBWSxDQUFDckIsVUFBVSxFQUFFbUIsUUFBUSxDQUFDO01BQ3pEO01BQ0EsSUFBSUMsTUFBTSxLQUFLLEtBQUssRUFBRSxPQUFPLEtBQUs7TUFDbEMsT0FBTyxDQUFDL0IsU0FBUyxDQUFDaUMsYUFBYSxDQUFDRixNQUFNLEVBQUVuQixTQUFTLENBQUMsRUFBRTtRQUNsRGtCLFFBQVEsSUFBSSxDQUFDO1FBQ2JDLE1BQU0sR0FBRy9CLFNBQVMsQ0FBQ2dDLFlBQVksQ0FBQ3JCLFVBQVUsRUFBRW1CLFFBQVEsQ0FBQztNQUN2RDtNQUNBLE9BQU9DLE1BQU07SUFDZjs7SUFFQTtJQUNBLE1BQU1HLFVBQVUsR0FBRztJQUNqQjtJQUNBLElBQUk1RSxPQUFPLENBQUVDLE9BQU8sSUFBSztNQUN2QixJQUFJNEUsV0FBVztNQUNmLElBQUlDLGFBQWE7TUFDakIsSUFBSUwsTUFBTTtNQUNWLElBQUlNLGNBQWM7TUFDbEIsTUFBTUMsWUFBWSxHQUFHLEdBQUc7TUFDeEI7QUFDUjtBQUNBO01BQ1E7TUFDQTtNQUNBUCxNQUFNLEdBQUdGLGNBQWMsRUFBRTtNQUN6QixJQUFJRSxNQUFNLEtBQUssS0FBSyxFQUFFO1FBQ3BCO1FBQ0E7UUFDQVgsb0JBQW9CLEVBQUU7UUFDdEI7UUFDQSxNQUFNbUIscUJBQXFCLEdBQUdaLHNCQUFzQixFQUFFO1FBQ3REO1FBQ0FRLFdBQVcsR0FBRzVCLFVBQVUsQ0FBQ2dDLHFCQUFxQixDQUFDO01BQ2pELENBQUMsTUFBTSxJQUFJdkMsU0FBUyxDQUFDaUMsYUFBYSxDQUFDRixNQUFNLEVBQUVwQixVQUFVLEVBQUUsWUFBWSxDQUFDLEVBQUU7UUFDcEUsSUFBSTtVQUNGO1VBQ0F5QixhQUFhLEdBQUcvQyxZQUFZLENBQUMwQyxNQUFNLEVBQUUsWUFBWSxDQUFDO1VBQ2xESSxXQUFXLEdBQUc1QixVQUFVLENBQUM2QixhQUFhLENBQUM7UUFDekMsQ0FBQyxDQUFDLE1BQU07VUFDTixJQUFJO1lBQ0Y7WUFDQUMsY0FBYyxHQUFHckMsU0FBUyxDQUFDd0MsU0FBUyxDQUFDVCxNQUFNLEVBQUVwQixVQUFVLENBQUM7WUFDeEQ7WUFDQXlCLGFBQWEsR0FBRy9DLFlBQVksQ0FBQ2dELGNBQWMsRUFBRSxZQUFZLENBQUM7WUFDMUQ7WUFDQUYsV0FBVyxHQUFHNUIsVUFBVSxDQUFDNkIsYUFBYSxDQUFDO1VBQ3pDLENBQUMsQ0FBQyxNQUFNO1lBQ047WUFDQUEsYUFBYSxHQUFHL0MsWUFBWSxDQUFDMEMsTUFBTSxFQUFFLFVBQVUsQ0FBQztZQUNoREksV0FBVyxHQUFHNUIsVUFBVSxDQUFDNkIsYUFBYSxDQUFDO1VBQ3pDO1FBQ0Y7TUFDRixDQUFDLE1BQU07UUFDTCxJQUFJO1VBQ0Y7VUFDQUEsYUFBYSxHQUFHL0MsWUFBWSxDQUFDMEMsTUFBTSxFQUFFLFVBQVUsQ0FBQztVQUNoREksV0FBVyxHQUFHNUIsVUFBVSxDQUFDNkIsYUFBYSxDQUFDO1FBQ3pDLENBQUMsQ0FBQyxNQUFNO1VBQ04sSUFBSTtZQUNGO1lBQ0FDLGNBQWMsR0FBR3JDLFNBQVMsQ0FBQ3lDLFlBQVksQ0FBQ1YsTUFBTSxFQUFFcEIsVUFBVSxDQUFDO1lBQzNEO1lBQ0F5QixhQUFhLEdBQUcvQyxZQUFZLENBQUNnRCxjQUFjLEVBQUUsVUFBVSxDQUFDO1lBQ3hEO1lBQ0FGLFdBQVcsR0FBRzVCLFVBQVUsQ0FBQzZCLGFBQWEsQ0FBQztVQUN6QyxDQUFDLENBQUMsTUFBTTtZQUNOO1lBQ0FBLGFBQWEsR0FBRy9DLFlBQVksQ0FBQzBDLE1BQU0sRUFBRSxZQUFZLENBQUM7WUFDbERJLFdBQVcsR0FBRzVCLFVBQVUsQ0FBQzZCLGFBQWEsQ0FBQztVQUN6QztRQUNGO01BQ0Y7O01BRUE7TUFDQTVFLFVBQVUsQ0FBQyxNQUFNRCxPQUFPLENBQUM0RSxXQUFXLENBQUMsRUFBRUcsWUFBWSxDQUFDO0lBQ3RELENBQUMsQ0FBQzs7SUFFSjtJQUNBLFNBQVNJLGtCQUFrQixDQUFDbkcsS0FBSyxFQUFFO01BQ2pDO01BQ0EsSUFBSTRELFNBQVMsS0FBSyxDQUFDLEVBQUU7UUFDbkJFLG1CQUFtQixDQUFDOUQsS0FBSyxDQUFDO1FBQzFCO1FBQ0E0RCxTQUFTLEdBQUcsQ0FBQztNQUNmO0lBQ0Y7O0lBRUE7SUFDQSxTQUFTd0MsZ0JBQWdCLEdBQUc7TUFDMUI7TUFDQXZDLFdBQVcsR0FBRyxJQUFJOUMsT0FBTyxDQUFFQyxPQUFPLElBQUs7UUFDckM7UUFDQTtRQUNBOEMsbUJBQW1CLEdBQUc5QyxPQUFPO01BQy9CLENBQUMsQ0FBQztNQUNGO01BQ0E0QyxTQUFTLEdBQUcsQ0FBQztNQUNiO01BQ0EsT0FBT0MsV0FBVztJQUNwQjs7SUFFQTtJQUNBO0lBQ0EsU0FBU3dDLFFBQVEsQ0FBQ3BJLE1BQU0sRUFBRTtNQUN4QixNQUFNO1FBQUVnQztNQUFJLENBQUMsR0FBR2hDLE1BQU0sQ0FBQytCLEtBQUs7TUFDNUIsTUFBTTtRQUFFRTtNQUFPLENBQUMsR0FBR2pDLE1BQU0sQ0FBQytCLEtBQUs7TUFDL0J5RCxTQUFTLENBQUN4RCxHQUFHLENBQUMsQ0FBQ0MsTUFBTSxDQUFDLEdBQUdqQyxNQUFNO01BQy9CO01BQ0EsSUFBSUEsTUFBTSxDQUFDRSxJQUFJLEtBQUssSUFBSSxFQUFFO1FBQ3hCO1FBQ0F3RCxjQUFjLENBQUNDLE1BQU0sQ0FBQzNELE1BQU0sQ0FBQ0csSUFBSSxDQUFDO1FBQ2xDO1FBQ0EsTUFBTWtJLGNBQWMsR0FBR2hFLGtGQUE0QixDQUNqRHJFLE1BQU0sQ0FBQ0ksU0FBUyxDQUFDYSxNQUFNLEVBQ3ZCakIsTUFBTSxDQUFDSSxTQUFTLENBQUNXLFVBQVUsRUFDM0JmLE1BQU0sQ0FBQ0ksU0FBUyxDQUFDWSxXQUFXLENBQzdCO1FBQ0Q7UUFDQSxLQUFLLElBQUkrRixDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUdzQixjQUFjLENBQUNwSCxNQUFNLEVBQUU4RixDQUFDLElBQUksQ0FBQyxFQUFFO1VBQ2pELE1BQU13QixDQUFDLEdBQUdGLGNBQWMsQ0FBQ3RCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztVQUM5QixNQUFNeUIsQ0FBQyxHQUFHSCxjQUFjLENBQUN0QixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7VUFDOUJ2QixTQUFTLENBQUMrQyxDQUFDLENBQUMsQ0FBQ0MsQ0FBQyxDQUFDLENBQUN0SSxJQUFJLEdBQUcsSUFBSTtVQUMzQnNGLFNBQVMsQ0FBQytDLENBQUMsQ0FBQyxDQUFDQyxDQUFDLENBQUMsQ0FBQ3BJLFNBQVMsR0FBR0osTUFBTSxDQUFDSSxTQUFTO1FBQzlDO01BQ0Y7SUFDRjtJQUVBLE9BQU87TUFDTGdJLFFBQVE7TUFDUkQsZ0JBQWdCO01BQ2hCRCxrQkFBa0I7TUFDbEJwQyxTQUFTO01BQ1Q0QjtJQUNGLENBQUM7RUFDSCxDQUFDLEdBQUc7O0VBRUo7RUFDQTtFQUNBO0VBQ0E7RUFDQSxTQUFTZSxXQUFXLENBQUN6SSxNQUFNLEVBQUU7SUFDM0J1QyxpRUFBYyxDQUFDcUMsV0FBVyxFQUFFNUUsTUFBTSxDQUFDO0VBQ3JDOztFQUVBO0VBQ0E7RUFDQTtFQUNBLGVBQWUwSSxlQUFlLEdBQUc7SUFDL0IsT0FBT3JELFVBQVUsQ0FBQzhDLGdCQUFnQixFQUFFO0VBQ3RDOztFQUVBO0VBQ0E7RUFDQTtFQUNBLE1BQU01RSxRQUFRLEdBQUcsWUFBWTtJQUMzQixNQUFNb0YsY0FBYyxHQUNsQnhJLElBQUksS0FBSyxPQUFPLEdBQUd1SSxlQUFlLEdBQUdyRCxVQUFVLENBQUNxQyxVQUFVO0lBQzVELE1BQU1DLFdBQVcsR0FBRyxNQUFNZ0IsY0FBYyxFQUFFO0lBRTFDLElBQUl0RCxVQUFVLENBQUNTLFNBQVMsQ0FBQzZCLFdBQVcsQ0FBQyxFQUFFO01BQ3JDLE1BQU0zSCxNQUFNLEdBQUcyRSxXQUFXLENBQUM3QyxhQUFhLENBQUM2RixXQUFXLENBQUM7TUFDckR0QyxVQUFVLENBQUMrQyxRQUFRLENBQUNwSSxNQUFNLENBQUM7TUFDM0J5SSxXQUFXLENBQUN6SSxNQUFNLENBQUM7TUFDbkIsT0FBTzhDLE9BQU8sQ0FBQ0MsT0FBTyxDQUFDLElBQUksQ0FBQztJQUM5QjtJQUNBLE1BQU0sSUFBSTFCLEtBQUssQ0FBQyxhQUFhLENBQUM7RUFDaEMsQ0FBQzs7RUFFRDtFQUNBO0VBQ0E7RUFDQTtFQUNBLFNBQVN1SCxjQUFjLENBQUNDLFdBQVcsRUFBRUMsWUFBWSxFQUFFOUgsV0FBVyxFQUFFO0lBQzlELE1BQU1DLE1BQU0sR0FBRzFCLHVEQUFTLENBQUNzSixXQUFXLENBQUM7SUFDckM7SUFDQSxNQUFNRSxTQUFTLEdBQUcxRSwwRUFBb0IsQ0FBQ3BELE1BQU0sRUFBRTZILFlBQVksRUFBRTlILFdBQVcsQ0FBQztJQUN6RTtJQUNBO0lBQ0EsTUFBTWdJLGNBQWMsR0FBR3RFLFFBQVEsQ0FBQzdELEtBQUssQ0FBQzRHLGFBQWE7SUFDbkQ7SUFDQSxNQUFNd0IsY0FBYyxHQUFJN0gsTUFBTSxJQUFLLENBQUNBLE1BQU0sQ0FBQ1gsT0FBTztJQUNsRCxLQUFLLElBQUlzRyxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUdnQyxTQUFTLENBQUM5SCxNQUFNLEVBQUU4RixDQUFDLElBQUksQ0FBQyxFQUFFO01BQzVDLElBQUlpQyxjQUFjLENBQUNELFNBQVMsQ0FBQ2hDLENBQUMsQ0FBQyxFQUFFa0MsY0FBYyxDQUFDLEVBQzlDLE1BQU0sSUFBSTVILEtBQUssQ0FBQyxhQUFhLENBQUM7SUFDbEM7SUFDQSxPQUFPLEtBQUs7RUFDZDs7RUFFQTtFQUNBO0VBQ0E7RUFDQTtFQUNBLE1BQU02SCxjQUFjLEdBQUcsTUFBTTtJQUMzQixLQUFLLElBQUluQyxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUdvQyxNQUFNLENBQUNDLElBQUksQ0FBQzdKLHVEQUFTLENBQUMsQ0FBQzBCLE1BQU0sRUFBRThGLENBQUMsSUFBSSxDQUFDLEVBQUU7TUFDekQ7TUFDQSxJQUFJc0MsZUFBZSxHQUFHLElBQUk7TUFDMUI7TUFDQSxNQUFNUixXQUFXLEdBQUdNLE1BQU0sQ0FBQ0MsSUFBSSxDQUFDN0osdURBQVMsQ0FBQyxDQUFDd0gsQ0FBQyxDQUFDO01BQzdDLElBQUkrQixZQUFZO01BQ2hCLElBQUk5SCxXQUFXO01BQ2YsT0FBT3FJLGVBQWUsRUFBRTtRQUN0QixJQUFJO1VBQ0Y7VUFDQVAsWUFBWSxHQUFHeEUscURBQVksRUFBRTtVQUM3QjtVQUNBdEQsV0FBVyxHQUFHc0QsMkRBQWtCLEVBQUU7VUFDbEM7VUFDQUksUUFBUSxDQUFDNUQsWUFBWSxDQUFDK0gsV0FBVyxFQUFFQyxZQUFZLEVBQUU5SCxXQUFXLENBQUM7VUFDN0Q7VUFDQTRILGNBQWMsQ0FBQ0MsV0FBVyxFQUFFQyxZQUFZLEVBQUU5SCxXQUFXLENBQUM7VUFDdEQ7VUFDQTBELFFBQVEsQ0FBQ2hELFNBQVMsQ0FBQ21ILFdBQVcsRUFBRUMsWUFBWSxFQUFFOUgsV0FBVyxDQUFDO1VBQzFEcUksZUFBZSxHQUFHLEtBQUs7UUFDekIsQ0FBQyxDQUFDLE1BQU07VUFDTjtVQUNBO1FBQ0Y7TUFDRjtJQUNGO0lBQ0EsT0FBT3ZHLE9BQU8sQ0FBQ0MsT0FBTyxDQUFDLElBQUksQ0FBQztFQUM5QixDQUFDOztFQUVEO0VBQ0E7RUFDQTtFQUNBLGVBQWV1RyxnQkFBZ0IsQ0FBQ0MsU0FBUyxFQUFFO0lBQ3pDO0lBQ0EsT0FBTyxJQUFJekcsT0FBTyxDQUFFQyxPQUFPLElBQUs7TUFDOUI7TUFDQVIsbUVBQWdCLENBQUNnSCxTQUFTLEVBQUdFLElBQUksSUFBSztRQUNwQzFHLE9BQU8sQ0FBQzBHLElBQUksQ0FBQztNQUNmLENBQUMsQ0FBQztJQUNKLENBQUMsQ0FBQztFQUNKOztFQUVBO0VBQ0E7RUFDQSxNQUFNQywwQkFBMEIsR0FBSUMsU0FBUyxJQUFLO0lBQ2hEakYsUUFBUSxDQUFDaEQsU0FBUyxDQUNoQmlJLFNBQVMsQ0FBQ3hKLElBQUksRUFDZHdKLFNBQVMsQ0FBQzVJLFVBQVUsRUFDcEI0SSxTQUFTLENBQUMzSSxXQUFXLENBQ3RCO0VBQ0gsQ0FBQzs7RUFFRDtFQUNBO0VBQ0EsTUFBTTRJLFlBQVksR0FBRyxZQUFZO0lBQy9CLE1BQU1DLGNBQWMsR0FBR1AsZ0JBQWdCLENBQUMsZUFBZSxDQUFDO0lBQ3hELE1BQU1RLGlCQUFpQixHQUFHUixnQkFBZ0IsQ0FBQyxrQkFBa0IsQ0FBQztJQUM5RCxNQUFNUyxnQkFBZ0IsR0FBR1QsZ0JBQWdCLENBQUMsaUJBQWlCLENBQUM7SUFDNUQsTUFBTVUsZ0JBQWdCLEdBQUdWLGdCQUFnQixDQUFDLGlCQUFpQixDQUFDO0lBQzVELE1BQU1XLGlCQUFpQixHQUFHWCxnQkFBZ0IsQ0FBQyxrQkFBa0IsQ0FBQztJQUM5RCxJQUFJSyxTQUFTOztJQUViO0lBQ0FBLFNBQVMsR0FBRyxNQUFNRSxjQUFjO0lBQ2hDSCwwQkFBMEIsQ0FBQ0MsU0FBUyxDQUFDO0lBRXJDQSxTQUFTLEdBQUcsTUFBTUcsaUJBQWlCO0lBQ25DSiwwQkFBMEIsQ0FBQ0MsU0FBUyxDQUFDO0lBRXJDQSxTQUFTLEdBQUcsTUFBTUssZ0JBQWdCO0lBQ2xDTiwwQkFBMEIsQ0FBQ0MsU0FBUyxDQUFDO0lBRXJDQSxTQUFTLEdBQUcsTUFBTUksZ0JBQWdCO0lBQ2xDTCwwQkFBMEIsQ0FBQ0MsU0FBUyxDQUFDO0lBRXJDQSxTQUFTLEdBQUcsTUFBTU0saUJBQWlCO0lBQ25DUCwwQkFBMEIsQ0FBQ0MsU0FBUyxDQUFDO0lBRXJDLE9BQU83RyxPQUFPLENBQUNDLE9BQU8sQ0FBQyxJQUFJLENBQUM7RUFDOUIsQ0FBQzs7RUFFRDtFQUNBLE1BQU1PLFVBQVUsR0FBRyxZQUFZO0lBQzdCLE1BQU00RyxrQkFBa0IsR0FBRy9KLElBQUksS0FBSyxPQUFPLEdBQUd5SixZQUFZLEdBQUdWLGNBQWM7SUFDM0UsTUFBTWdCLGtCQUFrQixFQUFFO0lBRTFCLE9BQU9wSCxPQUFPLENBQUNDLE9BQU8sQ0FBQyxJQUFJLENBQUM7RUFDOUIsQ0FBQzs7RUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFLFNBQVNvSCw4QkFBOEIsR0FBRztJQUN4QzVILG1FQUFnQixDQUFDLGtCQUFrQixFQUFHa0gsSUFBSSxJQUFLO01BQzdDLElBQUk7UUFDRi9FLFFBQVEsQ0FBQzVELFlBQVksQ0FBQzJJLElBQUksQ0FBQ3RKLElBQUksRUFBRXNKLElBQUksQ0FBQzFJLFVBQVUsRUFBRTBJLElBQUksQ0FBQ3pJLFdBQVcsQ0FBQztRQUNuRXVCLGlFQUFjLENBQUMseUJBQXlCLEVBQUUsQ0FBQyxDQUFDO01BQzlDLENBQUMsQ0FBQyxNQUFNO1FBQ05BLGlFQUFjLENBQUMseUJBQXlCLEVBQUUsQ0FBQyxDQUFDO01BQzlDO0lBQ0YsQ0FBQyxDQUFDO0VBQ0o7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFLFNBQVM2SCx5QkFBeUIsR0FBRztJQUNuQzdILG1FQUFnQixDQUFDLFlBQVksRUFBRSxNQUFNO01BQ25DQSxtRUFBZ0IsQ0FBQyxlQUFlLEVBQUdrSCxJQUFJLElBQUs7UUFDMUM7UUFDQSxJQUFJcEUsVUFBVSxDQUFDUyxTQUFTLENBQUMyRCxJQUFJLENBQUMsRUFBRTtVQUM5QjtVQUNBcEUsVUFBVSxDQUFDNkMsa0JBQWtCLENBQUN1QixJQUFJLENBQUM7UUFDckM7TUFDRixDQUFDLENBQUM7SUFDSixDQUFDLENBQUM7RUFDSjtFQUVBLFNBQVNZLHNCQUFzQixHQUFHO0lBQ2hDLElBQUlsSyxJQUFJLEtBQUssT0FBTyxFQUFFO01BQ3BCZ0ssOEJBQThCLEVBQUU7TUFDaENDLHlCQUF5QixFQUFFO0lBQzdCO0VBQ0Y7RUFFQUMsc0JBQXNCLEVBQUU7RUFFeEIsT0FBTztJQUNMOUcsUUFBUTtJQUNSRDtFQUNGLENBQUM7QUFDSCxDQUFDO0FBRUQsK0RBQWVqQixNQUFNOzs7Ozs7Ozs7OztBQ2pmckI7QUFDQTtBQUNBLE1BQU1rQyxTQUFTLEdBQUcsQ0FBQ3ZDLEdBQUcsRUFBRUMsTUFBTSxNQUFNO0VBQUVELEdBQUc7RUFBRUM7QUFBTyxDQUFDLENBQUM7QUFFcEQsTUFBTXFDLE1BQU0sR0FBRyxDQUFDLE1BQU07RUFDcEI7RUFDQTtFQUNBLFNBQVN2QyxLQUFLLEdBQUc7SUFDZixNQUFNdUksU0FBUyxHQUFHdEcsSUFBSSxDQUFDdUcsS0FBSyxDQUFDdkcsSUFBSSxDQUFDTSxNQUFNLEVBQUUsR0FBRyxFQUFFLENBQUM7SUFDaEQsTUFBTWtHLFlBQVksR0FBR3hHLElBQUksQ0FBQ3VHLEtBQUssQ0FBQ3ZHLElBQUksQ0FBQ00sTUFBTSxFQUFFLEdBQUcsRUFBRSxDQUFDO0lBQ25ELE9BQU9DLFNBQVMsQ0FBQytGLFNBQVMsRUFBRUUsWUFBWSxDQUFDO0VBQzNDOztFQUVBO0VBQ0E7RUFDQSxTQUFTeEosV0FBVyxHQUFHO0lBQ3JCLE1BQU15SixXQUFXLEdBQUd6RyxJQUFJLENBQUMwRyxLQUFLLENBQUMxRyxJQUFJLENBQUNNLE1BQU0sRUFBRSxDQUFDO0lBQzdDLE1BQU1xRyxHQUFHLEdBQUdGLFdBQVcsS0FBSyxDQUFDLEdBQUcsWUFBWSxHQUFHLFVBQVU7SUFDekQsT0FBT0UsR0FBRztFQUNaOztFQUVBO0VBQ0E7RUFDQTtFQUNBLFNBQVN6RSxPQUFPLENBQUMwRSxHQUFHLEVBQUU7SUFDcEIsTUFBTTtNQUFFM0o7SUFBTyxDQUFDLEdBQUcySixHQUFHO0lBQ3RCLE1BQU1DLGNBQWMsR0FBR0QsR0FBRztJQUMxQjtJQUNBLE1BQU1FLFdBQVcsR0FBRyxFQUFFO0lBRXRCLE9BQU8sU0FBU0MscUJBQXFCLEdBQUc7TUFDdEM7TUFDQSxJQUFJRCxXQUFXLENBQUM3SixNQUFNLEtBQUs0SixjQUFjLENBQUM1SixNQUFNLEVBQUU7UUFDaEQsTUFBTSxJQUFJSSxLQUFLLENBQUMsZ0JBQWdCLENBQUM7TUFDbkM7O01BRUE7TUFDQSxJQUFJMkosV0FBVyxHQUFHaEgsSUFBSSxDQUFDdUcsS0FBSyxDQUFDdkcsSUFBSSxDQUFDTSxNQUFNLEVBQUUsR0FBR3JELE1BQU0sQ0FBQztNQUNwRDtNQUNBLElBQUk2SixXQUFXLENBQUNHLFFBQVEsQ0FBQ0QsV0FBVyxDQUFDLEVBQUU7UUFDckMsS0FBSyxJQUFJakUsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHLEdBQUcsRUFBRUEsQ0FBQyxJQUFJLENBQUMsRUFBRTtVQUMvQmlFLFdBQVcsR0FBR2hILElBQUksQ0FBQ3VHLEtBQUssQ0FBQ3ZHLElBQUksQ0FBQ00sTUFBTSxFQUFFLEdBQUdyRCxNQUFNLENBQUM7VUFDaEQsSUFBSSxDQUFDNkosV0FBVyxDQUFDRyxRQUFRLENBQUNELFdBQVcsQ0FBQyxFQUFFO1lBQ3RDO1VBQ0Y7UUFDRjtNQUNGO01BQ0FGLFdBQVcsQ0FBQzNGLElBQUksQ0FBQzZGLFdBQVcsQ0FBQztNQUM3QjtNQUNBLE9BQU9ILGNBQWMsQ0FBQ0csV0FBVyxDQUFDO0lBQ3BDLENBQUM7RUFDSDtFQUVBLE9BQU87SUFDTGpKLEtBQUs7SUFDTGYsV0FBVztJQUNYa0Y7RUFDRixDQUFDO0FBQ0gsQ0FBQyxHQUFHO0FBRUosK0RBQWU1QixNQUFNOzs7Ozs7Ozs7Ozs7QUM1RGU7QUFFcEMsTUFBTWhGLElBQUksR0FBSWtGLE1BQU0sSUFBSztFQUN2QixNQUFNMEcsUUFBUSxHQUFHMUcsTUFBTTtFQUN2QixNQUFNdkQsTUFBTSxHQUFHMUIsa0RBQVMsQ0FBQzJMLFFBQVEsQ0FBQztFQUNsQyxJQUFJQyxJQUFJLEdBQUcsQ0FBQztFQUVaLE1BQU1sTCxHQUFHLEdBQUcsTUFBTTtJQUNoQixJQUFJa0wsSUFBSSxHQUFHbEssTUFBTSxFQUFFO01BQ2pCa0ssSUFBSSxJQUFJLENBQUM7TUFDVCxPQUFPLElBQUk7SUFDYjtJQUNBLE9BQU8sS0FBSztFQUNkLENBQUM7RUFFRCxNQUFNOUssTUFBTSxHQUFHLE1BQU07SUFDbkIsSUFBSThLLElBQUksS0FBS2xLLE1BQU0sRUFBRSxPQUFPLElBQUk7SUFDaEMsT0FBTyxLQUFLO0VBQ2QsQ0FBQztFQUVELE9BQU87SUFDTGhCLEdBQUc7SUFDSEksTUFBTTtJQUNOLElBQUlGLElBQUksR0FBRztNQUNULE9BQU8rSyxRQUFRO0lBQ2pCO0VBQ0YsQ0FBQztBQUNILENBQUM7QUFFRCwrREFBZTVMLElBQUk7Ozs7Ozs7Ozs7O0FDN0JuQixNQUFNQyxTQUFTLEdBQUc7RUFDaEI2TCxPQUFPLEVBQUUsQ0FBQztFQUNWQyxVQUFVLEVBQUUsQ0FBQztFQUNiQyxTQUFTLEVBQUUsQ0FBQztFQUNaQyxTQUFTLEVBQUUsQ0FBQztFQUNaQyxVQUFVLEVBQUU7QUFDZCxDQUFDO0FBRUQsK0RBQWVqTSxTQUFTOzs7Ozs7Ozs7OztBQ1J4QixNQUFNQyxPQUFPLEdBQUcsQ0FBQ2lNLE1BQU0sRUFBRUMsU0FBUyxLQUFLO0VBQ3JDLE1BQU12SixJQUFJLEdBQUdzSixNQUFNO0VBRW5CLE1BQU1FLE9BQU8sR0FBSSxTQUFTQyxlQUFlLEdBQUc7SUFDMUMsTUFBTUMsUUFBUSxHQUFHLEVBQUU7SUFDbkIsS0FBSyxJQUFJOUUsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHNUUsSUFBSSxFQUFFNEUsQ0FBQyxJQUFJLENBQUMsRUFBRTtNQUNoQzhFLFFBQVEsQ0FBQzlFLENBQUMsQ0FBQyxHQUFHK0UsS0FBSyxDQUFDQyxJQUFJLENBQUM7UUFBRTlLLE1BQU0sRUFBRWtCO01BQUssQ0FBQyxDQUFDO01BQzFDLEtBQUssSUFBSTZFLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBRzdFLElBQUksRUFBRTZFLENBQUMsSUFBSSxDQUFDLEVBQUU7UUFDaEM2RSxRQUFRLENBQUM5RSxDQUFDLENBQUMsQ0FBQ0MsQ0FBQyxDQUFDLEdBQUcwRSxTQUFTLEVBQUU7TUFDOUI7SUFDRjtJQUNBLE9BQU9HLFFBQVE7RUFDakIsQ0FBQyxFQUFHOztFQUVKO0VBQ0FGLE9BQU8sQ0FBQ3pLLGdCQUFnQixHQUFHLENBQUNELE1BQU0sRUFBRUYsVUFBVSxFQUFFQyxXQUFXLEtBQUs7SUFDOUQ7SUFDQSxJQUNFRCxVQUFVLENBQUNpQixHQUFHLEdBQUcsQ0FBQyxJQUNsQmpCLFVBQVUsQ0FBQ2lCLEdBQUcsR0FBR0csSUFBSSxHQUFHLENBQUMsSUFDekJwQixVQUFVLENBQUNrQixNQUFNLEdBQUcsQ0FBQyxJQUNyQmxCLFVBQVUsQ0FBQ2tCLE1BQU0sR0FBR0UsSUFBSSxHQUFHLENBQUMsRUFDNUI7TUFDQSxNQUFNLElBQUlkLEtBQUssQ0FBQyxtQ0FBbUMsQ0FBQztJQUN0RDs7SUFFQTtJQUNBLElBQ0dMLFdBQVcsS0FBSyxZQUFZLElBQUlELFVBQVUsQ0FBQ2tCLE1BQU0sR0FBR2hCLE1BQU0sR0FBR2tCLElBQUksSUFDakVuQixXQUFXLEtBQUssVUFBVSxJQUFJRCxVQUFVLENBQUNpQixHQUFHLEdBQUdmLE1BQU0sR0FBR2tCLElBQUssRUFDOUQ7TUFDQSxNQUFNLElBQUlkLEtBQUssQ0FBQyxxQkFBcUIsQ0FBQztJQUN4Qzs7SUFFQTtJQUNBLElBQUlMLFdBQVcsS0FBSyxZQUFZLElBQUlBLFdBQVcsS0FBSyxVQUFVLEVBQUU7TUFDOUQsTUFBTSxJQUFJSyxLQUFLLENBQUMsZ0JBQWdCLENBQUM7SUFDbkM7O0lBRUE7SUFDQSxPQUFPLENBQUM7RUFDVixDQUFDOztFQUVEO0VBQ0FzSyxPQUFPLENBQUN4SyxhQUFhLEdBQUcsQ0FBQ0YsTUFBTSxFQUFFRixVQUFVLEVBQUVDLFdBQVcsRUFBRWdMLEdBQUcsS0FBSztJQUNoRSxJQUFJQyxhQUFhO0lBQ2pCLElBQUlqSyxHQUFHO0lBQ1AsSUFBSUMsTUFBTTtJQUNWLElBQUlqQixXQUFXLEtBQUssWUFBWSxFQUFFO01BQ2hDaUwsYUFBYSxHQUFHO1FBQUVDLEtBQUssRUFBRW5MLFVBQVUsQ0FBQ2tCO01BQU8sQ0FBQztNQUM1Q0QsR0FBRyxHQUFHO1FBQUVrSyxLQUFLLEVBQUVuTCxVQUFVLENBQUNpQjtNQUFJLENBQUM7TUFDL0JDLE1BQU0sR0FBR2dLLGFBQWE7SUFDeEIsQ0FBQyxNQUFNO01BQ0xBLGFBQWEsR0FBRztRQUFFQyxLQUFLLEVBQUVuTCxVQUFVLENBQUNpQjtNQUFJLENBQUM7TUFDekNBLEdBQUcsR0FBR2lLLGFBQWE7TUFDbkJoSyxNQUFNLEdBQUc7UUFBRWlLLEtBQUssRUFBRW5MLFVBQVUsQ0FBQ2tCO01BQU8sQ0FBQztJQUN2QztJQUNBLEtBQUssSUFBSThFLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBRzlGLE1BQU0sRUFBRThGLENBQUMsSUFBSSxDQUFDLEVBQUU7TUFDbENpRixHQUFHLENBQUNMLE9BQU8sQ0FBQzNKLEdBQUcsQ0FBQ2tLLEtBQUssQ0FBQyxDQUFDakssTUFBTSxDQUFDaUssS0FBSyxDQUFDLENBQUM7TUFDckNELGFBQWEsQ0FBQ0MsS0FBSyxJQUFJLENBQUM7SUFDMUI7RUFDRixDQUFDOztFQUVEO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0FQLE9BQU8sQ0FBQ2xFLGFBQWEsR0FBRyxDQUFDMUcsVUFBVSxFQUFFaUwsR0FBRyxFQUFFbEgsR0FBRyxLQUFLO0lBQ2hELE1BQU07TUFBRTlDO0lBQUksQ0FBQyxHQUFHakIsVUFBVTtJQUMxQixNQUFNO01BQUVrQjtJQUFPLENBQUMsR0FBR2xCLFVBQVU7SUFDN0IsSUFBSTRKLEdBQUcsR0FBRyxLQUFLO0lBQ2YsU0FBU3dCLE1BQU0sQ0FBQzVELENBQUMsRUFBRUMsQ0FBQyxFQUFFO01BQ3BCbUMsR0FBRyxHQUFHQSxHQUFHLElBQUlxQixHQUFHLENBQUNMLE9BQU8sQ0FBQ3BELENBQUMsQ0FBQyxDQUFDQyxDQUFDLENBQUMsQ0FBQztJQUNqQztJQUNBLElBQUksT0FBTzFELEdBQUcsS0FBSyxXQUFXLEVBQUU7TUFDOUIsSUFBSTlDLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUVtSyxNQUFNLENBQUNuSyxHQUFHLEdBQUcsQ0FBQyxFQUFFQyxNQUFNLENBQUM7TUFDekMsSUFBSUQsR0FBRyxHQUFHLENBQUMsR0FBR0csSUFBSSxHQUFHLENBQUMsRUFBRWdLLE1BQU0sQ0FBQ25LLEdBQUcsR0FBRyxDQUFDLEVBQUVDLE1BQU0sQ0FBQztNQUMvQyxJQUFJQSxNQUFNLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFa0ssTUFBTSxDQUFDbkssR0FBRyxFQUFFQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO01BQzVDLElBQUlBLE1BQU0sR0FBRyxDQUFDLEdBQUdFLElBQUksR0FBRyxDQUFDLEVBQUVnSyxNQUFNLENBQUNuSyxHQUFHLEVBQUVDLE1BQU0sR0FBRyxDQUFDLENBQUM7SUFDcEQsQ0FBQyxNQUFNLElBQUk2QyxHQUFHLEtBQUssWUFBWSxFQUFFO01BQy9CLElBQUk3QyxNQUFNLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFa0ssTUFBTSxDQUFDbkssR0FBRyxFQUFFQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO01BQzVDLElBQUlBLE1BQU0sR0FBRyxDQUFDLEdBQUdFLElBQUksR0FBRyxDQUFDLEVBQUVnSyxNQUFNLENBQUNuSyxHQUFHLEVBQUVDLE1BQU0sR0FBRyxDQUFDLENBQUM7SUFDcEQsQ0FBQyxNQUFNO01BQ0wsSUFBSUQsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRW1LLE1BQU0sQ0FBQ25LLEdBQUcsR0FBRyxDQUFDLEVBQUVDLE1BQU0sQ0FBQztNQUN6QyxJQUFJRCxHQUFHLEdBQUcsQ0FBQyxHQUFHRyxJQUFJLEdBQUcsQ0FBQyxFQUFFZ0ssTUFBTSxDQUFDbkssR0FBRyxHQUFHLENBQUMsRUFBRUMsTUFBTSxDQUFDO0lBQ2pEO0lBRUEsT0FBTzBJLEdBQUc7RUFDWixDQUFDOztFQUVEO0VBQ0E7RUFDQWdCLE9BQU8sQ0FBQ25FLFlBQVksR0FBRyxDQUFDd0UsR0FBRyxFQUFFMUUsUUFBUSxLQUFLO0lBQ3hDLElBQUk4RSxTQUFTLEdBQUcsQ0FBQztJQUNqQixLQUFLLElBQUlyRixDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUc1RSxJQUFJLEVBQUU0RSxDQUFDLElBQUksQ0FBQyxFQUFFO01BQ2hDLEtBQUssSUFBSUMsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHN0UsSUFBSSxFQUFFNkUsQ0FBQyxJQUFJLENBQUMsRUFBRTtRQUNoQyxJQUFJZ0YsR0FBRyxDQUFDTCxPQUFPLENBQUM1RSxDQUFDLENBQUMsQ0FBQ0MsQ0FBQyxDQUFDLENBQUMsRUFBRTtVQUN0QixJQUFJb0YsU0FBUyxLQUFLOUUsUUFBUSxFQUFFLE9BQU87WUFBRXRGLEdBQUcsRUFBRStFLENBQUM7WUFBRTlFLE1BQU0sRUFBRStFO1VBQUUsQ0FBQztVQUN4RG9GLFNBQVMsSUFBSSxDQUFDO1FBQ2hCO01BQ0Y7SUFDRjtJQUNBLE9BQU8sS0FBSztFQUNkLENBQUM7O0VBRUQ7RUFDQVQsT0FBTyxDQUFDOUUsV0FBVyxHQUFJbUYsR0FBRyxJQUFLO0lBQzdCLEtBQUssSUFBSWpGLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBRzVFLElBQUksRUFBRTRFLENBQUMsSUFBSSxDQUFDLEVBQUU7TUFDaEMsS0FBSyxJQUFJQyxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUc3RSxJQUFJLEVBQUU2RSxDQUFDLElBQUksQ0FBQyxFQUFFO1FBQ2hDZ0YsR0FBRyxDQUFDTCxPQUFPLENBQUM1RSxDQUFDLENBQUMsQ0FBQ0MsQ0FBQyxDQUFDLENBQUM7TUFDcEI7SUFDRjtFQUNGLENBQUM7O0VBRUQ7RUFDQTJFLE9BQU8sQ0FBQ1UsU0FBUyxHQUFJTCxHQUFHLElBQUs7SUFDM0IsTUFBTU0sR0FBRyxHQUFHLEVBQUU7SUFDZCxLQUFLLElBQUl2RixDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUc1RSxJQUFJLEVBQUU0RSxDQUFDLElBQUksQ0FBQyxFQUFFO01BQ2hDLEtBQUssSUFBSUMsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHN0UsSUFBSSxFQUFFNkUsQ0FBQyxJQUFJLENBQUMsRUFBRTtRQUNoQyxJQUFJZ0YsR0FBRyxDQUFDTCxPQUFPLENBQUM1RSxDQUFDLENBQUMsQ0FBQ0MsQ0FBQyxDQUFDLENBQUMsRUFBRTtVQUN0QnNGLEdBQUcsQ0FBQ25ILElBQUksQ0FBQztZQUFFbkQsR0FBRyxFQUFFK0UsQ0FBQztZQUFFOUUsTUFBTSxFQUFFK0U7VUFBRSxDQUFDLENBQUM7UUFDakM7TUFDRjtJQUNGO0lBQ0EsT0FBT3NGLEdBQUc7RUFDWixDQUFDO0VBRURYLE9BQU8sQ0FBQzNELFNBQVMsR0FBRyxDQUFDdUUsYUFBYSxFQUFFUCxHQUFHLEtBQUs7SUFDMUMsTUFBTTtNQUFFaEs7SUFBSSxDQUFDLEdBQUd1SyxhQUFhO0lBQzdCLE1BQU07TUFBRXRLO0lBQU8sQ0FBQyxHQUFHc0ssYUFBYTtJQUNoQyxJQUFJQyxZQUFZLEdBQUd2SyxNQUFNO0lBRXpCLEtBQUssSUFBSThFLENBQUMsR0FBRzlFLE1BQU0sRUFBRThFLENBQUMsR0FBRzVFLElBQUksRUFBRTRFLENBQUMsSUFBSSxDQUFDLEVBQUU7TUFDckMsSUFBSWlGLEdBQUcsQ0FBQ0wsT0FBTyxDQUFDM0osR0FBRyxDQUFDLENBQUMrRSxDQUFDLENBQUMsQ0FBQyxFQUFFO1FBQ3hCeUYsWUFBWSxHQUFHekYsQ0FBQztNQUNsQixDQUFDLE1BQU07UUFDTDtNQUNGO0lBQ0Y7SUFDQSxPQUFPO01BQUUvRSxHQUFHO01BQUVDLE1BQU0sRUFBRXVLO0lBQWEsQ0FBQztFQUN0QyxDQUFDO0VBRURiLE9BQU8sQ0FBQzFELFlBQVksR0FBRyxDQUFDc0UsYUFBYSxFQUFFUCxHQUFHLEtBQUs7SUFDN0MsTUFBTTtNQUFFaEs7SUFBSSxDQUFDLEdBQUd1SyxhQUFhO0lBQzdCLE1BQU07TUFBRXRLO0lBQU8sQ0FBQyxHQUFHc0ssYUFBYTtJQUNoQyxJQUFJRSxTQUFTLEdBQUd6SyxHQUFHO0lBRW5CLEtBQUssSUFBSStFLENBQUMsR0FBRy9FLEdBQUcsRUFBRStFLENBQUMsR0FBRzVFLElBQUksRUFBRTRFLENBQUMsSUFBSSxDQUFDLEVBQUU7TUFDbEMsSUFBSWlGLEdBQUcsQ0FBQ0wsT0FBTyxDQUFDNUUsQ0FBQyxDQUFDLENBQUM5RSxNQUFNLENBQUMsQ0FBQyxFQUFFO1FBQzNCd0ssU0FBUyxHQUFHMUYsQ0FBQztNQUNmLENBQUMsTUFBTTtRQUNMO01BQ0Y7SUFDRjtJQUNBLE9BQU87TUFBRS9FLEdBQUcsRUFBRXlLLFNBQVM7TUFBRXhLO0lBQU8sQ0FBQztFQUNuQyxDQUFDO0VBRUQsT0FBTzBKLE9BQU87QUFDaEIsQ0FBQztBQUVELCtEQUFlbk0sT0FBTzs7Ozs7Ozs7Ozs7QUNuS3RCLE1BQU0rQyxNQUFNLEdBQUcsQ0FBQyxNQUFNO0VBQ3BCLElBQUltSyxXQUFXLEdBQUcsQ0FBQyxDQUFDO0VBRXBCLFNBQVNoSyxPQUFPLENBQUNpSyxTQUFTLEVBQUVsRCxJQUFJLEVBQUU7SUFDaEMsSUFBSSxDQUFDcUMsS0FBSyxDQUFDYyxPQUFPLENBQUNGLFdBQVcsQ0FBQ0MsU0FBUyxDQUFDLENBQUMsRUFBRTtNQUMxQztJQUNGO0lBQ0FELFdBQVcsQ0FBQ0MsU0FBUyxDQUFDLENBQUNFLE9BQU8sQ0FBRXBMLFFBQVEsSUFBSztNQUMzQ0EsUUFBUSxDQUFDZ0ksSUFBSSxDQUFDO0lBQ2hCLENBQUMsQ0FBQztFQUNKO0VBRUEsU0FBU0QsU0FBUyxDQUFDbUQsU0FBUyxFQUFFbEwsUUFBUSxFQUFFO0lBQ3RDLElBQUksQ0FBQ3FLLEtBQUssQ0FBQ2MsT0FBTyxDQUFDRixXQUFXLENBQUNDLFNBQVMsQ0FBQyxDQUFDLEVBQUU7TUFDMUNELFdBQVcsQ0FBQ0MsU0FBUyxDQUFDLEdBQUcsRUFBRTtJQUM3QjtJQUNBRCxXQUFXLENBQUNDLFNBQVMsQ0FBQyxDQUFDeEgsSUFBSSxDQUFDMUQsUUFBUSxDQUFDO0VBQ3ZDO0VBRUEsU0FBU3FMLEtBQUssR0FBRztJQUNmSixXQUFXLEdBQUcsQ0FBQyxDQUFDO0VBQ2xCO0VBRUEsT0FBTztJQUNMaEssT0FBTztJQUNQOEcsU0FBUztJQUNUc0Q7RUFDRixDQUFDO0FBQ0gsQ0FBQyxHQUFHO0FBRUosK0RBQWV2SyxNQUFNOzs7Ozs7Ozs7OztBQzlCckIsU0FBU3dLLGNBQWMsR0FBVTtFQUFBLGtDQUFOQyxJQUFJO0lBQUpBLElBQUk7RUFBQTtFQUM3QixLQUFLLElBQUlqRyxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUdpRyxJQUFJLENBQUMvTCxNQUFNLEVBQUU4RixDQUFDLElBQUksQ0FBQyxFQUFFO0lBQ3ZDLE9BQU9pRyxJQUFJLENBQUNqRyxDQUFDLENBQUMsQ0FBQ2tHLFVBQVUsRUFBRTtNQUN6QkQsSUFBSSxDQUFDakcsQ0FBQyxDQUFDLENBQUNtRyxXQUFXLENBQUNGLElBQUksQ0FBQ2pHLENBQUMsQ0FBQyxDQUFDb0csU0FBUyxDQUFDO0lBQ3hDO0VBQ0Y7QUFDRjtBQUNBLCtEQUFlSixjQUFjOzs7Ozs7Ozs7OztBQ1A3QixNQUFNMUksVUFBVSxHQUFHLENBQUMsTUFBTTtFQUN4QjtFQUNBO0VBQ0E7RUFDQSxTQUFTaUUsaUJBQWlCLENBQUNySCxNQUFNLEVBQUVjLEtBQUssRUFBRXVFLEdBQUcsRUFBRTtJQUM3QyxNQUFNYyxNQUFNLEdBQUcsRUFBRTtJQUNqQixJQUFJO01BQUVwRjtJQUFJLENBQUMsR0FBR0QsS0FBSztJQUNuQixJQUFJO01BQUVFO0lBQU8sQ0FBQyxHQUFHRixLQUFLO0lBQ3RCLEtBQUssSUFBSWdGLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBRzlGLE1BQU0sRUFBRThGLENBQUMsSUFBSSxDQUFDLEVBQUU7TUFDbENLLE1BQU0sQ0FBQ2pDLElBQUksQ0FBQyxDQUFDbkQsR0FBRyxFQUFFQyxNQUFNLENBQUMsQ0FBQztNQUMxQixJQUFJcUUsR0FBRyxLQUFLLFlBQVksRUFBRTtRQUN4QnJFLE1BQU0sSUFBSSxDQUFDO01BQ2IsQ0FBQyxNQUFNO1FBQ0xELEdBQUcsSUFBSSxDQUFDO01BQ1Y7SUFDRjtJQUNBLE9BQU9vRixNQUFNO0VBQ2Y7RUFFQSxTQUFTMkIsU0FBUyxDQUFDOUgsTUFBTSxFQUFFYyxLQUFLLEVBQUV1RSxHQUFHLEVBQUU7SUFDckMsTUFBTWMsTUFBTSxHQUFHLEVBQUU7SUFDakIsSUFBSTtNQUFFcEY7SUFBSSxDQUFDLEdBQUdELEtBQUs7SUFDbkIsSUFBSTtNQUFFRTtJQUFPLENBQUMsR0FBR0YsS0FBSztJQUN0QixLQUFLLElBQUlnRixDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUc5RixNQUFNLEVBQUU4RixDQUFDLElBQUksQ0FBQyxFQUFFO01BQ2xDSyxNQUFNLENBQUNqQyxJQUFJLENBQUM7UUFBRW5ELEdBQUc7UUFBRUM7TUFBTyxDQUFDLENBQUM7TUFDNUIsSUFBSXFFLEdBQUcsS0FBSyxZQUFZLEVBQUU7UUFDeEJyRSxNQUFNLElBQUksQ0FBQztNQUNiLENBQUMsTUFBTTtRQUNMRCxHQUFHLElBQUksQ0FBQztNQUNWO0lBQ0Y7SUFDQSxPQUFPb0YsTUFBTTtFQUNmOztFQUVBO0VBQ0E7RUFDQTtFQUNBLFNBQVNnRyxxQkFBcUIsQ0FBQ0MsUUFBUSxFQUFFO0lBQ3ZDLE1BQU1yTCxHQUFHLEdBQUdxTCxRQUFRLENBQUMsQ0FBQyxDQUFDO0lBQ3ZCLE1BQU1wTCxNQUFNLEdBQUdvTCxRQUFRLENBQUMsQ0FBQyxDQUFDO0lBQzFCLE9BQVEsMEJBQXlCckwsR0FBSSwrQkFBOEJDLE1BQU8sSUFBRztFQUMvRTs7RUFFQTtFQUNBO0VBQ0EsU0FBU3FMLGVBQWUsQ0FBQ0MsU0FBUyxFQUFFO0lBQ2xDLElBQUlDLFFBQVEsR0FBR0oscUJBQXFCLENBQUNHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNsRCxNQUFNO01BQUV0TTtJQUFPLENBQUMsR0FBR3NNLFNBQVM7SUFDNUIsS0FBSyxJQUFJeEcsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHOUYsTUFBTSxFQUFFOEYsQ0FBQyxJQUFJLENBQUMsRUFBRTtNQUNsQ3lHLFFBQVEsR0FBSSxHQUFFQSxRQUFTLElBQUdKLHFCQUFxQixDQUFDRyxTQUFTLENBQUN4RyxDQUFDLENBQUMsQ0FBRSxFQUFDO0lBQ2pFO0lBQ0EsT0FBT3lHLFFBQVE7RUFDakI7RUFFQSxPQUFPO0lBQ0xsRixpQkFBaUI7SUFDakI4RSxxQkFBcUI7SUFDckJFLGVBQWU7SUFDZnZFO0VBQ0YsQ0FBQztBQUNILENBQUMsR0FBRztBQUVKLCtEQUFlMUUsVUFBVTs7Ozs7Ozs7Ozs7QUM5RHpCO0FBQ0E7QUFDQTtBQUNBLFNBQVNvSixtQkFBbUIsQ0FBQ0MsT0FBTyxFQUFFO0VBQ3BDLE1BQU0xTCxHQUFHLEdBQUcyTCxNQUFNLENBQUNELE9BQU8sQ0FBQ0UsWUFBWSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0VBQ3BELE1BQU0zTCxNQUFNLEdBQUcwTCxNQUFNLENBQUNELE9BQU8sQ0FBQ0UsWUFBWSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0VBQzFELE9BQU87SUFBRTVMLEdBQUc7SUFBRUM7RUFBTyxDQUFDO0FBQ3hCO0FBRUEsK0RBQWV3TCxtQkFBbUI7Ozs7Ozs7Ozs7Ozs7OztBQ1RPO0FBQ2U7QUFDVjtBQUNKOztBQUUxQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBU0ksaUJBQWlCLEdBQUc7RUFDM0IsTUFBTUMsZUFBZSxHQUFHLElBQUlDLGVBQWUsRUFBRTtFQUM3QyxNQUFNQyxlQUFlLEdBQUcsSUFBSUQsZUFBZSxFQUFFO0VBQzdDLE1BQU1FLE1BQU0sR0FBR0MsUUFBUSxDQUFDQyxhQUFhLENBQUMsZ0JBQWdCLENBQUM7RUFDdkQsSUFBSUMsYUFBYTtFQUNqQixJQUFJQyxvQkFBb0I7RUFDeEIsTUFBTUMsWUFBWSxHQUFHLENBQ25CLFNBQVMsRUFDVCxZQUFZLEVBQ1osV0FBVyxFQUNYLFdBQVcsRUFDWCxZQUFZLENBQ2I7RUFDRCxJQUFJQyxvQkFBb0IsR0FBRyxDQUFDO0VBQzVCLE1BQU1DLGtCQUFrQixHQUFHTixRQUFRLENBQUNPLGdCQUFnQixDQUFDLHFCQUFxQixDQUFDO0VBQzNFLE1BQU1DLFlBQVksR0FBRyxDQUFDLFlBQVksRUFBRSxVQUFVLENBQUM7RUFDL0MsSUFBSUMsa0JBQWtCLEdBQUcsQ0FBQztFQUMxQixJQUFJQyxjQUFjLEdBQUcsS0FBSztFQUUxQixTQUFTQywyQkFBMkIsR0FBRztJQUNyQyxJQUFJTixvQkFBb0IsR0FBR0QsWUFBWSxDQUFDck4sTUFBTSxFQUFFO01BQzlDLE1BQU1ZLE9BQU8sR0FBSSxjQUFheU0sWUFBWSxDQUFDQyxvQkFBb0IsQ0FBRSxFQUFDO01BQ2xFaE0saUVBQWMsQ0FBQyxpQkFBaUIsRUFBRTtRQUFFVixPQUFPO1FBQUVjLFFBQVEsRUFBRTtNQUFNLENBQUMsQ0FBQztJQUNqRTtFQUNGO0VBRUEsU0FBU21NLGtDQUFrQyxDQUFDQyxRQUFRLEVBQUU7SUFDcEQsSUFBSWxOLE9BQU87SUFDWCxJQUFJa04sUUFBUSxLQUFLLElBQUksRUFBRTtNQUNyQmxOLE9BQU8sR0FBSSxHQUFFeU0sWUFBWSxDQUFDQyxvQkFBb0IsQ0FBRSxxQkFBb0I7SUFDdEUsQ0FBQyxNQUFNO01BQ0wxTSxPQUFPLEdBQUksR0FBRXlNLFlBQVksQ0FBQ0Msb0JBQW9CLENBQUUsb0JBQW1CO0lBQ3JFO0lBQ0FoTSxpRUFBYyxDQUFDLGlCQUFpQixFQUFFO01BQUVWLE9BQU87TUFBRWMsUUFBUSxFQUFFO0lBQUssQ0FBQyxDQUFDO0VBQ2hFO0VBRUEsU0FBU3FNLHlCQUF5QixHQUFHO0lBQ25DLE1BQU1DLEdBQUcsR0FBR2YsUUFBUSxDQUFDZ0IsY0FBYyxDQUFDLGlCQUFpQixDQUFDO0lBQ3RELE1BQU07TUFBRUM7SUFBTyxDQUFDLEdBQUdyQixlQUFlO0lBQ2xDbUIsR0FBRyxDQUFDRyxnQkFBZ0IsQ0FDbEIsT0FBTyxFQUNOeE4sQ0FBQyxJQUFLO01BQ0wrTSxrQkFBa0IsR0FBR0Esa0JBQWtCLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDO01BQ3JEL00sQ0FBQyxDQUFDeU4sTUFBTSxDQUFDQyxTQUFTLEdBQUdaLFlBQVksQ0FBQ0Msa0JBQWtCLENBQUM7SUFDdkQsQ0FBQyxFQUNEO01BQUVRO0lBQU8sQ0FBQyxDQUNYO0VBQ0g7O0VBRUE7RUFDQTtFQUNBLFNBQVNJLDhCQUE4QixHQUFHO0lBQ3hDLE1BQU1DLFFBQVEsR0FBR3RCLFFBQVEsQ0FBQ08sZ0JBQWdCLENBQ3hDLHFDQUFxQyxDQUN0QztJQUNELEtBQUssSUFBSTFILENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBR3lJLFFBQVEsQ0FBQ3ZPLE1BQU0sRUFBRThGLENBQUMsSUFBSSxDQUFDLEVBQUU7TUFDM0N5SSxRQUFRLENBQUN6SSxDQUFDLENBQUMsQ0FBQzBJLFNBQVMsQ0FBQzlMLE1BQU0sQ0FBQyxtQkFBbUIsRUFBRSxpQkFBaUIsQ0FBQztJQUN0RTtFQUNGOztFQUVBO0VBQ0E7RUFDQSxTQUFTK0wsY0FBYyxDQUFDOU4sQ0FBQyxFQUFFO0lBQ3pCMk4sOEJBQThCLEVBQUU7SUFDaENuQixhQUFhLEdBQUd4TSxDQUFDLENBQUMrTixhQUFhO0lBQy9CLE1BQU01TyxVQUFVLEdBQUcwTSxnRUFBbUIsQ0FBQ1csYUFBYSxDQUFDO0lBQ3JELE1BQU1qTyxJQUFJLEdBQUdtTyxZQUFZLENBQUNDLG9CQUFvQixDQUFDO0lBQy9DLE1BQU12TixXQUFXLEdBQUcwTixZQUFZLENBQUNDLGtCQUFrQixDQUFDO0lBQ3BETixvQkFBb0IsR0FBRztNQUFFbE8sSUFBSTtNQUFFWSxVQUFVO01BQUVDO0lBQVksQ0FBQztJQUN4RHVCLGlFQUFjLENBQUMsa0JBQWtCLEVBQUU4TCxvQkFBb0IsQ0FBQztFQUMxRDtFQUVBLFNBQVN1QixpQkFBaUIsQ0FBQ2pHLFNBQVMsRUFBRWtHLE9BQU8sRUFBRTtJQUM3QyxNQUFNNU8sTUFBTSxHQUFHMUIsdURBQVMsQ0FBQ29LLFNBQVMsQ0FBQ3hKLElBQUksQ0FBQztJQUN4QyxNQUFNO01BQUVhO0lBQVksQ0FBQyxHQUFHMkksU0FBUztJQUNqQyxNQUFNO01BQUU1STtJQUFXLENBQUMsR0FBRzRJLFNBQVM7SUFDaEMsTUFBTTRELFNBQVMsR0FBR2xKLDZFQUE0QixDQUM1Q3BELE1BQU0sRUFDTkYsVUFBVSxFQUNWQyxXQUFXLENBQ1o7SUFDRCxNQUFNd00sUUFBUSxHQUFHbkosMkVBQTBCLENBQUNrSixTQUFTLENBQUM7SUFDdEQsTUFBTXVDLFdBQVcsR0FBRzdCLE1BQU0sQ0FBQ1EsZ0JBQWdCLENBQUNqQixRQUFRLENBQUM7SUFDckQsS0FBSyxJQUFJekcsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHK0ksV0FBVyxDQUFDN08sTUFBTSxFQUFFOEYsQ0FBQyxJQUFJLENBQUMsRUFBRTtNQUM5QytJLFdBQVcsQ0FBQy9JLENBQUMsQ0FBQyxDQUFDMEksU0FBUyxDQUFDTSxHQUFHLENBQUNGLE9BQU8sQ0FBQztJQUN2QztFQUNGO0VBRUEsU0FBU0csYUFBYSxDQUFDdFAsTUFBTSxFQUFFO0lBQzdCLElBQUlBLE1BQU0sS0FBSyxRQUFRLEVBQUU7TUFDdkJrUCxpQkFBaUIsQ0FBQ3ZCLG9CQUFvQixFQUFFLFVBQVUsQ0FBQztJQUNyRCxDQUFDLE1BQU0sSUFBSTNOLE1BQU0sS0FBSyxPQUFPLEVBQUU7TUFDN0JrUCxpQkFBaUIsQ0FBQ3ZCLG9CQUFvQixFQUFFLGlCQUFpQixDQUFDO0lBQzVEO0VBQ0Y7RUFFQSxTQUFTNEIsZUFBZSxDQUFDbEIsUUFBUSxFQUFFO0lBQ2pDLE1BQU1FLEdBQUcsR0FBR2YsUUFBUSxDQUFDQyxhQUFhLENBQ2hDLDRDQUE0QyxDQUM3QztJQUNELElBQUlZLFFBQVEsRUFBRTtNQUNaO01BQ0FFLEdBQUcsQ0FBQ1EsU0FBUyxDQUFDOUwsTUFBTSxDQUFDLGNBQWMsQ0FBQztNQUNwQ21MLGtDQUFrQyxDQUFDLElBQUksQ0FBQztJQUMxQyxDQUFDLE1BQU07TUFDTDtNQUNBRyxHQUFHLENBQUNRLFNBQVMsQ0FBQ00sR0FBRyxDQUFDLGNBQWMsQ0FBQztNQUNqQ2pCLGtDQUFrQyxDQUFDLEtBQUssQ0FBQztJQUMzQztFQUNGOztFQUVBO0VBQ0E7RUFDQSxTQUFTb0Isa0JBQWtCLEdBQUc7SUFDNUIzTixtRUFBZ0IsQ0FBQyx5QkFBeUIsRUFBRzROLE1BQU0sSUFBSztNQUN0RCxJQUFJQSxNQUFNLEVBQUU7UUFDVkgsYUFBYSxDQUFDLE9BQU8sQ0FBQztRQUN0QnBCLGNBQWMsR0FBRyxJQUFJO1FBQ3JCcUIsZUFBZSxDQUFDLElBQUksQ0FBQztNQUN2QixDQUFDLE1BQU07UUFDTHJCLGNBQWMsR0FBRyxLQUFLO1FBQ3RCUixhQUFhLENBQUNxQixTQUFTLENBQUNNLEdBQUcsQ0FBQyxtQkFBbUIsQ0FBQztRQUNoREUsZUFBZSxDQUFDLEtBQUssQ0FBQztNQUN4QjtJQUNGLENBQUMsQ0FBQztFQUNKO0VBRUEsU0FBU0csVUFBVSxHQUFHO0lBQ3BCLE1BQU0xQyxPQUFPLEdBQUdRLFFBQVEsQ0FBQ2dCLGNBQWMsQ0FBQyxvQkFBb0IsQ0FBQztJQUM3RHhCLE9BQU8sQ0FBQytCLFNBQVMsQ0FBQzlMLE1BQU0sQ0FBQyxrQkFBa0IsRUFBRSxjQUFjLENBQUM7SUFDNUQwTSwyQkFBMkIsRUFBRTtFQUMvQjtFQUVBLFNBQVNDLFdBQVcsR0FBRztJQUNyQixNQUFNNUMsT0FBTyxHQUFHUSxRQUFRLENBQUNnQixjQUFjLENBQUMsb0JBQW9CLENBQUM7SUFDN0R4QixPQUFPLENBQUMrQixTQUFTLENBQUNNLEdBQUcsQ0FBQyxjQUFjLENBQUM7SUFDckMvTSxVQUFVLENBQUMsTUFBTTBLLE9BQU8sQ0FBQytCLFNBQVMsQ0FBQ00sR0FBRyxDQUFDLGtCQUFrQixDQUFDLEVBQUUsSUFBSSxDQUFDO0VBQ25FOztFQUVBO0VBQ0E7RUFDQTtFQUNBO0VBQ0EsU0FBU00sMkJBQTJCLEdBQUc7SUFDckMsTUFBTTtNQUFFbEI7SUFBTyxDQUFDLEdBQUduQixlQUFlO0lBQ2xDLElBQUlPLG9CQUFvQixHQUFHQyxrQkFBa0IsQ0FBQ3ZOLE1BQU0sRUFBRTtNQUNwRDtNQUNBLEtBQUssSUFBSThGLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBR3lILGtCQUFrQixDQUFDdk4sTUFBTSxFQUFFOEYsQ0FBQyxJQUFJLENBQUMsRUFBRTtRQUNyRHlILGtCQUFrQixDQUFDekgsQ0FBQyxDQUFDLENBQUMwSSxTQUFTLENBQUNNLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQztRQUN2RHZCLGtCQUFrQixDQUFDekgsQ0FBQyxDQUFDLENBQUMwSSxTQUFTLENBQUM5TCxNQUFNLENBQUMsc0JBQXNCLENBQUM7TUFDaEU7TUFDQTtNQUNBNkssa0JBQWtCLENBQUNELG9CQUFvQixDQUFDLENBQUNrQixTQUFTLENBQUM5TCxNQUFNLENBQ3ZELGtCQUFrQixDQUNuQjtNQUNEO01BQ0E2SyxrQkFBa0IsQ0FBQ0Qsb0JBQW9CLENBQUMsQ0FBQ2EsZ0JBQWdCLENBQ3ZELE9BQU8sRUFDUCxNQUFNO1FBQ0osSUFBSVIsY0FBYyxFQUFFO1VBQ2xCQSxjQUFjLEdBQUcsS0FBSztVQUN0QnJNLGlFQUFjLENBQ1gsU0FBUStMLFlBQVksQ0FBQ0Msb0JBQW9CLENBQUUsRUFBQyxFQUM3Q0Ysb0JBQW9CLENBQ3JCO1VBQ0RFLG9CQUFvQixJQUFJLENBQUM7VUFDekJ5QixhQUFhLENBQUMsUUFBUSxDQUFDO1VBQ3ZCSywyQkFBMkIsRUFBRTtVQUM3QnhCLDJCQUEyQixFQUFFO1FBQy9CO01BQ0YsQ0FBQyxFQUNEO1FBQUVNO01BQU8sQ0FBQyxDQUNYO0lBQ0gsQ0FBQyxNQUFNO01BQ0xtQixXQUFXLEVBQUU7SUFDZjtFQUNGOztFQUVBO0VBQ0EsU0FBU0MsT0FBTyxHQUFHO0lBQ2pCekMsZUFBZSxDQUFDMEMsS0FBSyxFQUFFO0lBQ3ZCeEMsZUFBZSxDQUFDd0MsS0FBSyxFQUFFO0VBQ3pCOztFQUVBO0VBQ0E7RUFDQTtFQUNBLFNBQVNDLElBQUksR0FBRztJQUNkTCxVQUFVLEVBQUU7SUFDWkYsa0JBQWtCLEVBQUU7SUFDcEJsQix5QkFBeUIsRUFBRTtJQUMzQkgsMkJBQTJCLEVBQUU7RUFDL0I7O0VBRUE7RUFDQSxTQUFTNkIsS0FBSyxHQUFHO0lBQ2YsT0FBTztNQUFFMUUsR0FBRyxFQUFFMEQsY0FBYztNQUFFUCxNQUFNLEVBQUVyQixlQUFlLENBQUNxQjtJQUFPLENBQUM7RUFDaEU7RUFFQSxPQUFPO0lBQ0xzQixJQUFJO0lBQ0pDLEtBQUs7SUFDTEg7RUFDRixDQUFDO0FBQ0g7QUFFQSwrREFBZTFDLGlCQUFpQjs7Ozs7Ozs7Ozs7OztBQ3hOUztBQUNlO0FBRXhELFNBQVM4QyxZQUFZLENBQUMvTyxDQUFDLEVBQUU7RUFDdkIsTUFBTXlOLE1BQU0sR0FBR3pOLENBQUMsQ0FBQytOLGFBQWE7RUFDOUIsTUFBTTVOLEtBQUssR0FBRzBMLGdFQUFtQixDQUFDNEIsTUFBTSxDQUFDO0VBQ3pDOU0saUVBQWMsQ0FBQyxlQUFlLEVBQUVSLEtBQUssQ0FBQztBQUN4QztBQUVBLFNBQVM2TyxZQUFZLEdBQUc7RUFDdEIsTUFBTUMsV0FBVyxHQUFHM0MsUUFBUSxDQUFDQyxhQUFhLENBQUMsZUFBZSxDQUFDO0VBQzNELE1BQU0yQyxPQUFPLEdBQUdELFdBQVcsQ0FBQ3BDLGdCQUFnQixDQUFDLGNBQWMsQ0FBQztFQUM1RCxLQUFLLElBQUkxSCxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUcrSixPQUFPLENBQUM3UCxNQUFNLEVBQUU4RixDQUFDLElBQUksQ0FBQyxFQUFFO0lBQzFDK0osT0FBTyxDQUFDL0osQ0FBQyxDQUFDLENBQUNxSSxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUd4TixDQUFDLElBQUs7TUFDMUMrTyxZQUFZLENBQUMvTyxDQUFDLENBQUM7SUFDakIsQ0FBQyxDQUFDO0VBQ0o7RUFFQSxPQUFPLENBQUMsQ0FBQztBQUNYO0FBRUEsK0RBQWVnUCxZQUFZOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ3JCYztBQUNnQjtBQUNiO0FBQ1E7QUFDTjtBQUNBO0FBQ0o7QUFDWDtBQUNKOztBQUUzQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxNQUFNRyxJQUFJLEdBQUcsQ0FBQyxNQUFNO0VBQ2xCLE1BQU05QyxNQUFNLEdBQUcsQ0FDYkMsUUFBUSxDQUFDQyxhQUFhLENBQUMsZ0JBQWdCLENBQUMsRUFDeENELFFBQVEsQ0FBQ0MsYUFBYSxDQUFDLGVBQWUsQ0FBQyxDQUN4QztFQUNELE1BQU02QyxVQUFVLEdBQUc5QyxRQUFRLENBQUNnQixjQUFjLENBQUMsYUFBYSxDQUFDO0VBQ3pELE1BQU0rQixVQUFVLEdBQUcvQyxRQUFRLENBQUNnQixjQUFjLENBQUMsYUFBYSxDQUFDO0VBQ3pELE1BQU1nQyxRQUFRLEdBQUdoRCxRQUFRLENBQUNnQixjQUFjLENBQUMsV0FBVyxDQUFDO0VBRXJELFNBQVNpQyxRQUFRLENBQUNDLFVBQVUsRUFBRWpQLElBQUksRUFBRWtQLEdBQUcsRUFBRTtJQUN2QyxLQUFLLElBQUl0SyxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUc1RSxJQUFJLEVBQUU0RSxDQUFDLElBQUksQ0FBQyxFQUFFO01BQ2hDLE1BQU0vRSxHQUFHLEdBQUdrTSxRQUFRLENBQUNvRCxhQUFhLENBQUMsS0FBSyxDQUFDO01BQ3pDdFAsR0FBRyxDQUFDeU4sU0FBUyxDQUFDTSxHQUFHLENBQUMsVUFBVSxDQUFDO01BQzdCLEtBQUssSUFBSS9JLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBRzdFLElBQUksRUFBRTZFLENBQUMsSUFBSSxDQUFDLEVBQUU7UUFDaEMsTUFBTTVGLE1BQU0sR0FBRzhNLFFBQVEsQ0FBQ29ELGFBQWEsQ0FBQyxLQUFLLENBQUM7UUFDNUNsUSxNQUFNLENBQUNxTyxTQUFTLENBQUNNLEdBQUcsQ0FBQyxhQUFhLENBQUM7UUFDbkMzTyxNQUFNLENBQUNtUSxZQUFZLENBQUMsVUFBVSxFQUFFeEssQ0FBQyxDQUFDO1FBQ2xDM0YsTUFBTSxDQUFDbVEsWUFBWSxDQUFDLGFBQWEsRUFBRXZLLENBQUMsQ0FBQztRQUNyQyxJQUFJcUssR0FBRyxFQUFFO1VBQ1BqUSxNQUFNLENBQUNnTyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUd4TixDQUFDLElBQUt5UCxHQUFHLENBQUNyRixHQUFHLENBQUNwSyxDQUFDLENBQUMsRUFBRTtZQUNsRHVOLE1BQU0sRUFBRWtDLEdBQUcsQ0FBQ2xDO1VBQ2QsQ0FBQyxDQUFDO1FBQ0o7UUFDQW5OLEdBQUcsQ0FBQ3dQLFdBQVcsQ0FBQ3BRLE1BQU0sQ0FBQztNQUN6QjtNQUNBZ1EsVUFBVSxDQUFDSSxXQUFXLENBQUN4UCxHQUFHLENBQUM7SUFDN0I7RUFDRjtFQUVBLFNBQVN5UCxhQUFhLENBQUMvRCxPQUFPLEVBQUU7SUFDOUIsSUFBSTtNQUNGQSxPQUFPLENBQUNSLFdBQVcsQ0FBQ1EsT0FBTyxDQUFDVCxVQUFVLENBQUM7SUFDekMsQ0FBQyxDQUFDLE1BQU07TUFDTjtJQUNGO0VBQ0Y7RUFFQSxTQUFTeUUsY0FBYyxDQUFDN1AsT0FBTyxFQUFFOFAsZ0JBQWdCLEVBQUU7SUFDakQsTUFBTUMsUUFBUSxHQUFHMUQsUUFBUSxDQUFDMkQsY0FBYyxDQUFDaFEsT0FBTyxDQUFDO0lBQ2pELElBQUlBLE9BQU8sS0FBSyxFQUFFLEVBQUU7TUFDbEI0UCxhQUFhLENBQUNULFVBQVUsQ0FBQztNQUN6QlMsYUFBYSxDQUFDUixVQUFVLENBQUM7SUFDM0IsQ0FBQyxNQUFNLElBQUlVLGdCQUFnQixFQUFFO01BQzNCRixhQUFhLENBQUNSLFVBQVUsQ0FBQztNQUN6QkEsVUFBVSxDQUFDeEIsU0FBUyxDQUFDOUwsTUFBTSxDQUFDLGNBQWMsQ0FBQztNQUMzQ3NOLFVBQVUsQ0FBQ08sV0FBVyxDQUFDSSxRQUFRLENBQUM7TUFDaEM1TyxVQUFVLENBQUMsTUFBTTtRQUNmLElBQUlpTyxVQUFVLENBQUNoRSxVQUFVLEtBQUsyRSxRQUFRLEVBQUU7VUFDdENYLFVBQVUsQ0FBQ3hCLFNBQVMsQ0FBQ00sR0FBRyxDQUFDLGNBQWMsQ0FBQztVQUN4Qy9NLFVBQVUsQ0FBQyxNQUFNO1lBQ2YsSUFBSTtjQUNGaU8sVUFBVSxDQUFDL0QsV0FBVyxDQUFDMEUsUUFBUSxDQUFDO1lBQ2xDLENBQUMsQ0FBQyxNQUFNO2NBQ047WUFDRjtZQUNBWCxVQUFVLENBQUN4QixTQUFTLENBQUM5TCxNQUFNLENBQUMsY0FBYyxDQUFDO1VBQzdDLENBQUMsRUFBRSxHQUFHLENBQUM7UUFDVDtNQUNGLENBQUMsRUFBRWdPLGdCQUFnQixDQUFDO0lBQ3RCLENBQUMsTUFBTTtNQUNMRixhQUFhLENBQUNULFVBQVUsQ0FBQztNQUN6QkEsVUFBVSxDQUFDUSxXQUFXLENBQUNJLFFBQVEsQ0FBQztJQUNsQztFQUNGOztFQUVBO0VBQ0E7RUFDQSxTQUFTRSxLQUFLLENBQUNDLFNBQVMsRUFBRTtJQUN4QixJQUFJQSxTQUFTLEtBQUssSUFBSSxFQUFFO01BQ3RCOUQsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDd0IsU0FBUyxDQUFDTSxHQUFHLENBQUMsYUFBYSxDQUFDO01BQ3RDOUIsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDd0IsU0FBUyxDQUFDTSxHQUFHLENBQUMsYUFBYSxDQUFDO0lBQ3hDLENBQUMsTUFBTTtNQUNMOUIsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDd0IsU0FBUyxDQUFDOUwsTUFBTSxDQUFDLGFBQWEsQ0FBQztNQUN6Q3NLLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQ3dCLFNBQVMsQ0FBQzlMLE1BQU0sQ0FBQyxhQUFhLENBQUM7SUFDM0M7RUFDRjtFQUVBLFNBQVNxTyxlQUFlLENBQUNDLE1BQU0sRUFBRTdSLFNBQVMsRUFBRUQsSUFBSSxFQUFFO0lBQ2hELE1BQU0wQixPQUFPLEdBQUksR0FBRW9RLE1BQU8sYUFBWTlSLElBQUssZ0JBQWU7SUFDMUQsTUFBTTtNQUFFYztJQUFPLENBQUMsR0FBR2IsU0FBUztJQUM1QixNQUFNO01BQUVXO0lBQVcsQ0FBQyxHQUFHWCxTQUFTO0lBQ2hDLE1BQU07TUFBRVk7SUFBWSxDQUFDLEdBQUdaLFNBQVM7SUFDakMsTUFBTW1OLFNBQVMsR0FBR2xKLDZFQUE0QixDQUM1Q3BELE1BQU0sRUFDTkYsVUFBVSxFQUNWQyxXQUFXLENBQ1o7SUFDRCxNQUFNd00sUUFBUSxHQUFHbkosMkVBQTBCLENBQUNrSixTQUFTLENBQUM7SUFDdEQsTUFBTTFNLEtBQUssR0FBR29SLE1BQU0sS0FBSyxPQUFPLEdBQUdoRSxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUdBLE1BQU0sQ0FBQyxDQUFDLENBQUM7SUFDeEQsTUFBTXVCLFFBQVEsR0FBRzNPLEtBQUssQ0FBQzROLGdCQUFnQixDQUFDakIsUUFBUSxDQUFDO0lBQ2pELEtBQUssSUFBSXpHLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBR3lJLFFBQVEsQ0FBQ3ZPLE1BQU0sRUFBRThGLENBQUMsSUFBSSxDQUFDLEVBQUU7TUFDM0N5SSxRQUFRLENBQUN6SSxDQUFDLENBQUMsQ0FBQzBJLFNBQVMsQ0FBQ00sR0FBRyxDQUFDLFVBQVUsQ0FBQztJQUN2QztJQUNBMkIsY0FBYyxDQUFDN1AsT0FBTyxFQUFFLElBQUksQ0FBQztFQUMvQjs7RUFFQTtFQUNBO0VBQ0E7RUFDQSxTQUFTcVEscUJBQXFCLENBQUNuUSxLQUFLLEVBQUU7SUFDcEMsTUFBTTtNQUFFQztJQUFJLENBQUMsR0FBR0QsS0FBSztJQUNyQixNQUFNO01BQUVFO0lBQU8sQ0FBQyxHQUFHRixLQUFLO0lBQ3hCLE9BQVEsMEJBQXlCQyxHQUFJLCtCQUE4QkMsTUFBTyxJQUFHO0VBQy9FOztFQUVBO0VBQ0E7RUFDQTtFQUNBO0VBQ0EsU0FBU2tRLFlBQVksQ0FBQzFQLE1BQU0sRUFBRTtJQUM1QixNQUFNNUIsS0FBSyxHQUFHNEIsTUFBTSxLQUFLLE9BQU8sR0FBR3dMLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBR0EsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUN4RCxPQUFPLFNBQVNtRSxtQkFBbUIsQ0FBQ0MsT0FBTyxFQUFFO01BQzNDLE1BQU03RSxRQUFRLEdBQUcwRSxxQkFBcUIsQ0FBQ0csT0FBTyxDQUFDdFEsS0FBSyxDQUFDO01BQ3JELE1BQU11USxVQUFVLEdBQUd6UixLQUFLLENBQUNzTixhQUFhLENBQUNYLFFBQVEsQ0FBQztNQUNoRCxNQUFNK0UsUUFBUSxHQUFHRixPQUFPLENBQUNwUyxHQUFHLEtBQUssSUFBSSxHQUFHLEtBQUssR0FBRyxNQUFNO01BQ3RELElBQUlvUyxPQUFPLENBQUNuUyxJQUFJLEVBQUU7UUFDaEIsTUFBTStSLE1BQU0sR0FBR3hQLE1BQU0sS0FBSyxPQUFPLEdBQUcsVUFBVSxHQUFHLE9BQU87UUFDeER1UCxlQUFlLENBQUNDLE1BQU0sRUFBRUksT0FBTyxDQUFDalMsU0FBUyxFQUFFaVMsT0FBTyxDQUFDbFMsSUFBSSxDQUFDO01BQzFEO01BQ0FtUyxVQUFVLENBQUM3QyxTQUFTLENBQUNNLEdBQUcsQ0FBQ3dDLFFBQVEsQ0FBQztJQUNwQyxDQUFDO0VBQ0g7O0VBRUE7RUFDQTtFQUNBO0VBQ0EsU0FBU0MsWUFBWSxDQUFDaFAsTUFBTSxFQUFFO0lBQzVCLElBQUkzQixPQUFPO0lBQ1gsSUFBSTJCLE1BQU0sS0FBSyxPQUFPLEVBQUU7TUFDdEIzQixPQUFPLEdBQUksU0FBUTtJQUNyQixDQUFDLE1BQU07TUFDTEEsT0FBTyxHQUFJLFVBQVM7SUFDdEI7SUFDQTZQLGNBQWMsQ0FBQzdQLE9BQU8sQ0FBQztJQUN2QnFQLFFBQVEsQ0FBQ3pCLFNBQVMsQ0FBQzlMLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQztFQUMvQzs7RUFFQTtFQUNBO0VBQ0E7RUFDQSxTQUFTOE8sU0FBUyxHQUFHO0lBQ25CWCxLQUFLLENBQUMsS0FBSyxDQUFDO0lBQ1pKLGNBQWMsQ0FBQyxFQUFFLENBQUM7SUFDbEI7SUFDQTtJQUNBLE1BQU1nQixjQUFjLEdBQUc5Qiw2REFBWSxFQUFFO0lBQ3JDO0lBQ0E7SUFDQTtJQUNBO0lBQ0FyTyxtRUFBZ0IsQ0FBQyxxQkFBcUIsRUFBRTRQLFlBQVksQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUNqRTtJQUNBO0lBQ0E1UCxtRUFBZ0IsQ0FBQyxzQkFBc0IsRUFBRTRQLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUMvRDtJQUNBNVAsbUVBQWdCLENBQUMsVUFBVSxFQUFFaVEsWUFBWSxDQUFDO0VBQzVDOztFQUVBO0VBQ0E7RUFDQTtFQUNBLGVBQWVHLFNBQVMsR0FBRztJQUN6QjtJQUNBcFEsK0RBQVksRUFBRTtJQUNkO0lBQ0FVLDhEQUFRLEVBQUU7SUFDVjtJQUNBNk8sS0FBSyxDQUFDLElBQUksQ0FBQztJQUNYO0lBQ0FaLFFBQVEsQ0FBQ3pCLFNBQVMsQ0FBQ00sR0FBRyxDQUFDLGtCQUFrQixDQUFDO0lBQzFDO0lBQ0EyQixjQUFjLENBQUMsRUFBRSxDQUFDO0lBQ2xCO0lBQ0FuUCxtRUFBZ0IsQ0FBQyxpQkFBaUIsRUFBR2tILElBQUksSUFDdkNpSSxjQUFjLENBQUNqSSxJQUFJLENBQUM1SCxPQUFPLEVBQUU0SCxJQUFJLENBQUM5RyxRQUFRLENBQUMsQ0FDNUM7O0lBRUQ7SUFDQSxNQUFNaVEsVUFBVSxHQUFHL0UsOERBQWlCLEVBQUU7SUFDdEM7SUFDQTtJQUNBZCxxRUFBYyxDQUFDLEdBQUdrQixNQUFNLENBQUM7SUFDekI7SUFDQWtELFFBQVEsQ0FBQ2xELE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUyRSxVQUFVLENBQUNsQyxLQUFLLEVBQUUsQ0FBQztJQUMzQ1MsUUFBUSxDQUFDbEQsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQztJQUN2QjtJQUNBMkUsVUFBVSxDQUFDbkMsSUFBSSxFQUFFO0lBQ2pCO0lBQ0E7SUFDQSxNQUFNb0MsbUJBQW1CLEdBQUcsSUFBSS9QLE9BQU8sQ0FBRUMsT0FBTyxJQUFLO01BQ25EO01BQ0FSLG1FQUFnQixDQUFDLFlBQVksRUFBR2tILElBQUksSUFBSztRQUN2QzFHLE9BQU8sQ0FBQzBHLElBQUksQ0FBQztNQUNmLENBQUMsQ0FBQztJQUNKLENBQUMsQ0FBQztJQUNGLE1BQU1vSixtQkFBbUI7SUFDekJELFVBQVUsQ0FBQ3JDLE9BQU8sRUFBRTtJQUNwQmtDLFNBQVMsRUFBRTtFQUNiO0VBRUFFLFNBQVMsRUFBRTs7RUFFWDtFQUNBO0VBQ0EsU0FBU0csYUFBYSxHQUFHO0lBQ3ZCN0UsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDd0IsU0FBUyxDQUFDTSxHQUFHLENBQUMsd0JBQXdCLENBQUM7SUFDakQ5QixNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUN3QixTQUFTLENBQUNNLEdBQUcsQ0FBQyx3QkFBd0IsQ0FBQztFQUNuRDtFQUVBLFNBQVNnRCxZQUFZLEdBQUc7SUFDdEI3QixRQUFRLENBQUM5QixnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsTUFBTXVELFNBQVMsRUFBRSxDQUFDO0VBQ3ZEOztFQUVBO0VBQ0EsQ0FBQyxTQUFTbEMsSUFBSSxHQUFHO0lBQ2Z6TixVQUFVLENBQUM4UCxhQUFhLEVBQUUsSUFBSSxDQUFDO0lBQy9CQyxZQUFZLEVBQUU7RUFDaEIsQ0FBQyxHQUFHO0VBRUosT0FBTyxDQUFDLENBQUM7QUFDWCxDQUFDLEdBQUc7Ozs7Ozs7Ozs7Ozs7OztBQ3ZQSjtBQUNnSDtBQUNqQjtBQUMvRiw4QkFBOEIsbUZBQTJCLENBQUMsNEZBQXFDO0FBQy9GO0FBQ0EsK29CQUErb0IsY0FBYyxlQUFlLGNBQWMsb0JBQW9CLGtCQUFrQiw2QkFBNkIsR0FBRyxnSkFBZ0osbUJBQW1CLEdBQUcsUUFBUSxtQkFBbUIsR0FBRyxVQUFVLHFCQUFxQixHQUFHLE1BQU0sMEJBQTBCLEdBQUcsaUJBQWlCLGlCQUFpQixHQUFHLDJEQUEyRCxnQkFBZ0Isa0JBQWtCLEdBQUcsU0FBUyw4QkFBOEIsc0JBQXNCLEdBQUcsT0FBTyxpR0FBaUcsTUFBTSxpQkFBaUIsVUFBVSxVQUFVLFVBQVUsVUFBVSxVQUFVLFlBQVksTUFBTSxZQUFZLE9BQU8sVUFBVSxLQUFLLEtBQUssVUFBVSxLQUFLLEtBQUssWUFBWSxNQUFNLEtBQUssWUFBWSxNQUFNLEtBQUssVUFBVSxLQUFLLE1BQU0sVUFBVSxVQUFVLEtBQUssS0FBSyxZQUFZLGFBQWEsK25CQUErbkIsY0FBYyxlQUFlLGNBQWMsb0JBQW9CLGtCQUFrQiw2QkFBNkIsR0FBRyxnSkFBZ0osbUJBQW1CLEdBQUcsUUFBUSxtQkFBbUIsR0FBRyxVQUFVLHFCQUFxQixHQUFHLE1BQU0sMEJBQTBCLEdBQUcsaUJBQWlCLGlCQUFpQixHQUFHLDJEQUEyRCxnQkFBZ0Isa0JBQWtCLEdBQUcsU0FBUyw4QkFBOEIsc0JBQXNCLEdBQUcsbUJBQW1CO0FBQ3Z4RjtBQUNBLCtEQUFlLHVCQUF1QixFQUFDOzs7Ozs7Ozs7Ozs7Ozs7O0FDUHZDO0FBQ2dIO0FBQ2pCO0FBQy9GLDhCQUE4QixtRkFBMkIsQ0FBQyw0RkFBcUM7QUFDL0YseUlBQXlJO0FBQ3pJO0FBQ0EsaURBQWlELDRCQUE0Qix3QkFBd0IsNkJBQTZCLDBCQUEwQixtREFBbUQsdUVBQXVFLHNDQUFzQyx1Q0FBdUMsK0JBQStCLEdBQUcsVUFBVSxnQkFBZ0Isb0JBQW9CLEdBQUcsVUFBVSxvQ0FBb0MsZ0JBQWdCLEdBQUcsWUFBWSxpQ0FBaUMsdUJBQXVCLCtCQUErQix1Q0FBdUMsR0FBRyxtQkFBbUIsOENBQThDLGtCQUFrQiwyQkFBMkIsNEJBQTRCLEdBQUcsb0JBQW9CLHFCQUFxQixrQkFBa0IsMkJBQTJCLGNBQWMsR0FBRywwQkFBMEIsNkJBQTZCLDhCQUE4QixpQkFBaUIsa0JBQWtCLDJCQUEyQixhQUFhLEdBQUcsNkJBQTZCLHlDQUF5QyxHQUFHLGtCQUFrQiwwREFBMEQsR0FBRyxpQ0FBaUMsZ0RBQWdELEdBQUcsOEJBQThCLGlDQUFpQyxHQUFHLGVBQWUsZ0JBQWdCLGdCQUFnQixrQkFBa0IsYUFBYSxHQUFHLGtCQUFrQixpQkFBaUIsZUFBZSxrQkFBa0IsNEJBQTRCLHdCQUF3QixHQUFHLHVCQUF1Qiw2QkFBNkIsa0RBQWtELDJDQUEyQyxrQkFBa0IsMkJBQTJCLG1DQUFtQyxHQUFHLHFCQUFxQiw2QkFBNkIsMkNBQTJDLGtCQUFrQixhQUFhLGlEQUFpRCwyQkFBMkIsNEJBQTRCLHdCQUF3QixnQ0FBZ0MsR0FBRywyQkFBMkIsZ0RBQWdELEdBQUcsa0JBQWtCLG9DQUFvQyx1QkFBdUIsR0FBRyx5QkFBeUIsZ0JBQWdCLGtCQUFrQix3QkFBd0IsbUNBQW1DLGFBQWEscUNBQXFDLEdBQUcsbUJBQW1CLGVBQWUsR0FBRyxzQkFBc0IseUNBQXlDLDRDQUE0QyxtQ0FBbUMsa0JBQWtCLHdCQUF3Qiw0QkFBNEIsdUJBQXVCLGdDQUFnQyx1QkFBdUIsc0JBQXNCLDZCQUE2QixpREFBaUQsR0FBRyx5QkFBeUIseUNBQXlDLCtCQUErQix1QkFBdUIsa0JBQWtCLHdCQUF3Qiw0QkFBNEIsZ0NBQWdDLHVCQUF1QixzQkFBc0IsNkJBQTZCLGlEQUFpRCxHQUFHLG9CQUFvQix1Q0FBdUMsR0FBRyx1QkFBdUIsNENBQTRDLEdBQUcsc0JBQXNCLDRDQUE0QyxHQUFHLHNCQUFzQiw0Q0FBNEMsR0FBRyx1QkFBdUIsdUNBQXVDLEdBQUcsZ0JBQWdCLGlCQUFpQixvQkFBb0Isb0NBQW9DLGdCQUFnQixnREFBZ0Qsa0JBQWtCLHdCQUF3Qiw0QkFBNEIsMkJBQTJCLGlEQUFpRCxHQUFHLGlCQUFpQixrQkFBa0IsZ0JBQWdCLGlCQUFpQiwwQkFBMEIsMEJBQTBCLEdBQUcsa0JBQWtCLGtCQUFrQixnQkFBZ0IsaUJBQWlCLDBCQUEwQiw0QkFBNEIsNkNBQTZDLEdBQUcsMkRBQTJELDZCQUE2QixvQkFBb0IsR0FBRyxrQ0FBa0MsNEJBQTRCLEdBQUcsb0NBQW9DLDBCQUEwQixHQUFHLDJCQUEyQiw0QkFBNEIsR0FBRyxlQUFlLHFCQUFxQixHQUFHLDRGQUE0RixrQkFBa0IsR0FBRywyQkFBMkIsNEJBQTRCLEdBQUcsbUJBQW1CLGlCQUFpQixHQUFHLCtDQUErQyxXQUFXLHlCQUF5QiwrQkFBK0IsNEJBQTRCLDBEQUEwRCx5RUFBeUUsMkNBQTJDLGtDQUFrQyxLQUFLLEdBQUcsU0FBUywyRkFBMkYsWUFBWSxhQUFhLGFBQWEsYUFBYSxhQUFhLGFBQWEsYUFBYSxhQUFhLGFBQWEsT0FBTyxLQUFLLFVBQVUsVUFBVSxPQUFPLEtBQUssWUFBWSxXQUFXLE1BQU0sS0FBSyxZQUFZLGFBQWEsYUFBYSxhQUFhLE9BQU8sS0FBSyxZQUFZLFdBQVcsWUFBWSxhQUFhLE9BQU8sS0FBSyxZQUFZLFdBQVcsWUFBWSxXQUFXLE1BQU0sS0FBSyxZQUFZLGFBQWEsV0FBVyxVQUFVLFlBQVksV0FBVyxNQUFNLEtBQUssWUFBWSxPQUFPLEtBQUssWUFBWSxPQUFPLEtBQUssWUFBWSxNQUFNLEtBQUssWUFBWSxPQUFPLEtBQUssVUFBVSxVQUFVLFVBQVUsVUFBVSxNQUFNLEtBQUssVUFBVSxVQUFVLFVBQVUsWUFBWSxhQUFhLE9BQU8sS0FBSyxZQUFZLGFBQWEsYUFBYSxXQUFXLFlBQVksYUFBYSxPQUFPLEtBQUssWUFBWSxhQUFhLFdBQVcsVUFBVSxZQUFZLGFBQWEsYUFBYSxhQUFhLGFBQWEsT0FBTyxLQUFLLFlBQVksT0FBTyxLQUFLLFlBQVksYUFBYSxPQUFPLEtBQUssVUFBVSxVQUFVLFlBQVksYUFBYSxXQUFXLFlBQVksT0FBTyxLQUFLLFVBQVUsTUFBTSxLQUFLLFlBQVksYUFBYSxhQUFhLFdBQVcsWUFBWSxhQUFhLGFBQWEsYUFBYSxhQUFhLGNBQWMsYUFBYSxhQUFhLE9BQU8sS0FBSyxhQUFhLGFBQWEsYUFBYSxXQUFXLFlBQVksYUFBYSxhQUFhLGFBQWEsY0FBYyxhQUFhLGFBQWEsT0FBTyxLQUFLLFlBQVksT0FBTyxLQUFLLFlBQVksT0FBTyxLQUFLLFlBQVksT0FBTyxLQUFLLFlBQVksT0FBTyxLQUFLLFlBQVksT0FBTyxLQUFLLFVBQVUsVUFBVSxZQUFZLFdBQVcsWUFBWSxXQUFXLFlBQVksYUFBYSxhQUFhLGFBQWEsT0FBTyxLQUFLLFVBQVUsVUFBVSxVQUFVLFlBQVksYUFBYSxPQUFPLEtBQUssVUFBVSxVQUFVLFVBQVUsWUFBWSxhQUFhLGFBQWEsT0FBTyxLQUFLLFlBQVksV0FBVyxPQUFPLEtBQUssWUFBWSxPQUFPLEtBQUssWUFBWSxPQUFPLEtBQUssWUFBWSxPQUFPLEtBQUssWUFBWSxPQUFPLE9BQU8sVUFBVSxNQUFNLEtBQUssWUFBWSxP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QUVBOzs7Ozs7Ozs7O0FDVmE7O0FBRWI7QUFDQTtBQUNBLGNBQWMsS0FBd0MsR0FBRyxzQkFBaUIsR0FBRyxDQUFJOztBQUVqRjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7Ozs7Ozs7OztBQ1hhOztBQUViO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLGtEQUFrRDtBQUNsRDs7QUFFQTtBQUNBLDBDQUEwQztBQUMxQzs7QUFFQTs7QUFFQTtBQUNBLGlGQUFpRjtBQUNqRjs7QUFFQTs7QUFFQTtBQUNBLGFBQWE7QUFDYjs7QUFFQTtBQUNBLGFBQWE7QUFDYjs7QUFFQTtBQUNBLGFBQWE7QUFDYjs7QUFFQTs7QUFFQTtBQUNBLHlEQUF5RDtBQUN6RCxJQUFJOztBQUVKOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7Ozs7Ozs7Ozs7QUNyRWE7O0FBRWI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQSIsInNvdXJjZXMiOlsid2VicGFjazovL2JhdHRsZXNoaXAvLi9zcmMvZ2FtZWJvYXJkL2dhbWVib2FyZC5qcyIsIndlYnBhY2s6Ly9iYXR0bGVzaGlwLy4vc3JjL2dhbWVsb29wL2dhbWVsb29wLmpzIiwid2VicGFjazovL2JhdHRsZXNoaXAvLi9zcmMvcGxheWVyL21hbmFnZVNoaXBTZWFyY2guanMiLCJ3ZWJwYWNrOi8vYmF0dGxlc2hpcC8uL3NyYy9wbGF5ZXIvcGxheWVyLmpzIiwid2VicGFjazovL2JhdHRsZXNoaXAvLi9zcmMvcGxheWVyL3JhbmRvbS5qcyIsIndlYnBhY2s6Ly9iYXR0bGVzaGlwLy4vc3JjL3NoaXAvc2hpcC5qcyIsIndlYnBhY2s6Ly9iYXR0bGVzaGlwLy4vc3JjL3NoaXAvc2hpcHR5cGVzLmpzIiwid2VicGFjazovL2JhdHRsZXNoaXAvLi9zcmMvdXRpbGl0aWVzL215QXJyYXkuanMiLCJ3ZWJwYWNrOi8vYmF0dGxlc2hpcC8uL3NyYy91dGlsaXRpZXMvcHViU3ViLmpzIiwid2VicGFjazovL2JhdHRsZXNoaXAvLi9zcmMvdXRpbGl0aWVzL3JlbW92ZUNoaWxkcmVuLmpzIiwid2VicGFjazovL2JhdHRsZXNoaXAvLi9zcmMvdmlldy9jb29yZFNlbGVjdG9yVG9vbHMuanMiLCJ3ZWJwYWNrOi8vYmF0dGxlc2hpcC8uL3NyYy92aWV3L2dldENvb3JkRnJvbUVsZW1lbnQuanMiLCJ3ZWJwYWNrOi8vYmF0dGxlc2hpcC8uL3NyYy92aWV3L3NoaXBQbGFjZUNvbnRyb2xzLmpzIiwid2VicGFjazovL2JhdHRsZXNoaXAvLi9zcmMvdmlldy90YWtlVHVybkNvbnRyb2xzLmpzIiwid2VicGFjazovL2JhdHRsZXNoaXAvLi9zcmMvdmlldy92aWV3LmpzIiwid2VicGFjazovL2JhdHRsZXNoaXAvLi9zcmMvdmlldy9zdHlsZS9jc3MtcmVzZXQuY3NzIiwid2VicGFjazovL2JhdHRsZXNoaXAvLi9zcmMvdmlldy9zdHlsZS9pbmRleC5jc3MiLCJ3ZWJwYWNrOi8vYmF0dGxlc2hpcC8uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9hcGkuanMiLCJ3ZWJwYWNrOi8vYmF0dGxlc2hpcC8uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9zb3VyY2VNYXBzLmpzIiwid2VicGFjazovL2JhdHRsZXNoaXAvLi9zcmMvdmlldy9zdHlsZS9jc3MtcmVzZXQuY3NzPzI1ODQiLCJ3ZWJwYWNrOi8vYmF0dGxlc2hpcC8uL3NyYy92aWV3L3N0eWxlL2luZGV4LmNzcz80N2JkIiwid2VicGFjazovL2JhdHRsZXNoaXAvLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbmplY3RTdHlsZXNJbnRvU3R5bGVUYWcuanMiLCJ3ZWJwYWNrOi8vYmF0dGxlc2hpcC8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luc2VydEJ5U2VsZWN0b3IuanMiLCJ3ZWJwYWNrOi8vYmF0dGxlc2hpcC8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luc2VydFN0eWxlRWxlbWVudC5qcyIsIndlYnBhY2s6Ly9iYXR0bGVzaGlwLy4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc2V0QXR0cmlidXRlc1dpdGhvdXRBdHRyaWJ1dGVzLmpzIiwid2VicGFjazovL2JhdHRsZXNoaXAvLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zdHlsZURvbUFQSS5qcyIsIndlYnBhY2s6Ly9iYXR0bGVzaGlwLy4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc3R5bGVUYWdUcmFuc2Zvcm0uanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFNoaXAgZnJvbSBcIi4uL3NoaXAvc2hpcFwiO1xuaW1wb3J0IHNoaXBUeXBlcyBmcm9tIFwiLi4vc2hpcC9zaGlwdHlwZXNcIjtcbmltcG9ydCBteUFycmF5IGZyb20gXCIuLi91dGlsaXRpZXMvbXlBcnJheVwiO1xuXG5jb25zdCBHYW1lYm9hcmQgPSAoKSA9PiB7XG4gIC8vIFRvZG86IGNoYW5nZSBtZXRob2RzIHRvIGdldHRlcnMvc2V0dGVyc1xuICBjb25zdCBTcXVhcmUgPSAoKSA9PiB7XG4gICAgbGV0IGlzVmFjYW50ID0gdHJ1ZTtcbiAgICBsZXQgaW50YWN0ID0gdHJ1ZTtcbiAgICBsZXQgc2hpcFBvaW50ZXI7XG4gICAgbGV0IHNoaXBMb2NhdGlvbnM7IC8vIHsgbGVuZ3RoLCBjb29yZGluYXRlLCBvcmllbnRhdGlvbiB9XG5cbiAgICBjb25zdCBibG93VXAgPSAoKSA9PiB7XG4gICAgICBjb25zdCByZXBvcnQgPSB7XG4gICAgICAgIGludGFjdDogZmFsc2UsXG4gICAgICAgIGhpdDogZmFsc2UsXG4gICAgICAgIHN1bms6IGZhbHNlLFxuICAgICAgICB0eXBlOiBmYWxzZSxcbiAgICAgICAgZ3JhdmV5YXJkOiBmYWxzZSxcbiAgICAgIH07XG4gICAgICBpbnRhY3QgPSBmYWxzZTtcbiAgICAgIGlmICghaXNWYWNhbnQpIHtcbiAgICAgICAgcmVwb3J0LmhpdCA9IHNoaXBQb2ludGVyLmhpdCgpO1xuICAgICAgICBpZiAoc2hpcFBvaW50ZXIuaXNTdW5rKCkpIHtcbiAgICAgICAgICByZXBvcnQuc3VuayA9IHRydWU7XG4gICAgICAgICAgcmVwb3J0LnR5cGUgPSBzaGlwUG9pbnRlci50eXBlO1xuICAgICAgICAgIHJlcG9ydC5ncmF2ZXlhcmQgPSBzaGlwTG9jYXRpb25zO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVwb3J0O1xuICAgIH07XG5cbiAgICBjb25zdCBvY2N1cHkgPSAoc2hpcCwgcGxhY2VtZW50SW5mbykgPT4ge1xuICAgICAgaXNWYWNhbnQgPSBmYWxzZTtcbiAgICAgIHNoaXBQb2ludGVyID0gc2hpcDtcbiAgICAgIHNoaXBMb2NhdGlvbnMgPSBwbGFjZW1lbnRJbmZvO1xuICAgIH07XG5cbiAgICByZXR1cm4ge1xuICAgICAgZ2V0IHZhY2FuY3koKSB7XG4gICAgICAgIHJldHVybiBpc1ZhY2FudDtcbiAgICAgIH0sXG4gICAgICBnZXQgc3RhdHVzKCkge1xuICAgICAgICByZXR1cm4gaW50YWN0O1xuICAgICAgfSxcbiAgICAgIGJsb3dVcCxcbiAgICAgIG9jY3VweSxcbiAgICB9O1xuICB9O1xuXG4gIC8vIG9jY3VwaWVkRm9yY2VzLCBleHBsb2RlZEZvcmNlcyB3aWxsIHRyYWNrIGdhbWUgd2luIGNvbmRpdGlvbnNcbiAgbGV0IG9jY3VwaWVkRm9yY2VzID0gMDtcbiAgbGV0IGV4cGxvZGVkRm9yY2VzID0gMDtcblxuICAvLyBDcmVhdGUgdGhlIGJvYXJkIGFycmF5XG4gIGNvbnN0IGJvYXJkID0gbXlBcnJheSgxMCwgU3F1YXJlKTtcblxuICAvLyBsb3dlciBvcmRlciBmbiBmb3IgcGxhY2VTaGlwXG4gIC8vIHJldHVybnMgMCBpZiBwbGFjZW1lbnQgaXMgdmFjYW50XG4gIC8vIHRocm93cyBhbiBlcnJvciBpZiBvY2N1cGllZFxuICBjb25zdCBjaGVja1ZhY2FuY3kgPSAodHlwZSwgY29vcmRpbmF0ZSwgb3JpZW50YXRpb24pID0+IHtcbiAgICBsZXQgdmFjYW5jeSA9IHRydWU7XG4gICAgY29uc3QgbGVuZ3RoID0gc2hpcFR5cGVzW3R5cGVdO1xuICAgIGJvYXJkLmNoZWNrQ29vcmRpbmF0ZXMobGVuZ3RoLCBjb29yZGluYXRlLCBvcmllbnRhdGlvbik7XG4gICAgYm9hcmQudHJhdmVyc2VCb2FyZChsZW5ndGgsIGNvb3JkaW5hdGUsIG9yaWVudGF0aW9uLCAoc3F1YXJlKSA9PiB7XG4gICAgICB2YWNhbmN5ID0gdmFjYW5jeSAmJiBzcXVhcmUudmFjYW5jeTtcbiAgICB9KTtcbiAgICBpZiAodmFjYW5jeSkgcmV0dXJuIDA7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiUGxhY2VtZW50IGlzIG9jY3VwaWVkXCIpO1xuICB9O1xuXG4gIGNvbnN0IHByb3Zpc2lvbkFuZEF0dGFjaFNoaXAgPSAoc2hpcFR5cGUsIGNvb3JkaW5hdGUsIG9yaWVudGF0aW9uKSA9PiB7XG4gICAgY29uc3QgYm9hdHlNY0JvYXRGYWNlID0gU2hpcChzaGlwVHlwZSk7XG4gICAgY29uc3QgbGVuZ3RoID0gc2hpcFR5cGVzW3NoaXBUeXBlXTtcbiAgICBjb25zdCBwbGFjZW1lbnRJbmZvID0geyBsZW5ndGgsIGNvb3JkaW5hdGUsIG9yaWVudGF0aW9uIH07XG4gICAgY29uc3QgY2FsbGJhY2sgPSAoc3F1YXJlKSA9PiBzcXVhcmUub2NjdXB5KGJvYXR5TWNCb2F0RmFjZSwgcGxhY2VtZW50SW5mbyk7XG4gICAgYm9hcmQudHJhdmVyc2VCb2FyZChsZW5ndGgsIGNvb3JkaW5hdGUsIG9yaWVudGF0aW9uLCBjYWxsYmFjayk7XG4gICAgcmV0dXJuIDA7XG4gIH07XG5cbiAgLy8gY2hlY2sgaWYgcGxhY2VtZW50IGlzIHBvc3NpYmxlXG4gIC8vIGlmIGltcG9zc2libGUsIHJldHVybiByZWplY3RpbmcgcHJvbWlzZVxuICAvLyBpZiBwb3NzaWJsZTpcbiAgLy8gICAgY3JlYXRlIHNoaXBcbiAgLy8gICAgZmlsbCBzcXVhcmVzIHdpdGg6XG4gIC8vICAgICAgY2FsbGJhY2sgZm9yIHNoaXBcbiAgLy8gICAgICB2YWNhbmN5IGF0dHJpYnV0ZVxuICAvKiogc2hpcFR5cGUgZW51bWVyYXRpb246IHtjYXJyaWVyOjUsIGJhdHRsZXNoaXA6NCwgZGVzdHJveWVyOjMsIHN1Ym1hcmluZTozLCBwYXRyb2xib2F0OjJ9XG4gICAqKiBzdGFydENvb3JkOiB7cm93LCBjb2x1bW59XG4gICAqKiBvcmllbnRhdGlvbiBlbnVtZXJhdGlvbjogaG9yaXpvbnRhbCwgdmVydGljYWxcbiAgICovXG4gIGNvbnN0IHBsYWNlU2hpcCA9IChzaGlwVHlwZSwgc3RhcnRDb29yZCwgb3JpZW50YXRpb24pID0+IHtcbiAgICB0cnkge1xuICAgICAgY2hlY2tWYWNhbmN5KHNoaXBUeXBlLCBzdGFydENvb3JkLCBvcmllbnRhdGlvbik7XG4gICAgICBwcm92aXNpb25BbmRBdHRhY2hTaGlwKHNoaXBUeXBlLCBzdGFydENvb3JkLCBvcmllbnRhdGlvbik7XG4gICAgICBvY2N1cGllZEZvcmNlcyArPSAxO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHJldHVybiBlLm1lc3NhZ2U7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9O1xuXG4gIC8qKiBQcm9jZXNzZXMgYW4gYXR0YWNrIG9uIHRoZSBwYXNzZWQgY29vcmRpbmF0ZVxuICAgKiogICBpbnB1dCBwYXJhbWV0ZXIgY29vcmQ6ICAgICAgICAge3JvdywgY29sdW1ufVxuICAgKiogICByZXR1cm5zIGJhdHRsZSByZXBvcnQgb2JqZWN0OiAge2hpdCwgc3VuaywgdHlwZX1cbiAgICoqXG4gICAqL1xuICBjb25zdCByZWNlaXZlQXR0YWNrID0gKGNvb3JkKSA9PiB7XG4gICAgY29uc3Qgc3F1YXJlID0gYm9hcmRbY29vcmQucm93XVtjb29yZC5jb2x1bW5dO1xuICAgIHRyeSB7XG4gICAgICBpZiAoIXNxdWFyZS5zdGF0dXMpIHRocm93IG5ldyBFcnJvcihcIlBvc2l0aW9uIHdhcyBhbHJlYWR5IGF0dGFja2VkXCIpO1xuICAgICAgY29uc3QgYmF0dGxlUmVwb3J0ID0gc3F1YXJlLmJsb3dVcCgpO1xuICAgICAgYmF0dGxlUmVwb3J0LmNvb3JkID0gY29vcmQ7XG4gICAgICBpZiAoYmF0dGxlUmVwb3J0LnN1bmsgPT09IHRydWUpIGV4cGxvZGVkRm9yY2VzICs9IDE7XG4gICAgICByZXR1cm4gYmF0dGxlUmVwb3J0O1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHJldHVybiBlLm1lc3NhZ2U7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiB7XG4gICAgcGxhY2VTaGlwLFxuICAgIGNoZWNrVmFjYW5jeSxcbiAgICByZWNlaXZlQXR0YWNrLFxuICAgIGdldCBzaXplKCkge1xuICAgICAgcmV0dXJuIGJvYXJkLmxlbmd0aDtcbiAgICB9LFxuICAgIGdldCBjaGVja0ZvclZpY3RvcnkoKSB7XG4gICAgICByZXR1cm4gb2NjdXBpZWRGb3JjZXMgPT09IGV4cGxvZGVkRm9yY2VzO1xuICAgIH0sXG4gICAgYm9hcmQsXG4gIH07XG59O1xuXG5leHBvcnQgZGVmYXVsdCBHYW1lYm9hcmQ7XG4iLCJpbXBvcnQgUGxheWVyIGZyb20gXCIuLi9wbGF5ZXIvcGxheWVyXCI7XG5pbXBvcnQgQm9hcmQgZnJvbSBcIi4uL2dhbWVib2FyZC9nYW1lYm9hcmRcIjtcbmltcG9ydCBQdWJTdWIgZnJvbSBcIi4uL3V0aWxpdGllcy9wdWJTdWJcIjtcblxuZnVuY3Rpb24gZGlzcGxheVR1cm4ocGxheWVyKSB7XG4gIGNvbnN0IG1lc3NhZ2UgPSBwbGF5ZXIgPT09IFwiaHVtYW5cIiA/IFwiWW91ciB0dXJuXCIgOiBcIkNvbXB1dGVycyB0dXJuXCI7XG4gIFB1YlN1Yi5wdWJsaXNoKFwiZGlzcGxheS1tZXNzYWdlXCIsIHsgbWVzc2FnZSwgZHVyYXRpb246IGZhbHNlIH0pO1xufVxuXG5mdW5jdGlvbiB3YWl0WG1pbGlTZWMoeCkge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICBzZXRUaW1lb3V0KCgpID0+IHJlc29sdmUoKSwgeCk7XG4gIH0pO1xufVxuXG5jb25zdCBHYW1lTG9vcCA9IGFzeW5jICgpID0+IHtcbiAgY29uc3QgaHVtYW5Cb2FyZCA9IEJvYXJkKCk7XG4gIGNvbnN0IGVuZW15Qm9hcmQgPSBCb2FyZCgpO1xuXG4gIGNvbnN0IGh1bWFuID0gUGxheWVyKFwiaHVtYW5cIiwgaHVtYW5Cb2FyZCwgZW5lbXlCb2FyZCk7XG4gIGNvbnN0IGVuZW15ID0gUGxheWVyKFwiY29tcHV0ZXJcIiwgZW5lbXlCb2FyZCwgaHVtYW5Cb2FyZCk7XG5cbiAgLy8gIFNFVFVQIEJMT0NLXG4gIC8vICBTaGlwcyBnZXQgcGxhY2VkIGJ5IGVhY2ggcGxheWVyXG4gIC8vICAgIEh1bWFuIHBsYXllciB3aWxsIHBsYWNlIHNoaXBzIHZpYSBVSS4gVGhpcyB3aWxsIG5lZWQgdG8gYmUgdmlhIGV2ZW50bGlzdGVuZXJcbiAgLy8gICAgQ29tcHV0ZXIgcGxheWVyIHdpbGwgbmVlZCBhbGdvcml0aG0gaW5zaWRlIHBsYXllciBvYmplY3QgdG8gcGxhY2Ugc2hpcHNcbiAgYXdhaXQgaHVtYW4ucGxhY2VTaGlwcygpO1xuICBhd2FpdCBlbmVteS5wbGFjZVNoaXBzKCk7XG5cbiAgLy8gIElOSVRJQUxJWkFUSU9OIEJMT0NLXG4gIC8vICBHYW1lIGlzIG5vdyBpbml0aWFsaXplZCB0byBiZWdpbi4gR2FtZWxvb3Agc2hvdWxkIG5vdGlmeSBVSVxuICAvLyAgICBBdCB0aGlzIHBvaW50LCBib2FyZCByZWNlaXZlcyBhdHRhY2tzLCBub3Qgc2hpcHNcbiAgUHViU3ViLnB1Ymxpc2goXCJnYW1lLXN0YXJ0XCIsIFwiXCIpO1xuICBhd2FpdCB3YWl0WG1pbGlTZWMoMTAwMCk7XG5cbiAgLy8gVFVSTiBCTE9DS1xuICAvLyBDaGVjayBpZiBnYW1lIGlzIHdvbi9sb3N0XG4gIC8vICAgIGlmIHdvbi9sb3N0LCBnb3RvIGVuZGdhbWVcbiAgLy8gICAgZWxzZVxuICAvLyAgICAgIE5leHQgcGxheWVyIGdvZXNcbiAgd2hpbGUgKHRydWUpIHtcbiAgICBkaXNwbGF5VHVybihcImh1bWFuXCIpO1xuICAgIGF3YWl0IGh1bWFuLnRha2VNb3ZlKCk7XG4gICAgaWYgKGVuZW15Qm9hcmQuY2hlY2tGb3JWaWN0b3J5KSB7XG4gICAgICAvLyBIdW1hbiBwbGF5ZXIgd29uXG4gICAgICBicmVhaztcbiAgICB9XG4gICAgZGlzcGxheVR1cm4oXCJjb21wdXRlclwiKTtcbiAgICBhd2FpdCBlbmVteS50YWtlTW92ZSgpO1xuICAgIGlmIChodW1hbkJvYXJkLmNoZWNrRm9yVmljdG9yeSkge1xuICAgICAgLy8gQ29tcHV0ZXIgcGxheWVyIHdvblxuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgLy8gRU5ER0FNRSBCTE9DS1xuICBjb25zdCB3aW5uZXIgPSBlbmVteUJvYXJkLmNoZWNrRm9yVmljdG9yeSA/IFwiaHVtYW5cIiA6IFwiY29tcHV0ZXJcIjtcbiAgUHViU3ViLnB1Ymxpc2goXCJnYW1lLXdvblwiLCB3aW5uZXIpO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgR2FtZUxvb3A7XG4iLCJpbXBvcnQgc2hpcFR5cGVzIGZyb20gXCIuLi9zaGlwL3NoaXB0eXBlc1wiO1xuXG5jb25zdCBzaGlwU2VhcmNoID0gKCkgPT4ge1xuICBsZXQgcmVtYWluaW5nU2hpcHMgPSBbXG4gICAgXCJjYXJyaWVyXCIsXG4gICAgXCJiYXR0bGVzaGlwXCIsXG4gICAgXCJkZXN0cm95ZXJcIixcbiAgICBcInN1Ym1hcmluZVwiLFxuICAgIFwicGF0cm9sYm9hdFwiLFxuICBdO1xuXG4gIGZ1bmN0aW9uIHJlbW92ZShzaGlwKSB7XG4gICAgcmVtYWluaW5nU2hpcHMgPSByZW1haW5pbmdTaGlwcy5maWx0ZXIoKGUpID0+IGUgIT09IHNoaXApO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0bGVuZ3RocygpIHtcbiAgICByZXR1cm4gcmVtYWluaW5nU2hpcHMubWFwKChlKSA9PiBzaGlwVHlwZXNbZV0pO1xuICB9XG5cbiAgZnVuY3Rpb24gbGFyZ2VzdCgpIHtcbiAgICByZXR1cm4gTWF0aC5tYXgoLi4ucmVtYWluaW5nU2hpcHMpO1xuICB9XG5cbiAgZnVuY3Rpb24gc21hbGxlc3QoKSB7XG4gICAgcmV0dXJuIE1hdGgubWluKC4uLnJlbWFpbmluZ1NoaXBzKTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgcmVtb3ZlLFxuICAgIGdldGxlbmd0aHMsXG4gICAgbGFyZ2VzdCxcbiAgICBzbWFsbGVzdCxcbiAgICBnZXQgc2hpcHMoKSB7XG4gICAgICByZXR1cm4gcmVtYWluaW5nU2hpcHM7XG4gICAgfSxcbiAgfTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IHNoaXBTZWFyY2g7XG4iLCJpbXBvcnQgUHViU3ViIGZyb20gXCIuLi91dGlsaXRpZXMvcHViU3ViXCI7XG5pbXBvcnQgc2hpcFR5cGVzIGZyb20gXCIuLi9zaGlwL3NoaXB0eXBlc1wiO1xuaW1wb3J0IGNvb3JkVG9vbHMgZnJvbSBcIi4uL3ZpZXcvY29vcmRTZWxlY3RvclRvb2xzXCI7XG5pbXBvcnQgbXlBcnJheSBmcm9tIFwiLi4vdXRpbGl0aWVzL215QXJyYXlcIjtcbmltcG9ydCByYW5kb20gZnJvbSBcIi4vcmFuZG9tXCI7XG5pbXBvcnQgc2hpcFNlYXJjaCBmcm9tIFwiLi9tYW5hZ2VTaGlwU2VhcmNoXCI7XG5cbi8vIHV0aWxpdHkgZnVuY3Rpb24gZm9yIHBhc3NpbmcgY29vcmRpbmF0ZXMgdG8gZ2FtZWJvYXJkXG4vLyAgICBwYXNzQ29vcmQoMiw5KSByZXR1cm5zIHsgcm93OjIgLCBjb2x1bW46OSB9XG5jb25zdCBwYXNzQ29vcmQgPSAocm93LCBjb2x1bW4pID0+ICh7IHJvdywgY29sdW1uIH0pO1xuXG5jb25zdCBQbGF5ZXIgPSAodHlwZUluLCBwbGF5ZXJCb2FyZCwgZW5lbXlCb2FyZCkgPT4ge1xuICBjb25zdCB0eXBlID0gdHlwZUluO1xuICBjb25zdCBnYXJyaXNvbiA9IHBsYXllckJvYXJkO1xuICBjb25zdCBiYXR0bGVmaWVsZCA9IGVuZW15Qm9hcmQ7XG4gIGNvbnN0IGF0dGFja0V2ZW50ID1cbiAgICB0eXBlID09PSBcImh1bWFuXCIgPyBcInBsYXllci1hdHRhY2stcmVzdWx0XCIgOiBcImVuZW15LWF0dGFjay1yZXN1bHRcIjtcbiAgY29uc3QgcmVtYWluaW5nU2hpcHMgPSBzaGlwU2VhcmNoKCk7XG5cbiAgZnVuY3Rpb24gZ2V0TmVpZ2hib3JzKGNvb3JkLCBkaXIpIHtcbiAgICBjb25zdCByZXR1cm5TZXQgPSBbXTtcbiAgICBjb25zdCBjaGVja0xvdyA9IChudW0pID0+IG51bSAtIDEgPiAtMTtcbiAgICBjb25zdCBjaGVja0hpZ2ggPSAobnVtKSA9PiBudW0gKyAxIDwgMTA7XG4gICAgY29uc3QgeyByb3cgfSA9IGNvb3JkO1xuICAgIGNvbnN0IHsgY29sdW1uIH0gPSBjb29yZDtcbiAgICBpZiAoZGlyID09PSBcImhvcml6b250YWxcIikge1xuICAgICAgaWYgKGNoZWNrTG93KGNvbHVtbikpIHJldHVyblNldC5wdXNoKHsgcm93LCBjb2x1bW46IGNvb3JkLmNvbHVtbiAtIDEgfSk7XG4gICAgICBpZiAoY2hlY2tIaWdoKGNvbHVtbikpIHJldHVyblNldC5wdXNoKHsgcm93LCBjb2x1bW46IGNvb3JkLmNvbHVtbiArIDEgfSk7XG4gICAgfSBlbHNlIGlmIChkaXIgPT09IFwidmVydGljYWxcIikge1xuICAgICAgaWYgKGNoZWNrTG93KHJvdykpIHJldHVyblNldC5wdXNoKHsgcm93OiBjb29yZC5yb3cgLSAxLCBjb2x1bW4gfSk7XG4gICAgICBpZiAoY2hlY2tIaWdoKHJvdykpIHJldHVyblNldC5wdXNoKHsgcm93OiBjb29yZC5yb3cgKyAxLCBjb2x1bW4gfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChjaGVja0xvdyhjb2x1bW4pKSByZXR1cm5TZXQucHVzaCh7IHJvdywgY29sdW1uOiBjb29yZC5jb2x1bW4gLSAxIH0pO1xuICAgICAgaWYgKGNoZWNrSGlnaChjb2x1bW4pKSByZXR1cm5TZXQucHVzaCh7IHJvdywgY29sdW1uOiBjb29yZC5jb2x1bW4gKyAxIH0pO1xuICAgICAgaWYgKGNoZWNrTG93KHJvdykpIHJldHVyblNldC5wdXNoKHsgcm93OiBjb29yZC5yb3cgLSAxLCBjb2x1bW4gfSk7XG4gICAgICBpZiAoY2hlY2tIaWdoKHJvdykpIHJldHVyblNldC5wdXNoKHsgcm93OiBjb29yZC5yb3cgKyAxLCBjb2x1bW4gfSk7XG4gICAgfVxuICAgIHJldHVybiByZXR1cm5TZXQ7XG4gIH1cblxuICAvLyBVc2VkIGluIGNoZWNrTW92ZVxuICAvLyByZXR1cm5zIGZhbHNlIGlmIHRoZSBjb29yZCBpcyB2YWxpZFxuICAvLyByZXR1cm5zIHRydWUgaWYgdGhlIGNvb3JkIGlzIGludmFsaWRcbiAgZnVuY3Rpb24gdmFsaWRhdGVDb29yZFJhbmdlKGNvb3JkKSB7XG4gICAgaWYgKGNvb3JkID4gLTEgJiYgY29vcmQgPCAxMCkgcmV0dXJuIGZhbHNlO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLy8gYmF0dGxlUGxhbiBmYWN0b3J5IGZ1bmN0aW9uIGlzIHVzZWQgYnkgY29tcHV0ZXIgcGxheWVyXG4gIC8vICBpcyByZXNwb25zaWJsZSBmb3IgZGV0ZXJtaW5pbmcgZWFjaCBtb3ZlIHRha2VuIGJ5IEFJXG4gIGNvbnN0IGJhdHRsZVBsYW4gPSAoKCkgPT4ge1xuICAgIGNvbnN0IG9ialByb3RvID0geyBoaXQ6IGZhbHNlLCBzdW5rOiBmYWxzZSwgaW50YWN0OiB0cnVlLCBoZXVyOiAwIH07XG4gICAgY29uc3QgcGFzdE1vdmVzID0gbXlBcnJheSgxMCwgKCkgPT4gc3RydWN0dXJlZENsb25lKG9ialByb3RvKSk7XG4gICAgbGV0IGhpZ2hlc3RIZXVyaXN0aWMgPSAwO1xuXG4gICAgLy8gdHVybkxhdGNoLCB0dXJuUHJvbWlzZSwgdHVyblByb21pc2VSZXNvbHZlciBhbGwgdXNlZCBieSBodW1hbiBwbGF5ZXJcbiAgICBsZXQgdHVybkxhdGNoID0gMTtcbiAgICBsZXQgdHVyblByb21pc2U7XG4gICAgbGV0IHR1cm5Qcm9taXNlUmVzb2x2ZXIgPSAoKSA9PiB7fTtcblxuICAgIC8vIFJldHVybnMgdHJ1ZSBpZiB0aGUgY29vcmQgaGFzIG5vdCB5ZXQgYmVlbiBhdHRhY2tlZFxuICAgIC8vICByZXR1cm5zIGZhbHNlIG90aGVyd2lzZVxuICAgIGNvbnN0IGNoZWNrTW92ZSA9IChjb29yZCkgPT4ge1xuICAgICAgaWYgKHZhbGlkYXRlQ29vcmRSYW5nZShjb29yZC5yb3cpIHx8IHZhbGlkYXRlQ29vcmRSYW5nZShjb29yZC5jb2x1bW4pKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIGlmIChwYXN0TW92ZXNbY29vcmQucm93XVtjb29yZC5jb2x1bW5dLmludGFjdCA9PT0gdHJ1ZSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9O1xuXG4gICAgLy8gUmV0dXJucyBhIHJhbmRvbSBjb29yZCB0aGF0IGhhcyBub3QgeWV0IGJlZW4gYXR0YWNrZWRcbiAgICAvLyBJZiBvcHRpb25hbFNldCBwYXJhbXRlciBpcyBwYXNzZWQsIHJldHVybiBhIHJhbmRvbSBjb29yZCBmcm9tIHRoYXQgc2V0XG4gICAgLy8gT3RoZXJ3aXNlIHJldHVybiBhIHJhbmRvbSwgdW5hdHRhY2tlZCBjb29yZFxuICAgIGNvbnN0IHJhbmRvbU1vdmUgPSAob3B0aW9uYWxTZXQpID0+IHtcbiAgICAgIGxldCBjb29yZDtcbiAgICAgIGNvbnN0IGNvb3JkR2VuZXJhdG9yID1cbiAgICAgICAgdHlwZW9mIG9wdGlvbmFsU2V0ID09PSBcInVuZGVmaW5lZFwiXG4gICAgICAgICAgPyByYW5kb20uY29vcmRcbiAgICAgICAgICA6IHJhbmRvbS5mcm9tU2V0KG9wdGlvbmFsU2V0KTtcbiAgICAgIGRvIHtcbiAgICAgICAgY29vcmQgPSBjb29yZEdlbmVyYXRvcigpO1xuICAgICAgfSB3aGlsZSAoIWNoZWNrTW92ZShjb29yZCkpO1xuICAgICAgcmV0dXJuIGNvb3JkO1xuICAgIH07XG5cbiAgICAvLyBldmFsIGZ1bmN0aW9uIHVzZWQgdG8gc2VlIGlmIGEgc3F1YXJlIGhhcyBhbiB1bnN1bmsgc2hpcFxuICAgIGZ1bmN0aW9uIGV2YWxVbnN1bmsocmVwb3J0KSB7XG4gICAgICByZXR1cm4gcmVwb3J0LmhpdCAmJiAhcmVwb3J0LnN1bms7XG4gICAgfVxuICAgIC8vIGV2YWwgZnVuY3Rpb24gdG8gc2VlIGlmIGEgc3F1YXJlIGhhcyBub3QgYmVlbiBoaXRcbiAgICBmdW5jdGlvbiBldmFsVW5oaXQocmVwb3J0KSB7XG4gICAgICByZXR1cm4gcmVwb3J0LmludGFjdCA9PT0gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLyBDaGVja3MgdG8gc2VlIGlmIGEgc2hpcCBjb3VsZCBleGlzdCBhdCBwYXNzZWQgcGxhY2VtZW50IGluZm9cbiAgICBmdW5jdGlvbiBjaGVja0ZpdChsZW5ndGgsIGNvb3JkLCBvcmkpIHtcbiAgICAgIGxldCBmaXRzID0gdHJ1ZTtcbiAgICAgIHRyeSB7XG4gICAgICAgIHBhc3RNb3Zlcy5jaGVja0Nvb3JkaW5hdGVzKGxlbmd0aCwgY29vcmQsIG9yaSk7XG4gICAgICAgIHBhc3RNb3Zlcy50cmF2ZXJzZUJvYXJkKGxlbmd0aCwgY29vcmQsIG9yaSwgKHJlcG9ydCkgPT4ge1xuICAgICAgICAgIGZpdHMgPSBmaXRzICYmIHJlcG9ydC5pbnRhY3Q7XG4gICAgICAgIH0pO1xuICAgICAgfSBjYXRjaCB7XG4gICAgICAgIC8vIEVycm9yIHdhcyB0aHJvd24gZHVlIHRvIGltcG9zaWJsZSBwbGFjZW1lbnRcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZpdHM7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaGV1clBsdXNPbmUobGVuZ3RoLCBjb29yZCwgb3JpKSB7XG4gICAgICBwYXN0TW92ZXMudHJhdmVyc2VCb2FyZChsZW5ndGgsIGNvb3JkLCBvcmksIChyZXBvcnQpID0+IHtcbiAgICAgICAgcmVwb3J0LmhldXIgKz0gMTtcbiAgICAgICAgaWYgKHJlcG9ydC5oZXVyID4gaGlnaGVzdEhldXJpc3RpYykgaGlnaGVzdEhldXJpc3RpYyA9IHJlcG9ydC5oZXVyO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdXBkYXRlUmVwb3J0SGV1cihsZW5ndGgsIGNvb3JkKSB7XG4gICAgICBjb25zdCBmaXRzSG9yaXpvbnRhbGx5ID0gY2hlY2tGaXQobGVuZ3RoLCBjb29yZCwgXCJob3Jpem9udGFsXCIpO1xuICAgICAgY29uc3QgZml0c1ZlcnRpY2FsbHkgPSBjaGVja0ZpdChsZW5ndGgsIGNvb3JkLCBcInZlcnRpY2FsXCIpO1xuICAgICAgaWYgKGZpdHNIb3Jpem9udGFsbHkgPT09IHRydWUpIGhldXJQbHVzT25lKGxlbmd0aCwgY29vcmQsIFwiaG9yaXpvbnRhbFwiKTtcbiAgICAgIGlmIChmaXRzVmVydGljYWxseSA9PT0gdHJ1ZSkgaGV1clBsdXNPbmUobGVuZ3RoLCBjb29yZCwgXCJ2ZXJ0aWNhbFwiKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB1cGRhdGVIZXVyaXN0aWNWYWx1ZSgpIHtcbiAgICAgIC8vIFJlc2V0IHRoZSBoZXVyaXN0aWMgdmFsdWVzXG4gICAgICBoaWdoZXN0SGV1cmlzdGljID0gMDtcbiAgICAgIHBhc3RNb3Zlcy5hcHBseVRvRWFjaCgocmVwb3J0KSA9PiB7XG4gICAgICAgIHJlcG9ydC5oZXVyID0gMDtcbiAgICAgIH0pO1xuICAgICAgLy8gZ2V0IHRoZSBzaGlwIGxlbmd0aHMgdGhhdCByZW1haW5cbiAgICAgIGNvbnN0IGxlbmd0aHMgPSByZW1haW5pbmdTaGlwcy5nZXRsZW5ndGhzKCk7XG4gICAgICAvLyBpdGVyYXRlIGFjcm9zcyBlYWNoIHJlcG9ydCBpbiB0aGUgcGFzdG1vdmVzIGFycmF5XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDEwOyBpICs9IDEpIHtcbiAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCAxMDsgaiArPSAxKSB7XG4gICAgICAgICAgbGV0IHRoaXNDb29yZCA9IHBhc3NDb29yZChpLCBqKTtcbiAgICAgICAgICAvLyBpdGVyYXRlIGFjcm9zcyBlYWNoIHJlbWFpbmluZyBzaGlwIGxlbmd0aFxuICAgICAgICAgIGZvciAobGV0IGsgPSAwOyBrIDwgbGVuZ3Rocy5sZW5ndGg7IGsgKz0gMSkge1xuICAgICAgICAgICAgdXBkYXRlUmVwb3J0SGV1cihsZW5ndGhzW2tdLCB0aGlzQ29vcmQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldEhpZ2hlc3RIZXVyaXN0aWNTZXQoKSB7XG4gICAgICBjb25zdCBjb29yZHMgPSBbXTtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMTA7IGkgKz0gMSkge1xuICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IDEwOyBqICs9IDEpIHtcbiAgICAgICAgICBpZiAocGFzdE1vdmVzW2ldW2pdLmhldXIgPT09IGhpZ2hlc3RIZXVyaXN0aWMpIHtcbiAgICAgICAgICAgIGNvb3Jkcy5wdXNoKHBhc3NDb29yZChpLCBqKSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gY29vcmRzO1xuICAgIH1cblxuICAgIC8vIHJldHVybnMgdGhlIGZpcnN0IFwidW5zdW5rXCIgY29vcmRpbmF0ZSB3aXRoIGF0dGFja2FibGUgYWRqYWNlbnQgc3F1YXJlc1xuICAgIGZ1bmN0aW9uIGZpbmRVbnN1bmtTaGlwKCkge1xuICAgICAgLy8gaW5jcmVtZW5lZCBpbmNhc2UgbW9yZSB0aGFuIG9uIGxpbmVhclNlYXJjaCBpcyBuZWNlc3NhcnlcbiAgICAgIGxldCBudGhNYXRjaCA9IDA7XG4gICAgICAvLyBsb29rIGZvciBhbiB1bnN1bmsgc2hpcFxuICAgICAgbGV0IHVuc3VuayA9IHBhc3RNb3Zlcy5saW5lYXJTZWFyY2goZXZhbFVuc3VuaywgbnRoTWF0Y2gpO1xuICAgICAgLy8gaWYgdGhlcmUgaXMgbm9uZSwgcmV0dXJuIGZhbHNlXG4gICAgICBpZiAodW5zdW5rID09PSBmYWxzZSkgcmV0dXJuIGZhbHNlO1xuICAgICAgd2hpbGUgKCFwYXN0TW92ZXMuY2hlY2tBZGphY2VudCh1bnN1bmssIGV2YWxVbmhpdCkpIHtcbiAgICAgICAgbnRoTWF0Y2ggKz0gMTtcbiAgICAgICAgdW5zdW5rID0gcGFzdE1vdmVzLmxpbmVhclNlYXJjaChldmFsVW5zdW5rLCBudGhNYXRjaCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdW5zdW5rO1xuICAgIH1cblxuICAgIC8vIEZ1bmN0aW9uIHVzZWQgYnkgY29tcHV0ZXIgcGxheWVyIHRvIGRlY2lkZSB3aGVyZSB0byBhdHRhY2tcbiAgICBjb25zdCBkZWNpZGVNb3ZlID0gKCkgPT5cbiAgICAgIC8vIENyZWF0ZSBhbmQgcmV0dXJuIGFuIHVucmVzb2x2ZWQgcHJvbWlzZVxuICAgICAgbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgbGV0IGF0dGFja0Nvb3JkO1xuICAgICAgICBsZXQgY29vcmRpbmF0ZVNldDtcbiAgICAgICAgbGV0IHVuc3VuaztcbiAgICAgICAgbGV0IHVuc3Vua0F0dGVtcHQyO1xuICAgICAgICBjb25zdCB0aW1lb3V0RGVsYXkgPSAxMDA7XG4gICAgICAgIC8qXG4gICAgICAgICAqICBEZWNpZGUgd2hlcmUgdG8gYXR0YWNrIGJsb2NrXG4gICAgICAgICAqL1xuICAgICAgICAvLyBDaGVjayB0byBzZWUgaWYgdGhlcmUgYXJlIGFueSBwYXJ0aWFsbHkgZGFtYWdlZCBzaGlwc1xuICAgICAgICAvLyAgICBpZiBzbywgY29udGludWUgdG8gdGFyZ2V0IHRoZW1cbiAgICAgICAgdW5zdW5rID0gZmluZFVuc3Vua1NoaXAoKTtcbiAgICAgICAgaWYgKHVuc3VuayA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAvLyBObyBwYXJ0aWFsbHkgZGFtYWdlZCBzaGlwcztcbiAgICAgICAgICAvLyBjYWxjdWxhdGUgaHVyaXNpdGMgdmFsdWUgZm9yIGVhY2ggc3F1YXJlXG4gICAgICAgICAgdXBkYXRlSGV1cmlzdGljVmFsdWUoKTtcbiAgICAgICAgICAvLyBmaW5kIHNldCBvZiBzcXVhcmVzIHdpdGggdGhlIGhpZ2hlc3QgaGV1cmlzdGljIHZhbHVlXG4gICAgICAgICAgY29uc3QgbW9zdFByb2JhYmxlTG9jYXRpb25zID0gZ2V0SGlnaGVzdEhldXJpc3RpY1NldCgpO1xuICAgICAgICAgIC8vICBhdHRhY2sgcmFuZG9tbHkgYmFzZWQgb24gaGV1cmlzdGljIGZ1bmN0aW9uXG4gICAgICAgICAgYXR0YWNrQ29vcmQgPSByYW5kb21Nb3ZlKG1vc3RQcm9iYWJsZUxvY2F0aW9ucyk7XG4gICAgICAgIH0gZWxzZSBpZiAocGFzdE1vdmVzLmNoZWNrQWRqYWNlbnQodW5zdW5rLCBldmFsVW5zdW5rLCBcImhvcml6b250YWxcIikpIHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gYXR0YWNrIGhvcml6b250YWxseVxuICAgICAgICAgICAgY29vcmRpbmF0ZVNldCA9IGdldE5laWdoYm9ycyh1bnN1bmssIFwiaG9yaXpvbnRhbFwiKTtcbiAgICAgICAgICAgIGF0dGFja0Nvb3JkID0gcmFuZG9tTW92ZShjb29yZGluYXRlU2V0KTtcbiAgICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgIC8vIGZpbmQgdGhlIGxhc3QgZWxlbWVudCBpbiB0aGlzIHJvd1xuICAgICAgICAgICAgICB1bnN1bmtBdHRlbXB0MiA9IHBhc3RNb3Zlcy5sYXN0SW5Sb3codW5zdW5rLCBldmFsVW5zdW5rKTtcbiAgICAgICAgICAgICAgLy8gZ2V0IGl0cyBob3Jpem9udGFsIG5laWdoYm9yc1xuICAgICAgICAgICAgICBjb29yZGluYXRlU2V0ID0gZ2V0TmVpZ2hib3JzKHVuc3Vua0F0dGVtcHQyLCBcImhvcml6b250YWxcIik7XG4gICAgICAgICAgICAgIC8vIGF0dGFjayBob3Jpem9udGFsbHlcbiAgICAgICAgICAgICAgYXR0YWNrQ29vcmQgPSByYW5kb21Nb3ZlKGNvb3JkaW5hdGVTZXQpO1xuICAgICAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICAgIC8vIGF0dGFjayB2ZXJ0aWNhbGx5XG4gICAgICAgICAgICAgIGNvb3JkaW5hdGVTZXQgPSBnZXROZWlnaGJvcnModW5zdW5rLCBcInZlcnRpY2FsXCIpO1xuICAgICAgICAgICAgICBhdHRhY2tDb29yZCA9IHJhbmRvbU1vdmUoY29vcmRpbmF0ZVNldCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBhdHRhY2sgdmVydGljYWxseVxuICAgICAgICAgICAgY29vcmRpbmF0ZVNldCA9IGdldE5laWdoYm9ycyh1bnN1bmssIFwidmVydGljYWxcIik7XG4gICAgICAgICAgICBhdHRhY2tDb29yZCA9IHJhbmRvbU1vdmUoY29vcmRpbmF0ZVNldCk7XG4gICAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAvLyBmaW5kIHRoZSBsYXN0IGVsZW1lbnQgaW4gdGhpcyBjb2x1bW5cbiAgICAgICAgICAgICAgdW5zdW5rQXR0ZW1wdDIgPSBwYXN0TW92ZXMubGFzdEluQ29sdW1uKHVuc3VuaywgZXZhbFVuc3Vuayk7XG4gICAgICAgICAgICAgIC8vIGdldCBpdHMgdmVydGljYWwgbmVpZ2hib3JzXG4gICAgICAgICAgICAgIGNvb3JkaW5hdGVTZXQgPSBnZXROZWlnaGJvcnModW5zdW5rQXR0ZW1wdDIsIFwidmVydGljYWxcIik7XG4gICAgICAgICAgICAgIC8vIGF0dGFjayB2ZXJ0aWNhbGx5XG4gICAgICAgICAgICAgIGF0dGFja0Nvb3JkID0gcmFuZG9tTW92ZShjb29yZGluYXRlU2V0KTtcbiAgICAgICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgICAvLyBhdHRhY2sgaG9yaXpvbnRhbGx5XG4gICAgICAgICAgICAgIGNvb3JkaW5hdGVTZXQgPSBnZXROZWlnaGJvcnModW5zdW5rLCBcImhvcml6b250YWxcIik7XG4gICAgICAgICAgICAgIGF0dGFja0Nvb3JkID0gcmFuZG9tTW92ZShjb29yZGluYXRlU2V0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBSZXNvbHZlIHRoZSBwcm9taXNlIHdpdGggdGhlIGRlc2lyZWQgY29vcmRpbmF0ZVxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHJlc29sdmUoYXR0YWNrQ29vcmQpLCB0aW1lb3V0RGVsYXkpO1xuICAgICAgfSk7XG5cbiAgICAvLyAgSW52b2tlZCBvbiBcInBsYXllci1hdHRhY2tcIiBldmVudFxuICAgIGZ1bmN0aW9uIHJlc29sdmVUdXJuUHJvbWlzZShjb29yZCkge1xuICAgICAgLy8gaWYgdHVybiBsYXRjaCBpcyBcImNsb3NlZFwiLCBkbyBub3RoaW5nXG4gICAgICBpZiAodHVybkxhdGNoID09PSAxKSB7XG4gICAgICAgIHR1cm5Qcm9taXNlUmVzb2x2ZXIoY29vcmQpO1xuICAgICAgICAvLyBcImNsb3NlXCIgdHVybiBsYXRjaFxuICAgICAgICB0dXJuTGF0Y2ggPSAwO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vICBVc2VkIGluIGRlY2lkZUh1bWFuTW92ZSBtZXRob2RcbiAgICBmdW5jdGlvbiByZXNldFR1cm5Qcm9taXNlKCkge1xuICAgICAgLy8gIE92ZXJ3cml0ZSBvbGQgdHVybiBwcm9taXNlIHdpdGggbmV3IHR1cm4gcHJvbWlzZVxuICAgICAgdHVyblByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICAvLyAgbWFrZSB0aGUgcmVzb2x2ZXIgYXZhaWxhYmxlIHRvIGJhdHRsZVBsYW4gcm9vdCBzY29wZVxuICAgICAgICAvLyAgdGhpcyB3aWxsIGJlIHVzZWQgYnkgcmVzb2x2ZVR1cm5Qcm9taXNlIG9uIFwicGxheWVyLWF0dGFja1wiIGV2ZW50XG4gICAgICAgIHR1cm5Qcm9taXNlUmVzb2x2ZXIgPSByZXNvbHZlO1xuICAgICAgfSk7XG4gICAgICAvLyAgXCJvcGVuXCIgdHVybiBsYXRjaFxuICAgICAgdHVybkxhdGNoID0gMTtcbiAgICAgIC8vICByZXR1cm4gdGhlIChjdXJyZW50bHkpIHVuZnVsZmlsbGVkIHByb21pc2VcbiAgICAgIHJldHVybiB0dXJuUHJvbWlzZTtcbiAgICB9XG5cbiAgICAvLyBVc2VkIGluIHRha2VNb3ZlIHRvIHJlbWVtYmVyIHRoZSByZXN1bHQgb2YgZWFjaCBtb3ZlXG4gICAgLy8gVXBkYXRlcyBlbGVtZW50cyBvZiB0aGUgcGFzdE1vdmVzIGFycmF5IHRvIGhvbGQgdGhlIGF0dGFjayByZXBvcnRcbiAgICBmdW5jdGlvbiByZW1lbWJlcihyZXBvcnQpIHtcbiAgICAgIGNvbnN0IHsgcm93IH0gPSByZXBvcnQuY29vcmQ7XG4gICAgICBjb25zdCB7IGNvbHVtbiB9ID0gcmVwb3J0LmNvb3JkO1xuICAgICAgcGFzdE1vdmVzW3Jvd11bY29sdW1uXSA9IHJlcG9ydDtcbiAgICAgIC8vIGlmIHRoZSBzaGlwIGlzIHN1bmssIHVwZGF0ZSBhbGwgcmVsZXZhbnQgcmVwb3J0cyB0byByZWZsZWN0IHRoaXNcbiAgICAgIGlmIChyZXBvcnQuc3VuayA9PT0gdHJ1ZSkge1xuICAgICAgICAvLyBkZWxldGUgdGhlIHNoaXAgZnJvbSB0aGUgc2VhcmNoXG4gICAgICAgIHJlbWFpbmluZ1NoaXBzLnJlbW92ZShyZXBvcnQudHlwZSk7XG4gICAgICAgIC8vIGdldCBhbGwgcmVsZXZhbnQgY29vcmRpbmF0ZXNcbiAgICAgICAgY29uc3QgY29vcmRzVG9VcGRhdGUgPSBjb29yZFRvb2xzLmdldENvb3JkaW5hdGVMaXN0KFxuICAgICAgICAgIHJlcG9ydC5ncmF2ZXlhcmQubGVuZ3RoLFxuICAgICAgICAgIHJlcG9ydC5ncmF2ZXlhcmQuY29vcmRpbmF0ZSxcbiAgICAgICAgICByZXBvcnQuZ3JhdmV5YXJkLm9yaWVudGF0aW9uXG4gICAgICAgICk7XG4gICAgICAgIC8vIHVwZGF0ZSBzdW5rLCBncmF2ZXlhcmQgcHJvcGVydGllcyBmb3IgZWFjaCBjb29yZGluYXRlXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY29vcmRzVG9VcGRhdGUubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICBjb25zdCByID0gY29vcmRzVG9VcGRhdGVbaV1bMF07XG4gICAgICAgICAgY29uc3QgYyA9IGNvb3Jkc1RvVXBkYXRlW2ldWzFdO1xuICAgICAgICAgIHBhc3RNb3Zlc1tyXVtjXS5zdW5rID0gdHJ1ZTtcbiAgICAgICAgICBwYXN0TW92ZXNbcl1bY10uZ3JhdmV5YXJkID0gcmVwb3J0LmdyYXZleWFyZDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICByZW1lbWJlcixcbiAgICAgIHJlc2V0VHVyblByb21pc2UsXG4gICAgICByZXNvbHZlVHVyblByb21pc2UsXG4gICAgICBjaGVja01vdmUsXG4gICAgICBkZWNpZGVNb3ZlLFxuICAgIH07XG4gIH0pKCk7XG5cbiAgLy8gIFVzZWQgaW4gdGFrZU1vdmUgbWV0aG9kXG4gIC8vICBQdWJsaXNoZXMgdGhlIGF0dGFja0V2ZW50IChkZWZpbmVkIGF0IHJvb3Qgb2YgUGxheWVyIG9iamVjdFxuICAvLyAgICBhdHRhY2sgZXZlbnQgaXMgZWl0aGVyIFwicGxheWVyLWF0dGFjay1yZXN1bHRcIiBvciBcImVuZW15LWF0dGFjay1yZXN1bHRcIlxuICAvLyAgTm90aWZpZXMgdGhlIFZpZXcgTW9kdWxlIG9mIHRoZSBhdHRhY2sgcmVzdWx0IHNvIHRoZSBET00gY2FuIGJlIHVwZGF0ZWRcbiAgZnVuY3Rpb24gcHVibGlzaE1vdmUocmVwb3J0KSB7XG4gICAgUHViU3ViLnB1Ymxpc2goYXR0YWNrRXZlbnQsIHJlcG9ydCk7XG4gIH1cblxuICAvLyAgVXNlZCBieSBodW1hbiBwbGF5ZXIgdG8gYXR0YWNrIGVuZW15IGJvYXJkIHZpYSBVSVxuICAvLyAgUmV0dXJucyBhbiB1bmZ1bGZpbGxlZCBwcm9taXNlXG4gIC8vICAgIFRoZSBwcm9taXNlIGlzIGxhdGVyIHJlc29sdmVkIGJ5IGJhdHRsZXBsYW4ucmVzb2x2ZVR1cm5Qcm9taXNlIG9uIFwicGxheWVyLWF0dGFja1wiIGV2ZW50XG4gIGFzeW5jIGZ1bmN0aW9uIGRlY2lkZU1vdmVIdW1hbigpIHtcbiAgICByZXR1cm4gYmF0dGxlUGxhbi5yZXNldFR1cm5Qcm9taXNlKCk7XG4gIH1cblxuICAvLyBIQUNLIERvZXMgbm90IHdvcmsgYXMgaXMuXG4gIC8vICBzaG91bGQgbm90IHRocm93IGFuIGVycm9yLm5lZWRzIHRvIGRvIG93biBlcnJvciBoYW5kbGluZy5cbiAgLy8gIHNob3VsZCBub3QgZmluaXNoIHVudGlsIHZpYWJsZSBtb3ZlIGhhcyBiZWVuIHRha2VuXG4gIGNvbnN0IHRha2VNb3ZlID0gYXN5bmMgKCkgPT4ge1xuICAgIGNvbnN0IGNob29zZUF0dGFja0ZuID1cbiAgICAgIHR5cGUgPT09IFwiaHVtYW5cIiA/IGRlY2lkZU1vdmVIdW1hbiA6IGJhdHRsZVBsYW4uZGVjaWRlTW92ZTtcbiAgICBjb25zdCBhdHRhY2tDb29yZCA9IGF3YWl0IGNob29zZUF0dGFja0ZuKCk7XG5cbiAgICBpZiAoYmF0dGxlUGxhbi5jaGVja01vdmUoYXR0YWNrQ29vcmQpKSB7XG4gICAgICBjb25zdCByZXBvcnQgPSBiYXR0bGVmaWVsZC5yZWNlaXZlQXR0YWNrKGF0dGFja0Nvb3JkKTtcbiAgICAgIGJhdHRsZVBsYW4ucmVtZW1iZXIocmVwb3J0KTtcbiAgICAgIHB1Ymxpc2hNb3ZlKHJlcG9ydCk7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRydWUpO1xuICAgIH1cbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJSZXBlYXQgbW92ZVwiKTtcbiAgfTtcblxuICAvLyBVc2VkIGJ5IGNvbXB1dGVyIHBsYXllciBpbiBwbGFjZVNoaXBzQXV0b1xuICAvLyAgSW5wdXQgcGFyYW1ldGVycyBhcmUgdGhlIHNoaXAgcGxhY2VtZW50IGluZm9cbiAgLy8gIHJldHVybnMgZmFsc2UgaWYgdGhlIHN1cnJvbmRpbmcgYXJlYSBpcyBlbXB0eVxuICAvLyAgICB0aHJvd3MgYW4gZXJyb3Igb3RoZXJ3aXNlXG4gIGZ1bmN0aW9uIGNoZWNrU2VjbHVzaW9uKGN1cnJlbnRUeXBlLCByYW5kb21DaG9pY2UsIG9yaWVudGF0aW9uKSB7XG4gICAgY29uc3QgbGVuZ3RoID0gc2hpcFR5cGVzW2N1cnJlbnRUeXBlXTtcbiAgICAvLyBjcmVhdGUgYXJyYXkgb2YgY29vcmRpbmF0ZSBvYmplY3RzXG4gICAgY29uc3QgYWxsQ29vcmRzID0gY29vcmRUb29scy5hbGxDb29yZHMobGVuZ3RoLCByYW5kb21DaG9pY2UsIG9yaWVudGF0aW9uKTtcbiAgICAvLyBjaGVja0FkamFjZW50IHJldHVybnMgZmFsc2UgaWYgZXZlcnl0aGluZyBpcyB2YWNhbnRcbiAgICAvLyBlYWNoIGNhbGwgdG8gYW4gZWxlbWVudHMgY2FsbGJhY2sgc2hvdWxkIHJldHVybiBmYWxzZSBpZiB2YWNhbnRcbiAgICBjb25zdCBvdXRlclZhY2FuY3lGbiA9IGdhcnJpc29uLmJvYXJkLmNoZWNrQWRqYWNlbnQ7XG4gICAgLy8gc3F1YXJlLnZhY2FuY3kgcmV0dXJucyB0cnVlIGlmIHZhY2FudFxuICAgIGNvbnN0IGlubmVyVmFjYW5jeUZuID0gKHNxdWFyZSkgPT4gIXNxdWFyZS52YWNhbmN5O1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYWxsQ29vcmRzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICBpZiAob3V0ZXJWYWNhbmN5Rm4oYWxsQ29vcmRzW2ldLCBpbm5lclZhY2FuY3lGbikpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlRvbyBjcm93ZGVkXCIpO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvLyBVc2VkIGJ5IGNvbXB1dGVyIHBsYXllciB0byBwbGFjZSBzaGlwc1xuICAvLyAgICBhbGdvcml0aG0gaXMgdXNlZCB0byBkZWNpZGUgbG9jYXRpb25zXG4gIC8vICAgIHNoaXBzIGFyZSBwbGFjZWQgc3luY2hyb25vdXNseSB2aWEgR2FtZWJvYXJkLnBsYWNlU2hpcCgpIG1ldGhvZFxuICAvLyAgICBhIHByb21pc2UgaXMgcmV0dXJuZWQgaW4gb3JkZXIgdG8gYXZvaWQgemFsZ28gaW5zaWRlIG9mIFBsYXllci5wbGFjZVNoaXBzKClcbiAgY29uc3QgcGxhY2VTaGlwc0F1dG8gPSAoKSA9PiB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBPYmplY3Qua2V5cyhzaGlwVHlwZXMpLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAvLyBpbml0aWFsaXplIHdoaWxlIGxvb3AgY29uZGl0aW9uXG4gICAgICBsZXQgc2hpcElzTm90UGxhY2VkID0gdHJ1ZTtcbiAgICAgIC8vIGluaXRpYWxpemUvZGVjbGFyZSBwYXJhbWV0ZXJzIGZvciBzaGlwIHBsYWNlbWVudFxuICAgICAgY29uc3QgY3VycmVudFR5cGUgPSBPYmplY3Qua2V5cyhzaGlwVHlwZXMpW2ldO1xuICAgICAgbGV0IHJhbmRvbUNob2ljZTtcbiAgICAgIGxldCBvcmllbnRhdGlvbjtcbiAgICAgIHdoaWxlIChzaGlwSXNOb3RQbGFjZWQpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAvLyBzZWxlY3QgcmFuZG9tIGNvb3JkaW5hdGVcbiAgICAgICAgICByYW5kb21DaG9pY2UgPSByYW5kb20uY29vcmQoKTtcbiAgICAgICAgICAvLyBzZWxlY3QgcmFuZG9tIG9yaWVudGF0aW9uXG4gICAgICAgICAgb3JpZW50YXRpb24gPSByYW5kb20ub3JpZW50YXRpb24oKTtcbiAgICAgICAgICAvLyBjaGVjayBpZiB0aGUgcmFuZG9tIHBsYWNlbWVudCBpcyB1bm9jY3VwaWVkXG4gICAgICAgICAgZ2Fycmlzb24uY2hlY2tWYWNhbmN5KGN1cnJlbnRUeXBlLCByYW5kb21DaG9pY2UsIG9yaWVudGF0aW9uKTtcbiAgICAgICAgICAvLyBjaGVjayBpZiBhbGwgYWRqYWNlbnQgc3F1YXJlcyBhcmUgc2VjbHVkZWRcbiAgICAgICAgICBjaGVja1NlY2x1c2lvbihjdXJyZW50VHlwZSwgcmFuZG9tQ2hvaWNlLCBvcmllbnRhdGlvbik7XG4gICAgICAgICAgLy8gUGxhY2UgdGhlIHNoaXBcbiAgICAgICAgICBnYXJyaXNvbi5wbGFjZVNoaXAoY3VycmVudFR5cGUsIHJhbmRvbUNob2ljZSwgb3JpZW50YXRpb24pO1xuICAgICAgICAgIHNoaXBJc05vdFBsYWNlZCA9IGZhbHNlO1xuICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAvLyBFaXRoZXIgdGhlIHBsYWNlbWVudCB3YXMgb2NjdXBpZWQsIG9yIHRoZSBuZWlnaGJvcmhvb2Qgd2FzIGJ1c3lcbiAgICAgICAgICAvLyAgIGVpdGhlciB3YXksIHRyeSBhZ2Fpbiwgc2luY2Ugc2hpcElzTm90UGxhY2VkID09PSB0cnVlXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0cnVlKTtcbiAgfTtcblxuICAvLyAgU3Vic2NyaXB0aW9uIHRvIFwicGxhY2UtKioqKipcIiBldmVudCAocGFzc2VkIGFzIHNoaXBFdmVudClcbiAgLy8gIENyZWF0ZXMgYW5kIHJldHVybnMgYSBwcm9taXNlLlxuICAvLyAgT24gc2hpcEV2ZW50LCBUaGUgcHJvbWlzZSBpcyByZXNvbHZlZCB3aXRoIHRoZSBldmVudCBwYXlsb2FkXG4gIGFzeW5jIGZ1bmN0aW9uIHdhaXRGb3JQbGFjZW1lbnQoc2hpcEV2ZW50KSB7XG4gICAgLy8gQ3JlYXRlIGEgcHJvbWlzZVxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgLy8gU3Vic2NyaWJlIHRvIHNoaXBFdmVudC4gUmVzb2x2ZSB0aGUgcHJvbWlzZSB3aGVuIHRoZSBldmVudCBoYXBwZW5zXG4gICAgICBQdWJTdWIuc3Vic2NyaWJlKHNoaXBFdmVudCwgKGRhdGEpID0+IHtcbiAgICAgICAgcmVzb2x2ZShkYXRhKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgLy8gIFdyYXBwZXIgYXJvdW5kIEdhbWVCb2FyZC5wbGFjZVNoaXBcbiAgLy8gICAgTWFrZXMgYSBjYWxsIHRvIHRoZSBtZXRob2QgdXNpbmcgYSBwcm9taXNlIHdoaWNoIGNvbnRhaW5zIHRoZSByZWxldmFudCBwYXJhbWV0ZXJzXG4gIGNvbnN0IHBsYWNlU2hpcEZyb21Qcm9taXNlUmVzdWx0ID0gKHBsYWNlbWVudCkgPT4ge1xuICAgIGdhcnJpc29uLnBsYWNlU2hpcChcbiAgICAgIHBsYWNlbWVudC50eXBlLFxuICAgICAgcGxhY2VtZW50LmNvb3JkaW5hdGUsXG4gICAgICBwbGFjZW1lbnQub3JpZW50YXRpb25cbiAgICApO1xuICB9O1xuXG4gIC8vICBVc2VkIGJ5IGh1bWFuIHBsYXllciB0byBwbGFjZSBzaGlwcyB2aWEgVUlcbiAgLy8gICAgcHViL3N1YiBwYXR0ZXJuIGlzIHVzZWQgaGVyZSBiZXR3ZWVuIFZpZXcsIFBsYXllclxuICBjb25zdCBwbGFjZVNoaXBzVUkgPSBhc3luYyAoKSA9PiB7XG4gICAgY29uc3QgY2FycmllclByb21pc2UgPSB3YWl0Rm9yUGxhY2VtZW50KFwicGxhY2UtY2FycmllclwiKTtcbiAgICBjb25zdCBiYXR0bGVzaGlwUHJvbWlzZSA9IHdhaXRGb3JQbGFjZW1lbnQoXCJwbGFjZS1iYXR0bGVzaGlwXCIpO1xuICAgIGNvbnN0IHN1Ym1hcmluZVByb21pc2UgPSB3YWl0Rm9yUGxhY2VtZW50KFwicGxhY2Utc3VibWFyaW5lXCIpO1xuICAgIGNvbnN0IGRlc3Ryb3llclByb21pc2UgPSB3YWl0Rm9yUGxhY2VtZW50KFwicGxhY2UtZGVzdHJveWVyXCIpO1xuICAgIGNvbnN0IHBhdHJvbGJvYXRQcm9taXNlID0gd2FpdEZvclBsYWNlbWVudChcInBsYWNlLXBhdHJvbGJvYXRcIik7XG4gICAgbGV0IHBsYWNlbWVudDtcblxuICAgIC8vIFJlY2lldmUgcGxhY2VtZW50IG9mIENhcnJpZXJcbiAgICBwbGFjZW1lbnQgPSBhd2FpdCBjYXJyaWVyUHJvbWlzZTtcbiAgICBwbGFjZVNoaXBGcm9tUHJvbWlzZVJlc3VsdChwbGFjZW1lbnQpO1xuXG4gICAgcGxhY2VtZW50ID0gYXdhaXQgYmF0dGxlc2hpcFByb21pc2U7XG4gICAgcGxhY2VTaGlwRnJvbVByb21pc2VSZXN1bHQocGxhY2VtZW50KTtcblxuICAgIHBsYWNlbWVudCA9IGF3YWl0IGRlc3Ryb3llclByb21pc2U7XG4gICAgcGxhY2VTaGlwRnJvbVByb21pc2VSZXN1bHQocGxhY2VtZW50KTtcblxuICAgIHBsYWNlbWVudCA9IGF3YWl0IHN1Ym1hcmluZVByb21pc2U7XG4gICAgcGxhY2VTaGlwRnJvbVByb21pc2VSZXN1bHQocGxhY2VtZW50KTtcblxuICAgIHBsYWNlbWVudCA9IGF3YWl0IHBhdHJvbGJvYXRQcm9taXNlO1xuICAgIHBsYWNlU2hpcEZyb21Qcm9taXNlUmVzdWx0KHBsYWNlbWVudCk7XG5cbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRydWUpO1xuICB9O1xuXG4gIC8vIFVzZWQgaW4gZ2FtZSBsb29wIHRvIHBsYWNlIGFsbCBvZiB0aGUgcGxheWVycyBzaGlwc1xuICBjb25zdCBwbGFjZVNoaXBzID0gYXN5bmMgKCkgPT4ge1xuICAgIGNvbnN0IHBsYWNlU2hpcHNGdW5jdGlvbiA9IHR5cGUgPT09IFwiaHVtYW5cIiA/IHBsYWNlU2hpcHNVSSA6IHBsYWNlU2hpcHNBdXRvO1xuICAgIGF3YWl0IHBsYWNlU2hpcHNGdW5jdGlvbigpO1xuXG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0cnVlKTtcbiAgfTtcblxuICAvKipcbiAgICoqICBQdWJsaXNoIEV2ZW50czpcbiAgICoqICAgIHBsYWNlLXNoaXAtaG92ZXItcmVzdWx0XG4gICAqKlxuICAgKiogIFN1YnNjcmliZSBFdmVudHM6XG4gICAqKiAgICAgcGxhY2Utc2hpcC1ob3ZlclxuICAgKi9cbiAgZnVuY3Rpb24gaW5pdFNoaXBQbGFjZW1lbnRTdWJzY3JpcHRpb25zKCkge1xuICAgIFB1YlN1Yi5zdWJzY3JpYmUoXCJwbGFjZS1zaGlwLWhvdmVyXCIsIChkYXRhKSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBnYXJyaXNvbi5jaGVja1ZhY2FuY3koZGF0YS50eXBlLCBkYXRhLmNvb3JkaW5hdGUsIGRhdGEub3JpZW50YXRpb24pO1xuICAgICAgICBQdWJTdWIucHVibGlzaChcInBsYWNlLXNoaXAtaG92ZXItcmVzdWx0XCIsIDEpO1xuICAgICAgfSBjYXRjaCB7XG4gICAgICAgIFB1YlN1Yi5wdWJsaXNoKFwicGxhY2Utc2hpcC1ob3Zlci1yZXN1bHRcIiwgMCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICoqICBQdWJsaXNoIEV2ZW50czpcbiAgICoqICAgIG5vbmVcbiAgICoqXG4gICAqKiAgU3Vic2NyaWJlIEV2ZW50czpcbiAgICoqICAgICBnYW1lLXN0YXJ0XG4gICAqKiAgICAgcGxheWVyLWF0dGFja1xuICAgKi9cbiAgZnVuY3Rpb24gaW5pdFRha2VUdXJuU3Vic2NyaXB0aW9ucygpIHtcbiAgICBQdWJTdWIuc3Vic2NyaWJlKFwiZ2FtZS1zdGFydFwiLCAoKSA9PiB7XG4gICAgICBQdWJTdWIuc3Vic2NyaWJlKFwicGxheWVyLWF0dGFja1wiLCAoZGF0YSkgPT4ge1xuICAgICAgICAvLyAgQ2hlY2sgdG8gc2VlIGlmIHRoZSBzcXVhcmUgaGFzIGFscmVhZHkgYmVlbiBhdHRhY2tlZFxuICAgICAgICBpZiAoYmF0dGxlUGxhbi5jaGVja01vdmUoZGF0YSkpIHtcbiAgICAgICAgICAvLyAgYXR0YWNrIGlzIHBvc3NpYmxlLCByZXNvbHZlIGJhdHRsZVBsYW4udHVyblByb21pc2VcbiAgICAgICAgICBiYXR0bGVQbGFuLnJlc29sdmVUdXJuUHJvbWlzZShkYXRhKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBpbml0RXZlbnRTdWJzY3JpcHRpb25zKCkge1xuICAgIGlmICh0eXBlID09PSBcImh1bWFuXCIpIHtcbiAgICAgIGluaXRTaGlwUGxhY2VtZW50U3Vic2NyaXB0aW9ucygpO1xuICAgICAgaW5pdFRha2VUdXJuU3Vic2NyaXB0aW9ucygpO1xuICAgIH1cbiAgfVxuXG4gIGluaXRFdmVudFN1YnNjcmlwdGlvbnMoKTtcblxuICByZXR1cm4ge1xuICAgIHRha2VNb3ZlLFxuICAgIHBsYWNlU2hpcHMsXG4gIH07XG59O1xuXG5leHBvcnQgZGVmYXVsdCBQbGF5ZXI7XG4iLCIvLyB1dGlsaXR5IGZ1bmN0aW9uIGZvciBwYXNzaW5nIGNvb3JkaW5hdGVzIHRvIGdhbWVib2FyZFxuLy8gICAgcGFzc0Nvb3JkKDIsOSkgcmV0dXJucyB7IHJvdzoyICwgY29sdW1uOjkgfVxuY29uc3QgcGFzc0Nvb3JkID0gKHJvdywgY29sdW1uKSA9PiAoeyByb3csIGNvbHVtbiB9KTtcblxuY29uc3QgcmFuZG9tID0gKCgpID0+IHtcbiAgLy8gVXNlZCBpbiByYW5kb21Nb3ZlXG4gIC8vIHJldHVybnMgYSByYW5kb20gY29vcmQgYmV0d2VlbiB7cm93OjAsIGNvbHVtbjowfSBhbmQge3Jvdzo5LCBjb2x1bW46OX1cbiAgZnVuY3Rpb24gY29vcmQoKSB7XG4gICAgY29uc3QgcmFuZG9tUm93ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTApO1xuICAgIGNvbnN0IHJhbmRvbUNvbHVtbiA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDEwKTtcbiAgICByZXR1cm4gcGFzc0Nvb3JkKHJhbmRvbVJvdywgcmFuZG9tQ29sdW1uKTtcbiAgfVxuXG4gIC8vIFVzZWQgaW4gcGxhY2VTaGlwc0F1dG9cbiAgLy8gZWl0aGVyIHJldHVybnMgXCJob3Jpem9udGFsXCIgb3IgXCJ2ZXJ0aWNhbFwiXG4gIGZ1bmN0aW9uIG9yaWVudGF0aW9uKCkge1xuICAgIGNvbnN0IHJhbmRvbUluZGV4ID0gTWF0aC5yb3VuZChNYXRoLnJhbmRvbSgpKTtcbiAgICBjb25zdCB2YWwgPSByYW5kb21JbmRleCA9PT0gMCA/IFwiaG9yaXpvbnRhbFwiIDogXCJ2ZXJ0aWNhbFwiO1xuICAgIHJldHVybiB2YWw7XG4gIH1cblxuICAvLyBVc2VkIGluIHJhbmRvbU1vdmVcbiAgLy8gcmV0dXJucyBhIGZ1bmN0aW9uIHdoaWNoIGNhbiBiZSBjYWxsZWQgKHdpdGhvdXQgcGFyYW1ldGVycylcbiAgLy8gIHRvIHJldHVybiBhIHJhbmRvbSBlbGVtZW50IGZyb210IGhlIG9yaWdpbmFsIHNldCBwYXJhbWV0ZXJcbiAgZnVuY3Rpb24gZnJvbVNldChzZXQpIHtcbiAgICBjb25zdCB7IGxlbmd0aCB9ID0gc2V0O1xuICAgIGNvbnN0IHBvc3NpYmxlQ29vcmRzID0gc2V0O1xuICAgIC8vIHN0b3JlIHdoaWNoIGluZGV4cyBoYXZlIGJlZW4gdXNlZCBzbyBmYXIsIHNvIHRoYXQgbm8gaW5kZXggaXMgcmV0dXJuZWQgdHdpY2VcbiAgICBjb25zdCB1c2VkSW5kZXhlcyA9IFtdO1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIGdldFJhbmRvbUNvb3JkRnJvbVNldCgpIHtcbiAgICAgIC8vIGlmIHdlIGhhdmUgdXNlZCB1cCBhbGwgcG9zc2libGUgaW5kZXhlcywgdGhyb3cgYW4gZXJyb3JcbiAgICAgIGlmICh1c2VkSW5kZXhlcy5sZW5ndGggPT09IHBvc3NpYmxlQ29vcmRzLmxlbmd0aCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJvdXQgb2YgY2hvaWNlc1wiKTtcbiAgICAgIH1cblxuICAgICAgLy8gY3JlYXRlIGEgcmFuZG9tIGluZGV4XG4gICAgICBsZXQgcmFuZG9taW5kZXggPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBsZW5ndGgpO1xuICAgICAgLy8gaWYgdGhlIGluZGV4IGhhcyBiZWVuIHVzZWQgYWxyZWFkeSwgY3JlYXRlIG1vcmUgdW50aWwgd2UgZmluZCBhbiB1bnVzZWQgb25lXG4gICAgICBpZiAodXNlZEluZGV4ZXMuaW5jbHVkZXMocmFuZG9taW5kZXgpKSB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMTAwOyBpICs9IDEpIHtcbiAgICAgICAgICByYW5kb21pbmRleCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGxlbmd0aCk7XG4gICAgICAgICAgaWYgKCF1c2VkSW5kZXhlcy5pbmNsdWRlcyhyYW5kb21pbmRleCkpIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdXNlZEluZGV4ZXMucHVzaChyYW5kb21pbmRleCk7XG4gICAgICAvLyByZXR1cm4gdGhlIGNvb3JkaW5hdGUgYXQgdGhlIGluZGV4IHdlIGhhdmUgZm91bmRcbiAgICAgIHJldHVybiBwb3NzaWJsZUNvb3Jkc1tyYW5kb21pbmRleF07XG4gICAgfTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgY29vcmQsXG4gICAgb3JpZW50YXRpb24sXG4gICAgZnJvbVNldCxcbiAgfTtcbn0pKCk7XG5cbmV4cG9ydCBkZWZhdWx0IHJhbmRvbTtcbiIsImltcG9ydCBzaGlwVHlwZXMgZnJvbSBcIi4vc2hpcHR5cGVzXCI7XG5cbmNvbnN0IFNoaXAgPSAodHlwZUluKSA9PiB7XG4gIGNvbnN0IHNoaXB0eXBlID0gdHlwZUluO1xuICBjb25zdCBsZW5ndGggPSBzaGlwVHlwZXNbc2hpcHR5cGVdO1xuICBsZXQgaGl0cyA9IDA7XG5cbiAgY29uc3QgaGl0ID0gKCkgPT4ge1xuICAgIGlmIChoaXRzIDwgbGVuZ3RoKSB7XG4gICAgICBoaXRzICs9IDE7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9O1xuXG4gIGNvbnN0IGlzU3VuayA9ICgpID0+IHtcbiAgICBpZiAoaGl0cyA9PT0gbGVuZ3RoKSByZXR1cm4gdHJ1ZTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH07XG5cbiAgcmV0dXJuIHtcbiAgICBoaXQsXG4gICAgaXNTdW5rLFxuICAgIGdldCB0eXBlKCkge1xuICAgICAgcmV0dXJuIHNoaXB0eXBlO1xuICAgIH0sXG4gIH07XG59O1xuXG5leHBvcnQgZGVmYXVsdCBTaGlwO1xuIiwiY29uc3Qgc2hpcFR5cGVzID0ge1xuICBjYXJyaWVyOiA1LFxuICBiYXR0bGVzaGlwOiA0LFxuICBkZXN0cm95ZXI6IDMsXG4gIHN1Ym1hcmluZTogMyxcbiAgcGF0cm9sYm9hdDogMixcbn07XG5cbmV4cG9ydCBkZWZhdWx0IHNoaXBUeXBlcztcbiIsImNvbnN0IG15QXJyYXkgPSAoc2l6ZUluLCBwb3B1bGF0b3IpID0+IHtcbiAgY29uc3Qgc2l6ZSA9IHNpemVJbjtcblxuICBjb25zdCBhcnJheTJEID0gKGZ1bmN0aW9uIGluaXRpYWxpemVBcnJheSgpIHtcbiAgICBjb25zdCBib2FyZE9iaiA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc2l6ZTsgaSArPSAxKSB7XG4gICAgICBib2FyZE9ialtpXSA9IEFycmF5LmZyb20oeyBsZW5ndGg6IHNpemUgfSk7XG4gICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHNpemU7IGogKz0gMSkge1xuICAgICAgICBib2FyZE9ialtpXVtqXSA9IHBvcHVsYXRvcigpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gYm9hcmRPYmo7XG4gIH0pKCk7XG5cbiAgLy8gbG93ZXIgb3JkZXIgZm4gZm9yIHBsYWNlU2hpcFxuICBhcnJheTJELmNoZWNrQ29vcmRpbmF0ZXMgPSAobGVuZ3RoLCBjb29yZGluYXRlLCBvcmllbnRhdGlvbikgPT4ge1xuICAgIC8vIGNoZWNrIGlmIHN0YXJ0aW5nIGNvb3JkaW5hdGUgaXMgdmFsaWRcbiAgICBpZiAoXG4gICAgICBjb29yZGluYXRlLnJvdyA8IDAgfHxcbiAgICAgIGNvb3JkaW5hdGUucm93ID4gc2l6ZSAtIDEgfHxcbiAgICAgIGNvb3JkaW5hdGUuY29sdW1uIDwgMCB8fFxuICAgICAgY29vcmRpbmF0ZS5jb2x1bW4gPiBzaXplIC0gMVxuICAgICkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ29vcmRpbmF0ZXMgYXJlIG91dHNpZGUgb2YgYm91bmRzXCIpO1xuICAgIH1cblxuICAgIC8vIGNoZWNrIGlmIHNoaXAgZml0cyB3aXRoaW4gYm91bmRzXG4gICAgaWYgKFxuICAgICAgKG9yaWVudGF0aW9uID09PSBcImhvcml6b250YWxcIiAmJiBjb29yZGluYXRlLmNvbHVtbiArIGxlbmd0aCA+IHNpemUpIHx8XG4gICAgICAob3JpZW50YXRpb24gPT09IFwidmVydGljYWxcIiAmJiBjb29yZGluYXRlLnJvdyArIGxlbmd0aCA+IHNpemUpXG4gICAgKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJPYmplY3QgZG9lcyBub3QgZml0XCIpO1xuICAgIH1cblxuICAgIC8vIGNoZWNrIGlmIGNvcnJlY3Qgb3JpZW50YXRpb24gd2FzIHBhc3NlZFxuICAgIGlmIChvcmllbnRhdGlvbiAhPT0gXCJob3Jpem9udGFsXCIgJiYgb3JpZW50YXRpb24gIT09IFwidmVydGljYWxcIikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiR2FyYmFnZSBpbnB1dHNcIik7XG4gICAgfVxuXG4gICAgLy8gTm8gZXJyb3JzLCBzbyByZXR1cm4gcmVzb3ZsZWQgcHJvbWlzZVxuICAgIHJldHVybiAwO1xuICB9O1xuXG4gIC8vIGxvd2VyIG9yZGVyIGZuIHdoaWNoIHRyYXZlcnNlcyB0aGUgYm9hcmQsIGFwcGxpZXMgdGhlIGNhbGxiYWNrIHRvIGVhY2ggc3F1YXJlXG4gIGFycmF5MkQudHJhdmVyc2VCb2FyZCA9IChsZW5ndGgsIGNvb3JkaW5hdGUsIG9yaWVudGF0aW9uLCBjYmspID0+IHtcbiAgICBsZXQgdHJhdmVyc2luZ1ZhcjtcbiAgICBsZXQgcm93O1xuICAgIGxldCBjb2x1bW47XG4gICAgaWYgKG9yaWVudGF0aW9uID09PSBcImhvcml6b250YWxcIikge1xuICAgICAgdHJhdmVyc2luZ1ZhciA9IHsgdmFsdWU6IGNvb3JkaW5hdGUuY29sdW1uIH07XG4gICAgICByb3cgPSB7IHZhbHVlOiBjb29yZGluYXRlLnJvdyB9O1xuICAgICAgY29sdW1uID0gdHJhdmVyc2luZ1ZhcjtcbiAgICB9IGVsc2Uge1xuICAgICAgdHJhdmVyc2luZ1ZhciA9IHsgdmFsdWU6IGNvb3JkaW5hdGUucm93IH07XG4gICAgICByb3cgPSB0cmF2ZXJzaW5nVmFyO1xuICAgICAgY29sdW1uID0geyB2YWx1ZTogY29vcmRpbmF0ZS5jb2x1bW4gfTtcbiAgICB9XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW5ndGg7IGkgKz0gMSkge1xuICAgICAgY2JrKGFycmF5MkRbcm93LnZhbHVlXVtjb2x1bW4udmFsdWVdKTtcbiAgICAgIHRyYXZlcnNpbmdWYXIudmFsdWUgKz0gMTtcbiAgICB9XG4gIH07XG5cbiAgLy8gQXBwbGllcyBhIGNhbGxiYWNrIHRvIGVsZW1lbnRzIGFkamFjZW50IHRvIGNvb3JkaW5hdGVcbiAgLy8gaWYgdGhlIGNhbGxiYWNrIHJldHVybnMgdHJ1ZSBvbiBhbnkgXCJjaGVja2VkXCIgZWxlbWVudCwgcmV0dXJucyB0cnVlXG4gIC8vICBlbHNlIHJldHVybnMgZmFsc2VcbiAgLy8gZGlyIHBhcmFtZXRlcjpcbiAgLy8gICAgdW5kZWZpbmVkOiBhbGwgZm91ciBhZGphY2VudCBlbGVtZW50cyBhcmUgY2hlY2tlZFxuICAvLyAgICBcImhvcml6b250YWxcIjogb25seSB0d28gaG9yaXpvbnRhbCBuZWlnaGJvcnMgYXJlIGNoZWNrZWRcbiAgLy8gICAgXCJ2ZXJ0aWNhbFwiOiBvbmx5IHR3byB2ZXJ0aWNhbCBuZWlnaGJvcnMgYXJlIGNoZWNrZWRcbiAgYXJyYXkyRC5jaGVja0FkamFjZW50ID0gKGNvb3JkaW5hdGUsIGNiaywgZGlyKSA9PiB7XG4gICAgY29uc3QgeyByb3cgfSA9IGNvb3JkaW5hdGU7XG4gICAgY29uc3QgeyBjb2x1bW4gfSA9IGNvb3JkaW5hdGU7XG4gICAgbGV0IHZhbCA9IGZhbHNlO1xuICAgIGZ1bmN0aW9uIGFjdGlvbihyLCBjKSB7XG4gICAgICB2YWwgPSB2YWwgfHwgY2JrKGFycmF5MkRbcl1bY10pO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIGRpciA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgaWYgKHJvdyAtIDEgPiAtMSkgYWN0aW9uKHJvdyAtIDEsIGNvbHVtbik7XG4gICAgICBpZiAocm93ICsgMSA8IHNpemUgLSAxKSBhY3Rpb24ocm93ICsgMSwgY29sdW1uKTtcbiAgICAgIGlmIChjb2x1bW4gLSAxID4gLTEpIGFjdGlvbihyb3csIGNvbHVtbiAtIDEpO1xuICAgICAgaWYgKGNvbHVtbiArIDEgPCBzaXplIC0gMSkgYWN0aW9uKHJvdywgY29sdW1uICsgMSk7XG4gICAgfSBlbHNlIGlmIChkaXIgPT09IFwiaG9yaXpvbnRhbFwiKSB7XG4gICAgICBpZiAoY29sdW1uIC0gMSA+IC0xKSBhY3Rpb24ocm93LCBjb2x1bW4gLSAxKTtcbiAgICAgIGlmIChjb2x1bW4gKyAxIDwgc2l6ZSAtIDEpIGFjdGlvbihyb3csIGNvbHVtbiArIDEpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAocm93IC0gMSA+IC0xKSBhY3Rpb24ocm93IC0gMSwgY29sdW1uKTtcbiAgICAgIGlmIChyb3cgKyAxIDwgc2l6ZSAtIDEpIGFjdGlvbihyb3cgKyAxLCBjb2x1bW4pO1xuICAgIH1cblxuICAgIHJldHVybiB2YWw7XG4gIH07XG5cbiAgLy8gQXBwbGllcyB0aGUgY2JrIHRvIGVhY2ggZWxlbWVudCBvZiB0aGUgYXJyYXlcbiAgLy8gIHJldHVybnMgdGhlIGluZGV4IChpbiBjb29yZCBmb3JtKSBvZiB0aGUgZmlyc3QgZWxlbWVudCBmb3Igd2hpY2ggY2JrIGV2YWx1YXRlcyB0byB0cnVlXG4gIGFycmF5MkQubGluZWFyU2VhcmNoID0gKGNiaywgbnRoTWF0Y2gpID0+IHtcbiAgICBsZXQgdGhpc01hdGNoID0gMDtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNpemU7IGkgKz0gMSkge1xuICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBzaXplOyBqICs9IDEpIHtcbiAgICAgICAgaWYgKGNiayhhcnJheTJEW2ldW2pdKSkge1xuICAgICAgICAgIGlmICh0aGlzTWF0Y2ggPT09IG50aE1hdGNoKSByZXR1cm4geyByb3c6IGksIGNvbHVtbjogaiB9O1xuICAgICAgICAgIHRoaXNNYXRjaCArPSAxO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfTtcblxuICAvLyBhcHBsaWVzIHRoZSBjYWxsYmFjayB0byBlYWNoIGVsZW1lbnQgaW4gdGhlIGFycmF5XG4gIGFycmF5MkQuYXBwbHlUb0VhY2ggPSAoY2JrKSA9PiB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzaXplOyBpICs9IDEpIHtcbiAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgc2l6ZTsgaiArPSAxKSB7XG4gICAgICAgIGNiayhhcnJheTJEW2ldW2pdKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgLy8gcmV0dXJucyB0aGUgY29vcmQgb2YgZWFjaCBlbGVtZW50IGZvciB3aGljaCB0aGUgY2FsbGJhY2sgZXZhbHVhdGVzIHRydWVcbiAgYXJyYXkyRC5lYWNoQ29vcmQgPSAoY2JrKSA9PiB7XG4gICAgY29uc3QgYXJyID0gW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzaXplOyBpICs9IDEpIHtcbiAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgc2l6ZTsgaiArPSAxKSB7XG4gICAgICAgIGlmIChjYmsoYXJyYXkyRFtpXVtqXSkpIHtcbiAgICAgICAgICBhcnIucHVzaCh7IHJvdzogaSwgY29sdW1uOiBqIH0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBhcnI7XG4gIH07XG5cbiAgYXJyYXkyRC5sYXN0SW5Sb3cgPSAoc3RhcnRpbmdDb29yZCwgY2JrKSA9PiB7XG4gICAgY29uc3QgeyByb3cgfSA9IHN0YXJ0aW5nQ29vcmQ7XG4gICAgY29uc3QgeyBjb2x1bW4gfSA9IHN0YXJ0aW5nQ29vcmQ7XG4gICAgbGV0IGNvbHVtblJlc3VsdCA9IGNvbHVtbjtcblxuICAgIGZvciAobGV0IGkgPSBjb2x1bW47IGkgPCBzaXplOyBpICs9IDEpIHtcbiAgICAgIGlmIChjYmsoYXJyYXkyRFtyb3ddW2ldKSkge1xuICAgICAgICBjb2x1bW5SZXN1bHQgPSBpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB7IHJvdywgY29sdW1uOiBjb2x1bW5SZXN1bHQgfTtcbiAgfTtcblxuICBhcnJheTJELmxhc3RJbkNvbHVtbiA9IChzdGFydGluZ0Nvb3JkLCBjYmspID0+IHtcbiAgICBjb25zdCB7IHJvdyB9ID0gc3RhcnRpbmdDb29yZDtcbiAgICBjb25zdCB7IGNvbHVtbiB9ID0gc3RhcnRpbmdDb29yZDtcbiAgICBsZXQgcm93UmVzdWx0ID0gcm93O1xuXG4gICAgZm9yIChsZXQgaSA9IHJvdzsgaSA8IHNpemU7IGkgKz0gMSkge1xuICAgICAgaWYgKGNiayhhcnJheTJEW2ldW2NvbHVtbl0pKSB7XG4gICAgICAgIHJvd1Jlc3VsdCA9IGk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHsgcm93OiByb3dSZXN1bHQsIGNvbHVtbiB9O1xuICB9O1xuXG4gIHJldHVybiBhcnJheTJEO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgbXlBcnJheTtcbiIsImNvbnN0IFB1YlN1YiA9ICgoKSA9PiB7XG4gIGxldCBzdWJzY3JpYmVycyA9IHt9O1xuXG4gIGZ1bmN0aW9uIHB1Ymxpc2goZXZlbnROYW1lLCBkYXRhKSB7XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KHN1YnNjcmliZXJzW2V2ZW50TmFtZV0pKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHN1YnNjcmliZXJzW2V2ZW50TmFtZV0uZm9yRWFjaCgoY2FsbGJhY2spID0+IHtcbiAgICAgIGNhbGxiYWNrKGRhdGEpO1xuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gc3Vic2NyaWJlKGV2ZW50TmFtZSwgY2FsbGJhY2spIHtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkoc3Vic2NyaWJlcnNbZXZlbnROYW1lXSkpIHtcbiAgICAgIHN1YnNjcmliZXJzW2V2ZW50TmFtZV0gPSBbXTtcbiAgICB9XG4gICAgc3Vic2NyaWJlcnNbZXZlbnROYW1lXS5wdXNoKGNhbGxiYWNrKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlc2V0KCkge1xuICAgIHN1YnNjcmliZXJzID0ge307XG4gIH1cblxuICByZXR1cm4ge1xuICAgIHB1Ymxpc2gsXG4gICAgc3Vic2NyaWJlLFxuICAgIHJlc2V0LFxuICB9O1xufSkoKTtcblxuZXhwb3J0IGRlZmF1bHQgUHViU3ViO1xuIiwiZnVuY3Rpb24gcmVtb3ZlQ2hpbGRyZW4oLi4uYXJncykge1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGFyZ3MubGVuZ3RoOyBpICs9IDEpIHtcbiAgICB3aGlsZSAoYXJnc1tpXS5maXJzdENoaWxkKSB7XG4gICAgICBhcmdzW2ldLnJlbW92ZUNoaWxkKGFyZ3NbaV0ubGFzdENoaWxkKTtcbiAgICB9XG4gIH1cbn1cbmV4cG9ydCBkZWZhdWx0IHJlbW92ZUNoaWxkcmVuO1xuIiwiY29uc3QgY29vcmRUb29scyA9ICgoKSA9PiB7XG4gIC8vICBVc2VkIHRvIGNyZWF0ZSBhbiBhcnJheSBvZiBjb29yZCBhcnJheXNcbiAgLy8gIGV4OiBnZXRjb29yZGluYXRlTGlzdCg0LCB7cm93OjAsIGNvbHVtbjowfSwgaG9yaXpvbnRhbClcbiAgLy8gICAgd2lsbCByZXR1cm46IFtbMCwwXSxbMCwxXSxbMCwyXSxbMCwzXV1cbiAgZnVuY3Rpb24gZ2V0Q29vcmRpbmF0ZUxpc3QobGVuZ3RoLCBjb29yZCwgb3JpKSB7XG4gICAgY29uc3QgY29vcmRzID0gW107XG4gICAgbGV0IHsgcm93IH0gPSBjb29yZDtcbiAgICBsZXQgeyBjb2x1bW4gfSA9IGNvb3JkO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgIGNvb3Jkcy5wdXNoKFtyb3csIGNvbHVtbl0pO1xuICAgICAgaWYgKG9yaSA9PT0gXCJob3Jpem9udGFsXCIpIHtcbiAgICAgICAgY29sdW1uICs9IDE7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByb3cgKz0gMTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGNvb3JkcztcbiAgfVxuXG4gIGZ1bmN0aW9uIGFsbENvb3JkcyhsZW5ndGgsIGNvb3JkLCBvcmkpIHtcbiAgICBjb25zdCBjb29yZHMgPSBbXTtcbiAgICBsZXQgeyByb3cgfSA9IGNvb3JkO1xuICAgIGxldCB7IGNvbHVtbiB9ID0gY29vcmQ7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW5ndGg7IGkgKz0gMSkge1xuICAgICAgY29vcmRzLnB1c2goeyByb3csIGNvbHVtbiB9KTtcbiAgICAgIGlmIChvcmkgPT09IFwiaG9yaXpvbnRhbFwiKSB7XG4gICAgICAgIGNvbHVtbiArPSAxO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcm93ICs9IDE7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBjb29yZHM7XG4gIH1cblxuICAvLyBVc2VkIGluIGdldEFsbFNlbGVjdG9yc1xuICAvLyAgaXMgcGFzc2VkIGFuIGFycmF5OiBbcm93LCBjb2x1bW5dXG4gIC8vICByZXR1cm5zIGEgY3NzIHNlbGVjdG9yXG4gIGZ1bmN0aW9uIG1ha2VTZWxlY3RvckZyb21BcnJheShjb29yZEFycikge1xuICAgIGNvbnN0IHJvdyA9IGNvb3JkQXJyWzBdO1xuICAgIGNvbnN0IGNvbHVtbiA9IGNvb3JkQXJyWzFdO1xuICAgIHJldHVybiBgLmdyaWQtc3F1YXJlW2RhdGEtcm93PVwiJHtyb3d9XCJdLmdyaWQtc3F1YXJlW2RhdGEtY29sdW1uPVwiJHtjb2x1bW59XCJdYDtcbiAgfVxuXG4gIC8vIEl0ZXJhdGVzIHRocm91Z2ggYW4gYXJyYXkgb2YgY29vcmQgYXJyYXlzLFxuICAvLyAgIHJldHVybnMgYSBjc3Mgc2VsZWN0b3Igd2hpY2ggd2lsbCBncmFiIGFsbCByZWxldmFudCBkb20gZWxlbWVudHNcbiAgZnVuY3Rpb24gZ2V0QWxsU2VsZWN0b3JzKGNvb3JkTGlzdCkge1xuICAgIGxldCBzZWxlY3RvciA9IG1ha2VTZWxlY3RvckZyb21BcnJheShjb29yZExpc3RbMF0pO1xuICAgIGNvbnN0IHsgbGVuZ3RoIH0gPSBjb29yZExpc3Q7XG4gICAgZm9yIChsZXQgaSA9IDE7IGkgPCBsZW5ndGg7IGkgKz0gMSkge1xuICAgICAgc2VsZWN0b3IgPSBgJHtzZWxlY3Rvcn0sJHttYWtlU2VsZWN0b3JGcm9tQXJyYXkoY29vcmRMaXN0W2ldKX1gO1xuICAgIH1cbiAgICByZXR1cm4gc2VsZWN0b3I7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIGdldENvb3JkaW5hdGVMaXN0LFxuICAgIG1ha2VTZWxlY3RvckZyb21BcnJheSxcbiAgICBnZXRBbGxTZWxlY3RvcnMsXG4gICAgYWxsQ29vcmRzLFxuICB9O1xufSkoKTtcblxuZXhwb3J0IGRlZmF1bHQgY29vcmRUb29scztcbiIsIi8vIEhlbHBlciBmdW5jdGlvbiBmb3IgcXVlcnlQbGFjZW1lbnRcbi8vIElucHV0IHBhcmFtZXRlciBlbGVtZW50IGlzIGV4cGVjdGVkIHRvIGJlIGEgXCJncmlkLXNxdWFyZVwiXG4vLyByZXR1cm5zIGNvb3JkaW5hdGUgb2JqZWN0IHdoaWNoIGNhbiBiZSB1c2VkIGJ5IHRoZSBwbGF5ZXIgb2JqZWN0XG5mdW5jdGlvbiBnZXRDb29yZEZyb21FbGVtZW50KGVsZW1lbnQpIHtcbiAgY29uc3Qgcm93ID0gTnVtYmVyKGVsZW1lbnQuZ2V0QXR0cmlidXRlKFwiZGF0YS1yb3dcIikpO1xuICBjb25zdCBjb2x1bW4gPSBOdW1iZXIoZWxlbWVudC5nZXRBdHRyaWJ1dGUoXCJkYXRhLWNvbHVtblwiKSk7XG4gIHJldHVybiB7IHJvdywgY29sdW1uIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGdldENvb3JkRnJvbUVsZW1lbnQ7XG4iLCJpbXBvcnQgUHViU3ViIGZyb20gXCIuLi91dGlsaXRpZXMvcHViU3ViXCI7XG5pbXBvcnQgZ2V0Q29vcmRGcm9tRWxlbWVudCBmcm9tIFwiLi9nZXRDb29yZEZyb21FbGVtZW50XCI7XG5pbXBvcnQgY29vcmRUb29scyBmcm9tIFwiLi9jb29yZFNlbGVjdG9yVG9vbHNcIjtcbmltcG9ydCBzaGlwVHlwZXMgZnJvbSBcIi4uL3NoaXAvc2hpcHR5cGVzXCI7XG5cbi8qICBGYWN0b3J5IGZ1bmN0aW9uXG4gKiogUmV0dXJucyBhIGNvbnRyb2xsZXIgdG8gaGFuZGxlIHRoZSBzaGlwIHBsYWNlbWVudCBjb250cm9sc1xuICoqIFVzZWQgaW4gZ2FtZVJlc2V0KCksIGdhbWVTdGFydCgpXG4gKipcbiAqL1xuZnVuY3Rpb24gU2hpcFBsYWNlQ29udHJvbHMoKSB7XG4gIGNvbnN0IGhvdmVyQ29udHJvbGxlciA9IG5ldyBBYm9ydENvbnRyb2xsZXIoKTtcbiAgY29uc3QgcGxhY2VDb250cm9sbGVyID0gbmV3IEFib3J0Q29udHJvbGxlcigpO1xuICBjb25zdCB3YXRlcnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmFsbGllZC13YXRlcnNcIik7XG4gIGxldCBjdXJyZW50U3F1YXJlO1xuICBsZXQgY3VycmVudFBsYWNlbWVudEluZm87XG4gIGNvbnN0IHNoaXBUeXBlc0FyciA9IFtcbiAgICBcImNhcnJpZXJcIixcbiAgICBcImJhdHRsZXNoaXBcIixcbiAgICBcImRlc3Ryb3llclwiLFxuICAgIFwic3VibWFyaW5lXCIsXG4gICAgXCJwYXRyb2xib2F0XCIsXG4gIF07XG4gIGxldCBjdXJyZW50U2hpcFBsYWNlbWVudCA9IDA7XG4gIGNvbnN0IGNvbnRyb2xEb21FbGVtZW50cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIucGxhY2Utc2hpcC1jb250cm9sXCIpO1xuICBjb25zdCBvcmllbnRhdGlvbnMgPSBbXCJob3Jpem9udGFsXCIsIFwidmVydGljYWxcIl07XG4gIGxldCBjdXJyZW50T3JpZW50YXRpb24gPSAwO1xuICBsZXQgcGxhY2VTaGlwTGF0Y2ggPSBmYWxzZTtcblxuICBmdW5jdGlvbiBkaXNwbGF5U2hpcFBsYWNlbWVudE1lc3NhZ2UoKSB7XG4gICAgaWYgKGN1cnJlbnRTaGlwUGxhY2VtZW50IDwgc2hpcFR5cGVzQXJyLmxlbmd0aCkge1xuICAgICAgY29uc3QgbWVzc2FnZSA9IGBQbGFjZSB5b3VyICR7c2hpcFR5cGVzQXJyW2N1cnJlbnRTaGlwUGxhY2VtZW50XX1gO1xuICAgICAgUHViU3ViLnB1Ymxpc2goXCJkaXNwbGF5LW1lc3NhZ2VcIiwgeyBtZXNzYWdlLCBkdXJhdGlvbjogZmFsc2UgfSk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gZGlzcGxheVBsYWNlbWVudFBvc3NpYmlsaXR5TWVzc2FnZShwb3NzaWJsZSkge1xuICAgIGxldCBtZXNzYWdlO1xuICAgIGlmIChwb3NzaWJsZSA9PT0gdHJ1ZSkge1xuICAgICAgbWVzc2FnZSA9IGAke3NoaXBUeXBlc0FycltjdXJyZW50U2hpcFBsYWNlbWVudF19IGNhbiBiZSBwbGFjZWQgaGVyZWA7XG4gICAgfSBlbHNlIHtcbiAgICAgIG1lc3NhZ2UgPSBgJHtzaGlwVHlwZXNBcnJbY3VycmVudFNoaXBQbGFjZW1lbnRdfSBkb2VzIG5vdCBmaXQgaGVyZWA7XG4gICAgfVxuICAgIFB1YlN1Yi5wdWJsaXNoKFwiZGlzcGxheS1tZXNzYWdlXCIsIHsgbWVzc2FnZSwgZHVyYXRpb246IDEwMDAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBjaGFuZ2VPcmllbnRhdGlvbkxpc3RlbmVyKCkge1xuICAgIGNvbnN0IGJ0biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwib3JpZW50YXRpb24tYnRuXCIpO1xuICAgIGNvbnN0IHsgc2lnbmFsIH0gPSBob3ZlckNvbnRyb2xsZXI7XG4gICAgYnRuLmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICBcImNsaWNrXCIsXG4gICAgICAoZSkgPT4ge1xuICAgICAgICBjdXJyZW50T3JpZW50YXRpb24gPSBjdXJyZW50T3JpZW50YXRpb24gPT09IDAgPyAxIDogMDtcbiAgICAgICAgZS50YXJnZXQuaW5uZXJUZXh0ID0gb3JpZW50YXRpb25zW2N1cnJlbnRPcmllbnRhdGlvbl07XG4gICAgICB9LFxuICAgICAgeyBzaWduYWwgfVxuICAgICk7XG4gIH1cblxuICAvLyBIZWxwZXIgZnVuY3Rpb24gdXNlZCBpbiBxdWVyeVBsYWNlbWVudCwgaW5pdFxuICAvLyBUdXJucyBvZmYgXCJpbnZhbGlkLXBsYWNlbWVudFwiLCBcInZhbGlkLXBsYWNlbWVudFwiIGNsYXNzZXMsIGlmIHRoZXkgZXhpc3RcbiAgZnVuY3Rpb24gcmVtb3ZlU2hpcFBsYWNlbWVudEluZGljYXRpb25zKCkge1xuICAgIGNvbnN0IGVsZW1lbnRzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcbiAgICAgIFwiLmludmFsaWQtcGxhY2VtZW50LC52YWxpZC1wbGFjZW1lbnRcIlxuICAgICk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBlbGVtZW50cy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgZWxlbWVudHNbaV0uY2xhc3NMaXN0LnJlbW92ZShcImludmFsaWQtcGxhY2VtZW50XCIsIFwidmFsaWQtcGxhY2VtZW50XCIpO1xuICAgIH1cbiAgfVxuXG4gIC8vIENoZWNrIHRvIHNlZSBpZiBwbGFjZW1lbnQgaXMgcG9zc2libGVcbiAgLy8gdGhpcyBpcyBnb2luZyB0byBwdWJsaXNoIFwicGxhY2Utc2hpcC1ob3ZlclwiXG4gIGZ1bmN0aW9uIHF1ZXJ5UGxhY2VtZW50KGUpIHtcbiAgICByZW1vdmVTaGlwUGxhY2VtZW50SW5kaWNhdGlvbnMoKTtcbiAgICBjdXJyZW50U3F1YXJlID0gZS5jdXJyZW50VGFyZ2V0O1xuICAgIGNvbnN0IGNvb3JkaW5hdGUgPSBnZXRDb29yZEZyb21FbGVtZW50KGN1cnJlbnRTcXVhcmUpO1xuICAgIGNvbnN0IHR5cGUgPSBzaGlwVHlwZXNBcnJbY3VycmVudFNoaXBQbGFjZW1lbnRdO1xuICAgIGNvbnN0IG9yaWVudGF0aW9uID0gb3JpZW50YXRpb25zW2N1cnJlbnRPcmllbnRhdGlvbl07XG4gICAgY3VycmVudFBsYWNlbWVudEluZm8gPSB7IHR5cGUsIGNvb3JkaW5hdGUsIG9yaWVudGF0aW9uIH07XG4gICAgUHViU3ViLnB1Ymxpc2goXCJwbGFjZS1zaGlwLWhvdmVyXCIsIGN1cnJlbnRQbGFjZW1lbnRJbmZvKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNldENsYXNzT25TcXVhcmVzKHBsYWNlbWVudCwgY2xhc3NJbikge1xuICAgIGNvbnN0IGxlbmd0aCA9IHNoaXBUeXBlc1twbGFjZW1lbnQudHlwZV07XG4gICAgY29uc3QgeyBvcmllbnRhdGlvbiB9ID0gcGxhY2VtZW50O1xuICAgIGNvbnN0IHsgY29vcmRpbmF0ZSB9ID0gcGxhY2VtZW50O1xuICAgIGNvbnN0IGNvb3JkTGlzdCA9IGNvb3JkVG9vbHMuZ2V0Q29vcmRpbmF0ZUxpc3QoXG4gICAgICBsZW5ndGgsXG4gICAgICBjb29yZGluYXRlLFxuICAgICAgb3JpZW50YXRpb25cbiAgICApO1xuICAgIGNvbnN0IHNlbGVjdG9yID0gY29vcmRUb29scy5nZXRBbGxTZWxlY3RvcnMoY29vcmRMaXN0KTtcbiAgICBjb25zdCBkb21FbGVtZW50cyA9IHdhdGVycy5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGRvbUVsZW1lbnRzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICBkb21FbGVtZW50c1tpXS5jbGFzc0xpc3QuYWRkKGNsYXNzSW4pO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGRpc3BsYXlTdGF0dXMoc3RhdHVzKSB7XG4gICAgaWYgKHN0YXR1cyA9PT0gXCJwbGFjZWRcIikge1xuICAgICAgc2V0Q2xhc3NPblNxdWFyZXMoY3VycmVudFBsYWNlbWVudEluZm8sIFwib2NjdXBpZWRcIik7XG4gICAgfSBlbHNlIGlmIChzdGF0dXMgPT09IFwicXVlcnlcIikge1xuICAgICAgc2V0Q2xhc3NPblNxdWFyZXMoY3VycmVudFBsYWNlbWVudEluZm8sIFwidmFsaWQtcGxhY2VtZW50XCIpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHNob3dQb3NzaWJpbGl0eShwb3NzaWJsZSkge1xuICAgIGNvbnN0IGJ0biA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXG4gICAgICBcIi5wbGFjZS1zaGlwLWNvbnRyb2w6bm90KC5kaXNwbGF5LWRpc2FibGVkKVwiXG4gICAgKTtcbiAgICBpZiAocG9zc2libGUpIHtcbiAgICAgIC8vIFBsYWNlbWVudCB3b3Jrc1xuICAgICAgYnRuLmNsYXNzTGlzdC5yZW1vdmUoXCJidG4tZGlzYWJsZWRcIik7XG4gICAgICBkaXNwbGF5UGxhY2VtZW50UG9zc2liaWxpdHlNZXNzYWdlKHRydWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBQbGFjZW1lbnQgZG9lc250IHdvcmtcbiAgICAgIGJ0bi5jbGFzc0xpc3QuYWRkKFwiYnRuLWRpc2FibGVkXCIpO1xuICAgICAgZGlzcGxheVBsYWNlbWVudFBvc3NpYmlsaXR5TWVzc2FnZShmYWxzZSk7XG4gICAgfVxuICB9XG5cbiAgLy8gQ2FsbGVkIG9uY2UsIGluIGluaXQgbWV0aG9kXG4gIC8vIHNldHMgdXAgc3Vic2NyaXB0aW9uIGZvciBcInBsYWNlLXNoaXAtaG92ZXItcmVzdWx0XCJcbiAgZnVuY3Rpb24gZGlzcGxheVBvc3NpYmlsaXR5KCkge1xuICAgIFB1YlN1Yi5zdWJzY3JpYmUoXCJwbGFjZS1zaGlwLWhvdmVyLXJlc3VsdFwiLCAocmVzdWx0KSA9PiB7XG4gICAgICBpZiAocmVzdWx0KSB7XG4gICAgICAgIGRpc3BsYXlTdGF0dXMoXCJxdWVyeVwiKTtcbiAgICAgICAgcGxhY2VTaGlwTGF0Y2ggPSB0cnVlO1xuICAgICAgICBzaG93UG9zc2liaWxpdHkodHJ1ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwbGFjZVNoaXBMYXRjaCA9IGZhbHNlO1xuICAgICAgICBjdXJyZW50U3F1YXJlLmNsYXNzTGlzdC5hZGQoXCJpbnZhbGlkLXBsYWNlbWVudFwiKTtcbiAgICAgICAgc2hvd1Bvc3NpYmlsaXR5KGZhbHNlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGVuYWJsZVZpZXcoKSB7XG4gICAgY29uc3QgZWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicGxhY2VtZW50LWNvbnRyb2xzXCIpO1xuICAgIGVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcImRpc3BsYXktZGlzYWJsZWRcIiwgXCJvcGFjaXR5LXplcm9cIik7XG4gICAgdXBkYXRlUGxhY2VTaGlwQ29udHJvbHNWaWV3KCk7XG4gIH1cblxuICBmdW5jdGlvbiBkaXNhYmxlVmlldygpIHtcbiAgICBjb25zdCBlbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwbGFjZW1lbnQtY29udHJvbHNcIik7XG4gICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKFwib3BhY2l0eS16ZXJvXCIpO1xuICAgIHNldFRpbWVvdXQoKCkgPT4gZWxlbWVudC5jbGFzc0xpc3QuYWRkKFwiZGlzcGxheS1kaXNhYmxlZFwiKSwgMTAwMCk7XG4gIH1cblxuICAvLyBVc2VkIGluIHBsYWNlU2hpcExpc3RlbmVyXG4gIC8vIFVwZGF0ZXMgdGhlIHZpZXcgdG8gc2hvdyB3aGljaCBjb250cm9scyBhcmUgY3VycmVudGx5IHJlbGV2YW50XG4gIC8vICAgIENoYW5nZXMgd2hpY2ggc2hpcCBpcyBiZWluZyBzaG93biBpbiBjb250cm9sc1xuICAvLyAgICBSZW1vdmVzIHRoZSBjb250cm9scyBlbnRpcmVseSB3aGVuIGFsbCBzaGlwcyBhcmUgcGxhY2VkXG4gIGZ1bmN0aW9uIHVwZGF0ZVBsYWNlU2hpcENvbnRyb2xzVmlldygpIHtcbiAgICBjb25zdCB7IHNpZ25hbCB9ID0gcGxhY2VDb250cm9sbGVyO1xuICAgIGlmIChjdXJyZW50U2hpcFBsYWNlbWVudCA8IGNvbnRyb2xEb21FbGVtZW50cy5sZW5ndGgpIHtcbiAgICAgIC8vIERpc2FibGUgZGlzcGxheSBvZiBhbGwgcGxhY2Utc2hpcC1idXR0b25zXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvbnRyb2xEb21FbGVtZW50cy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICBjb250cm9sRG9tRWxlbWVudHNbaV0uY2xhc3NMaXN0LmFkZChcImRpc3BsYXktZGlzYWJsZWRcIik7XG4gICAgICAgIGNvbnRyb2xEb21FbGVtZW50c1tpXS5jbGFzc0xpc3QucmVtb3ZlKFwicGxhY2UtYnV0dG9uLWVuYWJsZWRcIik7XG4gICAgICB9XG4gICAgICAvLyBFbmFibGUgZGlzcGxheSBvZiBvbmx5IHRoZSBjdXJyZW50IHBsYWNlLXNoaXAtYnV0dG9uXG4gICAgICBjb250cm9sRG9tRWxlbWVudHNbY3VycmVudFNoaXBQbGFjZW1lbnRdLmNsYXNzTGlzdC5yZW1vdmUoXG4gICAgICAgIFwiZGlzcGxheS1kaXNhYmxlZFwiXG4gICAgICApO1xuICAgICAgLy8gQWRkIGV2ZW50IGxpc3RlbmVyIGZvciBzaGlwIHBsYWNlbWVudFxuICAgICAgY29udHJvbERvbUVsZW1lbnRzW2N1cnJlbnRTaGlwUGxhY2VtZW50XS5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgICBcImNsaWNrXCIsXG4gICAgICAgICgpID0+IHtcbiAgICAgICAgICBpZiAocGxhY2VTaGlwTGF0Y2gpIHtcbiAgICAgICAgICAgIHBsYWNlU2hpcExhdGNoID0gZmFsc2U7XG4gICAgICAgICAgICBQdWJTdWIucHVibGlzaChcbiAgICAgICAgICAgICAgYHBsYWNlLSR7c2hpcFR5cGVzQXJyW2N1cnJlbnRTaGlwUGxhY2VtZW50XX1gLFxuICAgICAgICAgICAgICBjdXJyZW50UGxhY2VtZW50SW5mb1xuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGN1cnJlbnRTaGlwUGxhY2VtZW50ICs9IDE7XG4gICAgICAgICAgICBkaXNwbGF5U3RhdHVzKFwicGxhY2VkXCIpO1xuICAgICAgICAgICAgdXBkYXRlUGxhY2VTaGlwQ29udHJvbHNWaWV3KCk7XG4gICAgICAgICAgICBkaXNwbGF5U2hpcFBsYWNlbWVudE1lc3NhZ2UoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHsgc2lnbmFsIH1cbiAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGRpc2FibGVWaWV3KCk7XG4gICAgfVxuICB9XG5cbiAgLy8gRGlzYWJsZXMgdGhlIGV2ZW50IGxpc3RlbmVycyBhc3NvY2FpdGVkIHdpdGggdGhlIHNoaXAgcGxhY2VtZW50IGNvbnRyb2xzXG4gIGZ1bmN0aW9uIGRpc2FibGUoKSB7XG4gICAgaG92ZXJDb250cm9sbGVyLmFib3J0KCk7XG4gICAgcGxhY2VDb250cm9sbGVyLmFib3J0KCk7XG4gIH1cblxuICAvLyBJbml0aWFsaXplcyB0aGUgY29udHJvbHNcbiAgLy8gU3Vic2NyaWJlcyB0byBnYW1lLXN0YXJ0IGV2ZW50IChpbnNpZGUgb2YgcGxhY2VTaGlwQ2FuY2VsZXIoKSksXG4gIC8vICB3aGljaCB0aGVuIGhhbmRsZXMgZGlzYWJsaW5nIHRoZSBjb250cm9sc1xuICBmdW5jdGlvbiBpbml0KCkge1xuICAgIGVuYWJsZVZpZXcoKTtcbiAgICBkaXNwbGF5UG9zc2liaWxpdHkoKTtcbiAgICBjaGFuZ2VPcmllbnRhdGlvbkxpc3RlbmVyKCk7XG4gICAgZGlzcGxheVNoaXBQbGFjZW1lbnRNZXNzYWdlKCk7XG4gIH1cblxuICAvLyBQYXNzZWQgdG8gaW5pdEdyaWQgdG8gc2V0IHVwIHNoaXBQbGFjZW1lbnQgZXZlbnRsaXN0ZW5lcnNcbiAgZnVuY3Rpb24gcXVlcnkoKSB7XG4gICAgcmV0dXJuIHsgY2JrOiBxdWVyeVBsYWNlbWVudCwgc2lnbmFsOiBob3ZlckNvbnRyb2xsZXIuc2lnbmFsIH07XG4gIH1cblxuICByZXR1cm4ge1xuICAgIGluaXQsXG4gICAgcXVlcnksXG4gICAgZGlzYWJsZSxcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgU2hpcFBsYWNlQ29udHJvbHM7XG4iLCJpbXBvcnQgUHViU3ViIGZyb20gXCIuLi91dGlsaXRpZXMvcHViU3ViXCI7XG5pbXBvcnQgZ2V0Q29vcmRGcm9tRWxlbWVudCBmcm9tIFwiLi9nZXRDb29yZEZyb21FbGVtZW50XCI7XG5cbmZ1bmN0aW9uIGF0dGFja1ZpYURvbShlKSB7XG4gIGNvbnN0IHRhcmdldCA9IGUuY3VycmVudFRhcmdldDtcbiAgY29uc3QgY29vcmQgPSBnZXRDb29yZEZyb21FbGVtZW50KHRhcmdldCk7XG4gIFB1YlN1Yi5wdWJsaXNoKFwicGxheWVyLWF0dGFja1wiLCBjb29yZCk7XG59XG5cbmZ1bmN0aW9uIHR1cm5Db250cm9scygpIHtcbiAgY29uc3QgZW5lbXlXYXRlcnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmVuZW15LXdhdGVyc1wiKTtcbiAgY29uc3Qgc3F1YXJlcyA9IGVuZW15V2F0ZXJzLnF1ZXJ5U2VsZWN0b3JBbGwoXCIuZ3JpZC1zcXVhcmVcIik7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgc3F1YXJlcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgIHNxdWFyZXNbaV0uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIChlKSA9PiB7XG4gICAgICBhdHRhY2tWaWFEb20oZSk7XG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4ge307XG59XG5cbmV4cG9ydCBkZWZhdWx0IHR1cm5Db250cm9scztcbiIsImltcG9ydCBQdWJTdWIgZnJvbSBcIi4uL3V0aWxpdGllcy9wdWJTdWJcIjtcbmltcG9ydCByZW1vdmVDaGlsZHJlbiBmcm9tIFwiLi4vdXRpbGl0aWVzL3JlbW92ZUNoaWxkcmVuXCI7XG5pbXBvcnQgR2FtZUxvb3AgZnJvbSBcIi4uL2dhbWVsb29wL2dhbWVsb29wXCI7XG5pbXBvcnQgU2hpcFBsYWNlQ29udHJvbHMgZnJvbSBcIi4vc2hpcFBsYWNlQ29udHJvbHNcIjtcbmltcG9ydCB0dXJuQ29udHJvbHMgZnJvbSBcIi4vdGFrZVR1cm5Db250cm9sc1wiO1xuaW1wb3J0IGNvb3JkVG9vbHMgZnJvbSBcIi4vY29vcmRTZWxlY3RvclRvb2xzXCI7XG5pbXBvcnQgc2hpcFR5cGVzIGZyb20gXCIuLi9zaGlwL3NoaXB0eXBlc1wiO1xuaW1wb3J0IFwiLi9zdHlsZS9jc3MtcmVzZXQuY3NzXCI7XG5pbXBvcnQgXCIuL3N0eWxlL2luZGV4LmNzc1wiO1xuXG4vKipcbiAqKiAgUHVibGlzaCBFdmVudHM6XG4gKiogICAgcGxhY2UtY2FycmllciwgcGxhY2UtYmF0dGxlc2hpcCwgcGxhY2UtZGVzdHJveWVyLCBwbGFjZS1zdWJtYXJpbmUsIHBsYWNlLXBhdHJvbGJvYXRcbiAqKiAgICBwbGFjZS1zaGlwLWhvdmVyXG4gKiogICAgcGxheWVyLWF0dGFja1xuICoqICAgIHBsYXllci1hdHRhY2staG92ZXJcbiAqKlxuICoqICBTdWJzY3JpYmUgRXZlbnRzOlxuICoqICAgIHBsYWNlLXNoaXAtaG92ZXItcmVzdWx0XG4gKiogICAgZ2FtZS1yZXNldFxuICoqICAgIGdhbWUtc3RhcnRcbiAqKiAgICBnYW1lLXdvblxuICoqICAgIHBsYXllci1hdHRhY2staG92ZXItcmVzdWx0XG4gKiogICAgZW5lbXktYXR0YWNrLXJlc3VsdFxuICoqICAgIHBsYXllci1hdHRhY2stcmVzdWx0XG4gKi9cblxuY29uc3QgdmlldyA9ICgoKSA9PiB7XG4gIGNvbnN0IHdhdGVycyA9IFtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmFsbGllZC13YXRlcnNcIiksXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5lbmVteS13YXRlcnNcIiksXG4gIF07XG4gIGNvbnN0IG1lc3NhZ2VPbmUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm1lc3NhZ2Utb25lXCIpO1xuICBjb25zdCBtZXNzYWdlVHdvID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtZXNzYWdlLXR3b1wiKTtcbiAgY29uc3QgcmVzZXRCdG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJlc2V0LWJ0blwiKTtcblxuICBmdW5jdGlvbiBpbml0R3JpZChkb21FbGVtZW50LCBzaXplLCBDQkspIHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNpemU7IGkgKz0gMSkge1xuICAgICAgY29uc3Qgcm93ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgIHJvdy5jbGFzc0xpc3QuYWRkKFwiZ3JpZC1yb3dcIik7XG4gICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHNpemU7IGogKz0gMSkge1xuICAgICAgICBjb25zdCBzcXVhcmUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICBzcXVhcmUuY2xhc3NMaXN0LmFkZChcImdyaWQtc3F1YXJlXCIpO1xuICAgICAgICBzcXVhcmUuc2V0QXR0cmlidXRlKFwiZGF0YS1yb3dcIiwgaSk7XG4gICAgICAgIHNxdWFyZS5zZXRBdHRyaWJ1dGUoXCJkYXRhLWNvbHVtblwiLCBqKTtcbiAgICAgICAgaWYgKENCSykge1xuICAgICAgICAgIHNxdWFyZS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKGUpID0+IENCSy5jYmsoZSksIHtcbiAgICAgICAgICAgIHNpZ25hbDogQ0JLLnNpZ25hbCxcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByb3cuYXBwZW5kQ2hpbGQoc3F1YXJlKTtcbiAgICAgIH1cbiAgICAgIGRvbUVsZW1lbnQuYXBwZW5kQ2hpbGQocm93KTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiByZW1vdmVNZXNzYWdlKGVsZW1lbnQpIHtcbiAgICB0cnkge1xuICAgICAgZWxlbWVudC5yZW1vdmVDaGlsZChlbGVtZW50LmZpcnN0Q2hpbGQpO1xuICAgIH0gY2F0Y2gge1xuICAgICAgLyogbm8gdGV4dCBub2RlIHRvIHJlbW92ZSAqL1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGRpc3BsYXlNZXNzYWdlKG1lc3NhZ2UsIG9wdGlvbmFsRHVyYXRpb24pIHtcbiAgICBjb25zdCB0ZXh0bm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKG1lc3NhZ2UpO1xuICAgIGlmIChtZXNzYWdlID09PSBcIlwiKSB7XG4gICAgICByZW1vdmVNZXNzYWdlKG1lc3NhZ2VPbmUpO1xuICAgICAgcmVtb3ZlTWVzc2FnZShtZXNzYWdlVHdvKTtcbiAgICB9IGVsc2UgaWYgKG9wdGlvbmFsRHVyYXRpb24pIHtcbiAgICAgIHJlbW92ZU1lc3NhZ2UobWVzc2FnZVR3byk7XG4gICAgICBtZXNzYWdlVHdvLmNsYXNzTGlzdC5yZW1vdmUoXCJvcGFjaXR5LXplcm9cIik7XG4gICAgICBtZXNzYWdlVHdvLmFwcGVuZENoaWxkKHRleHRub2RlKTtcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBpZiAobWVzc2FnZVR3by5maXJzdENoaWxkID09PSB0ZXh0bm9kZSkge1xuICAgICAgICAgIG1lc3NhZ2VUd28uY2xhc3NMaXN0LmFkZChcIm9wYWNpdHktemVyb1wiKTtcbiAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgIG1lc3NhZ2VUd28ucmVtb3ZlQ2hpbGQodGV4dG5vZGUpO1xuICAgICAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICAgIC8qICovXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBtZXNzYWdlVHdvLmNsYXNzTGlzdC5yZW1vdmUoXCJvcGFjaXR5LXplcm9cIik7XG4gICAgICAgICAgfSwgNTAwKTtcbiAgICAgICAgfVxuICAgICAgfSwgb3B0aW9uYWxEdXJhdGlvbik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlbW92ZU1lc3NhZ2UobWVzc2FnZU9uZSk7XG4gICAgICBtZXNzYWdlT25lLmFwcGVuZENoaWxkKHRleHRub2RlKTtcbiAgICB9XG4gIH1cblxuICAvLyAgU2hpZnRzIGJvYXJkcyB1cCBpZiBkaXJlY3Rpb24gPT09IHRydWVcbiAgLy8gIFNoaWZ0cyBib2FyZHMgZG93biBpZiBkaXJlY3Rpb24gPT09IGZhbHNlXG4gIGZ1bmN0aW9uIHNoaWZ0KGRpcmVjdGlvbikge1xuICAgIGlmIChkaXJlY3Rpb24gPT09IHRydWUpIHtcbiAgICAgIHdhdGVyc1swXS5jbGFzc0xpc3QuYWRkKFwiYm9hcmQtc2hpZnRcIik7XG4gICAgICB3YXRlcnNbMV0uY2xhc3NMaXN0LmFkZChcImJvYXJkLXNoaWZ0XCIpO1xuICAgIH0gZWxzZSB7XG4gICAgICB3YXRlcnNbMF0uY2xhc3NMaXN0LnJlbW92ZShcImJvYXJkLXNoaWZ0XCIpO1xuICAgICAgd2F0ZXJzWzFdLmNsYXNzTGlzdC5yZW1vdmUoXCJib2FyZC1zaGlmdFwiKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBkaXNwbGF5U3Vua1NoaXAodmljdGltLCBncmF2ZXlhcmQsIHR5cGUpIHtcbiAgICBjb25zdCBtZXNzYWdlID0gYCR7dmljdGltfSBwbGF5ZXIncyAke3R5cGV9IHdhcyBkZXN0cm95ZWRgO1xuICAgIGNvbnN0IHsgbGVuZ3RoIH0gPSBncmF2ZXlhcmQ7XG4gICAgY29uc3QgeyBjb29yZGluYXRlIH0gPSBncmF2ZXlhcmQ7XG4gICAgY29uc3QgeyBvcmllbnRhdGlvbiB9ID0gZ3JhdmV5YXJkO1xuICAgIGNvbnN0IGNvb3JkTGlzdCA9IGNvb3JkVG9vbHMuZ2V0Q29vcmRpbmF0ZUxpc3QoXG4gICAgICBsZW5ndGgsXG4gICAgICBjb29yZGluYXRlLFxuICAgICAgb3JpZW50YXRpb25cbiAgICApO1xuICAgIGNvbnN0IHNlbGVjdG9yID0gY29vcmRUb29scy5nZXRBbGxTZWxlY3RvcnMoY29vcmRMaXN0KTtcbiAgICBjb25zdCBib2FyZCA9IHZpY3RpbSA9PT0gXCJodW1hblwiID8gd2F0ZXJzWzBdIDogd2F0ZXJzWzFdO1xuICAgIGNvbnN0IGVsZW1lbnRzID0gYm9hcmQucXVlcnlTZWxlY3RvckFsbChzZWxlY3Rvcik7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBlbGVtZW50cy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgZWxlbWVudHNbaV0uY2xhc3NMaXN0LmFkZChcImV4cGxvZGVkXCIpO1xuICAgIH1cbiAgICBkaXNwbGF5TWVzc2FnZShtZXNzYWdlLCAzMDAwKTtcbiAgfVxuXG4gIC8vIFVzZWQgaW4gZ2V0QWxsU2VsZWN0b3JzXG4gIC8vICBpcyBwYXNzZWQgYW4gYXJyYXk6IFtyb3csIGNvbHVtbl1cbiAgLy8gIHJldHVybnMgYSBjc3Mgc2VsZWN0b3JcbiAgZnVuY3Rpb24gbWFrZVNlbGVjdG9yRnJvbUNvb3JkKGNvb3JkKSB7XG4gICAgY29uc3QgeyByb3cgfSA9IGNvb3JkO1xuICAgIGNvbnN0IHsgY29sdW1uIH0gPSBjb29yZDtcbiAgICByZXR1cm4gYC5ncmlkLXNxdWFyZVtkYXRhLXJvdz1cIiR7cm93fVwiXS5ncmlkLXNxdWFyZVtkYXRhLWNvbHVtbj1cIiR7Y29sdW1ufVwiXWA7XG4gIH1cblxuICAvLyBGdW5jdGlvbi1yZXR1cm5pbmcgZnVuY3Rpb24gdG8gYWRkIFwiYm9hcmRcIiBjbG9zdXJlXG4gIC8vICByZXR1cm5lZCBcImRpc3BsYXlBdHRhY2tSZXN1bHRcIiBmdW5jdGlvbjpcbiAgLy8gICAgaGFwcGVucyBvbiBcImVuZW15LWF0dGFjay1yZXN1bHRcIiBvciBcInBsYXllci1hdHRhY2stcmVzdWx0XCIgZXZlbnRcbiAgLy8gICAgdXBkYXRlcyB0aGUgRE9NIHRvIGRpc3BsYXkgdGhlIHJlc3VsdCBvZiBhbiBhdHRhY2tcbiAgZnVuY3Rpb24gYXR0YWNrUmVzdWx0KHBsYXllcikge1xuICAgIGNvbnN0IGJvYXJkID0gcGxheWVyID09PSBcImh1bWFuXCIgPyB3YXRlcnNbMV0gOiB3YXRlcnNbMF07XG4gICAgcmV0dXJuIGZ1bmN0aW9uIGRpc3BsYXlBdHRhY2tSZXN1bHQocGF5bG9hZCkge1xuICAgICAgY29uc3Qgc2VsZWN0b3IgPSBtYWtlU2VsZWN0b3JGcm9tQ29vcmQocGF5bG9hZC5jb29yZCk7XG4gICAgICBjb25zdCBncmlkU3F1YXJlID0gYm9hcmQucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7XG4gICAgICBjb25zdCBhZGRDbGFzcyA9IHBheWxvYWQuaGl0ID09PSB0cnVlID8gXCJoaXRcIiA6IFwibWlzc1wiO1xuICAgICAgaWYgKHBheWxvYWQuc3Vuaykge1xuICAgICAgICBjb25zdCB2aWN0aW0gPSBwbGF5ZXIgPT09IFwiaHVtYW5cIiA/IFwiY29tcHV0ZXJcIiA6IFwiaHVtYW5cIjtcbiAgICAgICAgZGlzcGxheVN1bmtTaGlwKHZpY3RpbSwgcGF5bG9hZC5ncmF2ZXlhcmQsIHBheWxvYWQudHlwZSk7XG4gICAgICB9XG4gICAgICBncmlkU3F1YXJlLmNsYXNzTGlzdC5hZGQoYWRkQ2xhc3MpO1xuICAgIH07XG4gIH1cblxuICAvLyBBc3luY2hyb25vdXMgY2FsbGJhY2tcbiAgLy8gSGFwcGVucyBvbiBcImdhbWUtd29uXCIgc3Vic2NyaWJlIGV2ZW50XG4gIC8vIEVuZHMgdGhlIFwiVHVybiBibG9ja1wiLCBkaXNwbGF5cyB0aGUgd2lubmVyXG4gIGZ1bmN0aW9uIGdhbWVDb21wbGV0ZSh3aW5uZXIpIHtcbiAgICBsZXQgbWVzc2FnZTtcbiAgICBpZiAod2lubmVyID09PSBcImh1bWFuXCIpIHtcbiAgICAgIG1lc3NhZ2UgPSBgVklDVE9SWWA7XG4gICAgfSBlbHNlIHtcbiAgICAgIG1lc3NhZ2UgPSBgWU9VIExPU0VgO1xuICAgIH1cbiAgICBkaXNwbGF5TWVzc2FnZShtZXNzYWdlKTtcbiAgICByZXNldEJ0bi5jbGFzc0xpc3QucmVtb3ZlKFwiZGlzcGxheS1kaXNhYmxlZFwiKTtcbiAgfVxuXG4gIC8vIEFzeW5jaHJvbm91cyBjYWxsYmFja1xuICAvLyBIYXBwZW5zIG9uIFwiZ2FtZS1zdGFydFwiIHN1YnNjcmliZSBldmVudFxuICAvLyBQcmVwYXJlcyB0aGUgdmlldyBmb3IgdGhlIFwiVHVybiBibG9ja1wiIG9mIHRoZSBnYW1lIGxvb3BcbiAgZnVuY3Rpb24gZ2FtZVN0YXJ0KCkge1xuICAgIHNoaWZ0KGZhbHNlKTtcbiAgICBkaXNwbGF5TWVzc2FnZShcIlwiKTtcbiAgICAvLyBUdXJuIG9mZiBkaXNwbGF5IG9mIHNoaXAgcGxhY2VtZW50IGNvbnRyb2xzXG4gICAgLy8gVHVybiBvbiBjb250cm9scyBmb3IgYXR0YWNraW5nIGVuZW15IHdhdGVyc1xuICAgIGNvbnN0IHR1cm5Db250cm9sbGVyID0gdHVybkNvbnRyb2xzKCk7XG4gICAgLy8gR3JpZDpcbiAgICAvLyAgICBjbGVhciBldmVudCBsaXN0ZW5lcnNcbiAgICAvLyAgICBFbmVteSB3YXRlcnM6XG4gICAgLy8gICAgICBzdWJzY3JpYmUgdG8gc3VjY2Vzc2Z1bCBhdHRhY2tzLCBzdW5rZW4gc2hpcHNcbiAgICBQdWJTdWIuc3Vic2NyaWJlKFwiZW5lbXktYXR0YWNrLXJlc3VsdFwiLCBhdHRhY2tSZXN1bHQoXCJjb21wdXRlclwiKSk7XG4gICAgLy8gICAgQWxsaWVkIHdhdGVyczpcbiAgICAvLyAgICAgIHN1YnNjcmliZSB0byBcImVuZW15LWF0dGFja1wiXG4gICAgUHViU3ViLnN1YnNjcmliZShcInBsYXllci1hdHRhY2stcmVzdWx0XCIsIGF0dGFja1Jlc3VsdChcImh1bWFuXCIpKTtcbiAgICAvLyAgICBTdWJzY3JpYmUgdG8gZ2FtZSB3aW4vb3ZlclxuICAgIFB1YlN1Yi5zdWJzY3JpYmUoXCJnYW1lLXdvblwiLCBnYW1lQ29tcGxldGUpO1xuICB9XG5cbiAgLy8gQXN5bmNyb25vdXMgY2FsbGJhY2tcbiAgLy8gSGFwcGVucyBvbiBcImdhbWUtcmVzZXRcIiBzdWJzY3JpYmUgZXZlbnRcbiAgLy8gUmV0dXJucyB0aGUgdmlldyB0byB0aGUgaW5pdGlhbCBzdGF0ZVxuICBhc3luYyBmdW5jdGlvbiBnYW1lUmVzZXQoKSB7XG4gICAgLy8gQ2xlYXIgc3Vic2NyaXB0aW9uc1xuICAgIFB1YlN1Yi5yZXNldCgpO1xuICAgIC8vIEluaXRpYWxpemUgYSBuZXcgZ2FtZSBsb29wXG4gICAgR2FtZUxvb3AoKTtcbiAgICAvLyBkaXNhYmxlIHZpZXcgb2YgZW5lbXkgYm9hcmRcbiAgICBzaGlmdCh0cnVlKTtcbiAgICAvLyBkaXNhYmxlIHZpZXcgb2YgdGhlIHJlc2V0IGJ1dHRvblxuICAgIHJlc2V0QnRuLmNsYXNzTGlzdC5hZGQoXCJkaXNwbGF5LWRpc2FibGVkXCIpO1xuICAgIC8vIGNsZWFyIHZpY3RvcnkvZ2FtZWxvc3QgbWVzc2FnZVxuICAgIGRpc3BsYXlNZXNzYWdlKFwiXCIpO1xuICAgIC8vIHN1YnNyaWJlIHRvIGRpc3BsYXktbWVzc2FnZSBldmVudFxuICAgIFB1YlN1Yi5zdWJzY3JpYmUoXCJkaXNwbGF5LW1lc3NhZ2VcIiwgKGRhdGEpID0+XG4gICAgICBkaXNwbGF5TWVzc2FnZShkYXRhLm1lc3NhZ2UsIGRhdGEuZHVyYXRpb24pXG4gICAgKTtcblxuICAgIC8vIGluaXRpYWxpemUgc2hpcCBwbGFjZW1lbnQgY29udHJvbCBvYmplY3RcbiAgICBjb25zdCBwbGFjZUNudHJsID0gU2hpcFBsYWNlQ29udHJvbHMoKTtcbiAgICAvLyBHcmlkOlxuICAgIC8vIGNsZWFyIGdyaWRcbiAgICByZW1vdmVDaGlsZHJlbiguLi53YXRlcnMpO1xuICAgIC8vIGluaXRpYWxpemUgZ3JpZFxuICAgIGluaXRHcmlkKHdhdGVyc1swXSwgMTAsIHBsYWNlQ250cmwucXVlcnkoKSk7XG4gICAgaW5pdEdyaWQod2F0ZXJzWzFdLCAxMCk7XG4gICAgLy8gaW5pdGlhbGl6ZSB0aGUgc2hpcCBwbGFjZW1lbnQgY29udHJvbHMgLyBldmVudCBsaXN0ZW5lcnNcbiAgICBwbGFjZUNudHJsLmluaXQoKTtcbiAgICAvLyBzdWJzY3JpYmUgdG8gZ2FtZS1zdGFydCBldmVudDpcbiAgICAvLyAgICBDcmVhdGUgYSBwcm9taXNlXG4gICAgY29uc3QgZ2FtZVN0YXJ0SW5kaWNhdGlvbiA9IG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAvLyAgU3Vic2NyaWJlIHRvIGdhbWUtc3RhcnQuIFJlc29sdmUgdGhlIHByb21pc2Ugd2hlbiB0aGUgZXZlbnQgaGFwcGVuc1xuICAgICAgUHViU3ViLnN1YnNjcmliZShcImdhbWUtc3RhcnRcIiwgKGRhdGEpID0+IHtcbiAgICAgICAgcmVzb2x2ZShkYXRhKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIGF3YWl0IGdhbWVTdGFydEluZGljYXRpb247XG4gICAgcGxhY2VDbnRybC5kaXNhYmxlKCk7XG4gICAgZ2FtZVN0YXJ0KCk7XG4gIH1cblxuICBnYW1lUmVzZXQoKTtcblxuICAvLyAgVHJhbnNpdGlvbiBlZmZlY3QgaXMgYWRkIDEgc2Vjb25kIGFmdGVyIGluaXRpYWxpemluZyB2aWV3IChkb25lIGluIGluaXQpXG4gIC8vICBUaGlzIGlzIGRvbmUgc28gdGhhdCB0aGUgaW5pdGlhbCBzaGlmdCBpcyBub3QgdmlzaWJsZVxuICBmdW5jdGlvbiBhZGRUcmFuc2l0aW9uKCkge1xuICAgIHdhdGVyc1swXS5jbGFzc0xpc3QuYWRkKFwiYm9hcmQtc2hpZnQtdHJhbnNpdGlvblwiKTtcbiAgICB3YXRlcnNbMV0uY2xhc3NMaXN0LmFkZChcImJvYXJkLXNoaWZ0LXRyYW5zaXRpb25cIik7XG4gIH1cblxuICBmdW5jdGlvbiBpbml0UmVzZXRCdG4oKSB7XG4gICAgcmVzZXRCdG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IGdhbWVSZXNldCgpKTtcbiAgfVxuXG4gIC8vIElJRkUgaXMgdXNlZCBvbiBpbml0XG4gIChmdW5jdGlvbiBpbml0KCkge1xuICAgIHNldFRpbWVvdXQoYWRkVHJhbnNpdGlvbiwgMTAwMCk7XG4gICAgaW5pdFJlc2V0QnRuKCk7XG4gIH0pKCk7XG5cbiAgcmV0dXJuIHt9O1xufSkoKTtcbiIsIi8vIEltcG9ydHNcbmltcG9ydCBfX19DU1NfTE9BREVSX0FQSV9TT1VSQ0VNQVBfSU1QT1JUX19fIGZyb20gXCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvc291cmNlTWFwcy5qc1wiO1xuaW1wb3J0IF9fX0NTU19MT0FERVJfQVBJX0lNUE9SVF9fXyBmcm9tIFwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL2FwaS5qc1wiO1xudmFyIF9fX0NTU19MT0FERVJfRVhQT1JUX19fID0gX19fQ1NTX0xPQURFUl9BUElfSU1QT1JUX19fKF9fX0NTU19MT0FERVJfQVBJX1NPVVJDRU1BUF9JTVBPUlRfX18pO1xuLy8gTW9kdWxlXG5fX19DU1NfTE9BREVSX0VYUE9SVF9fXy5wdXNoKFttb2R1bGUuaWQsIFwiLyogaHR0cDovL21leWVyd2ViLmNvbS9lcmljL3Rvb2xzL2Nzcy9yZXNldC8gXFxuICAgdjIuMCB8IDIwMTEwMTI2XFxuICAgTGljZW5zZTogbm9uZSAocHVibGljIGRvbWFpbilcXG4qL1xcblxcbmh0bWwsIGJvZHksIGRpdiwgc3BhbiwgYXBwbGV0LCBvYmplY3QsIGlmcmFtZSxcXG5oMSwgaDIsIGgzLCBoNCwgaDUsIGg2LCBwLCBibG9ja3F1b3RlLCBwcmUsXFxuYSwgYWJiciwgYWNyb255bSwgYWRkcmVzcywgYmlnLCBjaXRlLCBjb2RlLFxcbmRlbCwgZGZuLCBlbSwgaW1nLCBpbnMsIGtiZCwgcSwgcywgc2FtcCxcXG5zbWFsbCwgc3RyaWtlLCBzdHJvbmcsIHN1Yiwgc3VwLCB0dCwgdmFyLFxcbmIsIHUsIGksIGNlbnRlcixcXG5kbCwgZHQsIGRkLCBvbCwgdWwsIGxpLFxcbmZpZWxkc2V0LCBmb3JtLCBsYWJlbCwgbGVnZW5kLFxcbnRhYmxlLCBjYXB0aW9uLCB0Ym9keSwgdGZvb3QsIHRoZWFkLCB0ciwgdGgsIHRkLFxcbmFydGljbGUsIGFzaWRlLCBjYW52YXMsIGRldGFpbHMsIGVtYmVkLCBcXG5maWd1cmUsIGZpZ2NhcHRpb24sIGZvb3RlciwgaGVhZGVyLCBoZ3JvdXAsIFxcbm1lbnUsIG5hdiwgb3V0cHV0LCBydWJ5LCBzZWN0aW9uLCBzdW1tYXJ5LFxcbnRpbWUsIG1hcmssIGF1ZGlvLCB2aWRlbyB7XFxuXFx0bWFyZ2luOiAwO1xcblxcdHBhZGRpbmc6IDA7XFxuXFx0Ym9yZGVyOiAwO1xcblxcdGZvbnQtc2l6ZTogMTAwJTtcXG5cXHRmb250OiBpbmhlcml0O1xcblxcdHZlcnRpY2FsLWFsaWduOiBiYXNlbGluZTtcXG59XFxuLyogSFRNTDUgZGlzcGxheS1yb2xlIHJlc2V0IGZvciBvbGRlciBicm93c2VycyAqL1xcbmFydGljbGUsIGFzaWRlLCBkZXRhaWxzLCBmaWdjYXB0aW9uLCBmaWd1cmUsIFxcbmZvb3RlciwgaGVhZGVyLCBoZ3JvdXAsIG1lbnUsIG5hdiwgc2VjdGlvbiB7XFxuXFx0ZGlzcGxheTogYmxvY2s7XFxufVxcbmJvZHkge1xcblxcdGxpbmUtaGVpZ2h0OiAxO1xcbn1cXG5vbCwgdWwge1xcblxcdGxpc3Qtc3R5bGU6IG5vbmU7XFxufVxcbmxpIHtcXG5cXHRsaXN0LXN0eWxlLXR5cGU6IG5vbmU7XFxufVxcbmJsb2NrcXVvdGUsIHEge1xcblxcdHF1b3Rlczogbm9uZTtcXG59XFxuYmxvY2txdW90ZTpiZWZvcmUsIGJsb2NrcXVvdGU6YWZ0ZXIsXFxucTpiZWZvcmUsIHE6YWZ0ZXIge1xcblxcdGNvbnRlbnQ6ICcnO1xcblxcdGNvbnRlbnQ6IG5vbmU7XFxufVxcbnRhYmxlIHtcXG5cXHRib3JkZXItY29sbGFwc2U6IGNvbGxhcHNlO1xcblxcdGJvcmRlci1zcGFjaW5nOiAwO1xcbn1cIiwgXCJcIix7XCJ2ZXJzaW9uXCI6MyxcInNvdXJjZXNcIjpbXCJ3ZWJwYWNrOi8vLi9zcmMvdmlldy9zdHlsZS9jc3MtcmVzZXQuY3NzXCJdLFwibmFtZXNcIjpbXSxcIm1hcHBpbmdzXCI6XCJBQUFBOzs7Q0FHQzs7QUFFRDs7Ozs7Ozs7Ozs7OztDQWFDLFNBQVM7Q0FDVCxVQUFVO0NBQ1YsU0FBUztDQUNULGVBQWU7Q0FDZixhQUFhO0NBQ2Isd0JBQXdCO0FBQ3pCO0FBQ0EsZ0RBQWdEO0FBQ2hEOztDQUVDLGNBQWM7QUFDZjtBQUNBO0NBQ0MsY0FBYztBQUNmO0FBQ0E7Q0FDQyxnQkFBZ0I7QUFDakI7QUFDQTtDQUNDLHFCQUFxQjtBQUN0QjtBQUNBO0NBQ0MsWUFBWTtBQUNiO0FBQ0E7O0NBRUMsV0FBVztDQUNYLGFBQWE7QUFDZDtBQUNBO0NBQ0MseUJBQXlCO0NBQ3pCLGlCQUFpQjtBQUNsQlwiLFwic291cmNlc0NvbnRlbnRcIjpbXCIvKiBodHRwOi8vbWV5ZXJ3ZWIuY29tL2VyaWMvdG9vbHMvY3NzL3Jlc2V0LyBcXG4gICB2Mi4wIHwgMjAxMTAxMjZcXG4gICBMaWNlbnNlOiBub25lIChwdWJsaWMgZG9tYWluKVxcbiovXFxuXFxuaHRtbCwgYm9keSwgZGl2LCBzcGFuLCBhcHBsZXQsIG9iamVjdCwgaWZyYW1lLFxcbmgxLCBoMiwgaDMsIGg0LCBoNSwgaDYsIHAsIGJsb2NrcXVvdGUsIHByZSxcXG5hLCBhYmJyLCBhY3JvbnltLCBhZGRyZXNzLCBiaWcsIGNpdGUsIGNvZGUsXFxuZGVsLCBkZm4sIGVtLCBpbWcsIGlucywga2JkLCBxLCBzLCBzYW1wLFxcbnNtYWxsLCBzdHJpa2UsIHN0cm9uZywgc3ViLCBzdXAsIHR0LCB2YXIsXFxuYiwgdSwgaSwgY2VudGVyLFxcbmRsLCBkdCwgZGQsIG9sLCB1bCwgbGksXFxuZmllbGRzZXQsIGZvcm0sIGxhYmVsLCBsZWdlbmQsXFxudGFibGUsIGNhcHRpb24sIHRib2R5LCB0Zm9vdCwgdGhlYWQsIHRyLCB0aCwgdGQsXFxuYXJ0aWNsZSwgYXNpZGUsIGNhbnZhcywgZGV0YWlscywgZW1iZWQsIFxcbmZpZ3VyZSwgZmlnY2FwdGlvbiwgZm9vdGVyLCBoZWFkZXIsIGhncm91cCwgXFxubWVudSwgbmF2LCBvdXRwdXQsIHJ1YnksIHNlY3Rpb24sIHN1bW1hcnksXFxudGltZSwgbWFyaywgYXVkaW8sIHZpZGVvIHtcXG5cXHRtYXJnaW46IDA7XFxuXFx0cGFkZGluZzogMDtcXG5cXHRib3JkZXI6IDA7XFxuXFx0Zm9udC1zaXplOiAxMDAlO1xcblxcdGZvbnQ6IGluaGVyaXQ7XFxuXFx0dmVydGljYWwtYWxpZ246IGJhc2VsaW5lO1xcbn1cXG4vKiBIVE1MNSBkaXNwbGF5LXJvbGUgcmVzZXQgZm9yIG9sZGVyIGJyb3dzZXJzICovXFxuYXJ0aWNsZSwgYXNpZGUsIGRldGFpbHMsIGZpZ2NhcHRpb24sIGZpZ3VyZSwgXFxuZm9vdGVyLCBoZWFkZXIsIGhncm91cCwgbWVudSwgbmF2LCBzZWN0aW9uIHtcXG5cXHRkaXNwbGF5OiBibG9jaztcXG59XFxuYm9keSB7XFxuXFx0bGluZS1oZWlnaHQ6IDE7XFxufVxcbm9sLCB1bCB7XFxuXFx0bGlzdC1zdHlsZTogbm9uZTtcXG59XFxubGkge1xcblxcdGxpc3Qtc3R5bGUtdHlwZTogbm9uZTtcXG59XFxuYmxvY2txdW90ZSwgcSB7XFxuXFx0cXVvdGVzOiBub25lO1xcbn1cXG5ibG9ja3F1b3RlOmJlZm9yZSwgYmxvY2txdW90ZTphZnRlcixcXG5xOmJlZm9yZSwgcTphZnRlciB7XFxuXFx0Y29udGVudDogJyc7XFxuXFx0Y29udGVudDogbm9uZTtcXG59XFxudGFibGUge1xcblxcdGJvcmRlci1jb2xsYXBzZTogY29sbGFwc2U7XFxuXFx0Ym9yZGVyLXNwYWNpbmc6IDA7XFxufVwiXSxcInNvdXJjZVJvb3RcIjpcIlwifV0pO1xuLy8gRXhwb3J0c1xuZXhwb3J0IGRlZmF1bHQgX19fQ1NTX0xPQURFUl9FWFBPUlRfX187XG4iLCIvLyBJbXBvcnRzXG5pbXBvcnQgX19fQ1NTX0xPQURFUl9BUElfU09VUkNFTUFQX0lNUE9SVF9fXyBmcm9tIFwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL3NvdXJjZU1hcHMuanNcIjtcbmltcG9ydCBfX19DU1NfTE9BREVSX0FQSV9JTVBPUlRfX18gZnJvbSBcIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9hcGkuanNcIjtcbnZhciBfX19DU1NfTE9BREVSX0VYUE9SVF9fXyA9IF9fX0NTU19MT0FERVJfQVBJX0lNUE9SVF9fXyhfX19DU1NfTE9BREVSX0FQSV9TT1VSQ0VNQVBfSU1QT1JUX19fKTtcbl9fX0NTU19MT0FERVJfRVhQT1JUX19fLnB1c2goW21vZHVsZS5pZCwgXCJAaW1wb3J0IHVybChodHRwczovL2ZvbnRzLmdvb2dsZWFwaXMuY29tL2NzczI/ZmFtaWx5PVBhdHVhK09uZSZmYW1pbHk9U3BhY2UrTW9ubyZkaXNwbGF5PXN3YXApO1wiXSk7XG4vLyBNb2R1bGVcbl9fX0NTU19MT0FERVJfRVhQT1JUX19fLnB1c2goW21vZHVsZS5pZCwgXCI6cm9vdCB7XFxuICAtLW1heC1ib2FyZC1zaXplOiA1MDBweDtcXG4gIC0tYm9hcmQtc2l6ZTogNTAwcHg7XFxuICAtLWhlYWRlci10ZXh0LXNpemU6IDVyZW07XFxuICAtLWhlYWRlci1oZWlnaHQ6IDVyZW07XFxuICAtLWNvbnRyb2xzLXdyYXBwZXItbWFyZ2luOiAxcmVtIGF1dG8gMXJlbSBhdXRvO1xcbiAgLS1jb250cm9scy13cmFwcGVyLWhlaWdodC1mYWN0b3I6IGNhbGModmFyKC0tYm9hcmQtc2l6ZSkgKiAzIC8gMTApO1xcbiAgLS1tZXNzYWdlLWNlbnRlci10b3AtbWFyZ2luOiAxcmVtO1xcbiAgLS1wbGF5ZXItYm9hcmQtY29sb3I6IGFudGlxdWV3aGl0ZTtcXG4gIC0tcmVzZXQtYnRuLWhlaWdodDogMi41cmVtO1xcbn1cXG5cXG5ib2R5IHtcXG4gIHdpZHRoOiAxMDAlO1xcbiAgcG9zaXRpb246IGZpeGVkO1xcbn1cXG5cXG5odG1sIHtcXG4gIGJhY2tncm91bmQtY29sb3I6IGRhcmtzbGF0ZWdyYXk7XFxuICB3aWR0aDogMTAwJTtcXG59XFxuXFxuaGVhZGVyIHtcXG4gIGhlaWdodDogdmFyKC0taGVhZGVyLWhlaWdodCk7XFxuICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxuICBmb250LWZhbWlseTogXFxcIlBhdHVhIE9uZVxcXCI7XFxuICBmb250LXNpemU6IHZhcigtLWhlYWRlci10ZXh0LXNpemUpO1xcbn1cXG5cXG4uZ2FtZS13cmFwcGVyIHtcXG4gIGhlaWdodDogY2FsYygxMDAlIC0gdmFyKC0taGVhZGVyLWhlaWdodCkpO1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XFxuICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG59XFxuXFxuI2JvYXJkLXdyYXBwZXIge1xcbiAgb3ZlcmZsb3c6IGhpZGRlbjtcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xcbiAgZ2FwOiAxMHB4O1xcbn1cXG5cXG4jYm9hcmQtd3JhcHBlciA+IGRpdiB7XFxuICB3aWR0aDogdmFyKC0tYm9hcmQtc2l6ZSk7XFxuICBoZWlnaHQ6IHZhcigtLWJvYXJkLXNpemUpO1xcbiAgbWFyZ2luOiBhdXRvO1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XFxuICBnYXA6IDFweDtcXG59XFxuXFxuLmJvYXJkLXNoaWZ0LXRyYW5zaXRpb24ge1xcbiAgdHJhbnNpdGlvbjogdHJhbnNmb3JtIDFzIGVhc2UtaW4tb3V0O1xcbn1cXG5cXG4uYm9hcmQtc2hpZnQge1xcbiAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoMCwgY2FsYygtMSAqIHZhcigtLWJvYXJkLXNpemUpKSk7XFxufVxcblxcbi5hbGxpZWQtd2F0ZXJzIC5ncmlkLXNxdWFyZSB7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1wbGF5ZXItYm9hcmQtY29sb3IpO1xcbn1cXG4uZW5lbXktd2F0ZXJzIC5ncmlkLXNxdWFyZSB7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiBsaWdodGNvcmFsO1xcbn1cXG5cXG4uZ3JpZC1yb3cge1xcbiAgaGVpZ2h0OiAxMCU7XFxuICB3aWR0aDogMTAwJTtcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBnYXA6IDFweDtcXG59XFxuXFxuLmdyaWQtc3F1YXJlIHtcXG4gIGhlaWdodDogMTAwJTtcXG4gIHdpZHRoOiAxMCU7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XFxuICBhbGlnbi1pdGVtczogY2VudGVyO1xcbn1cXG5cXG4jY29udHJvbHMtd3JhcHBlciB7XFxuICB3aWR0aDogdmFyKC0tYm9hcmQtc2l6ZSk7XFxuICBoZWlnaHQ6IHZhcigtLWNvbnRyb2xzLXdyYXBwZXItaGVpZ2h0LWZhY3Rvcik7XFxuICBtYXJnaW46IHZhcigtLWNvbnRyb2xzLXdyYXBwZXItbWFyZ2luKTtcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xcbiAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xcbn1cXG5cXG4jbWVzc2FnZS1jZW50ZXIge1xcbiAgd2lkdGg6IHZhcigtLWJvYXJkLXNpemUpO1xcbiAgaGVpZ2h0OiB2YXIoLS1jb250cm9scy13cmFwcGVyLWhlaWdodCk7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAgZ2FwOiA1cHg7XFxuICBtYXJnaW4tdG9wOiB2YXIoLS1tZXNzYWdlLWNlbnRlci10b3AtbWFyZ2luKTtcXG4gIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XFxuICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuICBmb250LWZhbWlseTogXFxcIlNwYWNlIE1vbm9cXFwiO1xcbn1cXG5cXG4jbWVzc2FnZS1jZW50ZXIgPiBkaXYge1xcbiAgaGVpZ2h0OiBjYWxjKHZhcigtLWJvYXJkLXNpemUpICogMC43NSAvIDEwKTtcXG59XFxuXFxuI21lc3NhZ2UtdHdvIHtcXG4gIHRyYW5zaXRpb246IG9wYWNpdHkgMC41cyBsaW5lYXI7XFxuICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxufVxcblxcbiNwbGFjZW1lbnQtY29udHJvbHMge1xcbiAgd2lkdGg6IDEwMCU7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAgZmxleC1kaXJlY3Rpb246IHJvdztcXG4gIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjtcXG4gIGdhcDogNXB4O1xcbiAgdHJhbnNpdGlvbjogb3BhY2l0eSAwLjI1cyBsaW5lYXI7XFxufVxcblxcbi5vcGFjaXR5LXplcm8ge1xcbiAgb3BhY2l0eTogMDtcXG59XFxuXFxuI29yaWVudGF0aW9uLWJ0biB7XFxuICBoZWlnaHQ6IGNhbGModmFyKC0tYm9hcmQtc2l6ZSkgLyAxMCk7XFxuICB3aWR0aDogY2FsYyh2YXIoLS1ib2FyZC1zaXplKSAqIDMgLyAxMCk7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiBhbnRpcXVld2hpdGU7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gIGp1c3RpZnktY29udGVudDogY2VudGVyO1xcbiAgbWFyZ2luOiAwIDEwcHggMCAwO1xcbiAgZm9udC1mYW1pbHk6IFxcXCJTcGFjZSBNb25vXFxcIjtcXG4gIHRleHQtYWxpZ246IGNlbnRlcjtcXG4gIGZvbnQtc2l6ZTogMC45cmVtO1xcblxcbiAgYm9yZGVyLXJhZGl1czogMC4yNXJlbTtcXG4gIGJveC1zaGFkb3c6IDVweCA1cHggMjVweCAzcHggcmdiKDQ5LCA0OSwgNDkpO1xcbn1cXG5cXG4ucGxhY2Utc2hpcC1jb250cm9sIHtcXG4gIGhlaWdodDogY2FsYyh2YXIoLS1ib2FyZC1zaXplKSAvIDEwKTtcXG5cXG4gIGJhY2tncm91bmQtY29sb3I6IGJpc3F1ZTtcXG4gIG1hcmdpbjogMCAwIDAgMTBweDtcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XFxuICBmb250LWZhbWlseTogXFxcIlNwYWNlIE1vbm9cXFwiO1xcbiAgdGV4dC1hbGlnbjogY2VudGVyO1xcbiAgZm9udC1zaXplOiAwLjlyZW07XFxuXFxuICBib3JkZXItcmFkaXVzOiAwLjI1cmVtO1xcbiAgYm94LXNoYWRvdzogNXB4IDVweCAyNXB4IDNweCByZ2IoNDksIDQ5LCA0OSk7XFxufVxcblxcbiNwbGFjZS1jYXJyaWVyIHtcXG4gIHdpZHRoOiBjYWxjKHZhcigtLWJvYXJkLXNpemUpIC8gMik7XFxufVxcblxcbiNwbGFjZS1iYXR0bGVzaGlwIHtcXG4gIHdpZHRoOiBjYWxjKHZhcigtLWJvYXJkLXNpemUpICogNCAvIDEwKTtcXG59XFxuXFxuI3BsYWNlLWRlc3Ryb3llciB7XFxuICB3aWR0aDogY2FsYyh2YXIoLS1ib2FyZC1zaXplKSAqIDMgLyAxMCk7XFxufVxcblxcbiNwbGFjZS1zdWJtYXJpbmUge1xcbiAgd2lkdGg6IGNhbGModmFyKC0tYm9hcmQtc2l6ZSkgKiAzIC8gMTApO1xcbn1cXG5cXG4jcGxhY2UtcGF0cm9sYm9hdCB7XFxuICB3aWR0aDogY2FsYyh2YXIoLS1ib2FyZC1zaXplKSAvIDUpO1xcbn1cXG5cXG4jcmVzZXQtYnRuIHtcXG4gIG1hcmdpbjogYXV0bztcXG4gIGN1cnNvcjogcG9pbnRlcjtcXG4gIGhlaWdodDogdmFyKC0tcmVzZXQtYnRuLWhlaWdodCk7XFxuICB3aWR0aDogN3JlbTtcXG4gIGJhY2tncm91bmQtY29sb3I6IHZhcigtLXBsYXllci1ib2FyZC1jb2xvcik7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gIGp1c3RpZnktY29udGVudDogY2VudGVyO1xcbiAgYm9yZGVyLXJhZGl1czogMC4yNXJlbTtcXG4gIGJveC1zaGFkb3c6IDVweCA1cHggMjVweCAzcHggcmdiKDQ5LCA0OSwgNDkpO1xcbn1cXG5cXG4uaGl0OjphZnRlciB7XFxuICBjb250ZW50OiBcXFwiXFxcIjtcXG4gIHdpZHRoOiAxcmVtO1xcbiAgaGVpZ2h0OiAxcmVtO1xcbiAgYm9yZGVyLXJhZGl1czogMC41cmVtO1xcbiAgYmFja2dyb3VuZC1jb2xvcjogcmVkO1xcbn1cXG5cXG4ubWlzczo6YWZ0ZXIge1xcbiAgY29udGVudDogXFxcIlxcXCI7XFxuICB3aWR0aDogMXJlbTtcXG4gIGhlaWdodDogMXJlbTtcXG4gIGJvcmRlci1yYWRpdXM6IDAuNXJlbTtcXG4gIGJhY2tncm91bmQtY29sb3I6IHdoaXRlO1xcbiAgYm94LXNoYWRvdzogMXB4IDFweCAxMHB4IHJnYig0OSwgNDksIDQ5KTtcXG59XFxuXFxuLmVuZW15LXdhdGVycyAuZ3JpZC1zcXVhcmU6bm90KC5oaXQpOm5vdCgubWlzcyk6aG92ZXIge1xcbiAgZmlsdGVyOiBicmlnaHRuZXNzKDAuNzUpO1xcbiAgY3Vyc29yOiBwb2ludGVyO1xcbn1cXG5cXG4uZ3JpZC1zcXVhcmUudmFsaWQtcGxhY2VtZW50IHtcXG4gIGJhY2tncm91bmQtY29sb3I6IGdyZWVuO1xcbn1cXG5cXG4uZ3JpZC1zcXVhcmUuaW52YWxpZC1wbGFjZW1lbnQge1xcbiAgYmFja2dyb3VuZC1jb2xvcjogcmVkO1xcbn1cXG5cXG4uZ3JpZC1zcXVhcmUub2NjdXBpZWQge1xcbiAgYmFja2dyb3VuZC1jb2xvcjogYnJvd247XFxufVxcblxcbi5leHBsb2RlZCB7XFxuICBmaWx0ZXI6IGludmVydCgpO1xcbn1cXG5cXG4jcGxhY2VtZW50LWNvbnRyb2xzLmRpc3BsYXktZGlzYWJsZWQsXFxuI3Jlc2V0LWJ0bi5kaXNwbGF5LWRpc2FibGVkLFxcbi5kaXNwbGF5LWRpc2FibGVkIHtcXG4gIGRpc3BsYXk6IG5vbmU7XFxufVxcblxcbi5wbGFjZS1idXR0b24tZW5hYmxlZCB7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiBncmVlbjtcXG59XFxuXFxuLmJ0bi1kaXNhYmxlZCB7XFxuICBvcGFjaXR5OiA2MCU7XFxufVxcblxcbkBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogNTAwcHgpIHtcXG4gIDpyb290IHtcXG4gICAgLS1ib2FyZC1zaXplOiA4MHZ3O1xcbiAgICAtLWhlYWRlci10ZXh0LXNpemU6IDNyZW07XFxuICAgIC0taGVhZGVyLWhlaWdodDogM3JlbTtcXG4gICAgLS1jb250cm9scy13cmFwcGVyLW1hcmdpbjogMC4yNXJlbSBhdXRvIDAuNXJlbSBhdXRvO1xcbiAgICAtLWNvbnRyb2xzLXdyYXBwZXItaGVpZ2h0LWZhY3RvcjogY2FsYyh2YXIoLS1ib2FyZC1zaXplKSAqIDQgLyAxMCk7XFxuICAgIC0tbWVzc2FnZS1jZW50ZXItdG9wLW1hcmdpbjogMC4yNXJlbTtcXG4gICAgLS1yZXNldC1idG4taGVpZ2h0OiAxLjc1cmVtO1xcbiAgfVxcbn1cXG5cIiwgXCJcIix7XCJ2ZXJzaW9uXCI6MyxcInNvdXJjZXNcIjpbXCJ3ZWJwYWNrOi8vLi9zcmMvdmlldy9zdHlsZS9pbmRleC5jc3NcIl0sXCJuYW1lc1wiOltdLFwibWFw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O0VBQ0UsdUJBQXVCO0FBQ3pCOztBQUVBO0VBQ0UscUJBQXFCO0FBQ3ZCOztBQUVBO0VBQ0UsdUJBQXVCO0FBQ3pCOztBQUVBO0VBQ0UsZ0JBQWdCO0FBQ2xCOztBQUVBOzs7RUFHRSxhQUFhO0FBQ2Y7O0FBRUE7RUFDRSx1QkFBdUI7QUFDekI7O0FBRUE7RUFDRSxZQUFZO0FBQ2Q7O0FBRUE7RUFDRTtJQUNFLGtCQUFrQjtJQUNsQix3QkFBd0I7SUFDeEIscUJBQXFCO0lBQ3JCLG1EQUFtRDtJQUNuRCxrRUFBa0U7SUFDbEUsb0NBQW9DO0lBQ3BDLDJCQUEyQjtFQUM3QjtBQUNGXCIsXCJzb3VyY2VzQ29udGVudFwiOltcIkBpbXBvcnQgdXJsKFxcXCJodHRwczovL2ZvbnRzLmdvb2dsZWFwaXMuY29tL2NzczI/ZmFtaWx5PVBhdHVhK09uZSZmYW1pbHk9U3BhY2UrTW9ubyZkaXNwbGF5PXN3YXBcXFwiKTtcXG5cXG46cm9vdCB7XFxuICAtLW1heC1ib2FyZC1zaXplOiA1MDBweDtcXG4gIC0tYm9hcmQtc2l6ZTogNTAwcHg7XFxuICAtLWhlYWRlci10ZXh0LXNpemU6IDVyZW07XFxuICAtLWhlYWRlci1oZWlnaHQ6IDVyZW07XFxuICAtLWNvbnRyb2xzLXdyYXBwZXItbWFyZ2luOiAxcmVtIGF1dG8gMXJlbSBhdXRvO1xcbiAgLS1jb250cm9scy13cmFwcGVyLWhlaWdodC1mYWN0b3I6IGNhbGModmFyKC0tYm9hcmQtc2l6ZSkgKiAzIC8gMTApO1xcbiAgLS1tZXNzYWdlLWNlbnRlci10b3AtbWFyZ2luOiAxcmVtO1xcbiAgLS1wbGF5ZXItYm9hcmQtY29sb3I6IGFudGlxdWV3aGl0ZTtcXG4gIC0tcmVzZXQtYnRuLWhlaWdodDogMi41cmVtO1xcbn1cXG5cXG5ib2R5IHtcXG4gIHdpZHRoOiAxMDAlO1xcbiAgcG9zaXRpb246IGZpeGVkO1xcbn1cXG5cXG5odG1sIHtcXG4gIGJhY2tncm91bmQtY29sb3I6IGRhcmtzbGF0ZWdyYXk7XFxuICB3aWR0aDogMTAwJTtcXG59XFxuXFxuaGVhZGVyIHtcXG4gIGhlaWdodDogdmFyKC0taGVhZGVyLWhlaWdodCk7XFxuICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxuICBmb250LWZhbWlseTogXFxcIlBhdHVhIE9uZVxcXCI7XFxuICBmb250LXNpemU6IHZhcigtLWhlYWRlci10ZXh0LXNpemUpO1xcbn1cXG5cXG4uZ2FtZS13cmFwcGVyIHtcXG4gIGhlaWdodDogY2FsYygxMDAlIC0gdmFyKC0taGVhZGVyLWhlaWdodCkpO1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XFxuICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG59XFxuXFxuI2JvYXJkLXdyYXBwZXIge1xcbiAgb3ZlcmZsb3c6IGhpZGRlbjtcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xcbiAgZ2FwOiAxMHB4O1xcbn1cXG5cXG4jYm9hcmQtd3JhcHBlciA+IGRpdiB7XFxuICB3aWR0aDogdmFyKC0tYm9hcmQtc2l6ZSk7XFxuICBoZWlnaHQ6IHZhcigtLWJvYXJkLXNpemUpO1xcbiAgbWFyZ2luOiBhdXRvO1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XFxuICBnYXA6IDFweDtcXG59XFxuXFxuLmJvYXJkLXNoaWZ0LXRyYW5zaXRpb24ge1xcbiAgdHJhbnNpdGlvbjogdHJhbnNmb3JtIDFzIGVhc2UtaW4tb3V0O1xcbn1cXG5cXG4uYm9hcmQtc2hpZnQge1xcbiAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoMCwgY2FsYygtMSAqIHZhcigtLWJvYXJkLXNpemUpKSk7XFxufVxcblxcbi5hbGxpZWQtd2F0ZXJzIC5ncmlkLXNxdWFyZSB7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1wbGF5ZXItYm9hcmQtY29sb3IpO1xcbn1cXG4uZW5lbXktd2F0ZXJzIC5ncmlkLXNxdWFyZSB7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiBsaWdodGNvcmFsO1xcbn1cXG5cXG4uZ3JpZC1yb3cge1xcbiAgaGVpZ2h0OiAxMCU7XFxuICB3aWR0aDogMTAwJTtcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBnYXA6IDFweDtcXG59XFxuXFxuLmdyaWQtc3F1YXJlIHtcXG4gIGhlaWdodDogMTAwJTtcXG4gIHdpZHRoOiAxMCU7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XFxuICBhbGlnbi1pdGVtczogY2VudGVyO1xcbn1cXG5cXG4jY29udHJvbHMtd3JhcHBlciB7XFxuICB3aWR0aDogdmFyKC0tYm9hcmQtc2l6ZSk7XFxuICBoZWlnaHQ6IHZhcigtLWNvbnRyb2xzLXdyYXBwZXItaGVpZ2h0LWZhY3Rvcik7XFxuICBtYXJnaW46IHZhcigtLWNvbnRyb2xzLXdyYXBwZXItbWFyZ2luKTtcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xcbiAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xcbn1cXG5cXG4jbWVzc2FnZS1jZW50ZXIge1xcbiAgd2lkdGg6IHZhcigtLWJvYXJkLXNpemUpO1xcbiAgaGVpZ2h0OiB2YXIoLS1jb250cm9scy13cmFwcGVyLWhlaWdodCk7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAgZ2FwOiA1cHg7XFxuICBtYXJnaW4tdG9wOiB2YXIoLS1tZXNzYWdlLWNlbnRlci10b3AtbWFyZ2luKTtcXG4gIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XFxuICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuICBmb250LWZhbWlseTogXFxcIlNwYWNlIE1vbm9cXFwiO1xcbn1cXG5cXG4jbWVzc2FnZS1jZW50ZXIgPiBkaXYge1xcbiAgaGVpZ2h0OiBjYWxjKHZhcigtLWJvYXJkLXNpemUpICogMC43NSAvIDEwKTtcXG59XFxuXFxuI21lc3NhZ2UtdHdvIHtcXG4gIHRyYW5zaXRpb246IG9wYWNpdHkgMC41cyBsaW5lYXI7XFxuICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxufVxcblxcbiNwbGFjZW1lbnQtY29udHJvbHMge1xcbiAgd2lkdGg6IDEwMCU7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAgZmxleC1kaXJlY3Rpb246IHJvdztcXG4gIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjtcXG4gIGdhcDogNXB4O1xcbiAgdHJhbnNpdGlvbjogb3BhY2l0eSAwLjI1cyBsaW5lYXI7XFxufVxcblxcbi5vcGFjaXR5LXplcm8ge1xcbiAgb3BhY2l0eTogMDtcXG59XFxuXFxuI29yaWVudGF0aW9uLWJ0biB7XFxuICBoZWlnaHQ6IGNhbGModmFyKC0tYm9hcmQtc2l6ZSkgLyAxMCk7XFxuICB3aWR0aDogY2FsYyh2YXIoLS1ib2FyZC1zaXplKSAqIDMgLyAxMCk7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiBhbnRpcXVld2hpdGU7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gIGp1c3RpZnktY29udGVudDogY2VudGVyO1xcbiAgbWFyZ2luOiAwIDEwcHggMCAwO1xcbiAgZm9udC1mYW1pbHk6IFxcXCJTcGFjZSBNb25vXFxcIjtcXG4gIHRleHQtYWxpZ246IGNlbnRlcjtcXG4gIGZvbnQtc2l6ZTogMC45cmVtO1xcblxcbiAgYm9yZGVyLXJhZGl1czogMC4yNXJlbTtcXG4gIGJveC1zaGFkb3c6IDVweCA1cHggMjVweCAzcHggcmdiKDQ5LCA0OSwgNDkpO1xcbn1cXG5cXG4ucGxhY2Utc2hpcC1jb250cm9sIHtcXG4gIGhlaWdodDogY2FsYyh2YXIoLS1ib2FyZC1zaXplKSAvIDEwKTtcXG5cXG4gIGJhY2tncm91bmQtY29sb3I6IGJpc3F1ZTtcXG4gIG1hcmdpbjogMCAwIDAgMTBweDtcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XFxuICBmb250LWZhbWlseTogXFxcIlNwYWNlIE1vbm9cXFwiO1xcbiAgdGV4dC1hbGlnbjogY2VudGVyO1xcbiAgZm9udC1zaXplOiAwLjlyZW07XFxuXFxuICBib3JkZXItcmFkaXVzOiAwLjI1cmVtO1xcbiAgYm94LXNoYWRvdzogNXB4IDVweCAyNXB4IDNweCByZ2IoNDksIDQ5LCA0OSk7XFxufVxcblxcbiNwbGFjZS1jYXJyaWVyIHtcXG4gIHdpZHRoOiBjYWxjKHZhcigtLWJvYXJkLXNpemUpIC8gMik7XFxufVxcblxcbiNwbGFjZS1iYXR0bGVzaGlwIHtcXG4gIHdpZHRoOiBjYWxjKHZhcigtLWJvYXJkLXNpemUpICogNCAvIDEwKTtcXG59XFxuXFxuI3BsYWNlLWRlc3Ryb3llciB7XFxuICB3aWR0aDogY2FsYyh2YXIoLS1ib2FyZC1zaXplKSAqIDMgLyAxMCk7XFxufVxcblxcbiNwbGFjZS1zdWJtYXJpbmUge1xcbiAgd2lkdGg6IGNhbGModmFyKC0tYm9hcmQtc2l6ZSkgKiAzIC8gMTApO1xcbn1cXG5cXG4jcGxhY2UtcGF0cm9sYm9hdCB7XFxuICB3aWR0aDogY2FsYyh2YXIoLS1ib2FyZC1zaXplKSAvIDUpO1xcbn1cXG5cXG4jcmVzZXQtYnRuIHtcXG4gIG1hcmdpbjogYXV0bztcXG4gIGN1cnNvcjogcG9pbnRlcjtcXG4gIGhlaWdodDogdmFyKC0tcmVzZXQtYnRuLWhlaWdodCk7XFxuICB3aWR0aDogN3JlbTtcXG4gIGJhY2tncm91bmQtY29sb3I6IHZhcigtLXBsYXllci1ib2FyZC1jb2xvcik7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gIGp1c3RpZnktY29udGVudDogY2VudGVyO1xcbiAgYm9yZGVyLXJhZGl1czogMC4yNXJlbTtcXG4gIGJveC1zaGFkb3c6IDVweCA1cHggMjVweCAzcHggcmdiKDQ5LCA0OSwgNDkpO1xcbn1cXG5cXG4uaGl0OjphZnRlciB7XFxuICBjb250ZW50OiBcXFwiXFxcIjtcXG4gIHdpZHRoOiAxcmVtO1xcbiAgaGVpZ2h0OiAxcmVtO1xcbiAgYm9yZGVyLXJhZGl1czogMC41cmVtO1xcbiAgYmFja2dyb3VuZC1jb2xvcjogcmVkO1xcbn1cXG5cXG4ubWlzczo6YWZ0ZXIge1xcbiAgY29udGVudDogXFxcIlxcXCI7XFxuICB3aWR0aDogMXJlbTtcXG4gIGhlaWdodDogMXJlbTtcXG4gIGJvcmRlci1yYWRpdXM6IDAuNXJlbTtcXG4gIGJhY2tncm91bmQtY29sb3I6IHdoaXRlO1xcbiAgYm94LXNoYWRvdzogMXB4IDFweCAxMHB4IHJnYig0OSwgNDksIDQ5KTtcXG59XFxuXFxuLmVuZW15LXdhdGVycyAuZ3JpZC1zcXVhcmU6bm90KC5oaXQpOm5vdCgubWlzcyk6aG92ZXIge1xcbiAgZmlsdGVyOiBicmlnaHRuZXNzKDAuNzUpO1xcbiAgY3Vyc29yOiBwb2ludGVyO1xcbn1cXG5cXG4uZ3JpZC1zcXVhcmUudmFsaWQtcGxhY2VtZW50IHtcXG4gIGJhY2tncm91bmQtY29sb3I6IGdyZWVuO1xcbn1cXG5cXG4uZ3JpZC1zcXVhcmUuaW52YWxpZC1wbGFjZW1lbnQge1xcbiAgYmFja2dyb3VuZC1jb2xvcjogcmVkO1xcbn1cXG5cXG4uZ3JpZC1zcXVhcmUub2NjdXBpZWQge1xcbiAgYmFja2dyb3VuZC1jb2xvcjogYnJvd247XFxufVxcblxcbi5leHBsb2RlZCB7XFxuICBmaWx0ZXI6IGludmVydCgpO1xcbn1cXG5cXG4jcGxhY2VtZW50LWNvbnRyb2xzLmRpc3BsYXktZGlzYWJsZWQsXFxuI3Jlc2V0LWJ0bi5kaXNwbGF5LWRpc2FibGVkLFxcbi5kaXNwbGF5LWRpc2FibGVkIHtcXG4gIGRpc3BsYXk6IG5vbmU7XFxufVxcblxcbi5wbGFjZS1idXR0b24tZW5hYmxlZCB7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiBncmVlbjtcXG59XFxuXFxuLmJ0bi1kaXNhYmxlZCB7XFxuICBvcGFjaXR5OiA2MCU7XFxufVxcblxcbkBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogNTAwcHgpIHtcXG4gIDpyb290IHtcXG4gICAgLS1ib2FyZC1zaXplOiA4MHZ3O1xcbiAgICAtLWhlYWRlci10ZXh0LXNpemU6IDNyZW07XFxuICAgIC0taGVhZGVyLWhlaWdodDogM3JlbTtcXG4gICAgLS1jb250cm9scy13cmFwcGVyLW1hcmdpbjogMC4yNXJlbSBhdXRvIDAuNXJlbSBhdXRvO1xcbiAgICAtLWNvbnRyb2xzLXdyYXBwZXItaGVpZ2h0LWZhY3RvcjogY2FsYyh2YXIoLS1ib2FyZC1zaXplKSAqIDQgLyAxMCk7XFxuICAgIC0tbWVzc2FnZS1jZW50ZXItdG9wLW1hcmdpbjogMC4yNXJlbTtcXG4gICAgLS1yZXNldC1idG4taGVpZ2h0OiAxLjc1cmVtO1xcbiAgfVxcbn1cXG5cIl0sXCJzb3VyY2VSb290XCI6XCJcIn1dKTtcbi8vIEV4cG9ydHNcbmV4cG9ydCBkZWZhdWx0IF9fX0NTU19MT0FERVJfRVhQT1JUX19fO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qXG4gIE1JVCBMaWNlbnNlIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvbWl0LWxpY2Vuc2UucGhwXG4gIEF1dGhvciBUb2JpYXMgS29wcGVycyBAc29rcmFcbiovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChjc3NXaXRoTWFwcGluZ1RvU3RyaW5nKSB7XG4gIHZhciBsaXN0ID0gW107IC8vIHJldHVybiB0aGUgbGlzdCBvZiBtb2R1bGVzIGFzIGNzcyBzdHJpbmdcblxuICBsaXN0LnRvU3RyaW5nID0gZnVuY3Rpb24gdG9TdHJpbmcoKSB7XG4gICAgcmV0dXJuIHRoaXMubWFwKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICB2YXIgY29udGVudCA9IFwiXCI7XG4gICAgICB2YXIgbmVlZExheWVyID0gdHlwZW9mIGl0ZW1bNV0gIT09IFwidW5kZWZpbmVkXCI7XG5cbiAgICAgIGlmIChpdGVtWzRdKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJAc3VwcG9ydHMgKFwiLmNvbmNhdChpdGVtWzRdLCBcIikge1wiKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGl0ZW1bMl0pIHtcbiAgICAgICAgY29udGVudCArPSBcIkBtZWRpYSBcIi5jb25jYXQoaXRlbVsyXSwgXCIge1wiKTtcbiAgICAgIH1cblxuICAgICAgaWYgKG5lZWRMYXllcikge1xuICAgICAgICBjb250ZW50ICs9IFwiQGxheWVyXCIuY29uY2F0KGl0ZW1bNV0ubGVuZ3RoID4gMCA/IFwiIFwiLmNvbmNhdChpdGVtWzVdKSA6IFwiXCIsIFwiIHtcIik7XG4gICAgICB9XG5cbiAgICAgIGNvbnRlbnQgKz0gY3NzV2l0aE1hcHBpbmdUb1N0cmluZyhpdGVtKTtcblxuICAgICAgaWYgKG5lZWRMYXllcikge1xuICAgICAgICBjb250ZW50ICs9IFwifVwiO1xuICAgICAgfVxuXG4gICAgICBpZiAoaXRlbVsyXSkge1xuICAgICAgICBjb250ZW50ICs9IFwifVwiO1xuICAgICAgfVxuXG4gICAgICBpZiAoaXRlbVs0XSkge1xuICAgICAgICBjb250ZW50ICs9IFwifVwiO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gY29udGVudDtcbiAgICB9KS5qb2luKFwiXCIpO1xuICB9OyAvLyBpbXBvcnQgYSBsaXN0IG9mIG1vZHVsZXMgaW50byB0aGUgbGlzdFxuXG5cbiAgbGlzdC5pID0gZnVuY3Rpb24gaShtb2R1bGVzLCBtZWRpYSwgZGVkdXBlLCBzdXBwb3J0cywgbGF5ZXIpIHtcbiAgICBpZiAodHlwZW9mIG1vZHVsZXMgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgIG1vZHVsZXMgPSBbW251bGwsIG1vZHVsZXMsIHVuZGVmaW5lZF1dO1xuICAgIH1cblxuICAgIHZhciBhbHJlYWR5SW1wb3J0ZWRNb2R1bGVzID0ge307XG5cbiAgICBpZiAoZGVkdXBlKSB7XG4gICAgICBmb3IgKHZhciBrID0gMDsgayA8IHRoaXMubGVuZ3RoOyBrKyspIHtcbiAgICAgICAgdmFyIGlkID0gdGhpc1trXVswXTtcblxuICAgICAgICBpZiAoaWQgIT0gbnVsbCkge1xuICAgICAgICAgIGFscmVhZHlJbXBvcnRlZE1vZHVsZXNbaWRdID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGZvciAodmFyIF9rID0gMDsgX2sgPCBtb2R1bGVzLmxlbmd0aDsgX2srKykge1xuICAgICAgdmFyIGl0ZW0gPSBbXS5jb25jYXQobW9kdWxlc1tfa10pO1xuXG4gICAgICBpZiAoZGVkdXBlICYmIGFscmVhZHlJbXBvcnRlZE1vZHVsZXNbaXRlbVswXV0pIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGlmICh0eXBlb2YgbGF5ZXIgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBpdGVtWzVdID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgaXRlbVs1XSA9IGxheWVyO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGl0ZW1bMV0gPSBcIkBsYXllclwiLmNvbmNhdChpdGVtWzVdLmxlbmd0aCA+IDAgPyBcIiBcIi5jb25jYXQoaXRlbVs1XSkgOiBcIlwiLCBcIiB7XCIpLmNvbmNhdChpdGVtWzFdLCBcIn1cIik7XG4gICAgICAgICAgaXRlbVs1XSA9IGxheWVyO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChtZWRpYSkge1xuICAgICAgICBpZiAoIWl0ZW1bMl0pIHtcbiAgICAgICAgICBpdGVtWzJdID0gbWVkaWE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaXRlbVsxXSA9IFwiQG1lZGlhIFwiLmNvbmNhdChpdGVtWzJdLCBcIiB7XCIpLmNvbmNhdChpdGVtWzFdLCBcIn1cIik7XG4gICAgICAgICAgaXRlbVsyXSA9IG1lZGlhO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChzdXBwb3J0cykge1xuICAgICAgICBpZiAoIWl0ZW1bNF0pIHtcbiAgICAgICAgICBpdGVtWzRdID0gXCJcIi5jb25jYXQoc3VwcG9ydHMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGl0ZW1bMV0gPSBcIkBzdXBwb3J0cyAoXCIuY29uY2F0KGl0ZW1bNF0sIFwiKSB7XCIpLmNvbmNhdChpdGVtWzFdLCBcIn1cIik7XG4gICAgICAgICAgaXRlbVs0XSA9IHN1cHBvcnRzO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGxpc3QucHVzaChpdGVtKTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIGxpc3Q7XG59OyIsIlwidXNlIHN0cmljdFwiO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdGVtKSB7XG4gIHZhciBjb250ZW50ID0gaXRlbVsxXTtcbiAgdmFyIGNzc01hcHBpbmcgPSBpdGVtWzNdO1xuXG4gIGlmICghY3NzTWFwcGluZykge1xuICAgIHJldHVybiBjb250ZW50O1xuICB9XG5cbiAgaWYgKHR5cGVvZiBidG9hID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICB2YXIgYmFzZTY0ID0gYnRvYSh1bmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQoSlNPTi5zdHJpbmdpZnkoY3NzTWFwcGluZykpKSk7XG4gICAgdmFyIGRhdGEgPSBcInNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ9dXRmLTg7YmFzZTY0LFwiLmNvbmNhdChiYXNlNjQpO1xuICAgIHZhciBzb3VyY2VNYXBwaW5nID0gXCIvKiMgXCIuY29uY2F0KGRhdGEsIFwiICovXCIpO1xuICAgIHZhciBzb3VyY2VVUkxzID0gY3NzTWFwcGluZy5zb3VyY2VzLm1hcChmdW5jdGlvbiAoc291cmNlKSB7XG4gICAgICByZXR1cm4gXCIvKiMgc291cmNlVVJMPVwiLmNvbmNhdChjc3NNYXBwaW5nLnNvdXJjZVJvb3QgfHwgXCJcIikuY29uY2F0KHNvdXJjZSwgXCIgKi9cIik7XG4gICAgfSk7XG4gICAgcmV0dXJuIFtjb250ZW50XS5jb25jYXQoc291cmNlVVJMcykuY29uY2F0KFtzb3VyY2VNYXBwaW5nXSkuam9pbihcIlxcblwiKTtcbiAgfVxuXG4gIHJldHVybiBbY29udGVudF0uam9pbihcIlxcblwiKTtcbn07IiwiXG4gICAgICBpbXBvcnQgQVBJIGZyb20gXCIhLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5qZWN0U3R5bGVzSW50b1N0eWxlVGFnLmpzXCI7XG4gICAgICBpbXBvcnQgZG9tQVBJIGZyb20gXCIhLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc3R5bGVEb21BUEkuanNcIjtcbiAgICAgIGltcG9ydCBpbnNlcnRGbiBmcm9tIFwiIS4uLy4uLy4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luc2VydEJ5U2VsZWN0b3IuanNcIjtcbiAgICAgIGltcG9ydCBzZXRBdHRyaWJ1dGVzIGZyb20gXCIhLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc2V0QXR0cmlidXRlc1dpdGhvdXRBdHRyaWJ1dGVzLmpzXCI7XG4gICAgICBpbXBvcnQgaW5zZXJ0U3R5bGVFbGVtZW50IGZyb20gXCIhLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5zZXJ0U3R5bGVFbGVtZW50LmpzXCI7XG4gICAgICBpbXBvcnQgc3R5bGVUYWdUcmFuc2Zvcm1GbiBmcm9tIFwiIS4uLy4uLy4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3N0eWxlVGFnVHJhbnNmb3JtLmpzXCI7XG4gICAgICBpbXBvcnQgY29udGVudCwgKiBhcyBuYW1lZEV4cG9ydCBmcm9tIFwiISEuLi8uLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L2Nqcy5qcyEuL2Nzcy1yZXNldC5jc3NcIjtcbiAgICAgIFxuICAgICAgXG5cbnZhciBvcHRpb25zID0ge307XG5cbm9wdGlvbnMuc3R5bGVUYWdUcmFuc2Zvcm0gPSBzdHlsZVRhZ1RyYW5zZm9ybUZuO1xub3B0aW9ucy5zZXRBdHRyaWJ1dGVzID0gc2V0QXR0cmlidXRlcztcblxuICAgICAgb3B0aW9ucy5pbnNlcnQgPSBpbnNlcnRGbi5iaW5kKG51bGwsIFwiaGVhZFwiKTtcbiAgICBcbm9wdGlvbnMuZG9tQVBJID0gZG9tQVBJO1xub3B0aW9ucy5pbnNlcnRTdHlsZUVsZW1lbnQgPSBpbnNlcnRTdHlsZUVsZW1lbnQ7XG5cbnZhciB1cGRhdGUgPSBBUEkoY29udGVudCwgb3B0aW9ucyk7XG5cblxuXG5leHBvcnQgKiBmcm9tIFwiISEuLi8uLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L2Nqcy5qcyEuL2Nzcy1yZXNldC5jc3NcIjtcbiAgICAgICBleHBvcnQgZGVmYXVsdCBjb250ZW50ICYmIGNvbnRlbnQubG9jYWxzID8gY29udGVudC5sb2NhbHMgOiB1bmRlZmluZWQ7XG4iLCJcbiAgICAgIGltcG9ydCBBUEkgZnJvbSBcIiEuLi8uLi8uLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbmplY3RTdHlsZXNJbnRvU3R5bGVUYWcuanNcIjtcbiAgICAgIGltcG9ydCBkb21BUEkgZnJvbSBcIiEuLi8uLi8uLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zdHlsZURvbUFQSS5qc1wiO1xuICAgICAgaW1wb3J0IGluc2VydEZuIGZyb20gXCIhLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5zZXJ0QnlTZWxlY3Rvci5qc1wiO1xuICAgICAgaW1wb3J0IHNldEF0dHJpYnV0ZXMgZnJvbSBcIiEuLi8uLi8uLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zZXRBdHRyaWJ1dGVzV2l0aG91dEF0dHJpYnV0ZXMuanNcIjtcbiAgICAgIGltcG9ydCBpbnNlcnRTdHlsZUVsZW1lbnQgZnJvbSBcIiEuLi8uLi8uLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbnNlcnRTdHlsZUVsZW1lbnQuanNcIjtcbiAgICAgIGltcG9ydCBzdHlsZVRhZ1RyYW5zZm9ybUZuIGZyb20gXCIhLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc3R5bGVUYWdUcmFuc2Zvcm0uanNcIjtcbiAgICAgIGltcG9ydCBjb250ZW50LCAqIGFzIG5hbWVkRXhwb3J0IGZyb20gXCIhIS4uLy4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvY2pzLmpzIS4vaW5kZXguY3NzXCI7XG4gICAgICBcbiAgICAgIFxuXG52YXIgb3B0aW9ucyA9IHt9O1xuXG5vcHRpb25zLnN0eWxlVGFnVHJhbnNmb3JtID0gc3R5bGVUYWdUcmFuc2Zvcm1Gbjtcbm9wdGlvbnMuc2V0QXR0cmlidXRlcyA9IHNldEF0dHJpYnV0ZXM7XG5cbiAgICAgIG9wdGlvbnMuaW5zZXJ0ID0gaW5zZXJ0Rm4uYmluZChudWxsLCBcImhlYWRcIik7XG4gICAgXG5vcHRpb25zLmRvbUFQSSA9IGRvbUFQSTtcbm9wdGlvbnMuaW5zZXJ0U3R5bGVFbGVtZW50ID0gaW5zZXJ0U3R5bGVFbGVtZW50O1xuXG52YXIgdXBkYXRlID0gQVBJKGNvbnRlbnQsIG9wdGlvbnMpO1xuXG5cblxuZXhwb3J0ICogZnJvbSBcIiEhLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9janMuanMhLi9pbmRleC5jc3NcIjtcbiAgICAgICBleHBvcnQgZGVmYXVsdCBjb250ZW50ICYmIGNvbnRlbnQubG9jYWxzID8gY29udGVudC5sb2NhbHMgOiB1bmRlZmluZWQ7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIHN0eWxlc0luRE9NID0gW107XG5cbmZ1bmN0aW9uIGdldEluZGV4QnlJZGVudGlmaWVyKGlkZW50aWZpZXIpIHtcbiAgdmFyIHJlc3VsdCA9IC0xO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3R5bGVzSW5ET00ubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoc3R5bGVzSW5ET01baV0uaWRlbnRpZmllciA9PT0gaWRlbnRpZmllcikge1xuICAgICAgcmVzdWx0ID0gaTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmZ1bmN0aW9uIG1vZHVsZXNUb0RvbShsaXN0LCBvcHRpb25zKSB7XG4gIHZhciBpZENvdW50TWFwID0ge307XG4gIHZhciBpZGVudGlmaWVycyA9IFtdO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuICAgIHZhciBpdGVtID0gbGlzdFtpXTtcbiAgICB2YXIgaWQgPSBvcHRpb25zLmJhc2UgPyBpdGVtWzBdICsgb3B0aW9ucy5iYXNlIDogaXRlbVswXTtcbiAgICB2YXIgY291bnQgPSBpZENvdW50TWFwW2lkXSB8fCAwO1xuICAgIHZhciBpZGVudGlmaWVyID0gXCJcIi5jb25jYXQoaWQsIFwiIFwiKS5jb25jYXQoY291bnQpO1xuICAgIGlkQ291bnRNYXBbaWRdID0gY291bnQgKyAxO1xuICAgIHZhciBpbmRleEJ5SWRlbnRpZmllciA9IGdldEluZGV4QnlJZGVudGlmaWVyKGlkZW50aWZpZXIpO1xuICAgIHZhciBvYmogPSB7XG4gICAgICBjc3M6IGl0ZW1bMV0sXG4gICAgICBtZWRpYTogaXRlbVsyXSxcbiAgICAgIHNvdXJjZU1hcDogaXRlbVszXSxcbiAgICAgIHN1cHBvcnRzOiBpdGVtWzRdLFxuICAgICAgbGF5ZXI6IGl0ZW1bNV1cbiAgICB9O1xuXG4gICAgaWYgKGluZGV4QnlJZGVudGlmaWVyICE9PSAtMSkge1xuICAgICAgc3R5bGVzSW5ET01baW5kZXhCeUlkZW50aWZpZXJdLnJlZmVyZW5jZXMrKztcbiAgICAgIHN0eWxlc0luRE9NW2luZGV4QnlJZGVudGlmaWVyXS51cGRhdGVyKG9iaik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciB1cGRhdGVyID0gYWRkRWxlbWVudFN0eWxlKG9iaiwgb3B0aW9ucyk7XG4gICAgICBvcHRpb25zLmJ5SW5kZXggPSBpO1xuICAgICAgc3R5bGVzSW5ET00uc3BsaWNlKGksIDAsIHtcbiAgICAgICAgaWRlbnRpZmllcjogaWRlbnRpZmllcixcbiAgICAgICAgdXBkYXRlcjogdXBkYXRlcixcbiAgICAgICAgcmVmZXJlbmNlczogMVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWRlbnRpZmllcnMucHVzaChpZGVudGlmaWVyKTtcbiAgfVxuXG4gIHJldHVybiBpZGVudGlmaWVycztcbn1cblxuZnVuY3Rpb24gYWRkRWxlbWVudFN0eWxlKG9iaiwgb3B0aW9ucykge1xuICB2YXIgYXBpID0gb3B0aW9ucy5kb21BUEkob3B0aW9ucyk7XG4gIGFwaS51cGRhdGUob2JqKTtcblxuICB2YXIgdXBkYXRlciA9IGZ1bmN0aW9uIHVwZGF0ZXIobmV3T2JqKSB7XG4gICAgaWYgKG5ld09iaikge1xuICAgICAgaWYgKG5ld09iai5jc3MgPT09IG9iai5jc3MgJiYgbmV3T2JqLm1lZGlhID09PSBvYmoubWVkaWEgJiYgbmV3T2JqLnNvdXJjZU1hcCA9PT0gb2JqLnNvdXJjZU1hcCAmJiBuZXdPYmouc3VwcG9ydHMgPT09IG9iai5zdXBwb3J0cyAmJiBuZXdPYmoubGF5ZXIgPT09IG9iai5sYXllcikge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGFwaS51cGRhdGUob2JqID0gbmV3T2JqKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYXBpLnJlbW92ZSgpO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gdXBkYXRlcjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAobGlzdCwgb3B0aW9ucykge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgbGlzdCA9IGxpc3QgfHwgW107XG4gIHZhciBsYXN0SWRlbnRpZmllcnMgPSBtb2R1bGVzVG9Eb20obGlzdCwgb3B0aW9ucyk7XG4gIHJldHVybiBmdW5jdGlvbiB1cGRhdGUobmV3TGlzdCkge1xuICAgIG5ld0xpc3QgPSBuZXdMaXN0IHx8IFtdO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsYXN0SWRlbnRpZmllcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBpZGVudGlmaWVyID0gbGFzdElkZW50aWZpZXJzW2ldO1xuICAgICAgdmFyIGluZGV4ID0gZ2V0SW5kZXhCeUlkZW50aWZpZXIoaWRlbnRpZmllcik7XG4gICAgICBzdHlsZXNJbkRPTVtpbmRleF0ucmVmZXJlbmNlcy0tO1xuICAgIH1cblxuICAgIHZhciBuZXdMYXN0SWRlbnRpZmllcnMgPSBtb2R1bGVzVG9Eb20obmV3TGlzdCwgb3B0aW9ucyk7XG5cbiAgICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgbGFzdElkZW50aWZpZXJzLmxlbmd0aDsgX2krKykge1xuICAgICAgdmFyIF9pZGVudGlmaWVyID0gbGFzdElkZW50aWZpZXJzW19pXTtcblxuICAgICAgdmFyIF9pbmRleCA9IGdldEluZGV4QnlJZGVudGlmaWVyKF9pZGVudGlmaWVyKTtcblxuICAgICAgaWYgKHN0eWxlc0luRE9NW19pbmRleF0ucmVmZXJlbmNlcyA9PT0gMCkge1xuICAgICAgICBzdHlsZXNJbkRPTVtfaW5kZXhdLnVwZGF0ZXIoKTtcblxuICAgICAgICBzdHlsZXNJbkRPTS5zcGxpY2UoX2luZGV4LCAxKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBsYXN0SWRlbnRpZmllcnMgPSBuZXdMYXN0SWRlbnRpZmllcnM7XG4gIH07XG59OyIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgbWVtbyA9IHt9O1xuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5cbmZ1bmN0aW9uIGdldFRhcmdldCh0YXJnZXQpIHtcbiAgaWYgKHR5cGVvZiBtZW1vW3RhcmdldF0gPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICB2YXIgc3R5bGVUYXJnZXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRhcmdldCk7IC8vIFNwZWNpYWwgY2FzZSB0byByZXR1cm4gaGVhZCBvZiBpZnJhbWUgaW5zdGVhZCBvZiBpZnJhbWUgaXRzZWxmXG5cbiAgICBpZiAod2luZG93LkhUTUxJRnJhbWVFbGVtZW50ICYmIHN0eWxlVGFyZ2V0IGluc3RhbmNlb2Ygd2luZG93LkhUTUxJRnJhbWVFbGVtZW50KSB7XG4gICAgICB0cnkge1xuICAgICAgICAvLyBUaGlzIHdpbGwgdGhyb3cgYW4gZXhjZXB0aW9uIGlmIGFjY2VzcyB0byBpZnJhbWUgaXMgYmxvY2tlZFxuICAgICAgICAvLyBkdWUgdG8gY3Jvc3Mtb3JpZ2luIHJlc3RyaWN0aW9uc1xuICAgICAgICBzdHlsZVRhcmdldCA9IHN0eWxlVGFyZ2V0LmNvbnRlbnREb2N1bWVudC5oZWFkO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAvLyBpc3RhbmJ1bCBpZ25vcmUgbmV4dFxuICAgICAgICBzdHlsZVRhcmdldCA9IG51bGw7XG4gICAgICB9XG4gICAgfVxuXG4gICAgbWVtb1t0YXJnZXRdID0gc3R5bGVUYXJnZXQ7XG4gIH1cblxuICByZXR1cm4gbWVtb1t0YXJnZXRdO1xufVxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5cblxuZnVuY3Rpb24gaW5zZXJ0QnlTZWxlY3RvcihpbnNlcnQsIHN0eWxlKSB7XG4gIHZhciB0YXJnZXQgPSBnZXRUYXJnZXQoaW5zZXJ0KTtcblxuICBpZiAoIXRhcmdldCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIkNvdWxkbid0IGZpbmQgYSBzdHlsZSB0YXJnZXQuIFRoaXMgcHJvYmFibHkgbWVhbnMgdGhhdCB0aGUgdmFsdWUgZm9yIHRoZSAnaW5zZXJ0JyBwYXJhbWV0ZXIgaXMgaW52YWxpZC5cIik7XG4gIH1cblxuICB0YXJnZXQuYXBwZW5kQ2hpbGQoc3R5bGUpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGluc2VydEJ5U2VsZWN0b3I7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuZnVuY3Rpb24gaW5zZXJ0U3R5bGVFbGVtZW50KG9wdGlvbnMpIHtcbiAgdmFyIGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3R5bGVcIik7XG4gIG9wdGlvbnMuc2V0QXR0cmlidXRlcyhlbGVtZW50LCBvcHRpb25zLmF0dHJpYnV0ZXMpO1xuICBvcHRpb25zLmluc2VydChlbGVtZW50LCBvcHRpb25zLm9wdGlvbnMpO1xuICByZXR1cm4gZWxlbWVudDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpbnNlcnRTdHlsZUVsZW1lbnQ7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuZnVuY3Rpb24gc2V0QXR0cmlidXRlc1dpdGhvdXRBdHRyaWJ1dGVzKHN0eWxlRWxlbWVudCkge1xuICB2YXIgbm9uY2UgPSB0eXBlb2YgX193ZWJwYWNrX25vbmNlX18gIT09IFwidW5kZWZpbmVkXCIgPyBfX3dlYnBhY2tfbm9uY2VfXyA6IG51bGw7XG5cbiAgaWYgKG5vbmNlKSB7XG4gICAgc3R5bGVFbGVtZW50LnNldEF0dHJpYnV0ZShcIm5vbmNlXCIsIG5vbmNlKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHNldEF0dHJpYnV0ZXNXaXRob3V0QXR0cmlidXRlczsiLCJcInVzZSBzdHJpY3RcIjtcblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5mdW5jdGlvbiBhcHBseShzdHlsZUVsZW1lbnQsIG9wdGlvbnMsIG9iaikge1xuICB2YXIgY3NzID0gXCJcIjtcblxuICBpZiAob2JqLnN1cHBvcnRzKSB7XG4gICAgY3NzICs9IFwiQHN1cHBvcnRzIChcIi5jb25jYXQob2JqLnN1cHBvcnRzLCBcIikge1wiKTtcbiAgfVxuXG4gIGlmIChvYmoubWVkaWEpIHtcbiAgICBjc3MgKz0gXCJAbWVkaWEgXCIuY29uY2F0KG9iai5tZWRpYSwgXCIge1wiKTtcbiAgfVxuXG4gIHZhciBuZWVkTGF5ZXIgPSB0eXBlb2Ygb2JqLmxheWVyICE9PSBcInVuZGVmaW5lZFwiO1xuXG4gIGlmIChuZWVkTGF5ZXIpIHtcbiAgICBjc3MgKz0gXCJAbGF5ZXJcIi5jb25jYXQob2JqLmxheWVyLmxlbmd0aCA+IDAgPyBcIiBcIi5jb25jYXQob2JqLmxheWVyKSA6IFwiXCIsIFwiIHtcIik7XG4gIH1cblxuICBjc3MgKz0gb2JqLmNzcztcblxuICBpZiAobmVlZExheWVyKSB7XG4gICAgY3NzICs9IFwifVwiO1xuICB9XG5cbiAgaWYgKG9iai5tZWRpYSkge1xuICAgIGNzcyArPSBcIn1cIjtcbiAgfVxuXG4gIGlmIChvYmouc3VwcG9ydHMpIHtcbiAgICBjc3MgKz0gXCJ9XCI7XG4gIH1cblxuICB2YXIgc291cmNlTWFwID0gb2JqLnNvdXJjZU1hcDtcblxuICBpZiAoc291cmNlTWFwICYmIHR5cGVvZiBidG9hICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgY3NzICs9IFwiXFxuLyojIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxcIi5jb25jYXQoYnRvYSh1bmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQoSlNPTi5zdHJpbmdpZnkoc291cmNlTWFwKSkpKSwgXCIgKi9cIik7XG4gIH0gLy8gRm9yIG9sZCBJRVxuXG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAgKi9cblxuXG4gIG9wdGlvbnMuc3R5bGVUYWdUcmFuc2Zvcm0oY3NzLCBzdHlsZUVsZW1lbnQsIG9wdGlvbnMub3B0aW9ucyk7XG59XG5cbmZ1bmN0aW9uIHJlbW92ZVN0eWxlRWxlbWVudChzdHlsZUVsZW1lbnQpIHtcbiAgLy8gaXN0YW5idWwgaWdub3JlIGlmXG4gIGlmIChzdHlsZUVsZW1lbnQucGFyZW50Tm9kZSA9PT0gbnVsbCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHN0eWxlRWxlbWVudC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHN0eWxlRWxlbWVudCk7XG59XG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cblxuXG5mdW5jdGlvbiBkb21BUEkob3B0aW9ucykge1xuICB2YXIgc3R5bGVFbGVtZW50ID0gb3B0aW9ucy5pbnNlcnRTdHlsZUVsZW1lbnQob3B0aW9ucyk7XG4gIHJldHVybiB7XG4gICAgdXBkYXRlOiBmdW5jdGlvbiB1cGRhdGUob2JqKSB7XG4gICAgICBhcHBseShzdHlsZUVsZW1lbnQsIG9wdGlvbnMsIG9iaik7XG4gICAgfSxcbiAgICByZW1vdmU6IGZ1bmN0aW9uIHJlbW92ZSgpIHtcbiAgICAgIHJlbW92ZVN0eWxlRWxlbWVudChzdHlsZUVsZW1lbnQpO1xuICAgIH1cbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBkb21BUEk7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuZnVuY3Rpb24gc3R5bGVUYWdUcmFuc2Zvcm0oY3NzLCBzdHlsZUVsZW1lbnQpIHtcbiAgaWYgKHN0eWxlRWxlbWVudC5zdHlsZVNoZWV0KSB7XG4gICAgc3R5bGVFbGVtZW50LnN0eWxlU2hlZXQuY3NzVGV4dCA9IGNzcztcbiAgfSBlbHNlIHtcbiAgICB3aGlsZSAoc3R5bGVFbGVtZW50LmZpcnN0Q2hpbGQpIHtcbiAgICAgIHN0eWxlRWxlbWVudC5yZW1vdmVDaGlsZChzdHlsZUVsZW1lbnQuZmlyc3RDaGlsZCk7XG4gICAgfVxuXG4gICAgc3R5bGVFbGVtZW50LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGNzcykpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gc3R5bGVUYWdUcmFuc2Zvcm07Il0sIm5hbWVzIjpbIlNoaXAiLCJzaGlwVHlwZXMiLCJteUFycmF5IiwiR2FtZWJvYXJkIiwiU3F1YXJlIiwiaXNWYWNhbnQiLCJpbnRhY3QiLCJzaGlwUG9pbnRlciIsInNoaXBMb2NhdGlvbnMiLCJibG93VXAiLCJyZXBvcnQiLCJoaXQiLCJzdW5rIiwidHlwZSIsImdyYXZleWFyZCIsImlzU3VuayIsIm9jY3VweSIsInNoaXAiLCJwbGFjZW1lbnRJbmZvIiwidmFjYW5jeSIsInN0YXR1cyIsIm9jY3VwaWVkRm9yY2VzIiwiZXhwbG9kZWRGb3JjZXMiLCJib2FyZCIsImNoZWNrVmFjYW5jeSIsImNvb3JkaW5hdGUiLCJvcmllbnRhdGlvbiIsImxlbmd0aCIsImNoZWNrQ29vcmRpbmF0ZXMiLCJ0cmF2ZXJzZUJvYXJkIiwic3F1YXJlIiwiRXJyb3IiLCJwcm92aXNpb25BbmRBdHRhY2hTaGlwIiwic2hpcFR5cGUiLCJib2F0eU1jQm9hdEZhY2UiLCJjYWxsYmFjayIsInBsYWNlU2hpcCIsInN0YXJ0Q29vcmQiLCJlIiwibWVzc2FnZSIsInJlY2VpdmVBdHRhY2siLCJjb29yZCIsInJvdyIsImNvbHVtbiIsImJhdHRsZVJlcG9ydCIsInNpemUiLCJjaGVja0ZvclZpY3RvcnkiLCJQbGF5ZXIiLCJCb2FyZCIsIlB1YlN1YiIsImRpc3BsYXlUdXJuIiwicGxheWVyIiwicHVibGlzaCIsImR1cmF0aW9uIiwid2FpdFhtaWxpU2VjIiwieCIsIlByb21pc2UiLCJyZXNvbHZlIiwic2V0VGltZW91dCIsIkdhbWVMb29wIiwiaHVtYW5Cb2FyZCIsImVuZW15Qm9hcmQiLCJodW1hbiIsImVuZW15IiwicGxhY2VTaGlwcyIsInRha2VNb3ZlIiwid2lubmVyIiwic2hpcFNlYXJjaCIsInJlbWFpbmluZ1NoaXBzIiwicmVtb3ZlIiwiZmlsdGVyIiwiZ2V0bGVuZ3RocyIsIm1hcCIsImxhcmdlc3QiLCJNYXRoIiwibWF4Iiwic21hbGxlc3QiLCJtaW4iLCJzaGlwcyIsImNvb3JkVG9vbHMiLCJyYW5kb20iLCJwYXNzQ29vcmQiLCJ0eXBlSW4iLCJwbGF5ZXJCb2FyZCIsImdhcnJpc29uIiwiYmF0dGxlZmllbGQiLCJhdHRhY2tFdmVudCIsImdldE5laWdoYm9ycyIsImRpciIsInJldHVyblNldCIsImNoZWNrTG93IiwibnVtIiwiY2hlY2tIaWdoIiwicHVzaCIsInZhbGlkYXRlQ29vcmRSYW5nZSIsImJhdHRsZVBsYW4iLCJvYmpQcm90byIsImhldXIiLCJwYXN0TW92ZXMiLCJzdHJ1Y3R1cmVkQ2xvbmUiLCJoaWdoZXN0SGV1cmlzdGljIiwidHVybkxhdGNoIiwidHVyblByb21pc2UiLCJ0dXJuUHJvbWlzZVJlc29sdmVyIiwiY2hlY2tNb3ZlIiwicmFuZG9tTW92ZSIsIm9wdGlvbmFsU2V0IiwiY29vcmRHZW5lcmF0b3IiLCJmcm9tU2V0IiwiZXZhbFVuc3VuayIsImV2YWxVbmhpdCIsImNoZWNrRml0Iiwib3JpIiwiZml0cyIsImhldXJQbHVzT25lIiwidXBkYXRlUmVwb3J0SGV1ciIsImZpdHNIb3Jpem9udGFsbHkiLCJmaXRzVmVydGljYWxseSIsInVwZGF0ZUhldXJpc3RpY1ZhbHVlIiwiYXBwbHlUb0VhY2giLCJsZW5ndGhzIiwiaSIsImoiLCJ0aGlzQ29vcmQiLCJrIiwiZ2V0SGlnaGVzdEhldXJpc3RpY1NldCIsImNvb3JkcyIsImZpbmRVbnN1bmtTaGlwIiwibnRoTWF0Y2giLCJ1bnN1bmsiLCJsaW5lYXJTZWFyY2giLCJjaGVja0FkamFjZW50IiwiZGVjaWRlTW92ZSIsImF0dGFja0Nvb3JkIiwiY29vcmRpbmF0ZVNldCIsInVuc3Vua0F0dGVtcHQyIiwidGltZW91dERlbGF5IiwibW9zdFByb2JhYmxlTG9jYXRpb25zIiwibGFzdEluUm93IiwibGFzdEluQ29sdW1uIiwicmVzb2x2ZVR1cm5Qcm9taXNlIiwicmVzZXRUdXJuUHJvbWlzZSIsInJlbWVtYmVyIiwiY29vcmRzVG9VcGRhdGUiLCJnZXRDb29yZGluYXRlTGlzdCIsInIiLCJjIiwicHVibGlzaE1vdmUiLCJkZWNpZGVNb3ZlSHVtYW4iLCJjaG9vc2VBdHRhY2tGbiIsImNoZWNrU2VjbHVzaW9uIiwiY3VycmVudFR5cGUiLCJyYW5kb21DaG9pY2UiLCJhbGxDb29yZHMiLCJvdXRlclZhY2FuY3lGbiIsImlubmVyVmFjYW5jeUZuIiwicGxhY2VTaGlwc0F1dG8iLCJPYmplY3QiLCJrZXlzIiwic2hpcElzTm90UGxhY2VkIiwid2FpdEZvclBsYWNlbWVudCIsInNoaXBFdmVudCIsInN1YnNjcmliZSIsImRhdGEiLCJwbGFjZVNoaXBGcm9tUHJvbWlzZVJlc3VsdCIsInBsYWNlbWVudCIsInBsYWNlU2hpcHNVSSIsImNhcnJpZXJQcm9taXNlIiwiYmF0dGxlc2hpcFByb21pc2UiLCJzdWJtYXJpbmVQcm9taXNlIiwiZGVzdHJveWVyUHJvbWlzZSIsInBhdHJvbGJvYXRQcm9taXNlIiwicGxhY2VTaGlwc0Z1bmN0aW9uIiwiaW5pdFNoaXBQbGFjZW1lbnRTdWJzY3JpcHRpb25zIiwiaW5pdFRha2VUdXJuU3Vic2NyaXB0aW9ucyIsImluaXRFdmVudFN1YnNjcmlwdGlvbnMiLCJyYW5kb21Sb3ciLCJmbG9vciIsInJhbmRvbUNvbHVtbiIsInJhbmRvbUluZGV4Iiwicm91bmQiLCJ2YWwiLCJzZXQiLCJwb3NzaWJsZUNvb3JkcyIsInVzZWRJbmRleGVzIiwiZ2V0UmFuZG9tQ29vcmRGcm9tU2V0IiwicmFuZG9taW5kZXgiLCJpbmNsdWRlcyIsInNoaXB0eXBlIiwiaGl0cyIsImNhcnJpZXIiLCJiYXR0bGVzaGlwIiwiZGVzdHJveWVyIiwic3VibWFyaW5lIiwicGF0cm9sYm9hdCIsInNpemVJbiIsInBvcHVsYXRvciIsImFycmF5MkQiLCJpbml0aWFsaXplQXJyYXkiLCJib2FyZE9iaiIsIkFycmF5IiwiZnJvbSIsImNiayIsInRyYXZlcnNpbmdWYXIiLCJ2YWx1ZSIsImFjdGlvbiIsInRoaXNNYXRjaCIsImVhY2hDb29yZCIsImFyciIsInN0YXJ0aW5nQ29vcmQiLCJjb2x1bW5SZXN1bHQiLCJyb3dSZXN1bHQiLCJzdWJzY3JpYmVycyIsImV2ZW50TmFtZSIsImlzQXJyYXkiLCJmb3JFYWNoIiwicmVzZXQiLCJyZW1vdmVDaGlsZHJlbiIsImFyZ3MiLCJmaXJzdENoaWxkIiwicmVtb3ZlQ2hpbGQiLCJsYXN0Q2hpbGQiLCJtYWtlU2VsZWN0b3JGcm9tQXJyYXkiLCJjb29yZEFyciIsImdldEFsbFNlbGVjdG9ycyIsImNvb3JkTGlzdCIsInNlbGVjdG9yIiwiZ2V0Q29vcmRGcm9tRWxlbWVudCIsImVsZW1lbnQiLCJOdW1iZXIiLCJnZXRBdHRyaWJ1dGUiLCJTaGlwUGxhY2VDb250cm9scyIsImhvdmVyQ29udHJvbGxlciIsIkFib3J0Q29udHJvbGxlciIsInBsYWNlQ29udHJvbGxlciIsIndhdGVycyIsImRvY3VtZW50IiwicXVlcnlTZWxlY3RvciIsImN1cnJlbnRTcXVhcmUiLCJjdXJyZW50UGxhY2VtZW50SW5mbyIsInNoaXBUeXBlc0FyciIsImN1cnJlbnRTaGlwUGxhY2VtZW50IiwiY29udHJvbERvbUVsZW1lbnRzIiwicXVlcnlTZWxlY3RvckFsbCIsIm9yaWVudGF0aW9ucyIsImN1cnJlbnRPcmllbnRhdGlvbiIsInBsYWNlU2hpcExhdGNoIiwiZGlzcGxheVNoaXBQbGFjZW1lbnRNZXNzYWdlIiwiZGlzcGxheVBsYWNlbWVudFBvc3NpYmlsaXR5TWVzc2FnZSIsInBvc3NpYmxlIiwiY2hhbmdlT3JpZW50YXRpb25MaXN0ZW5lciIsImJ0biIsImdldEVsZW1lbnRCeUlkIiwic2lnbmFsIiwiYWRkRXZlbnRMaXN0ZW5lciIsInRhcmdldCIsImlubmVyVGV4dCIsInJlbW92ZVNoaXBQbGFjZW1lbnRJbmRpY2F0aW9ucyIsImVsZW1lbnRzIiwiY2xhc3NMaXN0IiwicXVlcnlQbGFjZW1lbnQiLCJjdXJyZW50VGFyZ2V0Iiwic2V0Q2xhc3NPblNxdWFyZXMiLCJjbGFzc0luIiwiZG9tRWxlbWVudHMiLCJhZGQiLCJkaXNwbGF5U3RhdHVzIiwic2hvd1Bvc3NpYmlsaXR5IiwiZGlzcGxheVBvc3NpYmlsaXR5IiwicmVzdWx0IiwiZW5hYmxlVmlldyIsInVwZGF0ZVBsYWNlU2hpcENvbnRyb2xzVmlldyIsImRpc2FibGVWaWV3IiwiZGlzYWJsZSIsImFib3J0IiwiaW5pdCIsInF1ZXJ5IiwiYXR0YWNrVmlhRG9tIiwidHVybkNvbnRyb2xzIiwiZW5lbXlXYXRlcnMiLCJzcXVhcmVzIiwidmlldyIsIm1lc3NhZ2VPbmUiLCJtZXNzYWdlVHdvIiwicmVzZXRCdG4iLCJpbml0R3JpZCIsImRvbUVsZW1lbnQiLCJDQksiLCJjcmVhdGVFbGVtZW50Iiwic2V0QXR0cmlidXRlIiwiYXBwZW5kQ2hpbGQiLCJyZW1vdmVNZXNzYWdlIiwiZGlzcGxheU1lc3NhZ2UiLCJvcHRpb25hbER1cmF0aW9uIiwidGV4dG5vZGUiLCJjcmVhdGVUZXh0Tm9kZSIsInNoaWZ0IiwiZGlyZWN0aW9uIiwiZGlzcGxheVN1bmtTaGlwIiwidmljdGltIiwibWFrZVNlbGVjdG9yRnJvbUNvb3JkIiwiYXR0YWNrUmVzdWx0IiwiZGlzcGxheUF0dGFja1Jlc3VsdCIsInBheWxvYWQiLCJncmlkU3F1YXJlIiwiYWRkQ2xhc3MiLCJnYW1lQ29tcGxldGUiLCJnYW1lU3RhcnQiLCJ0dXJuQ29udHJvbGxlciIsImdhbWVSZXNldCIsInBsYWNlQ250cmwiLCJnYW1lU3RhcnRJbmRpY2F0aW9uIiwiYWRkVHJhbnNpdGlvbiIsImluaXRSZXNldEJ0biJdLCJzb3VyY2VSb290IjoiIn0=