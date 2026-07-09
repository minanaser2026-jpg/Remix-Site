import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import Home from './pages/Home';
import NotFound from './pages/not-found';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminContent from './pages/admin/AdminContent';
import AdminImages from './pages/admin/AdminImages';
import AdminSocialLinks from './pages/admin/AdminSocialLinks';
import AdminReels from './pages/admin/AdminReels';
import AdminPassword from './pages/admin/AdminPassword';

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      {/* Public site */}
      <Route path="/" component={Home} />

      {/* Admin panel */}
      <Route path="/admin" component={AdminLogin} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/content" component={AdminContent} />
      <Route path="/admin/images" component={AdminImages} />
      <Route path="/admin/social-links" component={AdminSocialLinks} />
      <Route path="/admin/reels" component={AdminReels} />
      <Route path="/admin/password" component={AdminPassword} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
