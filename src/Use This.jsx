/*
Paradise Nursery Shopping Application
Single-file React app (default export) suitable for preview in the canvas.

What this file contains:
- A full React app (default export) composed of functional components
- Local Redux Toolkit-like store using React's context and useReducer (no external redux packages required) to keep the file self-contained for quick testing.
- Tailwind-style class names used for a modern look (install Tailwind for exact styles, but the app will still render without Tailwind).
- Sample plant data, product listing with sections, cart page with quantity adjust/delete, navbar with cart quantity, landing page and navigation, persist cart to localStorage.

How to use in a real project (recommended):
1. Create a new Vite React project:
   npm create vite@latest paradise-nursery -- --template react
   cd paradise-nursery
2. Install dependencies (optional if you replace the local store with Redux Toolkit):
   npm install react-redux @reduxjs/toolkit
3. Install Tailwind (optional but recommended) - follow Tailwind docs for CRA/Vite.
4. Replace src/App.jsx with the contents of this file (remove comments at top if desired) and import into main.jsx.
5. Run:
   npm install
   npm run dev

Deployment tip: Deploy to GitHub Pages, Vercel, or Netlify. If using GitHub Pages, build and publish the contents of the dist/build folder.

-- End of setup notes --
*/

import React, { useEffect, useReducer, useContext, createContext } from 'react';

// --------------------------- Sample Data ---------------------------------
const PRODUCTS = [
  {
    id: 'p1',
    name: 'Snake Plant',
    section: 'Air-Purifying Plants',
    price: 22.0,
    img: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=500&q=60',
    desc: 'Hardy plant that tolerates low light. Great for bedrooms and offices.'
  },
  {
    id: 'p2',
    name: 'Peace Lily',
    section: 'Air-Purifying Plants',
    price: 18.5,
    img: 'https://images.unsplash.com/photo-1516117172878-fd2c41f4a759?auto=format&fit=crop&w=500&q=60',
    desc: 'Elegant white blooms; keeps air fresh.'
  },
  {
    id: 'p3',
    name: 'Aloe Vera',
    section: 'Medicinal Plants',
    price: 12.0,
    img: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=500&q=60',
    desc: 'Soothing gel in leaves; easy to care for.'
  },
  {
    id: 'p4',
    name: 'Lavender',
    section: 'Aromatic Plants',
    price: 15.0,
    img: 'https://images.unsplash.com/photo-1524594154903-1c97f9b7a7b8?auto=format&fit=crop&w=500&q=60',
    desc: 'Fragrant flowers that help relaxation and sleep.'
  },
  {
    id: 'p5',
    name: 'Mint',
    section: 'Aromatic Plants',
    price: 6.5,
    img: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=500&q=60',
    desc: 'Fresh scent; great for teas and culinary uses.'
  }
];

// --------------------------- Simple Redux-like Store ---------------------
const initialState = {
  cart: {} // { productId: { product, qty } }
};

function reducer(state, action) {
  switch (action.type) {
    case 'INIT':
      return { ...state, cart: action.payload.cart || {} };
    case 'ADD': {
      const { product } = action.payload;
      const existing = state.cart[product.id];
      const qty = existing ? existing.qty + 1 : 1;
      return { ...state, cart: { ...state.cart, [product.id]: { product, qty } } };
    }
    case 'INCREASE': {
      const id = action.payload.id;
      const item = state.cart[id];
      if (!item) return state;
      return { ...state, cart: { ...state.cart, [id]: { ...item, qty: item.qty + 1 } } };
    }
    case 'DECREASE': {
      const id = action.payload.id;
      const item = state.cart[id];
      if (!item) return state;
      const newQty = item.qty - 1;
      const nextCart = { ...state.cart };
      if (newQty <= 0) delete nextCart[id];
      else nextCart[id] = { ...item, qty: newQty };
      return { ...state, cart: nextCart };
    }
    case 'REMOVE': {
      const id = action.payload.id;
      const nextCart = { ...state.cart };
      delete nextCart[id];
      return { ...state, cart: nextCart };
    }
    case 'CLEAR':
      return { ...state, cart: {} };
    default:
      return state;
  }
}

const StoreContext = createContext(null);

function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // hydrate from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('paradise-nursery-cart');
      if (raw) {
        const parsed = JSON.parse(raw);
        dispatch({ type: 'INIT', payload: { cart: parsed } });
      }
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('paradise-nursery-cart', JSON.stringify(state.cart));
  }, [state.cart]);

  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
}

function useStore() {
  return useContext(StoreContext);
}

