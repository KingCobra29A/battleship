import PubSub from "../utilities/pubSub";
import getCoordFromElement from "./getCoordFromElement";
import shipTypes from "../ship/shiptypes";

/*  Factory function
 ** Returns a controller to handle the ship placement controls
 ** Used in gameReset(), gameStart()
 **
 */
function ShipPlaceControls() {
  const hoverController = new AbortController();
  const waters = document.querySelector(".allied-waters");
  let currentSquare;
  let currentPlacementInfo;
  const shipTypesArr = [
    "carrier",
    "battleship",
    "destroyer",
    "submarine",
    "patrolboat",
  ];
  let currentShipPlacement = 0;
  const orientations = ["horizontal", "vertical"];
  let currentOrientation = 0;

  function changeOrientationListener() {
    const btn = document.getElementById("orientation-btn");
    btn.addEventListener("click", (e) => {
      currentOrientation = currentOrientation === 0 ? 1 : 0;
      e.target.innerText = orientations[currentOrientation];
    });
  }

  // Helper function used in queryPlacement, init
  // Turns off "invalid-placement", "valid-placement" classes, if they exist
  function removeShipPlacementIndications() {
    const elements = document.querySelectorAll(
      ".invalid-placement,.valid-placement"
    );
    for (let i = 0; i < elements.length; i += 1) {
      elements[i].classList.remove("invalid-placement", "valid-placement");
    }
  }

  // Helper function used in init
  // Sets up an eventlistner to remove placementIndications
  //    when leaving the allied-waters dom element
  function leaveSelectionWindowListener() {
    const fn = removeShipPlacementIndications;
    const { signal } = hoverController;
    waters.addEventListener("mouseout", (e) => fn(e.target), {
      signal,
    });
  }

  // Check to see if placement is possible
  // this is going to publish "place-ship-hover"
  function queryPlacement(e) {
    removeShipPlacementIndications();
    currentSquare = e.currentTarget;
    const coordinate = getCoordFromElement(currentSquare);
    const type = shipTypesArr[currentShipPlacement];
    const orientation = orientations[currentOrientation];
    currentPlacementInfo = { type, coordinate, orientation };
    PubSub.publish("place-ship-hover", currentPlacementInfo);
  }

  //  Used to create an array of coord arrays
  //  ex: getcoordinateList(4, {row:0, column:0}, horizontal)
  //    will return: [[0,0],[0,1],[0,2],[0,3]]
  function getCoordinateList(length, coord, ori) {
    const coords = [];
    let { row } = coord;
    let { column } = coord;
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
    const { length } = coordList;
    for (let i = 1; i < length; i += 1) {
      selector = `${selector},${makeSelectorFromArray(coordList[i])}`;
    }
    return selector;
  }

  function setClassOnSquares(placement, classIn) {
    const length = shipTypes[currentPlacementInfo.type];
    const { orientation } = currentPlacementInfo;
    const { coordinate } = currentPlacementInfo;
    const coordList = getCoordinateList(length, coordinate, orientation);
    const selector = getAllSelectors(coordList);
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

  // Called once, in init method
  // sets up subscription for "place-ship-hover-result"
  function displayPossibility() {
    PubSub.subscribe("place-ship-hover-result", (result) => {
      if (result) {
        displayStatus("query");
      } else currentSquare.classList.add("invalid-placement");
    });
  }

  function placeShipListener() {
    waters.addEventListener("click", (e) => {
      const { target } = e;
      if (target.classList.contains("valid-placement")) {
        PubSub.publish(
          `place-${shipTypesArr[currentShipPlacement]}`,
          currentPlacementInfo
        );
        currentShipPlacement += 1;
        displayStatus("placed");
      }
    });
  }

  // Initializes the controls
  function init() {
    displayPossibility();
    leaveSelectionWindowListener();
    changeOrientationListener();
    placeShipListener();
  }

  // Passed to initGrid to set up shipPlacement eventlisteners
  function query() {
    return { cbk: queryPlacement, signal: hoverController.signal };
  }

  // Disables the event listeners assocaited with the ship placement controls
  function disable() {
    hoverController.abort();
  }
  return {
    init,
    query,
    disable,
  };
}

export default ShipPlaceControls;
