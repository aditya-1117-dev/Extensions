import type {IVehicleData} from "./chrome.ts";

export interface IBackgroundState {
    vehicleDataFromTwinntax: IVehicleData | null;
    twinntaxTabId: number | null;
    vehicleDataFromMobiformWebsite: string;
    pageRefresh: boolean;
    mobiformTabId: number | null;
    languageChangePageRefresh: boolean;
    alreadyHadPageRefresh: boolean;
}

export interface IChromeMessage {
    type: string;
    [key: string]: any;
}

export type TMessage =
    | 'init'
    | 'vehicleDataFromTwinntax'
    | 'getVehicleNumber'
    | 'storeData'
    | 'logs'
    | 'getLocalStorageData'
    | 'closeTab'
    | 'pageRefresh'
    | 'checkPageRefreshOrNot'
    | 'changeLanguage'
    | 'checkLanguageChangeOrNot'
    | 'noChangeInLanguage'
    | 'showAlertInTabId';
