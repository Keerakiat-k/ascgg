import { useState, useEffect } from 'react';
import { Megaphone, Calendar, Info, Clock, LogIn, ArrowRight, Headset, X, Search, Bell, ShieldCheck, BookOpen, FileText, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import heroBg from '../assets/hero_bg.jpg';

export default function AnnouncementPage() {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  
  // 🧭 Main Section Mode: 'news' (ข่าวสารและกิจกรรม) | 'policies' (นโยบายองค์กร)
  const [viewMode, setViewMode] = useState('news');
  
  // Sub-filter within the active mode
  const [filter, setFilter] = useState('ทั้งหมด');
  const [announcementTypes, setAnnouncementTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [annRes, typeRes] = await Promise.all([
          fetch(import.meta.env.VITE_API_BASE_URL + '/api/announcements'),
          fetch(import.meta.env.VITE_API_BASE_URL + '/api/announcement-types'),
        ]);
        const annResult = await annRes.json();
        const typeResult = await typeRes.json();
        if (annRes.ok && annResult.status === 'success') setAnnouncements(annResult.data || []);
        if (typeRes.ok && typeResult.status === 'success') {
          const types = typeResult.data.filter((t) => t.status === 'Active').map((t) => t.name);
          setAnnouncementTypes(types);
        } else {
          setAnnouncementTypes(['ประกาศสำคัญ', 'กิจกรรม', 'ทั่วไป']);
        }
      } catch (e) {
        console.error(e);
        setAnnouncementTypes(['ประกาศสำคัญ', 'กิจกรรม', 'ทั่วไป']);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Reset page when mode, filter or search term changes
  useEffect(() => { 
    setCurrentPage(1); 
  }, [viewMode, filter, searchTerm]);

  const getBadgeStyle = (type) => {
    switch (type) {
      case 'ประกาศสำคัญ': return { bg: '#fff1f2', text: '#be123c', border: '#fecdd3', icon: <Megaphone size={11} /> };
      case 'กิจกรรม':     return { bg: '#fff7ed', text: '#c2690a', border: '#fed7aa', icon: <Calendar size={11} /> };
      case 'นโยบายองค์กร': return { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe', icon: <ShieldCheck size={11} /> };
      default:            return { bg: '#f3f4f6', text: '#374151', border: '#e5e7eb', icon: <Info size={11} /> };
    }
  };

  // 1️⃣ แยกชุดข้อมูลข่าวสาร (ไม่เอานโยบายมาปน)
  const newsAnnouncements = announcements.filter(item => item.type !== 'นโยบายองค์กร');
  
  // 2️⃣ แยกชุดข้อมูลนโยบายองค์กร (เฉพาะนโยบายเท่านั้น)
  const policyAnnouncements = announcements.filter(item => item.type === 'นโยบายองค์กร');

  // Filter Categories for News Mode (Excludes 'นโยบายองค์กร')
  const newsCategories = ['ทั้งหมด', ...announcementTypes.filter(t => t !== 'นโยบายองค์กร')];

  // Current active data set based on viewMode
  const activeDataset = viewMode === 'news' ? newsAnnouncements : policyAnnouncements;

  // Filter & Search Logic
  const filteredData = activeDataset
    .filter((item) => {
      if (viewMode === 'policies') return true; // In policy mode, all items are already policies
      if (filter === 'ทั้งหมด') return true;
      return item.type === filter;
    })
    .filter((item) =>
      searchTerm === '' ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentItems = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  
  // Featured item only for News Mode when looking at 'ทั้งหมด'
  const latestNewsItem = newsAnnouncements[0];

  const handleSwitchMode = (mode) => {
    setViewMode(mode);
    setFilter('ทั้งหมด');
    setSearchTerm('');
  };

  return (
    <div style={{ minHeight: '100vh', fontFamily: "'Inter', 'Prompt', system-ui, sans-serif", background: '#f4f5f7' }}>

      {/* ========== NAVBAR ========== */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #e9ebee',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', height: 62, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => handleSwitchMode('news')}>
            <img src={logo} alt="ASCG Group" style={{ height: 34, width: 'auto', objectFit: 'contain' }} />
            <span style={{ fontSize: 15, fontWeight: 700, color: '#111827', letterSpacing: '-0.3px' }} className="hidden sm:block">ASCG Group</span>
          </div>

          {/* Mode Switcher Buttons */}
          <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200/80 shadow-inner">
            <button
              onClick={() => handleSwitchMode('news')}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 16px', borderRadius: 9, fontSize: 13, fontWeight: viewMode === 'news' ? 700 : 500,
                background: viewMode === 'news' ? '#ffffff' : 'transparent',
                color: viewMode === 'news' ? '#c2690a' : '#64748b',
                boxShadow: viewMode === 'news' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                border: 'none', cursor: 'pointer', transition: 'all 0.15s ease'
              }}
            >
              <Megaphone size={14} style={{ color: viewMode === 'news' ? '#f89919' : '#94a3b8' }} />
              <span>ข่าวสารและกิจกรรม</span>
            </button>

            <button
              onClick={() => handleSwitchMode('policies')}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 16px', borderRadius: 9, fontSize: 13, fontWeight: viewMode === 'policies' ? 700 : 500,
                background: viewMode === 'policies' ? '#ffffff' : 'transparent',
                color: viewMode === 'policies' ? '#1d4ed8' : '#64748b',
                boxShadow: viewMode === 'policies' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                border: 'none', cursor: 'pointer', transition: 'all 0.15s ease'
              }}
            >
              <ShieldCheck size={14} style={{ color: viewMode === 'policies' ? '#2563eb' : '#94a3b8' }} />
              <span>นโยบายองค์กร</span>
              {policyAnnouncements.length > 0 && (
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 99,
                  background: viewMode === 'policies' ? '#eff6ff' : '#e2e8f0',
                  color: viewMode === 'policies' ? '#1d4ed8' : '#475569',
                  border: viewMode === 'policies' ? '1px solid #bfdbfe' : 'none'
                }}>
                  {policyAnnouncements.length}
                </span>
              )}
            </button>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => navigate('/report-it')}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 14px', borderRadius: 10, fontSize: 13, fontWeight: 500,
                border: '1px solid #e9ebee', background: 'white', color: '#4b5563',
                cursor: 'pointer', transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#f89919'; e.currentTarget.style.color = '#c2690a'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e9ebee'; e.currentTarget.style.color = '#4b5563'; }}
            >
              <Headset size={14} style={{ color: '#f89919' }} />
              <span className="hidden sm:inline">แจ้งปัญหา IT</span>
            </button>
            <button
              onClick={() => navigate('/login')}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                background: '#f89919', color: 'white', border: 'none',
                cursor: 'pointer', transition: 'all 0.15s',
                boxShadow: '0 2px 6px rgba(248,153,25,0.3)',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#e8860a'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#f89919'; }}
            >
              <LogIn size={14} />
              <span className="hidden sm:inline">เข้าสู่ระบบ</span>
            </button>
          </div>
        </div>
      </nav>

      {/* ========== HERO SECTION ========== */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: '68px 24px 76px' }}>
        {/* Background Image */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${heroBg})`, backgroundSize: 'cover', backgroundPosition: 'center 45%', opacity: 0.52 }} />
        
        {/* Dynamic Gradient Overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: viewMode === 'policies'
            ? 'linear-gradient(160deg, rgba(9,19,38,0.92) 0%, rgba(20,40,75,0.78) 50%, rgba(37,99,235,0.45) 100%)'
            : 'linear-gradient(160deg, rgba(10,8,5,0.88) 0%, rgba(35,20,8,0.72) 50%, rgba(248,153,25,0.45) 100%)'
        }} />

        <div style={{ position: 'relative', zIndex: 10, maxWidth: 740, margin: '0 auto', textAlign: 'center' }}>
          {/* Eyebrow */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)',
            borderRadius: 9999, padding: '6px 16px', marginBottom: 20,
            fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(8px)', letterSpacing: '0.04em',
          }}>
            {viewMode === 'policies' ? (
              <>
                <ShieldCheck size={13} style={{ color: '#60a5fa' }} />
                นโยบายและระเบียบปฏิบัติองค์กร (Corporate Governance & Policies)
              </>
            ) : (
              <>
                <Bell size={12} style={{ color: '#f89919' }} />
                ข่าวสารและกิจกรรมองค์กร (News & Events)
              </>
            )}
          </div>

          <h1 style={{
            fontSize: 'clamp(28px, 5vw, 48px)',
            fontWeight: 800, color: '#ffffff',
            letterSpacing: '-0.04em', lineHeight: 1.18,
            marginBottom: 14, margin: '0 0 14px',
          }}>
            {viewMode === 'policies' ? (
              <>
                นโยบายและระเบียบปฏิบัติ
                <br />
                <span style={{ color: '#60a5fa' }}>ของ ASCG Group</span>
              </>
            ) : (
              <>
                อัปเดตทุกความเคลื่อนไหว
                <br />
                <span style={{ color: '#f89919' }}>ของ ASCG Group</span>
              </>
            )}
          </h1>

          <p style={{ fontSize: 14.5, color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, maxWidth: 540, margin: '0 auto 28px', fontWeight: 400 }}>
            {viewMode === 'policies'
              ? 'คู่มือ กฎระเบียบข้อบังคับ และมาตรฐานความปลอดภัยสารสนเทศสำหรับบุคลากรทุกคนเพื่อยึดถือปฏิบัติร่วมกัน'
              : 'ติดตามประกาศสำคัญ ข่าวกิจกรรม และความเคลื่อนไหวต่างๆ ภายในองค์กร'}
          </p>

          {/* Search box */}
          <div style={{ position: 'relative', maxWidth: 480, margin: '0 auto' }}>
            <Search size={16} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)', pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder={viewMode === 'policies' ? "ค้นหานโยบาย, กฎระเบียบข้อบังคับ..." : "ค้นหาประกาศ, ข่าวสาร..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%', paddingLeft: 46, paddingRight: 16, paddingTop: 12, paddingBottom: 12,
                borderRadius: 14, fontSize: 13.5, outline: 'none',
                background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)', color: '#ffffff',
                boxSizing: 'border-box', transition: 'all 0.2s',
              }}
              onFocus={e => { e.target.style.background = 'rgba(255,255,255,0.15)'; e.target.style.borderColor = viewMode === 'policies' ? 'rgba(96,165,250,0.6)' : 'rgba(248,153,25,0.6)'; }}
              onBlur={e => { e.target.style.background = 'rgba(255,255,255,0.1)'; e.target.style.borderColor = 'rgba(255,255,255,0.2)'; }}
            />
          </div>
        </div>
      </section>

      {/* ========== FEATURED CARD (เฉพาะโหมดข่าวสาร เมื่อดูทั้งหมด และไม่มีค้นหา) ========== */}
      {viewMode === 'news' && latestNewsItem && !isLoading && searchTerm === '' && filter === 'ทั้งหมด' && (
        <section style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', marginTop: -36, marginBottom: 36, position: 'relative', zIndex: 10 }}>
          <div
            onClick={() => setSelectedAnnouncement(latestNewsItem)}
            style={{
              borderRadius: 20, overflow: 'hidden', cursor: 'pointer',
              background: '#1c1917',
              boxShadow: '0 20px 60px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.1)',
              border: '1px solid #292524',
              display: 'flex', flexDirection: 'row', flexWrap: 'wrap',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 28px 70px rgba(0,0,0,0.22), 0 8px 24px rgba(0,0,0,0.12)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.1)'; }}
          >
            {/* Text */}
            <div style={{ padding: '40px 44px', flex: 1, minWidth: 280, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                <span style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  background: '#f89919', color: 'white',
                  padding: '4px 12px', borderRadius: 9999, fontSize: 11, fontWeight: 700,
                }}>
                  <Bell size={10} style={{ animation: 'pulse 2s infinite' }} /> ล่าสุด
                </span>
                {(() => {
                  const s = getBadgeStyle(latestNewsItem.type);
                  return (
                    <span style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      background: s.bg, color: s.text, border: `1px solid ${s.border}`,
                      padding: '4px 10px', borderRadius: 9999, fontSize: 11, fontWeight: 600,
                    }}>
                      {s.icon} {latestNewsItem.type}
                    </span>
                  );
                })()}
              </div>
              <h2 style={{ fontSize: 'clamp(18px, 3vw, 24px)', fontWeight: 700, color: '#ffffff', lineHeight: 1.3, marginBottom: 12, letterSpacing: '-0.02em' }}>
                {latestNewsItem.title}
              </h2>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, marginBottom: 24, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {latestNewsItem.content}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
                  <Clock size={12} />
                  {new Date(latestNewsItem.created_at).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, fontWeight: 600, color: '#f89919' }}>
                  อ่านต่อ <ArrowRight size={14} />
                </span>
              </div>
            </div>
            {/* Image */}
            <div style={{ width: '40%', minWidth: 200, minHeight: 220, position: 'relative', background: '#292524', overflow: 'hidden' }}>
              {latestNewsItem.cover_image ? (
                <img
                  src={`${import.meta.env.VITE_API_BASE_URL}/uploads/announcements/${latestNewsItem.cover_image}`}
                  alt={latestNewsItem.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85, transition: 'transform 0.5s, opacity 0.3s' }}
                />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.1 }}>
                  <Megaphone size={72} style={{ color: 'white' }} />
                </div>
              )}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, #1c1917 0%, transparent 40%)' }} />
            </div>
          </div>
        </section>
      )}

      {/* ========== FILTER BAR (เฉพาะโหมดข่าวสาร) ========== */}
      {viewMode === 'news' && (
        <section style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: (latestNewsItem && !isLoading && searchTerm === '' && filter === 'ทั้งหมด')
            ? '0 24px 28px'
            : '36px 24px 28px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            {newsCategories.map((type) => {
              const active = filter === type;
              return (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '8px 20px', borderRadius: 9999, fontSize: 13, fontWeight: active ? 600 : 500,
                    border: `1px solid ${active ? '#f89919' : '#e9ebee'}`,
                    background: active ? '#f89919' : '#ffffff',
                    color: active ? '#ffffff' : '#4b5563',
                    cursor: 'pointer', transition: 'all 0.15s',
                    boxShadow: active ? '0 3px 10px rgba(248,153,25,0.25)' : '0 1px 3px rgba(0,0,0,0.04)',
                  }}
                  onMouseEnter={e => {
                    if (!active) {
                      e.currentTarget.style.borderColor = '#f89919';
                      e.currentTarget.style.color = '#c2690a';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!active) {
                      e.currentTarget.style.borderColor = '#e9ebee';
                      e.currentTarget.style.color = '#4b5563';
                    }
                  }}
                >
                  {type === 'ประกาศสำคัญ' && <Megaphone size={13} style={{ color: active ? 'white' : '#dc2626' }} />}
                  {type === 'กิจกรรม' && <Calendar size={13} style={{ color: active ? 'white' : '#f89919' }} />}
                  <span>{type}</span>
                  {active && filteredData.length > 0 && (
                    <span style={{ marginLeft: 4, background: 'rgba(255,255,255,0.25)', padding: '1px 6px', borderRadius: 9999, fontSize: 11, fontWeight: 700 }}>
                      {filteredData.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* ========== POLICIES HEADER BAR (เฉพาะโหมดนโยบายองค์กร) ========== */}
      {viewMode === 'policies' && (
        <section style={{ maxWidth: 1280, margin: '0 auto', padding: '36px 24px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e9ebee', paddingBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, background: '#eff6ff', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #bfdbfe' }}>
                <ShieldCheck size={20} style={{ color: '#2563eb' }} />
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: 0 }}>
                  ทะเบียนนโยบายและระเบียบปฏิบัติองค์กร
                </h3>
                <p style={{ fontSize: 12.5, color: '#64748b', margin: '2px 0 0' }}>
                  เอกสารมาตรฐานและการกำกับดูแลสำหรับพนักงานในเครือ ASCG Group
                </p>
              </div>
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#1d4ed8', background: '#eff6ff', padding: '4px 12px', borderRadius: 99, border: '1px solid #bfdbfe' }}>
              ทั้งหมด {filteredData.length} นโยบาย
            </span>
          </div>
        </section>
      )}

      {/* ========== CARDS GRID ========== */}
      <section style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px 80px' }}>
        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 0', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid #e9ebee', borderTopColor: viewMode === 'policies' ? '#2563eb' : '#f89919', animation: 'spin 0.8s linear infinite' }} />
            <p style={{ fontSize: 13, color: '#9ca3af', fontWeight: 500 }}>กำลังโหลดข้อมูล...</p>
          </div>
        ) : currentItems.length > 0 ? (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
              {currentItems.map((item, idx) => {
                const badge = getBadgeStyle(item.type);
                const isPolicyItem = item.type === 'นโยบายองค์กร';
                return (
                  <article
                    key={item.id}
                    onClick={() => setSelectedAnnouncement(item)}
                    className="animate-fade-up"
                    style={{
                      background: '#ffffff', borderRadius: 16,
                      border: '1px solid #e9ebee',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.04)',
                      display: 'flex', flexDirection: 'column',
                      cursor: 'pointer', overflow: 'hidden',
                      transition: 'all 0.2s ease',
                      animationDelay: `${idx * 40}ms`,
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-3px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08), 0 12px 32px rgba(0,0,0,0.06)';
                      e.currentTarget.style.borderColor = isPolicyItem ? '#93c5fd' : '#f8d998';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.04)';
                      e.currentTarget.style.borderColor = '#e9ebee';
                    }}
                  >
                    {/* Cover */}
                    <div style={{ aspectRatio: '16/9', position: 'relative', overflow: 'hidden', background: isPolicyItem ? '#f0f7ff' : '#f4f5f7' }}>
                      {item.cover_image ? (
                        <img
                          src={`${import.meta.env.VITE_API_BASE_URL}/uploads/announcements/${item.cover_image}`}
                          alt={item.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                        />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <div style={{
                            width: 56, height: 56, borderRadius: 16,
                            background: isPolicyItem ? '#eff6ff' : '#fff7ed',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            border: isPolicyItem ? '1px solid #dbeafe' : '1px solid #ffedd5'
                          }}>
                            {isPolicyItem ? (
                              <ShieldCheck size={30} style={{ color: '#2563eb' }} />
                            ) : (
                              <Megaphone size={26} style={{ color: '#f89919' }} />
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Badge */}
                      <div style={{
                        position: 'absolute', top: 12, left: 12,
                        display: 'flex', alignItems: 'center', gap: 5,
                        background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)',
                        border: `1px solid ${badge.border}`,
                        padding: '4px 10px', borderRadius: 9999,
                        fontSize: 11, fontWeight: 600, color: badge.text,
                      }}>
                        {badge.icon} {item.type}
                      </div>
                    </div>

                    {/* Content */}
                    <div style={{ padding: '18px 20px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#9ca3af', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
                        <Clock size={10} />
                        {new Date(item.created_at).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </div>
                      <h3 style={{
                        fontSize: 15, fontWeight: 650, color: '#111827', marginBottom: 8,
                        lineHeight: 1.4, letterSpacing: '-0.01em',
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                        transition: 'color 0.15s',
                      }}>
                        {item.title}
                      </h3>
                      <p style={{
                        fontSize: 13, color: '#6b7280', lineHeight: 1.65, flex: 1, marginBottom: 16,
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                      }}>
                        {item.content}
                      </p>
                      <div style={{
                        paddingTop: 14, borderTop: '1px solid #f0f2f5', display: 'flex', alignItems: 'center', gap: 5,
                        fontSize: 13, fontWeight: 600,
                        color: isPolicyItem ? '#2563eb' : '#f89919'
                      }}>
                        <span>{isPolicyItem ? 'อ่านระเบียบปฏิบัติ' : 'อ่านเพิ่มเติม'}</span>
                        <ArrowRight size={13} />
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ marginTop: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  style={{
                    padding: '8px 18px', borderRadius: 10, fontSize: 13, fontWeight: 500,
                    background: 'white', border: '1px solid #e9ebee', color: '#4b5563',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.4 : 1,
                    transition: 'all 0.15s',
                  }}
                >
                  ← ก่อนหน้า
                </button>
                <div style={{ display: 'flex', gap: 4 }}>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      style={{
                        width: 38, height: 38, borderRadius: 10, fontSize: 13, fontWeight: 600,
                        background: currentPage === page ? (viewMode === 'policies' ? '#2563eb' : '#f89919') : 'white',
                        color: currentPage === page ? 'white' : '#4b5563',
                        border: `1px solid ${currentPage === page ? (viewMode === 'policies' ? '#2563eb' : '#f89919') : '#e9ebee'}`,
                        cursor: 'pointer', transition: 'all 0.15s',
                        boxShadow: currentPage === page ? (viewMode === 'policies' ? '0 2px 8px rgba(37,99,235,0.3)' : '0 2px 8px rgba(248,153,25,0.3)') : 'none',
                      }}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: '8px 18px', borderRadius: 10, fontSize: 13, fontWeight: 500,
                    background: 'white', border: '1px solid #e9ebee', color: '#4b5563',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.4 : 1,
                    transition: 'all 0.15s',
                  }}
                >
                  ถัดไป →
                </button>
              </div>
            )}
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '90px 0' }}>
            <div style={{
              width: 72, height: 72, borderRadius: 20,
              background: viewMode === 'policies' ? '#eff6ff' : '#fff7ed',
              display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16
            }}>
              {viewMode === 'policies' ? (
                <ShieldCheck size={36} style={{ color: '#2563eb' }} />
              ) : (
                <Megaphone size={32} style={{ color: '#f89919' }} />
              )}
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1f2937', marginBottom: 6 }}>
              {searchTerm ? `ไม่พบผลลัพธ์สำหรับ "${searchTerm}"` : (viewMode === 'policies' ? 'ยังไม่มีเอกสารนโยบายในขณะนี้' : `ยังไม่มีข้อมูลในหมวดหมู่นี้`)}
            </h3>
            <p style={{ fontSize: 13, color: '#9ca3af' }}>
              {viewMode === 'policies' ? 'นโยบายและระเบียบปฏิบัติใหม่จะแสดงที่นี่เมื่อมีการเผยแพร่' : 'ประกาศและข่าวสารใหม่จะแสดงที่นี่เมื่อมีการอัปเดต'}
            </p>
          </div>
        )}
      </section>

      {/* ========== MODAL ========== */}
      {selectedAnnouncement && (() => {
        const badge = getBadgeStyle(selectedAnnouncement.type);
        const isPolicyModal = selectedAnnouncement.type === 'นโยบายองค์กร';
        return (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
            <div
              style={{ position: 'absolute', inset: 0, background: 'rgba(10,8,5,0.65)', backdropFilter: 'blur(6px)' }}
              onClick={() => setSelectedAnnouncement(null)}
            />
            <div className="animate-scale-in" style={{
              position: 'relative', background: 'white', borderRadius: 20,
              boxShadow: '0 32px 80px rgba(0,0,0,0.2)',
              width: '100%', maxWidth: 720, maxHeight: '90vh',
              display: 'flex', flexDirection: 'column', overflow: 'hidden',
              border: '1px solid #e9ebee',
            }}>
              {/* Cover */}
              <div style={{ position: 'relative', flexShrink: 0 }}>
                {selectedAnnouncement.cover_image ? (
                  <div style={{ width: '100%', height: 240 }}>
                    <img
                      src={`${import.meta.env.VITE_API_BASE_URL}/uploads/announcements/${selectedAnnouncement.cover_image}`}
                      alt={selectedAnnouncement.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.35), transparent)' }} />
                  </div>
                ) : (
                  <div style={{
                    width: '100%', height: 110,
                    background: isPolicyModal ? 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)' : '#1c1917',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {isPolicyModal ? (
                      <ShieldCheck size={48} style={{ color: 'rgba(255,255,255,0.4)' }} />
                    ) : (
                      <Megaphone size={40} style={{ color: 'rgba(255,255,255,0.2)' }} />
                    )}
                  </div>
                )}
                <button
                  onClick={() => setSelectedAnnouncement(null)}
                  style={{
                    position: 'absolute', top: 14, right: 14,
                    width: 34, height: 34, borderRadius: 9, border: '1px solid #e9ebee',
                    background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: '#374151', transition: 'all 0.15s',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#111827'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.95)'; }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Body */}
              <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                  <span style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    background: badge.bg, color: badge.text, border: `1px solid ${badge.border}`,
                    padding: '4px 12px', borderRadius: 9999, fontSize: 11, fontWeight: 600,
                  }}>
                    {badge.icon} {selectedAnnouncement.type}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#9ca3af' }}>
                    <Clock size={11} />
                    {new Date(selectedAnnouncement.created_at).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>
                <h2 style={{ fontSize: 22, fontWeight: 750, color: '#111827', lineHeight: 1.3, letterSpacing: '-0.03em', marginBottom: 20 }}>
                  {selectedAnnouncement.title}
                </h2>
                <div style={{ fontSize: 14, color: '#374151', lineHeight: 1.85, whiteSpace: 'pre-wrap' }}>
                  {selectedAnnouncement.content}
                </div>
              </div>

              {/* Footer */}
              <div style={{ flexShrink: 0, padding: '16px 32px', borderTop: '1px solid #f0f2f5', background: '#fafbfc', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setSelectedAnnouncement(null)}
                  style={{
                    padding: '9px 22px',
                    background: isPolicyModal ? '#2563eb' : '#f89919',
                    color: 'white',
                    border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600,
                    cursor: 'pointer', transition: 'all 0.15s',
                    boxShadow: isPolicyModal ? '0 2px 8px rgba(37,99,235,0.3)' : '0 2px 8px rgba(248,153,25,0.3)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = isPolicyModal ? '#1d4ed8' : '#e8860a'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = isPolicyModal ? '#2563eb' : '#f89919'; }}
                >
                  ปิดหน้าต่าง
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}