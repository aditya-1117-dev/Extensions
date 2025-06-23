import React, {useEffect, useState} from "react";
import Button from "./Button.tsx";
import {useLanguage} from "../hooks/useLanguage.tsx";
import {ChromeService} from "../services/chrome.service.ts";
import {DomainUtils} from "../utils/domain.utils.ts";
import UnsupportedDomainMessage from "./UnsupportedDomainMessage.tsx";

const ScrapCarDetailsButton: React.FC = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const {getButtonText} = useLanguage();
    const buttonText: string = getButtonText();
    const buttonClasses: string = "mx-auto my-5 px-5 py-auto"
    const [isSupported, setIsSupported] = useState<boolean | null>(null);

    useEffect(() => {
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            const tab = tabs[0];
            const url = tab?.url || "";
            const supported = DomainUtils.isSupportedDomain(url);
            setIsSupported(supported);
        });
    }, []);

    async function handleScrapCarDetails() {
        setIsLoading(true);
        try {
            const tab = await ChromeService.getActiveTab();

            if (!DomainUtils.isSupportedDomain(tab.url)) {
                console.log('Unsupported domain', tab.url);
                return;
            }

            const vehicleData = await ChromeService.extractVehicleData(tab.id);

            if (!vehicleData || Object.keys(vehicleData).length === 0) {
                console.log('No vehicle data found');
                return;
            }

            await ChromeService.clearStorage();

            await ChromeService.sendRuntimeMessage("init");

            await ChromeService.sendRuntimeMessage("vehicleDataFromTwinntax", {
                vehicleDataFromTwinntax: vehicleData,
                twinntaxTabId: tab.id
            });

            const newWindow = await ChromeService.openMobiformWindow();

            if (newWindow.tabs?.[0]?.id) {
                await ChromeService.injectScript(newWindow.tabs[0].id, "./chooseLanguage.js");
            }

        } catch (error: unknown) {
            console.log("Error in scrap car details", error);
        } finally {
            setIsLoading(false);
        }
    }

    if (!isSupported) return <UnsupportedDomainMessage/>;

    return (
        <Button
            text={buttonText}
            onClick={handleScrapCarDetails}
            loading={isLoading}
            color="danger"
            size="sm"
            hoverEffect="float"
            glow={true}
            disabled={isLoading}
            aria-label="Extract vehicle details"
            className={buttonClasses}
        />
    )
}

export default ScrapCarDetailsButton;