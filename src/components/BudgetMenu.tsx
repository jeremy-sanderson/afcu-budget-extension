import { Menu } from '@ark-ui/react';

interface BudgetMenuProps {
    items: Array<{ text: string; onClick: () => void }>;
}

export default function BudgetMenu({ items }: BudgetMenuProps) {
    return (
        <Menu.Root>
            <div className="fixed top-[90px] right-[10px] z-[99999]">
                <Menu.Trigger className="px-5 py-2.5 bg-[#00548e] text-white border-none rounded-md cursor-pointer">
                    Budgeting
                </Menu.Trigger>
                <Menu.Positioner>
                    <Menu.Content className="bg-white border border-gray-300 rounded-md shadow-lg min-w-[200px]">
                        {items.map((item) => (
                            <Menu.Item
                                key={item.text}
                                value={item.text}
                                className="block w-full text-left px-5 py-2.5 text-black bg-white border-none cursor-pointer data-[highlighted]:bg-[#f1f1f1]"
                                onSelect={item.onClick}
                            >
                                {item.text}
                            </Menu.Item>
                        ))}
                    </Menu.Content>
                </Menu.Positioner>
            </div>
        </Menu.Root>
    );
}
