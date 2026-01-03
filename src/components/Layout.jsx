import { Link, Outlet } from 'react-router-dom';
import { ShoppingCart, Menu, X, Sun, Moon } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';

const Layout = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { cartCount: cartItemCount } = useCart();
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="min-h-screen flex flex-col bg-primary text-secondary font-sans selection:bg-[#38bdf8] selection:text-primary transition-colors duration-300">
            <div id="page-top" className="absolute top-0 w-full h-0" />
            {/* Navbar */}
            <nav className="relative z-50 bg-primary/95 backdrop-blur-sm border-b border-border transition-colors duration-300">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex flex-col items-center">
                        <Link to="/" className="block w-16 md:w-24">
                            <img
                                src={theme === 'dark' ? "/logo.png" : "/logo_light.jpg"}
                                alt="UAA Logo"
                                className={`w-full h-auto object-contain p-1 rounded-sm ${theme === 'dark' ? 'bg-white' : 'transparent'}`}
                            />
                        </Link>
                        <span className="text-xs font-serif text-muted tracking-wider mt-1 text-center">Your Vision, Elevated.</span>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link to="/" className="hover:text-accent transition-colors duration-300 text-sm uppercase tracking-widest">Home</Link>
                        <Link to="/catalogue" className="hover:text-accent transition-colors duration-300 text-sm uppercase tracking-widest">Catalogue</Link>
                        <Link to="/cart" className="relative group p-2 flex items-center gap-2">
                            <ShoppingCart className="w-5 h-5 group-hover:text-accent transition-colors" />
                            <span className="text-sm uppercase tracking-widest hover:text-accent transition-colors duration-300">Cart</span>
                            {cartItemCount > 0 && (
                                <span className="absolute -top-1 right-8 bg-accent text-primary text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                                    {cartItemCount}
                                </span>
                            )}
                        </Link>

                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full hover:bg-white/10 transition-colors"
                            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                        >
                            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center gap-4">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full hover:bg-white/10 transition-colors"
                        >
                            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>
                        <button
                            className="text-secondary hover:text-accent"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            {isMenuOpen ? <X /> : <Menu />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden absolute w-full bg-primary border-b border-border animate-in slide-in-from-top-5">
                        <div className="flex flex-col p-6 space-y-4">
                            <Link to="/" onClick={() => setIsMenuOpen(false)} className="hover:text-accent text-lg">Home</Link>
                            <Link to="/catalogue" onClick={() => setIsMenuOpen(false)} className="hover:text-accent text-lg">Catalogue</Link>
                            <Link to="/cart" onClick={() => setIsMenuOpen(false)} className="hover:text-accent text-lg flex items-center gap-2">
                                Cart {cartItemCount > 0 && `(${cartItemCount})`}
                            </Link>
                        </div>
                    </div>
                )}
            </nav>

            {/* Main Content */}
            <main className="flex-grow container mx-auto px-4 py-8 md:px-0">
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="border-t border-border bg-surface mt-auto">
                <div className="container mx-auto px-6 py-8 text-center text-sm">
                    <p className="text-accent">&copy; {new Date().getFullYear()} United Associates Agencies. All rights reserved.</p>
                    <p className="mt-2 text-xs text-orange-400">Excellence in Optics</p>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
