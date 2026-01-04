import { useState, useEffect } from 'react';
import { ShoppingBag, Info } from 'lucide-react';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
    const { addToCart, cartItems, updateQuantity, removeFromCart } = useCart();
    const cartItem = cartItems.find(item => item.id === product.id);
    const quantityInCart = cartItem?.quantity || 0;

    // Local input state
    const [inputValue, setInputValue] = useState(1);

    const isOutOfStock = product.stock <= 0;

    // Sync input with cart quantity when it changes
    useEffect(() => {
        if (quantityInCart > 0) {
            setInputValue(quantityInCart);
        } else if (quantityInCart === 0 && inputValue === 0) {
            // If removed from cart, reset to 1
            setInputValue(1);
        }
        // Ideally we don't reset to 1 if user is typing a new number for a non-cart item
        // But if quantityInCart > 0, we should reflect it.
    }, [quantityInCart]);

    const handleInputChange = (e) => {
        const val = e.target.value;
        if (val === '') {
            setInputValue('');
            return;
        }

        const num = parseInt(val);
        if (!isNaN(num)) {
            setInputValue(num); // Allow typing any number, we validate on submit/blur
        }
    };

    const handleInputBlur = () => {
        if (inputValue === '' || inputValue < 1) {
            setInputValue(quantityInCart > 0 ? quantityInCart : 1);
        } else if (inputValue > product.stock) {
            setInputValue(product.stock);
        }
    };

    const handleAction = () => {
        const qty = parseInt(inputValue);
        if (!qty || qty < 1) return;

        // Cap at stock
        const finalQty = Math.min(qty, product.stock);
        if (finalQty !== qty) {
            setInputValue(finalQty);
        }

        if (quantityInCart > 0) {
            // Update mode: set to exact value
            const delta = finalQty - quantityInCart;
            if (delta !== 0) {
                updateQuantity(product.id, delta);
            }
        } else {
            // Add mode
            addToCart(product, finalQty);
        }
    };

    // Debounced update for existing cart items
    useEffect(() => {
        if (quantityInCart > 0) {
            // Only debounce if value is different from current cart quantity
            // and is a valid number
            const val = parseInt(inputValue);
            if (!isNaN(val) && val > 0 && val !== quantityInCart) {
                const timeoutId = setTimeout(() => {
                    // Update: calculate delta
                    const finalQty = Math.min(val, product.stock);
                    const delta = finalQty - quantityInCart;
                    if (delta !== 0) {
                        updateQuantity(product.id, delta);
                    }
                }, 600);
                return () => clearTimeout(timeoutId);
            }
        }
    }, [inputValue, quantityInCart, product.stock, updateQuantity, product.id]);

    return (
        <div className="group flex flex-col space-y-4">
            <div className="relative aspect-[4/3] overflow-hidden bg-surface rounded-sm">
                <img
                    src={product.image}
                    alt={product.name}
                    className={`object-cover w-full h-full transform transition-transform duration-700 ${isOutOfStock ? 'grayscale opacity-50' : 'group-hover:scale-105'}`}
                />
                {!isOutOfStock && (
                    <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <p className="text-xs text-white/80 flex items-center gap-2">
                            <Info className="w-3 h-3 text-accent" /> {product.specs}
                        </p>
                    </div>
                )}
                {isOutOfStock && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <span className="px-4 py-2 bg-red-900/80 text-white text-xs font-bold uppercase tracking-widest border border-red-500/50">Sold Out</span>
                    </div>
                )}
                {quantityInCart > 0 && (
                    <div className="absolute top-2 right-2 bg-accent text-primary font-bold w-8 h-8 rounded-full flex items-center justify-center shadow-lg">
                        {quantityInCart}
                    </div>
                )}
            </div>

            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-xl font-serif text-secondary group-hover:text-accent transition-colors">{product.name}</h3>
                    <p className="text-sm text-muted">{product.category}</p>
                </div>
                <div className="text-right">
                    <span className="block text-lg font-medium text-accent">₹{product.price}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${product.stock < 10 ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200' : 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200'}`}>
                        {product.stock} left in stock
                    </span>
                </div>
            </div>

            {/* Quantity Input Area */}
            {!isOutOfStock && (
                product.externalLink ? (
                    <a
                        href={product.externalLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-3 border border-border bg-surface text-secondary hover:bg-accent hover:text-primary hover:border-accent flex items-center justify-center gap-2 uppercase text-xs tracking-widest font-bold transition-colors duration-300"
                    >
                        <Info className="w-4 h-4" /> View Details
                    </a>
                ) : (
                    <div className="flex gap-2">
                        <input
                            type="number"
                            min="1"
                            max={product.stock}
                            value={inputValue}
                            onChange={handleInputChange}
                            onBlur={handleInputBlur}
                            className="w-20 bg-primary border border-border text-center text-secondary p-3 rounded-sm focus:border-accent focus:outline-none"
                        />

                        {quantityInCart === 0 ? (
                            <button
                                onClick={handleAction}
                                className="flex-1 py-3 border border-border bg-surface text-secondary hover:bg-accent hover:text-primary hover:border-accent flex items-center justify-center gap-2 uppercase text-xs tracking-widest font-bold transition-colors duration-300"
                            >
                                <ShoppingBag className="w-4 h-4" /> Add to Cart
                            </button>
                        ) : (
                            <div className="flex-1 flex items-center justify-center gap-2 text-green-400 text-xs font-bold uppercase tracking-widest border border-border bg-surface rounded-sm">
                                <span className="animate-pulse">In Cart</span>
                            </div>
                        )}

                        {quantityInCart > 0 && (
                            <button
                                onClick={() => removeFromCart(product.id)}
                                className="px-4 border border-red-500/50 text-red-400 hover:bg-red-500 hover:text-white transition-colors rounded-sm"
                                title="Remove from cart"
                            >
                                <span className="sr-only">Remove</span>
                                x
                            </button>
                        )}
                    </div>
                )
            )}
            {isOutOfStock && (
                <button
                    disabled
                    className="w-full py-3 border border-border bg-transparent text-muted cursor-not-allowed uppercase text-xs tracking-widest font-bold flex items-center justify-center gap-2"
                >
                    <ShoppingBag className="w-4 h-4" /> Out of Stock
                </button>
            )}
        </div>
    );
};

export default ProductCard;
