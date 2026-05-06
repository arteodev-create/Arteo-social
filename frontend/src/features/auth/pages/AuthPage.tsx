import React, { useState } from 'react';
import { Logo } from '@shared/ui';
import { ArrowRight, At, LockKey, UserPlus } from '@phosphor-icons/react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@entities/session/model';
import { identityApi } from '@features/identity/api';
import { tokenStorage } from '@shared/api';
import VerifyCodeStep from '../ui/steps/VerifyCodeStep';

interface AuthPageProps {
  mode?: string;
}

const footerLinks = ['About', 'Privacy', 'Terms', 'Help', 'Developers', 'Status', '(c) 2026 Arteo'];

const AuthPage: React.FC<AuthPageProps> = ({ mode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading, isSubmitting, login, setAuth } = useAuthStore();
  const [identifier, setIdentifier] = useState('');
  const [credential, setCredential] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);
  const [localSubmitting, setLocalSubmitting] = useState(false);
  const isRegister = mode?.includes('register');
  const isVerify = mode?.includes('verify');
  const submitting = isRegister ? localSubmitting : isSubmitting;
  const redirectTo = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || '/home';

  React.useEffect(() => {
    if (resendCountdown <= 0) return undefined;
    const timer = window.setTimeout(() => setResendCountdown((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [resendCountdown]);

  React.useEffect(() => {
    if (!isVerify) return;
    const pendingEmail = localStorage.getItem('pending_verify_email');
    if (pendingEmail && !registeredEmail) setRegisteredEmail(pendingEmail);
  }, [isVerify, registeredEmail]);

  if (!isLoading && isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    try {
      if (isRegister) {
        setLocalSubmitting(true);
        await identityApi.establish({
          username: identifier.trim().replace(/^@/, ''),
          email: email.trim(),
          fullName: fullName.trim() || identifier.trim(),
          credential,
          language: 'en',
        });
        const nextEmail = email.trim();
        localStorage.setItem('pending_verify_email', nextEmail);
        setRegisteredEmail(nextEmail);
        setVerificationCode('');
        setResendCountdown(60);
        navigate('/flow/verify', { replace: true });
        return;
      }

      await login(identifier.trim(), credential);
      navigate(redirectTo, { replace: true });
    } catch (err: any) {
      setError(
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        err?.message ||
        (isRegister ? 'Register failed' : 'Login failed')
      );
    } finally {
      setLocalSubmitting(false);
    }
  };

  const handleVerify = async () => {
    setError('');

    try {
      setLocalSubmitting(true);
      const response = await identityApi.verify(registeredEmail, verificationCode, 'en');
      const data = response?.data;
      const accessToken = data?.tokens?.accessToken || data?.token;
      const refreshToken = data?.tokens?.refreshToken;

      if (data?.user && accessToken) {
        tokenStorage.setTokens(accessToken, refreshToken);
        setAuth({
          user: data.user,
          token: accessToken,
          isAuthenticated: true,
          isLoading: false,
        });
      }

      localStorage.removeItem('pending_verify_email');
      navigate('/home', { replace: true });
    } catch (err: any) {
      setError(
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        err?.message ||
        'Verification failed'
      );
    } finally {
      setLocalSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!registeredEmail || resendCountdown > 0) return;
    setError('');
    try {
      setLocalSubmitting(true);
      await identityApi.resendVerification(registeredEmail, 'en');
      setResendCountdown(60);
    } catch (err: any) {
      setError(
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        err?.message ||
        'Unable to resend verification code'
      );
    } finally {
      setLocalSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black">
      <main className="min-h-[calc(100vh-40px)] flex items-center justify-center px-6 py-10 lg:px-12">
        <div className="grid w-full max-w-[1120px] grid-cols-1 border-black lg:min-h-[640px] lg:grid-cols-[1fr_1fr] lg:border">
        <section className="hidden lg:flex flex-col justify-between border-r border-black px-12 py-10">
          <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center border border-black p-0.5">
                <Logo size={22} />
              </div>
            <span className="text-[18px] font-semibold leading-none">Arteo</span>
          </div>

          <div className="mt-6 max-w-[560px]">
            <div className="mb-8 grid w-[190px] grid-cols-4 gap-2">
              {Array.from({ length: 16 }).map((_, index) => (
                <div
                  key={index}
                  className={[
                    'aspect-square border border-black',
                    index === 0 || index === 5 || index === 10 || index === 15 ? 'bg-black' : 'bg-white',
                  ].join(' ')}
                />
              ))}
            </div>

            <p className="text-[13px] font-semibold uppercase text-black/55">Built around you</p>
            <h1 className="mt-4 max-w-[430px] text-[58px] font-black leading-[1]">
              Your space, your pace, your people.
            </h1>
            <p className="mt-6 max-w-[380px] text-[16px] leading-[1.55] text-black/65">
              Arteo helps you stay in control with trusted connections, cleaner conversations, and less noise every day.
            </p>
          </div>

          <div className="grid grid-cols-3 border border-black text-[12px] font-semibold uppercase">
            <div className="border-r border-black px-4 py-3">Verified</div>
            <div className="border-r border-black px-4 py-3">Focused</div>
            <div className="px-4 py-3">Real</div>
          </div>
        </section>

        <section className="flex min-h-[calc(100vh-120px)] items-center justify-center px-5 py-10 lg:min-h-0">
          <div className="w-full max-w-[360px]">
            <div className="mb-10 flex items-center justify-between lg:hidden">
              <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center border border-black p-0.5">
                    <Logo size={22} />
                  </div>
                  <span className="text-[18px] font-semibold leading-none">Arteo</span>
                </div>
              <span className="text-[11px] font-semibold uppercase text-black/55">Auth</span>
            </div>

            <div className="border border-black">
              <div className="border-b border-black px-5 py-4">
                <p className="text-[11px] font-semibold uppercase text-black/55">
                  {isVerify ? 'Verify identity' : isRegister ? 'Create identity' : 'Welcome back'}
                </p>
                <h2 className="mt-2 text-[30px] font-black leading-none">
                  {isVerify ? 'Check email' : isRegister ? 'Join Arteo' : 'Sign in'}
                </h2>
              </div>

              {isVerify ? (
                <div className="px-5 py-5">
                  {registeredEmail ? (
                    <div className="space-y-4">
                      <VerifyCodeStep
                        email={registeredEmail}
                        code={verificationCode}
                        onChange={setVerificationCode}
                        onSubmit={handleVerify}
                        onResend={handleResend}
                        loading={localSubmitting}
                        countdown={resendCountdown}
                        onBack={() => navigate('/flow/register')}
                      />
                      {error && (
                        <div className="border border-black px-3 py-2 text-[12px] font-semibold text-black">
                          {error}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-[13px] font-medium text-black/60">
                        No pending email found. Create an account first so Arteo can send your verification code.
                      </p>
                      <button
                        className="flex h-11 w-full items-center justify-center bg-black text-[15px] font-bold text-white"
                        onClick={() => navigate('/flow/register')}
                        type="button"
                      >
                        Back to register
                      </button>
                    </div>
                  )}
                </div>
              ) : (
              <form className="space-y-3 px-5 py-5" onSubmit={handleSubmit}>
                <label className="block">
                  <span className="mb-2 flex items-center gap-2 text-[12px] font-semibold uppercase text-black/60">
                    <At size={14} weight="bold" />
                    {isRegister ? 'Username' : 'Email or username'}
                  </span>
                  <input
                    className="h-11 w-full border border-black bg-white px-3 text-[15px] font-medium outline-none"
                    placeholder={isRegister ? 'dogiahuy' : 'dogiahuy or email@example.com'}
                    type="text"
                    value={identifier}
                    onChange={(event) => setIdentifier(event.target.value)}
                  />
                </label>

                {isRegister && (
                  <label className="block">
                    <span className="mb-2 flex items-center gap-2 text-[12px] font-semibold uppercase text-black/60">
                      <UserPlus size={14} weight="bold" />
                      Display name
                    </span>
                    <input
                      className="h-11 w-full border border-black bg-white px-3 text-[15px] font-medium outline-none"
                      placeholder="Arteo Creator"
                      type="text"
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                    />
                  </label>
                )}

                {isRegister && (
                  <label className="block">
                    <span className="mb-2 flex items-center gap-2 text-[12px] font-semibold uppercase text-black/60">
                      <At size={14} weight="bold" />
                      Email
                    </span>
                    <input
                      className="h-11 w-full border border-black bg-white px-3 text-[15px] font-medium outline-none"
                      placeholder="email@example.com"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                    />
                  </label>
                )}

                <label className="block">
                  <span className="mb-2 flex items-center gap-2 text-[12px] font-semibold uppercase text-black/60">
                    <LockKey size={14} weight="bold" />
                    Password
                  </span>
                  <input
                    className="h-11 w-full border border-black bg-white px-3 text-[15px] font-medium outline-none"
                    placeholder="Password"
                    type="password"
                    value={credential}
                    onChange={(event) => setCredential(event.target.value)}
                  />
                </label>

                {error && (
                  <div className="border border-black px-3 py-2 text-[12px] font-semibold text-black">
                    {error}
                  </div>
                )}

                <button
                  className="mt-2 flex h-11 w-full items-center justify-center gap-2 bg-black text-[15px] font-bold text-white"
                  disabled={submitting}
                  type="submit"
                >
                  {submitting ? 'Checking...' : isRegister ? 'Create account' : 'Login'}
                  <ArrowRight size={16} weight="bold" />
                </button>

              </form>
              )}

              <div className="border-t border-black px-5 py-4">
                <button
                  className="w-full text-left text-[14px] font-semibold"
                  onClick={() => navigate(isRegister || isVerify ? '/flow/login' : '/flow/register')}
                  type="button"
                >
                  {isRegister || isVerify ? 'Already have an account? Login' : 'New to Arteo? Create account'}
                </button>
              </div>
            </div>

            <p className="mt-5 text-[11px] leading-[1.5] text-black/55">
              By continuing, you agree to Arteo Terms, Privacy Policy and Cookie use.
            </p>
          </div>
        </section>
        </div>
      </main>

      <footer className="flex min-h-10 flex-wrap items-center justify-center gap-x-3 gap-y-1 border-t border-black px-4 py-2 text-[11px] text-black/55">
        {footerLinks.map((link) => (
          <span key={link}>{link}</span>
        ))}
      </footer>
    </div>
  );
};

export default AuthPage;
