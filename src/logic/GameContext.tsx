import React, { createContext, useContext, useReducer } from 'react';

export type GameMode = 'interval' | 'chord' | 'progression' | 'scale' | 'perfectPitch' | 'numberSystem' | 'melody';
export type Difficulty = 'easy' | 'medium' | 'hard';

interface GameState {
  currentMode: GameMode;
  difficulty: Difficulty;
  streak: number;
  score: number;
  runProgress: number;
  sessionCount: number;
  isLocked: boolean;
  xp: number;
  level: number;
  totalQuestions: number;
  totalCorrect: number;
  bestStreak: number;
}

type Action = 
  | { type: 'SET_MODE'; payload: GameMode }
  | { type: 'SET_DIFFICULTY'; payload: Difficulty }
  | { type: 'CORRECT_ANSWER'; payload: number }
  | { type: 'WRONG_ANSWER' }
  | { type: 'INCREMENT_SESSION' }
  | { type: 'UNLOCK_FEATURE' }
  | { type: 'RESET_RUN' }
  | { type: 'ADD_XP'; payload: number }
  | { type: 'LOAD_STATS' };

const MAX_FREE_SESSIONS = 5;

// XP calculation: baseXP * (1 + streak * 0.1)
const getXPForAnswer = (basePoints: number, streak: number): number => {
  return Math.floor(basePoints * (1 + streak * 0.1));
};

// Level calculation: level = floor(sqrt(xp / 100))
const getLevelFromXP = (xp: number): number => {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
};

const getXPForLevel = (level: number): number => {
  return Math.pow(level - 1, 2) * 100;
};

const loadStats = (): Partial<GameState> => {
  const xp = parseInt(localStorage.getItem('ear_trainer_xp') || '0');
  const totalQuestions = parseInt(localStorage.getItem('ear_trainer_total_questions') || '0');
  const totalCorrect = parseInt(localStorage.getItem('ear_trainer_total_correct') || '0');
  const bestStreak = parseInt(localStorage.getItem('ear_trainer_best_streak') || '0');
  
  return {
    xp,
    level: getLevelFromXP(xp),
    totalQuestions,
    totalCorrect,
    bestStreak
  };
};

const initialState: GameState = {
  currentMode: 'interval',
  difficulty: 'easy',
  streak: 0,
  score: 0,
  runProgress: 0,
  sessionCount: parseInt(localStorage.getItem('ear_trainer_sessions') || '0'),
  isLocked: parseInt(localStorage.getItem('ear_trainer_sessions') || '0') >= MAX_FREE_SESSIONS,
  ...loadStats()
};

function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'SET_MODE':
      return { ...state, currentMode: action.payload, streak: 0, runProgress: 0 };
    case 'SET_DIFFICULTY':
      return { ...state, difficulty: action.payload, streak: 0, runProgress: 0 };
    case 'CORRECT_ANSWER': {
      const newStreak = state.streak + 1;
      const xpGained = getXPForAnswer(action.payload, state.streak);
      const newXP = state.xp + xpGained;
      const newLevel = getLevelFromXP(newXP);
      const newTotalQuestions = state.totalQuestions + 1;
      const newTotalCorrect = state.totalCorrect + 1;
      const newBestStreak = Math.max(state.bestStreak, newStreak);
      
      // Save to localStorage
      localStorage.setItem('ear_trainer_xp', newXP.toString());
      localStorage.setItem('ear_trainer_total_questions', newTotalQuestions.toString());
      localStorage.setItem('ear_trainer_total_correct', newTotalCorrect.toString());
      localStorage.setItem('ear_trainer_best_streak', newBestStreak.toString());
      
      return { 
        ...state, 
        streak: newStreak,
        score: state.score + action.payload,
        runProgress: state.runProgress + 1,
        xp: newXP,
        level: newLevel,
        totalQuestions: newTotalQuestions,
        totalCorrect: newTotalCorrect,
        bestStreak: newBestStreak
      };
    }
    case 'WRONG_ANSWER': {
      const newTotalQuestions = state.totalQuestions + 1;
      localStorage.setItem('ear_trainer_total_questions', newTotalQuestions.toString());
      return { 
        ...state, 
        streak: 0,
        totalQuestions: newTotalQuestions
      };
    }
    case 'INCREMENT_SESSION':
      const newCount = state.sessionCount + 1;
      localStorage.setItem('ear_trainer_sessions', newCount.toString());
      return { 
        ...state, 
        sessionCount: newCount,
        isLocked: newCount >= MAX_FREE_SESSIONS 
      };
    case 'UNLOCK_FEATURE':
      return { ...state, isLocked: false };
    case 'RESET_RUN':
      return { ...state, runProgress: 0, streak: 0, score: 0 };
    case 'LOAD_STATS':
      return { ...state, ...loadStats() };
    default:
      return state;
  }
}

// Export utility functions
export { getXPForAnswer, getLevelFromXP, getXPForLevel };

const GameContext = createContext<{
  state: GameState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error("useGame must be used within a GameProvider");
  return context;
};
