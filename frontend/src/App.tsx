import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home/Home';
import { Spacecraft } from './modules/spacecraft/Spacecraft/Spacecraft';
import { Profile } from './modules/auth/pages/Profile/Profile';
import { Register } from './modules/auth/pages/Register/Register';
import { Login } from './modules/auth/pages/Login/Login';
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