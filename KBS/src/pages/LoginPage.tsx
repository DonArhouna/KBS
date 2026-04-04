import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { LogIn, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from || '/';

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await authService.login({ email, password });
            login(response.token, response.user);
            toast({ title: "Connexion réussie", description: `Bienvenue, ${response.user.full_name} !` });
            navigate(from, { replace: true });
        } catch (error: any) {
            toast({
                title: "Erreur de connexion",
                description: error.message || "Identifiants invalides",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse: any) => {
        setIsLoading(true);
        try {
            const response = await authService.googleLogin(credentialResponse.credential);
            login(response.token, response.user);
            toast({ title: "Connexion réussie", description: `Bienvenue, ${response.user.full_name} !` });
            navigate(from, { replace: true });
        } catch (error: any) {
            toast({
                title: "Erreur Google",
                description: error.message || "Échec de la connexion Google",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50/50 p-4">
            <Card className="w-full max-w-md border-0 shadow-2xl rounded-3xl overflow-hidden bg-white/80 backdrop-blur-xl ring-1 ring-gray-100">
                <CardHeader className="space-y-3 pb-8 pt-10 px-8">
                    <div className="mx-auto w-16 h-16 bg-kbs-green/10 rounded-2xl flex items-center justify-center mb-2">
                        <LogIn className="w-8 h-8 text-kbs-green" />
                    </div>
                    <CardTitle className="text-3xl font-bold text-center text-gray-900 tracking-tight">Bon retour !</CardTitle>
                    <CardDescription className="text-center text-gray-500 text-base">
                        Connectez-vous pour gérer vos commandes
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-gray-700 ml-1">Adresse Email</Label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 group-focus-within:text-kbs-green transition-colors" />
                                <Input
                                    type="email"
                                    placeholder="nom@exemple.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="pl-12 h-12 bg-gray-50/50 border-gray-100 focus:bg-white focus:ring-2 focus:ring-kbs-green/20 rounded-2xl transition-all"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <Label className="text-sm font-semibold text-gray-700">Mot de passe</Label>
                                <Link to="/forgot-password" className="text-xs text-kbs-green hover:underline font-medium">Oublié ?</Link>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 group-focus-within:text-kbs-green transition-colors" />
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="pl-12 pr-12 h-12 bg-gray-50/50 border-gray-100 focus:bg-white focus:ring-2 focus:ring-kbs-green/20 rounded-2xl transition-all"
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
                        <Button
                            type="submit"
                            className="w-full h-12 bg-kbs-green hover:bg-kbs-green/90 text-white font-bold rounded-2xl shadow-lg shadow-kbs-green/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
                            disabled={isLoading}
                        >
                            {isLoading ? "Connexion..." : "Se connecter"}
                        </Button>
                    </form>

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-gray-100"></span>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-4 text-gray-400 font-medium font-bold">Ou continuer avec</span>
                        </div>
                    </div>

                    <div className="w-full h-12 flex justify-center">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => {
                                toast({ title: "Erreur", description: "Connexion Google échouée", variant: "destructive" });
                            }}
                            theme="outline"
                            size="large"
                            text="continue_with"
                            shape="pill"
                            width="250"
                        />
                    </div>
                </CardContent>
                <CardFooter className="bg-gray-50/50 border-t border-gray-100 p-6 flex justify-center">
                    <p className="text-sm text-gray-500 font-medium">
                        Pas encore de compte ?{" "}
                        <Link to="/register" state={{ from }} className="text-kbs-green hover:underline font-bold">
                            Créer un compte
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
};

const Label = ({ children, className }: any) => (
    <label className={`block text-sm font-medium leading-none ${className}`}>
        {children}
    </label>
);

export default LoginPage;
