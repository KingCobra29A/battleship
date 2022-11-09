import myArray from "./myArray";

beforeEach(() => {});

afterEach(() => {});

test("test array size", () => {
  const testArray = myArray(10, () => true);
  expect.assertions(11);
  expect(testArray.length).toBe(10);
  for (let i = 0; i < 10; i += 1) {
    expect(testArray[i].length).toBe(10);
  }
});

test("checkCoordinates method: happy, maxlength object starting from origin", () => {
  const testArray = myArray(10, () => true);
  const origin = { row: 0, column: 0 };
  const test1 = testArray.checkCoordinates(10, origin, "horizontal");
  const test2 = testArray.checkCoordinates(10, origin, "vertical");
  expect.assertions(2);
  expect(test1).toBe(0);
  expect(test2).toBe(0);
});

test("checkCoordinates method: happy, length=1 object starting from boundary", () => {
  const testArray = myArray(10, () => true);
  const boundaryH = { row: 0, column: 9 };
  const boundaryV = { row: 9, column: 9 };
  const test1 = testArray.checkCoordinates(1, boundaryH, "horizontal");
  const test2 = testArray.checkCoordinates(1, boundaryV, "vertical");
  expect.assertions(2);
  expect(test1).toBe(0);
  expect(test2).toBe(0);
});

test("checkCoordinates method: unhappy, maxlength+1 object starting from origin, horizontal", () => {
  const testArray = myArray(10, () => true);
  const origin = { row: 0, column: 0 };
  expect.assertions(1);
  try {
    testArray.checkCoordinates(11, origin, "horizontal");
  } catch (e) {
    expect(e.message).toBe("Object does not fit");
  }
});

test("checkCoordinates method: unhappy, maxlength+1 object starting from origin, vertical", () => {
  const testArray = myArray(10, () => true);
  const origin = { row: 0, column: 0 };
  expect.assertions(1);
  try {
    testArray.checkCoordinates(11, origin, "vertical");
  } catch (e) {
    expect(e.message).toBe("Object does not fit");
  }
});

test("checkCoordinates method: unhappy, coordinates are outside of bounds", () => {
  const testArray = myArray(10, () => true);
  const origin = { row: 11, column: 0 };
  expect.assertions(1);
  try {
    testArray.checkCoordinates(11, origin, "vertical");
  } catch (e) {
    expect(e.message).toBe("Coordinates are outside of bounds");
  }
});

test("checkCoordinates method: unhappy, coordinates are outside of bounds", () => {
  const testArray = myArray(10, () => true);
  const origin = { row: 11, column: 0 };
  expect.assertions(1);
  try {
    testArray.checkCoordinates(11, origin, "vertical");
  } catch (e) {
    expect(e.message).toBe("Coordinates are outside of bounds");
  }
});

test("traverseBoard method: ", () => {
  const objProto = { boolz: true };
  const testArray = myArray(10, () => Object.create(objProto));
  const origin = { row: 0, column: 0 };
  expect.assertions(4);

  testArray[0][0].boolz = false;
  testArray[0][2].boolz = false;

  testArray.traverseBoard(4, origin, "horizontal", (obj) => {
    if (obj.boolz === true) obj.boolz = "fish";
  });
  expect(testArray[0][0].boolz).toBe(false);
  expect(testArray[0][2].boolz).toBe(false);
  expect(testArray[0][1].boolz).toBe("fish");
  expect(testArray[0][3].boolz).toBe("fish");
});

test("checkAdjacent method: happy path, check multiple coords on empty board ", () => {
  const testArray = myArray(10, () => false);
  const testFn = (boolvar) => boolvar;
  const origin = { row: 0, column: 0 };
  const coord0 = { row: 5, column: 5 };
  const coord1 = { row: 9, column: 9 };
  const coord2 = { row: 9, column: 5 };
  const coord3 = { row: 5, column: 9 };

  expect.assertions(5);
  expect(testArray.checkAdjacent(origin, testFn)).toBe(false);
  expect(testArray.checkAdjacent(coord0, testFn)).toBe(false);
  expect(testArray.checkAdjacent(coord1, testFn)).toBe(false);
  expect(testArray.checkAdjacent(coord2, testFn)).toBe(false);
  expect(testArray.checkAdjacent(coord3, testFn)).toBe(false);
});

test("checkAdjacent method: check multiple coords with neighbors", () => {
  const testArray = myArray(10, () => false);
  const testFn = (boolvar) => boolvar;
  const origin = { row: 0, column: 0 };
  const coord0 = { row: 5, column: 5 };
  const coord1 = { row: 9, column: 9 };
  const coord2 = { row: 9, column: 5 };
  const coord3 = { row: 5, column: 9 };

  testArray[0][1] = true;
  testArray[5][6] = true;
  testArray[8][9] = true;
  testArray[9][6] = true;
  testArray[6][9] = true;

  expect.assertions(5);
  expect(testArray.checkAdjacent(origin, testFn)).toBe(true);
  expect(testArray.checkAdjacent(coord0, testFn)).toBe(true);
  expect(testArray.checkAdjacent(coord1, testFn)).toBe(true);
  expect(testArray.checkAdjacent(coord2, testFn)).toBe(true);
  expect(testArray.checkAdjacent(coord3, testFn)).toBe(true);
});

