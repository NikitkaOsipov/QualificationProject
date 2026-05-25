interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary';
}

const Button = ({
    type = 'button',
    className = '',
    variant = 'primary',
    ...props
}: ButtonProps) => {
    const base = 'inline-flex items-center px-4 py-2 rounded-md transition font-medium';
    const gradientPrimary = 'bg-gradient-to-r from-[#8B008B] via-[#45008B] to-[#00668B] text-white hover:brightness-110 active:brightness-95';
    if (variant === 'secondary') {
        return (
            <div className="p-[1px] rounded-md bg-gradient-to-r from-[#8B008B] via-[#45008B] to-[#00668B] inline-block">
                <button
                    type={type}
                    className={`${base} bg-white text-black rounded-md w-full h-full ${className}`}
                    {...props}
                >
                    {props.children}
                </button>
            </div>
        );
    }
    return (
        <button
            type={type}
            className={`${base} ${gradientPrimary} ${className}`}
            {...props}
        />
    );
};

export default Button;
