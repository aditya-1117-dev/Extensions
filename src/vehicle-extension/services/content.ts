import {ChromeService} from './chrome.ts';
import {
    captchaTimeoutAlertMessage,
    fillTheCaptchaAlertMessage,
    pageSelectors
} from "../utils/constants.ts";
import type {IVehicleData} from "../types/chrome.ts";
import {
    convertToCamelCase,
    delay, getAlertMessageAccordingToLanguage, getElementsOnceVisible, isVisible,
    simulateHumanTyping, simulateInputClick,
    waitForElements,
    waitForProgressBarCompletion
} from "../utils/dom.ts";

export class ContentService {

    private async logAndStore(message: string): Promise<void> {
        console.log(message);
        await this.storeData("logs", message);
    }

    private async getVehicleData(): Promise<IVehicleData> {
        return (await ChromeService.sendRuntimeMessage("getVehicleNumber")).data;
    }

    private async storeData(key: string, result: string): Promise<void> {
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

    private async fillTheVehicleDetails(isChassisNumber: boolean, vehicleNumber: string, radioButtons: HTMLInputElement[]) {
        const radioButton = (!isChassisNumber) ?
            radioButtons[1]?.querySelector<HTMLInputElement>("input") :
            radioButtons[2]?.querySelector<HTMLInputElement>("input");

        if (radioButton) {
            simulateInputClick(radioButton);
            await this.logAndStore("radio button clicked");

            const textFields = (!isChassisNumber) ?
                await getElementsOnceVisible<HTMLInputElement>(pageSelectors.vehiclePlateNumberTextFieldSelector) :
                await getElementsOnceVisible<HTMLInputElement>(pageSelectors.chassisNumberTextFieldSelector);

            await delay(1000);
            simulateHumanTyping(textFields[0], vehicleNumber);
            await delay(1000);
            await this.logAndStore(`input field has been filled, ${textFields[0]?.value}`);
        }
    }

    private async chooseNumberPlateNumberAndChassisNumberButtonAndFillData(vehicleNumber: string, isChassisNumber: boolean): Promise<void> {
        // const {numberPlateNumber, chassisNumber} = await this.getVehicleData();
        await this.storeData("logs", "at input filling option");

        const vehicleTypeRadioButtons = await getElementsOnceVisible<HTMLInputElement>(
            pageSelectors.vehiclePlateNumberAndChassisNumberRadioButtonSelector
        );

        if (!vehicleTypeRadioButtons.length) {
            await this.storeData("logs", "not getting input radio buttons");
            return;
        }

        await this.fillTheVehicleDetails(isChassisNumber, vehicleNumber, vehicleTypeRadioButtons);
    }

    private async findCaptchaAndAlertTheUser(): Promise<void> {
        const submitButton = document.querySelectorAll(pageSelectors.submitButtonSelector)[1];
        console.log(submitButton)

        if (!submitButton) {
            await this.logAndStore("captcha find")
            console.log("Captcha detected");

            const alertMessage = getAlertMessageAccordingToLanguage(fillTheCaptchaAlertMessage)
            alert(alertMessage)
        }
    }

    private async findSubmitButtonAndClick(): Promise<boolean> {
        try {
            const submitButton = (await getElementsOnceVisible<HTMLButtonElement>(pageSelectors.submitButtonSelector, {timeout: 60000}))[1];
            // const submitButton = document.querySelectorAll<HTMLButtonElement>(pageSelectors.submitButtonSelector)[1];

            if (!submitButton) {
                await this.storeData("error", "submit button is not appear")
            } else {
                await this.logAndStore("submit button clicked")
                submitButton.click();
                return true
            }
            return false
        } catch (error) {
            console.log("Failed to find/submit button", error);
            return false;
        }
    }

    private async getResult(isChassisNumberPresent: boolean): Promise<boolean> {

        const result = (!isChassisNumberPresent) ?
            await getElementsOnceVisible(pageSelectors.numberPlateResultSelector) :
            (await getElementsOnceVisible(pageSelectors.chassisNumberResultSelector)).length;

        if (!result) {
            await this.storeData("logs", "result is not getting")
            return false
        }

        if (!isChassisNumberPresent) {

            const dateSelector = document.querySelector(pageSelectors.numberPlateResultSelector)
            if(!dateSelector) return false;

            const result = dateSelector.textContent
            if (!result) return false;

            await this.logAndStore("result is present")
            const res = (result?.match(/\b\d{2}\/\d{2}\/\d{4}\b/g))?.[0]

            console.log(res)

            if(!res) return false;

            await this.storeData("vehicleDetails", res)

        } else {

            const responseKeyValueArray = document.querySelectorAll(pageSelectors.chassisNumberResultSelector)
            if(!responseKeyValueArray.length) return false;

            const result = Array.from(responseKeyValueArray)
                                    .map((ele) => [convertToCamelCase(ele.textContent ?? ""),
                                            (ele?.nextElementSibling?.textContent) ?
                                                ele.nextElementSibling.textContent :
                                                ""])

            if (result.length && result[0].length) {
                await this.logAndStore("result has some fields")

                const resultObject: { [key: string]: string } = {}

                for (const item of result) {
                    resultObject[item[0]] = item[1]?.trim()
                }

                console.log(resultObject)

                await this.logAndStore(JSON.stringify(resultObject));

                if(Object.keys(resultObject).length === 0) return false;

                const registrationDate = resultObject['datumEersteInschrijving'] || resultObject['dateDeLaPremièreImmatriculation']
                                                || resultObject['datumDerErstzulassung'] || resultObject['dateOfFirstRegistration'];

                await this.storeData("vehicleDetails", registrationDate)
            }
        }

        return true

    }

    // private async askUserToFillDetailsManually(): Promise<void> {
    //     const {numberPlateNumber, chassisNumber} = await this.getVehicleData();
    //     const vehicleNumber = numberPlateNumber || chassisNumber || '';
    //
    //     const askUserToFillDetailsAlertMessage = {
    //         nl: `Kopieer uw voertuignummer: ${vehicleNumber} en plak het handmatig in het invoerveld. Zodra de pagina opnieuw is geladen.`,
    //         fr: `Veuillez copier votre numéro de véhicule : ${vehicleNumber} et le coller manuellement dans le champ de saisie une fois le rechargement de la page terminé.`,
    //         de: `Bitte kopieren Sie Ihre Fahrzeugnummer: ${vehicleNumber} und fügen Sie sie manuell in das Eingabefeld ein, sobald die Seite neu geladen wurde.`,
    //         en: `Please copy your vehicle number: ${vehicleNumber} and paste it into the input field manually Once page reload is done.`
    //     };
    //
    //     const alertMessage = getAlertMessageAccordingToLanguage(askUserToFillDetailsAlertMessage);
    //     alert(alertMessage);
    //
    //     await copyDataToClipboard(vehicleNumber)
    // }

    private showCaptchaTimeoutAlert() {
        const alertMessage = getAlertMessageAccordingToLanguage(captchaTimeoutAlertMessage);
        alert(alertMessage);
    }

    private async closeTabWithAlert() {
        await ChromeService.sendRuntimeMessage("closeTab")
    }

    private async proceedFurtherAfterHeadingVisible(): Promise<void> {
        const heading = document.querySelector<HTMLElement>(pageSelectors.headingSelector);
        if (!isVisible(heading)) return;

        const {numberPlateNumber, chassisNumber} = await this.getVehicleData();
        console.log(await this.getVehicleData());
        const vehicleData = numberPlateNumber || chassisNumber
        const isChassisNumberPresent = chassisNumber.length > 0 && numberPlateNumber.length === 0
        console.log("chassis number: ", numberPlateNumber, chassisNumber, isChassisNumberPresent)
        if (!vehicleData) {
            await this.storeData("logs", "vehicle data is not defined")
            await this.closeTabWithAlert()
            return;
        }

        const pageRefreshOrNot = await ChromeService.sendRuntimeMessage("checkPageRefreshOrNot");
        console.log("page refresh or not: ", pageRefreshOrNot);
        if (pageRefreshOrNot) {
            await delay(5000);

            const res = await this.getResult(isChassisNumberPresent)
            if (!res) {
                await delay(2000);
                await this.closeTabWithAlert();
            }
        } else {

            await this.chooseNumberPlateNumberAndChassisNumberButtonAndFillData(vehicleData, isChassisNumberPresent);
            await delay(1500);
            await this.findCaptchaAndAlertTheUser();

            const captchaFilledOrNot = await this.findSubmitButtonAndClick();
            if (!captchaFilledOrNot) {
                this.showCaptchaTimeoutAlert()
                await this.closeTabWithAlert();
            } else {
                await delay(5000);
                const resultAppearOrNot = await this.getResult(isChassisNumberPresent);
                if (!resultAppearOrNot) {
                    // await this.askUserToFillDetailsManually();
                    // await this.pageRefresh();

                    await this.closeTabWithAlert();
                }
            }
        }
    }

    public async initialize(): Promise<void> {
        console.log("Content script initialized");

        const languageChangeOrNot = await ChromeService.sendRuntimeMessage("getLocalStorageData", {key: "languageChange"});
        await delay(2000);
        console.log("language change or not: ", languageChangeOrNot)
        if (languageChangeOrNot) {

            waitForElements(
                pageSelectors.progressBarSelector,
                () => {
                    console.log("progress bar is appeared")
                    waitForProgressBarCompletion(
                        pageSelectors.progressBarSelector,
                        async () => {
                            console.log("progress bar is completed")
                            await delay(3000);
                            await this.proceedFurtherAfterHeadingVisible()
                        }
                    )
                },
                false
            )
        } else {
            waitForElements(pageSelectors.headingSelector,
                async () => {
                    await delay(3000);
                    await this.proceedFurtherAfterHeadingVisible()
                },
                true
            )
        }
    }
}
