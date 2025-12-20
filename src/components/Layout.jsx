import { Link, Outlet } from 'react-router-dom';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '../context/CartContext';

const Layout = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { cartCount: cartItemCount } = useCart();

    return (
        <div className="min-h-screen flex flex-col bg-primary text-secondary font-sans selection:bg-[#38bdf8] selection:text-primary">
            <div id="page-top" className="absolute top-0 w-full h-0" />
            {/* Navbar */}
            <nav className="sticky top-0 z-50 bg-primary/95 backdrop-blur-sm border-b border-white/10">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex flex-col items-center">
                        <Link to="/" className="block w-16 md:w-24">
                            <img src="/logo.png" alt="UAA Logo" className="w-full h-auto object-contain bg-white p-1 rounded-sm" />
                        </Link>
                        <span className="text-xs font-serif text-white/70 tracking-wider mt-1 text-center">Your Vision, Elevated.</span>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link to="/" className="hover:text-[#38bdf8] transition-colors duration-300 text-sm uppercase tracking-widest">Home</Link>
                        <Link to="/catalogue" className="hover:text-[#38bdf8] transition-colors duration-300 text-sm uppercase tracking-widest">Catalogue</Link>
                        <Link to="/cart" className="relative group p-2">
                            <ShoppingCart className="w-5 h-5 group-hover:text-[#38bdf8] transition-colors" />
                            {cartItemCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-[#38bdf8] text-primary text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                                    {cartItemCount}
                                </span>
                            )}
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden text-secondary hover:text-[#38bdf8]"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden absolute w-full bg-primary border-b border-white/10 animate-in slide-in-from-top-5">
                        <div className="flex flex-col p-6 space-y-4">
                            <Link to="/" onClick={() => setIsMenuOpen(false)} className="hover:text-[#38bdf8] text-lg">Home</Link>
                            <Link to="/catalogue" onClick={() => setIsMenuOpen(false)} className="hover:text-[#38bdf8] text-lg">Catalogue</Link>
                            <Link to="/cart" onClick={() => setIsMenuOpen(false)} className="hover:text-[#38bdf8] text-lg flex items-center gap-2">
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
            <footer className="border-t border-white/10 bg-black/20 mt-auto">
                <div className="container mx-auto px-6 py-8 text-center text-sm">
                    <p className="text-[#38bdf8]">&copy; {new Date().getFullYear()} United Associates Agencies. All rights reserved.</p>
                    <p className="mt-2 text-xs text-orange-400">Excellence in Optics</p>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
