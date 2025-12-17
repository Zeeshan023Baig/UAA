import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductContext';
import { ShoppingBag, Info, Loader } from 'lucide-react';
import { useState } from 'react';

const Catalogue = () => {
    const { addToCart, cartItems, updateQuantity, removeFromCart } = useCart();
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

    const getCartQuantity = (id) => {
        return cartItems.find(item => item.id === id)?.quantity || 0;
    };

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
                {filteredProducts.map(product => {
                    const isOutOfStock = product.stock <= 0;
                    const quantityInCart = getCartQuantity(product.id);

                    return (
                        <div key={product.id} className="group flex flex-col space-y-4">
                            <div className="relative aspect-[4/3] overflow-hidden bg-white/5 rounded-sm">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className={`object-cover w-full h-full transform transition-transform duration-700 ${isOutOfStock ? 'grayscale opacity-50' : 'group-hover:scale-105'}`}
                                />
                                {!isOutOfStock && (
                                    <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                        <p className="text-xs text-white/80 flex items-center gap-2">
                                            <Info className="w-3 h-3 text-[#38bdf8]" /> {product.specs}
                                        </p>
                                    </div>
                                )}
                                {isOutOfStock && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                        <span className="px-4 py-2 bg-red-900/80 text-white text-xs font-bold uppercase tracking-widest border border-red-500/50">Sold Out</span>
                                    </div>
                                )}
                                {quantityInCart > 0 && (
                                    <div className="absolute top-2 right-2 bg-[#38bdf8] text-primary font-bold w-8 h-8 rounded-full flex items-center justify-center shadow-lg">
                                        {quantityInCart}
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-serif text-white group-hover:text-[#38bdf8] transition-colors">{product.name}</h3>
                                    <p className="text-sm text-white/40">{product.category}</p>
                                </div>
                                <div className="text-right">
                                    <span className="block text-lg font-medium text-[#38bdf8]">₹{product.price}</span>
                                    <span className={`text-xs ${product.stock < 10 ? 'text-orange-400' : 'text-green-400'}`}>
                                        {product.stock} left in stock
                                    </span>
                                </div>
                            </div>

                            {quantityInCart > 0 ? (
                                <div className="flex items-center justify-between bg-[#38bdf8] rounded-sm overflow-hidden">
                                    <button
                                        onClick={() => quantityInCart === 1 ? removeFromCart(product.id) : updateQuantity(product.id, -1)}
                                        className="px-4 py-3 bg-[#38bdf8] hover:bg-white text-primary transition-colors font-bold text-lg"
                                    >
                                        -
                                    </button>
                                    <span className="text-primary font-bold text-sm tracking-widest uppercase">
                                        {quantityInCart} in Cart
                                    </span>
                                    <button
                                        onClick={() => updateQuantity(product.id, 1)}
                                        disabled={quantityInCart >= product.stock}
                                        className="px-4 py-3 bg-[#38bdf8] hover:bg-white text-primary transition-colors font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        +
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => addToCart(product)}
                                    disabled={isOutOfStock}
                                    className={`w-full py-3 border flex items-center justify-center gap-2 uppercase text-xs tracking-widest font-bold transition-colors duration-300
                                    ${isOutOfStock
                                            ? 'bg-transparent border-white/5 text-white/20 cursor-not-allowed'
                                            : 'bg-white/5 border-white/10 text-white/80 hover:bg-[#38bdf8] hover:text-primary hover:border-[#38bdf8]'
                                        }`}
                                >
                                    <ShoppingBag className="w-4 h-4" /> {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Catalogue;
