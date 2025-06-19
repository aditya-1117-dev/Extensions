export function delay (ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}


export function isVisible (element: Element | null): boolean {
    console.log(element);
    return true;
    // return !!(element && (element as HTMLElement).offsetHeight || element?.getClientRects().length);
}

export function waitForElements  (
    selector: string,
    callback: () => void,
    singleElement = false,
    singleElementIndex: number | null = null
): void  {
    const allElements = document.querySelectorAll(selector);
    const el = singleElement ? allElements[singleElementIndex ?? 0] : allElements;
    if (el) return callback();

    const observer = new MutationObserver(() => {
        const updatedElements = document.querySelectorAll(selector);
        const el = singleElement ? updatedElements[singleElementIndex ?? 0] : updatedElements;

        if ((!singleElement && el) || (singleElement && el)) {
            observer.disconnect();
            callback()
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
}

export function simulateHumanTyping(input: HTMLInputElement, value: string): void {
    input.focus();
    input.value = '';
    const eventProps = { bubbles: true, cancelable: true };

    // Simulate gradual typing
    for (let i = 0; i < value.length; i++) {
        setTimeout(() => {
            input.value += value[i];
            input.dispatchEvent(new Event('input', eventProps));
            input.dispatchEvent(new Event('change', eventProps));

            if (i === value.length - 1) {
                input.blur();
            }
        }, i * 100);
    }
}

export function simulateButtonClick(button: HTMLElement): void {
    const mouseEventProps = {
        bubbles: true,
        cancelable: true,
        view: window
    };

    button.dispatchEvent(new MouseEvent('mouseover', mouseEventProps));
    button.dispatchEvent(new MouseEvent('mousedown', mouseEventProps));
    button.dispatchEvent(new MouseEvent('mouseup', mouseEventProps));
    button.click();
}

// export const waitForProgressBarCompletion = (callback: () => void): void => {
//     const observer = new MutationObserver(() => {
//         const el = document.querySelector(pageSelectors.progressBarSelector);
//         if (!el) {
//             console.log("Progress bar is complete", el);
//             observer.disconnect();
//             callback();
//         }
//     });
//
//     observer.observe(document.body, { childList: true, subtree: true });
// }

export function waitForProgressBarCompletion(selector: string, callback: () => void): void {
    const observer = new MutationObserver(() => {
        const progressBar = document.querySelector(selector);
        if (!progressBar) {
            console.log("progress bar is complete");
            observer.disconnect();
            callback();
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}
