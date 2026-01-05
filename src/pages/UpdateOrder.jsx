import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useProducts } from '../context/ProductContext';
import { Loader, ArrowLeft, Save, Plus, Minus, Trash2, Mail } from 'lucide-react';

const UpdateOrder = () => {
    const { orderId } = useParams();
    const { updateOrderItems } = useProducts();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState([]);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const docRef = doc(db, "orders", orderId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setOrder({ id: docSnap.id, ...docSnap.data() });
                    setItems(docSnap.data().items);
                } else {
                    alert("Order not found!");
                }
            } catch (error) {
                console.error("Error fetching order:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [orderId]);

    const handleQuantityChange = (id, delta) => {
        setItems(prev => prev.map(item => {
            if (item.id === id) {
                const newQty = Math.max(0, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }).filter(item => item.quantity > 0));
    };

    const handleDirectQuantityChange = (id, value) => {
        const val = parseInt(value);
        if (isNaN(val)) return;

        setItems(prev => prev.map(item => {
            if (item.id === id) {
                // If user types 0, we can keep it as 0 (effectively removing it if saved, or filtering later)
                // But typically for "editing" an order, 0 might mean delete. 
                // Let's allow 0 for now so they can type freely.
                return { ...item, quantity: Math.max(0, val) };
            }
            return item;
        }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        const result = await updateOrderItems(orderId, items);
        setIsSaving(false);
        if (result.success) {
            alert("Order updated successfully!");
            // Refresh order data
            const docRef = doc(db, "orders", orderId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setOrder({ id: docSnap.id, ...docSnap.data() });
                setItems(docSnap.data().items);
            }
        } else {
            alert("Failed to update order: " + result.error);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader className="w-8 h-8 animate-spin text-accent" /></div>;
    if (!order) return <div className="text-center py-20 text-white">Order not found.</div>;

    const total = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    return (
        <div className="max-w-4xl mx-auto space-y-8 pt-8 px-4">
            <Link to="/" className="inline-flex items-center gap-2 text-muted hover:text-white transition-colors text-sm uppercase tracking-wider">
                <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>

            <header className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-serif text-white mb-2">Edit Order</h1>
                    <p className="text-white/60">Order ID: <span className="font-mono text-accent">#{order.id}</span></p>
                    <p className="text-white/60 text-sm">Placed on: {new Date(order.date).toLocaleDateString()}</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                    {items.length === 0 ? (
                        <div className="text-white/40 text-center py-8 border border-white/5 bg-white/5">No items in this order.</div>
                    ) : (
                        items.map(item => (
                            <div key={item.id} className="flex gap-4 p-4 border border-white/10 bg-white/5 rounded-sm">
                                <img src={item.image} alt={item.name} className="w-20 h-20 object-cover my-auto rounded-sm" />
                                <div className="flex-grow flex flex-col justify-between">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-serif text-lg text-white">{item.name}</h3>
                                        <div className="font-bold text-accent">₹{item.price * item.quantity}</div>
                                    </div>
                                    <div className="flex items-center gap-3 mt-2">
                                        <div className="flex items-center gap-3 border border-white/10 rounded-sm px-2 py-1 bg-black/20">
                                            <button onClick={() => handleQuantityChange(item.id, -1)} className="hover:text-accent text-white"><Minus className="w-3 h-3" /></button>
                                            <input
                                                type="number"
                                                min="0"
                                                className="w-12 bg-transparent text-center text-white text-sm outline-none appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                value={item.quantity}
                                                onChange={(e) => handleDirectQuantityChange(item.id, e.target.value)}
                                            />
                                            <button onClick={() => handleQuantityChange(item.id, 1)} className="hover:text-accent text-white"><Plus className="w-3 h-3" /></button>
                                        </div>
                                        <button onClick={() => handleQuantityChange(item.id, -item.quantity)} className="text-white/20 hover:text-red-400 transition-colors ml-auto">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="lg:col-span-1">
                    <div className="bg-surface border border-border p-6 rounded-sm sticky top-24 space-y-6">
                        <h3 className="text-xl font-serif text-secondary">Summary</h3>

                        <div className="space-y-2 text-sm text-muted">
                            <div className="flex justify-between">
                                <span>Customer</span>
                                <span className="text-secondary">{order.customer?.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Items</span>
                                <span className="text-secondary">{items.reduce((acc, i) => acc + i.quantity, 0)}</span>
                            </div>
                            <div className="flex justify-between pt-4 border-t border-border font-bold text-lg text-accent">
                                <span>Total</span>
                                <span>₹{total}</span>
                            </div>
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={isSaving || items.length === 0}
                            className="w-full py-3 bg-accent text-primary font-bold uppercase tracking-wider hover:bg-white transition-colors flex justify-center items-center gap-2"
                        >
                            {isSaving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UpdateOrder;
