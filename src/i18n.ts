import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from '../public/locales/en/common.json';
import zh from '../public/locales/zh/common.json';
import sv from '../public/locales/sv/common.json';

const resources = {
    en: { common: en },
    zh: { common: zh },
    sv: { common: sv },
};

if (!i18n.isInitialized) {
    i18n
        .use(initReactI18next)
        .init({
            resources,
            lng: 'en',
            fallbackLng: 'en',
            ns: ['common'],
            defaultNS: 'common',
            interpolation: { escapeValue: false },
        });
}

export default i18n;
