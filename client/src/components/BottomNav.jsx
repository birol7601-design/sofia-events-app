import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { apiGet } from '../lib/api';
import { isLoggedIn } from '../lib/auth';

const NAV = [
  { to: '/saved',     icon: '🔖', label: 'Saved'      },
  { to: '/messages',  icon: '💬', label: 'Messages', hasUnread: true },
  { to: '/',          icon: '🏠', label: 'Home', exact: true, center: true },
  { to: '/organizer', icon: '🎭', label: 'Organizers' },
  { to: '/profile',   icon: '👤', label: 'Profile'    },
];

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
        background: 'rgba(13,10,26,0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(167,139,250,0.15)',
        boxShadow: '0 -4px 30px rgba(0,0,0,0.4)',
      }}
    >
      <div className="flex items-end max-w-lg mx-auto">
        {NAV.map(({ to, icon, label, exact, center, hasUnread }) => {
          const isActive =
            exact ? location.pathname === to : location.pathname.startsWith(to) && to !== '/';
          const isHome = exact && to === '/';
          const active = isHome ? location.pathname === '/' : isActive;

          return (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className="flex-1 flex flex-col items-center relative"
              style={{ paddingBottom: center ? 0 : undefined }}
            >
              {center ? (
                /* Home — elevated pill */
                <motion.div
                  className="flex flex-col items-center justify-center rounded-full mb-2"
                  style={{
                    width: 52, height: 52,
                    background: active
                      ? 'linear-gradient(135deg, #7C3AED, #EC4899)'
                      : 'rgba(30,24,56,0.9)',
                    border: '1px solid rgba(167,139,250,0.25)',
                    boxShadow: active ? '0 0 20px rgba(124,58,237,0.5)' : '0 2px 12px rgba(0,0,0,0.4)',
                    transform: 'translateY(-10px)',
                  }}
                  animate={{
                    boxShadow: active ? '0 0 24px rgba(124,58,237,0.6)' : '0 2px 12px rgba(0,0,0,0.4)',
                  }}
                  whileTap={{ scale: 0.9 }}
                >
                  <span style={{ fontSize: 22 }}>{icon}</span>
                </motion.div>
              ) : (
                <div className="relative flex flex-col items-center py-2.5 w-full">
                  {/* Active background indicator */}
                  {active && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute inset-x-1 top-1 bottom-1 rounded-xl"
                      style={{ background: 'rgba(124,58,237,0.15)' }}
                      transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                    />
                  )}

                  <span
                    className="relative text-xl leading-none mb-0.5 transition-all duration-200"
                    style={{
                      filter: active ? 'drop-shadow(0 0 6px rgba(167,139,250,0.7))' : 'none',
                      transform: active ? 'scale(1.12)' : 'scale(1)',
                    }}
                  >
                    {icon}
                    {/* Unread dot */}
                    {hasUnread && unread && (
                      <span
                        className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full"
                        style={{ background: '#EC4899', boxShadow: '0 0 6px rgba(236,72,153,0.8)' }}
                      />
                    )}
                  </span>
                  <span
                    className="relative text-[10px] font-medium font-body"
                    style={{ color: active ? '#A78BFA' : '#A39CC4' }}
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
