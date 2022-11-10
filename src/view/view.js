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
          square.addEventListener("click", (e) => CBK.cbk(e), {
            signal: CBK.signal,
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
    displayMessage(message, 3000);
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
    // Clear subscriptions
    PubSub.reset();
    // Initialize a new game loop
    GameLoop();
    // disable view of enemy board
    shift(true);
    // subscribe to additional board transforms for mobile devices
    addMobileOnlyBoardTransitions();
    // disable view of the reset button
    resetBtn.classList.add("display-disabled");
    // clear victory/gamelost message
    displayMessage("");
    // subsribe to display-message event
    PubSub.subscribe("display-message", (data) =>
      displayMessage(data.message, data.duration)
    );

    // initialize ship placement control object
    const placeCntrl = ShipPlaceControls();
    // Grid:
    // clear grid
    removeChildren(...waters);
    // initialize grid
    initGrid(waters[0], 10, placeCntrl.query());
    initGrid(waters[1], 10);
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

  function addMobileOnlyBoardTransitions() {
    PubSub.subscribe("setup-turn-view", (data) => {
      if (data.player === "human") {
        waters[0].classList.remove("board-shift-mobile");
        waters[1].classList.remove("board-shift-mobile");
      } else {
        waters[0].classList.add("board-shift-mobile");
        waters[1].classList.add("board-shift-mobile");
      }
    });
  }

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
