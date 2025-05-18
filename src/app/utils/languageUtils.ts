import { I18n } from "next-i18next";

// List of supported language codes and their language label in their native language
export function getSupportedLanguages() {
    const languageOptions = [
        { value: "en", label: "English" },
        { value: "zh", label: "简体中文" },
        { value: "sv", label: "Svenska" },
    ];
    return languageOptions;
}

export function setAppLanguage(languageCode: string, i18n: I18n) {
    i18n.changeLanguage(languageCode);
}