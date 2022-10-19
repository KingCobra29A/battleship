import "./style/css-reset.css";
import "./style/index.css";

// place-carrier, place-xxxxxx event needs to pass coordinate

const view = (() => {
  const setPlayerBoardCallbacks = (cbk, spaces) => {};

  const setComputerBoardCallbacks = (cbk, spaces) => {};

  const initGrid = (domElement, size) => {
    for (let i = 0; i < size; i += 1) {
      const row = document.createElement("div");
      row.classList.add("grid-row");
      for (let j = 0; j < size; j += 1) {
        const square = document.createElement("div");
        square.classList.add("grid-square");
        row.appendChild(square);
      }
      domElement.appendChild(row);
    }
  };

  initGrid(document.getElementById("allied-waters"), 10);
  initGrid(document.getElementById("enemy-waters"), 10);

  return {
    setPlayerBoardCallbacks,
    setComputerBoardCallbacks,
  };
})();

export default view;
