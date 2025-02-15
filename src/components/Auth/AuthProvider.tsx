import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: any | null;
  loading: boolean;
  signOut: () => Promise<void>;
  isAssistant: boolean;
  session: any | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
  isAssistant: false,
  session: null,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAssistant, setIsAssistant] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          
          // Verify user exists in sponsors table
          const { data: sponsor, error } = await supabase
            .from('sponsors')
            .select('*')
            .eq('id', parsedUser.id)
            .maybeSingle();

          if (error) {
            console.error('Error fetching sponsor:', error);
            localStorage.removeItem('user');
            setUser(null);
            navigate("/login");
            return;
          }

          if (!sponsor) {
            console.error('Sponsor not found');
            localStorage.removeItem('user');
            setUser(null);
            navigate("/login");
            return;
          }

          // Verify user has correct role
          if (!sponsor.role || !['admin', 'assistant', 'sponsor'].includes(sponsor.role)) {
            console.error('Invalid user role:', sponsor.role);
            localStorage.removeItem('user');
            setUser(null);
            toast({
              title: "Accès non autorisé",
              description: "Vous n'avez pas les permissions nécessaires",
              variant: "destructive",
            });
            navigate("/login");
            return;
          }

          setUser(sponsor);
          setIsAssistant(['assistant', 'admin'].includes(sponsor.role));
          
          // Redirect based on role and current path
          if (window.location.pathname === '/login') {
            if (sponsor.role === 'admin' || sponsor.role === 'assistant') {
              navigate('/dashboard');
            } else {
              navigate('/sponsor-dashboard');
            }
          }
        } else {
          setUser(null);
          if (window.location.pathname !== '/login' && !window.location.pathname.startsWith('/')) {
            navigate("/login");
          }
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        setUser(null);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const signOut = async () => {
    try {
      localStorage.removeItem('user');
      setUser(null);
      setIsAssistant(false);
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

  return (
    <AuthContext.Provider value={{ user, loading, signOut, isAssistant, session: user }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};