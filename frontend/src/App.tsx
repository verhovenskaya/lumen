import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from './components/Home/Home';
import { Spacecraft } from './pages/Spacecraft/Spacecraft';
import { Profile } from './pages/Profile/Profile';
import { Register } from './pages/Register/Register';
import { Login } from './pages/Login/Login';
import { Settings } from './pages/Settings/Settings';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/spacecraft" element={<Spacecraft />} />
        <Route path="/missions" element={<div className="temp-page">Мои миссии</div>} />
        <Route path="/satellites" element={<div className="temp-page">Спутники</div>} />
        <Route path="/chat" element={<div className="temp-page">Чат</div>} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;