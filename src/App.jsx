import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar as CalendarIcon, User, Clock, CheckCircle, ChevronLeft, 
  Lock, Trash2, Plus, Phone, Search, Users, Settings, LogOut, ChevronRight,
  UserCheck, Scissors, Heart, Calendar, Facebook, MapPin
} from 'lucide-react';
import './index.css';

// --- CONSTANTS ---
const BARBERS = [
    { id: 'avi', name: 'אבי', image: '/barber-avi.png' },
    { id: 'chen', name: 'חן', image: '/barber-chen.png' }
];

const SERVICES = [
    { id: 'm1', name: 'תספורת גבר', duration: 15 },
    { id: 'm2', name: 'תספורת גבר + זקן', duration: 30 },
    { id: 'f1', name: 'תספורת אישה - רגיל', duration: 30 },
    { id: 'f2', name: 'תספורת אישה + פן', duration: 45 },
    { id: 'f3', name: 'פן בלבד', duration: 15 },
    { id: 'f4', name: 'תספורת אישה + גוונים', duration: 180 },
    { id: 'f5', name: 'תספורת אישה + צבע שורש', duration: 90 }
];

const STRINGS = {
    male: {
        welcome: "ברוך הבא",
        bookTitle: "קבע תור",
        myApps: "התורים שלי",
        profile: "אזור אישי",
        selectBarber: "בחר ספר",
        selectService: "בחר סוג תספורת",
        selectDate: "בחר תאריך",
        selectTime: "בחר שעה",
        success: "התור נקבע בהצלחה",
        phoneError: "מספר טלפון לא תקין",
        emptyFields: "נא למלא את כל השדות",
        logout: "התנתק"
    },
    female: {
        welcome: "ברוכה הבאה",
        bookTitle: "קבעי תור",
        myApps: "התורים שלי",
        profile: "אזור אישי",
        selectBarber: "בחרי ספר",
        selectService: "בחרי סוג תספורת",
        selectDate: "בחרי תאריך",
        selectTime: "בחרי שעה",
        success: "התור נקבע בהצלחה",
        phoneError: "מספר טלפון לא תקין",
        emptyFields: "נא למלא את כל השדות",
        logout: "התנתקי"
    }
};

// --- HELPERS ---
const isValidPhone = (p) => /^\d{10}$/.test(p);

const getClosedDays = (month, year) => {
    const closedDays = [];
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        if (date.getDay() === 6) { // 6 = Saturday
            closedDays.push(day);
        }
    }
    
    return closedDays;
};

const getNextOpenDay = () => {
    let date = new Date();
    const month = date.getMonth();
    const year = date.getFullYear();
    const closedDays = getClosedDays(month, year);
    
    while (closedDays.includes(date.getDate())) {
        date.setDate(date.getDate() + 1);
        if (date.getMonth() !== month) {
            // If we've moved to the next month, recalculate closed days
            const newMonth = date.getMonth();
            const newYear = date.getFullYear();
            closedDays.length = 0;
            closedDays.push(...getClosedDays(newMonth, newYear));
        }
    }
    
    return date;
};

const getStartHour = (date) => {
  const hours = date.getHours();
  const minutes = date.getMinutes();

  // Convert current time to decimal hours
  const current = hours + minutes / 60;

  // Round up to the next 15-minute interval
  const nextQuarter = Math.ceil(current * 4) / 4;

  // Clamp to allowed range
  const MIN = 8.5; // 08:30
  const MAX = 19;  // 19:00

  return Math.min(Math.max(nextQuarter, MIN), MAX);
};

const generateSlots = (date, serviceDuration = 30) => {
    const slots = [];
    let start = getStartHour(date);
    let end = 19.5;
    const duration = serviceDuration / 60;
    const increment = 0.25; // 15 minutes

    for (let t = start; t < end; t += increment) {
        // Check if there's enough time to complete the service from this start time
        if (t + duration <= end) {
            const h = Math.floor(t);
            const m = Math.round((t % 1) * 60);
            const slotStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
            if (!slots.includes(slotStr)) slots.push(slotStr);
        }
    }

    return slots;
};


// --- COMPONENTS ---

const HeaderLogo = ({ size = 'small' }) => (
    <div className={`header-logo-container ${size}`}>
        <img src="/logo.png" className={`header-logo-image ${size}`} alt="Avi Shusha" />
    </div>
);

