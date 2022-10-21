// Helper function for queryPlacement
// Input parameter element is expected to be a "grid-square"
// returns coordinate object which can be used by the player object
function getCoordFromElement(element) {
  const row = Number(element.getAttribute("data-row"));
  const column = Number(element.getAttribute("data-column"));
  return { row, column };
}

export default getCoordFromElement;
