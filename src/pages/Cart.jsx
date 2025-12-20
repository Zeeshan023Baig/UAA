import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductContext';
import { Trash2, Plus, Minus, ArrowRight, Loader } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';

const Cart = () => {
    const { cartItems, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
    const { purchaseItems } = useProducts();
    const [customer, setCustomer] = useState({ name: '', email: '', phone: '' });
    const [phoneError, setPhoneError] = useState('');
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [lastOrder, setLastOrder] = useState(null);

    const handleCheckout = async (e) => {
        e.preventDefault();
        if (cartItems.length === 0) return;
        if (!customer.name || !customer.email || !customer.phone) {
            alert("Please fill in all your details to proceed.");
            return;
        }
        if (customer.phone.length !== 10) {
            alert("Please enter a valid 10-digit phone number.");
            return;
        }

        setIsCheckingOut(true);

        const currentCart = [...cartItems]; // Snapshot current cart
        const currentTotal = cartTotal;

        const result = await purchaseItems(cartItems, customer);

        setIsCheckingOut(false);
        if (result.success) {
            setLastOrder({ items: currentCart, total: currentTotal, id: Math.random().toString(36).substr(2, 9), customer });
            clearCart();
            setCustomer({ name: '', email: '', phone: '' });
        } else {
            alert(`Purchase failed: ${result.error}`);
        }
    };

    if (lastOrder) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <div className="bg-[#111] border border-white/10 p-8 max-w-md w-full space-y-6 relative">
                    <div className="text-center space-y-2">
                        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ArrowRight className="w-8 h-8 text-green-500" />
                        </div>
                        <h2 className="text-2xl font-serif text-white">Order Confirmed</h2>
                        <p className="text-white/40 text-sm">Order ID: #{lastOrder.id.toUpperCase()}</p>
                    </div>

                    <div className="bg-white/5 p-4 rounded-sm space-y-2 text-sm text-white/60">
                        <h4 className="text-white font-bold mb-2">Customer Details</h4>
                        <p>Name: {lastOrder.customer.name}</p>
                        <p>Email: {lastOrder.customer.email}</p>
                        <p>Phone: {lastOrder.customer.phone}</p>
                    </div>

                    <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2">
                        {lastOrder.items.map(item => (
                            <div key={item.id} className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                                <div>
                                    <span className="text-white block">{item.name}</span>
                                    <span className="text-white/40 text-xs">Qty: {item.quantity}</span>
                                </div>
                                <span className="text-[#38bdf8]">₹{item.price * item.quantity}</span>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-white/10">
                        <span className="text-white/60">Total Amount</span>
                        <span className="text-xl font-bold text-[#38bdf8]">₹{lastOrder.total}</span>
                    </div>

                    <button
                        onClick={() => setLastOrder(null)}
                        className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-bold uppercase tracking-wider transition-colors"
                    >
                        Close Receipt
                    </button>
                </div>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="text-center py-20 space-y-6">
                <h2 className="text-3xl font-serif text-white/40">Your cart is empty</h2>
                <Link to="/catalogue" className="inline-flex items-center gap-2 text-[#38bdf8] hover:text-white transition-colors uppercase tracking-widest text-sm">
                    Continue Shopping <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-4xl font-serif text-white mb-8">Shopping Cart</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-6">
                    {cartItems.map((item) => (
                        <div key={item.id} className="flex gap-4 p-4 border border-white/5 bg-white/5 rounded-sm">
                            <img src={item.image} alt={item.name} className="w-24 h-24 object-cover my-auto" />

                            <div className="flex-grow flex flex-col justify-between">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-serif text-lg">{item.name}</h3>
                                        <p className="text-sm text-white/40">{item.specs}</p>
                                    </div>
                                    <button onClick={() => removeFromCart(item.id)} className="text-white/20 hover:text-red-400 transition-colors">
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="flex justify-between items-end">
                                    <div className="flex items-center gap-3 border border-white/10 rounded-sm px-2 py-1">
                                        <button onClick={() => updateQuantity(item.id, -1)} className="hover:text-[#38bdf8]"><Minus className="w-3 h-3" /></button>
                                        <span className="text-sm w-4 text-center">{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.id, 1)} className="hover:text-[#38bdf8]"><Plus className="w-3 h-3" /></button>
                                    </div>
                                    <span className="font-bold text-[#38bdf8]">₹{item.price * item.quantity}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Order Summary Form */}
                <div className="lg:col-span-1">
                    <form onSubmit={handleCheckout} className="p-6 border border-white/10 bg-white/5 space-y-6 sticky top-24">
                        <h3 className="text-xl font-serif">Checkout Details</h3>

                        <div className="space-y-4">
                            <input
                                type="text"
                                placeholder="Full Name"
                                required
                                className="w-full bg-black/20 border border-white/10 p-3 text-sm text-white rounded-sm focus:border-[#38bdf8] outline-none transition-colors"
                                value={customer.name}
                                onChange={e => setCustomer({ ...customer, name: e.target.value })}
                            />
                            <input
                                type="email"
                                placeholder="Email Address"
                                required
                                className="w-full bg-black/20 border border-white/10 p-3 text-sm text-white rounded-sm focus:border-[#38bdf8] outline-none transition-colors"
                                value={customer.email}
                                onChange={e => setCustomer({ ...customer, email: e.target.value })}
                            />
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm select-none border-r border-white/10 pr-2">
                                    +91
                                </span>
                                <input
                                    type="tel"
                                    placeholder="Phone Number (10 digits)"
                                    required
                                    maxLength="10"
                                    pattern="[0-9]{10}"
                                    title="Please enter a valid 10-digit phone number"
                                    className={`w-full bg-black/20 border p-3 pl-16 text-sm text-white rounded-sm outline-none transition-colors ${phoneError ? 'border-red-500 mb-0' : 'border-white/10 focus:border-[#38bdf8]'}`}
                                    value={customer.phone}
                                    onChange={e => {
                                        const raw = e.target.value;
                                        if (/\D/.test(raw)) {
                                            setPhoneError("Only numbers allowed");
                                            setTimeout(() => setPhoneError(''), 3000);
                                            return;
                                        }
                                        if (raw.length > 10) {
                                            setPhoneError("Maximum 10 digits allowed");
                                            setTimeout(() => setPhoneError(''), 3000);
                                            return;
                                        }
                                        setPhoneError('');
                                        setCustomer({ ...customer, phone: raw });
                                    }}
                                />
                            </div>
                            {phoneError && (
                                <p className="text-red-500 text-xs font-bold uppercase tracking-widest mt-1 animate-in slide-in-from-top-1">
                                    {phoneError}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2 text-sm text-white/60 pt-4 border-t border-white/10">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>₹{cartTotal}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Shipping</span>
                                <span>Free</span>
                            </div>
                        </div>
                        <div className="border-t border-white/10 pt-4 flex justify-between font-bold text-lg">
                            <span>Total</span>
                            <span className="text-[#38bdf8]">₹{cartTotal}</span>
                        </div>

                        <button
                            type="submit"
                            disabled={isCheckingOut}
                            className="w-full py-3 bg-[#38bdf8] text-primary font-bold uppercase tracking-wider hover:bg-white transition-colors duration-300 flex justify-center items-center gap-2"
                        >
                            {isCheckingOut && <Loader className="w-4 h-4 animate-spin" />}
                            {isCheckingOut ? 'Processing...' : 'Complete Order'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Cart;
