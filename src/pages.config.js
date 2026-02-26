/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import DashboardCustomBuilds from './pages/DashboardCustomBuilds';
import BuilderOrders from './pages/BuilderOrders';
import Dashboard from './pages/Dashboard';
import Wishlist from './pages/Wishlist';
import Orders from './pages/Orders';
import Checkout from './pages/Checkout';
import Account from './pages/Account';
import Terms from './pages/Terms';
import ProductDetail from './pages/ProductDetail';
import AdminReferences from './pages/AdminReferences';
import DashboardProfile from './pages/DashboardProfile';
import BuilderProfile from './pages/BuilderProfile';
import Home from './pages/Home';
import Contact from './pages/Contact';
import DashboardProducts from './pages/DashboardProducts';
import Catalog from './pages/Catalog';
import JoinBuilders from './pages/JoinBuilders';
import Builders from './pages/Builders';
import About from './pages/About';
import CustomBuilds from './pages/CustomBuilds';
import Messages from './pages/Messages';
import __Layout from './Layout.jsx';


export const PAGES = {
    "DashboardCustomBuilds": DashboardCustomBuilds,
    "BuilderOrders": BuilderOrders,
    "Dashboard": Dashboard,
    "Wishlist": Wishlist,
    "Orders": Orders,
    "Checkout": Checkout,
    "Account": Account,
    "Terms": Terms,
    "ProductDetail": ProductDetail,
    "AdminReferences": AdminReferences,
    "DashboardProfile": DashboardProfile,
    "BuilderProfile": BuilderProfile,
    "Home": Home,
    "Contact": Contact,
    "DashboardProducts": DashboardProducts,
    "Catalog": Catalog,
    "JoinBuilders": JoinBuilders,
    "Builders": Builders,
    "About": About,
    "CustomBuilds": CustomBuilds,
    "Messages": Messages,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};