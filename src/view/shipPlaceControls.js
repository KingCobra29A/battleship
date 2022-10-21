import PubSub from "../utilities/pubSub";
import shipTypes from "../ship/shiptypes";
import getCoordFromElement from "./getCoordFromElement";

/*  Factory function
 ** Returns a controller to handle the ship placement controls
 ** Used in gameReset(), gameStart()
 **
 */
function ShipPlaceControls() {
  const hoverController = new AbortController();
  const waters = document.querySelector(".allied-waters");
  let currentSquare;
  let shipTypesArr = [
    "carrier",
    "battleship",
    "destroyer",
    "submarine",
    "patrolboat",
  ];
  let currentShipPlacement = 0;
  let orientations = ["horizontal", "vertical"];

  // Called once, in init method
  // sets up subscription for "place-ship-hover-result"
  function displayPossibility() {
    PubSub.subscribe("place-ship-hover-result", (result) => {
      if (result) currentSquare.classList.add("valid-placement");
      else currentSquare.classList.add("invalid-placement");
    });
  }

  // Helper function used in queryPlacement, init
  // Turns off "invalid-placement", "valid-placement" classes, if they exist
  function removeShipPlacementIndications(element) {
    try {
      element.classList.remove("invalid-placement", "valid-placement");
    } catch {
      /* No classes to remove */
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
  const queryPlacement = (e) => {
    removeShipPlacementIndications(currentSquare);
    currentSquare = e.currentTarget;
    const coordinate = getCoordFromElement(currentSquare);
    const type = shipTypes[shipTypesArr[currentShipPlacement]];
    const orientation = orientations[0];
    PubSub.publish("place-ship-hover", {
      type,
      coordinate,
      orientation,
    });
  };

  // Passed to initGrid to set up shipPlacement eventlisteners
  function query() {
    return { cbk: queryPlacement, signal: hoverController.signal };
  }

  // Initializes the controls
  function init() {
    displayPossibility();
    leaveSelectionWindowListener();
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
