import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

const App = () => {
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [questionCount, setQuestionCount] = useState(null);
  const [color, setColor] = useState('');
  const [options, setOptions] = useState([]);
  const [result, setResult] = useState('');
  const [revealed, setRevealed] = useState({});
  const [score, setScore] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [customQuestions, setCustomQuestions] = useState(0);
  const [maxScore, setMaxScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [mistakes, setMistakes] = useState(0);
  const timerRef = useRef(null);
  const countdownRef = useRef(null);

  useEffect(() => {
    if (isGameStarted) {
      setNewQuestion();
    }
  }, [isGameStarted]);

  useEffect(() => {
    if (questionIndex < questionCount && isGameStarted) {
      setNewQuestion();
    } else if (isGameStarted) {
      endGame();
    }
  }, [questionIndex]);

  useEffect(() => {
    if (timeLeft > 0) {
      countdownRef.current = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else {
      setQuestionIndex((prevIndex) => prevIndex + 1);
    }
    return () => clearTimeout(countdownRef.current);
  }, [timeLeft]);

  const setNewQuestion = () => {
    const correctColor = getRandomColor();
    const options = [correctColor, ...Array(5).fill().map(getRandomColor)].sort(() => Math.random() - 0.5);
    setColor(correctColor);
    setOptions(options);
    setResult('');
    setRevealed({});
    setStartTime(Date.now());
    setTimeLeft(20);
    setMistakes(0);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setQuestionIndex((prevIndex) => prevIndex + 1);
    }, 20000); // 20秒後に次の問題へ
  };

  const handleOptionClick = (option) => {
    const timeTaken = (Date.now() - startTime) / 1000;
    if (option === color) {
      let points;
      if (mistakes > 0) {
        points = 85;
      } else {
        points = timeTaken <= 5 ? 200 : 150;
      }
      setScore((prevScore) => prevScore + points);
      setResult('正解!');
      setTimeout(() => {
        setQuestionIndex((prevIndex) => prevIndex + 1);
      }, 1000); // 1秒待ってから次の問題へ
    } else {
      setScore((prevScore) => prevScore - 30);
      setMistakes((prevMistakes) => prevMistakes + 1);
      setRevealed((prevRevealed) => ({ ...prevRevealed, [option]: true }));
      setTimeout(() => {
        setOptions((prevOptions) => prevOptions.filter((opt) => opt !== option));
      }, 500); // 0.5秒後にボタンを削除
    }
  };

  const startGame = () => {
    setScore(0);
    setQuestionIndex(0);
    setIsGameStarted(true);
    setMaxScore(questionCount * 200);
  };

  const endGame = () => {
    setIsGameStarted(false);
    clearTimeout(timerRef.current);
    alert(`ゲーム終了! あなたのスコアは: ${score} 点です`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-200">
      {!isGameStarted ? (
        <div className="flex flex-col items-center">
          <h1 className="text-2xl mb-5">カラーコードあてゲーム</h1>
          <div className="flex flex-wrap justify-center mb-5">
            <button onClick={() => setQuestionCount(10)} className="p-2 m-2 text-lg bg-blue-500 text-white rounded cursor-pointer">
              10問
            </button>
            <button onClick={() => setQuestionCount(20)} className="p-2 m-2 text-lg bg-blue-500 text-white rounded cursor-pointer">
              20問
            </button>
            <button onClick={() => setCustomQuestions(1)} className="p-2 m-2 text-lg bg-blue-500 text-white rounded cursor-pointer">
              カスタム
            </button>
          </div>
          {customQuestions > 0 && (
            <input
              type="number"
              min="1"
              max="100"
              placeholder="問題数を入力"
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="p-2 text-lg mb-5"
            />
          )}
          {questionCount && (
            <button onClick={startGame} className="p-2 m-2 text-lg bg-green-500 text-white rounded cursor-pointer">
              スタート
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="text-lg mb-5">スコア: {score}/{maxScore}</div>
          <div className="text-lg mb-5">タイマー: {timeLeft}</div>
          <div id="colorCircle" className="w-24 h-24 rounded-full mb-5" style={{ backgroundColor: color }}></div>
          <div className="flex flex-wrap justify-center">
            {options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleOptionClick(option)}
                className={`p-2 m-2 text-lg rounded cursor-pointer transition-all duration-500 ${revealed[option] ? 'fade-out' : ''
                  }`}
                style={{ backgroundColor: revealed[option] ? option : '#FFFFFF', color: '#000000' }}
              >
                {option}
              </button>
            ))}
          </div>
          <p id="result" className="text-lg mt-5">{result}</p>
        </>
      )}
    </div>
  );
};

export default App;
