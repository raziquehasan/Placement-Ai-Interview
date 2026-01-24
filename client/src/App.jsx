import AppRoutes from './routes/AppRoutes';
import MainLayout from './components/layout/MainLayout';

function App() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <MainLayout>
        <AppRoutes />
      </MainLayout>
    </div>
  );
}

export default App;
