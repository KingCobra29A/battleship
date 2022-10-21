import PubSub from "../utilities/pubSub";
import shipTypes from "../ship/shiptypes";

const Player = (typeIn, playerBoard, enemyBoard) => {
  const type = typeIn;
  const garrison = playerBoard;
  const battlefield = enemyBoard;

  // utility function for passing coordinates to gameboard
  //    passCoord(2,9) returns { row:2 , column:9 }
  const passCoord = (row, column) => ({ row, column });

  // battlePlan factory function is used by computer player
  //  is responsible for determining each move taken by AI
  const battlePlan = (() => {
    let pastMoves = [];
    let prevousMove;
    const checkMove = (coord) => {
      if (pastMoves.includes(coord)) return false;
      return true;
    };
    const randomMove = () => {
      let randomRow;
      let randomColumn;
      let coord;
      do {
        randomRow = Math.floor(Math.random() * 10);
        randomColumn = Math.floor(Math.random() * 10);
        coord = passCoord(randomRow, randomColumn);
      } while (!checkMove(coord));
      return coord;
    };
    const decideMove = () => Promise.resolve(randomMove());

    return {
      set remember(coord) {
        pastMoves.push(coord);
      },
      checkMove,
      decideMove,
    };
  })();

  // Used by human player to attack enemy board via UI
  //    pub/sub pattern is used here between View, Player
  const decideMoveHuman = () => Promise.resolve(battlePlan.decideMove());

  // HACK Does not work as is.
  //  should not throw an error.needs to do own error handling.
  //  should not finish until viable move has been taken
  const takeMove = async () => {
    const chooseAttackFn =
      type === "human" ? decideMoveHuman : battlePlan.decideMove;
    const attackCoord = await chooseAttackFn();

    if (battlePlan.checkMove(attackCoord.value)) {
      enemyBoard.receiveAttack(attackCoord.value);
      battlePlan.remember(attackCoord.value);
      // TODO publish event for view in order to display this attack
      return Promise.resolve(true);
    }
    throw new Error("Repeat move");
  };

  // Temporary function, places ships in a cluster at top left of grid
  //  will be removed from code base once algorithms are in place
  const placeShipsStaticly = () => {
    for (let i = 0; i < Object.keys(shipTypes).length; i += 1) {
      const shiptype = Object.keys(shipTypes)[i];
      garrison.placeShip(shiptype, passCoord(0, i), "vertical");
    }
  };

  // Used by computer player to place ships
  //    algorithm is used to decide locations
  //    ships are placed synchronously via Gameboard.placeShip() method
  //    a promise is returned in order to avoid zalgo inside of Player.placeShips()
  const placeShipsAuto = () => {
    placeShipsStaticly();
    // TODO: actually implement an algorithm
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
    console.log("CARRIER PLACED, BITCH");

    placement = await battleshipPromise;
    placeShipFromPromiseResult(placement);
    console.log("BATTLESHIP PLACED, BITCH");

    placement = await destroyerPromise;
    placeShipFromPromiseResult("destroyer", destroyerPromise);
    console.log("Destroyer PLACED, BITCH");

    placement = await submarinePromise;
    placeShipFromPromiseResult("submarine", submarinePromise);

    placement = await patrolboatPromise;
    placeShipFromPromiseResult("patrolboat", patrolboatPromise);

    return Promise.resolve(true);
  };

  // Used in game loop to place all of the players ships
  const placeShips = async () => {
    const placeShipsFunction = type === "human" ? placeShipsUI : placeShipsAuto;
    await placeShipsFunction();

    return Promise.resolve(true);
  };

  // TODO: get rid of IIFE
  // TODO: move to init function of some kind
  (function informDecisionSetup() {
    PubSub.subscribe("place-ship-hover", (data) => {
      try {
        garrison.checkVacancy(data.type, data.coordinate, data.orientation);
        PubSub.publish("place-ship-hover-result", 1);
      } catch {
        PubSub.publish("place-ship-hover-result", 0);
      }
    });
  })();

  return {
    takeMove,
    placeShips,
  };
};

export default Player;
