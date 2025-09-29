import "./index.css";
import React from "react";
import { languages } from "./language";
import { clsx } from "clsx";
import { getFarewellText, getRandomWord } from "./utils";
import Confetti from "react-confetti";
import Timer from "./timer";

export default function Main() {
  // State values
  const [currentWord, setCurrentWord] = React.useState(() => getRandomWord());
  const [guess, setGuess] = React.useState([]);
  const [gameStarted, setGameStarted] = React.useState(false);
  const [timeExpired, setTimeExpired] = React.useState(false);
  const [resetTimerFlag, setResetTimerFlag] = React.useState(0);

  // Derive values
  const wrongGuessCount = guess.filter(
    (letter) => !currentWord.includes(letter)
  ).length;

  const isGameWon = currentWord
    .split("")
    .every((letter) => guess.includes(letter));

  const numGuessesLeft = languages.length - 1;
  const isGameLost = wrongGuessCount >= numGuessesLeft;
  const isGameOver = isGameWon || isGameLost || timeExpired;

  const lastGuessLetter = guess[guess.length - 1];
  const isLastGuessIncorrect =
    lastGuessLetter && !currentWord.includes(lastGuessLetter);

  const [count, setCount] = React.useState(numGuessesLeft);

  // Updates count when wrong guesses change
  React.useEffect(() => {
    setCount(numGuessesLeft - wrongGuessCount);
  }, [wrongGuessCount, numGuessesLeft]);

  // Resets count when game resets
  React.useEffect(() => {
    setCount(numGuessesLeft);
  }, [currentWord, numGuessesLeft]);

  // Add guess
  function displayGuess(letter) {
    setGuess((prevGuess) =>
      prevGuess.includes(letter) ? prevGuess : [...prevGuess, letter]
    );
  }

  // Display languages
  const languageElements = languages.map((lang, index) => {
    const isLanguageLost = index < wrongGuessCount;

    return (
      <span
        className={`chip ${isLanguageLost && "lost"}`}
        key={lang.name}
        style={{ backgroundColor: lang.backgroundColor, color: lang.color }}
      >
        {lang.name}
      </span>
    );
  });

  // Display guessed word
  const wordArray = currentWord.split("").map((word, index) => {
    const revealWord = isGameOver || guess.includes(word);

    const wordClassName = clsx(
      isGameOver && !guess.includes(word) && "missed-word"
    );

    return (
      <span key={index} className={wordClassName}>
        {revealWord ? word.toLocaleUpperCase() : ""}
      </span>
    );
  });

  // Display keyboard
  const alphabet = "abcdefghijklmnopqrstuvwxyz";
  const keyboard = alphabet.split("").map((letter) => {
    const isGuessed = guess.includes(letter);
    const isCorrect = isGuessed && currentWord.includes(letter);
    const isWrong = isGuessed && !currentWord.includes(letter);

    const className = clsx({
      correct: isCorrect,
      wrong: isWrong,
    });

    const disableButton = isGameOver || !gameStarted;

    return (
      <button
        key={letter}
        onClick={() => displayGuess(letter)}
        className={className}
        disabled={disableButton}
        aria-disabled={isGuessed}
        aria-label={`letter ${letter}`}
      >
        {letter.toLocaleUpperCase()}
      </button>
    );
  });

  // Status styling
  const gameStatusClass = clsx("status-text", {
    won: isGameWon,
    lost: isGameLost || timeExpired,
    farewell: !isGameOver && isLastGuessIncorrect,
  });

  // Render status message
  function renderGameStatus() {
    if (!isGameOver && isLastGuessIncorrect) {
      return (
        <p className="farewell-message">
          {getFarewellText(languages[wrongGuessCount - 1].name)}
        </p>
      );
    }
    if (isGameWon) {
      return (
        <>
          <h2>Game Won!</h2>
          <p>Well Done!</p>
        </>
      );
    }
    if (isGameLost) {
      return (
        <>
          <h2>Game Over!</h2>
          <p>You loser! Better start learning Assembly</p>
        </>
      );
    }
    if (timeExpired) {
      return (
        <>
          <h2>Time's Up!</h2>
          <p>You ran out of time!</p>
        </>
      );
    }
    return null;
  }

  // Reset the game
  function gameReset() {
    setCurrentWord(getRandomWord());
    setGuess([]);
    setGameStarted(true);
    setTimeExpired(false);
    setResetTimerFlag((prev) => prev + 1); // 🔥 force timer reset
  }

  // Toggle game over popup
  function toggleOff() {
    const gameOver = document.getElementById("game-over");
    if (gameOver) gameOver.style.display = "none";
  }

  return (
    <div className="assembly-endgame">
      {(isGameLost || timeExpired) && (
        <div id="game-over">
          <span>
            <img className="img" src="/gameover.png" alt="Game Over" />
            <button onClick={toggleOff}>CLOSE</button>
          </span>
        </div>
      )}

      <main className="main">
        {isGameWon && <Confetti recycle={false} numberOfPieces={1000} />}
        <header>
          <h1>Assembly: Endgame</h1>
          <p>
            Guess the word within <span className="count-span">{count} </span>
            attempts to keep the programming world safe from Assembly!
          </p>
        </header>

        <section aria-live="polite" role="status" className={gameStatusClass}>
          {renderGameStatus()}
        </section>

        <section className="languages">{languageElements}</section>
        <section className="word">{wordArray}</section>

        <section className="sr-only" aria-live="polite" role="status">
          <p>
            {currentWord.includes(lastGuessLetter)
              ? `correct! The letter ${lastGuessLetter} is in the word`
              : `Sorry! The letter ${lastGuessLetter} is not in the word`}
          </p>
          <p>
            Currentword:{" "}
            {currentWord
              .split("")
              .map((letter) =>
                guess.includes(letter) ? letter + "." : "blank."
              )
              .join(" ")}
            You have {numGuessesLeft} attempts left
          </p>
        </section>

        <section className="keyboard-container">{keyboard}</section>

        {isGameOver || !gameStarted ? (
          <button onClick={gameReset} className="new-game">
            {!gameStarted ? "Start Game" : "New Game"}
          </button>
        ) : null}

        <Timer
          key={resetTimerFlag} // 🔥 forces re-mount on reset
          gameStarted={gameStarted}
          isGameOver={isGameOver}
          duration={60}
          onExpire={() => {
            setTimeExpired(true);
            setGameStarted(false);
          }}
        />
      </main>
    </div>
  );
}
