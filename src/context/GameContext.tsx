/**
 * Game Context Provider
 * 
 * This file provides React context for global game state management.
 * It uses useReducer to manage complex game state including:
 * - Current mode and difficulty
 * - Streak and scoring
 * - XP and leveling system
 * - Session tracking and paywall logic
 * 
 * The context is provided at the app root level and can be accessed
 * via the useGame() hook in any component.
 */

import React, { createContext, useContext, useReducer } from 'react';
import type { GameMode, Difficulty, GameState, GameAction } from '../types/game';

// Maximum number of free sessions before paywall is triggered
const MAX_FREE_SESSIONS = 5;

/**
 * Calculate XP gained for an answer based on base points and current streak.
 * Formula: baseXP * (1 + streak * 0.1)
 * This rewards maintaining streaks with bonus XP.
 * 
 * @param basePoints - Base XP value for the question
 * @param streak - Current streak count
 * @returns Calculated XP value (floored to integer)
 */
const getXPForAnswer = (basePoints: number, streak: number): number => {
  return Math.floor(basePoints * (1 + streak * 0.1));
};

/**
 * Calculate player level from total XP.
 * Formula: floor(sqrt(xp / 100)) + 1
 * This creates a logarithmic progression where higher levels require more XP.
 * 
 * @param xp - Total experience points
 * @returns Current level (minimum 1)
 */
export const getLevelFromXP = (xp: number): number => {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
};

/**
 * Calculate the XP required to reach a specific level.
 * Inverse of getLevelFromXP: (level - 1)^2 * 100
 * 
 * @param level - Target level
 * @returns XP required to reach that level
 */
export const getXPForLevel = (level: number): number => {
  return Math.pow(level - 1, 2) * 100;
};

/**
 * Load game statistics from localStorage.
 * Retrieves persistent data that survives page refreshes.
 * 
 * @returns Partial GameState with loaded stats, or defaults if none exist
 */
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

/**
 * Initial game state when the app first loads.
 * Combines default values with persisted stats from localStorage.
 */
const initialState: GameState = {
  currentMode: 'interval',
  difficulty: 'easy',
  streak: 0,
  score: 0,
  runProgress: 0,
  sessionCount: parseInt(localStorage.getItem('ear_trainer_sessions') || '0'),
  isLocked: parseInt(localStorage.getItem('ear_trainer_sessions') || '0') >= MAX_FREE_SESSIONS,
  xp: 0,
  level: 1,
  totalQuestions: 0,
  totalCorrect: 0,
  bestStreak: 0,
  ...loadStats()
};

/**
 * Game state reducer function.
 * Handles all state updates based on dispatched actions.
 * Automatically persists relevant data to localStorage.
 * 
 * @param state - Current game state
 * @param action - Action to process
 * @returns New game state
 */
function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    // Change the active training mode and reset run progress
    case 'SET_MODE':
      return { ...state, currentMode: action.payload, streak: 0, runProgress: 0 };
    
    // Change difficulty level and reset run progress
    case 'SET_DIFFICULTY':
      return { ...state, difficulty: action.payload, streak: 0, runProgress: 0 };
    
    // Handle correct answer: update streak, score, XP, and stats
    case 'CORRECT_ANSWER': {
      const newStreak = state.streak + 1;
      const xpGained = getXPForAnswer(action.payload, state.streak);
      const newXP = state.xp + xpGained;
      const newLevel = getLevelFromXP(newXP);
      const newTotalQuestions = state.totalQuestions + 1;
      const newTotalCorrect = state.totalCorrect + 1;
      const newBestStreak = Math.max(state.bestStreak, newStreak);
      
      // Persist updated stats to localStorage
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
    
    // Handle wrong answer: reset streak but track the attempt
    case 'WRONG_ANSWER': {
      const newTotalQuestions = state.totalQuestions + 1;
      localStorage.setItem('ear_trainer_total_questions', newTotalQuestions.toString());
      return { 
        ...state, 
        streak: 0,
        totalQuestions: newTotalQuestions
      };
    }
    
    // Increment session count and check if paywall should be shown
    case 'INCREMENT_SESSION':
      const newCount = state.sessionCount + 1;
      localStorage.setItem('ear_trainer_sessions', newCount.toString());
      return { 
        ...state, 
        sessionCount: newCount,
        isLocked: newCount >= MAX_FREE_SESSIONS 
      };
    
    // Unlock the app (e.g., after payment)
    case 'UNLOCK_FEATURE':
      return { ...state, isLocked: false };
    
    // Reset current run progress (streak, score, progress)
    case 'RESET_RUN':
      return { ...state, runProgress: 0, streak: 0, score: 0 };
    
    // Reload stats from localStorage
    case 'LOAD_STATS':
      return { ...state, ...loadStats() };
    
    default:
      return state;
  }
}

// Export XP utility functions for use in other components
export { getXPForAnswer };

/**
 * React context for game state.
 * Provides state and dispatch function to all child components.
 */
const GameContext = createContext<{
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
} | null>(null);

/**
 * Game Provider component.
 * Wraps the app and provides game state via React context.
 * Uses useReducer to manage state updates.
 * 
 * @param children - Child components that need access to game state
 */
export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
};

/**
 * Hook to access game state and dispatch function.
 * Must be used within a GameProvider component.
 * 
 * @throws Error if used outside GameProvider
 * @returns Object containing state and dispatch function
 */
export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error("useGame must be used within a GameProvider");
  return context;
};
