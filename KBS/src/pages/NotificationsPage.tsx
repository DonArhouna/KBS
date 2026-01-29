import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/authService';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, BellOff, CheckCircle2, ShoppingBag, Info, Trash2, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import PageBanner from '@/components/PageBanner';
import { toast } from 'sonner';

const NotificationsPage = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            const data = await authService.getNotifications();
            setNotifications(data);
        } catch (error) {
            console.error("Error fetching notifications:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchNotifications();
        }
    }, [user]);

    const handleMarkAsRead = async (id: number) => {
        try {
            await authService.markNotificationRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        } catch (error) {
            console.error("Error marking as read:", error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await authService.markAllNotificationsRead();
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            toast.success("Toutes les notifications ont été marquées comme lues");
        } catch (error) {
            console.error("Error marking all as read:", error);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'order': return <ShoppingBag className="w-5 h-5 text-kbs-green" />;
            case 'info': return <Info className="w-5 h-5 text-blue-500" />;
            default: return <Bell className="w-5 h-5 text-gray-500" />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50">
            <PageBanner
                title="Vos Notifications"
                subtitle="Restez informé de l'état de vos commandes et des actualités de KBS"
            />

            <div className="container mx-auto px-4 py-12 max-w-4xl">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Bell className="w-6 h-6 text-kbs-green" />
                        Récentes ({notifications.filter(n => !n.is_read).length} non lues)
                    </h3>
                    {notifications.some(n => !n.is_read) && (
                        <Button
                            variant="ghost"
                            className="text-kbs-green hover:bg-kbs-green/10 rounded-xl font-bold"
                            onClick={handleMarkAllAsRead}
                        >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Tout marquer comme lu
                        </Button>
                    )}
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                        <div className="w-12 h-12 border-4 border-kbs-green border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-gray-500 font-medium">Récupération des notifications...</p>
                    </div>
                ) : notifications.length === 0 ? (
                    <Card className="border-0 shadow-xl rounded-3xl p-16 text-center bg-white/80 backdrop-blur-xl">
                        <div className="mx-auto w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                            <BellOff className="w-12 h-12 text-gray-300" />
                        </div>
                        <CardTitle className="text-2xl font-bold mb-2">Pas de notifications</CardTitle>
                        <p className="text-gray-500 max-w-sm mx-auto">
                            Vous êtes à jour ! Dès que nous avons des nouvelles de vos commandes, elles apparaîtront ici.
                        </p>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {notifications.map((notif) => (
                            <Card
                                key={notif.id}
                                className={`border-0 shadow-sm rounded-2xl transition-all hover:shadow-md ${!notif.is_read ? 'bg-white ring-1 ring-kbs-green/20 ring-offset-2' : 'bg-white/70 backdrop-blur-sm opacity-80'}`}
                                onClick={() => !notif.is_read && handleMarkAsRead(notif.id)}
                            >
                                <CardContent className="p-5 flex gap-4 items-start">
                                    <div className={`p-3 rounded-2xl flex-shrink-0 ${!notif.is_read ? 'bg-kbs-green/10' : 'bg-gray-100'}`}>
                                        {getIcon(notif.type)}
                                    </div>
                                    <div className="flex-grow min-w-0">
                                        <div className="flex justify-between items-start mb-1 gap-2">
                                            <h4 className={`text-base font-bold truncate ${!notif.is_read ? 'text-gray-900' : 'text-gray-600'}`}>
                                                {notif.title}
                                            </h4>
                                            {!notif.is_read && <div className="w-2.5 h-2.5 bg-kbs-green rounded-full shadow-lg shadow-kbs-green/40 flex-shrink-0 mt-1.5 animate-pulse"></div>}
                                        </div>
                                        <p className="text-sm text-gray-500 leading-relaxed mb-3">
                                            {notif.message}
                                        </p>
                                        <div className="flex items-center gap-4 text-xs font-medium text-gray-400">
                                            <span className="flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {format(new Date(notif.created_at), 'dd MMM yyyy à HH:mm', { locale: fr })}
                                            </span>
                                            {notif.type === 'order' && (
                                                <Badge variant="secondary" className="bg-kbs-green/10 text-kbs-green border-0 rounded-lg text-[10px] py-0 px-2 font-bold uppercase tracking-wider">
                                                    Commande
                                                </Badge>
                                            )}
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

export default NotificationsPage;
