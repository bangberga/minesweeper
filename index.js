document.addEventListener("DOMContentLoaded", () => {
  const grid = document.querySelector(".grid");
  const numOfFlats = document.querySelector(".numFlats");
  const selections = document.querySelector("#modes");
  let squares;
  let flats;
  let shuffled;
  let bombsIndex;
  let safePlace;
  let isFirstClick = false;
  let numbers;
  const mode = {
    easy: {
      width: 50,
      numSquarePerLine: 10,
      numBoom: 15,
    },
    hard: {
      width: 20,
      numSquarePerLine: 25,
      numBoom: 99,
    },
  };

  // create board
  function createBoard({ width, numSquarePerLine, numBoom }) {
    grid.innerHTML = "";
    squares = [];
    shuffled = [];
    bombsIndex = new Set();
    numbers = new Array(numSquarePerLine * numSquarePerLine).fill(0);
    for (let i = 0; i < numSquarePerLine * numSquarePerLine; i++) {
      const square = document.createElement("div");
      square.style.width = `${width}px`;
      square.style.height = `${width}px`;
      square.addEventListener("click", () => {
        if (!isFirstClick) {
          safePlace = new Set([...surround(i, numSquarePerLine), i]);
          createBombs(numSquarePerLine, numBoom);
          isFirstClick = true;
        } else {
          console.log("true");
        }
      });
      grid.appendChild(square);
      squares.push(square);
      shuffled.push(i);
    }
    addRightClick();
    flats = numBoom;
    numOfFlats.innerHTML = flats;
  }

  // change mode
  function render() {
    isFirstClick = false;
    const option = selections.value;
    createBoard(mode[option]);
  }
  selections.addEventListener("change", render);
  render();

  // add flats by right click
  function addRightClick() {
    squares.forEach((square) => {
      square.addEventListener(
        "contextmenu",
        (e) => {
          e.preventDefault();
          addFlat(square);
          return false;
        },
        false
      );
    });
  }
  function addFlat(square) {
    if (square.classList.contains("flat")) {
      square.classList.remove("flat");
      numOfFlats.innerHTML = ++flats;
    } else {
      if (flats === 0) return;
      square.classList.add("flat");
      numOfFlats.innerHTML = --flats;
    }
  }

  // create booms
  function createBombs(numSquarePerLine, numBoom) {
    let i = 0;
    let index;
    let n = numSquarePerLine * numSquarePerLine;
    let temp;
    while (i < numBoom) {
      do {
        index = Math.floor(Math.random() * (n - i)) + i;
      } while (safePlace.has(shuffled[index]));
      const bomb = shuffled[index];
      surround(bomb, numSquarePerLine).forEach(
        (location) => numbers[location]++
      );
      bombsIndex.add(bomb);
      temp = shuffled[index];
      shuffled[index] = shuffled[i];
      shuffled[i] = temp;
      i++;
    }
    console.log(numbers);
    bombsIndex.forEach((bomb) => {
      squares[bomb].classList.add("bomb");
    });
  }

  // find all squares surround 1 specific square
  function surround(index, numSquarePerLine) {
    const isRightEdge = index % numSquarePerLine === numSquarePerLine - 1;
    const isLeftEdge = index % numSquarePerLine === 0;
    const isTopEdge = index < numSquarePerLine;
    const isBottomEdge =
      index >= numSquarePerLine * numSquarePerLine - numSquarePerLine;
    if (isTopEdge && isRightEdge)
      return [
        index - 1,
        index + numSquarePerLine - 1,
        index + numSquarePerLine,
      ];
    if (isTopEdge && isLeftEdge)
      return [1, index + numSquarePerLine, index + numSquarePerLine + 1];
    if (isLeftEdge && isBottomEdge)
      return [
        index - numSquarePerLine,
        index - numSquarePerLine + 1,
        index + 1,
      ];
    if (isRightEdge && isBottomEdge)
      return [
        index - numSquarePerLine - 1,
        index - numSquarePerLine,
        index - 1,
      ];
    if (isTopEdge)
      return [
        index - 1,
        index + 1,
        index + numSquarePerLine - 1,
        index + numSquarePerLine,
        index + numSquarePerLine + 1,
      ];
    if (isLeftEdge)
      return [
        index - numSquarePerLine,
        index - numSquarePerLine + 1,
        index + 1,
        index + numSquarePerLine,
        index + numSquarePerLine + 1,
      ];
    if (isRightEdge)
      return [
        index - numSquarePerLine - 1,
        index - numSquarePerLine,
        index - 1,
        index + numSquarePerLine - 1,
        index + numSquarePerLine,
      ];
    if (isBottomEdge)
      return [
        index - 1,
        index - numSquarePerLine - 1,
        index - numSquarePerLine,
        index - numSquarePerLine + 1,
        index + 1,
      ];
    return [
      index - numSquarePerLine - 1,
      index - numSquarePerLine,
      index - numSquarePerLine + 1,
      index - 1,
      index + 1,
      index + numSquarePerLine - 1,
      index + numSquarePerLine,
      index + numSquarePerLine + 1,
    ];
  }
});
