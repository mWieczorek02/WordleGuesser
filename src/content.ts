import { IletterData } from "./interfaces/index";
import { possibleAnswers, commonWords } from "./possibleWords";
import { guessDistribution } from "./utils/optimalSolutions";

const letterData: IletterData = {
  absent: {},
  present: {},
  correct: {},
};

const gameApp: ShadowRoot | null | undefined =
  document.querySelector("game-app")?.shadowRoot;

const bodyContainer: HTMLElement = gameApp?.querySelector(
  "#board-container"
) as HTMLElement;

const keyboard: ShadowRoot | null | undefined =
  gameApp?.querySelector("game-keyboard")?.shadowRoot;

const wordRows: NodeListOf<HTMLElement> | undefined =
  gameApp?.querySelectorAll(`game-row`);

const enterKey: HTMLElement = keyboard?.querySelector(
  `[data-key="↵"]`
) as HTMLElement;

const checkIfLetterAbsenceIsCorrect = () => {
  if (
    Object.keys(letterData.correct).length === 0 &&
    Object.keys(letterData.present).length === 0
  )
    return;
  for (const key in { ...letterData.correct, ...letterData.present }) {
    if (Object.keys(letterData.absent).includes(key))
      delete letterData.absent[key];
  }
};

const getLetterData = async () => {
  return new Promise<void>((res, rej) => {
    wordRows?.forEach((element) => {
      const tiles: NodeListOf<HTMLElement> =
        element.shadowRoot?.querySelectorAll(
          `game-tile`
        ) as NodeListOf<HTMLElement>;

      tiles?.forEach((tile, index) => {
        const data: keyof IletterData = tile.getAttribute(
          "evaluation"
        ) as keyof IletterData;
        const letter: string = tile.getAttribute("letter") as string;

        if (data) letterData[data][letter] = index;
      });
    });
    checkIfLetterAbsenceIsCorrect();
    res();
  });
};

const typeWord: (letterArray: string[]) => void = (letterArray: string[]) => {
  letterArray.forEach((letter: string) => {
    const button: HTMLElement | null | undefined = keyboard?.querySelector(
      `[data-key="${letter}"]`
    );
    button?.click();
  });
};

const getBestWords = () => {
  // filter out words with absent letters
  let best: string[] = commonWords.filter(
    (word: string, index: number) =>
      !Object.keys(letterData.absent).some((element: string) => {
        return word.split("").includes(element);
      })
  );
  // filter out words with present letter in incorrect places
  best = best.filter((word: string) => {
    if (Object.keys(letterData.present).length === 0) return true;
    return Object.keys(letterData.present).every((element: string) => {
      return (
        word.split("").includes(element) &&
        letterData.present[element] !== word.indexOf(element)
      );
    });
  });
  // filter out words without correct letters
  best = best.filter((word: string) => {
    if (Object.keys(letterData.correct).length === 0) return true;
    return Object.keys(letterData.correct).every(
      (element: string, index: number) => {
        return (
          word.split("").includes(element) &&
          letterData.correct[element] === word.indexOf(element)
        );
      }
    );
  });
  const guesses: { [key: string]: number } = {};
  best.forEach((word) => {
    guesses[word] = guessDistribution(best, word, letterData);
  });

  return Object.entries(guesses).sort(
    (a: [string, number], b: [string, number]) => b[1] - a[1]
  );
};

const solveBtn: HTMLButtonElement = document.createElement("button");

solveBtn.setAttribute(
  "style",
  "margin-bottom: 10%; margin-top: 10%;background-color: #538d4e;padding: 8px;font-family: sans-serif;font-weight: bold;color: white;"
);
solveBtn.textContent = "GUESS";

bodyContainer.style.flexDirection = "column";
bodyContainer?.append(solveBtn);

getLetterData();

let firstGuess: boolean = true;

const handleSubmit = async () => {
  if (firstGuess) {
    chrome.storage.sync.get("startingWord", ({ startingWord }) => {
      typeWord(startingWord.split(""));
      firstGuess = false;
      enterKey.click();
    });
    return;
  }
  await getLetterData();
  console.log(letterData);
  const [[bestWord]] = getBestWords();
  console.log(bestWord);
  typeWord(bestWord.split(""));
  enterKey.click();
};

solveBtn.onclick = () => {
  handleSubmit();
};
