import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { apiGet } from '../lib/api';
import { isLoggedIn } from '../lib/auth';
import Logo from './Logo';

const NAV = [
  { to: '/saved',     emoji: '🔖', label: 'Saved'      },
  { to: '/messages',  emoji: '💬', label: 'Messages', hasUnread: true },
  { to: '/',          emoji: null,  label: 'Home', exact: true, center: true },
  { to: '/organizer', emoji: '🎭', label: 'Orgs'       },
  { to: '/profile',   emoji: '👤', label: 'Profile'    },
];

function HexIcon({ emoji, active }) {
  return (
    <div
      style={{
        width: 30, height: 34,
        clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
        background: active
          ? 'radial-gradient(ellipse 80% 140% at 35% 20%, #FFE45C 0%, #FFB800 55%, #C46A00 100%)'
          : 'rgba(138,123,74,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 13,
        transition: 'background 0.22s ease',
      }}
    >
      <span style={{
        opacity: active ? 1 : 0.55,
        filter: active ? 'drop-shadow(0 0 4px rgba(255,184,0,0.7))' : 'none',
        transition: 'filter 0.22s ease, opacity 0.22s ease',
      }}>
        {emoji}
      </span>
    </div>
  );
}

export default function BottomNav() {
  const location = useLocation();
  const [unread, setUnread] = useState(false);

  useEffect(() => {
    if (!isLoggedIn()) return;
    apiGet('/api/messages/unread-count')
      .then(d => setUnread(d?.count > 0))
      .catch(() => {});
  }, [location.pathname]);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: 'rgba(10,6,0,0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,184,0,0.2)',
        boxShadow: '0 -4px 30px rgba(0,0,0,0.5)',
      }}
    >
      <div className="flex items-end max-w-lg mx-auto">
        {NAV.map(({ to, emoji, label, exact, center, hasUnread }) => {
          const isActive = exact
            ? location.pathname === to
            : location.pathname.startsWith(to) && to !== '/';
          const isHome = exact && to === '/';
          const active = isHome ? location.pathname === '/' : isActive;

          return (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className="flex-1 flex flex-col items-center relative"
            >
              {center ? (
                /* Home — elevated juicy-hex with Logo */
                <motion.div
                  className="mb-1.5 flex items-center justify-center"
                  style={{
                    transform: 'translateY(-10px)',
                    filter: active
                      ? 'drop-shadow(0 0 18px rgba(196,106,0,.75))'
                      : 'drop-shadow(0 2px 6px rgba(0,0,0,0.5))',
                    transition: 'filter 0.25s ease',
                  }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Logo size={52} bob />
                </motion.div>
              ) : (
                <div className="relative flex flex-col items-center py-2 w-full">
                  {/* Active background indicator */}
                  {active && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute inset-x-1 top-1 bottom-1 rounded-xl"
                      style={{ background: 'rgba(255,184,0,0.08)' }}
                      transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                    />
                  )}

                  <div className="relative mb-0.5">
                    <HexIcon emoji={emoji} active={active} />
                    {/* Unread dot */}
                    {hasUnread && unread && (
                      <span
                        className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full"
                        style={{ background: '#FF6B35', boxShadow: '0 0 6px rgba(255,107,53,0.8)' }}
                      />
                    )}
                  </div>
                  <span
                    className="relative text-[10px] font-medium font-body"
                    style={{ color: active ? '#FFB800' : '#8A7B4A' }}
                  >
                    {label}
                  </span>
                </div>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
