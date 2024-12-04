import { Link } from "react-router-dom";
import { Outlet } from "react-router-dom";
import { 
  Home, 
  Heart, 
  HandHeart, 
  Video, 
  HelpCircle,
  BarChart,
  BookOpen,
  LogIn,
  Users,
  Star,
  MessageSquare,
  Award,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/Auth/AuthProvider";

const FrontendLayout = () => {
  const { user, signOut } = useAuth();

  const publicLinks = [
    { to: "/", icon: Home, label: "Accueil" },
    { to: "/available-children", icon: Users, label: "Enfants à parrainer" },
    { to: "/sponsored-children", icon: Star, label: "Enfants parrainés" },
    { to: "/stories", icon: BookOpen, label: "Histoires" },
    { to: "/donations/public", icon: HandHeart, label: "Dons" },
    { to: "/videos", icon: Video, label: "Vidéos" },
    { to: "/faq", icon: HelpCircle, label: "FAQ" },
    { to: "/statistics", icon: BarChart, label: "Statistiques" }
  ];

  const sponsorLinks = [
    { to: "/sponsor-dashboard", icon: Home, label: "Mon tableau de bord" },
    { to: "/messages", icon: MessageSquare, label: "Messages" },
    { to: "/rewards", icon: Award, label: "Récompenses" },
    { to: "/my-children", icon: Heart, label: "Mes enfants parrainés" }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <nav className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center">
              <h2 className="text-2xl font-bold">Passion Varadero</h2>
            </Link>
            
            <div className="hidden md:flex items-center space-x-6">
              {publicLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
                >
                  <link.icon className="h-5 w-5" />
                  <span>{link.label}</span>
                </Link>
              ))}

              {!user ? (
                <Link to="/login">
                  <Button variant="default" className="flex items-center gap-2">
                    <LogIn className="h-4 w-4" />
                    Connexion
                  </Button>
                </Link>
              ) : (
                <div className="flex items-center gap-4">
                  {sponsorLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
                    >
                      <link.icon className="h-5 w-5" />
                      <span>{link.label}</span>
                    </Link>
                  ))}
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2"
                    onClick={() => signOut()}
                  >
                    <LogOut className="h-4 w-4" />
                    Déconnexion
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </Button>
            </div>
          </div>
        </nav>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export { FrontendLayout };