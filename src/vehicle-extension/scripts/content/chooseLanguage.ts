import {LanguageService} from "../../services/language.ts";

console.log("hii")

const languageService = new LanguageService()

languageService.initialize().catch(error => {
    console.error('Language script failed:', error);
});