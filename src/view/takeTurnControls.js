import PubSub from "../utilities/pubSub";
import getCoordFromElement from "./getCoordFromElement";

function attackViaDom(e) {
  const target = e.currentTarget;
  const coord = getCoordFromElement(target);
  PubSub.publish("player-attack", coord);
}

function turnControls() {
  const enemyWaters = document.querySelector(".enemy-waters");
  const squares = enemyWaters.querySelectorAll(".grid-square");
  for (let i = 0; i < squares.length; i += 1) {
    squares[i].addEventListener("click", (e) => {
      attackViaDom(e);
    });
  }

  return {};
}

export default turnControls;
