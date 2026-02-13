import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar as CalendarIcon, User, Clock, CheckCircle, ChevronLeft, 
  Lock, Trash2, Plus, Phone, Search, Users, Settings, LogOut, ChevronRight,
  UserCheck, Scissors, Heart, Calendar, Facebook, MapPin, X
} from 'lucide-react';
import './index.css';

// --- CONSTANTS ---
const BARBERS = [
    { id: 'avi', name: 'אבי', initials: 'א', image: '/barber-avi.png' },
    { id: 'chen', name: 'חן', initials: 'ח', image: '/barber-chen.png' }
];

const SERVICES = [
    { id: 'm1', name: 'תספורת גבר', duration: 15, icon: '✂️' },
    { id: 'm2', name: 'תספורת גבר + זקן', duration: 30, icon: '✂️' },
    { id: 'f1', name: 'תספורת אישה - רגיל', duration: 30, icon: '💇‍♀️' },
    { id: 'f2', name: 'תספורת אישה + פן', duration: 45, icon: '💇‍♀️' },
    { id: 'f3', name: 'פן בלבד', duration: 15, icon: '💆‍♀️' },
    { id: 'f4', name: 'תספורת אישה + גוונים', duration: 180, icon: '🎨' },
    { id: 'f5', name: 'תספורת אישה + צבע שורש', duration: 90, icon: '🎨' }
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
  const current = hours + minutes / 60;
  const nextQuarter = Math.ceil(current * 4) / 4;
  const MIN = 8.5;
  const MAX = 19;
  return Math.min(Math.max(nextQuarter, MIN), MAX);
};

const generateSlots = (date, serviceDuration = 30) => {
    const slots = [];
    let start = getStartHour(date);
    let end = 19.5;
    const duration = serviceDuration / 60;
    const increment = 0.25;

    for (let t = start; t < end; t += increment) {
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
    <div className={`header-logo-container ${size}`} style={{ 
        padding: size === 'big' ? '40px 0 20px' : '20px 0 15px',
        textAlign: 'center'
    }}>
        <img 
            src="/logo.png" 
            className={`header-logo-image ${size}`} 
            alt="Avi Shusha" 
            style={{ 
                maxWidth: size === 'big' ? '180px' : '120px',
                height: 'auto'
            }} 
        />
    </div>
);

const StatusBar = () => (
    <div className="status-bar" style={{ 
        background: 'transparent',
        padding: '8px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '14px',
        fontWeight: '500'
    }}>
        <span>12:45</span>
        <div style={{ display: 'flex', gap: '8px' }}>
            <span>📶</span>
            <span>🔋</span>
        </div>
    </div>
);

const ExternalLinks = () => (
    <div className="external-links-bar" style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '20px',
        margin: '30px 0'
    }}>
        <a 
            href="https://waze.com/ul?q=דבורה הנביאה 122, תל אביב-יפו" 
            target="_blank" 
            rel="noreferrer" 
            className="social-icon-btn"
            style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: '#FFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s'
            }}
        >
            <img src="https://upload.wikimedia.org/wikipedia/commons/6/67/Waze_icon.png" alt="Waze" style={{ width: '32px', height: '32px' }} />
        </a>
        <a 
            href="https://www.facebook.com/profile.php?id=100057563375603" 
            target="_blank" 
            rel="noreferrer" 
            className="social-icon-btn"
            style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: '#FFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s'
            }}
        >
            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b8/2021_Facebook_icon.svg" alt="Facebook" style={{ width: '32px', height: '32px' }} />
        </a>
    </div>
);

// --- SCREENS ---

