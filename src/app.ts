import Mode from "./Mode";

enum Colors {
  blue, // 1
  green, // 2
  red, // 3
  purple, // 4
  black, // 5
  dimgray, // 6
  maroon, // 7
  turquoise, // 8
}

const grid = document.querySelector(".grid")! as HTMLElement;
const numOfFlags = document.querySelector("#numFlats")! as HTMLElement;
const selections = document.querySelector("#modes")! as HTMLInputElement;
const secondDisplay = document.querySelector("#second")! as HTMLElement;
const overDisplay = document.querySelector(".over")! as HTMLElement;
const result = document.querySelector("#result")! as HTMLElement;
const replayBtn = document.querySelector(".replay")! as HTMLElement;
const hintDisplay = document.querySelector("#hint")! as HTMLElement;
const hintBtn = document.querySelector(".hint")! as HTMLElement;
let squares: HTMLDivElement[];
let flags: number;
let shuffled: number[];
let bombsIndex: Set<number>;
let flagIndex: Set<number>;
let safePlace: Set<number>;
let isFirstClick: boolean;
let numbers: number[];
let clear: number;
let timer: number;
let seconds: number;
let isAlive: boolean;
let unknown: Set<number>;
let hints: () => void;

const easy = new Mode("Easy", 50, 15, 11, 9, 15, 3);
const medium = new Mode("Medium", 35, 7, 25, 14, 50, 7);
const hard = new Mode("Hard", 27, 5, 38, 18, 109, 12);

const modes = [easy, medium, hard];

modes.forEach((mode) => {
  const option = document.createElement("option");
  option.value = mode.name;
  option.innerHTML = mode.name;
  selections.appendChild(option);
});

// find all squares surround 1 specific square
const surround = (index: number, width: number, height: number): number[] => {
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
};

const removeFlag = (square: HTMLDivElement, index: number) => {
  if (square.classList.contains("flag")) {
    square.classList.remove("flag");
    flagIndex.delete(index);
    numOfFlags.innerHTML = `${++flags}`;
  }
};

const addFlag = (square: HTMLDivElement, index: number) => {
  if (!isAlive || square.classList.contains("clear")) return;
  if (!square.classList.contains("flag")) {
    if (flags === 0) return;
    square.classList.add("flag");
    flagIndex.add(index); // add location of flag
    numOfFlags.innerHTML = `${--flags}`;
    return;
  }
  removeFlag(square, index);
};

// add flats by right click
const addRightClick = () => {
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
};

// create booms
const createBombs = (width: number, height: number, numBoom: number) => {
  let i = 0;
  let index: number; // n
  const totalSquare = width * height;
  while (i < numBoom) {
    do {
      index = Math.floor(Math.random() * (totalSquare - i)) + i;
    } while (safePlace.has(shuffled[index]));
    const bomb = shuffled[index];
    surround(bomb, width, height).forEach((location) => numbers[location]++); // add 1 for 8 numbers surround each bomb and store in numbers
    bombsIndex.add(bomb);
    unknown.delete(bomb);
    [shuffled[index], shuffled[i]] = [shuffled[i], shuffled[index]];
    i++;
  }
};

// sweep square by left click
const sweep = (index: number, width: number, height: number) => {
  if (squares[index].classList.contains("clear") || !isAlive) return;
  const isRightEdge = index % width === width - 1;
  const isLeftEdge = index % width === 0;
  const isTopEdge = index < width;
  const isBottomEdge = index >= width * height - width;
  if (numbers[index] !== 0) {
    unknown.delete(index);
    squares[index].classList.add("clear"); // add some styles
    squares[index].innerHTML = numbers[index].toString(); // render numbers on it
    squares[index].style.color = Colors[numbers[index] - 1];
    clear++;
    removeFlag(squares[index], index); // remove flags if needed
    return;
  }
  unknown.delete(index);
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
};

// check for lose
const isLose = (index: number) => {
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
};

// check for win
const isWin = (numBoom: number) => {
  if (!(clear + numBoom === squares.length)) return;
  clearInterval(timer);
  result.innerHTML = `You win the game in <span style="color: darkred;">${seconds}</span> seconds`;
  overDisplay.style.height = "100%";
  isAlive = false;
};

// create board
const createBoard = (mode: Mode) => {
  const { widthPx, px, padding, width, height, numBoom, hint } = mode;
  const totalSquare = width * height;
  overDisplay.style.height = "0";
  grid.style.width = `${widthPx}px`;
  clearInterval(timer);
  secondDisplay.innerHTML = "0";
  grid.innerHTML = ``;
  squares = [];
  shuffled = [];
  bombsIndex = new Set();
  flagIndex = new Set();
  unknown = new Set();
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
          ++seconds;
          secondDisplay.innerHTML = seconds.toString();
        }, 1000);
        safePlace = new Set([...surround(i, width, height), i]);
        createBombs(width, height, numBoom);
        isLose(i);
        sweep(i, width, height);
        isWin(numBoom);
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
    unknown.add(i);
  }
  addRightClick();
  flags = numBoom;
  numOfFlags.innerHTML = flags.toString();
  hintDisplay.innerHTML = hint.toString();
  hintBtn.removeEventListener("click", hints);
  hints = () => {
    let numhint = parseInt(hintDisplay.innerHTML);
    if (!isFirstClick || !numhint || !isAlive) return;
    const randomClear = [...unknown][Math.floor(Math.random() * unknown.size)];
    sweep(randomClear, width, height);
    isWin(numBoom);
    hintDisplay.innerHTML = `${--numhint}`;
  };
  hintBtn.addEventListener("click", hints);
};

// change mode
const render = (function render() {
  const option = selections.value;
  const mode = modes.find((mode) => mode.name === option);
  mode && createBoard(mode);
  return render;
})();

// add some events
replayBtn.addEventListener("click", render);
selections.addEventListener("change", render);
