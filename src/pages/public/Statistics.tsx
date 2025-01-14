import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, Legend
} from "recharts";

interface SponsorshipStats {
  conversion_rate: number;
  avg_duration_days: number;
  active_sponsorships: number;
}

interface EngagementStats {
  activity_rate: number;
  active_sponsors: number;
  total_assistants: number;
}

const Statistics = () => {
  const { data: sponsorshipStats } = useQuery<SponsorshipStats>({
    queryKey: ['sponsorship-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_sponsorship_conversion_stats');
      if (error) throw error;
      return data as SponsorshipStats;
    }
  });

  const { data: engagementStats } = useQuery<EngagementStats>({
    queryKey: ['engagement-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_user_engagement_stats');
      if (error) throw error;
      return data as EngagementStats;
    }
  });

  const { data: monthlyDonations } = useQuery({
    queryKey: ['monthly-donations'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_monthly_donation_trends', { months_back: 6 });
      if (error) throw error;
      return data;
    }
  });

  const { data: childrenStats } = useQuery({
    queryKey: ['children-stats'],
    queryFn: async () => {
      const { data: children, error } = await supabase
        .from('children')
        .select('status, is_sponsored, birth_date');
      
      if (error) throw error;

      const totalChildren = children.length;
      const availableChildren = children.filter(c => !c.is_sponsored).length;
      const sponsoredChildren = children.filter(c => c.is_sponsored).length;

      const averageAge = children.reduce((acc, curr) => {
        if (!curr.birth_date) return acc;
        const birthDate = new Date(curr.birth_date);
        const ageInYears = (new Date().getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
        return acc + ageInYears;
      }, 0) / children.filter(c => c.birth_date).length;

      return {
        totalChildren,
        availableChildren,
        sponsoredChildren,
        averageAge: Math.round(averageAge * 10) / 10
      };
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-cuba-warmBeige to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-cuba-orange to-cuba-red text-white p-8 rounded-xl shadow-lg text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Statistiques et Impact</h1>
          <p className="text-white/90">
            Découvrez l'impact de notre communauté sur la vie des enfants cubains
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/90 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle>Parrainages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Taux de conversion</p>
                  <p className="text-2xl font-bold text-cuba-orange">{sponsorshipStats?.conversion_rate}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Durée moyenne</p>
                  <p className="text-2xl font-bold text-cuba-orange">{sponsorshipStats?.avg_duration_days} jours</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Parrainages actifs</p>
                  <p className="text-2xl font-bold text-cuba-orange">{sponsorshipStats?.active_sponsorships}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle>Engagement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Taux d'activité</span>
                    <span className="font-medium">{engagementStats?.activity_rate}%</span>
                  </div>
                  <Progress value={engagementStats?.activity_rate} className="h-2" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Parrains actifs</p>
                  <p className="text-2xl font-bold text-cuba-orange">{engagementStats?.active_sponsors}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Assistants</p>
                  <p className="text-2xl font-bold text-cuba-orange">{engagementStats?.total_assistants}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle>Enfants</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total des enfants</p>
                  <p className="text-2xl font-bold text-cuba-orange">{childrenStats?.totalChildren}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Enfants disponibles</p>
                  <p className="text-2xl font-bold text-green-600">{childrenStats?.availableChildren}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Enfants parrainés</p>
                  <p className="text-2xl font-bold text-cuba-orange">{childrenStats?.sponsoredChildren}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 mb-8">
          <Card className="bg-white/90 shadow-lg">
            <CardHeader>
              <CardTitle>Évolution mensuelle des dons</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyDonations}>
                    <defs>
                      <linearGradient id="colorDonations" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0072BB" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#0072BB" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-50" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="donations" 
                      stroke="#0072BB" 
                      fillOpacity={1} 
                      fill="url(#colorDonations)" 
                      name="Dons"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
