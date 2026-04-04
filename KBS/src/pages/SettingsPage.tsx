import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { User, Lock, Mail, Save, ShieldCheck, Bell, ChevronRight, Eye, EyeOff } from 'lucide-react';
import PageBanner from '@/components/PageBanner';

const SettingsPage = () => {
    const { user, login } = useAuth();
    const [fullName, setFullName] = useState(user?.full_name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await authService.updateProfile({ full_name: fullName, email });
            const token = localStorage.getItem('token');
            if (token) login(token, response.user);
            toast.success("Profil mis à jour avec succès !");
        } catch (error: any) {
            toast.error(error.message || "Erreur lors de la mise à jour");
        } finally {
            setIsLoading(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error("Les nouveaux mots de passe ne correspondent pas");
            return;
        }

        setIsLoading(true);
        try {
            await authService.changePassword({ currentPassword, newPassword });
            toast.success("Mot de passe modifié avec succès !");
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            toast.error(error.message || "Erreur lors du changement de mot de passe");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50">
            <PageBanner
                title="Paramètres du compte"
                subtitle="Gérez vos informations personnelles et votre sécurité"
            />

            <div className="container-custom py-12">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Sidebar / Profile Summary */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card className="border-kbs-green/10 shadow-sm overflow-hidden border-0 bg-white">
                            <div className="h-24 bg-gradient-to-r from-kbs-green to-kbs-green/80" />
                            <CardContent className="pt-0 relative px-6">
                                <div className="absolute -top-12 left-6">
                                    <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-lg ring-4 ring-white">
                                        <div className="w-full h-full rounded-xl bg-kbs-green flex items-center justify-center text-white text-3xl font-bold uppercase">
                                            {user?.full_name?.charAt(0)}
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-16 pb-4">
                                    <h2 className="text-xl font-bold text-gray-900">{user?.full_name}</h2>
                                    <p className="text-sm text-gray-500">{user?.email}</p>
                                    <div className="mt-4">
                                        <span className="inline-flex items-center rounded-full bg-kbs-green/10 px-2.5 py-0.5 text-xs font-semibold text-kbs-green uppercase">
                                            Client
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="space-y-1">
                            <Button variant="ghost" className="w-full justify-start gap-3 rounded-xl bg-kbs-green/5 text-kbs-green border-0 font-semibold p-4 h-auto">
                                <User className="h-4 w-4" />
                                <span>Informations personnelles</span>
                            </Button>
                            <Button variant="ghost" className="w-full justify-start gap-3 rounded-xl hover:bg-gray-100 transition-colors border-0 p-4 h-auto">
                                <Bell className="h-4 w-4 text-gray-400" />
                                <span>Notifications</span>
                            </Button>
                            <Button variant="ghost" className="w-full justify-start gap-3 rounded-xl hover:bg-gray-100 transition-colors border-0 p-4 h-auto">
                                <ShieldCheck className="h-4 w-4 text-gray-400" />
                                <span>Sécurité</span>
                            </Button>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Personal Info */}
                        <Card className="border-0 shadow-sm rounded-2xl overflow-hidden ring-1 ring-gray-100 bg-white">
                            <CardHeader className="border-b bg-white border-gray-50 p-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                                        <User className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">Profil</CardTitle>
                                        <CardDescription>Mettez à jour vos informations de base</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                <form onSubmit={handleUpdateProfile} className="space-y-5">
                                    <div className="grid md:grid-cols-2 gap-5">
                                        <div className="space-y-2">
                                            <Label htmlFor="fullName" className="text-sm font-semibold text-gray-700">Nom complet</Label>
                                            <div className="relative group">
                                                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400 group-focus-within:text-kbs-green transition-colors" />
                                                <Input
                                                    id="fullName"
                                                    value={fullName}
                                                    onChange={(e) => setFullName(e.target.value)}
                                                    className="pl-10 h-11 bg-gray-50/50 border-gray-200 focus:bg-white focus:ring-kbs-green/20 rounded-xl"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Adresse Email</Label>
                                            <div className="relative group">
                                                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400 group-focus-within:text-kbs-green transition-colors" />
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    className="pl-10 h-11 bg-gray-50/50 border-gray-200 focus:bg-white focus:ring-kbs-green/20 rounded-xl"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex justify-end pt-2">
                                        <Button
                                            type="submit"
                                            disabled={isLoading}
                                            className="bg-kbs-green hover:bg-kbs-green/90 text-white rounded-xl px-6 h-11 shadow-md shadow-kbs-green/20 transition-all font-semibold"
                                        >
                                            {isLoading ? "Enregistrement..." : (
                                                <span className="flex items-center gap-2">
                                                    <Save className="h-4 w-4" /> Enregistrer les modifications
                                                </span>
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Security */}
                        <Card className="border-0 shadow-sm rounded-2xl overflow-hidden ring-1 ring-gray-100 bg-white">
                            <CardHeader className="border-b bg-white border-gray-50 p-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-orange-50 text-orange-600">
                                        <Lock className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">Sécurité</CardTitle>
                                        <CardDescription>Modifiez votre mot de passe pour sécuriser votre compte</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                <form onSubmit={handleChangePassword} className="space-y-5">
                                    <div className="space-y-2">
                                        <Label htmlFor="currentPass" className="text-sm font-semibold text-gray-700">Mot de passe actuel</Label>
                                        <div className="relative group">
                                            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400 group-focus-within:text-kbs-green transition-colors" />
                                            <Input
                                                id="currentPass"
                                                type={showCurrentPassword ? "text" : "password"}
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                placeholder="••••••••"
                                                className="pl-10 pr-10 h-11 bg-gray-50/50 border-gray-200 focus:bg-white focus:ring-kbs-green/20 rounded-xl"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                className="absolute right-3 top-3 text-gray-400 hover:text-kbs-green transition-colors"
                                            >
                                                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-5">
                                        <div className="space-y-2">
                                            <Label htmlFor="newPass" className="text-sm font-semibold text-gray-700">Nouveau mot de passe</Label>
                                            <div className="relative group">
                                                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400 group-focus-within:text-kbs-green transition-colors" />
                                                <Input
                                                    id="newPass"
                                                    type={showNewPassword ? "text" : "password"}
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    placeholder="••••••••"
                                                    className="pl-10 pr-10 h-11 bg-gray-50/50 border-gray-200 focus:bg-white focus:ring-kbs-green/20 rounded-xl"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                                    className="absolute right-3 top-3 text-gray-400 hover:text-kbs-green transition-colors"
                                                >
                                                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="confirmPass" className="text-sm font-semibold text-gray-700">Confirmer le nouveau</Label>
                                            <div className="relative group">
                                                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400 group-focus-within:text-kbs-green transition-colors" />
                                                <Input
                                                    id="confirmPass"
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    placeholder="••••••••"
                                                    className="pl-10 pr-10 h-11 bg-gray-50/50 border-gray-200 focus:bg-white focus:ring-kbs-green/20 rounded-xl"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute right-3 top-3 text-gray-400 hover:text-kbs-green transition-colors"
                                                >
                                                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex justify-end pt-2">
                                        <Button
                                            type="submit"
                                            disabled={isLoading}
                                            variant="outline"
                                            className="rounded-xl px-6 h-11 border-gray-200 hover:border-kbs-green/40 hover:bg-kbs-green/5 hover:text-kbs-green transition-all"
                                        >
                                            {isLoading ? "Modification..." : "Mettre à jour le mot de passe"}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
