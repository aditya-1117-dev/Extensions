import { useState } from "react";

const ScrapCarDetailsForm = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [plateNumber, setPlateNumber] = useState('');
    const [chassisNumber, setChassisNumber] = useState('');

    const handleSubmit = () => {
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
        }, 1500);
    };

    return (
        <div className="bg-white w-full px-5 py-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-5">
                Enter Vehicle Information
            </h2>

            <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                <div>
                    <label htmlFor="plate" className="block text-sm font-medium text-gray-700 mb-1">
                        Plate Number
                    </label>
                    <input
                        id="plate"
                        type="text"
                        value={plateNumber}
                        onChange={(e) => setPlateNumber(e.target.value)}
                        placeholder="e.g. ABC-123"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                </div>

                <div>
                    <label htmlFor="chassis" className="block text-sm font-medium text-gray-700 mb-1">
                        Chassis Number
                    </label>
                    <input
                        id="chassis"
                        type="text"
                        value={chassisNumber}
                        onChange={(e) => setChassisNumber(e.target.value)}
                        placeholder="e.g. WBA12345678901234"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading || !plateNumber || !chassisNumber}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2.5 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin h-5 w-5 text-white"
                                 xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10"
                                        stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor"
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                            </svg>
                            <span>Processing...</span>
                        </>
                    ) : (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor"
                                 viewBox="0 0 20 20">
                                <path fillRule="evenodd"
                                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
                                      clipRule="evenodd" />
                            </svg>
                            <span>Get Vehicle Details</span>
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default ScrapCarDetailsForm;
