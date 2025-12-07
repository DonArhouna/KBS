
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { TabsContent, TabsList, Tabs, TabsTrigger } from "@/components/ui/tabs";
import PageBanner from "@/components/PageBanner";
import ProductsAdmin from "@/components/admin/ProductsAdmin";
import ContentAdmin from "@/components/admin/ContentAdmin";
import CategoriesAdmin from "@/components/admin/CategoriesAdmin";
import OrdersAdmin from "@/components/admin/OrdersAdmin";
import InvoicesAdmin from "@/components/admin/InvoicesAdmin";
import StockAdmin from "@/components/admin/StockAdmin";
import { QuotesAdmin } from "@/components/admin/QuotesAdmin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { API_CONFIG } from "@/lib/api";
import { AlertCircle, Database } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { initializeDatabase } from "@/utils/initDatabase";

// Constante pour le mot de passe (dans un cas réel, ceci devrait être géré côté serveur)
const ADMIN_PASSWORD = "kbs2024admin";

const AdminPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [backendConfigured, setBackendConfigured] = useState(false);
  const [databaseConnected, setDatabaseConnected] = useState(false);
  const navigate = useNavigate();

  // Vérifier si l'utilisateur est déjà authentifié
  useEffect(() => {
    const authStatus = sessionStorage.getItem("kbs_admin_auth");
    if (authStatus === "true") {
      setIsAuthenticated(true);
    }
    
    // Vérifier la configuration du backend
    checkBackendConfiguration();
  }, []);

  // Vérification de la configuration du backend
  const checkBackendConfiguration = async () => {
    try {
      // Tester si le backend est accessible
      const response = await fetch(`${API_CONFIG.BASE_URL}/health`);
      if (response.ok) {
        setBackendConfigured(true);
        setDatabaseConnected(true);
        console.log('Backend et base de données connectés avec succès');
      } else {
        setBackendConfigured(false);
        setDatabaseConnected(false);
        console.error('Backend non accessible');
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du backend:', error);
      setBackendConfigured(false);
      setDatabaseConnected(false);
      toast.error("Backend non accessible. Veuillez vérifier que le serveur Express est démarré.");
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulation d'un délai de chargement pour donner l'impression d'une vérification
    setTimeout(() => {
      if (password === ADMIN_PASSWORD) {
        sessionStorage.setItem("kbs_admin_auth", "true");
        setIsAuthenticated(true);
        toast.success("Connexion réussie");
      } else {
        toast.error("Mot de passe incorrect");
      }
      setIsLoading(false);
    }, 800);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("kbs_admin_auth");
    setIsAuthenticated(false);
    setPassword("");
    toast.info("Vous avez été déconnecté");
  };

  const handleInitDatabase = async () => {
    setIsLoading(true);
    const success = await initializeDatabase();
    if (success) {
      toast.success("Base de données initialisée avec succès");
      checkBackendConfiguration();
    } else {
      toast.error("Erreur lors de l'initialisation de la base de données");
    }
    setIsLoading(false);
  };

  return (
    <div>
      <PageBanner
        title="Administration"
        subtitle={isAuthenticated ? "Gérez le contenu de votre site" : "Veuillez vous connecter pour accéder au panneau d'administration"}
      >
        {isAuthenticated && (
          <div className="mt-4">
            <Button 
              variant="outline" 
              className="bg-white text-kbs-brown hover:bg-kbs-gold/20" 
              onClick={handleLogout}
            >
              Se déconnecter
            </Button>
            <Button 
              variant="outline" 
              className="bg-white text-kbs-brown hover:bg-kbs-gold/20 ml-2" 
              onClick={() => navigate("/")}
            >
              Retour au site
            </Button>
          </div>
        )}
      </PageBanner>

      <div className="container-custom py-8">
        {!isAuthenticated ? (
          <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Mot de passe
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Entrez le mot de passe admin"
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-kbs-green hover:bg-kbs-green/90"
                disabled={isLoading}
              >
                {isLoading ? "Connexion en cours..." : "Se connecter"}
              </Button>
            </form>
          </div>
        ) : (
          <>
            {!backendConfigured && (
              <Alert variant="destructive" className="mb-8">
                <AlertCircle className="h-6 w-6" />
                <AlertTitle>Backend non accessible</AlertTitle>
                <AlertDescription>
                  <p>
                    Le serveur backend Express n'est pas accessible. Veuillez vérifier que :
                  </p>
                  <ol className="list-decimal list-inside mt-2 ml-4 space-y-1">
                    <li>Le serveur Express est démarré : <code>cd backend && npm start</code></li>
                    <li>PostgreSQL est en cours d'exécution</li>
                    <li>Les variables d'environnement sont correctement configurées dans le fichier .env</li>
                    <li>Le port 3001 n'est pas utilisé par une autre application</li>
                  </ol>
                  <p className="mt-2">
                    Une fois le backend démarré, rechargez cette page.
                  </p>
                  <Button 
                    onClick={checkBackendConfiguration} 
                    variant="outline" 
                    className="mt-3"
                  >
                    Vérifier la connexion
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {backendConfigured && !databaseConnected && (
              <Alert variant="destructive" className="mb-8">
                <AlertCircle className="h-6 w-6" />
                <AlertTitle>Connexion à la base de données</AlertTitle>
                <AlertDescription>
                  <p>
                    Le backend est accessible mais la connexion à PostgreSQL a échoué. Vérifiez :
                  </p>
                  <ul className="list-disc list-inside mt-2 ml-4 space-y-1">
                    <li>Que PostgreSQL est démarré</li>
                    <li>Que les identifiants de connexion sont corrects dans le fichier .env</li>
                    <li>Que la base de données "KBService" existe</li>
                    <li>Que les tables nécessaires ont été créées</li>
                  </ul>
                  <div className="mt-3 space-x-2">
                    <Button 
                      onClick={handleInitDatabase} 
                      variant="outline" 
                      disabled={isLoading}
                      className="inline-flex items-center gap-2"
                    >
                      <Database className="h-4 w-4" />
                      {isLoading ? 'Initialisation...' : 'Initialiser la base de données'}
                    </Button>
                    <Button 
                      onClick={checkBackendConfiguration} 
                      variant="outline"
                    >
                      Vérifier la connexion
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <Tabs defaultValue="products">
              <TabsList className="mb-8">
                <TabsTrigger value="products">Produits</TabsTrigger>
                <TabsTrigger value="categories">Catégories</TabsTrigger>
                <TabsTrigger value="stock">Stock</TabsTrigger>
                <TabsTrigger value="orders">Commandes</TabsTrigger>
                <TabsTrigger value="quotes">Devis</TabsTrigger>
                <TabsTrigger value="invoices">Factures</TabsTrigger>
                <TabsTrigger value="content">Contenu du site</TabsTrigger>
              </TabsList>
              <TabsContent value="products">
                <ProductsAdmin />
              </TabsContent>
              <TabsContent value="categories">
                <CategoriesAdmin />
              </TabsContent>
              <TabsContent value="stock">
                <StockAdmin />
              </TabsContent>
              <TabsContent value="orders">
                <OrdersAdmin />
              </TabsContent>
              <TabsContent value="quotes">
                <QuotesAdmin />
              </TabsContent>
              <TabsContent value="invoices">
                <InvoicesAdmin />
              </TabsContent>

              <TabsContent value="content">
                <ContentAdmin />
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
