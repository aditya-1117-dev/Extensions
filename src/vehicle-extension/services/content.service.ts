import {ChromeService} from './chrome.service.ts';
import type {IMessages, IPageSelectors} from "../types/content";
import type {IVehicleData} from "../types/chrome";
import {waitForElements, waitForProgressBarCompletion} from "../utils/dom.utils.ts";

class ContentService {
    private readonly pageSelectors: IPageSelectors = {
        progressBarSelector: "[id*=\"mxui_widget_Progress\"]",
        licensePlateNumberAndChassisNumberRadioButtonSelector: "[id*=\"MobiformsModule.MyVehicleMyPlate_Page.radioButtons1_\"] > div.radio",
        licensePlateNumberTextFieldSelector: "MobiformsModule.MyVehicleMyPlate_Page.textBox1_",
        chassisNumberTextFieldSelector: "MobiformsModule.MyVehicleMyPlate_Page.textBox2_",
        submitButtonSelector: "#mxui_widget_Wrapper_18 > button",
        headingSelector: "#mxui_widget_Wrapper_6 > h1",
        chassisNumberResultSelector: "div.mx-dataview-content > div[class*=\"mx-name-container\"] label[id*=\"MobiformsModule.MyVehicleMyPlate_Page.label\"]",
        numberPlateResultSelector: "[id*=\"mxui_widget_Wrapper\"]  div[class*=\"mx-dataview-content\"] span",
        languageSelection: "div.language-selection > button"
    };

    private readonly fillTheCaptchaAlertMessage: IMessages = {
        nl: "Captcha gedetecteerd. Los de captcha op.",
        fr: "Captcha détecté. Veuillez résoudre le captcha.",
        de: "Captcha erkannt. Bitte lösen Sie das Captcha.",
        en: 'Captcha detected. Please solve the captcha.',
    };

    private readonly captchaTimeoutAlertMessage: IMessages = {
        nl: "Time-out: Probeer het later opnieuw...",
        fr: "Délai d'expiration : réessayez plus tard...",
        de: "Zeitüberschreitung: Versuchen Sie es später noch einmal ...",
        en: "Time out: Try again later..."
    };

    // Fix the waitForElements method to properly return Element[]
    private async waitForElements(
        selector: string,
        options: { timeout?: number } = {}
    ): Promise<Element[]> {
        return new Promise((resolve, reject) => {
            const elements = document.querySelectorAll(selector);
            if (elements.length) return resolve(Array.from(elements));

            const timeout = options.timeout || 30000;
            const timeoutId = setTimeout(() => {
                observer.disconnect();
                reject(new Error(`Timeout waiting for elements: ${selector}`));
            }, timeout);

            const observer = new MutationObserver(() => {
                const foundElements = document.querySelectorAll(selector);
                if (foundElements.length) {
                    clearTimeout(timeoutId);
                    observer.disconnect();
                    resolve(Array.from(foundElements));
                }
            });

            observer.observe(document.body, {childList: true, subtree: true});
        });
    }

    private convertToCamelCase(value: string): string {
        value = value.trim()
        // value = (value as String).replaceAll(':', '')
        value = value.replace(/:/g, '');

        return value.split(' ').reduce((acc, cur) => {
            if (!this.isSpecialChar(cur)) {
                acc += (cur.substring(0, 1).toUpperCase() + cur.substring(1).toLowerCase())
            }
            return acc.substring(0, 1).toLowerCase() + acc.substring(1)
        }, "")
    }

    // DOM Utilities
    private isVisible(element: HTMLElement | null): boolean {
        return !!(element?.offsetWidth || element?.offsetHeight || element?.getClientRects().length);
    }

    private isSpecialChar(str: string): boolean {
        const specialChars = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
        return specialChars.test(str);
    }

    private simulateHumanTyping(input: HTMLInputElement, value: string): void {
        input.focus();
        input.value = value;
        input.dispatchEvent(new Event("input", {bubbles: true}));
        input.dispatchEvent(new Event("change", {bubbles: true}));
        input.blur();
    }

