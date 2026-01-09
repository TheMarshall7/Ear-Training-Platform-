
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { GameProvider } from './logic/GameContext';
import { Home } from './pages/Home';
import { Train } from './pages/Train';
import { Locked } from './pages/Locked';
import { Success } from './pages/Success';
import { Stats } from './pages/Stats';

function App() {
  return (
    <Router>
      <GameProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/train" element={<Train />} />
          <Route path="/locked" element={<Locked />} />
          <Route path="/success" element={<Success />} />
          <Route path="/stats" element={<Stats />} />
        </Routes>
      </GameProvider>
    </Router>
  );
}

export default App;
