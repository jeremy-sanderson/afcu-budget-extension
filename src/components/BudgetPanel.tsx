interface BudgetPanelProps {
    items: Array<{ text: string; onClick: () => void }>;
}

export default function BudgetPanel({ items }: BudgetPanelProps) {
    return (
        <div className="fixed top-1/2 left-[10px] -translate-y-1/2 z-[99999] hidden wide:block">
            <div className="bg-white border border-gray-300 rounded-md shadow-lg overflow-hidden">
                <div className="px-5 py-2.5 bg-[#00548e] text-white">Budgeting</div>
                {items.map((item) => (
                    <button
                        key={item.text}
                        type="button"
                        onClick={item.onClick}
                        className="block w-full text-left px-5 py-2.5 text-black bg-white border-none cursor-pointer hover:bg-[#f1f1f1] focus:bg-[#f1f1f1]"
                    >
                        {item.text}
                    </button>
                ))}
            </div>
        </div>
    );
}
