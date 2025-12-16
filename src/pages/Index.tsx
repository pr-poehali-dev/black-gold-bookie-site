import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface Match {
  id: number;
  sport: string;
  league: string;
  team1: string;
  team2: string;
  score1?: number;
  score2?: number;
  time: string;
  isLive: boolean;
  odds: {
    win1: number;
    draw?: number;
    win2: number;
  };
}

const Index = () => {
  const [activeTab, setActiveTab] = useState('live');
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatches();
    const interval = setInterval(fetchMatches, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchMatches = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/92946423-b3e5-493c-af06-fee34a1effa3');
      const data = await response.json();
      setMatches(data.matches || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching matches:', error);
      setLoading(false);
    }
  };

  const liveMatches = matches.filter(m => m.isLive);
  const popularMatches = matches.filter(m => !m.isLive);

  const sports = [
    { icon: 'TrendingUp', label: 'Все', value: 'all' },
    { icon: 'Flame', label: 'Лайв', value: 'live' },
    { icon: 'Trophy', label: 'Футбол', value: 'football' },
    { icon: 'Dumbbell', label: 'Баскетбол', value: 'basketball' },
    { icon: 'Trophy', label: 'Теннис', value: 'tennis' },
    { icon: 'Trophy', label: 'Хоккей', value: 'hockey' }
  ];

  const MatchCard = ({ match }: { match: Match }) => (
    <Card className="bg-card border-border hover:border-primary/50 transition-all duration-300 overflow-hidden group">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{match.sport}</span>
            <div>
              <p className="text-xs text-muted-foreground">{match.league}</p>
              {match.isLive && (
                <Badge variant="destructive" className="animate-pulse-gold bg-destructive text-xs px-2 py-0">
                  <Icon name="Radio" className="w-2 h-2 mr-1" />
                  LIVE
                </Badge>
              )}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">{match.time}</p>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{match.team1}</span>
            {match.score1 !== undefined && (
              <span className="text-lg font-bold text-primary">{match.score1}</span>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{match.team2}</span>
            {match.score2 !== undefined && (
              <span className="text-lg font-bold text-primary">{match.score2}</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Button 
            variant="outline" 
            className="flex flex-col items-center py-3 h-auto border-primary/20 hover:bg-primary hover:text-primary-foreground transition-all"
          >
            <span className="text-xs text-muted-foreground mb-1">П1</span>
            <span className="text-sm font-bold">{match.odds.win1}</span>
          </Button>
          {match.odds.draw && (
            <Button 
              variant="outline" 
              className="flex flex-col items-center py-3 h-auto border-primary/20 hover:bg-primary hover:text-primary-foreground transition-all"
            >
              <span className="text-xs text-muted-foreground mb-1">X</span>
              <span className="text-sm font-bold">{match.odds.draw}</span>
            </Button>
          )}
          <Button 
            variant="outline" 
            className="flex flex-col items-center py-3 h-auto border-primary/20 hover:bg-primary hover:text-primary-foreground transition-all"
          >
            <span className="text-xs text-muted-foreground mb-1">П2</span>
            <span className="text-sm font-bold">{match.odds.win2}</span>
          </Button>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <Icon name="Zap" className="w-6 h-6 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                GOLDBET
              </h1>
            </div>

            <nav className="hidden md:flex items-center gap-6">
              <Button variant="ghost" className="hover:text-primary">
                <Icon name="Home" className="w-4 h-4 mr-2" />
                Главная
              </Button>
              <Button variant="ghost" className="hover:text-primary">
                <Icon name="TrendingUp" className="w-4 h-4 mr-2" />
                Спорт
              </Button>
              <Button variant="ghost" className="hover:text-primary">
                <Icon name="BarChart3" className="w-4 h-4 mr-2" />
                Статистика
              </Button>
              <Button variant="ghost" className="hover:text-primary">
                <Icon name="User" className="w-4 h-4 mr-2" />
                Аккаунт
              </Button>
              <Button variant="ghost" className="hover:text-primary">
                <Icon name="MessageCircle" className="w-4 h-4 mr-2" />
                Поддержка
              </Button>
            </nav>

            <div className="flex items-center gap-3">
              <Button variant="outline" className="border-primary/30 hover:bg-primary/10">
                Войти
              </Button>
              <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
                Регистрация
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-12 gap-6">
          <aside className="hidden lg:block col-span-3">
            <Card className="bg-card border-border p-4 sticky top-24">
              <h3 className="text-sm font-semibold mb-4 text-primary">Виды спорта</h3>
              <div className="space-y-2">
                {sports.map((sport, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className="w-full justify-start hover:bg-primary/10 hover:text-primary"
                  >
                    <Icon name={sport.icon} className="w-4 h-4 mr-3" />
                    {sport.label}
                  </Button>
                ))}
              </div>

              <div className="mt-6 p-4 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg border border-primary/20">
                <Icon name="Gift" className="w-8 h-8 text-primary mb-2" />
                <h4 className="font-semibold mb-1">Бонус 100%</h4>
                <p className="text-xs text-muted-foreground mb-3">
                  До 50 000 ₽ на первый депозит
                </p>
                <Button className="w-full bg-primary hover:bg-primary/90">
                  Получить бонус
                </Button>
              </div>
            </Card>
          </aside>

          <main className="col-span-12 lg:col-span-9">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-card">
                <TabsTrigger value="live" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Icon name="Radio" className="w-4 h-4 mr-2" />
                  Лайв События
                </TabsTrigger>
                <TabsTrigger value="popular" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Icon name="Star" className="w-4 h-4 mr-2" />
                  Популярное
                </TabsTrigger>
              </TabsList>

              <TabsContent value="live" className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">Прямые трансляции</h2>
                  <Badge variant="outline" className="border-primary text-primary">
                    {liveMatches.length} матчей
                  </Badge>
                </div>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {liveMatches.length > 0 ? (
                      liveMatches.map((match) => (
                        <MatchCard key={match.id} match={match} />
                      ))
                    ) : (
                      <p className="text-muted-foreground col-span-2 text-center py-8">
                        Нет активных матчей
                      </p>
                    )}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="popular" className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">Предстоящие матчи</h2>
                  <Badge variant="outline" className="border-primary text-primary">
                    {popularMatches.length} матчей
                  </Badge>
                </div>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {popularMatches.length > 0 ? (
                      popularMatches.map((match) => (
                        <MatchCard key={match.id} match={match} />
                      ))
                    ) : (
                      <p className="text-muted-foreground col-span-2 text-center py-8">
                        Нет предстоящих матчей
                      </p>
                    )}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>

      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border py-2 px-4">
        <div className="flex items-center justify-around">
          <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1">
            <Icon name="Home" className="w-5 h-5" />
            <span className="text-xs">Главная</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1">
            <Icon name="TrendingUp" className="w-5 h-5" />
            <span className="text-xs">Спорт</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1">
            <Icon name="BarChart3" className="w-5 h-5" />
            <span className="text-xs">Статистика</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1">
            <Icon name="User" className="w-5 h-5" />
            <span className="text-xs">Аккаунт</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;