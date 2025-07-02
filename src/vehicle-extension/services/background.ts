import {ChromeTabUtils} from '../utils/chrome.ts';
import type {
    IBackgroundState,
    IChromeMessage,
    TMessage
} from "../types/background.ts";
import {pageSelectors} from "../utils/constants.ts";

export class BackgroundService {
    private state: IBackgroundState = {
        vehicleDataFromTwinntax: null,
        twinntaxTabId: null,
        vehicleDataFromMobiformWebsite: "",
        pageRefresh: false,
        mobiformTabId: null,
        languageChangePageRefresh: false,
        alreadyHadPageRefresh: false,
    };

    constructor() {
        console.log("background service initialized");
    }

    private initBackground() {
        console.log("inside handleInit")
        this.state = {
            vehicleDataFromTwinntax: null,
            twinntaxTabId: null,
            vehicleDataFromMobiformWebsite: "",
            pageRefresh: false,
            mobiformTabId: null,
            languageChangePageRefresh: false,
            alreadyHadPageRefresh: false,
        };
    }

    public initListeners() {
        chrome.tabs.onUpdated.addListener(async (tabId: number, info: chrome.tabs.TabChangeInfo) => {
            await this.executeScriptAfterPageRefresh(tabId, info)
        });
        chrome.runtime.onMessage.addListener(this.handleRuntimeMessage.bind(this));
    }

    private async executeScriptAfterPageRefresh(tabId: number, info: chrome.tabs.TabChangeInfo) {
        this.state.mobiformTabId = tabId;
        if (info.status !== 'complete') return;

        if (this.state.languageChangePageRefresh) {
            this.state.languageChangePageRefresh = false;
            await this.assignScript(tabId);
        } else if (this.state.pageRefresh) {
            this.state.pageRefresh = false;
            await this.assignScript(tabId);
        }

    }

    private twinntaxTabIdAndTwinntaxData(request: IChromeMessage) {
        this.state.vehicleDataFromTwinntax = request.vehicleDataFromTwinntax;
        this.state.twinntaxTabId = request.twinntaxTabId;
    }

    private storeDataAndLogs(request: IChromeMessage) {
        const resultToBeSaved: string = request[request.dataAccessKey];
        if (request.dataAccessKey === "vehicleDetails") {
            this.state.vehicleDataFromMobiformWebsite = resultToBeSaved;
        }
        console.log(`Stored data for key: ${request.dataAccessKey}`, resultToBeSaved);
    }

    private async assignScript(tabId: number) {
        try {
            await chrome.scripting.executeScript({
                target: {tabId},
                files: ["./content.js"]
            });
        } catch (error) {
            console.log('Error injecting content script', error);
        }
    }

    private async showResultInTwinntaxSite(response: string) {
        if (!this.state.twinntaxTabId) return;

        try {
            console.log(typeof response, response)

            const [res] = await chrome.scripting.executeScript({
                target: {tabId: this.state.twinntaxTabId},
                func: (selector, result) => {

                    const element = document.querySelector<HTMLInputElement>(selector);
                    if(!element) return 0;

                    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
                    nativeInputValueSetter?.call(element, result);

                    element.dispatchEvent(new Event("input", {bubbles: true}));
                    element.dispatchEvent(new Event("change", {bubbles: true}));
                    return 1;
                },
                args: [pageSelectors.dateSelector,response]
            });

            return res.result;
        } catch (error) {
            console.log('Error showing result in Twinntax site', error);
        }
    }

    private async showAlertInSpecificTabId(message: string, tabId: number) {
        if (!tabId) return;

        try {
            await chrome.scripting.executeScript({
                target: {tabId: tabId},
                func: (message) => {
                    alert(message);
                },
                args: [message]
            });
        } catch (error) {
            console.log('Error showing alert in Twinntax site', error);
        }
    }

