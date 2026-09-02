import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import Login from './Login';
import Dashboard from './Dashboard';
import Vitrine from './Vitrine';

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('kryon_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleLoginSuccess = (userData: any) => {
    localStorage.setItem('kryon_user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('kryon_user');
    setUser(null);
  };

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f1117', color: 'white', gap: '12px' }}>
        <Loader2 className="animate-spin" size={32} />
        <span style={{ fontSize: '1.2rem' }}>Carregando sistema...</span>
      </div>
    );
  }

  // Check for public route (Vitrine)
  const isVitrine = window.location.pathname.startsWith('/vitrine/');
  const vitrineLojaId = isVitrine ? window.location.pathname.split('/vitrine/')[1] : null;

  if (isVitrine && vitrineLojaId) {
    return <Vitrine lojaId={vitrineLojaId} />;
  }

  return (
    <div className="App">
      {!user ? (
        <div className="flex-center">
          <Login onLoginSuccess={handleLoginSuccess} />
        </div>
      ) : (
        <Dashboard user={user} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;
