import { useState, useEffect } from "react"
import { Route, Routes } from "react-router-dom"

import Products from "./components/Products"
import ShowEntries from "./components/ShowEntries"
import Nav from "./components/Nav"
import Home from "./components/Home"
import { getProduct, getEntries  } from "./db";



function App() {

  const [products, setProducts] = useState([]);
  const [entries, setEntries] = useState([]);
  const [showNav,setShowNav] = useState(false);
  const [theme,setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });

  useEffect(() => {
      localStorage.setItem("theme", theme);
  }, [theme]);
  useEffect(() => {
    async function loadData() {
        try {
            const products = await getProduct();
            const entries = await getEntries();

            setProducts(products);
            setEntries(entries);
        } catch (error) {
            console.error("Failed to load data:", error);
        }
    }

  loadData();
}, []);

  return (
    <div className={`container ${theme}`}>
      {!showNav &&<button className="nav-button" onClick={()=>setShowNav(true)}>≡</button>}
      {showNav &&<div className="backdrop" onClick={()=>setShowNav(false)}></div>}
      <Nav showNav={showNav} setShowNav={setShowNav} theme={theme} setTheme={setTheme}/>
      <Routes>
        <Route path='/' element={<Home entries={entries} setEntries={setEntries} products={products}/>}/>
        <Route path='/sales' element={<ShowEntries entries={entries} setEntries={setEntries}/>}/>
        <Route path='/products' element={<Products setProducts={setProducts} products={products}/>}/>
      </Routes> 
    </div>
  )
}

export default App
