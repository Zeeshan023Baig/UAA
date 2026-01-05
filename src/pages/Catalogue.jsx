// useCart is now used inside ProductCard
import { useProducts } from '../context/ProductContext';
import { ShoppingBag, Info, Loader, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import PaginationControls from '../components/PaginationControls';

const Catalogue = () => {
    // Moved cart logic to ProductCard, only need general product data here
    const { products, loading } = useProducts();
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

    // Reset to page 1 when category or search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [activeCategory, searchQuery]);

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

    // Pagination Logic
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            // Optional: Scroll to top of grid
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (

        <div className="space-y-12 pb-12">
            <header className="text-center space-y-4">
                <h1 className="text-4xl md:text-5xl font-serif text-secondary">The Collection</h1>
                <p className="text-muted max-w-xl mx-auto">
                    Meticulously crafted eyewear for the discerning individual.
                    Choose from our exclusive range of optical and solar frames.
                </p>


            </header>

            {/* Filter Tabs */}
            <div className="flex justify-center gap-6 border-b border-border pb-4">
                {['All', 'In-house', 'International', 'Indian'].map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`text-sm tracking-widest uppercase pb-4 border-b-2 transition-colors ${activeCategory === cat ? 'border-accent text-accent' : 'border-transparent text-muted hover:text-secondary'
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                {paginatedProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>

            {/* Pagination Controls */}
            <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
            />

            {/* Search Bar */}
            <div className="max-w-md mx-auto relative mt-12 mb-8">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                <input
                    type="text"
                    placeholder="Search for frames..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-surface border border-border rounded-full py-3 pl-10 pr-4 text-secondary placeholder:text-muted focus:outline-none focus:border-accent transition-colors shadow-lg"
                />
            </div>

            {filteredProducts.length === 0 && (
                <div className="text-center py-12 text-muted">No products found.</div>
            )}
        </div>
    );
};

export default Catalogue;
