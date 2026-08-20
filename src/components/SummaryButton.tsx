interface SummaryButtonProps {
    onClick: () => void;
    isLoading: boolean;
}

export default function SummaryButton({ onClick, isLoading }: SummaryButtonProps) {
    return (
        <button
            type="button"
            onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onClick();
            }}
            disabled={isLoading}
            aria-label="Generate summary"
            title="Generate summary"
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '24px',
                height: '24px',
                padding: 0,
                background: 'transparent',
                border: 'none',
                borderRadius: '4px',
                color: '#00548e',
                cursor: isLoading ? 'progress' : 'pointer',
                opacity: isLoading ? 0.4 : 1,
            }}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                width="16"
                height="16"
                aria-hidden="true"
            >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="8" y1="13" x2="16" y2="13" />
                <line x1="8" y1="17" x2="16" y2="17" />
                <line x1="8" y1="9" x2="10" y2="9" />
            </svg>
        </button>
    );
}
