import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';

interface LanguageToggleProps {
  className?: string;
}

const LanguageToggle: React.FC<LanguageToggleProps> = ({ className = '' }) => {
  const { language, setLanguage, t } = useLanguage();

  const handleToggle = () => {
    setLanguage(language === 'bn' ? 'en' : 'bn');
  };

  return (
    <button
      onClick={handleToggle}
      className={`
        flex items-center gap-2 px-3 py-2 rounded-full
        bg-white/15 backdrop-blur-sm border border-white/25
        hover:bg-white/25 transition-all duration-300
        text-white hover:text-white transform hover:scale-105
        shadow-lg hover:shadow-xl
        ${className}
      `}
      aria-label={t('toggle-language', 'ভাষা পরিবর্তন করুন', 'Toggle Language')}
    >
      <div className="relative">
        <Globe size={16} />
        {/* Subtle weaving pattern around globe */}
        <div className="absolute inset-0 opacity-30">
          <svg className="w-full h-full" viewBox="0 0 16 16">
            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="0.2" fill="none" strokeDasharray="1,1"/>
          </svg>
        </div>
      </div>
      <span className="text-sm font-medium">
        {language === 'bn' ? 'En' : 'বাং'}
      </span>
    </button>
  );
};

export default LanguageToggle;