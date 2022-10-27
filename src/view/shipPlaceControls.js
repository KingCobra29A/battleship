import PubSub from "../utilities/pubSub";
import getCoordFromElement from "./getCoordFromElement";
import coordTools from "./coordSelectorTools";
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
    const { signal } = hoverController;
    btn.addEventListener(
      "click",
      (e) => {
        currentOrientation = currentOrientation === 0 ? 1 : 0;
        e.target.innerText = orientations[currentOrientation];
      },
      { signal }
    );
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

  function setClassOnSquares(placement, classIn) {
    const length = shipTypes[placement.type];
    const { orientation } = placement;
    const { coordinate } = placement;
    const coordList = coordTools.getCoordinateList(
      length,
      coordinate,
      orientation
    );
    const selector = coordTools.getAllSelectors(coordList);
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
    const { signal } = hoverController;
    waters.addEventListener(
      "click",
      (e) => {
        const { target } = e;
        // HACK: This condition is not robust enough
        if (target.classList.contains("valid-placement")) {
          console.log(currentPlacementInfo);
          PubSub.publish(
            `place-${shipTypesArr[currentShipPlacement]}`,
            currentPlacementInfo
          );
          currentShipPlacement += 1;
          displayStatus("placed");
        }
      },
      { signal }
    );
  }

  // Disables the event listeners assocaited with the ship placement controls
  function disable() {
    hoverController.abort();
  }

  // Initializes the controls
  // Subscribes to game-start event (inside of placeShipCanceler()),
  //  which then handles disabling the controls
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

  return {
    init,
    query,
    disable,
  };
}

export default ShipPlaceControls;
