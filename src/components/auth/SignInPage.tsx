import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../common/Logo';
import {
  getMemberPassword,
  saveMemberPassword,
  saveRememberedCredentials,
  generateSecureDeskPassword,
} from '../../utils/securityUtils';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  ArrowRight,
  Sparkles,
  ChevronDown,
  ChevronUp,
  KeyRound,
  CheckCircle2,
  Copy,
  Check,
  RotateCcw,
  X,
  ShieldCheck,
} from 'lucide-react';

export const SignInPage: React.FC = () => {
  const { login, register, allUsers, rememberedCredentials } = useAuth();

  // The site starts directly on the Sign Up page when clicked
  const [authMode, setAuthMode] = useState<'signup' | 'signin'>('signup');

  // Sign In Inputs (prefilled from remembered credentials if previously saved)
  const [signInIdentifier, setSignInIdentifier] = useState(() => rememberedCredentials?.identifier || '');
  const [signInPassword, setSignInPassword] = useState(() => rememberedCredentials?.password || '');
  const [signInRemember, setSignInRemember] = useState<boolean>(true);
  const [showSignInPassword, setShowSignInPassword] = useState(false);

  // Sign Up Inputs (Email only, no phone number)
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
  const [signUpRemember, setSignUpRemember] = useState<boolean>(true);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [showSignUpConfirmPassword, setShowSignUpConfirmPassword] = useState(false);

  // UI State
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [showDemoProfiles, setShowDemoProfiles] = useState(false);

  // Forgot Password / Password Generator Modal State
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryStep, setRecoveryStep] = useState<'input' | 'generated'>('input');
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [showGeneratedPassword, setShowGeneratedPassword] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [recoveryError, setRecoveryError] = useState<string | null>(null);

  // If remembered credentials exist, keep them in sync
  useEffect(() => {
    if (rememberedCredentials && !signInIdentifier) {
      setSignInIdentifier(rememberedCredentials.identifier);
      setSignInPassword(rememberedCredentials.password);
    }
  }, [rememberedCredentials]);

  // When changing identifier in Sign In, auto-fill remembered password
  const handleIdentifierChange = (val: string) => {
    setSignInIdentifier(val);
    const saved = getMemberPassword(val.trim());
    if (saved) {
      setSignInPassword(saved);
    }
  };

  // Sign Up Handler (Strictly Email, no phone required)
  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessBanner(null);

    const name = signUpName.trim();
    const email = signUpEmail.trim().toLowerCase();
    const pass = signUpPassword.trim();
    const confirmPass = signUpConfirmPassword.trim();

    if (!name) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!email) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    if (!email.includes('@')) {
      setErrorMessage('Please enter a valid email address (e.g. member@dominioncityasaba.org).');
      return;
    }
    if (pass.length < 4) {
      setErrorMessage('Password must be at least 4 characters.');
      return;
    }
    if (pass !== confirmPass) {
      setErrorMessage('Passwords do not match. Please check your confirmation password.');
      return;
    }

    const result = register({
      fullName: name,
      email: email,
      phone: '',
      departmentRole: 'Information Desk Member',
      password: pass,
      rememberPassword: signUpRemember,
    });

    if (!result.success) {
      setErrorMessage(result.message);
    }
  };

  // Sign In Handler
  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!signInIdentifier.trim()) {
      setErrorMessage('Please enter your email, phone, or name.');
      return;
    }

    const result = login(signInIdentifier, signInPassword, signInRemember);
    if (!result.success) {
      setErrorMessage(result.message);
    }
  };

  // Open Forgot Password Modal
  const handleOpenForgotPassword = () => {
    setRecoveryEmail(signInIdentifier.includes('@') ? signInIdentifier : '');
    setRecoveryStep('input');
    setRecoveryError(null);
    setIsForgotModalOpen(true);
  };

  // Step 1: Verify Email & Generate Password
  const handleVerifyEmailAndGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError(null);

    const email = recoveryEmail.trim().toLowerCase();
    if (!email) {
      setRecoveryError('Please enter your registered email address.');
      return;
    }
    if (!email.includes('@')) {
      setRecoveryError('Please enter a valid email address (e.g. member@dominioncityasaba.org).');
      return;
    }

    // Generate new secure password
    const newPass = generateSecureDeskPassword();
    setGeneratedPassword(newPass);

    // Save password immediately to local persistent storage for this email
    saveMemberPassword(email, newPass);
    saveRememberedCredentials(email, newPass, true);

    setRecoveryStep('generated');
  };

  // Regenerate another password
  const handleRegeneratePassword = () => {
    const newPass = generateSecureDeskPassword();
    setGeneratedPassword(newPass);
    const email = recoveryEmail.trim().toLowerCase();
    saveMemberPassword(email, newPass);
    saveRememberedCredentials(email, newPass, true);
  };

  // Copy Generated Password to clipboard
  const handleCopyPassword = () => {
    navigator.clipboard.writeText(generatedPassword);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Step 2: Apply New Password & Reset Page
  const handleApplyPasswordAndReset = () => {
    const email = recoveryEmail.trim().toLowerCase();
    saveMemberPassword(email, generatedPassword);
    saveRememberedCredentials(email, generatedPassword, true);

    // Reset the sign-in page state with the new password
    setSignInIdentifier(email);
    setSignInPassword(generatedPassword);
    setSignInRemember(true);
    setAuthMode('signin');
    setIsForgotModalOpen(false);

    setSuccessBanner(
      `✓ New password generated and remembered for ${email}! Your page has been reset with your new credentials.`
    );
  };

  // Apply & Sign In Directly
  const handleApplyAndSignInDirectly = () => {
    const email = recoveryEmail.trim().toLowerCase();
    saveMemberPassword(email, generatedPassword);
    saveRememberedCredentials(email, generatedPassword, true);

    setSignInIdentifier(email);
    setSignInPassword(generatedPassword);
    setIsForgotModalOpen(false);

    const res = login(email, generatedPassword, true);
    if (!res.success) {
      setErrorMessage(res.message);
    }
  };

  // Demo user select
  const handleSelectDemoUser = (email: string) => {
    const pass = getMemberPassword(email) || 'Member-2026';
    setSignInIdentifier(email);
    setSignInPassword(pass);
    setAuthMode('signin');
    setShowDemoProfiles(false);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-[#070D18] text-slate-100 font-sans relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div
        className="absolute -top-32 left-1/2 -translate-x-1/2 w-[550px] h-[350px] rounded-full blur-[120px] opacity-25 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #3B82F6 0%, #1D4ED8 50%, #F59E0B 100%)' }}
      />
      <div
        className="absolute -bottom-24 right-1/4 w-[400px] h-[300px] rounded-full blur-[120px] opacity-15 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #8B5CF6 0%, transparent 70%)' }}
      />

      {/* Main Clean Card */}
      <div className="w-full max-w-[420px] relative z-10 space-y-5">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-1.5">
          <Logo size="lg" variant="white" showText={true} />
          <p className="text-xs text-slate-400">
            Information Desk Management Platform
          </p>
        </div>

        {/* Card Container with subtle gradient border */}
        <div className="p-[1px] rounded-2xl bg-gradient-to-b from-white/15 via-white/5 to-white/10 shadow-2xl backdrop-blur-md">
          <div className="bg-[#0B1528]/90 rounded-2xl p-6 sm:p-7 space-y-4">
            {/* Minimal Segmented Tab Control: Sign Up (Default) vs Sign In */}
            <div className="flex p-1 rounded-xl bg-slate-900/90 border border-white/5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  setErrorMessage(null);
                  setSuccessBanner(null);
                }}
                className={`flex-1 py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  authMode === 'signup'
                    ? 'bg-blue-600 text-white shadow-sm font-bold btn-glow-blue'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Sign Up</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 font-black">
                  New
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMode('signin');
                  setErrorMessage(null);
                }}
                className={`flex-1 py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  authMode === 'signin'
                    ? 'bg-blue-600 text-white shadow-sm font-bold btn-glow-blue'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Sign In</span>
                {rememberedCredentials && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Password remembered" />
                )}
              </button>
            </div>

            {/* Title */}
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                {authMode === 'signup' ? 'Create Your Account' : 'Welcome Back'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {authMode === 'signup'
                  ? 'Enter your details to register. Your password is remembered on this device.'
                  : 'Enter your credentials to access the desk portal.'}
              </p>
            </div>

            {/* Success Banner (e.g. after password reset) */}
            {successBanner && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">{successBanner}</p>
              </div>
            )}

            {/* Error Message with Quick Recovery Link */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs space-y-1.5">
                <p>{errorMessage}</p>
                <button
                  type="button"
                  onClick={handleOpenForgotPassword}
                  className="text-[11px] text-amber-300 hover:text-amber-200 font-semibold underline text-left cursor-pointer inline-flex items-center gap-1"
                >
                  <KeyRound className="w-3 h-3" />
                  <span>Forgot your password? Reset & generate a new one via email →</span>
                </button>
              </div>
            )}

            {/* ======================================================== */}
            {/* CLEAN SIGN UP FORM */}
            {/* ======================================================== */}
            {authMode === 'signup' && (
              <form onSubmit={handleSignUpSubmit} className="space-y-3.5 text-xs">
                {/* Full Name */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Chukwudi Okonkwo"
                      value={signUpName}
                      onChange={(e) => setSignUpName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-900/80 text-white border border-slate-700/70 rounded-xl focus:border-blue-500 focus:outline-none transition-colors placeholder:text-slate-500"
                    />
                  </div>
                </div>

                {/* Email Address Only (No Phone) */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      placeholder="name@dominioncityasaba.org"
                      value={signUpEmail}
                      onChange={(e) => setSignUpEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-900/80 text-white border border-slate-700/70 rounded-xl focus:border-blue-500 focus:outline-none transition-colors placeholder:text-slate-500"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Create Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type={showSignUpPassword ? 'text' : 'password'}
                      required
                      placeholder="At least 4 characters"
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                      className="w-full pl-9 pr-9 py-2 bg-slate-900/80 text-white border border-slate-700/70 rounded-xl focus:border-blue-500 focus:outline-none transition-colors placeholder:text-slate-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-white cursor-pointer"
                      title={showSignUpPassword ? 'Hide password' : 'Show password'}
                    >
                      {showSignUpPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-slate-300 font-semibold">Confirm Password</label>
                    {signUpPassword && signUpConfirmPassword && (
                      <span
                        className={`text-[10px] font-medium ${
                          signUpPassword === signUpConfirmPassword ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {signUpPassword === signUpConfirmPassword ? '✓ Passwords match' : '✕ Does not match'}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type={showSignUpConfirmPassword ? 'text' : 'password'}
                      required
                      placeholder="Re-type your password"
                      value={signUpConfirmPassword}
                      onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                      className={`w-full pl-9 pr-9 py-2 bg-slate-900/80 text-white border rounded-xl focus:outline-none transition-colors placeholder:text-slate-500 ${
                        signUpConfirmPassword && signUpPassword !== signUpConfirmPassword
                          ? 'border-rose-500/80 focus:border-rose-500'
                          : 'border-slate-700/70 focus:border-blue-500'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignUpConfirmPassword(!showSignUpConfirmPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-white cursor-pointer"
                      title={showSignUpConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showSignUpConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Password Checkbox */}
                <div className="flex items-center gap-2 pt-0.5">
                  <input
                    type="checkbox"
                    id="signup-remember"
                    checked={signUpRemember}
                    onChange={(e) => setSignUpRemember(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500 bg-slate-900 border-slate-700 cursor-pointer"
                  />
                  <label htmlFor="signup-remember" className="text-slate-300 cursor-pointer select-none">
                    Remember password on this device
                  </label>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl btn-glow-blue font-bold text-xs text-white transition-all cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
                >
                  <span>Sign Up & Enter Desk</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Switch links */}
                <div className="text-center pt-1 space-y-1 text-slate-400 text-xs">
                  <div>
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('signin');
                        setErrorMessage(null);
                      }}
                      className="text-blue-400 font-semibold hover:underline cursor-pointer"
                    >
                      Sign in
                    </button>
                  </div>
                  <div>
                    Forgot your password?{' '}
                    <button
                      type="button"
                      onClick={handleOpenForgotPassword}
                      className="text-amber-400 hover:text-amber-300 font-medium hover:underline cursor-pointer"
                    >
                      Reset & generate via email →
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* ======================================================== */}
            {/* CLEAN SIGN IN FORM */}
            {/* ======================================================== */}
            {authMode === 'signin' && (
              <form onSubmit={handleSignInSubmit} className="space-y-3.5 text-xs">
                {/* Identifier */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Department Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. member@dominioncityasaba.org or admin.infodesk@..."
                      value={signInIdentifier}
                      onChange={(e) => handleIdentifierChange(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-900/80 text-white border border-slate-700/70 rounded-xl focus:border-blue-500 focus:outline-none transition-colors placeholder:text-slate-500"
                    />
                  </div>
                </div>

                {/* Password with Forgot Password Button */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-slate-300 font-semibold">
                      Password
                      {getMemberPassword(signInIdentifier) && (
                        <span className="ml-1.5 text-[10px] text-emerald-400 font-normal">
                          (remembered)
                        </span>
                      )}
                    </label>
                    <button
                      type="button"
                      onClick={handleOpenForgotPassword}
                      className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold cursor-pointer hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type={showSignInPassword ? 'text' : 'password'}
                      placeholder="Enter password"
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      className="w-full pl-9 pr-9 py-2 bg-slate-900/80 text-white border border-slate-700/70 rounded-xl focus:border-blue-500 focus:outline-none transition-colors placeholder:text-slate-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignInPassword(!showSignInPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-white cursor-pointer"
                    >
                      {showSignInPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Password Checkbox */}
                <div className="flex items-center gap-2 pt-0.5">
                  <input
                    type="checkbox"
                    id="signin-remember"
                    checked={signInRemember}
                    onChange={(e) => setSignInRemember(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500 bg-slate-900 border-slate-700 cursor-pointer"
                  />
                  <label htmlFor="signin-remember" className="text-slate-300 cursor-pointer select-none">
                    Remember password on this device
                  </label>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl btn-glow-blue font-bold text-xs text-white transition-all cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
                >
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Switch link */}
                <div className="text-center pt-1 text-slate-400 text-xs">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('signup');
                      setErrorMessage(null);
                    }}
                    className="text-blue-400 font-semibold hover:underline cursor-pointer"
                  >
                    Sign up
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Minimal, Unobtrusive Demo Quick Access Accordion (Discreetly at the bottom) */}
        <div className="text-center">
          <button
            type="button"
            onClick={() => setShowDemoProfiles(!showDemoProfiles)}
            className="text-[11px] text-slate-400 hover:text-slate-200 inline-flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>Quick test accounts</span>
            {showDemoProfiles ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {showDemoProfiles && (
            <div className="mt-2 p-2 bg-[#0E172B]/90 border border-slate-800 rounded-xl text-left space-y-1 text-xs animate-in fade-in duration-150">
              {allUsers.slice(0, 5).map((u) => (
                <button
                  key={u.id}
                  onClick={() => handleSelectDemoUser(u.email)}
                  className="w-full p-1.5 rounded-lg hover:bg-slate-800/80 flex items-center justify-between text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  <div className="truncate">
                    <span className="font-semibold">{u.name}</span>
                    <span className="text-[10px] text-slate-500 ml-1.5">({u.departmentRole})</span>
                  </div>
                  <span className="text-[10px] text-blue-400 font-bold shrink-0 ml-2">Fill →</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* FORGOT PASSWORD & PASSWORD GENERATION MODAL */}
      {/* ======================================================== */}
      {isForgotModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setIsForgotModalOpen(false)}
        >
          <div
            className="bg-[#0E172B] text-slate-100 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-800 space-y-4 animate-in zoom-in-95 duration-150 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Password Recovery & Generator</h3>
                  <p className="text-[11px] text-slate-400">
                    Dominion City Department Security Desk
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsForgotModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error Message in Modal */}
            {recoveryError && (
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {recoveryError}
              </div>
            )}

            {/* STEP 1: Enter Email Confirmation */}
            {recoveryStep === 'input' && (
              <form onSubmit={handleVerifyEmailAndGenerate} className="space-y-3.5 text-xs">
                <p className="text-slate-300 leading-relaxed text-xs">
                  Enter the email address used to sign up. A secure new password will be generated for your account and saved directly to this device's memory.
                </p>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Sign-Up Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. member@dominioncityasaba.org"
                      value={recoveryEmail}
                      onChange={(e) => setRecoveryEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-900/80 text-white border border-slate-700/70 rounded-xl focus:border-blue-500 focus:outline-none transition-colors placeholder:text-slate-500 text-xs"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl btn-glow-blue font-bold text-xs text-white transition-all cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] shadow-md"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Verify Email & Generate Password</span>
                </button>
              </form>
            )}

            {/* STEP 2: Password Generated */}
            {recoveryStep === 'generated' && (
              <div className="space-y-4 text-xs">
                {/* Verified Email Banner */}
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div className="truncate">
                    <span className="font-bold">Email Confirmed:</span>{' '}
                    <span className="text-emerald-200">{recoveryEmail}</span>
                  </div>
                </div>

                {/* Password Display Box */}
                <div className="p-3.5 bg-slate-900/90 rounded-xl border border-blue-500/30 space-y-2">
                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span className="font-semibold text-slate-300">Your New Generated Password:</span>
                    <button
                      type="button"
                      onClick={handleRegeneratePassword}
                      className="text-blue-400 hover:text-blue-300 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Regenerate</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between bg-[#070D18] p-2.5 rounded-lg border border-slate-800">
                    <span className="font-mono text-base font-bold text-amber-300 tracking-wider">
                      {showGeneratedPassword ? generatedPassword : '••••••••••••'}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setShowGeneratedPassword(!showGeneratedPassword)}
                        className="p-1 text-slate-400 hover:text-white cursor-pointer"
                        title={showGeneratedPassword ? 'Hide password' : 'Show password'}
                      >
                        {showGeneratedPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        type="button"
                        onClick={handleCopyPassword}
                        className="p-1 px-2 rounded bg-blue-600/80 hover:bg-blue-600 text-white font-semibold text-[10px] flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-300" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400">
                    This password is saved to local device memory. You can use it to sign in on any visit.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    onClick={handleApplyAndSignInDirectly}
                    className="w-full py-2.5 px-4 rounded-xl btn-glow-blue font-bold text-xs text-white transition-all cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] shadow-md"
                  >
                    <span>Sign In With New Password</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={handleApplyPasswordAndReset}
                    className="w-full py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer transition-colors"
                  >
                    Apply New Password & Reset Page
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
