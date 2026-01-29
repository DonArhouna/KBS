import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/authService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingBag, ChevronRight, Package, Clock, MapPin, Phone } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import PageBanner from '@/components/PageBanner';

const OrdersHistoryPage = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const data = await authService.getOrderHistory();
                setOrders(data);
            } catch (error) {
                console.error("Error fetching orders:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (user) {
            fetchOrders();
        }
    }, [user]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending': return <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 border-yellow-200">En attente</Badge>;
            case 'processing': return <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">En cours</Badge>;
            case 'completed': return <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">Terminée</Badge>;
            case 'cancelled': return <Badge variant="destructive">Annulée</Badge>;
            default: return <Badge variant="secondary">{status}</Badge>;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50">
            <PageBanner
                title="Historique des Commandes"
                subtitle="Retrouvez tous vos achats passés chez KBS"
            />

            <div className="container mx-auto px-4 py-12 max-w-5xl">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                        <div className="w-12 h-12 border-4 border-kbs-green border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-gray-500 font-medium">Chargement de vos commandes...</p>
                    </div>
                ) : orders.length === 0 ? (
                    <Card className="border-0 shadow-xl rounded-3xl p-12 text-center bg-white/80 backdrop-blur-xl">
                        <div className="mx-auto w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                            <ShoppingBag className="w-10 h-10 text-gray-400" />
                        </div>
                        <CardTitle className="text-2xl font-bold mb-2">Aucune commande pour le moment</CardTitle>
                        <CardDescription className="text-gray-500 mb-8 max-w-md mx-auto">
                            Vous n'avez pas encore passé de commande. Explorez nos produits et profitez de nos meilleures offres.
                        </CardDescription>
                        <Button className="bg-kbs-green hover:bg-kbs-green/90 text-white px-8 rounded-2xl h-12 font-bold shadow-lg shadow-kbs-green/20 transition-all">
                            Découvrir nos produits
                        </Button>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <Card key={order.id} className="border-0 shadow-lg rounded-3xl overflow-hidden bg-white/80 backdrop-blur-xl hover:shadow-xl transition-all group">
                                <CardHeader className="bg-gray-50/50 border-b border-gray-100 p-6">
                                    <div className="flex flex-wrap items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-kbs-green/10 rounded-2xl flex items-center justify-center">
                                                <Package className="w-6 h-6 text-kbs-green" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">Commande #{order.order_number}</p>
                                                <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                                    <Clock className="w-3 h-3" />
                                                    <span>{format(new Date(order.created_at), 'dd MMMM yyyy à HH:mm', { locale: fr })}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            {getStatusBadge(order.status)}
                                            <div className="text-right">
                                                <p className="text-sm font-medium text-gray-500">Total</p>
                                                <p className="text-lg font-bold text-kbs-green">{order.total_amount} FCFA</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <h4 className="text-sm font-bold text-gray-900 border-l-4 border-kbs-green pl-3">Articles</h4>
                                            <div className="space-y-3">
                                                {order.items?.map((item: any, idx: number) => (
                                                    <div key={idx} className="flex justify-between items-center text-sm p-2 rounded-xl bg-gray-50/50">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold text-kbs-green">x{item.quantity}</span>
                                                            <span className="text-gray-700 font-medium">{item.product_name}</span>
                                                        </div>
                                                        <span className="font-bold text-gray-900">{item.subtotal} FCFA</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <h4 className="text-sm font-bold text-gray-900 border-l-4 border-kbs-green pl-3">Livraison</h4>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex items-start gap-3 text-gray-600">
                                                    <MapPin className="w-4 h-4 mt-0.5 text-gray-400" />
                                                    <span>{order.customer_address}</span>
                                                </div>
                                                <div className="flex items-center gap-3 text-gray-600">
                                                    <Phone className="w-4 h-4 text-gray-400" />
                                                    <span>{order.customer_phone}</span>
                                                </div>
                                                <div className="mt-4 pt-4 border-t border-gray-100">
                                                    <Badge variant="outline" className="text-gray-500 font-medium">
                                                        Mode: {order.delivery_mode === 'delivery' ? 'À domicile' : 'Retrait en boutique'}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrdersHistoryPage;
