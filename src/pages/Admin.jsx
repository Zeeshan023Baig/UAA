import { useState, useEffect } from 'react';
import { useProducts } from '../context/ProductContext';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { Package, Plus, Loader, CheckCircle } from 'lucide-react';

const StockInput = ({ initialStock, onUpdate }) => {
    const [value, setValue] = useState(initialStock);
    const [status, setStatus] = useState('idle'); // idle, saving, saved, error

    useEffect(() => {
        setValue(initialStock);
    }, [initialStock]);

    useEffect(() => {
        if (parseInt(value) === parseInt(initialStock)) {
            setStatus('idle');
            return;
        }

        if (value === '' || isNaN(parseInt(value))) {
            return; // Don't auto-save invalid/empty input
        }

        setStatus('saving');
        const timeoutId = setTimeout(async () => {
            try {
                const stockVal = parseInt(value);
                if (isNaN(stockVal)) return;

                const result = await onUpdate(stockVal);
                if (result.success) {
                    setStatus('saved');
                    setTimeout(() => setStatus('idle'), 2000);
                } else {
                    setStatus('error');
                }
            } catch (error) {
                setStatus('error');
            }
        }, 800);

        return () => clearTimeout(timeoutId);
    }, [value, initialStock, onUpdate]);

    return (
        <div className="flex items-center gap-2 relative">
            <input
                type="number"
                className={`w-20 bg-black/20 border p-1 text-center text-white rounded-sm transition-colors ${status === 'error' ? 'border-red-500' : 'border-white/10'}`}
                value={value}
                onChange={(e) => setValue(e.target.value)}
            />
            {status === 'saving' && <Loader className="w-3 h-3 text-[#38bdf8] animate-spin absolute -right-6" />}
            {status === 'saved' && <CheckCircle className="w-3 h-3 text-green-400 absolute -right-6 animate-in fade-in" />}
        </div>
    );
};

