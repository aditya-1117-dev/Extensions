import { ChromeService } from './chrome.service.ts';
import {
    delay,
    waitForElements,
    waitForProgressBarCompletion
} from '../utils/dom.utils.ts';

interface IPageSelectors {
    progressBarSelector: string;
    headingSelector: string;
    languageSelection: string;
}

class LanguageService {
    private readonly pageSelectors : IPageSelectors = {
        progressBarSelector: '[id*="mxui_widget_Progress"]',
        headingSelector: '#mxui_widget_Wrapper_6 > h1',
        languageSelection: 'div.language-selection > button',
    }

    public async initialize(): Promise<void> {
        console.log("language choose script is running...");
        await this.setupLanguageDetection();
    }

    private async setupLanguageDetection(): Promise<void> {
        waitForElements(
            this.pageSelectors.progressBarSelector,
            () => this.handleProgressBar(),
            false
        );
    }

    private async handleProgressBar(): Promise<void> {
        waitForProgressBarCompletion(
            this.pageSelectors.progressBarSelector,
            async () => {
                setTimeout(async () => {
                    await this.checkHeadingAndSelectLanguage();
                }, 2000)
            }
        );
    }

    private async checkHeadingAndSelectLanguage(): Promise<void> {
        const heading = document.querySelector(this.pageSelectors.headingSelector);
        console.log("progress bar is erased");
        console.log(heading);

        if (this.isVisible(heading)) {
            await this.clickOnUserDefaultLanguage();
        }
    }

    private isVisible(element: Element | null): boolean {
        console.log(element);
        return true;
    }

    private async clickOnUserDefaultLanguage(): Promise<void> {
        waitForElements(
            this.pageSelectors.languageSelection,
            async () => {
                const defaultLanguage = navigator.language;
                const languageButtons = document.querySelectorAll<HTMLButtonElement>(this.pageSelectors.languageSelection);
                console.log("button clicked", languageButtons[1], languageButtons[0], defaultLanguage);

                await delay(3000);

                if (defaultLanguage === 'nl') {
                    languageButtons[0].click();
                    await ChromeService.sendRuntimeMessage("changeLanguage");
                } else if (defaultLanguage === 'fr') {
                    languageButtons[1].click();
                    await ChromeService.sendRuntimeMessage("changeLanguage");
                } else {
                    await ChromeService.sendRuntimeMessage("noChangeInLanguage");
                }
            },
            false
        );
    }
}

export const languageService = new LanguageService();