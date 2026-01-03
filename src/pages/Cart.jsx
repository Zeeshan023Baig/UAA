import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductContext';
import { Trash2, Plus, Minus, ArrowRight, Loader } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

import emailjs from '@emailjs/browser';

const Cart = () => {
    const navigate = useNavigate();
    const { cartItems, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
    const { purchaseItems } = useProducts();
    const [customer, setCustomer] = useState({ name: '', email: '', phone: '', branch: '' });
    const [phoneError, setPhoneError] = useState('');
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [lastOrder, setLastOrder] = useState(null);
    const [sendingEmail, setSendingEmail] = useState(false);

    const handleSendEmail = async () => {
        setSendingEmail(true);
        try {
            // !IMPORTANT: You must replace these placeholders with your actual EmailJS credentials
            // Sign up at https://www.emailjs.com/
            const SERVICE_ID = "service_siw244i"; // Updated from screenshot
            const TEMPLATE_ID = "template_6984agq"; // Updated from user
            const PUBLIC_KEY = "YpglawHtCtJ1-mbWw"; // Updated from screenshot

            await emailjs.send(SERVICE_ID, TEMPLATE_ID, {
                to_email: lastOrder.customer.email,
                to_name: lastOrder.customer.name,
                order_id: lastOrder.id,
                order_link: `${window.location.origin}/order/${lastOrder.id}/edit`,
                total: lastOrder.total,
                branch: lastOrder.customer.branch
            }, PUBLIC_KEY);
            alert("Email sent successfully!");
        } catch (error) {
            console.error("Email failed:", error);
            alert("Failed to send email. Please check internet connection.");
        } finally {
            setSendingEmail(false);
        }
    };

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

                    <div className="bg-accent/10 border border-accent/20 p-4 rounded-sm">
                        <p className="text-accent text-xs font-bold uppercase tracking-widest mb-2">Share with Boss / Manager</p>
                        <p className="text-white/60 text-xs mb-3">Send this link to allow them to edit the order:</p>

                        <div className="flex gap-2">
                            <input
                                readOnly
                                value={`${window.location.origin}/order/${lastOrder.id}/edit`}
                                className="bg-black/40 border border-white/10 text-white/80 text-xs p-2 rounded-sm flex-grow outline-none select-all"
                            />
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(`${window.location.origin}/order/${lastOrder.id}/edit`);
                                    alert("Link copied to clipboard!");
                                }}
                                className="bg-white/10 hover:bg-white/20 text-white px-3 rounded-sm transition-colors text-xs font-bold"
                            >
                                Copy
                            </button>
                        </div>

                        <button
                            onClick={handleSendEmail}
                            disabled={sendingEmail}
                            className="w-full mt-3 flex justify-center items-center gap-2 text-accent hover:text-white text-xs font-bold uppercase tracking-widest transition-colors py-2 border border-accent/30 hover:bg-accent/10 rounded-sm"
                        >
                            {sendingEmail ? <Loader className="w-3 h-3 animate-spin" /> : 'Send via Email'}
                        </button>
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
                        onClick={() => {
                            setLastOrder(null);
                            navigate('/catalogue');
                        }}
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
                                    <button onClick={() => removeFromCart(item.id)} className="text-muted hover:text-red-500 transition-colors">
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="flex justify-between items-end">
                                    <div className="flex items-center gap-3 border border-border rounded-sm px-2 py-1">
                                        <button onClick={() => updateQuantity(item.id, -1)} className="hover:text-accent"><Minus className="w-3 h-3" /></button>
                                        <span className="text-sm w-4 text-center">{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.id, 1)} className="hover:text-accent"><Plus className="w-3 h-3" /></button>
                                    </div>
                                    <span className="font-bold text-accent">₹{item.price * item.quantity}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Order Summary Form */}
                <div className="lg:col-span-1">
                    <form onSubmit={handleCheckout} className="p-6 border border-border bg-surface space-y-6 sticky top-24">
                        <h3 className="text-xl font-serif text-secondary">Checkout Details</h3>

                        <div className="space-y-4">
                            <input
                                type="text"
                                placeholder="Full Name"
                                required
                                className="w-full bg-white dark:bg-black/20 border border-border p-3 text-sm text-slate-900 dark:text-white rounded-sm focus:border-accent outline-none transition-colors placeholder:text-muted"
                                value={customer.name}
                                onChange={e => setCustomer({ ...customer, name: e.target.value })}
                            />
                            <input
                                type="email"
                                placeholder="Email Address"
                                required
                                className="w-full bg-white dark:bg-black/20 border border-border p-3 text-sm text-slate-900 dark:text-white rounded-sm focus:border-accent outline-none transition-colors placeholder:text-muted"
                                value={customer.email}
                                onChange={e => setCustomer({ ...customer, email: e.target.value })}
                            />
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm select-none border-r border-border pr-2">
                                    +91
                                </span>
                                <input
                                    type="tel"
                                    placeholder="Phone Number"
                                    required
                                    maxLength="10"
                                    pattern="[0-9]{10}"
                                    title="Please enter a valid 10-digit phone number"
                                    className={`w-full bg-white dark:bg-black/20 border p-3 pl-16 text-sm text-slate-900 dark:text-white rounded-sm outline-none transition-colors placeholder:text-muted ${phoneError ? 'border-red-500 mb-0' : 'border-border focus:border-accent'}`}
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
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Branch / Location"
                                    required
                                    className="w-full bg-white dark:bg-black/20 border border-border p-3 text-sm text-slate-900 dark:text-white rounded-sm focus:border-accent outline-none transition-colors placeholder:text-muted"
                                    value={customer.branch || ''}
                                    onChange={e => setCustomer({ ...customer, branch: e.target.value })}
                                />
                                <a
                                    href="https://www.google.com/maps"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-accent/10 hover:bg-accent/20 border border-accent/30 text-accent px-3 rounded-sm flex items-center justify-center transition-colors"
                                    title="Open Google Maps to find location"
                                >
                                    🌍
                                </a>
                            </div>
                        </div>

                        <div className="space-y-2 text-sm text-muted pt-4 border-t border-border">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>₹{cartTotal}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Shipping</span>
                                <span>Free</span>
                            </div>
                        </div>
                        <div className="border-t border-border pt-4 flex justify-between font-bold text-lg text-secondary">
                            <span>Total</span>
                            <span className="text-accent">₹{cartTotal}</span>
                        </div>

                        <button
                            type="submit"
                            disabled={isCheckingOut}
                            className="w-full py-3 bg-accent text-primary font-bold uppercase tracking-wider hover:bg-opacity-90 transition-colors duration-300 flex justify-center items-center gap-2"
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
