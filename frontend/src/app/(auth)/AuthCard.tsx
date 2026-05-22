const AuthCard = ({ logo, children }) => (
    <div className="flex min-h-full flex-col items-center justify-center">
        <div>{logo}</div>

        <div className="w-full max-w-md px-4 sm:px-0 pt-5 sm:pt-0">
            {children}
        </div>
    </div>
)

export default AuthCard

