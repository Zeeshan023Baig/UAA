// useCart is now used inside ProductCard
import { useProducts } from '../context/ProductContext';
import { ShoppingBag, Info, Loader } from 'lucide-react';
import { useState } from 'react';
import ProductCard from '../components/ProductCard';

const Catalogue = () => {
    // Moved cart logic to ProductCard, only need general product data here
    const { products, loading } = useProducts();
    const [activeCategory, setActiveCategory] = useState('All');

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <Loader className="w-8 h-8 text-accent animate-spin" />
            </div>
        );
    }

    const filteredProducts = activeCategory === 'All'
        ? products
        : products.filter(p => p.category === activeCategory);

    return (

        <div className="space-y-12">
            <header className="text-center space-y-4">
                <h1 className="text-4xl md:text-5xl font-serif text-white">The Collection</h1>
                <p className="text-white/60 max-w-xl mx-auto">
                    Meticulously crafted eyewear for the discerning individual.
                    Choose from our exclusive range of optical and solar frames.
                </p>
            </header>

            {/* Filter Tabs */}
            <div className="flex justify-center gap-6 border-b border-white/10 pb-4">
                {['All', 'In-house', 'International', 'Indian'].map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`text-sm tracking-widest uppercase pb-4 border-b-2 transition-colors ${activeCategory === cat ? 'border-[#38bdf8] text-[#38bdf8]' : 'border-transparent text-white/40 hover:text-white'
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                {filteredProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    );
};

export default Catalogue;
