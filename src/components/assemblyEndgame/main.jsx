import "./index.css";
import React from "react";
import { languages } from "./language";
import { clsx } from "clsx";
import { getFarewellText } from "./utils";
import { getRandomWord } from "./utils";
import Confetti from "react-confetti";

export default function Main() {
  //State values
  const [currentWord, setCurrentWord] = React.useState(() => getRandomWord());

  const [guess, setGuess] = React.useState([]);

  //Derive values
  const wrongGuessCount = guess.filter(
    (letter) => !currentWord.includes(letter)
  ).length; //Display the number of incorrect guesses

  //Game over configuration
  const isGameWon = currentWord
    .split("")
    .every((letter) => guess.includes(letter));

  const numGuessesLeft = languages.length - 1;

  const isGameLost = wrongGuessCount >= numGuessesLeft;

  const isGameOver = isGameWon || isGameLost;

  const lastGuessLetter = guess[guess.length - 1]; //check the last guess

  const isLastGuessIncorrect =
    lastGuessLetter && !currentWord.includes(lastGuessLetter); //checks if the last guess is incorrect

  const [count, setCount] = React.useState(numGuessesLeft);

  // Updates count when wrong guesses change
  React.useEffect(() => {
    setCount(numGuessesLeft - wrongGuessCount);
  }, [wrongGuessCount, numGuessesLeft]);

  // Resets count when game resets
  React.useEffect(() => {
    setCount(numGuessesLeft);
  }, [currentWord, numGuessesLeft]);

  //static values
  function displayGuess(letter) {
    setGuess((prevGuess) =>
      prevGuess.includes(letter) ? prevGuess : [...prevGuess, letter]
    );
  }

  //Display the array of languages
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

  //Display the array guessed words
  const wordArray = currentWord.split("").map((word, index) => {
    const revealWord = isGameLost || guess.includes(word);

    const wordClassName = clsx(
      isGameLost && !guess.includes(word) && "missed-word"
    ); //color the wrong words

    return (
      <span key={index} className={wordClassName}>
        {revealWord ? word.toLocaleUpperCase() : ""}
      </span> //display the individual guessed words accordingly if it is in the guess array
    );
  });

  //Display the keyboard to the screen
  const alphabet = "abcdefghijklmnopqrstuvwxyz";

  const keyboard = alphabet.split("").map((letter) => {
    const isGuessed = guess.includes(letter); //Checks to see if the document is in the guess array in the Guess STATE

    //Gives it a conditional className to color the right and wrong guesses
    const isCorrect = isGuessed && currentWord.includes(letter);

    const isWrong = isGuessed && !currentWord.includes(letter);

    const className = clsx({
      correct: isCorrect,
      wrong: isWrong,
    });

    return (
      <button
        key={letter}
        onClick={() => displayGuess(letter)} // add the click word to the guess STATE
        className={className}
        disabled={isGameOver}
        aria-disabled={guess.includes(letter)}
        aria-label={`letter ${letter}`}
      >
        {letter.toLocaleUpperCase()}
      </button>
    );
  });

  //Determining game status color
  const gameStatusClass = clsx("status-text", {
    won: isGameWon,
    lost: isGameLost,
    farewell: !isGameOver && isLastGuessIncorrect,
  });

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
    return null;
  }

  //Reset the game
  function gameReset() {
    setCurrentWord(getRandomWord());
    setGuess([]);
  }

  //Toggle game over status off
  function toggleOff() {
    const gameOver = document.getElementById("game-over");
    return (gameOver.style.display = "none");
  }

  return (
    <div className="assembly-endgame">
      {isGameLost && (
        <div id="game-over">
          <span>
            <img className="img" src="/gameover.png" alt="Game Over" />
            <button onClick={toggleOff}>CLOSE</button>
          </span>
        </div>
      )}
      <main>
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
        {isGameOver && (
          <button onClick={gameReset} className="new-game">
            New Game
          </button>
        )}
      </main>
    </div>
  );
}
