import {ContentService} from "../../services/content.ts";

console.log("hii")
const contentService = new ContentService()

contentService.initialize()
    .catch(error => {
        console.log('Content script initialization failed', error);
    });