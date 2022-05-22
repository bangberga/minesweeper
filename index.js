  const grid = document.querySelector(".grid");
  const numOfFlags = document.querySelector("#numFlats");
  const selections = document.querySelector("#modes");
  const secondDisplay = document.querySelector("#second");
  const overDisplay = document.querySelector(".over");
  const result = document.querySelector("#result");
  const replayBtn = document.querySelector(".replay");
  let squares;
  let flags;
  let shuffled;
  let bombsIndex;
  let flagIndex;
  let safePlace;
  let isFirstClick;
  let numbers;
  let clear;
  let timer;
  let seconds;
  let isAlive = true;
  const colorsNumber = [
    "blue", // 1
    "green", // 2
    "red", // 3
    "purple", // 4
    "black", // 5
    "dimgray", // 6
    "maroon", // 7
    "turquoise", // 8
  ];
  const modes = [
    {
      name: "Easy",
      px: 50,
      padding: 15,
      width: 11,
      height: 9,
      numBoom: 15,
      get widthPx() {
        return this.px * this.width;
      },
    },
    {
      name: "Medium",
      px: 35,
      padding: 7,
      width: 25,
      height: 14,
      numBoom: 50,
      get widthPx() {
        return this.px * this.width;
      },
    },
    {
      name: "Hard",
      px: 27,
      padding: 5,
      width: 38,
      height: 18,
      numBoom: 109,
      get widthPx() {
        return this.px * this.width;
      },
    },
  ];

  // add modes to selections
  modes.forEach((mode) => {
    const option = document.createElement("option");
    option.value = mode.name;
    option.innerHTML = mode.name;
    selections.appendChild(option);
  });

  // create board
  function createBoard(mode) {
    const { widthPx, px, padding, width, height, numBoom } = mode;
    const totalSquare = width * height;
    overDisplay.style.height = "0";
    grid.style.width = `${widthPx}px`;
    clearInterval(timer);
    secondDisplay.innerHTML = 0;
    grid.innerHTML = ``;
    squares = [];
    shuffled = [];
    bombsIndex = new Set();
    flagIndex = new Set();
    numbers = new Array(totalSquare).fill(0);
    isFirstClick = false;
    clear = 0;
    seconds = 0;
    isAlive = true;
    for (let i = 0; i < totalSquare; i++) {
      const square = document.createElement("div");
      square.style.width = `${px}px`;
      square.style.height = `${px}px`;
      square.style.paddingTop = `${padding}px`;
      square.addEventListener("click", () => {
        if (square.classList.contains("flag") || !isAlive) return;
        if (!isFirstClick) {
          timer = setInterval(() => {
            secondDisplay.innerHTML = ++seconds;
          }, 1000);
          safePlace = new Set([...surround(i, width, height), i]);
          createBombs(width, height, numBoom);
          sweep(i, width, height);
          isFirstClick = true;
          return;
        }
        isLose(i);
        sweep(i, width, height);
        isWin(numBoom);
      });
      grid.appendChild(square);
      squares.push(square);
      shuffled.push(i);
    }
    addRightClick();
    flags = numBoom;
    numOfFlags.innerHTML = flags;
  }

  // add flats by right click
  function addRightClick() {
    squares.forEach((square, index) => {
      square.addEventListener(
        "contextmenu",
        (e) => {
          e.preventDefault();
          addFlag(square, index);
          return false;
        },
        false
      );
    });
  }
  function addFlag(square, index) {
    if (!isAlive || square.classList.contains("clear")) return;
    if (!square.classList.contains("flag")) {
      if (flags === 0) return;
      square.classList.add("flag");
      flagIndex.add(index); // add location of flag
      numOfFlags.innerHTML = --flags;
      return;
    }
    removeFlag(square, index);
  }
  function removeFlag(square, index) {
    if (square.classList.contains("flag")) {
      square.classList.remove("flag");
      flagIndex.delete(index);
      numOfFlags.innerHTML = ++flags;
    }
  }

  // create booms
  function createBombs(width, height, numBoom) {
    let i = 0;
    let index; // n
    const totalSquare = width * height;
    while (i < numBoom) {
      do {
        index = Math.floor(Math.random() * (totalSquare - i)) + i;
      } while (safePlace.has(shuffled[index]));
      const bomb = shuffled[index];
      surround(bomb, width, height).forEach((location) => numbers[location]++); // add 1 for 8 numbers surround each bomb and store in numbers
      bombsIndex.add(bomb);
      [shuffled[index], shuffled[i]] = [shuffled[i], shuffled[index]];
      i++;
    }
  }

  // find all squares surround 1 specific square
  function surround(index, width, height) {
    const isRightEdge = index % width === width - 1;
    const isLeftEdge = index % width === 0;
    const isTopEdge = index < width;
    const isBottomEdge = index >= width * height - width;
    if (isTopEdge && isRightEdge)
      return [index - 1, index + width - 1, index + width];
    if (isTopEdge && isLeftEdge) return [1, index + width, index + width + 1];
    if (isLeftEdge && isBottomEdge)
      return [index - width, index - width + 1, index + 1];
    if (isRightEdge && isBottomEdge)
      return [index - width - 1, index - width, index - 1];
    if (isTopEdge)
      return [
        index - 1,
        index + 1,
        index + width - 1,
        index + width,
        index + width + 1,
      ];
    if (isLeftEdge)
      return [
        index - width,
        index - width + 1,
        index + 1,
        index + width,
        index + width + 1,
      ];
    if (isRightEdge)
      return [
        index - width - 1,
        index - width,
        index - 1,
        index + width - 1,
        index + width,
      ];
    if (isBottomEdge)
      return [
        index - 1,
        index - width - 1,
        index - width,
        index - width + 1,
        index + 1,
      ];
    return [
      index - width - 1,
      index - width,
      index - width + 1,
      index - 1,
      index + 1,
      index + width - 1,
      index + width,
      index + width + 1,
    ];
  }

  // sweep square by left click
  function sweep(index, width, height) {
    if (squares[index].classList.contains("clear") || !isAlive) return;
    const isRightEdge = index % width === width - 1;
    const isLeftEdge = index % width === 0;
    const isTopEdge = index < width;
    const isBottomEdge = index >= width * height - width;
    if (numbers[index] !== 0) {
      squares[index].classList.add("clear"); // add some styles
      squares[index].innerHTML = numbers[index]; // render numbers on it
      squares[index].style.color = colorsNumber[numbers[index] - 1];
      clear++;
      removeFlag(squares[index], index); // remove flags if needed
      return;
    }
    squares[index].classList.add("clear");
    clear++;
    removeFlag(squares[index], index);
    isLeftEdge || sweep(index - 1, width, height); // left
    isRightEdge || sweep(index + 1, width, height); // right
    isTopEdge || sweep(index - width, width, height); // top
    isBottomEdge || sweep(index + width, width, height); // bottom
    isLeftEdge || isTopEdge || sweep(index - width - 1, width, height); // left-top diagonal
    isRightEdge || isTopEdge || sweep(index - width + 1, width, height); // right-top diagonal
    isLeftEdge || isBottomEdge || sweep(index + width - 1, width, height); // left-bottom diagonal
    isRightEdge || isBottomEdge || sweep(index + width + 1, width, height); // right-botton diagonal
  }

  // check for lose
  function isLose(index) {
    if (!bombsIndex.has(index)) return;
    bombsIndex.forEach((bomb) => {
      squares[bomb].classList.contains("flag") ||
        squares[bomb].classList.add("bomb");
    });
    flagIndex.forEach((flag) => {
      bombsIndex.has(flag) || squares[flag].classList.add("x"); // put a X if it is a wrong flag choice
    });
    clearInterval(timer);
    result.innerHTML = `You lose`;
    overDisplay.style.height = "100%";
    isAlive = false;
  }

  function isWin(numBoom) {
    if (!(clear + numBoom === squares.length)) return;
    clearInterval(timer);
    result.innerHTML = `You win the game in <span style="color: darkred;">${seconds}</span> seconds`;
    overDisplay.style.height = "100%";
  }

  // change mode and auto render game
  const render = (function render() {
    const option = selections.value;
    const mode = modes.find((mode) => mode.name === option);
    createBoard(mode);
    return render;
  })();

  // add some events
  replayBtn.addEventListener("click", render);
  selections.addEventListener("change", render);
