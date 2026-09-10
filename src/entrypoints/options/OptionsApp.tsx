import {
    useDebugLogging,
    useGenerateSummaries,
    useTransactionSource,
    type TransactionSource,
} from '../../utils/settings';

const TRANSACTION_SOURCE_OPTIONS: Array<{
    value: TransactionSource;
    label: string;
    description: string;
}> = [
    {
        value: 'api',
        label: 'Bank data',
        description:
            'Copies the full statement description the bank records, such as "VISA - 08/22 NETFLIX.COM NETFLIX.COM CA". Uses the page text when that data is unavailable. This is the default.',
    },
    {
        value: 'page',
        label: 'Page text',
        description:
            'Copies the description shown in the transaction list, which may be a shortened merchant name such as "Netflix".',
    },
];

export default function OptionsApp() {
    const [generateSummaries, setGenerateSummaries] = useGenerateSummaries();
    const [debugLogging, setDebugLogging] = useDebugLogging();
    const [transactionSource, setTransactionSource] = useTransactionSource();

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
                    <div className="px-6 py-5 border-t border-gray-200">
                        <label className="flex items-start gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                className="mt-1 h-4 w-4 accent-[#00548e] cursor-pointer"
                                checked={debugLogging}
                                onChange={(event) => setDebugLogging(event.target.checked)}
                            />
                            <span className="flex-1">
                                <span className="block font-medium">Debug logging</span>
                                <span className="block text-sm text-gray-600 mt-0.5">
                                    When enabled, the extension prints diagnostic messages to the
                                    browser console. Off by default.
                                </span>
                            </span>
                        </label>
                    </div>
                </section>

                <section className="mt-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                    <div className="px-6 py-5 border-b border-gray-200">
                        <h2 className="text-lg font-semibold">Transaction source</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Where copied transaction descriptions come from.
                        </p>
                    </div>
                    <fieldset className="px-6 py-5">
                        <legend className="sr-only">Transaction source</legend>
                        <div className="space-y-4">
                            {TRANSACTION_SOURCE_OPTIONS.map((option) => (
                                <label
                                    key={option.value}
                                    className="flex items-start gap-3 cursor-pointer"
                                >
                                    <input
                                        type="radio"
                                        name="transactionSource"
                                        value={option.value}
                                        className="mt-1 h-4 w-4 accent-[#00548e] cursor-pointer"
                                        checked={transactionSource === option.value}
                                        onChange={() => setTransactionSource(option.value)}
                                    />
                                    <span className="flex-1">
                                        <span className="block font-medium">{option.label}</span>
                                        <span className="block text-sm text-gray-600 mt-0.5">
                                            {option.description}
                                        </span>
                                    </span>
                                </label>
                            ))}
                        </div>
                    </fieldset>
                </section>
            </div>
        </div>
    );
}
