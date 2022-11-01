const coordTools = (() => {
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

  function allCoords(length, coord, ori) {
    const coords = [];
    let { row } = coord;
    let { column } = coord;
    for (let i = 0; i < length; i += 1) {
      coords.push({ row, column });
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

  return {
    getCoordinateList,
    makeSelectorFromArray,
    getAllSelectors,
    allCoords,
  };
})();

export default coordTools;
