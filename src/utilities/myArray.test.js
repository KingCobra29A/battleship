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

test.skip("traverseBoard method: ", () => {
  const testArray = myArray(10, () => true);
  const origin = { row: 0, column: 0 };
  expect.assertions(1);

  testArray[0][0] = false;
  testArray[0][2] = false;

  testArray.traverseBoard(4, origin, "horizontal", (boolvar) => {
    if (boolvar === true) boolvar = "fish";
  });
  expect(testArray[0][0]).toBe(false);
  expect(testArray[0][2]).toBe(false);
  expect(testArray[0][1]).toBe("fish");
  expect(testArray[0][3]).toBe("fish");
});
