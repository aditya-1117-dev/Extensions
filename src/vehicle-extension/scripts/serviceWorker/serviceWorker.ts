import {BackgroundService} from '../../services/background.ts';

console.log('Service Worker initialized');

chrome.runtime.onInstalled.addListener(() => {
    console.log('Extension installed');
});

const backgroundService = new BackgroundService()
backgroundService.initListeners();
