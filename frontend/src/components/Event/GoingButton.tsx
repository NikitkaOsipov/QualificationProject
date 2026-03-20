"use client";

type GoingButtonProps = {
    isGoing: boolean;
    onClick: (value: boolean) => void;
    disabled?: boolean;
}

export default function GoingButton({
                                        isGoing,
                                        onClick,
                                        disabled = false
                                    }: GoingButtonProps) {
    return (
        <button
            onClick={() => onClick(!isGoing)}
            disabled={disabled}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition
                ${
                isGoing
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }
                disabled:opacity-50
            `}
        >
            {isGoing ? "Going ✓" : "I'm going"}
        </button>
    )
}