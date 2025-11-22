/**
 * Composant App - Composant racine de l'application
 * 
 * Ce composant gère :
 * - La direction du texte (LTR/RTL) selon la langue sélectionnée
 * - Le routage avec React Router
 * - Le contexte d'authentification
 * - La structure de base de l'application
 */

import { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Heart, Package, User, Loader2 } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { RestaurantAuthProvider, useRestaurantAuth } from './contexts/RestaurantAuthContext';
import { AdminAuthProvider, useAdminAuth } from './contexts/AdminAuthContext';
import { CartProvider, useCart } from './contexts/CartContext';
import { NotificationProvider } from './contexts/NotificationContext';
import LanguageSelector from './components/common/LanguageSelector';
import NotificationPermission from './components/common/NotificationPermission';

// Lazy loading des pages client
const Login = lazy(() => import('./pages/client/Login'));
const SignUp = lazy(() => import('./pages/client/SignUp'));
const ResendConfirmation = lazy(() => import('./pages/client/ResendConfirmation'));
const Home = lazy(() => import('./pages/client/Home'));
const RestaurantDetail = lazy(() => import('./pages/client/RestaurantDetail'));
const Cart = lazy(() => import('./pages/client/Cart'));
const Favorites = lazy(() => import('./pages/client/Favorites'));
const Checkout = lazy(() => import('./pages/client/Checkout'));
const OrderConfirmation = lazy(() => import('./pages/client/OrderConfirmation'));
const OrderHistory = lazy(() => import('./pages/client/OrderHistory'));
const Profile = lazy(() => import('./pages/client/Profile'));
const Settings = lazy(() => import('./pages/client/Settings'));
const AccountInfo = lazy(() => import('./pages/client/AccountInfo'));
const ChangeEmail = lazy(() => import('./pages/client/ChangeEmail'));
const ChangePassword = lazy(() => import('./pages/client/ChangePassword'));
const SavedAddresses = lazy(() => import('./pages/client/SavedAddresses'));
const AddressForm = lazy(() => import('./pages/client/AddressForm'));

// Lazy loading des pages restaurant
const RestaurantLogin = lazy(() => import('./pages/restaurant/Login'));
const RestaurantSignUp = lazy(() => import('./pages/restaurant/SignUp'));
const RestaurantDashboard = lazy(() => import('./pages/restaurant/Dashboard'));
const ManageMenu = lazy(() => import('./pages/restaurant/ManageMenu'));
const ManageOrders = lazy(() => import('./pages/restaurant/ManageOrders'));
const ManagePromotions = lazy(() => import('./pages/restaurant/ManagePromotions'));
const ManageProfile = lazy(() => import('./pages/restaurant/ManageProfile'));
const ManageOpeningHours = lazy(() => import('./pages/restaurant/ManageOpeningHours'));

// Lazy loading des pages admin
const AdminLogin = lazy(() => import('./pages/admin/Login'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const ManageRestaurants = lazy(() => import('./pages/admin/ManageRestaurants'));
const ManageClients = lazy(() => import('./pages/admin/ManageClients'));
const ManageOrdersAdmin = lazy(() => import('./pages/admin/ManageOrders'));
const SupportTickets = lazy(() => import('./pages/admin/SupportTickets'));
const CommissionPayments = lazy(() => import('./pages/admin/CommissionPayments'));

// Composant de chargement pour Suspense
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
      <p className="text-gray-600">Chargement...</p>
    </div>
  </div>
);

/**
 * Composant pour protéger les routes qui nécessitent une authentification
 * @param {Object} props - Props du composant
 * @param {ReactNode} props.children - Composants enfants à afficher si authentifié
 */
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  // Afficher un loader pendant le chargement
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  // Si l'utilisateur n'est pas connecté, rediriger vers la page de connexion
  if (!user) {
    return <Navigate to="/client/login" replace />;
  }

  // Si l'utilisateur est connecté, afficher les enfants
  return children;
}

/**
 * Composant pour les routes publiques (redirige si déjà connecté)
 * @param {Object} props - Props du composant
 * @param {ReactNode} props.children - Composants enfants à afficher
 */
function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  // Si l'utilisateur est déjà connecté, rediriger vers la page d'accueil
  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
}

/**
 * Composant pour protéger les routes restaurant qui nécessitent une authentification
 * @param {Object} props - Props du composant
 * @param {ReactNode} props.children - Composants enfants à afficher si authentifié
 */
function ProtectedRestaurantRoute({ children }) {
  const { restaurant, loading } = useRestaurantAuth();

  // Afficher un loader pendant le chargement
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  // Si le restaurant n'est pas connecté, rediriger vers la page de connexion
  if (!restaurant) {
    return <Navigate to="/restaurant/login" replace />;
  }

  // Si le restaurant est connecté, afficher les enfants
  return children;
}