    private simulateButtonClick(button: HTMLElement): void {
        button.dispatchEvent(new MouseEvent("mouseover", {bubbles: true}));
        button.dispatchEvent(new MouseEvent("mousedown", {bubbles: true}));
        button.dispatchEvent(new MouseEvent("mouseup", {bubbles: true}));
        button.click();
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private getAlertMessageAccordingToLanguage(alertMessageObject: AlertMessages): string {
        const browserDefaultLanguage = navigator.language.slice(0, 2);
        return alertMessageObject[browserDefaultLanguage as keyof AlertMessages] || alertMessageObject.en;
    }

    private async getVehicleData(): Promise<IVehicleData> {
        const response = await ChromeService.sendRuntimeMessage("getVehicleNumber");
        return response.data;
    }

    private async storeData(key: string, result: any): Promise<void> {
        console.log(`Storing data for key: ${key}`, result);

        if (key === "error") {
            await ChromeService.sendRuntimeMessage("closeTab", {data: {error: result}});
            return;
        }

        await ChromeService.sendRuntimeMessage(key === "logs" ? "logs" : "storeData", {
            dataAccessKey: key,
            [key]: result
        });

        if (key === "vehicleDetails" && result && Object.keys(result).length > 0) {
            await ChromeService.sendRuntimeMessage("closeTab");
        }
    }

    public async initialize(): Promise<void> {
        console.log("Content script initialized");

        const languageChangeOrNot = await ChromeService.sendRuntimeMessage("checkLanguageChangeOrNot");
        await this.delay(2000);

        if (languageChangeOrNot) {

            waitForElements(
                this.pageSelectors.progressBarSelector,
                () => waitForProgressBarCompletion(
                    this.pageSelectors.progressBarSelector,
                    async () => {
                        setTimeout(async () => {
                            await this.proceedFurtherAfterHeadingVisible()
                        }, 3000)
                    }
                ),
                false
            )
        } else {
            setTimeout(async () => {
                await this.proceedFurtherAfterHeadingVisible();
            }, 3000)
        }
    }

    // private async waitForElements(
    //     selector: string,
    //     callback: (elements: Element[]) => void,
    //     options: { timeout?: number } = {}
    // ): Promise<void> {
    //     return new Promise((resolve, reject) => {
    //         const elements = document.querySelectorAll(selector);
    //         if (elements.length) {
    //             callback(Array.from(elements));
    //             return resolve();
    //         }
    //
    //         const timeout = options.timeout || 30000; // 30 seconds default timeout
    //         const timeoutId = setTimeout(() => {
    //             observer.disconnect();
    //             reject(new Error(`Timeout waiting for elements: ${selector}`));
    //         }, timeout);
    //
    //         const observer = new MutationObserver(() => {
    //             const foundElements = document.querySelectorAll(selector);
    //             if (foundElements.length) {
    //                 clearTimeout(timeoutId);
    //                 observer.disconnect();
    //                 callback(Array.from(foundElements));
    //                 resolve();
    //             }
    //         });
    //
    //         observer.observe(document.body, { childList: true, subtree: true });
    //     });
    // }

    // private waitForProgressBarCompletion(callback: () => void): void {
    //     const observer = new MutationObserver(() => {
    //         const progressBar = document.querySelector(this.pageSelectors.progressBarSelector);
    //         if (!progressBar) {
    //             observer.disconnect();
    //             callback();
    //         }
    //     });
    //
    //     observer.observe(document.body, {childList: true, subtree: true});
    // }

    private async chooseNumberPlateNumberAndChassisNumberButtonAndFillData(): Promise<void> {
        const {numberPlateNumber, chassisNumber} = await this.getVehicleData();
        await this.storeData("logs", "at input filling option");

        const vehicleTypeRadioButtons = await this.waitForElements(
            this.pageSelectors.licensePlateNumberAndChassisNumberRadioButtonSelector
        );

        if (!vehicleTypeRadioButtons.length) {
            await this.storeData("logs", "not getting input radio buttons");
            return;
        }

        if (numberPlateNumber) {
            const numberPlateRadioInput = vehicleTypeRadioButtons[1].querySelector("input");
            if (numberPlateRadioInput) {
                this.simulateButtonClick(numberPlateRadioInput);
                await this.logAndStore("radio button clicked");

                const textFields = await this.waitForElements(
                    `input[id*="${this.pageSelectors.licensePlateNumberTextFieldSelector}"]`
                );
                await this.delay(1000);
                this.simulateHumanTyping(textFields[0] as HTMLInputElement, numberPlateNumber);
                await this.logAndStore("input field has been filled");
            }
        } else if (chassisNumber) {
            const chassisRadioInput = vehicleTypeRadioButtons[2].querySelector("input");
            if (chassisRadioInput) {
                this.simulateButtonClick(chassisRadioInput);
                await this.logAndStore("chassis number radio button");

                const textFields = await this.waitForElements(
                    `input[id*="${this.pageSelectors.chassisNumberTextFieldSelector}"]`
                );
                await this.delay(1000);
                this.simulateHumanTyping(textFields[0] as HTMLInputElement, chassisNumber);
                await this.logAndStore("chassis number field has been filled");
            }
        } else {
            await ChromeService.sendRuntimeMessage("closeTab");
        }
    }

    private async findCaptchaAndAlertTheUser(): Promise<void> {
        const submitButton = document.querySelectorAll(this.pageSelectors.submitButtonSelector)[1];
        const alertMessage = this.getAlertMessageAccordingToLanguage(this.fillTheCaptchaAlertMessage)
        console.log(submitButton)

        if (!submitButton) {
            await this.logAndStore("captcha find")
            console.log("Captcha detected");
            alert(alertMessage)
        }
    }

    private async findSubmitButtonAndClick(): Promise<boolean> {
        try {
            const submitButton = document.querySelector<HTMLButtonElement>(this.pageSelectors.submitButtonSelector);

            await this.logAndStore("captcha filled")

            if (!submitButton) {

                for (let i = 0; i < 60; i++) {

                    const submitButtonAppears = document.querySelector(this.pageSelectors.submitButtonSelector);
                    console.log(i, submitButtonAppears, submitButtonAppears?.children, "pending")

                    if (submitButtonAppears) {
                        console.log("CAPTCHA solved");
                        await this.delay(2000)

                        const resultButton = document.querySelector<HTMLButtonElement>("#mxui_widget_Wrapper_18 > button")
                        if (resultButton) {
                            resultButton.click()
                            await this.logAndStore("submit button clicked")
                            await this.delay(1000)
                            return true;
                        }
                    }

                    await this.delay(1000);
                }

                await this.storeData("error", "captcha is not solved on time")
            } else {
                submitButton.click();
                return true
            }
            return false
        } catch (error) {
            console.log("Failed to find/submit button", error);
            return false;
        }
    }

    private async getResult(): Promise<boolean> {

        const {numberPlateNumber, chassisNumber} = await this.getVehicleData();

        console.log(numberPlateNumber, chassisNumber);

        let result;

        if (numberPlateNumber) {
            result = document.querySelector(this.pageSelectors.numberPlateResultSelector)
        } else if (chassisNumber) {
            result = document.querySelectorAll(this.pageSelectors.chassisNumberResultSelector).length
        }

        if (!result) {
            await this.storeData("logs", "result is not getting")
            return false
        }

        if (numberPlateNumber) {
            const result = document.querySelector(this.pageSelectors.numberPlateResultSelector)?.textContent

            if (result) {
                await this.logAndStore("result is get")
                const match = result?.match(/\b\d{2}\/\d{2}\/\d{4}\b/g)
                const dataFromResult = match ? match[0] : null;

                console.log(dataFromResult)

                await this.storeData("vehicleDetails", dataFromResult)
            }

        } else if (chassisNumber) {
            const result = Array.from(document.querySelectorAll(this.pageSelectors.chassisNumberResultSelector)).map((element) =>
                [this.convertToCamelCase(element.textContent ?? ""),
                    (element?.nextElementSibling?.textContent) ? element.nextElementSibling.textContent : ""])

            if (result.length && result[0].length) {
                await this.logAndStore("result has some fields")

                const resultObject: { [key: string]: string } = {}

                for (const item of result) {
                    resultObject[item[0]] = item[1]?.trim()
                }

                console.log(resultObject)

                await this.storeData("vehicleDetails", resultObject)
            }
        }

        return true

    }

    private async copyDataToClipboardAndAskUserToFillDetails(): Promise<void> {
        const {numberPlateNumber, chassisNumber} = await this.getVehicleData();
        const vehicleNumber = numberPlateNumber || chassisNumber || '';

        const askUserToFillDetailsAlertMessage = {
            nl: `Uw voertuignummer: ${vehicleNumber} gekopieerd naar uw klembord. Probeer de gegevens handmatig in te vullen door uw voertuignummer in het invoerveld te gebruiken.`,
            fr: `Votre numéro de véhicule : ${vehicleNumber} copié dans votre presse-papiers, Veuillez essayer de remplir les détails manuellement en utilisant votre numéro de véhicule dans la saisie`,
            de: `Ihre Fahrzeugnummer: ${vehicleNumber} wurde in Ihre Zwischenablage kopiert. Bitte versuchen Sie, die Angaben manuell einzugeben, indem Sie Ihre Fahrzeugnummer in das Eingabefeld eingeben.`,
            en: `Your vehicle number: ${vehicleNumber} copied to your clipboard, Please try to fill the details manually by using your vehicle number in the input`
        };

        const alertMessage = this.getAlertMessageAccordingToLanguage(askUserToFillDetailsAlertMessage);
        alert(alertMessage);

        try {
            await navigator.clipboard.writeText(vehicleNumber);
        } catch (error) {
            console.log("Failed to copy to clipboard", error);
        }
    }

    private async proceedFurtherAfterHeadingVisible(): Promise<void> {
        const heading = document.querySelector(this.pageSelectors.headingSelector);
        if (!this.isVisible(heading as HTMLElement)) return;

        const pageRefreshOrNot = await ChromeService.sendRuntimeMessage("checkPageRefreshOrNot");

        if (pageRefreshOrNot) {
            const captchaFilledOrNot = await this.findSubmitButtonAndClick();
            if (captchaFilledOrNot) {
                await this.delay(2000);
                const resultAppearOrNot = await this.getResult();
                if (!resultAppearOrNot) {
                    await ChromeService.sendRuntimeMessage("closeTab");
                }
            }
        } else {
            await this.chooseNumberPlateNumberAndChassisNumberButtonAndFillData();
            await this.delay(1500);
            await this.findCaptchaAndAlertTheUser();

            const captchaFilledOrNot = await this.findSubmitButtonAndClick();
            if (!captchaFilledOrNot) {
                const alertMessage = this.getAlertMessageAccordingToLanguage(this.captchaTimeoutAlertMessage);
                alert(alertMessage);
                await ChromeService.sendRuntimeMessage("pageRefresh");
            } else {
                await this.delay(2000);
                const resultAppearOrNot = await this.getResult();
                if (!resultAppearOrNot) {
                    await this.copyDataToClipboardAndAskUserToFillDetails();
                    await ChromeService.sendRuntimeMessage("pageRefresh");
                }
            }
        }
    }

    private async logAndStore(message: string): Promise<void> {
        console.log(message);
        await this.storeData("logs", message);
    }
}

export const contentService = new ContentService();
