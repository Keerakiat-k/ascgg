import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';
import logoImg from '../assets/logo.png';
import heroBg from '../assets/hero_bg.jpg';

export default function LoginPage() {
  const navigate = useNavigate();

  return (
    <div
      className="h-[100dvh] w-full relative flex items-center justify-center overflow-hidden"
      style={{ background: '#0f0c08' }}
    >

      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBg})`, opacity: 0.35 }}
      />

      {/* Vignette overlay */}
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.7) 100%)' }}
      />

      {/* Warm gradient overlay */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(160deg, rgba(30,16,5,0.6) 0%, rgba(120,74,30,0.45) 60%, rgba(248,153,25,0.25) 100%)' }}
      />

      {/* Login Card */}
      <div
        className="relative z-10 w-full animate-fade-up"
        style={{ maxWidth: 400, margin: '0 16px' }}
      >
        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.97)',
          backdropFilter: 'blur(20px)',
          borderRadius: 24,
          overflow: 'hidden',
          boxShadow: '0 32px 80px rgba(0,0,0,0.35), 0 8px 24px rgba(0,0,0,0.15)',
          border: '1px solid rgba(255,255,255,0.9)',
        }}>

          {/* Header */}
          <div style={{
            padding: '28px 32px 20px',
            borderBottom: '1px solid #f0f2f5',
            background: 'linear-gradient(180deg, #fffbf5 0%, #ffffff 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}>
            <div style={{
              background: '#fff',
              padding: 10,
              borderRadius: 16,
              border: '1px solid #f0e8d8',
              boxShadow: '0 2px 8px rgba(248,153,25,0.12)',
              marginBottom: 14,
            }}>
              <img
                src={logoImg}
                alt="ASCG Group Logo"
                style={{ height: 48, width: 'auto', objectFit: 'contain', display: 'block' }}
              />
            </div>
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', letterSpacing: '-0.4px', margin: 0 }}>
                ASCG Group
              </h2>
              <p style={{ fontSize: 11, fontWeight: 600, color: '#f89919', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '4px 0 0' }}>
                Employee Portal
              </p>
            </div>
          </div>

          {/* Form Body */}
          <div style={{ padding: '24px 32px' }}>
            <p style={{ fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20, fontWeight: 400 }}>
              กรุณาเข้าสู่ระบบด้วยบัญชีองค์กร
            </p>

            <LoginForm />

            {/* Divider */}
            <div style={{ position: 'relative', margin: '20px 0' }}>
              <div style={{ height: 1, background: '#f0f2f5' }} />
              <span style={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                background: 'white', padding: '0 10px',
                fontSize: 10, color: '#c4c9d4', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
              }}>หรือ</span>
            </div>

            {/* Back button */}
            <button
              type="button"
              onClick={() => navigate('/')}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                background: '#fafbfc', border: '1px solid #e9ebee', borderRadius: 12,
                padding: '9px 16px', fontSize: 13, fontWeight: 500, color: '#6b7280',
                cursor: 'pointer', transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#fff7ed'; e.currentTarget.style.borderColor = '#fde68a'; e.currentTarget.style.color = '#c2690a'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#fafbfc'; e.currentTarget.style.borderColor = '#e9ebee'; e.currentTarget.style.color = '#6b7280'; }}
            >
              <ArrowLeft size={15} style={{ color: '#f89919' }} />
              กลับหน้าข่าวสารองค์กร
            </button>
          </div>
        </div>

        {/* Footer text */}
        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.02em' }}>
          © 2025 ASCG Group · All rights reserved
        </p>
      </div>
    </div>
  );
}