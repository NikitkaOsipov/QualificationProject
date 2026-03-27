function Tab({
                 label,
                 active,
                 onClick
             }: {
    label: string
    active: boolean
    onClick: () => void
}) {
    return (
        <button
            onClick={onClick}
            className={`pb-2 text-sm font-medium border-b-2 transition
                ${active
                ? "border-black text-black"
                : "border-transparent text-gray-500 hover:text-black"
            }`}
        >
            {label}
        </button>
    )
}

export default Tab;