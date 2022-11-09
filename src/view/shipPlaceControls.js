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
  const placeController = new AbortController();
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
  const controlDomElements = document.querySelectorAll(".place-ship-control");
  const orientations = ["horizontal", "vertical"];
  let currentOrientation = 0;
  let placeShipLatch = false;

  function displayShipPlacementMessage() {
    if (currentShipPlacement < shipTypesArr.length) {
      const message = `Place your ${shipTypesArr[currentShipPlacement]}`;
      PubSub.publish("display-message", { message, duration: false });
    }
  }

  function displayPlacementPossibilityMessage(possible) {
    let message;
    if (possible === true) {
      message = `${shipTypesArr[currentShipPlacement]} can be placed here`;
    } else {
      message = `${shipTypesArr[currentShipPlacement]} does not fit here`;
    }
    PubSub.publish("display-message", { message, duration: 1000 });
  }

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

  function showPossibility(possible) {
    const btn = document.querySelector(
      ".place-ship-control:not(.display-disabled)"
    );
    if (possible) {
      // Placement works
      btn.classList.add("place-button-enabled");
      displayPlacementPossibilityMessage(true);
    } else {
      // Placement doesnt work
      btn.classList.remove("place-button-enabled");
      displayPlacementPossibilityMessage(false);
    }
  }

  // Called once, in init method
  // sets up subscription for "place-ship-hover-result"
  function displayPossibility() {
    PubSub.subscribe("place-ship-hover-result", (result) => {
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
    const { signal } = placeController;
    if (currentShipPlacement < controlDomElements.length) {
      // Disable display of all place-ship-buttons
      for (let i = 0; i < controlDomElements.length; i += 1) {
        controlDomElements[i].classList.add("display-disabled");
        controlDomElements[i].classList.remove("place-button-enabled");
      }
      // Enable display of only the current place-ship-button
      controlDomElements[currentShipPlacement].classList.remove(
        "display-disabled"
      );
      // Add event listener for ship placement
      controlDomElements[currentShipPlacement].addEventListener(
        "click",
        () => {
          if (placeShipLatch) {
            placeShipLatch = false;
            PubSub.publish(
              `place-${shipTypesArr[currentShipPlacement]}`,
              currentPlacementInfo
            );
            currentShipPlacement += 1;
            displayStatus("placed");
            updatePlaceShipControlsView();
            displayShipPlacementMessage();
          }
        },
        { signal }
      );
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
    return { cbk: queryPlacement, signal: hoverController.signal };
  }

  return {
    init,
    query,
    disable,
  };
}

export default ShipPlaceControls;