const StatusBar = () => (
    <div className="status-bar">
        <span>12:45</span>
        <div style={{ display: 'flex', gap: '8px' }}>
            <span>📶</span>
            <span>🔋</span>
        </div>
    </div>
);

const ExternalLinks = () => (
    <div className="external-links-bar">
        <a href="https://waze.com/ul?q=דבורה הנביאה 122, תל אביב-יפו" target="_blank" rel="noreferrer" className="social-icon-btn">
            <img src="https://upload.wikimedia.org/wikipedia/commons/6/67/Waze_icon.png" alt="Waze" />
        </a>
        <a href="https://www.facebook.com/profile.php?id=100057563375603" target="_blank" rel="noreferrer" className="social-icon-btn">
            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b8/2021_Facebook_icon.svg" alt="Facebook" />
        </a>
    </div>
);

// --- SCREENS ---

const WelcomeScreen = ({ onStart }) => (
    <div className="screen-container" style={{ padding: 0 }}>
        <HeaderLogo size="big" />
        <div style={{ padding: '40px 24px', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h1 style={{ fontSize: '32px', color: 'var(--primary)', marginBottom: '8px' }}>ברוכים הבאים</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '18px', marginBottom: '40px' }}>אבי שושה - עיצוב שיער</p>
            
            <ExternalLinks />
            
            <button className="pill-button" onClick={onStart}>
                לחצו להתחברות או הרשמה
            </button>
        </div>
    </div>
);

const RegisterScreen = ({ onRegister }) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [gender, setGender] = useState('male'); // male or female
    const [errors, setErrors] = useState({});

    const handleSubmit = () => {
        const newErrors = {};
        if (!name) newErrors.name = true;
        if (!isValidPhone(phone)) newErrors.phone = true;
        
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        onRegister({ name, phone, gender, regDate: new Date().toLocaleDateString('he-IL') });
    };

    return (
        <div className="screen-container" style={{ padding: 0 }}>
            <HeaderLogo size="small" />
            <div style={{ padding: '24px' }}>
                <h2 className="section-title">הרשמה למערכת</h2>
                
                <div className="gender-toggle">
                    <div className={`gender-option ${gender === 'male' ? 'active male' : ''}`} onClick={() => setGender('male')}>
                        זכר
                    </div>
                    <div className={`gender-option ${gender === 'female' ? 'active female' : ''}`} onClick={() => setGender('female')}>
                        נקבה
                    </div>
                </div>

                <input 
                    className={`input-field ${errors.name ? 'error' : ''}`} 
                    placeholder="שם מלא" 
                    value={name}
                    onChange={(e) => { setName(e.target.value); setErrors({...errors, name: false}); }}
                />

                <input 
                    className={`input-field ${errors.phone ? 'error' : ''}`} 
                    placeholder="מספר טלפון" 
                    type="tel"
                    value={phone}
                    onChange={(e) => { setPhone(e.target.value); setErrors({...errors, phone: false}); }}
                />
                {errors.phone && <p className="error-text">מספר טלפון לא תקין</p>}

                <button className="pill-button" onClick={handleSubmit} style={{ marginTop: '20px' }}>
                    סיום והרשמה
                </button>
            </div>
        </div>
    );
};

