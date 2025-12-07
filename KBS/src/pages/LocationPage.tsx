
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageBanner from "@/components/PageBanner";
import MapComponent from "@/components/MapComponent";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

const LocationPage = () => {
  const navigate = useNavigate();
  const [showOnlyMain, setShowOnlyMain] = useState(false);

  return (
    <div>
      <PageBanner 
        title="Nos localisations"
        subtitle="Visitez-nous dans nos deux points de présence à Dakar"
        imageSrc="/placeholder.svg"
      />

      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Carte */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-kbs-green" />
                    Nos localisations KB&S
                  </CardTitle>
                  <div className="flex gap-2 mt-2">
                    <Button 
                      size="sm"
                      variant={!showOnlyMain ? "default" : "outline"}
                      onClick={() => setShowOnlyMain(false)}
                      className={!showOnlyMain ? "bg-kbs-green hover:bg-kbs-green/90" : "border-kbs-green text-kbs-green hover:bg-kbs-green hover:text-white"}
                    >
                      Toutes les adresses
                    </Button>
                    <Button 
                      size="sm"
                      variant={showOnlyMain ? "default" : "outline"}
                      onClick={() => setShowOnlyMain(true)}
                      className={showOnlyMain ? "bg-kbs-green hover:bg-kbs-green/90" : "border-kbs-green text-kbs-green hover:bg-kbs-green hover:text-white"}
                    >
                      Adresse principale
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <MapComponent 
                    height="500px"
                    showBothLocations={!showOnlyMain}
                    showOnlyMain={showOnlyMain}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Informations détaillées */}
            <div className="space-y-6">
              {/* Siège social */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-kbs-green" />
                    Siège social
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-medium text-gray-900">Villa 103 Cité ANCAR 2, Kounoune</p>
                    <p className="text-sm text-gray-600">Administration et bureaux</p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-kbs-green" />
                    <div>
                      <p className="font-medium">+221 77 029 98 21</p>
                      <p className="text-sm text-gray-600">Téléphone et WhatsApp</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-kbs-green" />
                    <div>
                      <p className="font-medium">kewekane@yahoo.fr</p>
                      <p className="text-sm text-gray-600">Email professionnel</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Dépôt */}
              {!showOnlyMain && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-kbs-green" />
                      Dépôt
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="font-medium text-gray-900">Maristes, Dakar</p>
                      <p className="text-sm text-gray-600">Retrait des commandes et stock</p>
                    </div>
                    
                    <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                      <p className="text-sm text-amber-800">
                        <strong>Note :</strong> Veuillez nous contacter avant de vous déplacer au dépôt pour vous assurer de la disponibilité des produits.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Horaires */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-kbs-green" />
                    Horaires d'ouverture
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Lundi - Vendredi</span>
                      <span>8h00 - 18h00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Samedi</span>
                      <span>9h00 - 16h00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Dimanche</span>
                      <span className="text-gray-500">Fermé</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-green-800">
                      <strong>Conseil :</strong> Appelez-nous avant votre visite pour vous assurer de notre disponibilité et préparer votre commande.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="space-y-3">
                <Button 
                  onClick={() => navigate("/products")}
                  className="w-full bg-kbs-green hover:bg-kbs-green/90"
                >
                  Découvrir nos produits
                </Button>
                <Button 
                  onClick={() => navigate("/contact")}
                  variant="outline"
                  className="w-full border-kbs-green text-kbs-green hover:bg-kbs-green hover:text-white"
                >
                  Nous contacter
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LocationPage;
