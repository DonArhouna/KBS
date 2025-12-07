
import { useState, FormEvent, useEffect } from "react";
import { toast } from "sonner";
import { useToast } from "@/components/ui/use-toast";
import PageBanner from "@/components/PageBanner";
import EmailClientDialog from "@/components/EmailClientDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Phone, Mail, MapPin, Instagram } from "lucide-react";

type ContactInfo = {
  bannerImage: string;
  phone: string;
  email: string;
  mainAddress: string;
  depotAddress: string;
  instagram: string;
  whatsapp: string;
};

// Valeurs par défaut avec les nouvelles adresses
const defaultContactInfo: ContactInfo = {
  bannerImage: "https://images.unsplash.com/photo-1596524430615-b46475ddff6e?q=80&w=1600&auto=format",
  phone: "+221 77 029 98 21",
  email: "kewekane@yahoo.fr",
  mainAddress: "Villa 103 Cité ANCAR 2, Kounoune",
  depotAddress: "Maristes, Dakar",
  instagram: "kbs_senegal",
  whatsapp: "+221 77 029 98 21"
};

const ContactPage = () => {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contactInfo, setContactInfo] = useState(defaultContactInfo);

  useEffect(() => {
    setContactInfo(defaultContactInfo);
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simuler l'envoi du formulaire
    setTimeout(() => {
      toast({
        title: "Message envoyé",
        description: "Nous vous répondrons dans les plus brefs délais."
      });

      // Réinitialiser le formulaire
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div>
      <PageBanner 
        title="Contact" 
        subtitle="Nous sommes à votre écoute pour toute question ou demande" 
        imageSrc={contactInfo.bannerImage} 
      />

      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="grid lg:grid-cols-5 gap-12">
            {/* Informations de contact */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-semibold mb-6 text-kbs-brown">Nos Coordonnées</h2>
              
              <div className="space-y-8">
                <Card className="rounded-3xl shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-kbs-green/10 rounded-2xl flex items-center justify-center text-kbs-green">
                        <MapPin size={24} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-1">Adresse Principale</h3>
                        <p className="text-gray-700">{contactInfo.mainAddress}</p>
                        <p className="text-gray-500 text-sm mt-1">Siège social</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-3xl shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-kbs-green/10 rounded-2xl flex items-center justify-center text-kbs-green">
                        <MapPin size={24} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-1">Dépôt</h3>
                        <p className="text-gray-700">{contactInfo.depotAddress}</p>
                        <p className="text-gray-500 text-sm mt-1">Retrait des commandes</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="rounded-3xl shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-kbs-green/10 rounded-2xl flex items-center justify-center text-kbs-green">
                        <Phone size={24} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-1">Téléphone & WhatsApp</h3>
                        <a href={`tel:${contactInfo.phone}`} className="text-gray-700 hover:text-kbs-green">{contactInfo.phone}</a>
                        <p className="text-gray-500 text-sm mt-1">Disponible tous les jours, de 9h à 19h</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="rounded-3xl shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-kbs-green/10 rounded-2xl flex items-center justify-center text-kbs-green">
                        <Mail size={24} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-1">Email</h3>
                        <EmailClientDialog>
                          <Button variant="link" className="p-0 h-auto text-gray-700 hover:text-kbs-green">
                            {contactInfo.email}
                          </Button>
                        </EmailClientDialog>
                        <p className="text-gray-500 text-sm mt-1">Pour vos questions et demandes</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="rounded-3xl shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-kbs-green/10 rounded-2xl flex items-center justify-center text-kbs-green">
                        <Instagram size={24} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-1">Réseaux Sociaux</h3>
                        <a href="https://www.instagram.com/" target="_blank" rel="noreferrer" className="text-gray-700 hover:text-kbs-green">
                          @{contactInfo.instagram}
                        </a>
                        <p className="text-gray-500 text-sm mt-1">Suivez-nous pour découvrir nos produits et actualités</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card className="mt-12 rounded-3xl shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-4">Heures d'ouverture</h3>
                  <div className="space-y-2 text-gray-700">
                    <div className="flex justify-between">
                      <span>Lundi - Vendredi:</span>
                      <span>9h - 19h</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Samedi - Dimanche:</span>
                      <span>10h - 19h</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Formulaire de contact */}
            <div className="lg:col-span-3">
              <Card className="rounded-3xl shadow-xl border-0 bg-gradient-to-br from-kbs-beige to-white">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-semibold mb-6 text-kbs-brown">Envoyez-nous un Message</h2>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-gray-700">Nom complet</Label>
                        <Input 
                          id="name" 
                          value={name} 
                          onChange={(e) => setName(e.target.value)} 
                          required 
                          className="bg-white rounded-2xl border-gray-200 focus:border-kbs-green focus:ring-2 focus:ring-kbs-green/20 transition-all duration-300" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-gray-700">Email</Label>
                        <Input 
                          id="email" 
                          type="email" 
                          value={email} 
                          onChange={(e) => setEmail(e.target.value)} 
                          required 
                          className="bg-white rounded-2xl border-gray-200 focus:border-kbs-green focus:ring-2 focus:ring-kbs-green/20 transition-all duration-300" 
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-gray-700">Téléphone</Label>
                      <Input 
                        id="phone" 
                        value={phone} 
                        onChange={(e) => setPhone(e.target.value)} 
                        className="bg-white rounded-2xl border-gray-200 focus:border-kbs-green focus:ring-2 focus:ring-kbs-green/20 transition-all duration-300" 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-gray-700">Votre message</Label>
                      <Textarea 
                        id="message" 
                        value={message} 
                        onChange={(e) => setMessage(e.target.value)} 
                        required 
                        rows={6} 
                        className="bg-white rounded-2xl border-gray-200 focus:border-kbs-green focus:ring-2 focus:ring-kbs-green/20 transition-all duration-300 resize-none" 
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-kbs-green to-kbs-light hover:from-kbs-green/90 hover:to-kbs-light/90 rounded-2xl py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Envoi en cours..." : "Envoyer le message"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
      
      {/* Section Carte/Map */}
      <section className="py-16 bg-kbs-beige">
        <div className="container-custom">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-kbs-brown">Où nous trouver</h2>
            <p className="text-gray-700 mt-2">Notre siège principal à Kounoune et notre dépôt aux Maristes à Dakar</p>
          </div>
          
          <div className="h-[400px] rounded-3xl overflow-hidden shadow-xl">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15435.779972946394!2d-17.458417399999998!3d14.7280956!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xec172fd33cdb1a3%3A0xd67b8bb084e6c354!2sMaristes%2C%20Dakar%2C%20S%C3%A9n%C3%A9gal!5e0!3m2!1sfr!2sfr!4v1621345678901!5m2!1sfr!2sfr" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen={false} 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade" 
              title="KB&S location" 
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
