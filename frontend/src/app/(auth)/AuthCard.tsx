const AuthCard = ({ logo, children }) => (
    <div className="flex flex-col justify-center items-center h-full">
        <div>{logo}</div>

        <div className="w-full max-w-md px-1 sm:px-0">
            {children}
        </div>
    </div>
)

export default AuthCard
