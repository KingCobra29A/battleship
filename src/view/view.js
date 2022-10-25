import PubSub from "../utilities/pubSub";
import removeChildren from "../utilities/removeChildren";
import GameLoop from "../gameloop/gameloop";
import ShipPlaceControls from "./shipPlaceControls";
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
 **    enemy-attack-result
 **    player-attack-result
 */

const view = (() => {
  const placeController = new AbortController();

  const attackController = new AbortController();
  const waters = [
    document.querySelector(".allied-waters"),
    document.querySelector(".enemy-waters"),
  ];

  let currentSquare;

  function displayOnGrid(coordArray, displayType) {}

  const setPlayerBoardCallbacks = (cbk, spaces) => {};

  const setComputerBoardCallbacks = (cbk, spaces) => {};

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

  function applyToSelection(selectorIn, callback) {
    const nodes = document.querySelectorAll(selectorIn);
    for (let i = 0; i < nodes.length; i += 1) {
      callback(nodes[i]);
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
      gridSquare.classList.add(addClass);
    };
  }

  // Asynchronous callback
  // Happens on "game-start" subscribe event
  // Prepares the view for the "Turn block" of the game loop
  function gameStart() {
    // Turn off display of ship placement controls
    // Grid:
    //    clear event listeners
    //    Enemy waters:
    //      add click eventlisteners to publish attacks
    //      subscribe to successful attacks, sunken ships
    PubSub.subscribe("enemy-attack-result", attackResult("computer"));
    //    Allied waters:
    //      subscribe to "enemy-attack"
    PubSub.subscribe("player-attack-result", attackResult("human"));
    //    Subscribe to game win/over
  }

  // Asyncronous callback
  // Happens on "game-reset" subscribe event
  // Returns the view to the initial state
  async function gameReset() {
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

  // Asynchronous callback
  // Happens on "game-won" subscribe event
  // Ends the "Turn block", displays the winner
  function gameComplete() {}

  // // subscribe(eventName, callback)
  // async function waitForPlacement(shipEvent) {
  //   const returnPromise = new Promise();
  //   PubSub.subscribe(shipEvent, (data) => returnPromise.resolve(data));
  //   return returnPromise;
  // }

  return {};
})();

const startGame = GameLoop();
