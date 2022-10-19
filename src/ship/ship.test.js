import Ship from "./ship";

let shipInstance;

beforeEach(() => {
  shipInstance = Ship("carrier");
});

afterEach(() => {
  shipInstance = null;
});

test("hit method: test return value", () => {
  console.log(shipInstance.hit);
  expect(shipInstance.hit()).toBe(true);
});

test("isSunk method: test return value on healthy ship", () => {
  shipInstance.hit();
  expect(shipInstance.isSunk()).toBe(false);
});

test("Happy path: ship(5) shot 5 times, check if sunk", () => {
  shipInstance.hit();
  shipInstance.hit();
  shipInstance.hit();
  shipInstance.hit();
  shipInstance.hit();
  expect(shipInstance.isSunk()).toBe(true);
});

test("Unhappy path: ship(5) shot 6 times, check if sunk", () => {
  shipInstance.hit();
  shipInstance.hit();
  shipInstance.hit();
  shipInstance.hit();
  shipInstance.hit();
  shipInstance.hit();
  expect(shipInstance.isSunk()).toBe(true);
});
