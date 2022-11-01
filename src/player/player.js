import PubSub from "../utilities/pubSub";
import shipTypes from "../ship/shiptypes";
import coordTools from "../view/coordSelectorTools";
import myArray from "../utilities/myArray";

const Player = (typeIn, playerBoard, enemyBoard) => {
  const type = typeIn;
  const garrison = playerBoard;
  const battlefield = enemyBoard;
  const attackEvent =
    type === "human" ? "player-attack-result" : "enemy-attack-result";

  // utility function for passing coordinates to gameboard
  //    passCoord(2,9) returns { row:2 , column:9 }
  const passCoord = (row, column) => ({ row, column });

  function randomCoord() {
    const randomRow = Math.floor(Math.random() * 10);
    const randomColumn = Math.floor(Math.random() * 10);
    return passCoord(randomRow, randomColumn);
  }

  function randomOrientation() {
    const randomIndex = Math.round(Math.random());
    const orientation = randomIndex === 0 ? "horizontal" : "vertical";
    return orientation;
  }

  // battlePlan factory function is used by computer player
  //  is responsible for determining each move taken by AI
  const battlePlan = (() => {
    const pastMoves = [];
    let turnLatch = 1;
    let turnPromise;
    let turnPromiseResolver = () => {};

    const checkMove = (coord) => {
      if (
        pastMoves.some(
          (element) =>
            element.row === coord.row && element.column === coord.column
        )
      )
        return false;
      return true;
    };
    const randomMove = () => {
      let coord;
      do {
        coord = randomCoord();
      } while (!checkMove(coord));
      return coord;
    };

    const decideMove = () =>
      new Promise((resolve) => {
        setTimeout(() => resolve(randomMove()), 100);
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

    return {
      set remember(coord) {
        pastMoves.push(coord);
      },
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
      battlePlan.remember = attackCoord;
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
          randomChoice = randomCoord();
          // select random orientation
          orientation = randomOrientation();
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
