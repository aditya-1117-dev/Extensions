import {contentService} from "../../services/content.service.ts";

console.log("hii")

contentService.initialize()
    .catch(error => {
        console.log('Content script initialization failed', error);
    });