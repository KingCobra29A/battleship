const myArray = (sizeIn, populator) => {
  const size = sizeIn;

  const array2D = (function initializeArray() {
    const boardObj = [];
    for (let i = 0; i < size; i += 1) {
      boardObj[i] = Array.from({ length: size });
      for (let j = 0; j < size; j += 1) {
        boardObj[i][j] = populator();
      }
    }
    return boardObj;
  })();

  // lower order fn for placeShip
  array2D.checkCoordinates = (length, coordinate, orientation) => {
    // check if starting coordinate is valid
    if (
      coordinate.row < 0 ||
      coordinate.row > size - 1 ||
      coordinate.column < 0 ||
      coordinate.column > size - 1
    ) {
      throw new Error("Coordinates are outside of bounds");
    }

    // check if ship fits within bounds
    if (
      (orientation === "horizontal" && coordinate.column + length > size) ||
      (orientation === "vertical" && coordinate.row + length > size)
    ) {
      throw new Error("Object does not fit");
    }

    // check if correct orientation was passed
    if (orientation !== "horizontal" && orientation !== "vertical") {
      throw new Error("Garbage inputs");
    }

    // No errors, so return resovled promise
    return 0;
  };

  // lower order fn which traverses the board, applies the callback to each square
  array2D.traverseBoard = (length, coordinate, orientation, cbk) => {
    let traversingVar;
    let row;
    let column;
    if (orientation === "horizontal") {
      traversingVar = { value: coordinate.column };
      row = { value: coordinate.row };
      column = traversingVar;
    } else {
      traversingVar = { value: coordinate.row };
      row = traversingVar;
      column = { value: coordinate.column };
    }
    for (let i = 0; i < length; i += 1) {
      cbk(array2D[row.value][column.value]);
      traversingVar.value += 1;
    }
  };

  // Applies a callback to elements adjacent to coordinate
  // if the callback returns true on any "checked" element, returns true
  //  else returns false
  // dir parameter:
  //    undefined: all four adjacent elements are checked
  //    "horizontal": only two horizontal neighbors are checked
  //    "vertical": only two vertical neighbors are checked
  array2D.checkAdjacent = (coordinate, cbk, dir) => {
    const { row } = coordinate;
    const { column } = coordinate;
    let val = false;
    function action(r, c) {
      val = val || cbk(array2D[r][c]);
    }
    if (typeof dir === "undefined") {
      if (row - 1 > -1) action(row - 1, column);
      if (row + 1 < size - 1) action(row + 1, column);
      if (column - 1 > -1) action(row, column - 1);
      if (column + 1 < size - 1) action(row, column + 1);
    } else if (dir === "horizontal") {
      if (column - 1 > -1) action(row, column - 1);
      if (column + 1 < size - 1) action(row, column + 1);
    } else {
      if (row - 1 > -1) action(row - 1, column);
      if (row + 1 < size - 1) action(row + 1, column);
    }

    return val;
  };

  // Applies the cbk to each element of the array
  //  returns the index (in coord form) of the first element for which cbk evaluates to true
  array2D.linearSearch = (cbk, nthMatch) => {
    let thisMatch = 0;
    for (let i = 0; i < size; i += 1) {
      for (let j = 0; j < size; j += 1) {
        if (cbk(array2D[i][j])) {
          if (thisMatch === nthMatch) return { row: i, column: j };
          thisMatch += 1;
        }
      }
    }
    return false;
  };

  // applies the callback to each element in the array
  array2D.applyToEach = (cbk) => {
    for (let i = 0; i < size; i += 1) {
      for (let j = 0; j < size; j += 1) {
        cbk(array2D[i][j]);
      }
    }
  };

  // returns the coord of each element for which the callback evaluates true
  array2D.eachCoord = (cbk) => {
    const arr = [];
    for (let i = 0; i < size; i += 1) {
      for (let j = 0; j < size; j += 1) {
        if (cbk(array2D[i][j])) {
          arr.push({ row: i, column: j });
        }
      }
    }
    return arr;
  };

  array2D.lastInRow = (startingCoord, cbk) => {
    const { row } = startingCoord;
    const { column } = startingCoord;
    let columnResult = column;

    for (let i = column; i < size; i += 1) {
      if (cbk(array2D[row][i])) {
        columnResult = i;
      } else {
        break;
      }
    }
    return { row, column: columnResult };
  };

  array2D.lastInColumn = (startingCoord, cbk) => {
    const { row } = startingCoord;
    const { column } = startingCoord;
    let rowResult = row;

    for (let i = row; i < size; i += 1) {
      if (cbk(array2D[i][column])) {
        rowResult = i;
      } else {
        break;
      }
    }
    return { row: rowResult, column };
  };

  return array2D;
};

export default myArray;
