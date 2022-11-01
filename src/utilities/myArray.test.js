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
