import type {IAlertMessages} from "../types/content.ts";
import {ChromeService} from "../services/chrome.ts";

export function isVisible(element: HTMLElement | null): boolean {
    return !!(element?.offsetWidth || element?.offsetHeight || element?.getClientRects().length);
}

export function isSpecialChar(str: string): boolean {
    const specialChars = /[`!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]/;
    return specialChars.test(str);
}

export function convertToCamelCase(value: string): string {
    value = value.trim()
    value = value.replace(/:/g, '');

    return value.split(' ').reduce((acc, cur) => {
        if (!isSpecialChar(cur)) {
            acc += (cur.substring(0, 1).toUpperCase() + cur.substring(1).toLowerCase())
        }
        return acc.substring(0, 1).toLowerCase() + acc.substring(1)
    }, "")
}

export function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/*
* functions: simulateHumanTyping, simulateButtonClick
* Below functions are worked like human action, it has to be that way because sometimes website caught automate actions.
* */
export function simulateHumanTyping(input: HTMLInputElement, value: string): void {
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
    nativeInputValueSetter?.call(input, value);

    input.dispatchEvent(new Event("input", {bubbles: true}));
    input.dispatchEvent(new Event("change", {bubbles: true}));
}

export function simulateInputClick(button: HTMLInputElement): void {
    button.dispatchEvent(new MouseEvent("mouseover", {bubbles: true}));
    button.dispatchEvent(new MouseEvent("mousedown", {bubbles: true}));
    button.dispatchEvent(new MouseEvent("mouseup", {bubbles: true}));
    button.click();
}

/*
* This function helps user to copy its data, after this manual flow will run
* */
export async function copyDataToClipboard(data: string) {
    try {
        await navigator.clipboard.writeText(data);
    } catch (error) {
        console.log("Failed to copy to clipboard", error);
    }
}

export async function pageRefresh() {
    await ChromeService.sendRuntimeMessage("pageRefresh");
}

export function waitForElements(
    selector: string,
    callback: () => void,
    singleElement = false,
    singleElementIndex: number | null = null
): void {
    const allElements = document.querySelectorAll(selector);
    if ((singleElement && allElements[singleElementIndex ?? 0]) || (!singleElement && allElements.length)) return callback();

    const observer = new MutationObserver(() => {
        const updatedElements = document.querySelectorAll(selector);

        if ((singleElement && updatedElements[singleElementIndex ?? 0]) || (!singleElement && updatedElements.length)) {
            observer.disconnect();
            callback()
        }
    });

    observer.observe(document.body, {childList: true, subtree: true});
}

export async function getElementsOnceVisible<T extends Element>(
    selector: string,
    options: { timeout?: number } = {}
): Promise<T[]> {
    return new Promise((resolve, reject) => {
        const elements: NodeListOf<T> = document.querySelectorAll(selector);
        if (elements.length) return resolve(Array.from(elements));

        const timeout = options.timeout || 30000;
        const timeoutId = setTimeout(() => {
            observer.disconnect();
            reject(new Error(`Timeout waiting for elements: ${selector}`));
        }, timeout);

        const observer = new MutationObserver(() => {
            const foundElements: NodeListOf<T> = document.querySelectorAll(selector);
            if (foundElements.length) {
                clearTimeout(timeoutId);
                observer.disconnect();
                resolve(Array.from(foundElements));
            }
        });

        observer.observe(document.body, {childList: true, subtree: true});
    });
}

export function waitForInputAndTrackTyping(inputSelectors: (HTMLInputElement | null)[], onFilled: () => void) {
    const observer = new MutationObserver(() => {
        inputSelectors.map(selector => {
            if (selector) {
                observer.disconnect();

                let typingTimer: number | undefined;
                const delay = 5000;

                selector.addEventListener('input', () => {
                    clearTimeout(typingTimer);
                    typingTimer = window.setTimeout(() => {
                        console.log("timeout added")
                        if (selector.value.trim().length) onFilled()
                    }, delay);
                });
            }
        })
    });

    observer.observe(document.body, { childList: true, subtree: true });
}

export function waitForProgressBarCompletion(selector: string, callback: () => void): void {
    const observer = new MutationObserver(() => {
        const progressBar = document.querySelector(selector);
        if (!progressBar) {
            console.log("progress bar is complete");
            observer.disconnect();
            callback();
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

export function getAlertMessageAccordingToLanguage(alertMessageObject: IAlertMessages): string {
    const browserDefaultLanguage = navigator.language.slice(0, 2);
    return alertMessageObject[browserDefaultLanguage as keyof IAlertMessages] || alertMessageObject.en;
}

// export async function chooseInputFieldSelectorBasedOnNumberPlateNumberAndChassisNumber(): Promise<string> {
    // const {numberPlateNumber, chassisNumber} = await getVehicleData();
    //
    // if (numberPlateNumber) return pageSelectors.vehiclePlateNumberAndChassisNumberRadioButtonSelector
    // else if (chassisNumber) return pageSelectors.chassisNumberTextFieldSelector
    // return ""
// }
