import shipTypes from "./shiptypes";

const Ship = (typeIn) => {
  const shiptype = typeIn;
  const length = shipTypes[shiptype];
  let hits = 0;

  const hit = () => {
    if (hits < length) {
      hits += 1;
      return true;
    }
    return false;
  };

  const isSunk = () => {
    if (hits === length) return true;
    return false;
  };

  return {
    hit,
    isSunk,
    get type() {
      return shiptype;
    },
  };
};

export default Ship;
