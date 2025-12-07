
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Download, Search, Filter } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { getAllOrders, updateOrderStatus, exportOrdersToExcel } from "@/services/orderService";
import { toast } from "sonner";
import OrderDetail from "./OrderDetail";
import AdminCard from "./AdminCard";
import ActionButton from "./ActionButton";

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  delivery_mode: string;
  total_amount: number;
  status: string;
  notes?: string;
  created_at: string;
  items: OrderItem[];
}

const OrdersAdmin = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter]);

  const loadOrders = async () => {
    try {
      const data = await getAllOrders();
      setOrders(data);
    } catch (error) {
      console.error("Erreur lors du chargement des commandes:", error);
      toast.error("Erreur lors du chargement des commandes");
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      await loadOrders();
      toast.success("Statut de la commande mis à jour");
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      toast.error("Erreur lors de la mise à jour du statut");
    }
  };

  const handleExportExcel = async () => {
    try {
      await exportOrdersToExcel(filteredOrders);
      toast.success("Export Excel généré avec succès");
    } catch (error) {
      console.error("Erreur lors de l'export:", error);
      toast.error("Erreur lors de l'export Excel");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'confirmed': return 'Confirmée';
      case 'delivered': return 'Livrée';
      case 'cancelled': return 'Annulée';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="loading-pulse mb-4">
            <div className="h-8 w-8 bg-kbs-green rounded-full mx-auto"></div>
          </div>
          <p>Chargement des commandes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminCard title="Gestion des Commandes">
        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            {orders.length} commande{orders.length !== 1 ? 's' : ''} au total
          </p>
          
          {/* Filtres et recherche */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Rechercher par numéro, nom ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 rounded-2xl border-gray-200 admin-input"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48 rounded-2xl border-gray-200 admin-select">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="confirmed">Confirmées</SelectItem>
                  <SelectItem value="delivered">Livrées</SelectItem>
                  <SelectItem value="cancelled">Annulées</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={handleExportExcel}
                className="bg-gradient-to-r from-kbs-green to-kbs-light hover:from-kbs-green/90 hover:to-kbs-light/90 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                disabled={filteredOrders.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Exporter Excel
              </Button>
            </div>
          </div>
        </div>

        {/* Tableau des commandes */}
        <div className="admin-table">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-kbs-green to-kbs-light text-white">
                <tr>
                  <th className="text-left p-4 font-semibold">N° Commande</th>
                  <th className="text-left p-4 font-semibold">Client</th>
                  <th className="text-left p-4 font-semibold">Date</th>
                  <th className="text-left p-4 font-semibold">Montant</th>
                  <th className="text-left p-4 font-semibold">Statut</th>
                  <th className="text-center p-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order, index) => (
                  <tr key={order.id} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                    <td className="p-4 font-medium text-gray-700">
                      #{order.order_number}
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-gray-700">{order.customer_name}</p>
                        <p className="text-sm text-gray-600">{order.customer_email}</p>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600">
                      {format(new Date(order.created_at), 'dd/MM/yyyy HH:mm', { locale: fr })}
                    </td>
                    <td className="p-4 font-semibold text-kbs-green">
                      {order.total_amount.toLocaleString()} FCFA
                    </td>
                    <td className="p-4">
                      <Badge className={`rounded-full px-3 py-1 ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </Badge>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-2">
                        <ActionButton
                          onClick={() => setSelectedOrder(order)}
                          variant="view"
                        >
                          <Eye className="h-4 w-4" />
                        </ActionButton>
                        <Select
                          value={order.status}
                          onValueChange={(value) => handleStatusUpdate(order.id, value)}
                        >
                          <SelectTrigger className="w-32 h-8 rounded-xl border-gray-200 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">En attente</SelectItem>
                            <SelectItem value="confirmed">Confirmée</SelectItem>
                            <SelectItem value="delivered">Livrée</SelectItem>
                            <SelectItem value="cancelled">Annulée</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredOrders.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">Aucune commande trouvée</p>
              </div>
            )}
          </div>
        </div>
      </AdminCard>

      {/* Modal de détail de commande */}
      {selectedOrder && (
        <OrderDetail
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
};

export default OrdersAdmin;
