import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from './components/Home/Home';
import { Spacecraft } from './pages/Spacecraft/Spacecraft';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/spacecraft" element={<Spacecraft />} />
        <Route path="/missions" element={<div className="temp-page">Мои миссии</div>} />
        <Route path="/satellites" element={<div className="temp-page">Спутники</div>} />
        <Route path="/chat" element={<div className="temp-page">Чат</div>} />
        <Route path="/settings" element={<div className="temp-page">Настройки</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;