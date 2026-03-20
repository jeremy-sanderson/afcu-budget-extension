import { useState, useEffect, useRef } from 'react';
import MenuItem from './MenuItem';

interface BudgetMenuProps {
    items: Array<{ text: string; onClick: () => void }>;
}

export default function BudgetMenu({ items }: BudgetMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };

        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, []);

    return (
        <div ref={menuRef} className="fixed top-[90px] right-[10px] z-[99999]">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="px-5 py-2.5 bg-[#00548e] text-white border-none rounded cursor-pointer"
            >
                Budgeting
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-1 bg-white border border-gray-300 rounded shadow-lg min-w-[200px]">
                    {items.map((item) => (
                        <MenuItem key={item.text} text={item.text} onClick={item.onClick} />
                    ))}
                </div>
            )}
        </div>
    );
}
