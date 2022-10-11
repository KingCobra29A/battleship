const ship = require("./ship");

beforeEach(() => {
  shipInstance = ship(5);
});

afterEach(() => {
  shipInstance = null;
});

test("hit method: test return value", () => {
  expect(shipInstance.hit()).toBe(true);
});

test("isSunk method: test return value on healthy ship", () => {
  expect(
    (() => {
      shipInstance.hit();
      return shipInstance.isSunk();
    })()
  ).toBe(false);
});

test("Happy path: ship(5) shot 5 times, check if sunk", () => {
  expect(
    (() => {
      shipInstance.hit();
      shipInstance.hit();
      shipInstance.hit();
      shipInstance.hit();
      shipInstance.hit();
      return shipInstance.isSunk();
    })()
  ).toBe(true);
});

test("Unhappy path: ship(5) shot 6 times, check if sunk", () => {
  expect(
    (() => {
      shipInstance.hit();
      shipInstance.hit();
      shipInstance.hit();
      shipInstance.hit();
      shipInstance.hit();
      shipInstance.hit();
      return shipInstance.isSunk();
    })()
  ).toBe(true);
});
