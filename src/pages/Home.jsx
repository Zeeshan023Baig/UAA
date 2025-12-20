import { Link } from 'react-router-dom';
import { ArrowRight, Eye, Calendar } from 'lucide-react';

import { useProducts } from '../context/ProductContext';
import { ShoppingBag } from 'lucide-react';

const Home = () => {
    const { products } = useProducts();
    const featuredProducts = products.slice(0, 3);

    return (
        <div className="space-y-24 pb-12">
            {/* Hero Section */}
            <section className="relative -mt-8 py-24 flex flex-col items-center justify-center text-center min-h-[70vh] overflow-hidden">
                {/* Video Background Layer - z-0 */}
                <div className="absolute inset-0 z-0">
                    <iframe
                        className="absolute top-1/2 left-1/2 w-[400%] h-[400%] -translate-x-1/2 -translate-y-1/2 object-cover opacity-40 pointer-events-none saturate-0 contrast-125"
                        src="https://www.youtube.com/embed/nrOX6ackB14?autoplay=1&mute=1&controls=0&loop=1&playlist=nrOX6ackB14&showinfo=0&rel=0&iv_load_policy=3&disablekb=1"
                        title="Background Video"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                    <div className="absolute inset-0 bg-black/30 pointer-events-none"></div>
                </div>

                {/* Content Layer - z-10 */}
                <div className="relative z-10 flex flex-col items-center">
                    <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 bg-gradient-to-r from-white via-white to-white/50 bg-clip-text text-transparent transform animate-in fade-in slide-in-from-bottom-4 duration-1000">
                        United Associates <br /> <span className="text-[#38bdf8]">Agencies</span>
                    </h1>
                    <p className="text-xl text-white/60 max-w-2xl mx-auto mb-10 font-light leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                        curating the finest optical experiences with precision, elegance, and clarity.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                        <Link to="/catalogue" className="group relative px-8 py-3 bg-[#38bdf8] text-primary font-bold tracking-wider hover:bg-white transition-colors duration-300 rounded-sm">
                            EXPLORE CATALOGUE
                            <span className="absolute inset-0 border border-white/20 translate-x-1 translate-y-1 -z-10 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-300"></span>
                        </Link>
                    </div>
                </div>
            </section>


            {/* Philosophy Section */}
            <section className="container mx-auto px-6">
                <div className="bg-white/5 border border-white/10 rounded-xl p-8 md:p-12 text-center md:text-left flex flex-col md:flex-row items-center gap-12">
                    <div className="md:w-1/2 space-y-6">
                        <span className="text-[#38bdf8] text-sm font-bold tracking-[0.2em] uppercase">Our Philosophy</span>
                        <h2 className="text-3xl md:text-4xl font-serif text-white">Vision Beyond Sight</h2>
                        <p className="text-white/60 leading-relaxed">
                            We believe that eyewear is more than just a utility—it's an extension of your personality.
                            Every frame in our collection is selected for its craftsmanship, durability, and timeless style.
                            We are dedicated to bringing you the world's finest optical engineering.
                        </p>
                        <div className="flex gap-8 pt-4">
                            <div className="text-center md:text-left">
                                <p className="text-2xl font-bold text-white">100+</p>
                                <p className="text-xs text-white/40 uppercase tracking-wider">Premium Brands</p>
                            </div>
                            <div className="text-center md:text-left">
                                <p className="text-2xl font-bold text-white">24/7</p>
                                <p className="text-xs text-white/40 uppercase tracking-wider">Support</p>
                            </div>
                            <div className="text-center md:text-left">
                                <p className="text-2xl font-bold text-white">Instant</p>
                                <p className="text-xs text-white/40 uppercase tracking-wider">Delivery</p>
                            </div>
                        </div>
                    </div>
                    <div className="md:w-1/2 relative h-64 md:h-auto w-full">
                        <img
                            src="https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80"
                            alt="Philosophy"
                            className="rounded-lg object-cover w-full h-full shadow-2xl border border-white/10"
                        />
                    </div>
                </div>
            </section>

            {/* Trending Now */}
            <section className="container mx-auto px-6 py-12">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <span className="text-[#38bdf8] text-sm font-bold tracking-[0.2em] uppercase">Trending</span>
                        <h2 className="text-3xl font-serif text-white mt-2">Latest Arrivals</h2>
                    </div>
                    <Link to="/catalogue" className="hidden md:flex items-center gap-2 text-white/60 hover:text-[#38bdf8] transition-colors text-sm uppercase tracking-widest">
                        View All <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {featuredProducts.map(product => (
                        <div key={product.id} className="group cursor-pointer">
                            <div className="overflow-hidden rounded-md bg-white/5 mb-4 aspect-[4/3] relative">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                    <Link to="/catalogue" className="bg-[#38bdf8] text-primary px-6 py-2 rounded-full font-bold text-sm transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                        View Details
                                    </Link>
                                </div>
                            </div>
                            <h3 className="text-lg font-serif text-white group-hover:text-[#38bdf8] transition-colors">{product.name}</h3>
                            <p className="text-sm text-white/40">{product.category}</p>
                            <p className="text-[#38bdf8] font-bold mt-1">₹{product.price}</p>
                        </div>
                    ))}
                </div>
                <div className="mt-8 text-center md:hidden">
                    <Link to="/catalogue" className="inline-flex items-center gap-2 text-white/60 hover:text-[#38bdf8] transition-colors text-sm uppercase tracking-widest">
                        View All <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </section>

            {/* Features Overview */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-8 container mx-auto px-6">
                <Link to="/catalogue" className="block p-8 border border-white/10 bg-[#1e293b] hover:border-[#38bdf8]/50 transition-colors duration-500 group rounded-xl">
                    <div className="overflow-hidden rounded-lg mb-6 h-48">
                        <img
                            src="https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80"
                            alt="Premium Eyewear"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    </div>
                    <h3 className="text-2xl font-serif mb-4 text-white">Premium Eyewear</h3>
                    <p className="text-white/60 mb-6 leading-relaxed">
                        Discover our curated collection of luxury frames and lenses, designed for those who appreciate distinction.
                    </p>
                    <span className="text-[#38bdf8] text-sm tracking-widest uppercase group-hover:text-white transition-colors flex items-center gap-2">
                        View Collection <ArrowRight className="w-4 h-4" />
                    </span>
                </Link>

                <Link to="/catalogue" className="block p-8 border border-white/10 bg-[#1e293b] hover:border-[#38bdf8]/50 transition-colors duration-500 group rounded-xl">
                    <div className="overflow-hidden rounded-lg mb-6 h-48">
                        <img
                            src="https://images.unsplash.com/photo-1504194569429-ca0152bc2a3f?auto=format&fit=crop&w=800&q=80"
                            alt="Precision Lenses"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    </div>
                    <h3 className="text-2xl font-serif mb-4 text-white">Precision Lenses</h3>
                    <p className="text-white/60 mb-6 leading-relaxed">
                        Advanced digital surfacing and protective coatings for crystal clear vision in every environment.
                    </p>
                    <span className="text-[#38bdf8] text-sm tracking-widest uppercase group-hover:text-white transition-colors flex items-center gap-2">
                        View Lens Options <ArrowRight className="w-4 h-4" />
                    </span>
                </Link>
            </section>
        </div >
    );
};

export default Home;
