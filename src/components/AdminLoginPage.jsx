import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Lock, RefreshCw } from 'lucide-react';
import { adminLogin } from '../services/api';

export function AdminLoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await adminLogin(username, password);
      if (result.token) {
        onLogin(true);
        toast.success('Welcome Admin!');
      }
    } catch (error) {
      toast.error('Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <div className="login-icon"><Lock size={48} /></div>
        <h2>Admin Access</h2>
        <p>Please enter your credentials</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input type="text" placeholder="Username"
              value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>
          <div className="form-group">
            <input type="password" placeholder="Password"
              value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <RefreshCw size={18} className="spinning" /> : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}