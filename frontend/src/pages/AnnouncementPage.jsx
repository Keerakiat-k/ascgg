import { useState, useEffect } from 'react';
import { Megaphone, Calendar, Info, Clock, LogIn, ArrowRight, Headset, X, Search, Bell, ShieldCheck, ChevronLeft, ChevronRight, Newspaper, LayoutGrid } from 'lucide-react';
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

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });

  const isShowingFeatured = viewMode === 'news' && !isLoading && searchTerm === '' && filter === 'ทั้งหมด';
  const featuredItems = newsAnnouncements.slice(1, 3);

  return (
    <div style={{ minHeight: '100vh', fontFamily: "'Inter', 'Prompt', system-ui, sans-serif", background: '#f0f2f5' }}>

      {/* ====== NAVBAR ====== */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
        boxShadow: '0 1px 0 rgba(0,0,0,0.04)',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', height: 60, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => handleSwitchMode('news')}>
            <img src={logo} alt="ASCG" style={{ height: 32, width: 'auto', objectFit: 'contain' }} />
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', lineHeight: 1.2 }}>ASCG Group</div>
              <div style={{ fontSize: 10.5, color: '#9ca3af', fontWeight: 500 }}>HR & IT System</div>
            </div>
          </div>

          {/* Mode Toggle */}
          <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: 12, padding: 3, gap: 2 }}>
            {[
              { key: 'news', label: 'ข่าวสาร', icon: <Newspaper size={13} /> },
              { key: 'policies', label: 'นโยบาย', icon: <ShieldCheck size={13} /> },
            ].map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => handleSwitchMode(key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 14px', borderRadius: 9, fontSize: 13, fontWeight: viewMode === key ? 600 : 500,
                  background: viewMode === key ? '#ffffff' : 'transparent',
                  color: viewMode === key ? (key === 'policies' ? '#1d4ed8' : '#ea7c0a') : '#64748b',
                  border: 'none', cursor: 'pointer',
                  boxShadow: viewMode === key ? '0 1px 4px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.04)' : 'none',
                  transition: 'all 0.15s',
                }}
              >
                {icon} {label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              onClick={() => navigate('/report-it')}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 14px', borderRadius: 9, fontSize: 13, fontWeight: 500,
                border: '1px solid #e5e7eb', background: 'white', color: '#374151',
                cursor: 'pointer', transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#f89919'; e.currentTarget.style.color = '#c2690a'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#374151'; }}
            >
              <Headset size={14} style={{ color: '#f89919' }} />
              <span className="hidden sm:inline">แจ้งปัญหา IT</span>
            </button>
            <button
              onClick={() => navigate('/login')}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 16px', borderRadius: 9, fontSize: 13, fontWeight: 600,
                background: 'linear-gradient(135deg, #f89919 0%, #e8860a 100%)',
                color: 'white', border: 'none', cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(248,153,25,0.35)', transition: 'all 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <LogIn size={14} />
              <span className="hidden sm:inline">เข้าสู่ระบบ</span>
            </button>
          </div>
        </div>
      </nav>

      {/* ====== HERO ====== */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: '56px 24px 64px' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${heroBg})`, backgroundSize: 'cover', backgroundPosition: 'center 40%' }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: viewMode === 'policies'
            ? 'linear-gradient(150deg, rgba(7,15,35,0.94) 0%, rgba(17,38,76,0.82) 55%, rgba(30,80,220,0.4) 100%)'
            : 'linear-gradient(150deg, rgba(8,6,3,0.92) 0%, rgba(30,16,5,0.78) 55%, rgba(240,140,10,0.38) 100%)',
        }} />
        <div style={{
          position: 'absolute', width: 500, height: 500, borderRadius: '50%',
          background: viewMode === 'policies' ? 'rgba(37,99,235,0.12)' : 'rgba(248,153,25,0.12)',
          filter: 'blur(90px)', top: -150, right: -80, pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', zIndex: 10, maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 9999, padding: '5px 14px', marginBottom: 18,
            fontSize: 11.5, fontWeight: 600, color: 'rgba(255,255,255,0.8)',
            backdropFilter: 'blur(10px)', letterSpacing: '0.06em', textTransform: 'uppercase',
          }}>
            {viewMode === 'policies'
              ? <><ShieldCheck size={12} style={{ color: '#60a5fa' }} /> นโยบายและระเบียบปฏิบัติ</>
              : <><Bell size={12} style={{ color: '#fbbf24' }} /> ข่าวสารและกิจกรรมองค์กร</>
            }
          </div>

          <h1 style={{
            fontSize: 'clamp(26px, 5vw, 44px)', fontWeight: 800,
            color: '#ffffff', letterSpacing: '-0.04em', lineHeight: 1.15,
            margin: '0 0 12px',
          }}>
            {viewMode === 'policies' ? (
              <>นโยบายและระเบียบ<br /><span style={{ color: '#60a5fa' }}>ของ ASCG Group</span></>
            ) : (
              <>ติดตามทุกความเคลื่อนไหว<br />
                <span style={{ background: 'linear-gradient(90deg, #fbbf24, #f89919)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  ของ ASCG Group
                </span>
              </>
            )}
          </h1>

          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.75, maxWidth: 520, margin: '0 auto 26px' }}>
            {viewMode === 'policies'
              ? 'คู่มือ กฎระเบียบ และมาตรฐานความปลอดภัยสำหรับบุคลากรทุกคน'
              : 'ประกาศสำคัญ ข่าวกิจกรรม และความเคลื่อนไหวต่างๆ ภายในองค์กร'}
          </p>

          <div style={{ position: 'relative', maxWidth: 440, margin: '0 auto' }}>
            <Search size={15} style={{ position: 'absolute', left: 15, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)', pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder={viewMode === 'policies' ? 'ค้นหานโยบาย...' : 'ค้นหาข่าวสาร, ประกาศ...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%', paddingLeft: 44, paddingRight: 16, paddingTop: 11, paddingBottom: 11,
                borderRadius: 12, fontSize: 13.5, outline: 'none',
                background: 'rgba(255,255,255,0.09)', backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.16)', color: '#ffffff',
                boxSizing: 'border-box', transition: 'all 0.2s',
              }}
              onFocus={e => { e.target.style.background = 'rgba(255,255,255,0.14)'; e.target.style.borderColor = viewMode === 'policies' ? 'rgba(96,165,250,0.55)' : 'rgba(251,191,36,0.55)'; }}
              onBlur={e => { e.target.style.background = 'rgba(255,255,255,0.09)'; e.target.style.borderColor = 'rgba(255,255,255,0.16)'; }}
            />
          </div>
        </div>
      </section>

      {/* ====== FEATURED SECTION - ข่าวหลัก + ข่าวรอง ====== */}
      {isShowingFeatured && latestNewsItem && (
        <section style={{ maxWidth: 1200, margin: '-28px auto 0', padding: '0 20px', position: 'relative', zIndex: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: 16, alignItems: 'stretch' }}>

            {/* Main Featured */}
            <div
              onClick={() => setSelectedAnnouncement(latestNewsItem)}
              style={{
                borderRadius: 20, overflow: 'hidden', cursor: 'pointer',
                background: '#111827', position: 'relative', minHeight: 340,
                boxShadow: '0 16px 48px rgba(0,0,0,0.22)', transition: 'transform 0.25s, box-shadow 0.25s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 24px 60px rgba(0,0,0,0.28)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,0,0,0.22)'; }}
            >
              {latestNewsItem.cover_image ? (
                <img
                  src={`${import.meta.env.VITE_API_BASE_URL}/uploads/announcements/${latestNewsItem.cover_image}`}
                  alt={latestNewsItem.title}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.48 }}
                />
              ) : (
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #1c1917 0%, #292524 100%)' }} />
              )}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.45) 50%, rgba(0,0,0,0.08) 100%)' }} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '30px 30px 30px' }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#f89919', color: 'white', padding: '3px 10px', borderRadius: 999, fontSize: 10.5, fontWeight: 700 }}>
                    <Bell size={9} /> ล่าสุด
                  </span>
                  {(() => {
                    const s = getBadgeStyle(latestNewsItem.type);
                    return (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', color: 'rgba(255,255,255,0.88)', border: '1px solid rgba(255,255,255,0.18)', padding: '3px 10px', borderRadius: 999, fontSize: 10.5, fontWeight: 600 }}>
                        {s.icon} {latestNewsItem.type}
                      </span>
                    );
                  })()}
                </div>
                <h2 style={{ fontSize: 'clamp(16px, 2.5vw, 22px)', fontWeight: 700, color: '#fff', lineHeight: 1.3, marginBottom: 10, letterSpacing: '-0.02em' }}>
                  {latestNewsItem.title}
                </h2>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.52)', lineHeight: 1.65, marginBottom: 18, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {latestNewsItem.content}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11.5, color: 'rgba(255,255,255,0.38)' }}>
                    <Clock size={11} /> {formatDate(latestNewsItem.created_at)}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, fontWeight: 600, color: '#fbbf24' }}>
                    อ่านต่อ <ArrowRight size={13} />
                  </span>
                </div>
              </div>
            </div>

            {/* Side cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {featuredItems.map((item) => {
                const badge = getBadgeStyle(item.type);
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedAnnouncement(item)}
                    style={{
                      borderRadius: 16, overflow: 'hidden', cursor: 'pointer', flex: 1,
                      background: 'white', border: '1px solid rgba(0,0,0,0.06)',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.07)',
                      display: 'flex', flexDirection: 'column', minHeight: 150,
                      transition: 'transform 0.2s, box-shadow 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.11)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.07)'; }}
                  >
                    {item.cover_image && (
                      <div style={{ height: 80, overflow: 'hidden', flexShrink: 0 }}>
                        <img src={`${import.meta.env.VITE_API_BASE_URL}/uploads/announcements/${item.cover_image}`} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    )}
                    <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: badge.bg, color: badge.text, border: `1px solid ${badge.border}`, padding: '2px 8px', borderRadius: 999, fontSize: 10, fontWeight: 600 }}>
                          {badge.icon} {item.type}
                        </span>
                        <span style={{ fontSize: 10.5, color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Clock size={9} /> {formatDate(item.created_at)}
                        </span>
                      </div>
                      <h3 style={{ fontSize: 13.5, fontWeight: 650, color: '#111827', lineHeight: 1.4, flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {item.title}
                      </h3>
                      <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: '#f89919' }}>
                        อ่านต่อ <ArrowRight size={11} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ====== CONTENT AREA ====== */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 20px 80px' }}>

        {/* Filter / Policy Header */}
        {viewMode === 'news' ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {newsCategories.map((type) => {
                const active = filter === type;
                return (
                  <button
                    key={type}
                    onClick={() => setFilter(type)}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '7px 18px', borderRadius: 999, fontSize: 13, fontWeight: active ? 600 : 500,
                      border: `1.5px solid ${active ? '#f89919' : '#e5e7eb'}`,
                      background: active ? '#f89919' : '#ffffff',
                      color: active ? '#ffffff' : '#6b7280',
                      cursor: 'pointer', transition: 'all 0.15s',
                      boxShadow: active ? '0 3px 12px rgba(248,153,25,0.3)' : '0 1px 3px rgba(0,0,0,0.05)',
                    }}
                    onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = '#f89919'; e.currentTarget.style.color = '#c2690a'; } }}
                    onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#6b7280'; } }}
                  >
                    {type === 'ประกาศสำคัญ' && <Megaphone size={12} style={{ color: active ? 'white' : '#dc2626' }} />}
                    {type === 'กิจกรรม' && <Calendar size={12} style={{ color: active ? 'white' : '#f89919' }} />}
                    {type === 'ทั้งหมด' && <LayoutGrid size={12} style={{ color: active ? 'white' : '#6b7280' }} />}
                    {type}
                    {active && filteredData.length > 0 && (
                      <span style={{ marginLeft: 2, background: 'rgba(255,255,255,0.28)', padding: '0 5px', borderRadius: 999, fontSize: 11, fontWeight: 700 }}>
                        {filteredData.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <span style={{ fontSize: 12.5, color: '#9ca3af', fontWeight: 500 }}>
              {filteredData.length > 0 ? `${filteredData.length} รายการ` : ''}
            </span>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid #e5e7eb', paddingBottom: 16, marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg, #1e3a8a, #2563eb)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(37,99,235,0.3)' }}>
                <ShieldCheck size={20} style={{ color: 'white' }} />
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: 0 }}>ทะเบียนนโยบายและระเบียบปฏิบัติองค์กร</h3>
                <p style={{ fontSize: 12, color: '#64748b', margin: '2px 0 0' }}>เอกสารมาตรฐานสำหรับบุคลากรในเครือ ASCG Group</p>
              </div>
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#2563eb', background: '#eff6ff', padding: '4px 12px', borderRadius: 999, border: '1px solid #bfdbfe' }}>
              {filteredData.length} นโยบาย
            </span>
          </div>
        )}

        {/* Cards */}
        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', border: '3px solid #e5e7eb', borderTopColor: viewMode === 'policies' ? '#2563eb' : '#f89919', animation: 'spin 0.8s linear infinite' }} />
            <p style={{ fontSize: 13, color: '#9ca3af', fontWeight: 500 }}>กำลังโหลดข้อมูล...</p>
          </div>
        ) : currentItems.length > 0 ? (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
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
                      border: '1px solid rgba(0,0,0,0.06)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                      display: 'flex', flexDirection: 'column',
                      cursor: 'pointer', overflow: 'hidden',
                      transition: 'all 0.22s ease',
                      animationDelay: `${idx * 35}ms`,
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 12px 36px rgba(0,0,0,0.1)';
                      e.currentTarget.style.borderColor = isPolicyItem ? '#bfdbfe' : '#fed7aa';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
                      e.currentTarget.style.borderColor = 'rgba(0,0,0,0.06)';
                    }}
                  >
                    {/* Cover */}
                    <div style={{ aspectRatio: '16/9', position: 'relative', overflow: 'hidden', background: isPolicyItem ? '#f0f7ff' : '#fafaf8', flexShrink: 0 }}>
                      {item.cover_image ? (
                        <img
                          src={`${import.meta.env.VITE_API_BASE_URL}/uploads/announcements/${item.cover_image}`}
                          alt={item.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                        />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <div style={{
                            width: 54, height: 54, borderRadius: 15,
                            background: isPolicyItem ? 'linear-gradient(135deg, #dbeafe, #eff6ff)' : 'linear-gradient(135deg, #ffedd5, #fff7ed)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            border: isPolicyItem ? '1px solid #bfdbfe' : '1px solid #fed7aa',
                            boxShadow: isPolicyItem ? '0 4px 12px rgba(37,99,235,0.12)' : '0 4px 12px rgba(248,153,25,0.12)',
                          }}>
                            {isPolicyItem ? <ShieldCheck size={28} style={{ color: '#2563eb' }} /> : <Megaphone size={24} style={{ color: '#f89919' }} />}
                          </div>
                        </div>
                      )}
                      <div style={{
                        position: 'absolute', top: 10, left: 10,
                        display: 'flex', alignItems: 'center', gap: 5,
                        background: 'rgba(255,255,255,0.94)', backdropFilter: 'blur(8px)',
                        border: `1px solid ${badge.border}`,
                        padding: '3px 9px', borderRadius: 999,
                        fontSize: 10.5, fontWeight: 600, color: badge.text,
                        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                      }}>
                        {badge.icon} {item.type}
                      </div>
                    </div>

                    {/* Content */}
                    <div style={{ padding: '16px 18px 18px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10.5, color: '#94a3b8', fontWeight: 500, marginBottom: 8 }}>
                        <Clock size={10} /> {formatDate(item.created_at)}
                      </div>
                      <h3 style={{
                        fontSize: 14.5, fontWeight: 650, color: '#111827', marginBottom: 7,
                        lineHeight: 1.45, letterSpacing: '-0.01em',
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                      }}>
                        {item.title}
                      </h3>
                      <p style={{
                        fontSize: 12.5, color: '#64748b', lineHeight: 1.65, flex: 1, marginBottom: 14,
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                      }}>
                        {item.content}
                      </p>
                      <div style={{
                        paddingTop: 12, borderTop: '1px solid #f1f5f9',
                        display: 'flex', alignItems: 'center', gap: 5,
                        fontSize: 12.5, fontWeight: 600,
                        color: isPolicyItem ? '#2563eb' : '#f89919',
                      }}>
                        {isPolicyItem ? 'อ่านระเบียบปฏิบัติ' : 'อ่านเพิ่มเติม'} <ArrowRight size={12} />
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ marginTop: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 500,
                    background: 'white', border: '1px solid #e5e7eb', color: '#374151',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.35 : 1,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  }}
                >
                  <ChevronLeft size={14} /> ก่อนหน้า
                </button>
                <div style={{ display: 'flex', gap: 4 }}>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      style={{
                        width: 36, height: 36, borderRadius: 10, fontSize: 13, fontWeight: 600,
                        background: currentPage === page ? (viewMode === 'policies' ? '#2563eb' : '#f89919') : 'white',
                        color: currentPage === page ? 'white' : '#374151',
                        border: `1px solid ${currentPage === page ? (viewMode === 'policies' ? '#2563eb' : '#f89919') : '#e5e7eb'}`,
                        cursor: 'pointer', transition: 'all 0.15s',
                        boxShadow: currentPage === page ? (viewMode === 'policies' ? '0 2px 10px rgba(37,99,235,0.35)' : '0 2px 10px rgba(248,153,25,0.35)') : '0 1px 3px rgba(0,0,0,0.04)',
                      }}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 500,
                    background: 'white', border: '1px solid #e5e7eb', color: '#374151',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.35 : 1,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  }}
                >
                  ถัดไป <ChevronRight size={14} />
                </button>
              </div>
            )}
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
            <div style={{
              width: 76, height: 76, borderRadius: 22,
              background: viewMode === 'policies' ? 'linear-gradient(135deg, #dbeafe, #eff6ff)' : 'linear-gradient(135deg, #ffedd5, #fff7ed)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18,
              boxShadow: viewMode === 'policies' ? '0 8px 24px rgba(37,99,235,0.15)' : '0 8px 24px rgba(248,153,25,0.15)',
            }}>
              {viewMode === 'policies' ? <ShieldCheck size={38} style={{ color: '#2563eb' }} /> : <Megaphone size={34} style={{ color: '#f89919' }} />}
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1f2937', marginBottom: 6 }}>
              {searchTerm ? `ไม่พบผลลัพธ์สำหรับ "${searchTerm}"` : (viewMode === 'policies' ? 'ยังไม่มีเอกสารนโยบาย' : 'ยังไม่มีข้อมูลในหมวดหมู่นี้')}
            </h3>
            <p style={{ fontSize: 13, color: '#9ca3af' }}>
              {viewMode === 'policies' ? 'นโยบายใหม่จะแสดงที่นี่เมื่อมีการเผยแพร่' : 'ประกาศใหม่จะแสดงที่นี่เมื่อมีการอัปเดต'}
            </p>
          </div>
        )}
      </section>

      {/* ====== MODAL ====== */}
      {selectedAnnouncement && (() => {
        const badge = getBadgeStyle(selectedAnnouncement.type);
        const isPolicyModal = selectedAnnouncement.type === 'นโยบายองค์กร';
        return (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
            <div
              style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.62)', backdropFilter: 'blur(8px)' }}
              onClick={() => setSelectedAnnouncement(null)}
            />
            <div className="animate-scale-in" style={{
              position: 'relative', background: 'white', borderRadius: 22,
              boxShadow: '0 40px 100px rgba(0,0,0,0.25)',
              width: '100%', maxWidth: 700, maxHeight: '90vh',
              display: 'flex', flexDirection: 'column', overflow: 'hidden',
              border: '1px solid rgba(0,0,0,0.06)',
            }}>
              {/* Cover */}
              <div style={{ position: 'relative', flexShrink: 0 }}>
                {selectedAnnouncement.cover_image ? (
                  <div style={{ width: '100%', height: 230 }}>
                    <img
                      src={`${import.meta.env.VITE_API_BASE_URL}/uploads/announcements/${selectedAnnouncement.cover_image}`}
                      alt={selectedAnnouncement.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.4), transparent 60%)' }} />
                  </div>
                ) : (
                  <div style={{
                    width: '100%', height: 100,
                    background: isPolicyModal
                      ? 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)'
                      : 'linear-gradient(135deg, #1c1917 0%, #292524 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {isPolicyModal
                      ? <ShieldCheck size={44} style={{ color: 'rgba(255,255,255,0.28)' }} />
                      : <Megaphone size={38} style={{ color: 'rgba(255,255,255,0.18)' }} />
                    }
                  </div>
                )}
                <button
                  onClick={() => setSelectedAnnouncement(null)}
                  style={{
                    position: 'absolute', top: 14, right: 14,
                    width: 36, height: 36, borderRadius: 10,
                    border: '1px solid rgba(255,255,255,0.3)',
                    background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(10px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: '#374151',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.12)', transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.transform = 'scale(1.08)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.92)'; e.currentTarget.style.transform = 'scale(1)'; }}
                >
                  <X size={15} />
                </button>
              </div>

              {/* Body */}
              <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '26px 30px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    background: badge.bg, color: badge.text, border: `1px solid ${badge.border}`,
                    padding: '4px 11px', borderRadius: 999, fontSize: 11, fontWeight: 600,
                  }}>
                    {badge.icon} {selectedAnnouncement.type}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#94a3b8' }}>
                    <Clock size={11} /> {formatDate(selectedAnnouncement.created_at)}
                  </span>
                </div>
                <h2 style={{ fontSize: 'clamp(18px, 3vw, 22px)', fontWeight: 750, color: '#0f172a', lineHeight: 1.3, letterSpacing: '-0.03em', marginBottom: 20 }}>
                  {selectedAnnouncement.title}
                </h2>
                <div style={{ fontSize: 14, color: '#374151', lineHeight: 1.9, whiteSpace: 'pre-wrap' }}>
                  {selectedAnnouncement.content}
                </div>
              </div>

              {/* Footer */}
              <div style={{ flexShrink: 0, padding: '14px 30px', borderTop: '1px solid #f1f5f9', background: '#fafbfc', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setSelectedAnnouncement(null)}
                  style={{
                    padding: '9px 22px',
                    background: isPolicyModal
                      ? 'linear-gradient(135deg, #1d4ed8, #2563eb)'
                      : 'linear-gradient(135deg, #e8860a, #f89919)',
                    color: 'white', border: 'none', borderRadius: 10,
                    fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    boxShadow: isPolicyModal ? '0 3px 12px rgba(37,99,235,0.35)' : '0 3px 12px rgba(248,153,25,0.35)',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
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
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 999px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </div>
  );
}