/**
 * Composant pour les routes publiques restaurant (redirige si déjà connecté)
 * @param {Object} props - Props du composant
 * @param {ReactNode} props.children - Composants enfants à afficher
 */
function PublicRestaurantRoute({ children }) {
  const { restaurant, loading } = useRestaurantAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  // Si le restaurant est déjà connecté, rediriger vers le dashboard
  if (restaurant) {
    return <Navigate to="/restaurant/dashboard" replace />;
  }

  return children;
}

/**
 * Composant pour protéger les routes admin qui nécessitent une authentification
 * @param {Object} props - Props du composant
 * @param {ReactNode} props.children - Composants enfants à afficher si authentifié
 */
function ProtectedAdminRoute({ children }) {
  const { admin, loading } = useAdminAuth();

  // Afficher un loader pendant le chargement
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  // Si l'admin n'est pas connecté, rediriger vers la page de connexion
  if (!admin) {
    return <Navigate to="/admin/login" replace />;
  }

  // Si l'admin est connecté, afficher les enfants
  return children;
}

/**
 * Composant pour les routes publiques admin (redirige si déjà connecté)
 * @param {Object} props - Props du composant
 * @param {ReactNode} props.children - Composants enfants à afficher
 */
function PublicAdminRoute({ children }) {
  const { admin, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  // Si l'admin est déjà connecté, rediriger vers le dashboard
  if (admin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
}

/**
 * Composant pour gérer la direction du texte selon la langue
 */
function AppContent() {
  // useEffect s'exécute après chaque rendu
  // Ici, on l'utilise pour changer la direction du texte selon la langue
  useEffect(() => {
    // Récupérer la langue sauvegardée ou utiliser le français par défaut
    const savedLanguage = localStorage.getItem('taybo-language') || 'fr';
    
    // Si la langue est l'arabe, on passe en RTL (Right-to-Left)
    // Sinon, on reste en LTR (Left-to-Right)
    if (savedLanguage === 'ar') {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ar';
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = savedLanguage;
    }
  }, []);

  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <AppWithRouter />
      </Suspense>
    </BrowserRouter>
  );
}

/**
 * Composant Header avec navigation (doit être dans BrowserRouter)
 */
function Header() {
  const { user } = useAuth();
  const { getTotalItems } = useCart();
  const location = useLocation();
  const totalItems = getTotalItems();

  // Ne pas afficher le header sur les pages d'authentification
  const hideHeader = location.pathname.includes('/client/login') ||
    location.pathname.includes('/client/signup') ||
    location.pathname.includes('/restaurant/login') ||
    location.pathname.includes('/restaurant/signup') ||
    location.pathname.includes('/admin/login') ||
    location.pathname.startsWith('/admin/');

  if (hideHeader) {
    return null;
  }

  return (
    <header className="card-soft border-b border-gray-200 sticky top-0 z-50 backdrop-blur-md bg-white/95 shadow-soft">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link 
            to="/" 
            className="flex items-center gap-3 group"
          >
            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-colored-md group-hover:shadow-colored-lg transition-all duration-200">
              <span className="text-xl font-bold text-white">T</span>
            </div>
            <span className="text-2xl font-bold text-gray-900 group-hover:text-primary transition-colors">
              Taybo
            </span>
          </Link>
          
          <div className="flex items-center gap-3">
            {/* Bouton Panier */}
            <Link
              to="/client/cart"
              className="relative p-2.5 text-gray-700 hover:text-primary hover:bg-gray-50 rounded-xl transition-all duration-200 group"
              title="Panier"
            >
              <ShoppingCart className="w-6 h-6 group-hover:scale-110 transition-transform" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-colored">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </Link>

            {/* Bouton Favoris */}
            {user && (
              <Link
                to="/client/favorites"
                className="p-2.5 text-gray-700 hover:text-primary hover:bg-gray-50 rounded-xl transition-all duration-200 group"
                title="Favoris"
              >
                <Heart className="w-6 h-6 group-hover:scale-110 transition-transform" />
              </Link>
            )}

            {/* Bouton Commandes */}
            {user && (
              <Link
                to="/client/orders"
                className="p-2.5 text-gray-700 hover:text-primary hover:bg-gray-50 rounded-xl transition-all duration-200 group"
                title="Mes commandes"
              >
                <Package className="w-6 h-6 group-hover:scale-110 transition-transform" />
              </Link>
            )}

            {/* Bouton Profil */}
            {user && (
              <Link
                to="/client/profile"
                className="p-2.5 text-gray-700 hover:text-primary hover:bg-gray-50 rounded-xl transition-all duration-200 group"
                title="Profil"
              >
                <User className="w-6 h-6 group-hover:scale-110 transition-transform" />
              </Link>
            )}

            {/* Sélecteur de langue */}
            <LanguageSelector />
          </div>
        </div>
      </div>
    </header>
  );
}

/**
 * Composant wrapper pour les routes (doit être dans BrowserRouter)
 */
function AppWithRouter() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header avec navigation */}
      <Header />
      
      {/* Banner de permission de notifications */}
      <NotificationPermission />

        {/* Routes de l'application */}
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
          {/* Route publique : Page d'accueil */}
          <Route
            path="/"
            element={<Home />}
          />

          {/* Route publique : Détail restaurant */}
          <Route
            path="/restaurant/:id"
            element={<RestaurantDetail />}
          />

          {/* Route publique : Panier */}
          <Route
            path="/client/cart"
            element={<Cart />}
          />

          {/* Routes protégées client */}
          <Route
            path="/client/favorites"
            element={
              <ProtectedRoute>
                <Favorites />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client/orders"
            element={
              <ProtectedRoute>
                <OrderHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client/orders/:id"
            element={
              <ProtectedRoute>
                <OrderConfirmation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client/settings/account"
            element={
              <ProtectedRoute>
                <AccountInfo />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client/settings/addresses"
            element={
              <ProtectedRoute>
                <SavedAddresses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client/settings/addresses/new"
            element={
              <ProtectedRoute>
                <AddressForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client/settings/addresses/:id"
            element={
              <ProtectedRoute>
                <AddressForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client/settings/change-email"
            element={
              <ProtectedRoute>
                <ChangeEmail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client/settings/change-password"
            element={
              <ProtectedRoute>
                <ChangePassword />
              </ProtectedRoute>
            }
          />

          {/* Routes publiques d'authentification client */}
          <Route
            path="/client/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/client/signup"
            element={
              <PublicRoute>
                <SignUp />
              </PublicRoute>
            }
          />
          <Route
            path="/client/resend-confirmation"
            element={
              <PublicRoute>
                <ResendConfirmation />
              </PublicRoute>
            }
          />

          {/* Routes publiques d'authentification restaurant */}
          <Route
            path="/restaurant/login"
            element={
              <PublicRestaurantRoute>
                <RestaurantLogin />
              </PublicRestaurantRoute>
            }
          />
          <Route
            path="/restaurant/signup"
            element={
              <PublicRestaurantRoute>
                <RestaurantSignUp />
              </PublicRestaurantRoute>
            }
          />

          {/* Routes protégées restaurant */}
          <Route
            path="/restaurant/dashboard"
            element={
              <ProtectedRestaurantRoute>
                <RestaurantDashboard />
              </ProtectedRestaurantRoute>
            }
          />
          <Route
            path="/restaurant/menu"
            element={
              <ProtectedRestaurantRoute>
                <ManageMenu />
              </ProtectedRestaurantRoute>
            }
          />
          <Route
            path="/restaurant/orders"
            element={
              <ProtectedRestaurantRoute>
                <ManageOrders />
              </ProtectedRestaurantRoute>
            }
          />
          <Route
            path="/restaurant/promotions"
            element={
              <ProtectedRestaurantRoute>
                <ManagePromotions />
              </ProtectedRestaurantRoute>
            }
          />
          <Route
            path="/restaurant/opening-hours"
            element={
              <ProtectedRestaurantRoute>
                <ManageOpeningHours />
              </ProtectedRestaurantRoute>
            }
          />
          <Route
            path="/restaurant/profile"
            element={
              <ProtectedRestaurantRoute>
                <ManageProfile />
              </ProtectedRestaurantRoute>
            }
          />

          {/* Routes publiques d'authentification admin */}
          <Route
            path="/admin/login"
            element={
              <PublicAdminRoute>
                <AdminLogin />
              </PublicAdminRoute>
            }
          />

          {/* Routes protégées admin */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedAdminRoute>
                <AdminDashboard />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/restaurants"
            element={
              <ProtectedAdminRoute>
                <ManageRestaurants />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/clients"
            element={
              <ProtectedAdminRoute>
                <ManageClients />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <ProtectedAdminRoute>
                <ManageOrdersAdmin />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/support"
            element={
              <ProtectedAdminRoute>
                <SupportTickets />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/commissions"
            element={
              <ProtectedAdminRoute>
                <CommissionPayments />
              </ProtectedAdminRoute>
            }
          />
        </Routes>
        </Suspense>
      </div>
  );
}

/**
 * Composant App principal
 * Enveloppe l'application avec les providers nécessaires pour que tous les composants
 * puissent accéder à l'état d'authentification
 */
function App() {
  return (
    <AuthProvider>
      <RestaurantAuthProvider>
        <AdminAuthProvider>
          <CartProvider>
            <NotificationProvider>
              <AppContent />
            </NotificationProvider>
          </CartProvider>
        </AdminAuthProvider>
      </RestaurantAuthProvider>
    </AuthProvider>
  );
}

export default App;
