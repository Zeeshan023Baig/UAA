import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Catalogue from './pages/Catalogue';
import Cart from './pages/Cart';
import Admin from './pages/Admin';
import { ProductProvider } from './context/ProductContext';

function App() {
  return (
    <ProductProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="catalogue" element={<Catalogue />} />
          <Route path="cart" element={<Cart />} />
          <Route path="admin" element={<Admin />} />
        </Route>
      </Routes>
    </ProductProvider>
  );
}

export default App;
