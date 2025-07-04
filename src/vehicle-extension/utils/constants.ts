import type {IMessages, IPageSelectors} from "../types/content.ts";

export const pageSelectors: IPageSelectors = {
    progressBarSelector: "[id*=\"mxui_widget_Progress\"]",
    vehiclePlateNumberAndChassisNumberRadioButtonSelector: "[id*=\"_MyVehicleMyPlate.radioButtons\"] > div.radio",
    vehiclePlateNumberTextFieldSelector: "input[id*='MyVehicleMyPlate.textBox1']",
    chassisNumberTextFieldSelector: "input[id*='MyVehicleMyPlate.textBox2']",
    submitButtonSelector: ".buttongroup button",
    headingSelector: "div.header-title > h1",
    chassisNumberResultSelector: "div[id*='mxui_widget_Wrapper'] > div[class*=\"mx-name-container\"] label[id*=\"MyVehicleMyPlate.label\"]",
    numberPlateResultSelector: "[id*=\"mxui_widget_Wrapper\"]  div[class*=\"mx-dataview-content\"] span",
    languageSelection: "div.language-selection > button",
    dateSelector: "input[name='carConfiguration.dateOfRegistration']"
};

export const fillTheCaptchaAlertMessage: IMessages = {
    nl: "Captcha gedetecteerd. Los de captcha op.",
    fr: "Captcha détecté. Veuillez résoudre le captcha.",
    de: "Captcha erkannt. Bitte lösen Sie das Captcha.",
    en: 'Captcha detected. Please solve the captcha.',
};

export const captchaTimeoutAlertMessage: IMessages = {
    nl: "Time-out: Probeer het later opnieuw...",
    fr: "Délai d'expiration : réessayez plus tard...",
    de: "Zeitüberschreitung: Versuchen Sie es später noch einmal ...",
    en: "Time out: Try again later..."
};

type TBUTTON_TRANSLATIONS = {
    nl: string;
    fr: string;
    de: string;
    en: string;
};

export const BUTTON_TRANSLATIONS: TBUTTON_TRANSLATIONS = {
    nl: "Gegevens sloopauto",
    fr: "détails de la voiture de ferraille",
    de: "Details zum Schrottauto",
    en: "Scrap Car Details",
};

export const MOBIFORMS_URL: string = "https://myvehiclemyplate.mobilit.fgov.be";

export function getDateAccordingToDefaultLanguage() {
    const language = navigator.language
    switch (language) {
        case 'nl':
            return 'datumEersteInschrijving';
        case 'fr':
            return 'dateDeLaPremièreImmatriculation';
        case 'de':
            return 'datumDerErstzulassung';
        default:
            return 'dateOfFirstRegistration';
    }
}