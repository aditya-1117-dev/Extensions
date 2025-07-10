import React from "react";

const UnsupportedDomainMessage: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center h-[150px] bg-white text-red-600 px-4">
            <div className="max-w-md w-full p-6 rounded-lg border border-red-300 shadow-md bg-red-50">
                <h1 className="text-xl font-bold mb-2">Extension not supported</h1>
                <p className="text-sm mb-1">Extension only supported on Twinntax car configuration pages.</p>
            </div>
        </div>
    );
};

export default UnsupportedDomainMessage;
