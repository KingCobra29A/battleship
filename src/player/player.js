import PubSub from "../utilities/pubSub";
import shipTypes from "../ship/shiptypes";
import coordTools from "../view/coordSelectorTools";
import myArray from "../utilities/myArray";
import random from "./random";
import shipSearch from "./manageShipSearch";

// utility function for passing coordinates to gameboard
//    passCoord(2,9) returns { row:2 , column:9 }
const passCoord = (row, column) => ({ row, column });

const Player = (typeIn, playerBoard, enemyBoard) => {
  const type = typeIn;
  const garrison = playerBoard;
  const battlefield = enemyBoard;
  const attackEvent =
    type === "human" ? "player-attack-result" : "enemy-attack-result";
  const remainingShips = shipSearch();

  function getNeighbors(coord, dir) {
    const returnSet = [];
    const checkLow = (num) => num - 1 > -1;
    const checkHigh = (num) => num + 1 < 10;
    const { row } = coord;
    const { column } = coord;
    if (dir === "horizontal") {
      if (checkLow(column)) returnSet.push({ row, column: coord.column - 1 });
      if (checkHigh(column)) returnSet.push({ row, column: coord.column + 1 });
    } else if (dir === "vertical") {
      if (checkLow(row)) returnSet.push({ row: coord.row - 1, column });
      if (checkHigh(row)) returnSet.push({ row: coord.row + 1, column });
    } else {
      if (checkLow(column)) returnSet.push({ row, column: coord.column - 1 });
      if (checkHigh(column)) returnSet.push({ row, column: coord.column + 1 });
      if (checkLow(row)) returnSet.push({ row: coord.row - 1, column });
      if (checkHigh(row)) returnSet.push({ row: coord.row + 1, column });
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
    const objProto = { hit: false, sunk: false, intact: true, heur: 0 };
    const pastMoves = myArray(10, () => structuredClone(objProto));
    let highestHeuristic = 0;

    // turnLatch, turnPromise, turnPromiseResolver all used by human player
    let turnLatch = 1;
    let turnPromise;
    let turnPromiseResolver = () => {};

    // Returns true if the coord has not yet been attacked
    //  returns false otherwise
    const checkMove = (coord) => {
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
    const randomMove = (optionalSet) => {
      let coord;
      const coordGenerator =
        typeof optionalSet === "undefined"
          ? random.coord
          : random.fromSet(optionalSet);
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
        pastMoves.traverseBoard(length, coord, ori, (report) => {
          fits = fits && report.intact;
        });
      } catch {
        // Error was thrown due to imposible placement
        return false;
      }
      return fits;
    }

    function heurPlusOne(length, coord, ori) {
      pastMoves.traverseBoard(length, coord, ori, (report) => {
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
      pastMoves.applyToEach((report) => {
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
      new Promise((resolve) => {
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
      turnPromise = new Promise((resolve) => {
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
      const { row } = report.coord;
      const { column } = report.coord;
      pastMoves[row][column] = report;
      // if the ship is sunk, update all relevant reports to reflect this
      if (report.sunk === true) {
        // delete the ship from the search
        remainingShips.remove(report.type);
        // get all relevant coordinates
        const coordsToUpdate = coordTools.getCoordinateList(
          report.graveyard.length,
          report.graveyard.coordinate,
          report.graveyard.orientation
        );
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
      decideMove,
    };
  })();

  //  Used in takeMove method
  //  Publishes the attackEvent (defined at root of Player object
  //    attack event is either "player-attack-result" or "enemy-attack-result"
  //  Notifies the View Module of the attack result so the DOM can be updated
  function publishMove(report) {
    PubSub.publish(attackEvent, report);
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
    const chooseAttackFn =
      type === "human" ? decideMoveHuman : battlePlan.decideMove;
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
    const length = shipTypes[currentType];
    // create array of coordinate objects
    const allCoords = coordTools.allCoords(length, randomChoice, orientation);
    // checkAdjacent returns false if everything is vacant
    // each call to an elements callback should return false if vacant
    const outerVacancyFn = garrison.board.checkAdjacent;
    // square.vacancy returns true if vacant
    const innerVacancyFn = (square) => !square.vacancy;
    for (let i = 0; i < allCoords.length; i += 1) {
      if (outerVacancyFn(allCoords[i], innerVacancyFn))
        throw new Error("Too crowded");
    }
    return false;
  }

  // Used by computer player to place ships
  //    algorithm is used to decide locations
  //    ships are placed synchronously via Gameboard.placeShip() method
  //    a promise is returned in order to avoid zalgo inside of Player.placeShips()
  const placeShipsAuto = () => {
    for (let i = 0; i < Object.keys(shipTypes).length; i += 1) {
      // initialize while loop condition
      let shipIsNotPlaced = true;
      // initialize/declare parameters for ship placement
      const currentType = Object.keys(shipTypes)[i];
      let randomChoice;
      let orientation;
      while (shipIsNotPlaced) {
        try {
          // select random coordinate
          randomChoice = random.coord();
          // select random orientation
          orientation = random.orientation();
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
    return new Promise((resolve) => {
      // Subscribe to shipEvent. Resolve the promise when the event happens
      PubSub.subscribe(shipEvent, (data) => {
        resolve(data);
      });
    });
  }

  //  Wrapper around GameBoard.placeShip
  //    Makes a call to the method using a promise which contains the relevant parameters
  const placeShipFromPromiseResult = (placement) => {
    garrison.placeShip(
      placement.type,
      placement.coordinate,
      placement.orientation
    );
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
    PubSub.subscribe("place-ship-hover", (data) => {
      try {
        garrison.checkVacancy(data.type, data.coordinate, data.orientation);
        PubSub.publish("place-ship-hover-result", 1);
      } catch {
        PubSub.publish("place-ship-hover-result", 0);
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
    PubSub.subscribe("game-start", () => {
      PubSub.subscribe("player-attack", (data) => {
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
    placeShips,
  };
};

export default Player;
