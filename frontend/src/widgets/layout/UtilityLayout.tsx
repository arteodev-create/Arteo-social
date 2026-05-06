import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Logo } from '@shared/ui';
import PageHeader from './PageHeader';
import { ChevronRight, ArrowLeft } from 'lucide-react';

interface UtilityLayoutProps {
    children: React.ReactNode;
    title: string;
    links: { label: string; href: string; active?: boolean }[];
}

const UtilityLayout: React.FC<UtilityLayoutProps> = ({ children, title, links }) => {
    const location = useLocation();
    const navigate = useNavigate();

    return (
        <div className="bg-white text-black min-h-screen flex justify-center gap-0 md:gap-6 px-0 md:px-4 relative font-bold">
            <aside className="w-[280px] hidden md:flex flex-col py-8 px-6 sticky top-0 h-screen z-50 flex-shrink-0 border-r border-zinc-100">
                <div className="mb-10 flex items-center gap-4">
                    <Link to="/" className="transition-none">
                        <Logo size={32} color="#000" />
                    </Link>
                    <div className="h-4 w-[1px] bg-zinc-100 mx-1" />
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2.5 -ml-2.5 hover:bg-zinc-100 rounded-[0px] transition-all duration-300"
                    >
                        <ArrowLeft size={18} strokeWidth={1.2} className="text-black" />
                    </button>
                </div>

                <div className="mb-10">
                    <h1 className="text-[32px] font-bold tracking-tighter leading-tight text-black">{title}</h1>
                </div>

                <nav className="flex-1 space-y-2">
                    {links.map((link, index) => {
                        const isActive = location.pathname === link.href;
                        return (
                            <Link
                                key={index}
                                to={link.href}
                                className={`
                                    flex items-center justify-between px-6 py-4 transition-all group border rounded-[8px]
                                    ${isActive
                                        ? 'bg-black text-white border-black shadow-none shadow-black/10'
                                        : 'bg-white text-zinc-400 hover:text-black border-transparent hover:border-zinc-100'
                                    }
                                `}
                            >
                                <span className="text-[13px] font-bold tracking-tight">{link.label}</span>
                                {isActive && <ChevronRight size={14} />}
                            </Link>
                        );
                    })}
                </nav>

                <div className="mt-auto py-8 border-t border-zinc-100">
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-[11px] font-bold tracking-tight text-zinc-400">
                        <Link to="/about" className="hover:text-black transition-colors">About</Link>
                        <Link to="/locations" className="hover:text-black transition-colors">Locations</Link>
                        <Link to="/about" className="hover:text-black transition-colors">Founder</Link>
                    </div>
                </div>
            </aside>

            <main className="max-w-[600px] w-0 flex-1 min-h-screen md:py-4 flex flex-col border-x border-zinc-100">
                <div className="bg-white min-h-screen md:min-h-[95vh] relative flex flex-col flex-1 transition-none overflow-hidden">
                    <div className="md:hidden border-b border-zinc-100 p-4">
                         <PageHeader
                            title={title}
                            showBackButton={true}
                            onBackClick={() => navigate(-1)}
                        />
                    </div>
                    <div className="flex-1 overflow-y-auto no-scrollbar p-6 md:p-14">
                        <div className="max-w-prose mx-auto">
                            {children}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default UtilityLayout;
