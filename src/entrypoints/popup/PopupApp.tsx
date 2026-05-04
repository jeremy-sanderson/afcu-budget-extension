import { browser } from '#imports';
import { useGenerateSummaries } from '../../utils/settings';

export default function PopupApp() {
    const [generateSummaries, setGenerateSummaries] = useGenerateSummaries();

    const openOptions = () => {
        browser.runtime.openOptionsPage();
        window.close();
    };

    return (
        <div className="bg-white text-gray-900">
            <div className="px-4 py-3 bg-[#00548e] text-white">
                <h1 className="text-base font-semibold">AFCU Budget</h1>
            </div>
            <div className="px-4 py-4 space-y-4">
                <label className="flex items-start gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        className="mt-0.5 h-4 w-4 accent-[#00548e] cursor-pointer"
                        checked={generateSummaries}
                        onChange={(event) => setGenerateSummaries(event.target.checked)}
                    />
                    <span className="flex-1 text-sm">
                        <span className="block font-medium">Generate summaries</span>
                        <span className="block text-xs text-gray-600 mt-0.5">Off by default.</span>
                    </span>
                </label>

                <button
                    type="button"
                    onClick={openOptions}
                    className="w-full px-3 py-2 text-sm bg-[#00548e] text-white rounded cursor-pointer hover:bg-[#003d6b]"
                >
                    Open all options
                </button>
            </div>
        </div>
    );
}
