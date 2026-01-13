/**
 * Game Type Definitions
 * 
 * This file contains all core game-related types used throughout the application.
 * Centralizing types here makes it easier to maintain consistency and understand
 * the data structures used across the codebase.
 */

/**
 * Available game modes in the ear training platform.
 * Each mode represents a different type of musical ear training exercise.
 */
export type GameMode = 
  | 'interval'        // Identify intervals between two notes
  | 'chord'           // Identify chord types
  | 'progression'     // Identify chord progressions
  | 'scale'           // Identify scale types
  | 'keyFinder'       // Identify key from chord progressions (replaces perfectPitch)
  | 'perfectPitch'    // Identify absolute note names (legacy, mapped to keyFinder)
  | 'numberSystem'    // Identify scale degrees within a key
  | 'melody'          // Identify scale degrees in a melodic sequence
  | 'tempo';          // Identify BPM/tempo from rhythm patterns

/**
 * Difficulty levels for game questions.
 * Controls the complexity and allowed options for each mode.
 */
export type Difficulty = 'easy' | 'medium' | 'hard';

/**
 * Complete game state managed by the GameContext.
 * Tracks user progress, statistics, and current session information.
 */
export interface GameState {
  /** Current active training mode */
  currentMode: GameMode;
  
  /** Current difficulty level */
  difficulty: Difficulty;
  
  /** Current streak of correct answers in this session */
  streak: number;
  
  /** Total score accumulated in current run */
  score: number;
  
  /** Progress through current run (number of questions answered) */
  runProgress: number;
  
  /** Total number of sessions completed */
  sessionCount: number;
  
  /** Whether the app is locked (free tier limit reached) */
  isLocked: boolean;
  
  /** Total experience points earned */
  xp: number;
  
  /** Current level (calculated from XP) */
  level: number;
  
  /** Total questions answered across all sessions */
  totalQuestions: number;
  
  /** Total correct answers across all sessions */
  totalCorrect: number;
  
  /** Best streak achieved across all sessions */
  bestStreak: number;
}

/**
 * Actions that can be dispatched to update game state.
 * Used by the game reducer to handle state changes.
 */
export type GameAction = 
  | { type: 'SET_MODE'; payload: GameMode }
  | { type: 'SET_DIFFICULTY'; payload: Difficulty }
  | { type: 'CORRECT_ANSWER'; payload: number }
  | { type: 'WRONG_ANSWER' }
  | { type: 'INCREMENT_SESSION' }
  | { type: 'UNLOCK_FEATURE' }
  | { type: 'RESET_RUN' }
  | { type: 'ADD_XP'; payload: number }
  | { type: 'LOAD_STATS' };
