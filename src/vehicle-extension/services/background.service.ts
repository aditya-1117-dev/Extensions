import {ChromeTabUtils} from '../utils/chrome.utils.ts';
import type {
    IBackgroundState,
    IChromeMessage,
    TMessageHandler, TMessage
} from "../types/background";

class BackgroundService {
    private state: IBackgroundState = {
        vehicleDataFromTwinntax: null,
        twinntaxTabId: null,
        vehicleDataFromMobiformWebsite: null,
        pageRefresh: false,
        mobiformTabId: null,
        languageChangePageRefresh: false
    };

    constructor() {
        console.log("background sservice initialized");
        // this.initListeners();
    }

    public initListeners() {
        chrome.tabs.onUpdated.addListener(this.handleTabUpdated.bind(this));
        chrome.runtime.onMessage.addListener(this.handleRuntimeMessage.bind(this));
    }

    private async handleTabUpdated(tabId: number, info: chrome.tabs.TabChangeInfo) {
        this.state.mobiformTabId = tabId;

        if (info.status === 'complete') {
            if (this.state.languageChangePageRefresh) {
                this.state.languageChangePageRefresh = false;
                await this.assignContentScript(tabId);
            } else if (this.state.pageRefresh) {
                this.state.pageRefresh = false;
                await this.assignContentScript(tabId);
            }
        }
    }

    private handleRuntimeMessage(request: IChromeMessage, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void): boolean | void | Promise<boolean | void> {
        console.log(`Received message: ${request.type}`, request);

        const handlers: Record<TMessage, TMessageHandler> = {
            'init': this.handleInit.bind(this),
            'vehicleDataFromTwinntax': this.handleVehicleDataFromTwinntax.bind(this),
            'getVehicleNumber': this.handleGetVehicleNumber.bind(this),
            'storeData': this.handleStoreData.bind(this),
            'logs': this.handleStoreData.bind(this),
            'getLocalStorageData': this.handleGetLocalStorageData.bind(this),
            'closeTab': this.handleCloseTab.bind(this),
            'pageRefresh': this.handlePageRefresh.bind(this),
            'checkPageRefreshOrNot': this.handleCheckPageRefresh.bind(this),
            'changeLanguage': this.handleChangeLanguage.bind(this),
            'checkLanguageChangeOrNot': this.handleCheckLanguageChange.bind(this),
            'noChangeInLanguage': this.handleNoLanguageChange.bind(this)
        };

        const handler = handlers[request.type as TMessage] || this.handleUnknownMessage.bind(this);
        return handler(request, sender, sendResponse);
    }

    private handleInit() {
        console.log("inside handleInit")
        this.state = {
            vehicleDataFromTwinntax: null,
            twinntaxTabId: null,
            vehicleDataFromMobiformWebsite: null,
            pageRefresh: false,
            mobiformTabId: null,
            languageChangePageRefresh: false
        };
    }

    private handleVehicleDataFromTwinntax(request: IChromeMessage) {
        this.state.vehicleDataFromTwinntax = request.vehicleDataFromTwinntax;
        this.state.twinntaxTabId = request.twinntaxTabId;
    }

    private handleGetVehicleNumber(_request: IChromeMessage, _sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) {
        sendResponse({data: this.state.vehicleDataFromTwinntax});
        return true;
    }

    private handleStoreData(request: IChromeMessage) {
        const resultToBeSaved = request[request.dataAccessKey];
        if (request.dataAccessKey === "vehicleDetails") {
            this.state.vehicleDataFromMobiformWebsite = resultToBeSaved;
        }
        console.log(`Stored data for key: ${request.dataAccessKey}`, resultToBeSaved);
    }

    private async handleGetLocalStorageData(request: IChromeMessage, _sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) {
        chrome.storage.local.get(request.key, (res) => {
            sendResponse(res)
        })
        return true
    }

    private async handleCloseTab(_request: IChromeMessage, _sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) {
        if (!this.state.twinntaxTabId || !this.state.mobiformTabId) {
            sendResponse({success: false, error: 'Invalid tab IDs'});
            return;
        }

        await ChromeTabUtils.activateTab(this.state.twinntaxTabId);

        if (this.state.vehicleDataFromMobiformWebsite) {
            await this.showResultInTwinntaxSite(this.state.vehicleDataFromMobiformWebsite);
        } else {
            await this.showAlertInTwinntaxSite("Error: Result not available. Please try again later.");
        }

        // const result = this.state.vehicleDataFromMobiformWebsite || request.data;

        await ChromeTabUtils.removeTab(this.state.mobiformTabId, sendResponse);
        return true;
    }

    private async handlePageRefresh() {
        if (!this.state.mobiformTabId) return;

        this.state.pageRefresh = true;
        await chrome.storage.local.set({"continueAfterRefresh": "true"});
        await chrome.tabs.reload(this.state.mobiformTabId);
    }

    private async handleCheckPageRefresh(_request: IChromeMessage, _sender: chrome.runtime.MessageSender,
                                         sendResponse: (response?: any) => void) {
        chrome.storage.local.get("continueAfterRefresh", (res) => {
            console.log(res)
            sendResponse(res.continueAfterRefresh)
        })
        return true;
    }

    private async handleChangeLanguage() {
        // if (!this.state.mobiformTabId) return;

        this.state.languageChangePageRefresh = true;
        await chrome.storage.local.set({"languageChange": "true"});
    }

    private async handleCheckLanguageChange(_request: IChromeMessage, _sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) {
        chrome.storage.local.get("languageChange", (res) => {
            console.log(res, res.languageChange)
            sendResponse(res.languageChange)
        })
        return true;
    }

    private async handleNoLanguageChange() {
        if (!this.state.mobiformTabId) return;
        await this.assignContentScript(this.state.mobiformTabId);
    }

    private handleUnknownMessage(request: IChromeMessage) {
        console.log('Unknown message type received', request);
    }

    private async assignContentScript(tabId: number) {
        try {
            await chrome.scripting.executeScript({
                target: {tabId},
                files: ["./content.js"]
            });
        } catch (error) {
            console.log('Error injecting content script', error);
        }
    }

    private async showResultInTwinntaxSite(response: any) {
        if (!this.state.twinntaxTabId) return;

        try {
            await chrome.scripting.executeScript({
                target: {tabId: this.state.twinntaxTabId},
                func: (vehicleDetails) => {
                    const outputDiv = document.getElementById("output");
                    if (outputDiv) {
                        outputDiv.textContent = JSON.stringify(vehicleDetails, null, 2);
                    }
                },
                args: [response]
            });
        } catch (error) {
            console.log('Error showing result in Twinntax site', error);
        }
    }

    private async showAlertInTwinntaxSite(error: string) {
        if (!this.state.twinntaxTabId) return;

        try {
            await chrome.scripting.executeScript({
                target: {tabId: this.state.twinntaxTabId},
                func: (errorMessage) => {
                    alert(errorMessage);
                },
                args: [error]
            });
        } catch (error) {
            console.log('Error showing alert in Twinntax site', error);
        }
    }
}

export const backgroundService = new BackgroundService();