/**
 * Page d'accueil client
 * 
 * Affiche la liste des restaurants avec recherche et filtres.
 * C'est la première page que voit le client après connexion.
 */

import { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import { getRestaurants } from '../../services/restaurantService';
import RestaurantCard from '../../components/client/RestaurantCard';

function Home() {
  
  // États pour les restaurants et les filtres
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    cuisineType: '',
    minRating: 0,
  });

  // Charger les restaurants au démarrage
  useEffect(() => {
    loadRestaurants();
  }, [filters]);

  /**
   * Fonction pour charger les restaurants depuis Supabase
   */
  const loadRestaurants = async () => {
    setLoading(true);
    try {
      const data = await getRestaurants({
        ...filters,
        search: searchQuery,
      });
      setRestaurants(data);
    } catch (error) {
      console.error('Erreur chargement restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fonction appelée quand l'utilisateur tape dans la barre de recherche
   */
  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Délai pour éviter trop de requêtes (debounce)
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
      loadRestaurants();
    }, 300);
  };

  return (
    <div className="min-h-screen">
      {/* Header avec recherche - Style Soft UI */}
      <div className="card-soft border-b border-gray-200 sticky top-0 z-10 backdrop-blur-md bg-white/95">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            {/* Barre de recherche */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5 z-10" />
              <input
                type="text"
                placeholder="Rechercher restaurants..."
                value={searchQuery}
                onChange={handleSearch}
                className="input-soft pl-9 sm:pl-10 text-sm sm:text-base w-full"
              />
            </div>

            {/* Bouton filtres */}
            <button className="px-4 sm:px-6 py-2 sm:py-2.5 border-2 border-gray-300 rounded-soft hover:bg-gray-50 hover:border-primary flex items-center justify-center gap-2 transition-all duration-200 shadow-soft hover:shadow-soft-md font-medium text-sm sm:text-base">
              <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Filtres</span>
            </button>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {loading ? (
          // Affichage du loader
          <div className="text-center py-8 sm:py-12">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600 text-sm sm:text-base">Chargement...</p>
          </div>
        ) : restaurants.length === 0 ? (
          // Message si aucun restaurant - Style Soft UI
          <div className="text-center py-8 sm:py-16">
            <div className="card-soft-md p-6 sm:p-10 inline-block max-w-md mx-2">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-colored-md">
                <Search className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <p className="text-gray-700 text-base sm:text-lg font-medium mb-2">
                {searchQuery
                  ? 'Aucun restaurant trouvé'
                  : 'Aucun restaurant disponible'}
              </p>
              <p className="text-gray-500 text-xs sm:text-sm">
                {searchQuery
                  ? 'Essayez avec d\'autres mots-clés'
                  : 'Revenez plus tard pour découvrir nos restaurants'}
              </p>
            </div>
          </div>
        ) : (
          // Grille de restaurants - Style Soft UI
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {restaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Home;


