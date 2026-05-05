import CopyIcon from './CopyIcon';
import CheckIcon from './CheckIcon';

interface CopyButtonProps {
    label: string;
    isCopied: boolean;
    onClick: () => void;
}

export default function CopyButton({ label, isCopied, onClick }: CopyButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={label}
            title={label}
            className="inline-flex items-center justify-center w-8 h-8 rounded text-gray-600 bg-transparent border-none cursor-pointer hover:bg-gray-100 hover:text-[#00548e]"
        >
            {isCopied ? <CheckIcon /> : <CopyIcon />}
        </button>
    );
}
