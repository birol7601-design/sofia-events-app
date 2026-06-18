import { NavLink } from 'react-router-dom';

const NAV = [
  { to: '/saved',      icon: '🔖', label: 'Saved'      },
  { to: '/messages',   icon: '💬', label: 'Messages'   },
  { to: '/',           icon: '🏠', label: 'Home', exact: true },
  { to: '/organizer',  icon: '🎭', label: 'Organizers' },
  { to: '/profile',    icon: '👤', label: 'Profile'    },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-primary/20">
      <div className="flex items-stretch max-w-lg mx-auto">
        {NAV.map(({ to, icon, label, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors duration-150 ${
                isActive ? 'text-primaryLight' : 'text-textMuted'
              }`
            }
          >
            <span className="text-lg leading-none">{icon}</span>
            <span className="font-body">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
