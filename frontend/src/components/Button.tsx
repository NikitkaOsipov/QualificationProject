const Button = ({ type = 'submit', className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button
        type={type}
        className={`${className} inline-flex items-center px-4 py-2 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest bg-gradient-to-r from-[#8B008B] via-[#45008B] to-[#00668B] hover:brightness-110 active:brightness-95 focus:outline-none focus:ring-2 focus:ring-[#45008B]/40 focus:ring-offset-1 disabled:opacity-25 transition ease-in-out duration-150`}
        {...props}
    />
);

export default Button;