    private async pageRefreshAndSavedToLocalStorageAccordingToTabId() {
        if (!this.state.mobiformTabId) return;

        this.state.alreadyHadPageRefresh = true;
        this.state.pageRefresh = true;
        await chrome.storage.local.set({"continueAfterRefresh": "true"});
        await chrome.tabs.reload(this.state.mobiformTabId);
    }

    private checkPageRefreshOrNot(sendResponse: (response?: any) => void) {
        chrome.storage.local.get("continueAfterRefresh", (res) => {
            console.log(res)
            sendResponse(res.continueAfterRefresh)
        })
    }

    private async changeLanguageAndSavedToLocalStorageAccordingToTabId() {
        // if (!this.state.mobiformTabId) return;

        this.state.languageChangePageRefresh = true;
        await chrome.storage.local.set({"languageChange": "true"});
    }

    private checkLanguageChangeOrNot(sendResponse: (response?: any) => void) {
        chrome.storage.local.get("languageChange", (res) => {
            console.log(res, res.languageChange)
            sendResponse(res.languageChange)
        })
    }

    private async handleRuntimeMessage(request: IChromeMessage, _sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void): Promise<boolean | void> {
        console.log(`Received message: ${request.type}`, request);

        switch (request.type as TMessage) {
            case "init":
                this.initBackground();
                break;

            case "vehicleDataFromTwinntax":
                this.twinntaxTabIdAndTwinntaxData(request);
                break;

            case "getVehicleNumber":
                this.handleGetVehicleNumber(sendResponse);
                return true;

            case "storeData":
            case "logs":
                this.storeDataAndLogs(request);
                break;

            case "getLocalStorageData":
                await this.getLocalStorageData(request, sendResponse);
                return true;

            case "closeTab":
                await this.closeTab(sendResponse);
                break;

            case "pageRefresh":
                await this.pageRefreshAndSavedToLocalStorageAccordingToTabId();
                break;

            case "checkPageRefreshOrNot":
                this.checkPageRefreshOrNot(sendResponse);
                return true;

            case "changeLanguage":
                await this.changeLanguageAndSavedToLocalStorageAccordingToTabId();
                break;

            case "checkLanguageChangeOrNot":
                this.checkLanguageChangeOrNot(sendResponse);
                return true;

            case "noChangeInLanguage":
                await this.noLanguageChange();
                break;

            case "showAlertInTabId":
                await this.showAlertInSpecificTabId(request.alertMessage, request.tabId);
                break;

            default:
                this.handleUnknownMessage(request);
                break;
        }
    }

    private handleGetVehicleNumber(sendResponse: (response?: any) => void) {
        sendResponse({data: this.state.vehicleDataFromTwinntax});
    }

    private async getLocalStorageData(request: IChromeMessage, sendResponse: (response?: any) => void) {
        const res = await chrome.storage.local.get([request.key]);
        console.log(`local storage ${request.key}: `, res[request.key]);
        sendResponse({data: res[request.key]});
    }

    private async closeTab(sendResponse: (response?: any) => void) {
        if (!this.state.twinntaxTabId || !this.state.mobiformTabId) {
            sendResponse({success: false, error: 'Invalid tab IDs'});
            return;
        }

        await ChromeTabUtils.activateTab(this.state.twinntaxTabId);

        if (this.state.vehicleDataFromMobiformWebsite) {
            if(!await this.showResultInTwinntaxSite(this.state.vehicleDataFromMobiformWebsite)){
                await this.showAlertInSpecificTabId("datepicker is not found in twinntax site", this.state.twinntaxTabId);
            }
        } else {
            await this.showAlertInSpecificTabId("Error: Result not available. Please try again later.", this.state.twinntaxTabId);
        }

        // const result = this.state.vehicleDataFromMobiformWebsite || request.data;

        await ChromeTabUtils.removeTab(this.state.mobiformTabId, sendResponse);
    }

    private async noLanguageChange() {
        if (!this.state.mobiformTabId) return;
        await this.assignScript(this.state.mobiformTabId);
    }

    private handleUnknownMessage(request: IChromeMessage) {
        console.log('Unknown message type received', request);
    }
};