const Admin = () => {
    const { products, addProduct, restockProduct, importCatalog } = useProducts();
    const [activeTab, setActiveTab] = useState('inventory');
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(true);

    // New Product State
    const [newProduct, setNewProduct] = useState({
        name: '',
        category: 'In-house',
        price: '',
        stock: '',
        image: '',
        specs: '',
        externalLink: ''
    });
    const [imageFile, setImageFile] = useState(null);
    const [isAdding, setIsAdding] = useState(false);

    // Stock Edit State
    // Fetch Orders
    useEffect(() => {
        const q = query(collection(db, "orders"), orderBy("date", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const ordersData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setOrders(ordersData);
            setLoadingOrders(false);
        });
        return () => unsubscribe();
    }, []);

    const handleImageUpload = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    // Resize image to max 800px width/height to keep size small for Firestore
                    const MAX_WIDTH = 800;
                    const MAX_HEIGHT = 800;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    ctx.drawImage(img, 0, 0, width, height);

                    // Compress to JPEG at 0.7 quality
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                    resolve(dataUrl);
                };
            };
            reader.onerror = (error) => reject(error);
        });
    };

    const handleImportCatalog = async () => {
        if (window.confirm("This will add 43 default products to your inventory. Are you sure?")) {
            const result = await importCatalog();
            if (result.success) {
                alert("Catalog imported successfully! Please refresh if items don't appear immediately.");
            } else {
                alert("Import failed: " + result.error);
            }
        }
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        setIsAdding(true);

        try {
            let imageUrl = newProduct.image;
            if (imageFile) {
                try {
                    // Convert file to Base64 string (Free, no Storage bucket needed)
                    imageUrl = await handleImageUpload(imageFile);
                } catch (error) {
                    alert('Error processing image: ' + error.message);
                    setIsAdding(false);
                    return;
                }
            } else if (!imageUrl) {
                // Use a default placeholder if no image provided at all
                imageUrl = 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80';
            }

            // Check if string is too large (Firestore limit is 1MB)
            if (imageUrl.length > 1000000) {
                alert("Image is too large. Please look for a smaller image.");
                setIsAdding(false);
                return;
            }

            const result = await addProduct({ ...newProduct, image: imageUrl });

            if (result.success) {
                alert('Product added successfully');
                setNewProduct({
                    name: '',
                    category: 'In-house',
                    price: '',
                    stock: '',
                    image: '',
                    specs: '',
                    externalLink: ''
                });
                setImageFile(null);
            } else {
                alert('Failed to add product: ' + result.error);
            }
        } catch (error) {
            alert('Error handling product: ' + error.message);
        } finally {
            setIsAdding(false);
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === 'fulfilled' ? 'pending' : 'fulfilled';
        try {
            await updateDoc(doc(db, "orders", id), {
                status: newStatus
            });
        } catch (error) {
            alert('Error updating order status: ' + error.message);
        }
    };

    return (
        <div className="space-y-8">
            <header className="flex items-center justify-between border-b border-white/10 pb-6">
                <h1 className="text-3xl font-serif text-white">Store Management</h1>
                <div className="flex gap-4">
                    <button
                        onClick={() => setActiveTab('inventory')}
                        className={`px-4 py-2 rounded-sm transition-colors ${activeTab === 'inventory' ? 'bg-[#38bdf8] text-primary font-bold' : 'text-white/60 hover:text-white'}`}
                    >
                        Inventory
                    </button>
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`px-4 py-2 rounded-sm transition-colors ${activeTab === 'orders' ? 'bg-[#38bdf8] text-primary font-bold' : 'text-white/60 hover:text-white'}`}
                    >
                        Order History
                    </button>
                </div>
            </header>

            {activeTab === 'inventory' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Add Product Form */}
                    <div className="lg:col-span-1">
                        <div className="bg-white/5 border border-white/10 p-6 rounded-sm sticky top-24">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-serif flex items-center gap-2">
                                    <Plus className="w-5 h-5 text-[#38bdf8]" /> Add New Product
                                </h2>
                                <button
                                    type="button"
                                    onClick={async () => {
                                        if (window.confirm('This will import default products. Continue?')) {
                                            try {
                                                await importCatalog();
                                                alert('Catalog imported successfully!');
                                            } catch (error) {
                                                console.error("Import failed:", error);
                                                alert('Import failed. Check console for details.');
                                            }
                                        }
                                    }}
                                    className="text-[10px] uppercase tracking-wider text-[#38bdf8]/60 hover:text-[#38bdf8] border border-dashed border-[#38bdf8]/30 px-2 py-1 rounded-sm hover:bg-[#38bdf8]/5 transition-colors"
                                    title="Import default products"
                                >
                                    Import Catalog
                                </button>
                            </div>
                            <form onSubmit={handleAddProduct} className="space-y-4">
                                <input
                                    placeholder="Product Name"
                                    className="w-full bg-primary border border-border p-2 text-sm text-primary rounded-sm placeholder:text-muted"
                                    value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} required
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <select
                                        className="bg-primary border border-border p-2 text-sm text-primary rounded-sm"
                                        value={newProduct.category} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                                    >
                                        <option value="In-house">In-house</option>
                                        <option value="International">International</option>
                                        <option value="Indian">Indian</option>
                                        <option value="Lenses">Lenses</option>
                                    </select>
                                    <input
                                        type="number" placeholder="Price"
                                        className="bg-black/20 border border-white/10 p-2 text-sm text-white rounded-sm"
                                        value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} required
                                    />
                                </div>
                                <input
                                    type="number" placeholder="Initial Stock"
                                    className="w-full bg-black/20 border border-white/10 p-2 text-sm text-white rounded-sm"
                                    value={newProduct.stock} onChange={e => setNewProduct({ ...newProduct, stock: e.target.value })} required
                                />
                                <input
                                    placeholder="Specs (e.g. Titanium Frame)"
                                    className="w-full bg-black/20 border border-white/10 p-2 text-sm text-white rounded-sm"
                                    value={newProduct.specs} onChange={e => setNewProduct({ ...newProduct, specs: e.target.value })}
                                />
                                <input
                                    placeholder="External Link (Optional)"
                                    className="w-full bg-black/20 border border-white/10 p-2 text-sm text-white rounded-sm"
                                    value={newProduct.externalLink} onChange={e => setNewProduct({ ...newProduct, externalLink: e.target.value })}
                                />

                                <div className="space-y-2">
                                    <label className="text-xs text-white/60 uppercase">Product Image</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={e => setImageFile(e.target.files[0])}
                                        className="w-full text-xs text-white/60 file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-xs file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20"
                                    />
                                    <p className="text-[10px] text-white/40">Or use URL (optional)</p>
                                    <input
                                        placeholder="Image URL (backup)"
                                        className="w-full bg-black/20 border border-white/10 p-2 text-sm text-white rounded-sm"
                                        value={newProduct.image} onChange={e => setNewProduct({ ...newProduct, image: e.target.value })}
                                    />
                                </div>

                                <button type="submit" disabled={isAdding} className="w-full py-2 bg-white/10 hover:bg-[#38bdf8] hover:text-primary transition-colors text-white font-bold uppercase text-sm">
                                    {isAdding ? 'Adding...' : 'Add Product'}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Product List */}
                    <div className="lg:col-span-2 space-y-4">
                        {products.map(product => (
                            <div key={product.id} className="flex items-center gap-4 bg-white/5 p-4 border border-white/5 rounded-sm">
                                <img src={product.image} className="w-16 h-16 object-cover rounded-sm" alt={product.name} />
                                <div className="flex-grow">
                                    <h3 className="font-bold text-white">{product.name}</h3>
                                    <p className="text-xs text-white/40">{product.category} • ₹{product.price}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-white/40 uppercase">Stock:</span>
                                    <StockInput
                                        initialStock={product.stock}
                                        onUpdate={(newStock) => restockProduct(product.id, newStock)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    {loadingOrders ? (
                        <div className="text-center py-12"><Loader className="w-8 h-8 animate-spin mx-auto text-[#38bdf8]" /></div>
                    ) : orders.length === 0 ? (
                        <div className="text-center py-12 text-white/40">No orders yet.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-white/60">
                                <thead className="text-white/40 uppercase text-xs border-b border-white/10">
                                    <tr>
                                        <th className="pb-4">Date</th>
                                        <th className="pb-4">Customer</th>
                                        <th className="pb-4">Items</th>
                                        <th className="pb-4">Status</th>
                                        <th className="pb-4 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {orders.map(order => (
                                        <tr key={order.id} className="hover:bg-white/5 transition-colors">
                                            <td className="py-4">
                                                {new Date(order.date).toLocaleDateString()} <br />
                                                <span className="text-xs opacity-50">{new Date(order.date).toLocaleTimeString()}</span>
                                            </td>
                                            <td className="py-4">
                                                <span className="text-white block font-bold">{order.customer?.name || 'Guest'}</span>
                                                <span className="text-xs block">{order.customer?.phone}</span>
                                                <span className="text-xs block">{order.customer?.email}</span>
                                            </td>
                                            <td className="py-4">
                                                {order.items.map(item => (
                                                    <div key={item.id} className={`text-white/80 ${order.status === 'fulfilled' ? 'line-through opacity-50' : ''}`}>
                                                        {item.quantity}x {item.name}
                                                    </div>
                                                ))}
                                            </td>
                                            <td className="py-4">
                                                <button
                                                    onClick={() => handleToggleStatus(order.id, order.status)}
                                                    className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border transition-colors ${order.status === 'fulfilled'
                                                        ? 'bg-green-500/10 border-green-500/50 text-green-400 hover:bg-green-500/20'
                                                        : 'bg-yellow-500/10 border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/20'
                                                        }`}
                                                >
                                                    {order.status === 'fulfilled' ? <CheckCircle className="w-3 h-3" /> : <Package className="w-3 h-3" />}
                                                    {order.status === 'fulfilled' ? 'Fulfilled' : 'Pending'}
                                                </button>
                                            </td>
                                            <td className={`py-4 text-right font-bold ${order.status === 'fulfilled' ? 'text-white/40 line-through decoration-white/40' : 'text-[#38bdf8]'}`}>
                                                ₹{order.total}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Admin;
