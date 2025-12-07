import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Package, TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import { useStock } from "@/hooks/useStock";
import StockMovementDialog from "./StockMovementDialog";
import StockSettingsDialog from "./StockSettingsDialog";
import { formatPrice } from "@/lib/utils";

const StockAdmin = () => {
  const { movements, alerts, productsStock, isLoading, loadStockData, handleResolveAlert } = useStock();
  const [isMovementDialogOpen, setIsMovementDialogOpen] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const getStockStatusBadge = (status: string) => {
    switch (status) {
      case 'in_stock':
        return <Badge variant="default" className="bg-green-100 text-green-800">En stock</Badge>;
      case 'low_stock':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Stock faible</Badge>;
      case 'out_of_stock':
        return <Badge variant="destructive">Rupture</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  const getMovementTypeIcon = (type: string) => {
    switch (type) {
      case 'in':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'out':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'adjustment':
        return <RefreshCw className="h-4 w-4 text-blue-600" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produits en stock</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {productsStock.filter(p => p.stock_status === 'in_stock').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock faible</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {productsStock.filter(p => p.stock_status === 'low_stock').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ruptures</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {productsStock.filter(p => p.stock_status === 'out_of_stock').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="movements">Mouvements</TabsTrigger>
          <TabsTrigger value="alerts">Alertes ({alerts.length})</TabsTrigger>
          <TabsTrigger value="settings">Paramètres</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">État du stock par produit</h3>
            <Button onClick={() => setIsMovementDialogOpen(true)}>
              Nouveau mouvement
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr className="text-left">
                      <th className="p-4 font-medium">Produit</th>
                      <th className="p-4 font-medium">Catégorie</th>
                      <th className="p-4 font-medium">Stock actuel</th>
                      <th className="p-4 font-medium">Seuil minimum</th>
                      <th className="p-4 font-medium">Statut</th>
                      <th className="p-4 font-medium">Prix unitaire</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productsStock.map((product) => (
                      <tr key={product.id} className="border-b hover:bg-muted/50">
                        <td className="p-4 font-medium">{product.name}</td>
                        <td className="p-4 text-muted-foreground">{product.category_name || '-'}</td>
                        <td className="p-4">
                          <span className={`font-medium ${
                            product.stock_quantity <= 0 ? 'text-red-600' :
                            product.stock_quantity <= product.min_stock_level ? 'text-orange-600' :
                            'text-green-600'
                          }`}>
                            {product.stock_quantity}
                          </span>
                        </td>
                        <td className="p-4">{product.min_stock_level}</td>
                        <td className="p-4">{getStockStatusBadge(product.stock_status)}</td>
                        <td className="p-4">{formatPrice(product.price)} FCFA</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movements" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Historique des mouvements</h3>
            <Button onClick={() => setIsMovementDialogOpen(true)}>
              Nouveau mouvement
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr className="text-left">
                      <th className="p-4 font-medium">Date</th>
                      <th className="p-4 font-medium">Produit</th>
                      <th className="p-4 font-medium">Type</th>
                      <th className="p-4 font-medium">Quantité</th>
                      <th className="p-4 font-medium">Motif</th>
                      <th className="p-4 font-medium">Référence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movements.map((movement) => (
                      <tr key={movement.id} className="border-b hover:bg-muted/50">
                        <td className="p-4">
                          {new Date(movement.created_at).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="p-4 font-medium">{movement.product_name}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {getMovementTypeIcon(movement.movement_type)}
                            <span className="capitalize">
                              {movement.movement_type === 'in' ? 'Entrée' :
                               movement.movement_type === 'out' ? 'Sortie' : 'Ajustement'}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={
                            movement.movement_type === 'in' ? 'text-green-600' :
                            movement.movement_type === 'out' ? 'text-red-600' : 'text-blue-600'
                          }>
                            {movement.movement_type === 'out' ? '-' : '+'}{movement.quantity}
                          </span>
                        </td>
                        <td className="p-4 text-muted-foreground">{movement.reason || '-'}</td>
                        <td className="p-4 text-muted-foreground">{movement.reference_number || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Alertes de stock actives</h3>
            <Button onClick={loadStockData} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
          </div>

          {alerts.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Aucune alerte de stock active</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {alerts.map((alert) => (
                <Card key={alert.id} className={`border-l-4 ${
                  alert.alert_type === 'out_of_stock' ? 'border-l-red-500' : 'border-l-orange-500'
                }`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className={`h-5 w-5 ${
                          alert.alert_type === 'out_of_stock' ? 'text-red-500' : 'text-orange-500'
                        }`} />
                        <div>
                          <CardTitle className="text-base">{alert.product_name}</CardTitle>
                          <CardDescription>
                            {alert.alert_type === 'out_of_stock' ? 'Rupture de stock' : 'Stock faible'}
                          </CardDescription>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleResolveAlert(alert.id)}
                        variant="outline"
                        size="sm"
                      >
                        Marquer comme résolu
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Stock actuel:</span>
                        <span className="ml-2 font-medium">{alert.current_quantity}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Seuil:</span>
                        <span className="ml-2 font-medium">{alert.threshold_quantity}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Depuis:</span>
                        <span className="ml-2">{new Date(alert.created_at).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Paramètres de stock</h3>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Configuration des seuils d'alerte</CardTitle>
              <CardDescription>
                Gérer les seuils minimum pour chaque produit
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr className="text-left">
                      <th className="p-4 font-medium">Produit</th>
                      <th className="p-4 font-medium">Stock actuel</th>
                      <th className="p-4 font-medium">Seuil minimum</th>
                      <th className="p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productsStock.map((product) => (
                      <tr key={product.id} className="border-b hover:bg-muted/50">
                        <td className="p-4 font-medium">{product.name}</td>
                        <td className="p-4">{product.stock_quantity}</td>
                        <td className="p-4">{product.min_stock_level}</td>
                        <td className="p-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedProduct(product);
                              setIsSettingsDialogOpen(true);
                            }}
                          >
                            Modifier
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <StockMovementDialog 
        isOpen={isMovementDialogOpen}
        onClose={() => setIsMovementDialogOpen(false)}
        products={productsStock}
      />

      <StockSettingsDialog
        isOpen={isSettingsDialogOpen}
        onClose={() => {
          setIsSettingsDialogOpen(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
      />
    </div>
  );
};

export default StockAdmin;