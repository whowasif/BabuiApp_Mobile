import React from 'react';
import { Home, Plus, MessageCircle, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';

const BottomNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  const navItems = [
    {
      id: 'home',
      icon: Home,
      label: t('home', 'হোম', 'Home'),
      path: '/',
      color: 'from-amber-500 to-orange-500'
    },
    {
      id: 'add-property',
      icon: Plus,
      label: t('add-property', 'সম্পত্তি যোগ করুন', 'Add Property'),
      path: '/add-property',
      color: 'from-green-500 to-emerald-500',
      isSpecial: true
    },
    {
      id: 'chat',
      icon: MessageCircle,
      label: t('chat', 'চ্যাট', 'Chat'),
      path: '/chat',
      color: 'from-blue-500 to-indigo-500'
    },
    {
      id: 'profile',
      icon: User,
      label: t('profile', 'প্রোফাইল', 'Profile'),
      path: '/profile',
      color: 'from-purple-500 to-pink-500'
    }
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-amber-200 shadow-2xl z-50">
      {/* Woven pattern at top */}
      <div className="h-1 bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-400 relative overflow-hidden">
        <div className="absolute inset-0 opacity-50">
          <svg className="w-full h-full" viewBox="0 0 100 10" preserveAspectRatio="none">
            <path d="M0,5 Q25,0 50,5 T100,5" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" fill="none"/>
          </svg>
        </div>
      </div>
      
      <div className="flex items-center justify-around py-3 px-4 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`
                flex flex-col items-center justify-center p-3 rounded-2xl
                transition-all duration-300 min-w-[70px] relative group
                ${active 
                  ? 'transform scale-110' 
                  : 'hover:scale-105'
                }
              `}
            >
              {/* Special nest-like design for Add Property */}
              {item.isSpecial ? (
                <div className={`
                  relative p-4 rounded-full shadow-xl
                  bg-gradient-to-br ${item.color}
                  transform transition-all duration-300
                  ${active ? 'scale-110 shadow-2xl' : 'group-hover:scale-105'}
                `}>
                  {/* Nest weaving pattern */}
                  <div className="absolute inset-0 rounded-full opacity-30">
                    <svg className="w-full h-full" viewBox="0 0 40 40">
                      <circle cx="20" cy="20" r="18" stroke="white" strokeWidth="0.5" fill="none" strokeDasharray="2,2"/>
                      <circle cx="20" cy="20" r="14" stroke="white" strokeWidth="0.3" fill="none" strokeDasharray="1,1"/>
                      <circle cx="20" cy="20" r="10" stroke="white" strokeWidth="0.2" fill="none" strokeDasharray="0.5,0.5"/>
                    </svg>
                  </div>
                  <Icon 
                    size={24} 
                    className="text-white relative z-10"
                    strokeWidth={2.5}
                  />
                  {/* Floating particles */}
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-300 rounded-full animate-pulse"></div>
                  <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-orange-300 rounded-full animate-pulse delay-500"></div>
                </div>
              ) : (
                <div className={`
                  p-3 rounded-xl transition-all duration-300 relative
                  ${active 
                    ? `bg-gradient-to-br ${item.color} text-white shadow-lg` 
                    : 'text-amber-600 hover:bg-amber-50'
                  }
                `}>
                  <Icon 
                    size={20} 
                    strokeWidth={active ? 2.5 : 2}
                  />
                  {/* Subtle weaving pattern for active items */}
                  {active && (
                    <div className="absolute inset-0 rounded-xl opacity-20">
                      <svg className="w-full h-full" viewBox="0 0 30 30">
                        <path d="M5,15 Q10,10 15,15 T25,15" stroke="white" strokeWidth="0.3" fill="none"/>
                        <path d="M15,5 Q20,10 25,5" stroke="white" strokeWidth="0.3" fill="none"/>
                        <path d="M5,25 Q10,20 15,25" stroke="white" strokeWidth="0.3" fill="none"/>
                      </svg>
                    </div>
                  )}
                </div>
              )}
              
              <span className={`
                text-xs mt-2 font-medium transition-all duration-300
                ${active 
                  ? 'text-amber-700 font-semibold' 
                  : 'text-amber-600'
                }
              `}>
                {item.label}
              </span>
              
              {/* Active indicator with organic shape */}
              {active && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                  <div className="w-6 h-1 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full"></div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;