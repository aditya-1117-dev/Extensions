import React from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ScrapCarDetailsForm from "./components/ScrapCarDetailsForm.tsx";
import ScrapCarDetailsButton from "./components/ScrapCarDetailsButton.tsx";

// const App : React.FC = () => {
//
//     return (
//         <div className="h-[500px] w-[400px] bg-gradient-to-b from-gray-50 to-blue-50
//                       overflow-hidden scroll-smooth">
//             <div className="flex flex-col h-full">
//                 <Header/>
//                 <main className="flex-1 px-4 py-2 flex flex-col overflow-y-auto hide-scrollbar">
//                     <ScrapCarDetailsButton/>
//                     <ScrapCarDetailsForm/>
//                 </main>
//             </div>
//             <Footer/>
//         </div>
//     );
// };

const App: React.FC = () => {
    return (
        <div className="h-[500px] w-[400px] overflow-hidden bg-gradient-to-b from-gray-50 to-blue-50">
            <div className="flex flex-col h-full">
                <Header />
                <main className="flex-1 px-4 py-2 flex flex-col items-center overflow-y-auto scroll-smooth hide-scrollbar">
                    <ScrapCarDetailsButton />
                    <ScrapCarDetailsForm />
                </main>
                <Footer />
            </div>
        </div>
    );
};


export default App;