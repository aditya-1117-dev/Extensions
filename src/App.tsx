import React from "react";
import ScrapCarDetailsButton from "./vehicle-extension/components/ScrapCarDetailsButton.tsx";
import Footer from "./vehicle-extension/components/Footer.tsx";
import Header from "./vehicle-extension/components/Header.tsx";

const App: React.FC = () => {
    return (
        <div className="h-[300px] w-[400px] overflow-hidden bg-gradient-to-b from-gray-50 to-blue-50">
            <div className="flex flex-col h-full">
                <Header />
                <main className="flex-1 px-4 py-2 flex flex-col items-center overflow-y-auto scroll-smooth hide-scrollbar">
                    <ScrapCarDetailsButton />
                </main>
                <Footer />
            </div>
        </div>
    );
};

export default App;