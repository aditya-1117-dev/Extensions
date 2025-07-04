import {MOBIFORMS_URL} from "../utils/constants.ts";

interface IExtractVehicleDataResult {
    numberPlateNumber: string;
    chassisNumber: string;
}

export const ChromeService = {
    async getActiveTab(): Promise<chrome.tabs.Tab> {
        const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
        if (!tab?.id || !tab.url) throw new Error("No active tab found");
        return tab;
    },

    async extractVehicleData(tabId: number | undefined): Promise<IExtractVehicleDataResult | null> {
        if (!tabId) return null;

        const [result] = await chrome.scripting.executeScript({
            target: {tabId},
            func: (): IExtractVehicleDataResult | null => {
                const numberPlateInput = document.querySelectorAll<HTMLInputElement>("div.input-group > input[id='carConfiguration.numberPlate']")[0]?.value.trim();
                const chassisNumberInput = document.querySelectorAll<HTMLInputElement>("div.input-group > input[id='carConfiguration.chassisNumber']")[0]?.value.trim();

                console.log(numberPlateInput, chassisNumberInput)

                return (numberPlateInput || chassisNumberInput) ? {
                    numberPlateNumber: numberPlateInput,
                    chassisNumber: chassisNumberInput
                } : null
            }
        });

        return result?.result || null;
    },

    async openMobiformWindow(): Promise<chrome.windows.Window> {
        return await chrome.windows.create({
            url: MOBIFORMS_URL,
            type: "popup",
            width: 1200,
            height: 1200,
        });
    },

    async injectScript(tabId: number, path: string): Promise<void> {
        await chrome.scripting.executeScript({
            target: {tabId},
            files: [path]
        });
    },

    async clearStorage(): Promise<void> {
        await chrome.storage.local.clear();
    },

    async sendRuntimeMessage<T = any>(type: string, payload?: any): Promise<T> {
        try {
            return await chrome.runtime.sendMessage({type, ...payload});
        } catch (error) {
            console.log(`Failed to send message: ${type}`, error);
            await chrome.runtime.sendMessage({type: "closeTab", ...payload});
            await chrome.runtime.sendMessage({type: "showAlertInTabId", alertMessage: "Something wrong happened. Please try again later...", ...payload});
        }
    }
};
