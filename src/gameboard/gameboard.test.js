const Gameboard = require("./gameboard");

beforeEach(() => {
  testBoard = Gameboard();
  boardsize = testBoard.size;
});

afterEach(() => {
  board = null;
  boardsize = null;
});

test("placeBoat method: happy, place boat in valid spot on empty board", () => {
  const shipType = "battleship";
  const coordinate = { row: 0, column: 0 };
  const V = "vertical";
  expect(testBoard.placeShip(shipType, coordinate, V)).toBe(true);
});

test("placeBoat method: happy, place 5 adjacent vertical boats", () => {
  const shipType1 = "carrier";
  const shipType2 = "battleship";
  const shipType3 = "destroyer";
  const shipType4 = "submarine";
  const shipType5 = "patrolboat";
  const coordinate1 = { row: 0, column: 0 };
  const coordinate2 = { row: 0, column: 1 };
  const coordinate3 = { row: 0, column: 2 };
  const coordinate4 = { row: 0, column: 3 };
  const coordinate5 = { row: 0, column: 4 };
  const V = "vertical";
  expect.assertions(5);
  expect(testBoard.placeShip(shipType1, coordinate1, V)).toBe(true);
  expect(testBoard.placeShip(shipType2, coordinate2, V)).toBe(true);
  expect(testBoard.placeShip(shipType3, coordinate3, V)).toBe(true);
  expect(testBoard.placeShip(shipType4, coordinate4, V)).toBe(true);
  expect(testBoard.placeShip(shipType5, coordinate5, V)).toBe(true);
});

test("placeBoat method: happy, place 5 adjacent boats, horizontal and vertical", () => {
  const shipType1 = "carrier";
  const shipType2 = "battleship";
  const shipType3 = "destroyer";
  const shipType4 = "submarine";
  const shipType5 = "patrolboat";
  const coordinate1 = { row: 0, column: 0 };
  const coordinate2 = { row: 6, column: 0 };
  const coordinate3 = { row: 3, column: 3 };
  const coordinate4 = { row: 5, column: 0 };
  const coordinate5 = { row: 2, column: 1 };
  const V = "vertical";
  const H = "horizontal";
  expect.assertions(5);
  expect(testBoard.placeShip(shipType1, coordinate1, V)).toBe(true);
  expect(testBoard.placeShip(shipType2, coordinate2, H)).toBe(true);
  expect(testBoard.placeShip(shipType3, coordinate3, V)).toBe(true);
  expect(testBoard.placeShip(shipType4, coordinate4, H)).toBe(true);
  expect(testBoard.placeShip(shipType5, coordinate5, H)).toBe(true);
});

test("placeBoat method: happy, place 5 boats at the edge of the board", () => {
  const shipType1 = "carrier";
  const shipType2 = "battleship";
  const shipType3 = "destroyer";
  const shipType4 = "submarine";
  const shipType5 = "patrolboat";
  const coordinate1 = { row: boardsize - 1, column: boardsize - 5 };
  const coordinate2 = { row: boardsize - 4, column: 3 };
  const coordinate3 = { row: 0, column: boardsize - 3 };
  const coordinate4 = { row: 1, column: boardsize - 3 };
  const coordinate5 = { row: 2, column: boardsize - 1 };
  const V = "vertical";
  const H = "horizontal";
  expect.assertions(5);
  expect(testBoard.placeShip(shipType1, coordinate1, H)).toBe(true);
  expect(testBoard.placeShip(shipType2, coordinate2, V)).toBe(true);
  expect(testBoard.placeShip(shipType3, coordinate3, H)).toBe(true);
  expect(testBoard.placeShip(shipType4, coordinate4, H)).toBe(true);
  expect(testBoard.placeShip(shipType5, coordinate5, V)).toBe(true);
});

test("placeBoat method: unhappy, two boats overlap on starting coordinate only", () => {
  const shipType1 = "carrier";
  const shipType2 = "battleship";
  const coordinate = { row: 0, column: 0 };
  const V = "vertical";
  const H = "horizontal";
  const err = "Placement is occupied";
  expect.assertions(2);
  expect(testBoard.placeShip(shipType1, coordinate, V)).toBe(true);
  expect(testBoard.placeShip(shipType2, coordinate, H)).toBe(err);
});

test("placeBoat method: unhappy, two boats overlap on final coordinate only", () => {
  const shipType1 = "carrier";
  const shipType2 = "battleship";
  const coordinate1 = { row: 0, column: 5 };
  const coordinate2 = { row: 4, column: 5 };
  const coordinate3 = { row: 4, column: 2 };
  const V = "vertical";
  const H = "horizontal";
  const err = "Placement is occupied";
  expect.assertions(3);
  expect(testBoard.placeShip(shipType1, coordinate1, V)).toBe(true);
  expect(testBoard.placeShip(shipType2, coordinate2, V)).toBe(err);
  expect(testBoard.placeShip(shipType2, coordinate3, H)).toBe(err);
});

test("placeBoat method: unhappy, single boat is placed where it wont fit on board", () => {
  const shipType = "carrier";
  const coordinate = { row: boardsize - 1, column: boardsize - 1 };
  const H = "horizontal";
  const err = "Ship does not fit";
  expect(testBoard.placeShip(shipType, coordinate, H)).toBe(err);
});

test("placeBoat method: unhappy, starting coordinate is not on board", () => {
  const shipType = "carrier";
  const coordinate1 = { row: boardsize, column: 9 };
  const coordinate2 = { row: 9, column: boardsize };
  const H = "horizontal";
  expect.assertions(2);
  const err = "Coordinates are outside of bounds";
  expect(testBoard.placeShip(shipType, coordinate1, H)).toBe(err);
  expect(testBoard.placeShip(shipType, coordinate2, H)).toBe(err);
});