const BookingFlow = ({ user, blockedSlots, onBook }) => {
    const [bookingData, setBookingData] = useState({
        barber: null,
        service: null,
        date: getNextOpenDay(),
        time: null
    });

    const [confirmed, setConfirmed] = useState(false);
    const [displayMonth, setDisplayMonth] = useState(new Date().getMonth());
    const [displayYear, setDisplayYear] = useState(new Date().getFullYear());
    const scrollRef = useRef(null);

    const s = STRINGS[user.gender];

    const handleConfirm = () => {
        onBook(bookingData);
        setConfirmed(true);
        setTimeout(() => {
            setConfirmed(false);
            setBookingData({ ...bookingData, time: null, service: null, barber: null });
        }, 3000);
    };

    const getSlots = () => {
        return generateSlots(bookingData.date, bookingData.service?.duration || 30);
    };

    return (
        <div className="screen-container" style={{ padding: 0 }}>
            <HeaderLogo size="small" />
            <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }} ref={scrollRef}>
                
                {/* Calendar - Date Selection */}
                <h3 className="section-title">{s.selectDate}</h3>
                <div className="mini-calendar">
                    <div className="calendar-header">
                        {(() => {
                            const today = new Date();
                            const currentMonth = today.getMonth();
                            const currentYear = today.getFullYear();
                            const canGoBack = displayYear > currentYear || (displayYear === currentYear && displayMonth > currentMonth);
                            
                            return (
                                <>
                                    <button 
                                        onClick={() => {
                                            if (displayMonth === 0) {
                                                setDisplayMonth(11);
                                                setDisplayYear(displayYear - 1);
                                            } else {
                                                setDisplayMonth(displayMonth - 1);
                                            }
                                        }} 
                                        disabled={!canGoBack}
                                        style={{ background: 'none', border: 'none', cursor: canGoBack ? 'pointer' : 'not-allowed', fontSize: '20px', padding: '0', opacity: canGoBack ? 1 : 0.3 }}>‹</button>
                                    <span style={{ fontWeight: 'bold' }}>{new Date(displayYear, displayMonth).toLocaleDateString('he-IL', { month: 'long', year: 'numeric' })}</span>
                                    <button 
                                        onClick={() => {
                                            if (displayMonth === 11) {
                                                setDisplayMonth(0);
                                                setDisplayYear(displayYear + 1);
                                            } else {
                                                setDisplayMonth(displayMonth + 1);
                                            }
                                        }} 
                                        disabled={displayYear > currentYear || (displayYear === currentYear && displayMonth >= currentMonth + 1)}
                                        style={{ background: 'none', border: 'none', cursor: displayYear > currentYear || (displayYear === currentYear && displayMonth >= currentMonth + 1) ? 'not-allowed' : 'pointer', fontSize: '20px', padding: '0', opacity: displayYear > currentYear || (displayYear === currentYear && displayMonth >= currentMonth + 1) ? 0.3 : 1 }}>›</button>
                                </>
                            );
                        })()}
                    </div>
                    <div className="calendar-grid">
                        {['א','ב','ג','ד','ה','ו','ש'].map(d => <div key={d} className="day-header">{d}</div>)}
                        {(() => {
                            const firstDay = new Date(displayYear, displayMonth, 1).getDay();
                            const daysInMonth = new Date(displayYear, displayMonth + 1, 0).getDate();
                            const daysInPrevMonth = new Date(displayYear, displayMonth, 0).getDate();
                            const closedDays = getClosedDays(displayMonth, displayYear);
                            const today = new Date();
                            const cells = [];
                            
                            // Days from previous month
                            for (let i = firstDay - 1; i >= 0; i--) {
                                const day = daysInPrevMonth - i;
                                cells.push(
                                    <div 
                                        key={`prev-${day}`} 
                                        className="day-cell dimmed"
                                        style={{ opacity: 0.4 }}
                                    >
                                        {day}
                                    </div>
                                );
                            }
                            
                            // Days of the current month
                            for (let day = 1; day <= daysInMonth; day++) {
                                const isClosed = closedDays.includes(day);
                                const isPast = displayYear < today.getFullYear() || 
                                              (displayYear === today.getFullYear() && displayMonth < today.getMonth()) ||
                                              (displayYear === today.getFullYear() && displayMonth === today.getMonth() && day < today.getDate());
                                const isSelected = bookingData.date.getDate() === day && 
                                                   bookingData.date.getMonth() === displayMonth && 
                                                   bookingData.date.getFullYear() === displayYear;
                                const isToday = day === today.getDate() && 
                                                displayMonth === today.getMonth() && 
                                                displayYear === today.getFullYear();
                                cells.push(
                                    <div 
                                        key={day} 
                                        className={`day-cell ${isClosed || isPast ? 'dimmed' : ''} ${isSelected ? 'active' : ''} ${isToday && !isSelected ? 'today' : ''}`}
                                        onClick={() => {
                                            if (isClosed || isPast) return;

                                            const newDate = isToday
                                                ? new Date() // current date & time
                                                : new Date(displayYear, displayMonth, day);

                                            setBookingData({
                                                ...bookingData,
                                                date: newDate,
                                                time: null,
                                            });
                                        }}
                                    >
                                        {day}
                                    </div>
                                );
                            }
                            
                            return cells;
                        })()}
                    </div>
                </div>

                {/* 2. Service */}
                <h3 className="section-title">{s.selectService}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '30px' }}>
                    {SERVICES.map(sv => (
                        <div key={sv.id} className={`selection-item ${bookingData.service?.id === sv.id ? 'active' : ''}`} onClick={() => setBookingData({...bookingData, service: sv, time: null})} style={{ textAlign: 'right', display: 'flex', justifyContent: 'space-between' }}>
                            <span>{sv.name}</span>
                            <span style={{ color: 'var(--text-muted)' }}>{sv.duration} דק'</span>
                        </div>
                    ))}
                </div>

                {/* 3. Barber */}
                <h3 className="section-title">{s.selectBarber}</h3>
                <div className="selection-grid" style={{ marginBottom: '30px' }}>
                    {BARBERS.map(b => (
                        <div key={b.id} className={`selection-item ${bookingData.barber?.id === b.id ? 'active' : ''}`} onClick={() => setBookingData({...bookingData, barber: b, time: null})}>
                            <div style={{ width: '60px', height: '60px', background: '#DDD', borderRadius: '30px', margin: '0 auto 10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <User size={30} />
                            </div>
                            <p style={{ fontWeight: 600 }}>{b.name}</p>
                        </div>
                    ))}
                </div>

                {/* 4. Time */}
                {bookingData.service && bookingData.barber && (
                    <>
                        <h3 className="section-title">{s.selectTime}</h3>
                        <div className="selection-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '30px' }}>
                            {getSlots().map(t => (
                                <div key={t} className={`selection-item ${bookingData.time === t ? 'active' : ''}`} onClick={() => setBookingData({...bookingData, time: t})} style={{ padding: '10px 5px', fontSize: '13px' }}>
                                    {t}
                                </div>
                            ))}
                        </div>
                        <button className="pill-button" disabled={!bookingData.time} onClick={handleConfirm} style={{ marginBottom: '100px' }}>אישור התור</button>
                    </>
                )}
            </div>

            <AnimatePresence>
                {confirmed && (
                    <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ position: 'absolute', top: '50%', left: '10%', right: '10%', background: '#fff', padding: '30px', borderRadius: '30px', textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.2)', zIndex: 100 }}>
                        <CheckCircle size={60} color="#27AE60" style={{ margin: '0 auto 20px' }} />
                        <h2 style={{ color: 'var(--primary)', marginBottom: '10px' }}>{s.success}!</h2>
                        <p style={{ color: 'var(--text-muted)' }}>הודעת SMS נשלחה לנייד שלך</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const ManagerView = ({ users, appointments, blockedSlots, toggleBlock }) => {
    const [tab, setTab] = useState('schedule');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [search, setSearch] = useState('');
    const [displayMonth, setDisplayMonth] = useState(new Date().getMonth());
    const [displayYear, setDisplayYear] = useState(new Date().getFullYear());

    const filteredUsers = users.filter(u => u.name.includes(search) || u.phone.includes(search));

    return (
        <div className="screen-container" style={{ padding: 0 }}>
            <HeaderLogo size="small" />
            <div style={{ padding: '24px', flex: 1, overflowY: 'auto', paddingBottom: '100px' }}>
                {tab === 'schedule' && (
                    <div>
                        <h2 className="section-title">לוח זמנים</h2>
                        <h3 className="section-title" style={{ fontSize: '16px' }}>תורים להיום {new Date().toLocaleDateString('he-IL')}:</h3>
                        {appointments.filter(ap => {
                            const today = new Date();
                            return ap.client;
                        }).map((ap, i) => (
                            <div key={i} className="client-card">
                                <div className="gender-indicator" style={{ background: ap.client.gender === 'female' ? 'var(--female-color)' : 'var(--male-color)' }}></div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontWeight: 'bold', textAlign: 'right' }}>{ap.client.name} - {ap.time}</p>
                                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'right' }}>{ap.service.name} ({ap.barber.name})</p>
                                </div>
                                <a href={`tel:${ap.client.phone}`} style={{ padding: '10px', background: '#F0F0F0', borderRadius: '10px', color: 'var(--primary)' }}>
                                    <Phone size={20} />
                                </a>
                            </div>
                        ))}
                        {appointments.length === 0 && (
                            <p style={{ textAlign: 'center', color: '#AAA', marginTop: '40px' }}>אין תורים</p>
                        )}
                    </div>
                )}

                {tab === 'availability' && (
                    <div>
                        <h2 className="section-title">ניהול זמינות</h2>
                        <div className="mini-calendar" style={{ marginBottom: '20px' }}>
                             <div className="calendar-header" style={{ marginBottom: '10px' }}>
                                 {(() => {
                                     const today = new Date();
                                     const currentMonth = today.getMonth();
                                     const currentYear = today.getFullYear();
                                     const canGoBack = displayYear > currentYear || (displayYear === currentYear && displayMonth > currentMonth);
                                     
                                     return (
                                         <>
                                             <button 
                                                 onClick={() => {
                                                     if (displayMonth === 0) {
                                                         setDisplayMonth(11);
                                                         setDisplayYear(displayYear - 1);
                                                     } else {
                                                         setDisplayMonth(displayMonth - 1);
                                                     }
                                                 }} 
                                                 disabled={!canGoBack}
                                                 style={{ background: 'none', border: 'none', cursor: canGoBack ? 'pointer' : 'not-allowed', fontSize: '20px', padding: '0', opacity: canGoBack ? 1 : 0.3 }}>‹</button>
                                             <span style={{ fontWeight: 'bold' }}>{new Date(displayYear, displayMonth).toLocaleDateString('he-IL', { month: 'long', year: 'numeric' })}</span>
                                             <button 
                                                 onClick={() => {
                                                     if (displayMonth === 11) {
                                                         setDisplayMonth(0);
                                                         setDisplayYear(displayYear + 1);
                                                     } else {
                                                         setDisplayMonth(displayMonth + 1);
                                                     }
                                                 }} 
                                                 disabled={displayYear > currentYear || (displayYear === currentYear && displayMonth >= currentMonth + 1)}
                                                 style={{ background: 'none', border: 'none', cursor: displayYear > currentYear || (displayYear === currentYear && displayMonth >= currentMonth + 1) ? 'not-allowed' : 'pointer', fontSize: '20px', padding: '0', opacity: displayYear > currentYear || (displayYear === currentYear && displayMonth >= currentMonth + 1) ? 0.3 : 1 }}>›</button>
                                         </>
                                     );
                                 })()}
                             </div>
                             <div className="calendar-grid">
                                {['א','ב','ג','ד','ה','ו','ש'].map(d => <div key={d} className="day-header">{d}</div>)}
                                {(() => {
                                    const firstDay = new Date(displayYear, displayMonth, 1).getDay();
                                    const daysInMonth = new Date(displayYear, displayMonth + 1, 0).getDate();
                                    const daysInPrevMonth = new Date(displayYear, displayMonth, 0).getDate();
                                    const closedDays = getClosedDays(displayMonth, displayYear);
                                    const today = new Date();
                                    const cells = [];
                                    
                                    // Days from previous month
                                    for (let i = firstDay - 1; i >= 0; i--) {
                                        const day = daysInPrevMonth - i;
                                        cells.push(
                                            <div 
                                                key={`prev-${day}`} 
                                                className="day-cell dimmed"
                                                style={{ opacity: 0.4 }}
                                            >
                                                {day}
                                            </div>
                                        );
                                    }
                                    
                                    for (let day = 1; day <= daysInMonth; day++) {
                                        const isClosed = closedDays.includes(day);
                                        const isPast = displayYear < today.getFullYear() || 
                                                      (displayYear === today.getFullYear() && displayMonth < today.getMonth()) ||
                                                      (displayYear === today.getFullYear() && displayMonth === today.getMonth() && day < today.getDate());
                                        const isSelected = selectedDate.getDate() === day && 
                                                           selectedDate.getMonth() === displayMonth && 
                                                           selectedDate.getFullYear() === displayYear;
                                        const isToday = day === today.getDate() && 
                                                        displayMonth === today.getMonth() && 
                                                        displayYear === today.getFullYear();
                                        cells.push(
                                            <div 
                                                key={day} 
                                                className={`day-cell ${isClosed || isPast ? 'dimmed' : ''} ${isSelected ? 'active' : ''} ${isToday && !isSelected ? 'today' : ''}`}
                                                onClick={() => {
                                                    if (isClosed || isPast) return;

                                                    const newDate = isToday
                                                        ? new Date() // current date & time
                                                        : new Date(displayYear, displayMonth, day);

                                                    setSelectedDate(newDate);
                                                    }}
                                            >
                                                {day}
                                            </div>
                                        );
                                    }
                                    
                                    return cells;
                                })()}
                             </div>
                        </div>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '15px', textAlign: 'right' }}>לחץ על שעה כדי לחסום/לשחרר אותה</p>
                        <h3 className="section-title" style={{ fontSize: '16px' }}>זמינות ל{selectedDate.toLocaleDateString('he-IL')}:</h3>
                        <div className="selection-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                            {generateSlots(selectedDate, 30).map(t => {
                                const isBlocked = blockedSlots[t];
                                return (
                                    <div key={t} className={`selection-item ${isBlocked ? 'active' : ''}`} onClick={() => toggleBlock(t)} style={{ background: isBlocked ? '#E74C3C' : '#FFF', color: isBlocked ? '#FFF' : '#333', fontSize: '12px', padding: '10px 5px' }}>
                                        {isBlocked ? <Lock size={12} /> : t}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {tab === 'clients' && (
                    <div>
                        <h2 className="section-title">לקוחות רשומים ({users.length})</h2>
                        <div style={{ position: 'relative', marginBottom: '20px' }}>
                            <Search size={18} style={{ position: 'absolute', right: '15px', top: '15px', color: '#AAA' }} />
                            <input className="input-field" style={{ paddingRight: '45px', marginBottom: 0 }} placeholder="חיפוש לפי שם או טלפון..." value={search} onChange={(e) => setSearch(e.target.value)} />
                        </div>
                        {filteredUsers.map((u, i) => (
                            <div key={i} className="client-card">
                                <UserCheck size={24} color={u.gender === 'female' ? 'var(--female-color)' : 'var(--male-color)'} />
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontWeight: 'bold', textAlign: 'right' }}>{u.name}</p>
                                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'right' }}>{u.phone} | הצטרף: {u.regDate}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {tab === 'profile' && (
                    <div style={{ textAlign: 'center', paddingTop: '40px' }}>
                        <div style={{ width: '100px', height: '100px', background: 'var(--primary)', borderRadius: '50px', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                            <Settings size={50} />
                        </div>
                        <h2 style={{ marginBottom: '10px' }}>חשבון מנהל</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '40px' }}>אבי שושה - הגדרות מערכת</p>
                        <button className="pill-button" style={{ background: '#FEE' , color: '#E74C3C' }} onClick={() => window.location.reload()}>התנתק מהמערכת</button>
                    </div>
                )}
            </div>

            <div className="bottom-nav-container">
                <div className={`nav-tab ${tab === 'schedule' ? 'active' : ''}`} onClick={() => setTab('schedule')}>
                    <CalendarIcon size={24} />
                    <span>לוח זמנים</span>
                </div>
                <div className={`nav-tab ${tab === 'availability' ? 'active' : ''}`} onClick={() => setTab('availability')}>
                    <Clock size={24} />
                    <span>זמינות</span>
                </div>
                <div className={`nav-tab ${tab === 'clients' ? 'active' : ''}`} onClick={() => setTab('clients')}>
                    <Users size={24} />
                    <span>לקוחות</span>
                </div>
                <div className={`nav-tab ${tab === 'profile' ? 'active' : ''}`} onClick={() => setTab('profile')}>
                    <User size={24} />
                    <span>פרופיל</span>
                </div>
            </div>
        </div>
    );
};

// --- MAIN APP ---

export default function App() {
    const [screen, setScreen] = useState('welcome');
    const [user, setUser] = useState(null);
    const [tab, setTab] = useState('booking');
    const [blockedSlots, setBlockedSlots] = useState({});
    const [users, setUsers] = useState([
        { name: 'ישראל ישראלי', phone: '0501234567', gender: 'male', regDate: '10.02.2026' },
        { name: 'נועה המלכה', phone: '0529998877', gender: 'female', regDate: '11.02.2026' }
    ]);
    const [appointments, setAppointments] = useState([
        { client: { name: 'ישראל ישראלי', phone: '0501234567', gender: 'male' }, barber: BARBERS[0], service: SERVICES[0], time: '09:00' }
    ]);

    useEffect(() => {
        const saved = localStorage.getItem('avi_shusha_user');
        if (saved) {
            setUser(JSON.parse(saved));
            setScreen('main');
        }
    }, []);

    const handleRegister = (data) => {
        setUser(data);
        localStorage.setItem('avi_shusha_user', JSON.stringify(data));
        setUsers([...users, data]);
        setScreen('main');
    };

    const handleBook = (data) => {
        const newApp = { client: user, ...data };
        setAppointments([...appointments, newApp]);
    };

    const toggleBlock = (t) => {
        setBlockedSlots({...blockedSlots, [t]: !blockedSlots[t]});
    };

    const [isManager, setIsManager] = useState(false);

    return (
        <div className="mobile-frame">
            <StatusBar />
            
            <AnimatePresence mode="wait">
                {isManager ? (  
                    <motion.div key="mgr" style={{ height: '100%' }}>
                        <ManagerView users={users} appointments={appointments} blockedSlots={blockedSlots} toggleBlock={toggleBlock} />
                    </motion.div>
                ) : screen === 'welcome' ? (
                    <motion.div key="welcome" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <WelcomeScreen onStart={() => setScreen('register')} />
                    </motion.div>
                ) : screen === 'register' ? (
                    <motion.div key="reg" initial={{ x: 390 }} animate={{ x: 0 }} exit={{ x: -390 }}>
                        <RegisterScreen onRegister={handleRegister} />
                    </motion.div>
                ) : (
                    <motion.div key="main" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                            {tab === 'booking' && <BookingFlow user={user} blockedSlots={blockedSlots} onBook={handleBook} />}
                            {tab === 'my_apps' && (
                                <div className="screen-container" style={{ padding: 0 }}>
                                    <HeaderLogo size="small" />
                                     <div style={{ padding: '24px' }}>
                                        <h2 className="section-title">התורים שלי</h2>
                                        {appointments.filter(a => a.client.phone === user.phone).map((ap, i) => (
                                            <div key={i} className="card">
                                                <p style={{ fontWeight: 'bold', textAlign: 'right' }}>{ap.service.name}</p>
                                                <p style={{ fontSize: '14px', color: 'var(--text-muted)', textAlign: 'right' }}>{ap.barber.name} | {ap.time}</p>
                                            </div>
                                        ))}
                                        {appointments.filter(a => a.client.phone === user.phone).length === 0 && (
                                            <p style={{ textAlign: 'center', color: '#AAA', marginTop: '40px' }}>אין תורים עתידיים</p>
                                        )}
                                     </div>
                                </div>
                            )}
                            {tab === 'profile' && (
                                <div className="screen-container" style={{ padding: 0 }}>
                                    <HeaderLogo size="small" />
                                    <div style={{ padding: '24px', textAlign: 'center' }}>
                                        <div style={{ width: '80px', height: '80px', background: user.gender === 'female' ? 'var(--female-color)' : 'var(--male-color)', borderRadius: '40px', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                            <User size={40} />
                                        </div>
                                        <h2>{user.name}</h2>
                                        <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>{user.phone}</p>
                                        
                                        <ExternalLinks />

                                        <button className="pill-button" onClick={() => { localStorage.clear(); window.location.reload(); }} style={{ background: '#F5F5F7', color: '#333', marginTop: '20px' }}>
                                            {STRINGS[user.gender].logout}
                                        </button>

                                        <p style={{ fontSize: '10px', color: '#CCC', cursor: 'pointer', marginTop: '20px' }} onClick={() => setIsManager(true)}>ניהול</p>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="bottom-nav-container">
                            <div className={`nav-tab ${tab === 'booking' ? 'active' : ''}`} onClick={() => setTab('booking')}>
                                <Calendar size={24} />
                                <span>{STRINGS[user.gender].bookTitle}</span>
                            </div>
                            <div className={`nav-tab ${tab === 'my_apps' ? 'active' : ''}`} onClick={() => setTab('my_apps')}>
                                <Clock size={24} />
                                <span>התורים שלי</span>
                            </div>
                            <div className={`nav-tab ${tab === 'profile' ? 'active' : ''}`} onClick={() => setTab('profile')}>
                                <User size={24} />
                                <span>פרופיל</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
