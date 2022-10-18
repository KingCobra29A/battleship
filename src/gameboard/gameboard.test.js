const Gameboard = require("./gameboard");

beforeEach(() => {
  testBoard = Gameboard();
  boardsize = testBoard.size;
});

afterEach(() => {
  board = null;
  boardsize = null;
});

test("placeShip method: happy, place boat in valid spot on empty board", () => {
  const shipType = "battleship";
  const coordinate = { row: 0, column: 0 };
  const V = "vertical";
  expect.assertions(1);
  expect(testBoard.placeShip(shipType, coordinate, V)).toBe(true);
});

test("placeShip method: happy, place 5 adjacent vertical boats", () => {
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

test("placeShip method: happy, place 5 adjacent boats, horizontal and vertical", () => {
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

test("placeShip method: happy, place 5 boats at the edge of the board", () => {
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

test("placeShip method: unhappy, two boats overlap on starting coordinate only", () => {
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

test("placeShip method: unhappy, two boats overlap on final coordinate only", () => {
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

test("placeShip method: unhappy, single boat is placed where it wont fit on board", () => {
  const shipType = "carrier";
  const coordinate = { row: boardsize - 1, column: boardsize - 1 };
  const H = "horizontal";
  const err = "Object does not fit";
  expect(testBoard.placeShip(shipType, coordinate, H)).toBe(err);
});

test("placeShip method: unhappy, starting coordinate is not on board", () => {
  const shipType = "carrier";
  const coordinate1 = { row: boardsize, column: 9 };
  const coordinate2 = { row: 9, column: boardsize };
  const H = "horizontal";
  expect.assertions(2);
  const err = "Coordinates are outside of bounds";
  expect(testBoard.placeShip(shipType, coordinate1, H)).toBe(err);
  expect(testBoard.placeShip(shipType, coordinate2, H)).toBe(err);
});

test("receiveAttack method: happy, attack empty squares", () => {
  const coordinate1 = { row: 0, column: 0 };
  const coordinate2 = { row: 0, column: boardsize - 1 };
  const coordinate3 = { row: boardsize - 1, column: 0 };
  const coordinate4 = { row: boardsize - 1, column: boardsize - 1 };
  const coordinate5 = { row: boardsize / 2, column: boardsize / 2 };
  expect.assertions(5);
  expect(testBoard.receiveAttack(coordinate1).hit).toBe(false);
  expect(testBoard.receiveAttack(coordinate2).hit).toBe(false);
  expect(testBoard.receiveAttack(coordinate3).hit).toBe(false);
  expect(testBoard.receiveAttack(coordinate4).hit).toBe(false);
  expect(testBoard.receiveAttack(coordinate5).hit).toBe(false);
});

test("receiveAttack method: happy, place a patrol boat, then sink it", () => {
  const shipType = "patrolboat";
  const coordinate1 = { row: 0, column: 0 };
  const coordinate2 = { row: 0, column: 1 };
  const H = "horizontal";
  const placement = testBoard.placeShip(shipType, coordinate1, H);
  const report1 = testBoard.receiveAttack(coordinate1);
  const report2 = testBoard.receiveAttack(coordinate2);
  expect.assertions(5);
  expect(placement).toBe(true);
  expect(report1.hit && !report1.sunk).toBe(true);
  expect(report2.hit && report2.sunk).toBe(true);
  expect(report1.type).toBe("unknown");
  expect(report2.type).toBe("patrolboat");
});

test("receiveAttack method: happy, place two patrol boats, then sink them both", () => {
  const shipType = "patrolboat";
  const coordinate11 = { row: 0, column: 0 };
  const coordinate12 = { row: 0, column: 1 };
  const coordinate21 = { row: 1, column: 0 };
  const coordinate22 = { row: 1, column: 1 };
  const H = "horizontal";
  const placement1 = testBoard.placeShip(shipType, coordinate11, H);
  const placement2 = testBoard.placeShip(shipType, coordinate21, H);
  const report11 = testBoard.receiveAttack(coordinate11);
  const report21 = testBoard.receiveAttack(coordinate21);
  const report12 = testBoard.receiveAttack(coordinate12);
  const report22 = testBoard.receiveAttack(coordinate22);
  expect.assertions(6);
  expect(placement1).toBe(true);
  expect(placement2).toBe(true);
  expect(report11.hit && !report11.sunk).toBe(true);
  expect(report12.hit && report12.sunk).toBe(true);
  expect(report21.hit && !report21.sunk).toBe(true);
  expect(report22.hit && report22.sunk).toBe(true);
});

test("receiveAttack method: happy, sink a carrier", () => {
  const shipType = "carrier";
  const coordinate1 = { row: boardsize - 1, column: boardsize - 5 };
  const coordinate2 = { row: boardsize - 1, column: boardsize - 4 };
  const coordinate3 = { row: boardsize - 1, column: boardsize - 3 };
  const coordinate4 = { row: boardsize - 1, column: boardsize - 2 };
  const coordinate5 = { row: boardsize - 1, column: boardsize - 1 };
  const H = "horizontal";
  testBoard.placeShip(shipType, coordinate1, H);
  const report1 = testBoard.receiveAttack(coordinate1);
  const report2 = testBoard.receiveAttack(coordinate2);
  const report3 = testBoard.receiveAttack(coordinate3);
  const report4 = testBoard.receiveAttack(coordinate4);
  const report5 = testBoard.receiveAttack(coordinate5);
  expect.assertions(7);
  expect(report1.hit && !report1.sunk).toBe(true);
  expect(report2.hit && !report2.sunk).toBe(true);
  expect(report3.hit && !report3.sunk).toBe(true);
  expect(report4.hit && !report4.sunk).toBe(true);
  expect(report5.hit && report5.sunk).toBe(true);
  expect(report4.type).toBe("unknown");
  expect(report5.type).toBe("carrier");
});

test("receiveAttack method: unhappy, attack same square twice", () => {
  const coordinate = { row: 0, column: 0 };
  const err = "Position was already attacked";
  expect.assertions(2);
  expect(testBoard.receiveAttack(coordinate).hit).toBe(false);
  expect(testBoard.receiveAttack(coordinate)).toBe(err);
});
