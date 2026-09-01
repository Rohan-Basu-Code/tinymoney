import { NavLink } from "react-router-dom"
function Nav({showNav,setShowNav,theme, setTheme}) {
    return(
        <nav className={showNav? 'show':''}>
            <button className={`theme-btn ${theme==='light'?'theme-light':'theme-dark'}`} onClick={()=> setTheme(prev=> prev==='light'?'dark':'light')}></button>
            <NavLink to="/" onClick={()=>setShowNav(false)}>Home</NavLink>
            <NavLink to="/sales" onClick={()=>setShowNav(false)}>Sales</NavLink>
            <NavLink to="/products" onClick={()=>setShowNav(false)} >Products</NavLink>
            
            
            <button className="nav-close" onClick={()=>setShowNav(false)}>⨉</button>
        </nav>
    )    
}

export default Nav