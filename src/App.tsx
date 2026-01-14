/**
 * Main App Component
 * 
 * Root component that sets up routing and provides game context.
 * Uses HashRouter for client-side routing.
 * Wraps all routes in GameProvider for global state management.
 * 
 * Includes global hard-unlock system for iOS Safari and mobile browsers.
 */

import { useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { GameProvider } from './context/GameContext';
import { Home } from './pages/Home';
import { Train } from './pages/Train';
import { Locked } from './pages/Locked';
import { Success } from './pages/Success';
import { Stats } from './pages/Stats';
import { Resources } from './pages/Resources';
import { PlatinumGift } from './pages/PlatinumGift';
import { audioEngine } from './audio/audioEngine';
import { attachGlobalAudioUnlock, setupVisibilityResumeHandler } from './audio/unlockAudio';
import { DebugConsole } from './components/DebugConsole';

function App() {
  useEffect(() => {
    const setupAudio = async () => {
      try {
        const ctx = await audioEngine.init();
        
        // Setup global one-time hard-unlock on FIRST interaction
        attachGlobalAudioUnlock({
          audioContext: ctx,
          onUnlock: () => {
            localStorage.setItem('audioUnlocked', 'true');
            sessionStorage.setItem('audioUnlocked', 'true');
          }
        });

        // Setup visibility change handler for tab switching
        setupVisibilityResumeHandler(ctx);
      } catch (err) {
        console.warn('Audio setup failed:', err);
      }
    };

    setupAudio();
  }, []);

  return (
    <Router>
      <GameProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/train" element={<Train />} />
          <Route path="/locked" element={<Locked />} />
          <Route path="/success" element={<Success />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/resources/:category" element={<Resources />} />
          <Route path="/platinum-gift" element={<PlatinumGift />} />
          <Route path="/%2Fplatinum-gift" element={<PlatinumGift />} />
        </Routes>
        <DebugConsole />
      </GameProvider>
    </Router>
  );
}

export default App;
