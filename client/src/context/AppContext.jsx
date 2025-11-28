import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { dummyProducts } from "../assets/assets";
import toast from "react-hot-toast";
import axios from "axios";


 
axios.defaults.withCredentials = true; 
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

export const Appcontext = createContext();

export const AppContextProvider = ({children})=>{
    const currency = import.meta.env.VITE_CURRENCY;
    const navigate = useNavigate()
    const [user,setUser] = useState(null)
    const [isSeller,setIsSeller] = useState(false)
    const [showUserLogin,setShowUserLogin] = useState(false)
    const [products, setProducts] = useState([])
    const [cartItems,setCartItems] = useState({})
    const [searchQuery,setSearchQuery] = useState({})

   //Fetch Seller Status
    const fetchSeller = async ()=>{
        try {
            const{data} = await axios.get('/api/seller/is-auth');
            if(data.success){
                setIsSeller(true)
            }else{
                setIsSeller(false)
            }
        } catch (error) {
            setIsSeller(false)
        }
    }
 
   
//     const fetchUser = async () => {
//   try {
//     const { data } = await axios.get('/api/user/is-auth');
//     if (data.success) {
//       setUser(data.user);

//       // ✅ Convert array to object
//       const formattedCart = {};
//       if (Array.isArray(data.user.cartItems)) {
//         data.user.cartItems.forEach(item => {
//           if (item.product && item.quantity) {
//             formattedCart[item.product] = item.quantity;
//           }
//         });
//       }

//       setCartItems(formattedCart);
//     }
//   } catch (error) {
//     setUser(null);
//   }
// };

const fetchUser = async () => {
  try {
    const { data } = await axios.get('/api/user/is-auth');
    if (data.success) {
      setUser(data.user);

      // ✅ Directly use cartItems as object
      setCartItems(data.user.cartItems || {});
    }
  } catch (error) {
    setUser(null);
    setCartItems({});
  }
};



    //fetching products
    const fetchProducts = async () => {
        try{
            const {data} = await axios.get('/api/product/list')
            if(data.success){
                setProducts(data.products)
                console.log(products);
                
            }else{
                toast.error(data.message)
            }
        }catch(error){
            toast.error(error.message)
        }
    }
    
    //adding products to cart
    const addToCart = (itemId) => {
        let cartData = structuredClone(cartItems)

        if(cartData[itemId]){
            cartData[itemId]+=1
        }else{
            cartData[itemId] = 1
        }
        setCartItems(cartData)
        toast.success("Added to Cart")
    }
    //update cart
    const updateCartItem = (itemId, quantity) => {
        let cartData = structuredClone(cartItems)
        cartData[itemId] = quantity
        setCartItems(cartData)
        toast.success("Cart Updated")
    } 
    //removing product from cart
    const removeFromCart = (itemId) => {
        let cartData = structuredClone(cartItems)
        if(cartData[itemId]){
            cartData[itemId] -= 1
            if(cartData[itemId]===0){
                delete cartData[itemId]
            }
        }
        toast.success("Removed from Cart")
        setCartItems(cartData)
    }
    
    //cart count 
    const getCartCount = () => {
        console.log("cartitems",cartItems);
        
        let totalCount = 0;
        for(const item in cartItems){
            totalCount += cartItems[item]
        }
        console.log("totalcount",totalCount);
        return totalCount
    }

    //cart total amount
    const getCartAmount = () => {
        let totalAmount = 0;
        for(const items in cartItems){
            let itemInfo = products.find((product)=>product._id === items)
            if(cartItems[items] > 0){
                
                totalAmount += itemInfo.offerPrice * cartItems[items]
                
            }
        }
        
        
        
        return Math.floor(totalAmount * 100) / 100;
    }

    useEffect(()=>{
        fetchUser()
        fetchProducts()
        fetchSeller()
    },[])

    //update cart in backend whenever cart items change
    useEffect(()=>{
        const updateCart = async () => {
            try {
                const {data} = await axios.post('/api/cart/update',{cartItems})
                if(!data.success){
                    toast.error(data.message)
                }
            } catch (error) {
                toast.error(error.message)
            }
        }
        if(user){
            updateCart()
        }
    },[cartItems])



    const value = {navigate, user, setUser, isSeller, setIsSeller, showUserLogin, setShowUserLogin, products, currency, addToCart, updateCartItem, removeFromCart, cartItems, searchQuery, setSearchQuery, getCartCount,  getCartAmount, axios, fetchProducts, setCartItems }

    return <Appcontext.Provider value={value}>
        {children}
    </Appcontext.Provider>
}

export const useAppContext = () => {
    return useContext(Appcontext)
}