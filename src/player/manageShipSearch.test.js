import shipSearch from "./manageShipSearch";

beforeEach(() => {});

afterEach(() => {});

test("getlengths method: results of unchanged search ", () => {
  const thisSearch = shipSearch();
  expect(thisSearch.getlengths()).toEqual([5, 4, 3, 3, 2]);
});

test("getlengths / remove methods: full sequence", () => {
  const thisSearch = shipSearch();
  expect.assertions(6);

  // Lengths of unchanged search
  expect(thisSearch.getlengths()).toEqual([5, 4, 3, 3, 2]);

  // Lengths after removing battleship
  thisSearch.remove("battleship");
  expect(thisSearch.getlengths()).toEqual([5, 3, 3, 2]);

  // Lengths after removing submarine
  thisSearch.remove("submarine");
  expect(thisSearch.getlengths()).toEqual([5, 3, 2]);

  // Lengths after removing carrier
  thisSearch.remove("carrier");
  expect(thisSearch.getlengths()).toEqual([3, 2]);

  // Lengths after removing patrolboat
  thisSearch.remove("patrolboat");
  expect(thisSearch.getlengths()).toEqual([3]);

  // Lengths after removing destroyer
  thisSearch.remove("destroyer");
  expect(thisSearch.getlengths()).toEqual([]);
});
