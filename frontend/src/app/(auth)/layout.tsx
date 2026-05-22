import Link from 'next/link';
import AuthCard from '@/app/(auth)/AuthCard';
import ApplicationLogo from '@/components/ApplicationLogo';

const Layout = ({ children }) => {
    return (
        <div className="h-full overflow-hidden">
            <AuthCard
                logo={
                    <Link href="/" className="hidden md:block">
                        <ApplicationLogo className="h-40 xl:h-48 w-auto fill-current " />
                    </Link>
                }>
                {children}
            </AuthCard>
        </div>
    );
}

export default Layout;
