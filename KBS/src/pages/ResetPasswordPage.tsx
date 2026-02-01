import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { authService } from '@/services/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';

const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const navigate = useNavigate();

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;

        if (newPassword !== confirmPassword) {
            toast({ title: "Erreur", description: "Les mots de passe ne correspondent pas", variant: "destructive" });
            return;
        }

        setIsLoading(true);
        try {
            await authService.resetPassword({ token, newPassword });
            setIsSuccess(true);
            toast({ title: "Succès", description: "Votre mot de passe a été modifié." });
            setTimeout(() => navigate('/login'), 3000);
        } catch (error: any) {
            toast({
                title: "Erreur",
                description: error.message || "Lien invalide ou expiré",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50/50 p-4">
                <Card className="w-full max-w-md border-0 shadow-2xl rounded-3xl p-8 text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <CardTitle className="text-2xl font-bold mb-2">Lien invalide</CardTitle>
                    <CardDescription>Ce lien de réinitialisation est manquant ou erroné.</CardDescription>
                    <Button asChild className="mt-6 w-full bg-kbs-green rounded-2xl">
                        <Link to="/forgot-password">Redemander un lien</Link>
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50/50 p-4">
            <Card className="w-full max-w-md border-0 shadow-2xl rounded-3xl overflow-hidden bg-white/80 backdrop-blur-xl ring-1 ring-gray-100">
                <CardHeader className="space-y-3 pb-8 pt-10 px-8">
                    <div className="mx-auto w-16 h-16 bg-kbs-green/10 rounded-2xl flex items-center justify-center mb-2">
                        {isSuccess ? <CheckCircle2 className="w-8 h-8 text-kbs-green" /> : <Lock className="w-8 h-8 text-kbs-green" />}
                    </div>
                    <CardTitle className="text-3xl font-bold text-center text-gray-900 tracking-tight">
                        {isSuccess ? "Félicitations !" : "Nouveau mot de passe"}
                    </CardTitle>
                    <CardDescription className="text-center text-gray-500 text-base">
                        {isSuccess
                            ? "Votre mot de passe a été réinitialisé. Vous allez être redirigé."
                            : "Choisissez un mot de passe fort pour sécuriser votre compte."}
                    </CardDescription>
                </CardHeader>

                <CardContent className="px-8 pb-8">
                    {!isSuccess ? (
                        <form onSubmit={handleReset} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 ml-1">Nouveau mot de passe</label>
                                <div className="relative group">
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                        className="pl-4 pr-12 h-12 bg-gray-50/50 border-gray-100 focus:bg-white focus:ring-2 focus:ring-kbs-green/20 rounded-2xl transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-3.5 text-gray-400 hover:text-kbs-green transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 ml-1">Confirmer le mot de passe</label>
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    className="h-12 bg-gray-50/50 border-gray-100 focus:bg-white focus:ring-2 focus:ring-kbs-green/20 rounded-2xl transition-all"
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full h-12 bg-kbs-green hover:bg-kbs-green/90 text-white font-bold rounded-2xl shadow-lg shadow-kbs-green/20 transition-all"
                                disabled={isLoading}
                            >
                                {isLoading ? "Réinitialisation..." : "Changer le mot de passe"}
                            </Button>
                        </form>
                    ) : (
                        <Button asChild className="w-full h-12 bg-kbs-green rounded-2xl">
                            <Link to="/login">Se connecter maintenant</Link>
                        </Button>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default ResetPasswordPage;
