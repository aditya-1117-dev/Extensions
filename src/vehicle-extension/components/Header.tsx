const Header = () => {
    return (
        <header className="sticky top-0 z-10 bg-white shadow-sm px-4 py-3 border-b border-gray-200">
            <div className="flex items-center justify-between space-x-3">
                <div>
                    <h1 className="text-lg font-semibold text-gray-800 leading-snug">Twinntax Vehicle</h1>
                    <p className="text-[10px] text-gray-500 leading-tight">Auto vehicle details extractor</p>
                </div>
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none"
                         viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                    </svg>
                </div>
            </div>
        </header>
    );
}
export default Header;