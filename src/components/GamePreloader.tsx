import React from "react";
import { Gamepad2, LoaderCircle } from "lucide-react";

const messages = [
  "Gathering the latest stories…",
  "Setting the stage for what’s next…",
  "Finding the moments worth sharing…",
  "Almost there. Get ready to explore…",
];

const GamePreloader: React.FC = () => {
  const [messageIndex, setMessageIndex] = React.useState(0);

  React.useEffect(() => {
    const timer = window.setInterval(() => {
      setMessageIndex((index) => (index + 1) % messages.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="game-preloader" role="status" aria-live="polite" aria-label="Loading site media">
      <div className="game-preloader__card">
        <div className="game-preloader__icon"><Gamepad2 size={30} strokeWidth={1.7} /></div>
        <p className="game-preloader__eyebrow">Christian Leaders</p>
        <h1 className="game-preloader__title">Loading your world</h1>
        <div className="game-preloader__progress"><span /></div>
        <div className="game-preloader__message" key={messageIndex}>{messages[messageIndex]}</div>
        <LoaderCircle className="game-preloader__spinner" size={17} aria-hidden="true" />
      </div>
    </div>
  );
};

export default GamePreloader;
