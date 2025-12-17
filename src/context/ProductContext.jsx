import { createContext, useContext, useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, doc, runTransaction, writeBatch, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

const ProductContext = createContext();

export const useProducts = () => useContext(ProductContext);

// Initial static products to seed the database if empty
const INITIAL_PRODUCTS = [
    {
        id: "1",
        name: "The Executive",
        price: 249,
        category: "Indian",
        image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80",
        specs: "Titanium Frame • Blue Light Filter • Anti-Reflective",
        stock: 50
    },
    {
        id: "2",
        name: "Midnight Aviator",
        price: 189,
        category: "International",
        image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80",
        specs: "Matte Black Metal • Polarized Lens • UV400 Protection",
        stock: 50
    },
    {
        id: "3",
        name: "Classic Wayfarer",
        price: 159,
        category: "International",
        image: "https://images.unsplash.com/photo-1577803645773-f96470509666?auto=format&fit=crop&w=800&q=80",
        specs: "Acetate Frame • Green G-15 Lens • Iconic Design",
        stock: 50
    },
    {
        id: "4",
        name: "Rose Gold Round",
        price: 210,
        category: "Indian",
        image: "https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=800&q=80",
        specs: "Rose Gold Metal • Clear Lens • Adjustable Nose Pads",
        stock: 50
    },
    {
        id: "5",
        name: "Tortoise Shell",
        price: 175,
        category: "Indian",
        image: "https://images.unsplash.com/photo-1483412901819-729f52271844?auto=format&fit=crop&w=800&q=80",
        specs: "Handmade Acetate • Standard Fit • Premium Hinges",
        stock: 50
    },
    {
        id: "6",
        name: "Sport Shield",
        price: 299,
        category: "In-house",
        image: "https://images.unsplash.com/photo-1614715838608-dd527c2dc42c?auto=format&fit=crop&w=800&q=80",
        specs: "Polycarbonate Lens • Impact Resistant • Hydrophobic Coating",
        stock: 50
    },
];

export const ProductProvider = ({ children }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Real-time listener
        const unsubscribe = onSnapshot(collection(db, "products"), (snapshot) => {
            if (snapshot.empty) {
                // If DB is empty, seed it (only needs to happen once ideally, but useful for first run)
                seedDatabase();
            } else {
                const productsData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setProducts(productsData.sort((a, b) => a.id.localeCompare(b.id))); // Keep consistent order
                setLoading(false);
            }
        }, (error) => {
            console.error("Error fetching products:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const seedDatabase = async () => {
        try {
            const batch = writeBatch(db);
            INITIAL_PRODUCTS.forEach(product => {
                const docRef = doc(db, "products", product.id);
                batch.set(docRef, product);
            });
            await batch.commit();
            console.log("Database seeded successfully!");
        } catch (error) {
            console.error("Error seeding database:", error);
        }
    };

    const purchaseItems = async (cartItems, customerDetails = null) => {
        try {
            await runTransaction(db, async (transaction) => {
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
                    customer: customerDetails || { name: 'Guest', phone: '', email: '' },
                    items: cartItems,
                    total: cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0),
                    date: new Date().toISOString(),
                    timestamp: serverTimestamp()
                });
            });
            return { success: true };
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

    return (
        <ProductContext.Provider value={{ products, loading, purchaseItems, addProduct, restockProduct }}>
            {children}
        </ProductContext.Provider>
    );
};
