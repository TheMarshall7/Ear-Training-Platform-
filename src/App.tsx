
/**
 * Main App Component
 * 
 * Root component that sets up routing and provides game context.
 * Uses HashRouter for client-side routing (works with static hosting).
 * Wraps all routes in GameProvider for global state management.
 * 
 * Includes global audio unlock system for iOS Safari and mobile browsers.
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
import { attachGlobalAudioUnlock, detachGlobalAudioUnlock, setupVisibilityResumeHandler } from './audio/unlockAudio';

function App() {
  useEffect(() => {
    let mounted = true;
    
    // Initialize audio engine and setup unlock system
    const setupAudio = async () => {
      try {
        await audioEngine.init();
        
        const context = audioEngine.getContext();
        if (context && mounted) {
          // Attempt immediate unlock (will work if user already interacted)
          try {
            await audioEngine.ensureUnlocked();
            sessionStorage.setItem('audioUnlocked', 'true');
            console.log('Audio unlocked immediately');
          } catch (err) {
            // Expected to fail on first load before user interaction
            console.debug('Immediate unlock not possible yet, setting up listeners');
          }
          
          // Setup global one-time audio unlock listeners
          // This automatically unlocks audio on first user interaction (click/touch)
          attachGlobalAudioUnlock({
            audioContext: context,
            onUnlock: () => {
              if (mounted) {
                console.log('Audio unlocked via global listener');
                sessionStorage.setItem('audioUnlocked', 'true');
                // Force banner to update by triggering a storage event
                window.dispatchEvent(new Event('storage'));
              }
            }
          });

          // Setup visibility change handler for tab switching / backgrounding
          setupVisibilityResumeHandler(context);
        }
      } catch (err) {
        console.warn('Audio setup failed:', err);
      }
    };

    setupAudio();

    // Cleanup on unmount
    return () => {
      mounted = false;
      detachGlobalAudioUnlock();
    };
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
          {/* Handle URL-encoded path for direct browser access */}
          <Route path="/%2Fplatinum-gift" element={<PlatinumGift />} />
        </Routes>
      </GameProvider>
    </Router>
  );
}

export default App;
