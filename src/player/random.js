// utility function for passing coordinates to gameboard
//    passCoord(2,9) returns { row:2 , column:9 }
const passCoord = (row, column) => ({ row, column });

const random = (() => {
  // Used in randomMove
  // returns a random coord between {row:0, column:0} and {row:9, column:9}
  function coord() {
    const randomRow = Math.floor(Math.random() * 10);
    const randomColumn = Math.floor(Math.random() * 10);
    return passCoord(randomRow, randomColumn);
  }

  // Used in placeShipsAuto
  // either returns "horizontal" or "vertical"
  function orientation() {
    const randomIndex = Math.round(Math.random());
    const val = randomIndex === 0 ? "horizontal" : "vertical";
    return val;
  }

  // Used in randomMove
  // returns a function which can be called (without parameters)
  //  to return a random element fromt he original set parameter
  function fromSet(set) {
    const { length } = set;
    const possibleCoords = set;
    // store which indexs have been used so far, so that no index is returned twice
    const usedIndexes = [];

    return function getRandomCoordFromSet() {
      // if we have used up all possible indexes, throw an error
      if (usedIndexes.length === possibleCoords.length) {
        throw new Error("out of choices");
      }

      // create a random index
      let randomindex = Math.floor(Math.random() * length);
      // if the index has been used already, create more until we find an unused one
      if (usedIndexes.includes(randomindex)) {
        for (let i = 0; i < 100; i += 1) {
          randomindex = Math.floor(Math.random() * length);
          if (!usedIndexes.includes(randomindex)) {
            break;
          }
        }
      }
      usedIndexes.push(randomindex);
      // return the coordinate at the index we have found
      return possibleCoords[randomindex];
    };
  }

  return {
    coord,
    orientation,
    fromSet,
  };
})();

export default random;
