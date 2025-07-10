import {ChromeService} from './chrome.ts';
import {
    delay,
    waitForElements,
    waitForProgressBarCompletion
} from '../utils/dom.ts';
import {pageSelectors} from "../utils/constants.ts";

export class LanguageService {
    public async initialize(): Promise<void> {
        console.log("language choose script is running...");
        if(navigator.language === 'en') await ChromeService.sendRuntimeMessage("noChangeInLanguage");
        else await this.setupLanguageDetection();
    }

    private async setupLanguageDetection(): Promise<void> {
        waitForElements(
            pageSelectors.progressBarSelector,
            () => this.handleProgressBar(),
            false
        );
    }

    private async handleProgressBar(): Promise<void> {
        waitForProgressBarCompletion(
            pageSelectors.progressBarSelector,
            async () => {
                await delay(2000);
                await this.checkHeadingAndSelectLanguage();
            }
        );
    }

    private async checkHeadingAndSelectLanguage(): Promise<void> {
        const heading = document.querySelector(pageSelectors.headingSelector);
        console.log("progress bar is erased");
        console.log(heading);

        await this.clickOnUserDefaultLanguage();
    }

    private async chooseLanguage(languageButton: HTMLButtonElement) {
        languageButton.click();
        await ChromeService.sendRuntimeMessage("changeLanguage");
    }

    private async chooseDefaultLanguage() {
        await ChromeService.sendRuntimeMessage("noChangeInLanguage");
    }

    private async clickOnUserDefaultLanguage(): Promise<void> {

        waitForElements(
            pageSelectors.languageSelection,
            async () => {
                const defaultLanguage = navigator.language;
                const languageButtons = document.querySelectorAll<HTMLButtonElement>(pageSelectors.languageSelection);
                console.log("button clicked", languageButtons[1], languageButtons[0], defaultLanguage);

                await delay(3000);

                switch (defaultLanguage) {
                    case 'nl':
                        await this.chooseLanguage(languageButtons[0])
                        break;

                    case 'fr':
                        await this.chooseLanguage(languageButtons[1])
                        break;

                    case 'de':
                        await this.chooseLanguage(languageButtons[2])
                        break;

                    default:
                        await this.chooseDefaultLanguage()
                        break;
                }
            }
        );
    }
}