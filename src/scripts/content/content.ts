import {contentService} from "../../services/content.service.ts";
import {logger} from "../../utils/logger.ts";

console.log("hii")

contentService.initialize()
    .catch(error => {
        logger.error('Content script initialization failed', error);
    });