import React from "react";

const Timer = React.memo(function Timer({
  gameStarted,
  isGameOver,
  duration = 60,
  onExpire,
}) {
  const [time, setTime] = React.useState(duration);

  // Reset timer when game restarts
  React.useEffect(() => {
    if (gameStarted) {
      setTime(duration);
    }
  }, [gameStarted, duration]);

  // Countdown effect
  React.useEffect(() => {
    if (!gameStarted || isGameOver) return;

    const countdown = setInterval(() => {
      setTime((prev) => {
        if (prev <= 1) {
          clearInterval(countdown);
          if (onExpire) {
            // defer callback to next tick so it’s not in render phase
            setTimeout(() => onExpire(), 0);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, [gameStarted, isGameOver, onExpire]); // ✅ stable dependency list

  if (!gameStarted || isGameOver) return null;

  return (
    <h2 className="timer">
      TIME LEFT:{" "}
      <span style={{ color: time < 11 ? "red" : "inherit" }}>{time}</span>
    </h2>
  );
});

export default Timer;
