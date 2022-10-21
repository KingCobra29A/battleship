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
 **    enemy-attack
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

  // Asyncronous callback
  // Happens on "game-reset" subscribe event
  // Returns the view to the initial state
  function gameReset() {
    // initialize ship placement control object
    const placeCntrl = ShipPlaceControls();
    // Grid:
    // clear grid
    removeChildren(...waters);
    // initialize grid
    initGrid(document.querySelector(".allied-waters"), 10, placeCntrl.query());
    initGrid(document.querySelector(".enemy-waters"), 10);
    // add click, hover eventlisteners for placing ships
    placeCntrl.init();
    // Placement controls:
    //    reset classes
    //    display controls
    //      enable event listeners:
    //        change orientation
    //        select ship
    // Reset status variables ?
  }

  // HACK
  // function initSelectPlacementTools() {
  //   let carrierbtn = document.getElementById("place-carrier");
  //   let battleshipbtn = document.getElementById("battleship-carrier");
  //   let destroyerbtn = document.getElementById("destroyer-carrier");
  //   let submarinebtn = document.getElementById("submarine-carrier");
  //   let patrolboatbtn = document.getElementById("patrolboat-carrier");
  //
  //   carrierbtn.addEventListener("click", () => {
  //     currentShipPlacement = "carrier";
  //   });
  //   battleshipbtn.addEventListener("click", () => {
  //     currentShipPlacement = "battleship";
  //   });
  //   destroyerbtn.addEventListener("click", () => {
  //     currentShipPlacement = "destroyer";
  //   });
  //   submarinebtn.addEventListener("click", () => {
  //     currentShipPlacement = "submarine";
  //   });
  //   patrolboatbtn.addEventListener("click", () => {
  //     currentShipPlacement = "patrolboat";
  //   });
  // }

  gameReset();

  // Asyncronous callback
  // Happens on "enemy-attack" subscribe event
  // Updates the DOM to display the enemy attack
  function enemyAttack(payload) {}

  // Asyncronous callback
  // Happens on "enemy-attack" subscribe event
  // Updates the DOM to display the enemy attack
  function playerAttackResult(payload) {}

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
    //    Allied waters:
    //      subscribe to "enemy-attack"
    //    Subscribe to game win/over
  }

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