test("checkAdjacent method: check vertical neighbors", () => {
  const objProtoz = { hit: false, sunk: false };
  const testArray = myArray(10, () => Object.create(objProtoz));
  const testFn = (element) => element.hit && !element.sunk;
  const dir = "vertical";
  const origin = { row: 0, column: 0 };
  const coord0 = { row: 5, column: 5 };

  testArray[1][0].hit = true;
  testArray[1][0].sunk = true;
  testArray[6][5].hit = true;
  testArray[6][5].sunk = false;

  expect.assertions(2);
  expect(testArray.checkAdjacent(origin, testFn, dir)).toBe(false);
  expect(testArray.checkAdjacent(coord0, testFn, dir)).toBe(true);
});

test("checkAdjacent method: check horizontal neighbors", () => {
  const objProtoz = { hit: false, sunk: false };
  const testArray = myArray(10, () => Object.create(objProtoz));
  const testFn = (element) => element.hit && !element.sunk;
  const dir = "horizontal";
  const coord0 = { row: 1, column: 1 };
  const coord1 = { row: 5, column: 5 };

  // setting up coord0 test
  testArray[0][1].hit = true;
  testArray[0][1].sunk = false;
  testArray[2][1].hit = true;
  testArray[2][1].sunk = false;
  testArray[1][0].hit = true;
  testArray[1][0].sunk = true;
  testArray[1][2].hit = true;
  testArray[1][2].sunk = true;

  // setting up coord1 test
  testArray[5][4].hit = true;
  testArray[5][4].sunk = true;
  testArray[5][6].hit = true;
  testArray[5][6].sunk = false;

  expect.assertions(2);
  expect(testArray.checkAdjacent(coord0, testFn, dir)).toBe(false);
  expect(testArray.checkAdjacent(coord1, testFn, dir)).toBe(true);
});

test("checkAdjacent method: check condition on left edge of array", () => {
  const objProtoz = { hit: false, sunk: false };
  const testArray = myArray(10, () => Object.create(objProtoz));
  const testFn = (element) => element.hit !== true;
  const coord0 = { row: 2, column: 0 };

  // setting up coord0 test
  testArray[1][0].hit = true;
  testArray[3][0].hit = true;
  testArray[2][1].hit = true;

  expect.assertions(1);
  expect(testArray.checkAdjacent(coord0, testFn)).toBe(false);
});

test("linearSearch method: return first match", () => {
  const testArray = myArray(10, () => false);
  testArray[5][5] = true;
  const conditionFn = (boolElement) => boolElement === true;

  expect.assertions(1);
  expect(testArray.linearSearch(conditionFn, 0)).toEqual({ row: 5, column: 5 });
});

test("linearSearch method: return second & fifth match", () => {
  const testArray = myArray(10, () => false);
  testArray[0][0] = true;
  testArray[0][9] = true;
  testArray[1][0] = true;
  testArray[2][0] = true;
  testArray[9][9] = true;
  const conditionFn = (boolElement) => boolElement === true;

  expect.assertions(2);
  expect(testArray.linearSearch(conditionFn, 1)).toEqual({ row: 0, column: 9 });
  expect(testArray.linearSearch(conditionFn, 4)).toEqual({ row: 9, column: 9 });
});

test("lastInRow method: ", () => {
  const objProtoz = { hit: false, sunk: false };
  const testArray = myArray(10, () => Object.create(objProtoz));
  const coord0 = { row: 5, column: 5 };

  const testFn = (report) => report.hit === true;

  testArray[5][5] = { hit: true };
  testArray[5][6] = { hit: true };
  testArray[5][7] = { hit: true };
  testArray[5][8] = { hit: true };

  expect.assertions(1);
  expect(testArray.lastInRow(coord0, testFn)).toEqual({ row: 5, column: 8 });
});

test("lastInColumn method: ", () => {
  const objProtoz = { hit: false, sunk: false };
  const testArray = myArray(10, () => Object.create(objProtoz));
  const coord0 = { row: 6, column: 5 };

  const testFn = (report) => report.hit === true;

  testArray[6][5] = { hit: true };
  testArray[7][5] = { hit: true };
  testArray[8][5] = { hit: true };
  testArray[9][5] = { hit: true };

  expect.assertions(1);
  expect(testArray.lastInColumn(coord0, testFn)).toEqual({ row: 9, column: 5 });
});
