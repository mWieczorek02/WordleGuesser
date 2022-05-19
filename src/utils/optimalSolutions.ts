import { IletterData } from "../interfaces/index";

export const guessDistribution = (
  wordList: string[],
  target: string,
  data: IletterData
) => {
  const unique = [
    ...Object.keys(data.absent),
    ...Object.keys(data.correct),
    ...Object.keys(data.present),
  ];
  const targetsUnique = target
    .split("")
    .filter((letter) => !unique.includes(letter));
  let correct: number = 0;
  wordList.forEach((word: string) => {
    if (targetsUnique.some((letter: string) => !word.includes(letter)))
      correct++;
  });
  return correct;
};
