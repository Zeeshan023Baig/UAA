import { useState, useEffect } from 'react';
import { ShoppingBag, Info, Plus, Minus, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
    const { addToCart, cartItems, updateQuantity, removeFromCart } = useCart();
    const cartItem = cartItems.find(item => item.id === product.id);
    const quantityInCart = cartItem?.quantity || 0;

    // Local input state
    const [inputValue, setInputValue] = useState(1);
    const [isHovered, setIsHovered] = useState(false);

    const isOutOfStock = product.stock <= 0;

    // Sync input with cart quantity when it changes, but only if not currently editing (handled by logic below)
    // Actually, simpler to just sync when cart quantity changes to keep it authoritative
    useEffect(() => {
        if (quantityInCart > 0) {
            setInputValue(quantityInCart);
        } else {
            setInputValue(1);
        }
    }, [quantityInCart]);

    const handleInputChange = (e) => {
        const val = e.target.value;
        // Allow empty string for typing
        if (val === '') {
            setInputValue('');
            return;
        }

        const num = parseInt(val);
        if (!isNaN(num)) {
            // Limit to max stock
            if (num > product.stock) {
                setInputValue(product.stock);
            } else if (num < 1) {
                setInputValue(1);
            } else {
                setInputValue(num);
            }
        }
    };

    const handleBlur = () => {
        if (inputValue === '' || inputValue < 1) {
            setInputValue(quantityInCart > 0 ? quantityInCart : 1);
        }
    };

    const handleAction = () => {
        const qty = parseInt(inputValue);
        if (!qty || qty < 1) return;

        if (quantityInCart > 0) {
            // If strictly different, update
            if (qty !== quantityInCart) {
                // We need to calculate the difference if updateQuantity takes delta
                // Checking CartContext usage in Catalogue.jsx: 
                // updateQuantity(id, 1) or updateQuantity(id, -1) suggests it takes delta?
                // Wait, typically updateQuantity(id, newQuantity) is better, but maybe the context is delta based.
                // Let's check how it was used: `updateQuantity(product.id, 1)` and `updateQuantity(product.id, -1)`.
                // This implies it ADDS to current. 
                // I need to verify CartContext. 
                // Assuming it's delta based for now based on usage.
                // So delta = qty - quantityInCart.
                const delta = qty - quantityInCart;
                if (delta !== 0) {
                    updateQuantity(product.id, delta);
                }
            }
        } else {
            // Add new
            // addToCart(product) usually adds 1. 
            // I need to check addToCart signature. If it doesn't take qty, I might need to call it loop or update context.
            // Let's assume standard context; I'll check Context file in a sec. 
            // PROCEEDING WITH ASSUMPTION: I will fix Context if needed.
            // Actually, safest to read Context first.
            // I'll pause this write and read Context.
        }
    };

    // ... wait, I'll read the context first to be safe.
    return null;
}
