
import { useEffect, useState } from "react";
import {
  Puzzle, Brain, Shapes, Sparkles, Star,
  ArrowLeft, RotateCcw, Trophy, Volume2,
  VolumeX, Home, CheckCircle2
} from "lucide-react";


const games = [
  {
    id: "memory",
    name: "Memory Match",
    description: "Find the matching pictures.",
    icon: "🧠",
    color: "pink",
    level: "Easy",
    reward: "⭐"
  },
  {
    id: "number",
    name: "Number Puzzle",
    description: "Put the numbers in order.",
    icon: "🔢",
    color: "blue",
    level: "Medium",
    reward: "🏆"
  },
  {
    id: "shapes",
    name: "Shape Match",
    description: "Find the matching shape.",
    icon: "🔷",
    color: "yellow",
    level: "Easy",
    reward: "🌟"
  },
  {
    id: "odd",
    name: "Odd One Out",
    description: "Spot the different picture.",
    icon: "🦄",
    color: "green",
    level: "Easy",
    reward: "🎁"
  }
];

const memoryPictures = ["🐶", "🐱", "🦁", "🐸", "🐼", "🦋"];

const shapeQuestions = [
  { target: "🔺", answer: "Triangle", options: ["Circle", "Triangle", "Square", "Star"] },
  { target: "🟡", answer: "Circle", options: ["Heart", "Circle", "Square", "Diamond"] },
  { target: "🟥", answer: "Square", options: ["Triangle", "Circle", "Square", "Star"] },
  { target: "⭐", answer: "Star", options: ["Star", "Heart", "Circle", "Square"] },
  { target: "💎", answer: "Diamond", options: ["Diamond", "Triangle", "Heart", "Circle"] }
];

const oddQuestions = [
  { items: ["🐶", "🐱", "🐰", "🍎"], answer: "🍎", title: "Find the fruit!" },
  { items: ["🚗", "🚌", "🚂", "🐸"], answer: "🐸", title: "Find the animal!" },
  { items: ["🍌", "🍇", "🍓", "⚽"], answer: "⚽", title: "Find the toy!" },
  { items: ["🐟", "🐬", "🦈", "🌸"], answer: "🌸", title: "Find the flower!" },
  { items: ["🌞", "⭐", "🌙", "🐶"], answer: "🐶", title: "Find the animal!" }
];

