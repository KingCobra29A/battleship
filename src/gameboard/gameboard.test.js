const Gameboard = require("./gameboard");

beforeEach(() => {
  testBoard = Gameboard();
});

afterEach(() => {
  board = null;
});

it("placeBoat method: place boat in valid spot on empty board", () => {
  let shipType = "battleship";
  let coordinate = { row: 0, column: 0 };
  let orientation = "vertical";
  expect.assertions(1);
  testBoard
    .placeShip(shipType, coordinate, orientation)
    .then((data) => expect(data).toBe("Ship of length 4 was placed"));
});

it("placeBoat method: place 5 adjacent vertical boats", () => {
  let shipType1 = "carrier";
  let shipType2 = "battleship";
  let shipType3 = "destroyer";
  let shipType4 = "submarine";
  let shipType5 = "patrolboat";
  let coordinate1 = { row: 0, column: 0 };
  let coordinate2 = { row: 0, column: 1 };
  let coordinate3 = { row: 0, column: 2 };
  let coordinate4 = { row: 0, column: 3 };
  let coordinate5 = { row: 0, column: 4 };
  let orientation = "vertical";
  expect.assertions(5);
  testBoard
    .placeShip(shipType1, coordinate1, orientation)
    .then((data) => expect(data).toBe("Ship of length 5 was placed"));
  testBoard
    .placeShip(shipType2, coordinate2, orientation)
    .then((data) => expect(data).toBe("Ship of length 4 was placed"));
  testBoard
    .placeShip(shipType3, coordinate3, orientation)
    .then((data) => expect(data).toBe("Ship of length 3 was placed"));
  testBoard
    .placeShip(shipType4, coordinate4, orientation)
    .then((data) => expect(data).toBe("Ship of length 3 was placed"));
  testBoard
    .placeShip(shipType5, coordinate5, orientation)
    .then((data) => expect(data).toBe("Ship of length 2 was placed"));
});

it("placeBoat method: place 5 adjacent vertical boats", () => {
  let shipType1 = "carrier";
  let shipType2 = "battleship";
  let coordinate = { row: 0, column: 0 };
  let orientation1 = "vertical";
  let orientation2 = "horizontal";
  expect.assertions(2);
  testBoard
    .placeShip(shipType1, coordinate, orientation1)
    .then((data) => expect(data).toBe("Ship of length 5 was placed"));
  testBoard
    .placeShip(shipType2, coordinate, orientation2)
    .catch((e) => expect(e.message).toBe("Placement is already occupied"));
});
