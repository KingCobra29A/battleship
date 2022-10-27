import PubSub from "../utilities/pubSub";
import removeChildren from "../utilities/removeChildren";
import GameLoop from "../gameloop/gameloop";
import ShipPlaceControls from "./shipPlaceControls";
import turnControls from "./takeTurnControls";
import coordTools from "./coordSelectorTools";
import shipTypes from "../ship/shiptypes";
import "./style/css-reset.css";
import "./style/index.css";

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
  const waters = [
    document.querySelector(".allied-waters"),
    document.querySelector(".enemy-waters"),
  ];

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
          square.addEventListener("mouseenter", (e) => CBK.cbk(e), {
            signal: CBK.signal,
          });
        }
        row.appendChild(square);
      }
      domElement.appendChild(row);
    }
  }

  function displaySunkShip(victim, graveyard, type) {
    const message = `${victim} player's ${type} was destroyed`;
    const { length } = graveyard;
    const { coordinate } = graveyard;
    const { orientation } = graveyard;
    const coordList = coordTools.getCoordinateList(
      length,
      coordinate,
      orientation
    );
    const selector = coordTools.getAllSelectors(coordList);
    const board = victim === "human" ? waters[0] : waters[1];
    const elements = board.querySelectorAll(selector);
    for (let i = 0; i < elements.length; i += 1) {
      elements[i].classList.add("exploded");
    }
  }

  // Used in getAllSelectors
  //  is passed an array: [row, column]
  //  returns a css selector
  function makeSelectorFromCoord(coord) {
    const { row } = coord;
    const { column } = coord;
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
    console.log(winner);
    console.log(`MOTHER FUCKIN ${winner} WON`);
    setTimeout(gameReset, 2000);
  }

  // Asynchronous callback
  // Happens on "game-start" subscribe event
  // Prepares the view for the "Turn block" of the game loop
  function gameStart() {
    // Turn off display of ship placement controls
    // Turn on controls for attacking enemy waters
    const turnController = turnControls();
    // Grid:
    //    clear event listeners
    //    Enemy waters:
    //      subscribe to successful attacks, sunken ships
    PubSub.subscribe("enemy-attack-result", attackResult("computer"));
    //    Allied waters:
    //      subscribe to "enemy-attack"
    PubSub.subscribe("player-attack-result", attackResult("human"));
    //    Subscribe to game win/over
    PubSub.subscribe("game-won", gameComplete);
  }

  // Asyncronous callback
  // Happens on "game-reset" subscribe event
  // Returns the view to the initial state
  async function gameReset() {
    PubSub.reset();
    GameLoop();

    // initialize ship placement control object
    const placeCntrl = ShipPlaceControls();
    // Grid:
    // clear grid
    removeChildren(...waters);
    // initialize grid
    initGrid(document.querySelector(".allied-waters"), 10, placeCntrl.query());
    initGrid(document.querySelector(".enemy-waters"), 10);
    // initialize the ship placement controls / event listeners
    placeCntrl.init();
    // subscribe to game-start event:
    //    Create a promise
    const gameStartIndication = new Promise((resolve) => {
      //  Subscribe to game-start. Resolve the promise when the event happens
      PubSub.subscribe("game-start", (data) => {
        resolve(data);
      });
    });
    await gameStartIndication;
    placeCntrl.disable();
    gameStart();
  }

  gameReset();

  // // subscribe(eventName, callback)
  // async function waitForPlacement(shipEvent) {
  //   const returnPromise = new Promise();
  //   PubSub.subscribe(shipEvent, (data) => returnPromise.resolve(data));
  //   return returnPromise;
  // }

  return {};
})();
