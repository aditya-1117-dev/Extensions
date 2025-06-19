import type {IVehicleData} from "./chrome";

export interface IBackgroundState {
    vehicleDataFromTwinntax: IVehicleData | null;
    twinntaxTabId: number | null;
    vehicleDataFromMobiformWebsite: any;
    pageRefresh: boolean;
    mobiformTabId: number | null;
    languageChangePageRefresh: boolean;
}

export interface IChromeMessage {
    type: string;
    [key: string]: any;
}

export type TMessageHandler = (
    request: IChromeMessage,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void
) => boolean | void | Promise<boolean | void>;

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
    | 'noChangeInLanguage';
