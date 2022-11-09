import shipTypes from "../ship/shiptypes";

const shipSearch = () => {
  let remainingShips = [
    "carrier",
    "battleship",
    "destroyer",
    "submarine",
    "patrolboat",
  ];

  function remove(ship) {
    remainingShips = remainingShips.filter((e) => e !== ship);
  }

  function getlengths() {
    return remainingShips.map((e) => shipTypes[e]);
  }

  function largest() {
    return Math.max(...remainingShips);
  }

  function smallest() {
    return Math.min(...remainingShips);
  }

  return {
    remove,
    getlengths,
    largest,
    smallest,
    get ships() {
      return remainingShips;
    },
  };
};

export default shipSearch;
