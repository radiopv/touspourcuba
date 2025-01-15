import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Users,
  Settings,
  Gift,
  Home,
  FileText,
  Bell,
  Mail,
  User,
  LogIn,
  LogOut,
  HelpCircle,
  BarChart,
  Menu,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { useAuth } from "@/components/Auth/AuthProvider";
import { UserProfileMenu } from "@/components/Layout/UserProfileMenu";
import { toast } from "@/components/ui/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

const publicLinks = [
  {
    href: "/",
    label: "Index",
    icon: Home,
  },
  {
    href: "/children",
    label: "Les Enfants",
    icon: Users,
  },
  {
    href: "/public-donations",
    label: "Donations",
    icon: Gift,
  },
  {
    href: "/statistics",
    label: "Statistiques",
    icon: BarChart,
  },
  {
    href: "/faq",
    label: "FAQ",
    icon: HelpCircle,
  },
];

const adminLinks = [
  {
    href: "/admin/children-management",
    label: "Gestion Enfants",
    icon: Users,
  },
  {
    href: "/admin/donations-management",
    label: "Gestion Donations",
    icon: Gift,
  },
  {
    href: "/admin/home-content",
    label: "Page d'accueil",
    icon: Home,
  },
  {
    href: "/admin/emails",
    label: "Emails",
    icon: Mail,
  },
  {
    href: "/admin/faq",
    label: "FAQ Admin",
    icon: FileText,
  },
  {
    href: "/notifications",
    label: "Notifications",
    icon: Bell,
  },
];

export const Navigation = () => {
  const navigate = useNavigate();
  const { user, signOut, isAssistant } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage();

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Déconnexion réussie",
        description: "À bientôt !",
      });
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Erreur lors de la déconnexion",
        description: "Veuillez réessayer",
        variant: "destructive",
      });
    }
  };

  const MenuItems = () => (
    <div className="flex flex-col space-y-2">
      {/* Public Links Section */}
      <div className="space-y-2">
        {publicLinks.map((link) => (
          <Button
            key={link.href}
            variant="ghost"
            onClick={() => {
              navigate(link.href);
              setIsOpen(false);
            }}
            className="justify-start w-full text-primary"
          >
            <link.icon className="h-4 w-4 mr-2" />
            {link.label}
          </Button>
        ))}
      </div>

      {/* Admin Links Section - Only show if user is assistant */}
      {isAssistant && (
        <>
          <div className="border-t my-4" />
          <p className="text-sm font-semibold text-gray-500 px-2">Menu Administrateur</p>
          <div className="space-y-2">
            {adminLinks.map((link) => (
              <Button
                key={link.href}
                variant="ghost"
                onClick={() => {
                  navigate(link.href);
                  setIsOpen(false);
                }}
                className="justify-start w-full text-primary"
              >
                <link.icon className="h-4 w-4 mr-2" />
                {link.label}
              </Button>
            ))}
          </div>
        </>
      )}

      {/* User Actions Section */}
      <div className="border-t my-4" />
      {user ? (
        <div className="space-y-2">
          <Button
            variant="ghost"
            onClick={() => {
              navigate("/sponsor-dashboard");
              setIsOpen(false);
            }}
            className="justify-start w-full text-primary"
          >
            <User className="h-4 w-4 mr-2" />
            Espace parrain
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              handleLogout();
              setIsOpen(false);
            }}
            className="justify-start w-full text-primary"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Déconnexion
          </Button>
        </div>
      ) : (
        <Button
          variant="ghost"
          onClick={() => {
            navigate("/login");
            setIsOpen(false);
          }}
          className="justify-start w-full text-primary"
        >
          <LogIn className="h-4 w-4 mr-2" />
          Connexion
        </Button>
      )}
    </div>
  );

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50 w-full">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[80%] sm:w-[385px] bg-white">
                <MenuItems />
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex flex-1 space-x-4">
            {publicLinks.map((link) => (
              <Button
                key={link.href}
                variant="ghost"
                onClick={() => navigate(link.href)}
                className="text-primary"
              >
                <link.icon className="h-4 w-4 mr-2" />
                {link.label}
              </Button>
            ))}
          </div>

          {/* Right side menu items - Desktop */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <Button
                  variant="ghost"
                  onClick={() => navigate("/sponsor-dashboard")}
                  className="text-primary"
                >
                  <User className="h-4 w-4 mr-2" />
                  Espace parrain
                </Button>
                <UserProfileMenu />
              </>
            ) : (
              <Button
                variant="ghost"
                onClick={() => navigate("/login")}
                className="text-primary"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Connexion
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};