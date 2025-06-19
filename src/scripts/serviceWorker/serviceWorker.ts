import { backgroundService } from '../../services/background.service';
import {logger} from "../../utils/logger";

console.log('Service Worker initialized');

chrome.runtime.onInstalled.addListener(() => {
    logger.info('Extension installed');
});

backgroundService.initListeners();
