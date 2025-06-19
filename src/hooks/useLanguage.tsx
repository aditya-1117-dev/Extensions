import { BUTTON_TRANSLATIONS } from "../utils/constants.ts";

export const useLanguage = () => {
    const getButtonText = (): string => {
        const browserLanguage = navigator.language.slice(0, 2) as keyof typeof BUTTON_TRANSLATIONS;
        return BUTTON_TRANSLATIONS[browserLanguage] || BUTTON_TRANSLATIONS.en;
    };
    return { getButtonText };
};