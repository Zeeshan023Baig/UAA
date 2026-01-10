import { createContext, useContext, useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, doc, runTransaction, writeBatch, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { initialProducts } from '../data/products';

const ProductContext = createContext();

export const useProducts = () => useContext(ProductContext);

export const ProductProvider = ({ children }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Real-time listener
        const unsubscribe = onSnapshot(collection(db, "products"), (snapshot) => {
            if (snapshot.empty) {
                // Optional: Auto-seed if truly empty, or let admin do it manually via the new button
                // seedDatabase(); 
            }

            const productsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            // Sort: Put items with 'stock' > 0 first, then by name
            setProducts(productsData.sort((a, b) => {
                if (a.stock > 0 && b.stock <= 0) return -1;
                if (a.stock <= 0 && b.stock > 0) return 1;
                return a.name.localeCompare(b.name);
            }));
            setLoading(false);
        }, (error) => {
            console.error("Error fetching products:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const importCatalog = async () => {
        try {
            const batch = writeBatch(db);
            // We use the product name (sanitized) or a simple counter as ID to avoid duplicates if re-importing, 
            // or just let Firestore generate IDs. 
            // Better to let Firestore generate IDs but check for duplicates if we cared. 
            // For this "Reset/Import" feature, we'll just add them. 
            // Optimization: To prevent duplicates on multiple clicks, we could delete all existing first, 
            // but that deletes order history references potentially. 
            // Let's just add them and let the user manage it, or check by name.

            // Simpler approach for "Import": Just add them all. User can clear db if they want.
            // OR: We can use the name as the doc ID to enforce uniqueness

            initialProducts.forEach(product => {
                // Create a doc reference with a specific ID (slugified name) to prevent duplicates
                const docId = product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                const docRef = doc(db, "products", docId);
                batch.set(docRef, product);
            });

            await batch.commit();
            return { success: true };
        } catch (error) {
            console.error("Error importing catalog:", error);
            return { success: false, error: error.message };
        }
    };

    const purchaseItems = async (cartItems, customerDetails = null) => {
        try {
            const orderId = await runTransaction(db, async (transaction) => {
                // 1. Perform ALL reads first
                const productDocs = [];
                for (const item of cartItems) {
                    const productRef = doc(db, "products", item.id);
                    const productDoc = await transaction.get(productRef);
                    if (!productDoc.exists()) {
                        throw new Error(`Product ${item.name} does not exist!`);
                    }
                    productDocs.push({
                        ref: productRef,
                        doc: productDoc,
                        item: item // link back to cart item for quantity
                    });
                }

                // 2. Perform logic checks
                for (const p of productDocs) {
                    const currentStock = p.doc.data().stock;
                    if (currentStock < p.item.quantity) {
                        throw new Error(`Not enough stock for ${p.item.name}! Only ${currentStock} left.`);
                    }
                }

                // 3. Perform ALL writes
                for (const p of productDocs) {
                    const currentStock = p.doc.data().stock;
                    transaction.update(p.ref, { stock: currentStock - p.item.quantity });
                }

                // Create Order Record
                const orderRef = doc(collection(db, "orders"));
                transaction.set(orderRef, {
                    customer: customerDetails || { name: '', phone: '', email: '' },
                    items: cartItems,
                    total: cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0),
                    date: new Date().toISOString(),
                    timestamp: serverTimestamp()
                });
                return orderRef.id;
            });
            return { success: true, orderId };
        } catch (error) {
            console.error("Transaction failed: ", error);
            return { success: false, error: error.message };
        }
    };

    const addProduct = async (productData) => {
        try {
            // Add a new document with an auto-generated id.
            await addDoc(collection(db, "products"), {
                ...productData,
                stock: Number(productData.stock),
                price: Number(productData.price)
            });
            return { success: true };
        } catch (error) {
            console.error("Error adding product: ", error);
            return { success: false, error: error.message };
        }
    };

    const restockProduct = async (productId, newStock) => {
        try {
            const productRef = doc(db, "products", productId);
            await updateDoc(productRef, {
                stock: Number(newStock)
            });
            return { success: true };
        } catch (error) {
            console.error("Error restocking product: ", error);
            return { success: false, error: error.message };
        }
    };

    const updateProduct = async (productId, updates) => {
        try {
            const productRef = doc(db, "products", productId);
            // Ensure numbers are actually numbers
            const sanitizedUpdates = { ...updates };
            if (sanitizedUpdates.price !== undefined) sanitizedUpdates.price = Number(sanitizedUpdates.price);
            if (sanitizedUpdates.stock !== undefined) sanitizedUpdates.stock = Number(sanitizedUpdates.stock);

            await updateDoc(productRef, sanitizedUpdates);
            return { success: true };
        } catch (error) {
            console.error("Error updating product: ", error);
            return { success: false, error: error.message };
        }
    };

    const updateOrderItems = async (orderId, newItems) => {
        try {
            await runTransaction(db, async (transaction) => {
                const orderRef = doc(db, "orders", orderId);
                const orderDoc = await transaction.get(orderRef);

                if (!orderDoc.exists()) {
                    throw new Error("Order not found!");
                }

                const oldItems = orderDoc.data().items;

                // 1. Prepare Product Refs
                const productIds = new Set([...oldItems.map(i => i.id), ...newItems.map(i => i.id)]);
                const productDocs = {};

                for (const pid of productIds) {
                    const pRef = doc(db, "products", pid);
                    const pDoc = await transaction.get(pRef);
                    if (!pDoc.exists()) throw new Error(`Product ${pid} not found!`);
                    productDocs[pid] = { ref: pRef, data: pDoc.data() };
                }

                // 2. Revert Old Stock (Add back)
                for (const item of oldItems) {
                    productDocs[item.id].data.stock += item.quantity;
                }

                // 3. Apply New Stock (Deduct) & Check Availability
                for (const item of newItems) {
                    if (productDocs[item.id].data.stock < item.quantity) {
                        throw new Error(`Not enough stock for ${item.name}! Max available: ${productDocs[item.id].data.stock}`);
                    }
                    productDocs[item.id].data.stock -= item.quantity;
                }

                // 4. Write Stock Updates
                for (const pid of productIds) {
                    transaction.update(productDocs[pid].ref, { stock: productDocs[pid].data.stock });
                }

                // 5. Update Order
                transaction.update(orderRef, {
                    items: newItems,
                    total: newItems.reduce((acc, item) => acc + (item.price * item.quantity), 0),
                    approvalStatus: 'Approved by Boss' // Automated approval on save
                });
            });
            return { success: true };
        } catch (error) {
            console.error("Update Order Failed: ", error);
            return { success: false, error: error.message };
        }
    };

    return (
        <ProductContext.Provider value={{ products, loading, purchaseItems, addProduct, restockProduct, updateProduct, importCatalog, updateOrderItems }}>
            {children}
        </ProductContext.Provider>
    );
};
