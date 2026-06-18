import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { apiPost } from '../lib/api';
import { setAuth } from '../lib/auth';

export default function Auth() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ email: '', password: '', username: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  async function submit(e) {
    e.preventDefault();
    setError('');
    if (mode === 'register' && form.password !== form.confirmPassword) {
      setError('Passwords do not match'); return;
    }
    setLoading(true);
    try {
      const data = await apiPost(`/api/users/${mode}`, {
        email: form.email, password: form.password,
        ...(mode === 'register' ? { username: form.username } : {}),
      });
      setAuth(data);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  const inputCls = 'w-full glass rounded-xl px-4 py-3 text-text text-sm placeholder:text-textMuted/60 outline-none focus:border-primary/60 transition-colors font-body';

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="min-h-dvh flex flex-col items-center justify-center px-5 py-10"
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-primary/10 blur-3xl -z-10" />

      <h1 className="font-display font-bold text-4xl text-gradient mb-1">Buzz</h1>
      <p className="text-textMuted text-sm mb-8 font-body">Find your night in Sofia</p>

      <div className="glass rounded-2xl p-6 w-full max-w-sm">
        {/* Tab toggle */}
        <div className="flex rounded-xl glass p-1 mb-5">
          {['login','register'].map(m => (
            <button key={m} onClick={() => { setMode(m); setError(''); }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors font-body ${
                mode === m ? 'bg-primary text-white' : 'text-textMuted'
              }`}>
              {m === 'login' ? 'Log in' : 'Sign up'}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="space-y-3">
          <AnimatePresence>
            {mode === 'register' && (
              <motion.input key="username"
                initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                className={inputCls} placeholder="Username"
                value={form.username} onChange={e => update('username', e.target.value)}
              />
            )}
          </AnimatePresence>
          <input className={inputCls} type="email" placeholder="Email"
            value={form.email} onChange={e => update('email', e.target.value)} required />
          <input className={inputCls} type="password" placeholder="Password"
            value={form.password} onChange={e => update('password', e.target.value)} required />
          <AnimatePresence>
            {mode === 'register' && (
              <motion.input key="confirm"
                initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                className={inputCls} type="password" placeholder="Confirm password"
                value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)}
              />
            )}
          </AnimatePresence>

          {error && <p className="text-accent text-xs font-body">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full mt-1">
            {loading ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}
          </Button>
        </form>
      </div>
    </motion.div>
  );
}
