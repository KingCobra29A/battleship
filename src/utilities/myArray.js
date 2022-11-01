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

  array2D.checkAdjacent = (coordinate, cbk) => {
    const { row } = coordinate;
    const { column } = coordinate;
    let val = false;
    function action(r, c) {
      val = val || cbk(array2D[r][c]);
    }
    if (row - 1 > -1) action(row - 1, column);
    if (row + 1 < size - 1) action(row + 1, column);
    if (column - 1 > -1) action(row, column - 1);
    if (column + 1 < size - 1) action(row, column + 1);
    return val;
  };

  return array2D;
};

export default myArray;
