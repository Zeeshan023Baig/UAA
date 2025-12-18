// useCart is now used inside ProductCard
import { useProducts } from '../context/ProductContext';
import { ShoppingBag, Info, Loader, Search } from 'lucide-react';
import { useState } from 'react';
import ProductCard from '../components/ProductCard';

const Catalogue = () => {
    // Moved cart logic to ProductCard, only need general product data here
    const { products, loading } = useProducts();
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <Loader className="w-8 h-8 text-accent animate-spin" />
            </div>
        );
    }

    const filteredProducts = products.filter(product => {
        const matchesCategory = activeCategory === 'All' || product.category === activeCategory;
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.category.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (

        <div className="space-y-12">
            <header className="text-center space-y-4">
                <h1 className="text-4xl md:text-5xl font-serif text-white">The Collection</h1>
                <p className="text-white/60 max-w-xl mx-auto">
                    Meticulously crafted eyewear for the discerning individual.
                    Choose from our exclusive range of optical and solar frames.
                </p>

                {/* Search Bar */}
                <div className="max-w-md mx-auto relative mt-8">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                        type="text"
                        placeholder="Search for frames..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-full py-3 pl-10 pr-4 text-white placeholder:text-white/40 focus:outline-none focus:border-[#38bdf8] transition-colors"
                    />
                </div>
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
