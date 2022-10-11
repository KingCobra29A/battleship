const Ship = (lengthIn) => {
  const length = lengthIn;
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
  };
};

module.exports = Ship;