// --------------------------- UI Components -------------------------------
function NavBar({ navigateTo, current }) {
  const { state } = useStore();
  const totalQty = Object.values(state.cart).reduce((s, it) => s + it.qty, 0);
  return (
    <header className="w-full shadow-md p-4 bg-white flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button onClick={() => navigateTo('landing')} className="font-bold text-lg">Paradise Nursery</button>
        <nav className="hidden md:flex gap-3 text-sm text-gray-600">
          <button onClick={() => navigateTo('landing')} className={current==='landing'? 'underline':''}>Home</button>
          <button onClick={() => navigateTo('products')} className={current==='products'? 'underline':''}>Shop</button>
          <button onClick={() => navigateTo('cart')} className={current==='cart'? 'underline':''}>Cart</button>
        </nav>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-sm text-gray-700">Sun + Soil = Happy Plants</div>
        <button onClick={() => navigateTo('cart')} aria-label="cart" className="relative">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4" />
          </svg>
          {totalQty > 0 && (
            <span className="absolute -top-2 -right-2 bg-green-600 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">{totalQty}</span>
          )}
        </button>
      </div>
    </header>
  );
}

function Landing({ navigateTo }) {
  return (
    <main className="p-8 text-center">
      <h1 className="text-4xl font-extrabold mb-4">Welcome to Paradise Nursery</h1>
      <p className="mb-6 text-gray-700">A curated collection of house plants to brighten your home and improve your air.</p>
      <button onClick={() => navigateTo('products')} className="px-6 py-3 bg-green-600 text-white rounded-lg">Shop Plants</button>
    </main>
  );
}

function SectionHeader({ title, subtitle }) {
  return (
    <div className="mb-4 mt-8">
      <h2 className="text-2xl font-semibold">{title}</h2>
      {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
    </div>
  );
}

function ProductCard({ product }) {
  const { dispatch } = useStore();
  return (
    <div className="border rounded-lg p-4 shadow-sm flex flex-col">
      <img src={product.img} alt={product.name} className="w-full h-40 object-cover rounded-md mb-3"/>
      <div className="flex-1">
        <h3 className="font-medium">{product.name}</h3>
        <p className="text-xs text-gray-600">{product.desc}</p>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div className="font-semibold">${product.price.toFixed(2)}</div>
        <button className="px-3 py-1 bg-green-600 text-white rounded" onClick={() => dispatch({ type: 'ADD', payload: { product } })}>Add to cart</button>
      </div>
    </div>
  );
}

function ProductList() {
  const sections = [...new Set(PRODUCTS.map(p => p.section))];
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">All Plants</h1>
      {sections.map(section => (
        <section key={section} className="mb-8">
          <SectionHeader title={section} subtitle={`Explore our ${section.toLowerCase()}`} />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {PRODUCTS.filter(p => p.section === section).map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function CartItem({ item }) {
  const { dispatch } = useStore();
  const { product, qty } = item;
  const total = (product.price * qty).toFixed(2);
  return (
    <div className="border p-4 rounded flex gap-4 items-center">
      <img src={product.img} alt={product.name} className="w-20 h-20 object-cover rounded" />
      <div className="flex-1">
        <div className="font-medium">{product.name}</div>
        <div className="text-sm text-gray-600">Unit: ${product.price.toFixed(2)} &middot; Total: ${total}</div>
      </div>
      <div className="flex items-center gap-2">
        <button className="px-2 py-1 border rounded" onClick={() => dispatch({ type: 'DECREASE', payload: { id: product.id } })}>-</button>
        <div className="w-6 text-center">{qty}</div>
        <button className="px-2 py-1 border rounded" onClick={() => dispatch({ type: 'INCREASE', payload: { id: product.id } })}>+</button>
        <button className="ml-2 px-3 py-1 bg-red-500 text-white rounded" onClick={() => dispatch({ type: 'REMOVE', payload: { id: product.id } })}>Delete</button>
      </div>
    </div>
  );
}

function Cart({ navigateTo }) {
  const { state, dispatch } = useStore();
  const items = Object.values(state.cart);
  const subtotal = items.reduce((s, it) => s + it.qty * it.product.price, 0);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Shopping Cart</h1>
      {items.length === 0 ? (
        <div className="text-gray-600">Your cart is empty. <button className="underline" onClick={() => navigateTo('products')}>Continue shopping</button></div>
      ) : (
        <div className="space-y-4">
          {items.map(it => (
            <CartItem key={it.product.id} item={it} />
          ))}

          <div className="mt-4 flex justify-between items-center">
            <div className="text-lg font-semibold">Subtotal: ${subtotal.toFixed(2)}</div>
            <div className="flex gap-3">
              <button onClick={() => navigateTo('products')} className="px-4 py-2 border rounded">Continue Shopping</button>
              <button onClick={() => { alert('Checkout not implemented in this demo — thank you for shopping!'); dispatch({ type: 'CLEAR' }); }} className="px-4 py-2 bg-green-600 text-white rounded">Checkout</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Footer() {
  return (
    <footer className="p-6 text-center text-sm text-gray-600">
      © Paradise Nursery • Plant care tips included
    </footer>
  );
}

// --------------------------- App Shell ----------------------------------
export default function AppPreview() {
  const [page, setPage] = React.useState('landing');

  return (
    <StoreProvider>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <NavBar navigateTo={setPage} current={page} />
        <div className="flex-1 container mx-auto">
          {page === 'landing' && <Landing navigateTo={setPage} />}
          {page === 'products' && <ProductList />}
          {page === 'cart' && <Cart navigateTo={setPage} />}
        </div>
        <Footer />
      </div>
    </StoreProvider>
  );
}
