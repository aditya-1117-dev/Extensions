export const logger = {
    info(message: string, context?: any) {
        console.log(`[INFO] ${message}`, context);
    },
    log(message: string, context?: any) {
        console.log(`[WARN] ${message}`, context);
    },
    error(message: string, error?: any) {
        console.error(`[ERROR] ${message}`, error);
    }
};
