import { useGenerateSummaries } from '../../utils/settings';

export default function OptionsApp() {
    const [generateSummaries, setGenerateSummaries] = useGenerateSummaries();

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900">
            <div className="max-w-2xl mx-auto px-6 py-10">
                <header className="mb-8">
                    <h1 className="text-2xl font-semibold">AFCU Budget Options</h1>
                    <p className="text-sm text-gray-600 mt-1">
                        Configure how the extension behaves on the AFCU banking site.
                    </p>
                </header>

                <section className="bg-white border border-gray-200 rounded-lg shadow-sm">
                    <div className="px-6 py-5 border-b border-gray-200">
                        <h2 className="text-lg font-semibold">Features</h2>
                    </div>
                    <div className="px-6 py-5">
                        <label className="flex items-start gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                className="mt-1 h-4 w-4 accent-[#00548e] cursor-pointer"
                                checked={generateSummaries}
                                onChange={(event) => setGenerateSummaries(event.target.checked)}
                            />
                            <span className="flex-1">
                                <span className="block font-medium">Generate summaries</span>
                                <span className="block text-sm text-gray-600 mt-0.5">
                                    When enabled, the extension produces a summary of the
                                    transactions you copy. Off by default.
                                </span>
                            </span>
                        </label>
                    </div>
                </section>
            </div>
        </div>
    );
}
