import React, { useState} from "react";
import Button from "./Button.tsx";
import {useLanguage} from "../hooks/useLanguage.tsx";
import {ChromeService} from "../services/chrome.service.ts";
import {DomainUtils} from "../utils/domain.utils.ts";
import {languageService} from "../services/language.service.ts";

const ScrapCarDetailsButton : React.FC = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { getButtonText } = useLanguage();
    const buttonText : string = getButtonText();

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
                // await ChromeService.injectScript(newWindow.tabs[0].id, "./chooseLanguage.js");
                languageService.initialize().catch(error => {
                    console.error('Language script failed:', error);
                });
            }

        }catch (error : unknown) {
            console.log("Error in scrap car details", error);
        }finally {
            setIsLoading(false);
        }
    }

    return (
        <Button
            text={buttonText}
            onClick={handleScrapCarDetails}
            loading={isLoading}
            color="primary"
            size="sm"
            hoverEffect="float"
            glow={true}
            disabled={isLoading}
            aria-label="Extract vehicle details"
            className="mx-auto my-5 px-5 py-auto"
        />
    )
}

export default ScrapCarDetailsButton;