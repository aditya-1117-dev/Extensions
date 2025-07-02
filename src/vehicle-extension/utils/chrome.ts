export const ChromeTabUtils = {
    async activateTab(tabId: number): Promise<void> {
        try {
            await chrome.tabs.update(tabId, { active: true });
        } catch (error) {
            throw new Error(`Failed to activate tab ${tabId}: ${error}`);
        }
    },

    async removeTab(tabId: number, sendResponse?: (response: any) => void): Promise<void> {
        try {
            await chrome.tabs.remove(tabId);
            if (sendResponse) sendResponse({ success: true });
        } catch (error) {
            const errorMessage = `Failed to remove tab ${tabId}: ${error}`;
            if (sendResponse) sendResponse({ success: false, error: errorMessage });
            throw new Error(errorMessage);
        }
    },

    async reloadTab(tabId: number): Promise<void> {
        try {
            await chrome.tabs.reload(tabId);
        } catch (error) {
            throw new Error(`Failed to reload tab ${tabId}: ${error}`);
        }
    }
};