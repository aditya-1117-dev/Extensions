import { SUPPORTED_DOMAINS } from "./constants.ts";

export const DomainUtils = {
    isSupportedDomain(url: string | undefined): boolean {
        return url
            ? SUPPORTED_DOMAINS.includes(url)
            : false;
    }
};