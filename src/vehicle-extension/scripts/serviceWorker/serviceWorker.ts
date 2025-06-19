import { backgroundService } from '../../services/background.service.ts';

console.log('Service Worker initialized');

chrome.runtime.onInstalled.addListener(() => {
    console.log('Extension installed');
});

backgroundService.initListeners();
