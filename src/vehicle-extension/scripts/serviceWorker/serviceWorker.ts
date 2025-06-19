import { backgroundService } from '../../services/background.service.ts';
import {logger} from "../../utils/logger.ts";

console.log('Service Worker initialized');

chrome.runtime.onInstalled.addListener(() => {
    logger.info('Extension installed');
});

backgroundService.initListeners();
