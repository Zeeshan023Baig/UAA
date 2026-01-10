import { useState, useEffect } from 'react';
import { useProducts } from '../context/ProductContext';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { Package, Plus, Loader, CheckCircle, Download, Edit2, X, Trash2 } from 'lucide-react';
import PaginationControls from '../components/PaginationControls';

const StockInput = ({ initialStock, onUpdate }) => {
    // ... (StockInput code remains same)
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
                className={`w-20 bg-white dark:bg-black/20 border p-1 text-center text-slate-900 dark:text-white rounded-sm transition-colors ${status === 'error' ? 'border-red-500' : 'border-border'}`}
                value={value}
                onChange={(e) => setValue(e.target.value)}
            />
            {status === 'saving' && <Loader className="w-3 h-3 text-accent animate-spin absolute -right-6" />}
            {status === 'saved' && <CheckCircle className="w-3 h-3 text-green-400 absolute -right-6 animate-in fade-in" />}
        </div>
    );
};
const Admin = () => {
    const { products, addProduct, restockProduct, importCatalog, updateProduct } = useProducts();
    const [activeTab, setActiveTab] = useState('inventory');
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(true);

    // Pagination State
    const ITEMS_PER_PAGE = 12;
    const [inventoryPage, setInventoryPage] = useState(1);
    const [ordersPage, setOrdersPage] = useState(1);

    // Edit Mode State
    const [editingProduct, setEditingProduct] = useState(null);

    // New Product State
    const [newProduct, setNewProduct] = useState({
        name: '',
        category: 'Essentials',
        price: '',
        stock: '0',
        image: '',
        description: ''
    });
    const [imageFile, setImageFile] = useState(null);
    const [isAdding, setIsAdding] = useState(false);

    const categories = ['Essentials', 'Luxuries', 'Groceries', 'Lifestyle', 'Electronics'];

    // Handle initial form population for editing
    const handleEditClick = (product) => {
        setEditingProduct(product);
        setNewProduct({
            name: product.name,
            price: product.price,
            category: product.category,
            image: product.image,
            stock: product.stock,
            description: product.description || ''
        });
        // Scroll to form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingProduct(null);
        setNewProduct({
            name: '',
            price: '',
            category: 'Essentials',
            image: '',
            stock: '0',
            description: ''
        });
        setImageFile(null);
    };

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
        // ... (handleImageUpload code remains same)
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

    const handleProductSubmit = async (e) => {
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

            // Basic validation
            if (!newProduct.name || !newProduct.price) {
                alert("Name and Price are required");
                setIsAdding(false);
                return;
            }

            if (editingProduct) {
                // Update existing
                const result = await updateProduct(editingProduct.id, {
                    ...newProduct,
                    image: imageUrl || 'https://placehold.co/400'
                });
                if (result.success) {
                    alert("Product updated successfully!");
                    handleCancelEdit();
                } else {
                    alert("Failed to update product: " + result.error);
                }
            } else {
                // Add new
                const result = await addProduct({
                    ...newProduct,
                    image: imageUrl || 'https://placehold.co/400'
                });

                if (result.success) {
                    alert("Product added successfully!");
                    setNewProduct({ name: '', price: '', category: 'Essentials', image: '', stock: '0', description: '' });
                    setImageFile(null);
                } else {
                    alert("Failed to add product: " + result.error);
                }
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

    const handleDeleteOrder = async (orderId) => {
        if (window.confirm("Are you sure you want to delete this order PERMANENTLY? This cannot be undone.")) {
            try {
                await deleteDoc(doc(db, "orders", orderId));
            } catch (error) {
                alert("Error deleting order: " + error.message);
            }
        }
    };

    const handleExportOrders = () => {
        if (orders.length === 0) {
            alert("No orders to export.");
            return;
        }

        // Define CSV headers
        const headers = ["Date", "Time", "Order ID", "Customer Name", "Phone", "Email", "Item Name", "Quantity", "Unit Price", "Order Total", "Status"];

        // Map orders to CSV rows (flattening items)
        const rows = orders.flatMap(order => {
            const date = new Date(order.date).toLocaleDateString();
            const time = new Date(order.date).toLocaleTimeString();

            // Escape quotes and commas for CSV format
            const escape = (str) => `"${String(str || '').replace(/"/g, '""')}"`;

            return order.items.map(item => [
                escape(date),
                escape(time),
                escape(order.id),
                escape(order.customer?.name),
                escape(order.customer?.phone),
                escape(order.customer?.email),
                escape(item.name),
                escape(item.quantity),
                escape(item.price || 0),
                escape(order.total),
                escape(order.status)
            ].join(","));
        });

        // Combine headers and rows
        const csvContent = [headers.join(","), ...rows].join("\n");

        // Create download link
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `orders_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportSingleOrder = (order) => {
        // Define CSV headers
        const headers = ["Date", "Time", "Order ID", "Customer Name", "Phone", "Email", "Item Name", "Quantity", "Unit Price", "Order Total", "Status", "Approval"];

        const date = new Date(order.date).toLocaleDateString();
        const time = new Date(order.date).toLocaleTimeString();

        // Escape quotes and commas for CSV format
        const escape = (str) => `"${String(str || '').replace(/"/g, '""')}"`;

        const rows = order.items.map(item => [
            escape(date),
            escape(time),
            escape(order.id),
            escape(order.customer?.name),
            escape(order.customer?.phone),
            escape(order.customer?.email),
            escape(item.name),
            escape(item.quantity),
            escape(item.price || 0),
            escape(order.total),
            escape(order.status),
            escape(order.approvalStatus || 'Pending')
        ].join(","));

        // Combine headers and rows
        const csvContent = [headers.join(","), ...rows].join("\n");

        // Create download link
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `order_${order.id}_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-8">
            <header className="flex items-center justify-between border-b border-border pb-6">
                <h1 className="text-3xl font-serif text-secondary">Store Management</h1>
                <div className="flex gap-4">
                    <button
                        onClick={() => setActiveTab('inventory')}
                        className={`px-4 py-2 rounded-sm transition-colors ${activeTab === 'inventory' ? 'bg-accent text-primary font-bold' : 'text-muted hover:text-secondary'}`}
                    >
                        Inventory
                    </button>
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`px-4 py-2 rounded-sm transition-colors ${activeTab === 'orders' ? 'bg-accent text-primary font-bold' : 'text-muted hover:text-secondary'}`}
                    >
                        Order History
                    </button>
                </div>
            </header>

            {activeTab === 'inventory' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Add/Edit Product Form */}
                    <div className="lg:col-span-1">
                        <div className="bg-surface p-6 sticky top-24 border border-border inverted-theme rounded-md">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-serif text-secondary">
                                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                                </h2>
                                {editingProduct && (
                                    <button onClick={handleCancelEdit} className="text-muted hover:text-red-500">
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            <form onSubmit={handleProductSubmit} className="space-y-4">
                                <input
                                    placeholder="Product Name"
                                    className="w-full bg-primary border border-border p-2 text-sm text-secondary rounded-sm placeholder:text-muted"
                                    value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} required
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <select
                                        className="bg-primary border border-border p-2 text-sm text-secondary rounded-sm"
                                        value={newProduct.category} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                                    >
                                        <option value="In-house">In-house</option>
                                        <option value="International">International</option>
                                        <option value="Indian">Indian</option>
                                        <option value="Lenses">Lenses</option>
                                    </select>
                                    <input
                                        type="number" placeholder="Price"
                                        className="bg-primary border border-border p-2 text-sm text-secondary rounded-sm placeholder:text-muted"
                                        value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} required
                                    />
                                </div>
                                <input
                                    type="number" placeholder="Initial Stock"
                                    className="w-full bg-primary border border-border p-2 text-sm text-secondary rounded-sm placeholder:text-muted"
                                    value={newProduct.stock} onChange={e => setNewProduct({ ...newProduct, stock: e.target.value })} required
                                />
                                <input
                                    placeholder="Specs (e.g. Titanium Frame)"
                                    className="w-full bg-primary border border-border p-2 text-sm text-secondary rounded-sm placeholder:text-muted"
                                    value={newProduct.specs} onChange={e => setNewProduct({ ...newProduct, specs: e.target.value })}
                                />
                                <input
                                    placeholder="External Link (Optional)"
                                    className="w-full bg-primary border border-border p-2 text-sm text-secondary rounded-sm placeholder:text-muted"
                                    value={newProduct.externalLink} onChange={e => setNewProduct({ ...newProduct, externalLink: e.target.value })}
                                />

                                <div className="space-y-2">
                                    <label className="text-xs text-muted uppercase">Product Image</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={e => setImageFile(e.target.files[0])}
                                        className="w-full text-xs text-muted file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-secondary hover:file:bg-surface"
                                    />
                                    <p className="text-[10px] text-muted">Or use URL (optional)</p>
                                    <input
                                        placeholder="Image URL (backup)"
                                        className="w-full bg-primary border border-border p-2 text-sm text-secondary rounded-sm placeholder:text-muted"
                                        value={newProduct.image} onChange={e => setNewProduct({ ...newProduct, image: e.target.value })}
                                    />
                                </div>

                                <button type="submit" disabled={isAdding} className={`w-full py-2 ${editingProduct ? 'bg-accent text-primary' : 'bg-surface text-secondary'} hover:bg-opacity-90 transition-colors font-bold uppercase text-sm border border-border`}>
                                    {isAdding ? (editingProduct ? 'Updating...' : 'Adding...') : (editingProduct ? 'Update Product' : 'Add Product')}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Product List */}
                    <div className="lg:col-span-2 space-y-4">
                        {products.slice((inventoryPage - 1) * ITEMS_PER_PAGE, inventoryPage * ITEMS_PER_PAGE).map(product => (
                            <div key={product.id} className="flex items-center gap-4 bg-surface p-4 border border-border rounded-sm">
                                <img src={product.image} className="w-16 h-16 object-cover rounded-sm" alt={product.name} />
                                <div className="flex-grow">
                                    <h3 className="font-bold text-secondary">{product.name}</h3>
                                    <p className="text-xs text-muted">{product.category} • ₹{product.price}</p>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-muted uppercase">Stock:</span>
                                        <StockInput
                                            initialStock={product.stock}
                                            onUpdate={(newStock) => restockProduct(product.id, newStock)}
                                        />
                                    </div>
                                    <button
                                        onClick={() => handleEditClick(product)}
                                        className="flex items-center gap-1 text-xs text-muted hover:text-accent transition-colors"
                                    >
                                        <Edit2 className="w-3 h-3" /> Edit Details
                                    </button>
                                </div>
                            </div>
                        ))}

                        {/* Inventory Pagination Controls */}
                        <PaginationControls
                            currentPage={inventoryPage}
                            totalPages={Math.ceil(products.length / ITEMS_PER_PAGE)}
                            onPageChange={setInventoryPage}
                        />
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="flex justify-end">
                        <button
                            onClick={handleExportOrders}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-sm transition-colors text-xs font-bold uppercase tracking-widest"
                        >
                            <Download className="w-4 h-4" /> Export All CSV
                        </button>
                    </div>

                    {loadingOrders ? (
                        <div className="text-center py-12"><Loader className="w-8 h-8 animate-spin mx-auto text-accent" /></div>
                    ) : orders.length === 0 ? (
                        <div className="text-center py-12 text-muted">No orders yet.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-secondary">
                                <thead className="text-muted uppercase text-xs border-b border-border">
                                    <tr>
                                        <th className="pb-4">Date</th>
                                        <th className="pb-4">Customer</th>
                                        <th className="pb-4">Items</th>
                                        <th className="pb-4">Order Approval</th>
                                        <th className="pb-4">Delivery Status</th>
                                        <th className="pb-4 text-right">Total</th>
                                        <th className="pb-4 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {orders.slice((ordersPage - 1) * ITEMS_PER_PAGE, ordersPage * ITEMS_PER_PAGE).map(order => (
                                        <tr key={order.id} className="hover:bg-surface transition-colors">
                                            <td className="py-4">
                                                {new Date(order.date).toLocaleDateString()} <br />
                                                <span className="text-xs opacity-50">{new Date(order.date).toLocaleTimeString()}</span>
                                            </td>
                                            <td className="py-4">
                                                <span className="text-secondary block font-bold">{order.customer?.name}</span>
                                                <span className="text-xs block">{order.customer?.phone}</span>
                                                <span className="text-xs block">{order.customer?.email}</span>
                                            </td>
                                            <td className="py-4">
                                                {order.items.map(item => (
                                                    <div key={item.id} className={`text-secondary ${order.status === 'fulfilled' ? 'line-through opacity-50' : ''}`}>
                                                        {item.quantity}x {item.name}
                                                    </div>
                                                ))}
                                            </td>
                                            <td className="py-4">
                                                <span className={`px-3 py-1 rounded-sm text-xs font-bold border uppercase tracking-widest ${order.approvalStatus === 'Approved by Boss'
                                                    ? 'bg-black text-green-400 border-green-400 shadow-[0_0_10px_rgba(74,222,128,0.3)]'
                                                    : 'bg-green-100 text-green-800 border-green-200'
                                                    }`}>
                                                    {order.approvalStatus || 'PENDING'}
                                                </span>
                                            </td>
                                            <td className="py-4">
                                                <button
                                                    onClick={() => handleToggleStatus(order.id, order.status)}
                                                    className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border transition-colors ${order.status === 'fulfilled'
                                                        ? 'bg-black border-green-500 text-green-400 hover:bg-green-900/30 shadow-[0_0_5px_rgba(74,222,128,0.3)]'
                                                        : 'bg-black border-yellow-500 text-yellow-400 hover:bg-yellow-900/30 shadow-[0_0_5px_rgba(250,204,21,0.3)]'
                                                        }`}
                                                >
                                                    {order.status === 'fulfilled' ? <CheckCircle className="w-3 h-3" /> : <Package className="w-3 h-3" />}
                                                    {order.status === 'fulfilled' ? 'Fulfilled' : 'Pending'}
                                                </button>
                                            </td>
                                            <td className={`py-4 text-right font-bold ${order.status === 'fulfilled' ? 'text-muted line-through decoration-muted' : 'text-accent'}`}>
                                                ₹{order.total}
                                            </td>
                                            <td className="py-4 text-center">
                                                <button
                                                    onClick={() => handleExportSingleOrder(order)}
                                                    className="p-2 text-muted hover:text-accent hover:bg-surface rounded-full transition-colors mx-auto"
                                                    title="Export Order to CSV"
                                                >
                                                    <Download className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteOrder(order.id)}
                                                    className="p-2 text-muted hover:text-red-500 hover:bg-surface rounded-full transition-colors"
                                                    title="Delete Order"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Orders Pagination Controls */}
                            <PaginationControls
                                currentPage={ordersPage}
                                totalPages={Math.ceil(orders.length / ITEMS_PER_PAGE)}
                                onPageChange={setOrdersPage}
                            />
                        </div>
                    )}
                </div>
            )
            }
        </div >
    );
};

export default Admin;