const WelcomeScreen = ({ onStart }) => (
    <div className="screen-container" style={{ 
        padding: 0,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(180deg, #FAFAFA 0%, #FFFFFF 100%)'
    }}>
        <HeaderLogo size="big" />
        <div style={{ 
            padding: '20px 32px 40px', 
            textAlign: 'center', 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center' 
        }}>
            <h1 style={{ 
                fontSize: '36px', 
                color: 'var(--primary)', 
                marginBottom: '12px',
                fontWeight: '700'
            }}>ברוכים הבאים</h1>
            <p style={{ 
                color: 'var(--text-muted)', 
                fontSize: '18px', 
                marginBottom: '60px',
                fontWeight: '400'
            }}>אבי שושה - עיצוב שיער</p>
            
            <ExternalLinks />
            
            <button 
                className="pill-button" 
                onClick={onStart}
                style={{
                    background: 'linear-gradient(135deg, var(--primary) 0%, #2D5F8D 100%)',
                    boxShadow: '0 4px 16px rgba(52, 109, 151, 0.3)',
                    fontSize: '18px',
                    fontWeight: '600',
                    padding: '18px 40px',
                    marginTop: '20px'
                }}
            >
                לחצו להתחברות או הרשמה
            </button>
        </div>
    </div>
);

const RegisterScreen = ({ onRegister }) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [gender, setGender] = useState('male');
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
        <div className="screen-container" style={{ 
            padding: 0, 
            height: '100%',
            display: 'flex', 
            flexDirection: 'column',
            background: '#FAFAFA'
        }}>
            <HeaderLogo size="small" />
            <div style={{ 
                padding: '0 24px 24px', 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column',
                justifyContent: 'space-between'
            }}>
                <div>
                    <h2 className="section-title" style={{ 
                        fontSize: '28px',
                        fontWeight: '700',
                        marginBottom: '30px',
                        textAlign: 'center'
                    }}>הרשמה למערכת</h2>
                    
                    <div className="gender-toggle" style={{
                        display: 'flex',
                        gap: '12px',
                        marginBottom: '24px',
                        padding: '6px',
                        background: '#F0F0F0',
                        borderRadius: '16px'
                    }}>
                        <div 
                            className={`gender-option ${gender === 'male' ? 'active male' : ''}`} 
                            onClick={() => setGender('male')}
                            style={{
                                flex: 1,
                                padding: '14px',
                                borderRadius: '12px',
                                textAlign: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.3s',
                                fontWeight: '600',
                                background: gender === 'male' ? 'var(--male-color)' : 'transparent',
                                color: gender === 'male' ? '#FFF' : '#666'
                            }}
                        >
                            זכר
                        </div>
                        <div 
                            className={`gender-option ${gender === 'female' ? 'active female' : ''}`} 
                            onClick={() => setGender('female')}
                            style={{
                                flex: 1,
                                padding: '14px',
                                borderRadius: '12px',
                                textAlign: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.3s',
                                fontWeight: '600',
                                background: gender === 'female' ? 'var(--female-color)' : 'transparent',
                                color: gender === 'female' ? '#FFF' : '#666'
                            }}
                        >
                            נקבה
                        </div>
                    </div>

                    <input 
                        className={`input-field ${errors.name ? 'error' : ''}`} 
                        placeholder="שם מלא" 
                        value={name}
                        onChange={(e) => { setName(e.target.value); setErrors({...errors, name: false}); }}
                        style={{
                            marginBottom: '16px',
                            padding: '16px 20px',
                            fontSize: '16px',
                            border: errors.name ? '2px solid #E74C3C' : '1px solid #E0E0E0',
                            borderRadius: '14px',
                            background: '#FFF'
                        }}
                    />

                    <input 
                        className={`input-field ${errors.phone ? 'error' : ''}`} 
                        placeholder="מספר טלפון" 
                        type="tel"
                        value={phone}
                        onChange={(e) => { setPhone(e.target.value); setErrors({...errors, phone: false}); }}
                        style={{
                            marginBottom: '8px',
                            padding: '16px 20px',
                            fontSize: '16px',
                            border: errors.phone ? '2px solid #E74C3C' : '1px solid #E0E0E0',
                            borderRadius: '14px',
                            background: '#FFF'
                        }}
                    />
                    {errors.phone && (
                        <p className="error-text" style={{ 
                            color: '#E74C3C', 
                            fontSize: '14px', 
                            marginTop: '8px',
                            textAlign: 'right'
                        }}>
                            מספר טלפון לא תקין
                        </p>
                    )}
                </div>

                <button 
                    className="pill-button" 
                    onClick={handleSubmit} 
                    style={{ 
                        marginTop: '24px',
                        flexShrink: 0,
                        background: 'linear-gradient(135deg, var(--primary) 0%, #2D5F8D 100%)',
                        boxShadow: '0 4px 16px rgba(52, 109, 151, 0.3)',
                        fontSize: '17px',
                        fontWeight: '600',
                        padding: '16px 40px'
                    }}
                >
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
        <div className="screen-container" style={{ padding: 0, background: '#FAFAFA', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <HeaderLogo size="small" />
            <div style={{ padding: '0 20px 20px', flex: 1, overflowY: 'auto' }} ref={scrollRef}>
                
                {/* Calendar - Date Selection */}
                <h3 className="section-title" style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px' }}>{s.selectDate}</h3>
                <div className="mini-calendar" style={{ 
                    background: '#FFF', 
                    borderRadius: '20px', 
                    padding: '20px',
                    marginBottom: '32px',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
                }}>
                    <div className="calendar-header" style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        marginBottom: '20px'
                    }}> 
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
                                        style={{ 
                                            background: 'none', 
                                            border: 'none', 
                                            cursor: canGoBack ? 'pointer' : 'not-allowed', 
                                            fontSize: '24px', 
                                            padding: '8px',
                                            opacity: canGoBack ? 1 : 0.3,
                                            color: 'var(--primary)'
                                        }}>‹</button>
                                    <span style={{ fontWeight: '700', fontSize: '17px' }}>
                                        {new Date(displayYear, displayMonth).toLocaleDateString('he-IL', { month: 'long', year: 'numeric' })}
                                    </span>
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
                                        style={{ 
                                            background: 'none', 
                                            border: 'none', 
                                            cursor: displayYear > currentYear || (displayYear === currentYear && displayMonth >= currentMonth + 1) ? 'not-allowed' : 'pointer', 
                                            fontSize: '24px', 
                                            padding: '8px',
                                            opacity: displayYear > currentYear || (displayYear === currentYear && displayMonth >= currentMonth + 1) ? 0.3 : 1,
                                            color: 'var(--primary)'
                                        }}>›</button>
                                </>
                            );
                        })()}
                    </div>
                    <div className="calendar-grid" style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(7, 1fr)', 
                        gap: '4px',
                        width: '100%'
                    }}>
                        {['א','ב','ג','ד','ה','ו','ש'].map(d => (
                            <div key={d} className="day-header" style={{ 
                                textAlign: 'center', 
                                fontSize: '13px', 
                                fontWeight: '600', 
                                color: '#999',
                                padding: '8px 0'
                            }}>{d}</div>
                        ))}
                        {(() => {
                            const firstDay = new Date(displayYear, displayMonth, 1).getDay();
                            const daysInMonth = new Date(displayYear, displayMonth + 1, 0).getDate();
                            const daysInPrevMonth = new Date(displayYear, displayMonth, 0).getDate();
                            const closedDays = getClosedDays(displayMonth, displayYear);
                            const today = new Date();
                            const cells = [];
                            
                            for (let i = firstDay - 1; i >= 0; i--) {
                                const day = daysInPrevMonth - i;
                                cells.push(
                                    <div 
                                        key={`prev-${day}`} 
                                        className="day-cell dimmed"
                                        style={{ 
                                            opacity: 0.3,
                                            textAlign: 'center',
                                            padding: '8px 4px',
                                            fontSize: '15px',
                                            height: '40px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
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
                                            const newDate = isToday ? new Date() : new Date(displayYear, displayMonth, day);
                                            setBookingData({
                                                ...bookingData,
                                                date: newDate,
                                                time: null,
                                            });
                                        }}
                                        style={{
                                            textAlign: 'center',
                                            fontSize: '15px',
                                            borderRadius: '12px',
                                            cursor: isClosed || isPast ? 'not-allowed' : 'pointer',
                                            background: isSelected ? 'var(--primary)' : isToday ? '#E8F4F8' : 'transparent',
                                            color: isSelected ? '#FFF' : isClosed || isPast ? '#CCC' : '#333',
                                            fontWeight: isSelected || isToday ? '600' : '400',
                                            transition: 'all 0.2s',
                                            height: '40px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
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

                {/* Service Selection */}
                <h3 className="section-title" style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px' }}>{s.selectService}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                    {SERVICES.map(sv => (
                        <div 
                            key={sv.id} 
                            className={`selection-item ${bookingData.service?.id === sv.id ? 'active' : ''}`} 
                            onClick={() => setBookingData({...bookingData, service: sv, time: null})} 
                            style={{ 
                                textAlign: 'right', 
                                display: 'flex', 
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '16px 20px',
                                background: bookingData.service?.id === sv.id ? 'var(--primary)' : '#FFF',
                                color: bookingData.service?.id === sv.id ? '#FFF' : '#333',
                                borderRadius: '16px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                boxShadow: bookingData.service?.id === sv.id ? '0 4px 12px rgba(52, 109, 151, 0.3)' : '0 2px 8px rgba(0,0,0,0.06)'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ fontSize: '24px' }}>{sv.icon}</span>
                                <span style={{ fontWeight: '600', fontSize: '16px' }}>{sv.name}</span>
                            </div>
                            <span style={{ 
                                color: bookingData.service?.id === sv.id ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)',
                                fontSize: '14px'
                            }}>{sv.duration} דק'</span>
                        </div>
                    ))}
                </div>

                {/* Barber Selection */}
                <h3 className="section-title" style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px' }}>{s.selectBarber}</h3>
                <div className="selection-grid" style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(2, 1fr)', 
                    gap: '16px',
                    marginBottom: '32px' 
                }}>
                    {BARBERS.map(b => (
                        <div 
                            key={b.id} 
                            className={`selection-item ${bookingData.barber?.id === b.id ? 'active' : ''}`} 
                            onClick={() => setBookingData({...bookingData, barber: b, time: null})}
                            style={{
                                padding: '24px 16px',
                                background: bookingData.barber?.id === b.id ? 'var(--primary)' : '#FFF',
                                borderRadius: '20px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                textAlign: 'center',
                                boxShadow: bookingData.barber?.id === b.id ? '0 4px 12px rgba(52, 109, 151, 0.3)' : '0 2px 8px rgba(0,0,0,0.06)'
                            }}
                        >
                            <div style={{ 
                                width: '70px', 
                                height: '70px', 
                                background: bookingData.barber?.id === b.id ? 'rgba(255,255,255,0.2)' : '#F0F0F0',
                                borderRadius: '35px', 
                                margin: '0 auto 16px', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                fontSize: '28px',
                                fontWeight: '700',
                                color: bookingData.barber?.id === b.id ? '#FFF' : 'var(--primary)'
                            }}>
                                {b.initials}
                            </div>
                            <p style={{ 
                                fontWeight: '700', 
                                fontSize: '17px',
                                color: bookingData.barber?.id === b.id ? '#FFF' : '#333'
                            }}>{b.name}</p>
                        </div>
                    ))}
                </div>

                {/* Time Selection */}
                {bookingData.service && bookingData.barber && (
                    <>
                        <h3 className="section-title" style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px' }}>{s.selectTime}</h3>
                        <div className="selection-grid" style={{ 
                            display: 'grid',
                            gridTemplateColumns: 'repeat(4, 1fr)', 
                            gap: '12px',
                            marginBottom: '100px' 
                        }}>
                            {getSlots().map(t => (
                                <div 
                                    key={t} 
                                    className={`selection-item ${bookingData.time === t ? 'active' : ''}`} 
                                    onClick={() => setBookingData({...bookingData, time: t})} 
                                    style={{ 
                                        padding: '14px 8px', 
                                        fontSize: '15px',
                                        fontWeight: '600',
                                        background: bookingData.time === t ? 'var(--primary)' : '#FFF',
                                        color: bookingData.time === t ? '#FFF' : '#333',
                                        borderRadius: '12px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        textAlign: 'center',
                                        boxShadow: bookingData.time === t ? '0 4px 12px rgba(52, 109, 151, 0.3)' : '0 2px 8px rgba(0,0,0,0.06)'
                                    }}
                                >
                                    {t}
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Floating Confirm Button */}
            {bookingData.time && (
                <div style={{ 
                    position: 'sticky',
                    bottom: 0,
                    padding: '16px 20px',
                    background: 'linear-gradient(to top, #FFF 80%, transparent)',
                    borderTop: '1px solid #F0F0F0'
                }}>
                    <button 
                        className="pill-button" 
                        onClick={handleConfirm} 
                        style={{ 
                            width: '100%',
                            background: 'linear-gradient(135deg, #27AE60 0%, #229954 100%)',
                            boxShadow: '0 4px 16px rgba(39, 174, 96, 0.3)',
                            fontSize: '17px',
                            fontWeight: '600',
                            padding: '16px 40px'
                        }}
                    >
                        אישור התור ✓
                    </button>
                </div>
            )}

            <AnimatePresence>
                {confirmed && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }} 
                        animate={{ opacity: 1, scale: 1 }}  
                        exit={{ opacity: 0, scale: 0.9 }} 
                        style={{ 
                            position: 'fixed',
                            top: '50%',
                            left: 0,
                            right: 0,
                            transform: 'translateY(-50%)',     
                            background: '#fff', 
                            padding: '30px 24px', 
                            borderRadius: '24px', 
                            textAlign: 'center', 
                            boxShadow: '0 20px 60px rgba(53, 23, 23, 0.3)', 
                            zIndex: 1000,
                            maxWidth: '90vw',
                            width: '90%',
                            maxHeight: '90vh',
                            overflowY: 'auto',
                            margin: '0 auto'
                        }}
                    >
                        <CheckCircle size={70} color="#27AE60" style={{ margin: '0 auto 24px' }} />
                        <h2 style={{ 
                            color: 'var(--primary)', 
                            marginBottom: '12px',
                            fontSize: '24px',
                            fontWeight: '700'
                        }}>{s.success}!</h2>
                        <p style={{ 
                            color: 'var(--text-muted)',
                            fontSize: '15px'
                        }}>הודעת SMS נשלחה לנייד שלך</p>
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
        <div className="screen-container" style={{ padding: 0, background: '#FAFAFA', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <HeaderLogo size="small" />
            <div style={{ padding: '0 20px 20px', flex: 1, overflowY: 'auto', paddingBottom: '100px' }}>
                {tab === 'schedule' && (
                    <div>
                        <h2 className="section-title" style={{ fontSize: '24px', fontWeight: '700', marginBottom: '20px' }}>לוח זמנים</h2>
                        <h3 className="section-title" style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#666' }}>
                            תורים להיום {new Date().toLocaleDateString('he-IL')}:
                        </h3>
                        {appointments.filter(ap => ap.client).map((ap, i) => (
                            <div key={i} className="client-card" style={{
                                background: '#FFF',
                                borderRadius: '16px',
                                padding: '16px',
                                marginBottom: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                            }}>
                                <div className="gender-indicator" style={{ 
                                    width: '4px',
                                    height: '50px',
                                    borderRadius: '4px',
                                    background: ap.client.gender === 'female' ? 'var(--female-color)' : 'var(--male-color)' 
                                }}></div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontWeight: '700', textAlign: 'right', fontSize: '16px', marginBottom: '4px' }}>
                                        {ap.client.name} - {ap.time}
                                    </p>
                                    <p style={{ fontSize: '14px', color: 'var(--text-muted)', textAlign: 'right' }}>
                                        {ap.service.name} ({ap.barber.name})
                                    </p>
                                </div>
                                <a 
                                    href={`tel:${ap.client.phone}`} 
                                    style={{ 
                                        padding: '12px', 
                                        background: '#F0F0F0', 
                                        borderRadius: '12px', 
                                        color: 'var(--primary)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <Phone size={20} />
                                </a>
                            </div>
                        ))}
                        {appointments.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                                <CalendarIcon size={60} color="#DDD" style={{ margin: '0 auto 16px' }} />
                                <p style={{ color: '#AAA', fontSize: '16px' }}>אין תורים להיום</p>
                            </div>
                        )}
                    </div>
                )}

                {tab === 'availability' && (
                    <div>
                        <h2 className="section-title" style={{ fontSize: '24px', fontWeight: '700', marginBottom: '20px' }}>ניהול זמינות</h2>
                        <div className="mini-calendar" style={{ 
                            background: '#FFF', 
                            borderRadius: '20px', 
                            padding: '20px',
                            marginBottom: '24px',
                            boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
                        }}>
                             <div className="calendar-header" style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center',
                                marginBottom: '20px'
                            }}>
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
                                                 style={{ 
                                                    background: 'none', 
                                                    border: 'none', 
                                                    cursor: canGoBack ? 'pointer' : 'not-allowed', 
                                                    fontSize: '24px', 
                                                    padding: '8px',
                                                    opacity: canGoBack ? 1 : 0.3,
                                                    color: 'var(--primary)'
                                                }}>‹</button>
                                             <span style={{ fontWeight: '700', fontSize: '17px' }}>
                                                {new Date(displayYear, displayMonth).toLocaleDateString('he-IL', { month: 'long', year: 'numeric' })}
                                            </span>
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
                                                 style={{ 
                                                    background: 'none', 
                                                    border: 'none', 
                                                    cursor: displayYear > currentYear || (displayYear === currentYear && displayMonth >= currentMonth + 1) ? 'not-allowed' : 'pointer', 
                                                    fontSize: '24px', 
                                                    padding: '8px',
                                                    opacity: displayYear > currentYear || (displayYear === currentYear && displayMonth >= currentMonth + 1) ? 0.3 : 1,
                                                    color: 'var(--primary)'
                                                }}>›</button>
                                         </>
                                     );
                                 })()}
                             </div>
                             <div className="calendar-grid" style={{ 
                                display: 'grid', 
                                gridTemplateColumns: 'repeat(7, 1fr)', 
                                gap: '4px',
                                width: '100%'
                            }}>
                                {['א','ב','ג','ד','ה','ו','ש'].map(d => (
                                    <div key={d} className="day-header" style={{ 
                                        textAlign: 'center', 
                                        fontSize: '13px', 
                                        fontWeight: '600', 
                                        color: '#999',
                                        padding: '8px 0'
                                    }}>{d}</div>
                                ))}
                                {(() => {
                                    const firstDay = new Date(displayYear, displayMonth, 1).getDay();
                                    const daysInMonth = new Date(displayYear, displayMonth + 1, 0).getDate();
                                    const daysInPrevMonth = new Date(displayYear, displayMonth, 0).getDate();
                                    const closedDays = getClosedDays(displayMonth, displayYear);
                                    const today = new Date();
                                    const cells = [];
                                    
                                    for (let i = firstDay - 1; i >= 0; i--) {
                                        const day = daysInPrevMonth - i;
                                        cells.push(
                                            <div 
                                                key={`prev-${day}`} 
                                                className="day-cell dimmed"
                                                style={{ 
                                                    opacity: 0.3,
                                                    textAlign: 'center',
                                                    padding: '8px 4px',
                                                    fontSize: '15px',
                                                    height: '40px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
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
                                                    const newDate = isToday ? new Date() : new Date(displayYear, displayMonth, day);
                                                    setSelectedDate(newDate);
                                                }}
                                                style={{
                                                    textAlign: 'center',
                                                    fontSize: '15px',
                                                    borderRadius: '12px',
                                                    cursor: isClosed || isPast ? 'not-allowed' : 'pointer',
                                                    background: isSelected ? 'var(--primary)' : isToday ? '#E8F4F8' : 'transparent',
                                                    color: isSelected ? '#FFF' : isClosed || isPast ? '#CCC' : '#333',
                                                    fontWeight: isSelected || isToday ? '600' : '400',
                                                    transition: 'all 0.2s',
                                                    height: '40px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
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
                        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px', textAlign: 'right' }}>
                            לחץ על שעה כדי לחסום/לשחרר אותה
                        </p>
                        <h3 className="section-title" style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
                            זמינות ל{selectedDate.toLocaleDateString('he-IL')}:
                        </h3>
                        <div className="selection-grid" style={{ 
                            display: 'grid',
                            gridTemplateColumns: 'repeat(4, 1fr)',
                            gap: '10px'
                        }}>
                            {generateSlots(selectedDate, 30).map(t => {
                                const isBlocked = blockedSlots[t];
                                return (
                                    <div 
                                        key={t} 
                                        className={`selection-item ${isBlocked ? 'active' : ''}`} 
                                        onClick={() => toggleBlock(t)} 
                                        style={{ 
                                            background: isBlocked ? '#E74C3C' : '#FFF', 
                                            color: isBlocked ? '#FFF' : '#333', 
                                            fontSize: '14px', 
                                            padding: '12px 8px',
                                            borderRadius: '12px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            textAlign: 'center',
                                            fontWeight: '600',
                                            boxShadow: isBlocked ? '0 4px 12px rgba(231, 76, 60, 0.3)' : '0 2px 8px rgba(0,0,0,0.06)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '4px'
                                        }}
                                    >
                                        {isBlocked ? <Lock size={14} /> : t}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {tab === 'clients' && (
                    <div>
                        <h2 className="section-title" style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>
                            לקוחות רשומים
                        </h2>
                        <p style={{ fontSize: '14px', color: '#999', marginBottom: '20px' }}>סה"כ {users.length} לקוחות</p>
                        <div style={{ position: 'relative', marginBottom: '20px' }}>
                            <Search size={18} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: '#AAA' }} />
                            <input 
                                className="input-field" 
                                style={{ 
                                    paddingRight: '48px', 
                                    marginBottom: 0,
                                    padding: '14px 48px 14px 16px',
                                    borderRadius: '14px',
                                    border: '1px solid #E0E0E0',
                                    background: '#FFF'
                                }} 
                                placeholder="חיפוש לפי שם או טלפון..." 
                                value={search} 
                                onChange={(e) => setSearch(e.target.value)} 
                            />
                        </div>
                        {filteredUsers.map((u, i) => (
                            <div key={i} className="client-card" style={{
                                background: '#FFF',
                                borderRadius: '16px',
                                padding: '16px',
                                marginBottom: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                            }}>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '24px',
                                    background: u.gender === 'female' ? 'var(--female-color)' : 'var(--male-color)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#FFF',
                                    flexShrink: 0
                                }}>
                                    <UserCheck size={24} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontWeight: '700', textAlign: 'right', fontSize: '16px', marginBottom: '4px' }}>{u.name}</p>
                                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'right' }}>
                                        {u.phone} | הצטרף: {u.regDate}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {tab === 'profile' && (
                    <div style={{ textAlign: 'center', paddingTop: '40px' }}>
                        <div style={{ 
                            width: '100px', 
                            height: '100px', 
                            background: 'linear-gradient(135deg, var(--primary) 0%, #2D5F8D 100%)', 
                            borderRadius: '50px', 
                            margin: '0 auto 24px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            color: 'white',
                            boxShadow: '0 4px 16px rgba(52, 109, 151, 0.3)'
                        }}>
                            <Settings size={50} />
                        </div>
                        <h2 style={{ marginBottom: '8px', fontSize: '24px', fontWeight: '700' }}>חשבון מנהל</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '40px', fontSize: '15px' }}>אבי שושה - הגדרות מערכת</p>
                        <button 
                            className="pill-button" 
                            style={{ 
                                background: '#FEE', 
                                color: '#E74C3C',
                                fontWeight: '600',
                                padding: '16px 40px',
                                boxShadow: '0 2px 12px rgba(231, 76, 60, 0.2)'
                            }} 
                            onClick={() => window.location.reload()}
                        >
                            התנתק מהמערכת
                        </button>
                    </div>
                )}
            </div>

            <div className="bottom-nav-container" style={{
                background: '#FFF',
                borderTop: '1px solid #F0F0F0',
                padding: '8px 0',
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                boxShadow: '0 -2px 12px rgba(0,0,0,0.05)'
            }}>
                <div 
                    className={`nav-tab ${tab === 'schedule' ? 'active' : ''}`} 
                    onClick={() => setTab('schedule')}
                    style={{
                        padding: '12px 8px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                        color: tab === 'schedule' ? 'var(--primary)' : '#999',
                        transition: 'all 0.2s'
                    }}
                >
                    <CalendarIcon size={24} />
                    <span style={{ fontSize: '12px', fontWeight: '600' }}>לוח זמנים</span>
                </div>
                <div 
                    className={`nav-tab ${tab === 'availability' ? 'active' : ''}`} 
                    onClick={() => setTab('availability')}
                    style={{
                        padding: '12px 8px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                        color: tab === 'availability' ? 'var(--primary)' : '#999',
                        transition: 'all 0.2s'
                    }}
                >
                    <Clock size={24} />
                    <span style={{ fontSize: '12px', fontWeight: '600' }}>זמינות</span>
                </div>
                <div 
                    className={`nav-tab ${tab === 'clients' ? 'active' : ''}`} 
                    onClick={() => setTab('clients')}
                    style={{
                        padding: '12px 8px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                        color: tab === 'clients' ? 'var(--primary)' : '#999',
                        transition: 'all 0.2s'
                    }}
                >
                    <Users size={24} />
                    <span style={{ fontSize: '12px', fontWeight: '600' }}>לקוחות</span>
                </div>
                <div 
                    className={`nav-tab ${tab === 'profile' ? 'active' : ''}`} 
                    onClick={() => setTab('profile')}
                    style={{
                        padding: '12px 8px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                        color: tab === 'profile' ? 'var(--primary)' : '#999',
                        transition: 'all 0.2s'
                    }}
                >
                    <User size={24} />
                    <span style={{ fontSize: '12px', fontWeight: '600' }}>פרופיל</span>
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
        <div className="mobile-frame" style={{ 
            height: '100vh', 
            display: 'flex', 
            flexDirection: 'column',
            maxWidth: '430px',
            margin: '0 auto',
            boxShadow: '0 0 40px rgba(0,0,0,0.1)'
        }}>
            <StatusBar />
            
            <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
                <AnimatePresence mode="wait">
                    {isManager ? (  
                        <motion.div key="mgr" style={{ height: '100%' }}>
                            <ManagerView users={users} appointments={appointments} blockedSlots={blockedSlots} toggleBlock={toggleBlock} />
                        </motion.div>
                    ) : screen === 'welcome' ? (
                        <motion.div key="welcome" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ height: '100%'}}>
                            <WelcomeScreen onStart={() => setScreen('register')} />
                        </motion.div>
                    ) : screen === 'register' ? (
                        <motion.div key="reg" initial={{ x: 430 }} animate={{ x: 0 }} exit={{ x: -430 }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} style={{ height: '100%'}}>
                            <RegisterScreen onRegister={handleRegister} />
                        </motion.div>
                    ) : (
                        <motion.div key="main" initial={{ x: 430 }} animate={{ x: 0 }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ flex: 1, overflow: 'hidden' }}>
                                {tab === 'booking' && <BookingFlow user={user} blockedSlots={blockedSlots} onBook={handleBook} />}
                                {tab === 'my_apps' && (
                                    <div className="screen-container" style={{ padding: 0, background: '#FAFAFA', height: '100%' }}>
                                        <HeaderLogo size="small" />
                                         <div style={{ padding: '0 20px 20px' }}>
                                            <h2 className="section-title" style={{ fontSize: '24px', fontWeight: '700', marginBottom: '20px' }}>התורים שלי</h2>
                                            {appointments.filter(a => a.client.phone === user.phone).map((ap, i) => (
                                                <div key={i} className="card" style={{
                                                    background: '#FFF',
                                                    borderRadius: '16px',
                                                    padding: '20px',
                                                    marginBottom: '12px',
                                                    boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
                                                }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                                        <span style={{ fontSize: '24px' }}>{ap.service.icon}</span>
                                                        <p style={{ fontWeight: '700', textAlign: 'right', fontSize: '17px' }}>{ap.service.name}</p>
                                                    </div>
                                                    <p style={{ fontSize: '14px', color: 'var(--text-muted)', textAlign: 'right' }}>
                                                        {ap.barber.name} | {ap.time}
                                                    </p>
                                                </div>
                                            ))}
                                            {appointments.filter(a => a.client.phone === user.phone).length === 0 && (
                                                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                                                    <Clock size={60} color="#DDD" style={{ margin: '0 auto 16px' }} />
                                                    <p style={{ color: '#AAA', fontSize: '16px' }}>אין תורים עתידיים</p>
                                                </div>
                                            )}
                                         </div>
                                    </div>
                                )}
                                {tab === 'profile' && (
                                    <div className="screen-container" style={{ padding: 0, background: '#FAFAFA', height: '100%' }}>
                                        <HeaderLogo size="small" />
                                        <div style={{ padding: '40px 24px', textAlign: 'center' }}>
                                            <div style={{ 
                                                width: '90px', 
                                                height: '90px', 
                                                background: user.gender === 'female' ? 'var(--female-color)' : 'var(--male-color)', 
                                                borderRadius: '45px', 
                                                margin: '0 auto 20px', 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                justifyContent: 'center', 
                                                color: 'white',
                                                boxShadow: '0 4px 16px rgba(0,0,0,0.15)'
                                            }}>
                                                <User size={45} />
                                            </div>
                                            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>{user.name}</h2>
                                            <p style={{ color: 'var(--text-muted)', marginBottom: '40px', fontSize: '15px' }}>{user.phone}</p>
                                            
                                            <ExternalLinks />

                                            <button 
                                                className="pill-button" 
                                                onClick={() => { localStorage.clear(); window.location.reload(); }} 
                                                style={{ 
                                                    background: '#F5F5F7', 
                                                    color: '#333',
                                                    fontWeight: '600',
                                                    padding: '16px 40px',
                                                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                                                }}
                                            >
                                                {STRINGS[user.gender].logout}
                                            </button>

                                            <p style={{ fontSize: '10px', color: '#CCC', cursor: 'pointer', marginTop: '30px' }} onClick={() => setIsManager(true)}>ניהול</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="bottom-nav-container" style={{
                                background: '#FFF',
                                borderTop: '1px solid #F0F0F0',
                                padding: '8px 0',
                                display: 'grid',
                                gridTemplateColumns: 'repeat(3, 1fr)',
                                boxShadow: '0 -2px 12px rgba(0,0,0,0.05)'
                            }}>
                                <div 
                                    className={`nav-tab ${tab === 'booking' ? 'active' : ''}`} 
                                    onClick={() => setTab('booking')}
                                    style={{
                                        padding: '12px 8px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '6px',
                                        cursor: 'pointer',
                                        color: tab === 'booking' ? 'var(--primary)' : '#999',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <Calendar size={24} />
                                    <span style={{ fontSize: '12px', fontWeight: '600' }}>{STRINGS[user.gender].bookTitle}</span>
                                </div>
                                <div 
                                    className={`nav-tab ${tab === 'my_apps' ? 'active' : ''}`} 
                                    onClick={() => setTab('my_apps')}
                                    style={{
                                        padding: '12px 8px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '6px',
                                        cursor: 'pointer',
                                        color: tab === 'my_apps' ? 'var(--primary)' : '#999',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <Clock size={24} />
                                    <span style={{ fontSize: '12px', fontWeight: '600' }}>התורים שלי</span>
                                </div>
                                <div 
                                    className={`nav-tab ${tab === 'profile' ? 'active' : ''}`} 
                                    onClick={() => setTab('profile')}
                                    style={{
                                        padding: '12px 8px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '6px',
                                        cursor: 'pointer',
                                        color: tab === 'profile' ? 'var(--primary)' : '#999',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <User size={24} />
                                    <span style={{ fontSize: '12px', fontWeight: '600' }}>פרופיל</span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}