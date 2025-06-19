import { MOBIFORMS_URL } from "../utils/constants.ts";
import { logger } from "../utils/logger.ts";

interface IExtractVehicleDataResult {
    numberPlateNumber?: string;
    chassisNumber?: string;
}

export const ChromeService = {
    async getActiveTab(): Promise<chrome.tabs.Tab> {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab?.id || !tab.url) throw new Error("No active tab found");
        return tab;
    },

    async extractVehicleData(tabId: number | undefined): Promise<IExtractVehicleDataResult | null> {
        if (!tabId) return null;

        const [result] = await chrome.scripting.executeScript({
            target: { tabId },
            func: (): IExtractVehicleDataResult => {
                const numberPlateInput = document.getElementById("vehicle-plate-number") as HTMLInputElement | null;
                const chassisNumberInput = document.getElementById("vehicle-chassis-number") as HTMLInputElement | null;
                const outputEl = document.getElementById("output");

                if (outputEl) outputEl.textContent = '';

                return {
                    numberPlateNumber: numberPlateInput?.value.trim(),
                    chassisNumber: chassisNumberInput?.value.trim()
                };
            }
        });

        return result?.result as IExtractVehicleDataResult || {};
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
            target: { tabId },
            files: [path]
        });
    },

    async clearStorage(): Promise<void> {
        await chrome.storage.local.clear();
    },

    async sendRuntimeMessage<T = any>(type: string, payload?: any): Promise<T> {
        try {
            return await chrome.runtime.sendMessage({ type, ...payload });
        } catch (error) {
            logger.error(`Failed to send message: ${type}`, error);
            throw error;
        }
    }
};
