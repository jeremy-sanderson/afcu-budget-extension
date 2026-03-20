interface MenuItemProps {
    text: string;
    onClick: () => void;
}

export default function MenuItem({ text, onClick }: MenuItemProps) {
    return (
        <button
            onClick={onClick}
            className="block w-full text-left px-5 py-2.5 text-black bg-white border-none cursor-pointer hover:bg-[#f1f1f1]"
        >
            {text}
        </button>
    );
}
