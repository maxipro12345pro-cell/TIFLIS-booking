import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TiflisLogo from '../components/TiflisLogo.jsx';
import {
  clearExpiredPersistedHostessSession,
  hasRememberedHostessDevice,
  rememberHostessDevice,
  rememberHostessForSession,
} from '../lib/hostessAccess.js';
import { supabase } from '../lib/supabase.js';

export default function HostessLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function restoreRememberedAccess() {
      if (!hasRememberedHostessDevice()) {
        await clearExpiredPersistedHostessSession();
        return;
      }

      if (!supabase) {
        navigate('/hostess/branches', { replace: true });
        return;
      }

      const { data } = await supabase.auth.getSession();

      if (isMounted && data.session) {
        navigate('/hostess/branches', { replace: true });
      }
    }

    restoreRememberedAccess();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!supabase) {
      if (rememberMe) {
        rememberHostessDevice();
      } else {
        rememberHostessForSession();
      }

      navigate('/hostess/branches');
      return;
    }

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError(authError.message);
      return;
    }

    if (rememberMe) {
      rememberHostessDevice();
    } else {
      rememberHostessForSession();
    }

    navigate('/hostess/branches');
  };

  return (
    <main className="hostess-login-screen grid min-h-screen place-items-center bg-linen px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-lg bg-cream p-6 shadow-soft ring-1 ring-ink/10">
        <div className="mb-5 grid h-20 w-20 place-items-center rounded-full bg-coffee ring-1 ring-gold/30">
          <TiflisLogo className="h-14 w-14" />
        </div>
        <p className="text-sm font-semibold text-wine">TIFLIS · панель хостесс</p>
        <h1 className="mt-2 text-3xl font-semibold">Вход</h1>
        <div className="mt-6 space-y-3">
          <input
            required
            type="email"
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-md border border-ink/15 px-3 py-3"
          />
          <input
            required
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-md border border-ink/15 px-3 py-3"
          />
        </div>
        <label className="mt-4 flex items-start gap-3 rounded-lg border border-ink/10 bg-white/55 px-3 py-3 text-sm font-semibold text-ink/75">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(event) => setRememberMe(event.target.checked)}
            className="mt-0.5 h-5 w-5 shrink-0 accent-[#7A1F22]"
          />
          <span>
            Запомнить меня
            <small className="mt-1 block text-xs font-medium text-ink/50">
              Это устройство останется в системе ровно на 12 часов.
            </small>
          </span>
        </label>
        {error ? <p className="mt-3 text-sm text-rose-700">{error}</p> : null}
        <button className="mt-5 w-full rounded-md bg-ink px-4 py-3 text-sm font-semibold text-white">
          Войти
        </button>
      </form>
    </main>
  );
}
