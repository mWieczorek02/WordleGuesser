const element: HTMLInputElement = document.querySelector(
  "#textInput"
) as HTMLInputElement;

const startingWord = chrome.storage.sync.get(
  "startingWord",
  ({ startingWord }) => {
    element.value = startingWord;
  }
);

document.addEventListener("keydown", (ev: KeyboardEvent) => {
  if (ev.key !== "Enter" || element.value.length !== 5) return;

  ev.preventDefault();
  chrome.storage.sync.set({ startingWord: element.value });
});
