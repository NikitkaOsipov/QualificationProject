const Button = ({ type = 'submit', className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button
        type={type}
        className={`${className} inline-flex items-center px-4 py-2 rounded-md font-semibold text-xs text-white uppercase tracking-widest bg-gradient-to-r from-[#8B008B] via-[#45008B] to-[#00668B] hover:brightness-125 active:brightness-90`}
        {...props}
    />
);

export default Button;
