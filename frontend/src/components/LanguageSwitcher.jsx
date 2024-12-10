import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex space-x-2">
      <button
        className={`px-2 py-1 rounded ${
          i18n.language === 'de' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
        }`}
        onClick={() => changeLanguage('de')}
      >
        DE
      </button>
      <button
        className={`px-2 py-1 rounded ${
          i18n.language === 'en' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
        }`}
        onClick={() => changeLanguage('en')}
      >
        EN
      </button>
    </div>
  );
};

export default LanguageSwitcher;
