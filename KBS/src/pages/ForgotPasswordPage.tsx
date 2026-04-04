import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '@/services/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Mail, ArrowLeft, Send } from 'lucide-react';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await authService.forgotPassword(email);
            setIsSubmitted(true);
            toast({
                title: "Demande envoyée",
                description: "Si cet email existe, un lien de réinitialisation a été envoyé."
            });
        } catch (error: any) {
            toast({
                title: "Erreur",
                description: "Impossible d'envoyer la demande. Réessayez plus tard.",
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
                        <Mail className="w-8 h-8 text-kbs-green" />
                    </div>
                    <CardTitle className="text-3xl font-bold text-center text-gray-900 tracking-tight">Mot de passe oublié</CardTitle>
                    <CardDescription className="text-center text-gray-500 text-base">
                        {isSubmitted
                            ? "Vérifiez votre boîte mail pour continuer."
                            : "Entrez votre email pour recevoir un lien de réinitialisation."}
                    </CardDescription>
                </CardHeader>

                <CardContent className="px-8 pb-8">
                    {!isSubmitted ? (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 ml-1">Adresse Email</label>
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
                            <Button
                                type="submit"
                                className="w-full h-12 bg-kbs-green hover:bg-kbs-green/90 text-white font-bold rounded-2xl shadow-lg shadow-kbs-green/20 transition-all"
                                disabled={isLoading}
                            >
                                {isLoading ? "Envoi..." : "Envoyer le lien"}
                                <Send className="ml-2 h-4 w-4" />
                            </Button>
                        </form>
                    ) : (
                        <div className="text-center py-4">
                            <p className="text-gray-600">
                                Un lien de réinitialisation a été généré. Pour les besoins du test, vous pouvez le trouver dans les logs du serveur backend.
                            </p>
                        </div>
                    )}
                </CardContent>

                <CardFooter className="bg-gray-50/50 border-t border-gray-100 p-6 flex justify-center">
                    <Link to="/login" className="flex items-center text-sm text-kbs-green hover:underline font-bold transition-all">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Retour à la connexion
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
};

export default ForgotPasswordPage;