function shuffle(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function makeMemoryCards() {
  return shuffle(
    [...memoryPictures.slice(0, 6), ...memoryPictures.slice(0, 6)]
      .map((value, index) => ({
        id: index,
        value
      }))
  );
}

function makeNumberBoard() {
  let board = [1, 2, 3, 4, 5, 6, 7, 8, 0];

  for (let i = 0; i < 80; i++) {
    const empty = board.indexOf(0);
    const choices = [
      empty - 3,
      empty + 3,
      empty % 3 > 0 ? empty - 1 : -1,
      empty % 3 < 2 ? empty + 1 : -1
    ].filter(n => n >= 0 && n < 9);

    const next = choices[Math.floor(Math.random() * choices.length)];
    [board[empty], board[next]] = [board[next], board[empty]];
  }

  return board;
}

export default function App() {
  const [active, setActive] = useState(null);
  const [stars, setStars] = useState(0);
  const [sound, setSound] = useState(false);
  const [memory, setMemory] = useState(makeMemoryCards);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [board, setBoard] = useState(makeNumberBoard);
  const [shapeIndex, setShapeIndex] = useState(0);
  const [oddIndex, setOddIndex] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [round, setRound] = useState(0);
  const [best, setBest] = useState(0);

  useEffect(() => {
    try {
      setStars(Number(localStorage.getItem("puzzlepop-stars") || 0));
      setBest(Number(localStorage.getItem("puzzlepop-best") || 0));
    } catch {
      // App remains usable if storage is unavailable.
    }
  }, []);

  useEffect(() => {
    if (flipped.length !== 2) return;

    const [first, second] = flipped;
    const isMatch = memory[first].value === memory[second].value;

    const timer = setTimeout(() => {
      if (isMatch) {
        setMatched(prev => [...prev, first, second]);
        setStars(prev => {
          const next = prev + 1;
          localStorage.setItem("puzzlepop-stars", String(next));
          return next;
        });
      }
      setFlipped([]);
    }, isMatch ? 450 : 850);

    return () => clearTimeout(timer);
  }, [flipped, memory]);

  useEffect(() => {
    if (matched.length === memory.length && memory.length > 0) {
      setFeedback("Amazing! You found every pair! 🎉");
      setRound(prev => prev + 1);
    }
  }, [matched, memory.length]);

  function openGame(game) {
    setActive(game);
    resetGame(game.id);
  }

  function resetGame(id = active?.id) {
    setFeedback("");
    setRound(0);
    setMoves(0);
    setFlipped([]);
    setMatched([]);
    setMemory(makeMemoryCards);
    setBoard(makeNumberBoard);
    setShapeIndex(0);
    setOddIndex(0);
    if (!id) setActive(null);
  }

  function goHome() {
    setActive(null);
    setFeedback("");
  }

  function completePoint() {
    setStars(prev => {
      const next = prev + 1;
      localStorage.setItem("puzzlepop-stars", String(next));
      return next;
    });
  }

  function playMemory(index) {
    if (
      flipped.length === 2 ||
      flipped.includes(index) ||
      matched.includes(index)
    ) return;

    setMoves(prev => prev + 1);
    setFlipped(prev => [...prev, index]);
  }

  function moveTile(index) {
    const empty = board.indexOf(0);
    const adjacent = [
      empty - 3,
      empty + 3,
      empty % 3 > 0 ? empty - 1 : -1,
      empty % 3 < 2 ? empty + 1 : -1
    ];

    if (!adjacent.includes(index)) return;

    const next = [...board];
    [next[index], next[empty]] = [next[empty], next[index]];
    setBoard(next);
    setMoves(prev => prev + 1);

    if (next.every((number, i) => number === (i === 8 ? 0 : i + 1))) {
      setFeedback("You solved the number puzzle! 🏆");
      completePoint();
      setBest(prev => {
        const value = prev + 1;
        localStorage.setItem("puzzlepop-best", String(value));
        return value;
      });
    }
  }

  function answerShape(option) {
    if (option === shapeQuestions[shapeIndex].answer) {
      setFeedback("That's right! 🌟");
      completePoint();
      setTimeout(() => {
        setShapeIndex(prev => (prev + 1) % shapeQuestions.length);
        setFeedback("");
      }, 700);
    } else {
      setFeedback("Try again, little thinker! 💜");
    }
  }

  function answerOdd(option) {
    if (option === oddQuestions[oddIndex].answer) {
      setFeedback("Great spotting! 🎉");
      completePoint();
      setTimeout(() => {
        setOddIndex(prev => (prev + 1) % oddQuestions.length);
        setFeedback("");
      }, 700);
    } else {
      setFeedback("Look carefully! Try again. 😊");
    }
  }

  return (
    <div className="app">
      <header className="topbar">
        <button className="brand" onClick={goHome}>
          <span className="brand-logo"><Puzzle size={23}/></span>
          <span>PuzzlePop <b>Kids</b></span>
        </button>

        <div className="header-actions">
          <div className="star-count"><Star size={18} fill="#ffc84d"/> {stars}</div>
          <button className="sound-btn" onClick={() => setSound(!sound)}
            aria-label="Toggle sound">
            {sound ? <Volume2/> : <VolumeX/>}
          </button>
        </div>
      </header>

      {!active ? (
        <main className="home">
          <section className="hero">
            <div className="hero-text">
              <span className="eyebrow">WELCOME, LITTLE EXPLORER!</span>
              <h1>Play, think & <span>shine!</span></h1>
              <p>Fun little puzzles to help your brain grow. Choose a game and let's play!</p>
              <div className="hero-label"><Sparkles size={16}/> Learn through play</div>
            </div>
            <div className="hero-emoji">🧩</div>
          </section>

          <section className="games-section">
            <div className="section-heading">
              <div>
                <span className="eyebrow">YOUR PLAYGROUND</span>
                <h2>Choose a game</h2>
              </div>
              <span className="game-total">4 games</span>
            </div>

            <div className="game-grid">
              {games.map(game => (
                <button
                  key={game.id}
                  className={`game-card ${game.color}`}
                  onClick={() => openGame(game)}
                >
                  <div className="game-icon">{game.icon}</div>
                  <div className="game-info">
                    <span className="level">{game.level}</span>
                    <h3>{game.name}</h3>
                    <p>{game.description}</p>
                    <span className="play-link">Play now <span>→</span></span>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="progress-card">
            <div className="progress-icon"><Trophy size={26}/></div>
            <div>
              <span className="eyebrow">YOUR LITTLE ACHIEVEMENT</span>
              <h3>{stars} stars collected!</h3>
              <p>Keep playing and discover more fun.</p>
            </div>
            <div className="progress-stars">⭐</div>
          </section>
        </main>
      ) : (
        <main className="play-area">
          <button className="back-button" onClick={goHome}>
            <ArrowLeft size={18}/> All games
          </button>

          <div className="play-heading">
            <div>
              <span className="eyebrow">LET'S PLAY!</span>
              <h1>{active.icon} {active.name}</h1>
              <p>{active.description}</p>
            </div>
            <button className="restart" onClick={() => resetGame(active.id)}>
              <RotateCcw size={17}/> Restart
            </button>
          </div>

          <div className="game-board">
            {active.id === "memory" && (
              <>
                <div className="game-instructions">
                  <Brain size={19}/> Find all the matching pairs.
                  <span>Moves: {moves}</span>
                </div>
                <div className="memory-grid">
                  {memory.map((card, index) => (
                    <button
                      key={card.id}
                      className={`memory-card ${
                        flipped.includes(index) || matched.includes(index) ? "revealed" : ""
                      } ${matched.includes(index) ? "matched" : ""}`}
                      onClick={() => playMemory(index)}
                      disabled={matched.includes(index)}
                    >
                      {flipped.includes(index) || matched.includes(index)
                        ? card.value : "?"}
                    </button>
                  ))}
                </div>
                {matched.length === memory.length && (
                  <button className="next-button" onClick={() => resetGame("memory")}>
                    Play again <RotateCcw size={18}/>
                  </button>
                )}
              </>
            )}

            {active.id === "number" && (
              <>
                <div className="game-instructions">
                  <Brain size={19}/> Move tiles to arrange 1 to 8.
                  <span>Moves: {moves}</span>
                </div>
                <div className="number-grid">
                  {board.map((number, index) => (
                    <button
                      key={index}
                      className={`number-tile ${number === 0 ? "empty" : ""}`}
                      onClick={() => moveTile(index)}
                      disabled={number === 0}
                    >
                      {number || ""}
                    </button>
                  ))}
                </div>
                {feedback.includes("solved") && (
                  <button className="next-button" onClick={() => resetGame("number")}>
                    New puzzle <RotateCcw size={18}/>
                  </button>
                )}
              </>
            )}

            {active.id === "shapes" && (
              <>
                <div className="game-instructions">
                  <Shapes size={19}/> Which name matches this shape?
                  <span>Round {shapeIndex + 1}</span>
                </div>
                <div className="question-card">
                  <span className="question-emoji">{shapeQuestions[shapeIndex].target}</span>
                  <h2>What shape is this?</h2>
                </div>
                <div className="answer-grid">
                  {shapeQuestions[shapeIndex].options.map(option => (
                    <button key={option} onClick={() => answerShape(option)}>
                      {option}
                    </button>
                  ))}
                </div>
              </>
            )}

            {active.id === "odd" && (
              <>
                <div className="game-instructions">
                  <Sparkles size={19}/> Find the picture that doesn't belong.
                  <span>Round {oddIndex + 1}</span>
                </div>
                <div className="question-card">
                  <h2>{oddQuestions[oddIndex].title}</h2>
                </div>
                <div className="odd-grid">
                  {oddQuestions[oddIndex].items.map(item => (
                    <button key={item} onClick={() => answerOdd(item)}>
                      {item}
                    </button>
                  ))}
                </div>
              </>
            )}

            {feedback && !feedback.includes("solved") && (
              <div className="feedback"><CheckCircle2 size={19}/> {feedback}</div>
            )}
            {feedback.includes("solved") && (
              <div className="feedback"><Trophy size={19}/> {feedback}</div>
            )}
          </div>

          <div className="tip-card">
            <span>💡</span>
            <p>Take your time. Every puzzle is a chance to learn something new!</p>
          </div>
        </main>
      )}

      <footer>
        <span>💜</span> Made for curious little minds
      </footer>
    </div>
  );
}
