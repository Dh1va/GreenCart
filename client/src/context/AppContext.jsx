import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { dummyProducts } from "../assets/assets";
import toast from "react-hot-toast";
import axios from "axios";



axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

export const Appcontext = createContext();

export const AppContextProvider = ({ children }) => {
    const currency = import.meta.env.VITE_CURRENCY;
    const navigate = useNavigate()
    const [user, setUser] = useState(null)
    const [isSeller, setIsSeller] = useState(false)
    const [showUserLogin, setShowUserLogin] = useState(false)
    const [products, setProducts] = useState([])
    const [cartItems, setCartItems] = useState({})
    const [searchQuery, setSearchQuery] = useState("");
    const [redirectAfterLogin, setRedirectAfterLogin] = useState(null);
    const [authChecked, setAuthChecked] = useState(false);


    //Fetch Seller Status
    const fetchSeller = async () => {
        try {
            const { data } = await axios.get('/api/seller/is-auth');
            if (data.success) {
                setIsSeller(true)
            } else {
                setIsSeller(false)
            }
        } catch (error) {
            setIsSeller(false)
        }
    }


    const fetchUser = async () => {
        try {
            const { data } = await axios.get("/api/user/is-auth");

            if (data.success) {
                setUser(data.user);

                // Always load DB cart
                setCartItems(data.user.cartItems || {});
            }
        } catch {
            setUser(null);
        } finally {
            setAuthChecked(true);
        }
    };



    //fetching products
    const fetchProducts = async () => {
        try {
            const { data } = await axios.get('/api/product/list')
            if (data.success) {
                setProducts(data.products)
                console.log(products);

            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    //adding products to cart
    const addToCart = (itemId) => {
        let cartData = structuredClone(cartItems)

        if (cartData[itemId]) {
            cartData[itemId] += 1
        } else {
            cartData[itemId] = 1
        }
        setCartItems(cartData)
        // ✅ SAVE GUEST CART
        if (!user) {
            localStorage.setItem("guest_cart", JSON.stringify(cartData))
        }

        toast.success("Added to Cart")
    }
    //update cart
    const updateCartItem = (itemId, quantity) => {
        let cartData = structuredClone(cartItems)
        cartData[itemId] = quantity
        setCartItems(cartData)

        // ✅ SAVE GUEST CART
        if (!user) {
            localStorage.setItem("guest_cart", JSON.stringify(cartData))
        }
        toast.success("Cart Updated")
    }
    //removing product from cart
    const removeFromCart = (itemId) => {
        let cartData = structuredClone(cartItems)
        if (cartData[itemId]) {
            cartData[itemId] -= 1
            if (cartData[itemId] === 0) {
                delete cartData[itemId]
            }
        }
        setCartItems(cartData)
        // ✅ SAVE GUEST CART
        if (!user) {
            localStorage.setItem("guest_cart", JSON.stringify(cartData))
        }
        toast.success("Removed from Cart")

    }

    //cart count 
    const getCartCount = () => {
        console.log("cartitems", cartItems);

        let totalCount = 0;
        for (const item in cartItems) {
            totalCount += cartItems[item]
        }
        console.log("totalcount", totalCount);
        return totalCount
    }

    //cart total amount
    const getCartAmount = () => {
        let totalAmount = 0;

        for (const itemId in cartItems) {
            const itemInfo = products.find(
                (product) => product._id === itemId
            );

            // ✅ IMPORTANT GUARD
            if (!itemInfo) continue;

            if (cartItems[itemId] > 0) {
                totalAmount += itemInfo.offerPrice * cartItems[itemId];
            }
        }

        return Math.floor(totalAmount * 100) / 100;
    };


    const mergeGuestCart = async (userCart = {}) => {
        const guestCart = JSON.parse(localStorage.getItem("guest_cart")) || {}

        if (Object.keys(guestCart).length === 0) return

        const mergedCart = { ...userCart }

        for (const productId in guestCart) {
            mergedCart[productId] =
                (mergedCart[productId] || 0) + guestCart[productId]
        }

        setCartItems(mergedCart)

        await axios.post("/api/cart/update", {
            cartItems: mergedCart
        })

        localStorage.removeItem("guest_cart")
    }


    useEffect(() => {
        const guestCart = JSON.parse(localStorage.getItem("guest_cart"))

        if (guestCart && Object.keys(guestCart).length > 0) {
            setCartItems(guestCart)
        }
        fetchUser()
        fetchProducts()
        fetchSeller()
    }, [])

    //update cart in backend whenever cart items change
    useEffect(() => {
        const updateCart = async () => {
            try {
                const { data } = await axios.post('/api/cart/update', { cartItems })
                if (!data.success) {
                    toast.error(data.message)
                }
            } catch (error) {
                toast.error(error.message)
            }
        }
        if (user) {
            updateCart()
        }
    }, [cartItems])

    // 🔼 increase quantity
    const increaseQty = (productId) => {
        setCartItems((prev) => {
            const updated = { ...prev };
            updated[productId] = (updated[productId] || 0) + 1;

            if (!user) {
                localStorage.setItem("guest_cart", JSON.stringify(updated));
            }
            return updated;
        });
    };

    // 🔽 decrease quantity
    const decreaseQty = (productId) => {
        setCartItems((prev) => {
            const updated = { ...prev };
            if (!updated[productId]) return prev;

            updated[productId] -= 1;
            if (updated[productId] <= 0) {
                delete updated[productId];
            }

            if (!user) {
                localStorage.setItem("guest_cart", JSON.stringify(updated));
            }
            return updated;
        });
    };

    // ❌ remove item completely
    const removeItemCompletely = (productId) => {
        setCartItems((prev) => {
            const updated = { ...prev };
            delete updated[productId];

            if (!user) {
                localStorage.setItem("guest_cart", JSON.stringify(updated));
            }
            return updated;
        });
    };



    const value = { navigate, user, setUser, isSeller, setIsSeller, showUserLogin, setShowUserLogin, products, currency, addToCart, updateCartItem, removeFromCart, cartItems, searchQuery, setSearchQuery, getCartCount, getCartAmount, axios, fetchProducts, setCartItems, redirectAfterLogin, setRedirectAfterLogin, mergeGuestCart, authChecked, setAuthChecked, increaseQty, decreaseQty, removeItemCompletely }

    return <Appcontext.Provider value={value}>
        {children}
    </Appcontext.Provider>
}

export const useAppContext = () => {
    return useContext(Appcontext)
}