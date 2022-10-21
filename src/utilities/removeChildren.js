function removeChildren(...args) {
  for (let i = 0; i < args.length; i += 1) {
    while (args[i].firstChild) {
      args[i].removeChild(args[i].lastChild);
    }
  }
}
export default removeChildren;
