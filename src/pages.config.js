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
import About from './pages/About';
import Account from './pages/Account';
import AdminReferences from './pages/AdminReferences';
import BuilderCustomers from './pages/BuilderCustomers';
import BuilderFAQ from './pages/BuilderFAQ';
import BuilderLanding from './pages/BuilderLanding';
import BuilderOrders from './pages/BuilderOrders';
import BuilderProfile from './pages/BuilderProfile';
import BuilderReturnsWarranty from './pages/BuilderReturnsWarranty';
import Builders from './pages/Builders';
import Catalog from './pages/Catalog';
import Checkout from './pages/Checkout';
import Contact from './pages/Contact';
import CustomBuilds from './pages/CustomBuilds';
import Dashboard from './pages/Dashboard';
import DashboardActiveListings from './pages/DashboardActiveListings';
import DashboardCustomBuilds from './pages/DashboardCustomBuilds';
import DashboardProducts from './pages/DashboardProducts';
import DashboardProfile from './pages/DashboardProfile';
import DashboardRatings from './pages/DashboardRatings';
import FounderLetter from './pages/FounderLetter';
import Home from './pages/Home';
import Messages from './pages/Messages';
import Orders from './pages/Orders';
import ProductDetail from './pages/ProductDetail';
import Terms from './pages/Terms';
import Wishlist from './pages/Wishlist';
import AdminBuilderBadges from './pages/AdminBuilderBadges';
import __Layout from './Layout.jsx';


export const PAGES = {
    "About": About,
    "Account": Account,
    "AdminReferences": AdminReferences,
    "BuilderCustomers": BuilderCustomers,
    "BuilderFAQ": BuilderFAQ,
    "BuilderLanding": BuilderLanding,
    "BuilderOrders": BuilderOrders,
    "BuilderProfile": BuilderProfile,
    "BuilderReturnsWarranty": BuilderReturnsWarranty,
    "Builders": Builders,
    "Catalog": Catalog,
    "Checkout": Checkout,
    "Contact": Contact,
    "CustomBuilds": CustomBuilds,
    "Dashboard": Dashboard,
    "DashboardActiveListings": DashboardActiveListings,
    "DashboardCustomBuilds": DashboardCustomBuilds,
    "DashboardProducts": DashboardProducts,
    "DashboardProfile": DashboardProfile,
    "DashboardRatings": DashboardRatings,
    "FounderLetter": FounderLetter,
    "Home": Home,
    "Messages": Messages,
    "Orders": Orders,
    "ProductDetail": ProductDetail,
    "Terms": Terms,
    "Wishlist": Wishlist,
    "AdminBuilderBadges": AdminBuilderBadges,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};