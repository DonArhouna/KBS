import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { UserPlus, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';

const RegisterPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from || '/';

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast({
                title: "Les mots de passe ne correspondent pas",
                description: "Veuillez vérifier votre saisie.",
                variant: "destructive"
            });
            return;
        }

        setIsLoading(true);
        try {
            const response = await authService.register({ email, password, full_name: fullName });
            login(response.token, response.user);
            toast({ title: "Compte créé !", description: `Bienvenue chez KBS, ${response.user.full_name}.` });
            navigate(from, { replace: true });
        } catch (error: any) {
            toast({
                title: "Erreur lors de l'inscription",
                description: error.message || "Impossible de créer le compte",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50/50 p-4 py-12">
            <Card className="w-full max-w-md border-0 shadow-2xl rounded-3xl overflow-hidden bg-white/80 backdrop-blur-xl ring-1 ring-gray-100">
                <CardHeader className="space-y-3 pb-8 pt-10 px-8">
                    <div className="mx-auto w-16 h-16 bg-kbs-green/10 rounded-2xl flex items-center justify-center mb-2">
                        <UserPlus className="w-8 h-8 text-kbs-green" />
                    </div>
                    <CardTitle className="text-3xl font-bold text-center text-gray-900 tracking-tight">Créer un compte</CardTitle>
                    <CardDescription className="text-center text-gray-500 text-base">
                        Rejoignez KBS pour une expérience personnalisée
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                    <form onSubmit={handleRegister} className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-gray-700 ml-1">Nom complet</Label>
                            <div className="relative group">
                                <User className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 group-focus-within:text-kbs-green transition-colors" />
                                <Input
                                    placeholder="John Doe"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                    className="pl-12 h-12 bg-gray-50/50 border-gray-100 focus:bg-white focus:ring-2 focus:ring-kbs-green/20 rounded-2xl transition-all"
                                />
                            </div>
                        </div>

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

                        <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-gray-700 ml-1">Mot de passe</Label>
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
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-gray-700 ml-1">Confirmer le mot de passe</Label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 group-focus-within:text-kbs-green transition-colors" />
                                    <Input
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        className="pl-12 pr-12 h-12 bg-gray-50/50 border-gray-100 focus:bg-white focus:ring-2 focus:ring-kbs-green/20 rounded-2xl transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-4 top-3.5 text-gray-400 hover:text-kbs-green transition-colors"
                                    >
                                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 mt-4 bg-kbs-green hover:bg-kbs-green/90 text-white font-bold rounded-2xl shadow-lg shadow-kbs-green/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
                            disabled={isLoading}
                        >
                            {isLoading ? "Création du compte..." : "S'inscrire"}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="bg-gray-50/50 border-t border-gray-100 p-6 flex justify-center">
                    <p className="text-sm text-gray-500 font-medium">
                        Déjà un compte ?{" "}
                        <Link to="/login" state={{ from }} className="text-kbs-green hover:underline font-bold">
                            Se connecter
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

export default RegisterPage;
