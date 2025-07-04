export const DomainUtils = {
    isSupportedDomain(url: string | undefined): boolean {

        const domainRegex = '^https?:\\/\\/app(\\.[^\\/]+)?\\.twinntax\\.com';

        const pathRegex = [
            'accountant-companies\\/overview(\\/[^\\/?#]+)?',
            'simulation-configuration(?:\\/.*)?(?:\\?.*)?',
            'payslip-configuration\\/[^\\/?#]+'
        ]

        // const regex = /^https?:\/\/app(\.[^\/]+)?\.twinntax\.com\/(accountant-company\/overview(\/[^\/?#]+)?|simulation-configuration(\/.*)?|payslip-configuration(\/.*)?)\/?$/;
        const fullRegex = `${domainRegex}\\/.*(${pathRegex.join("|")})\\/?$`;
        const regex = new RegExp(fullRegex);

        return url
            ? regex.test(url)
            : false;
    }
};