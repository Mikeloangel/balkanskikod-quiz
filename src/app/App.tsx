import { Navigate, Route, Routes } from 'react-router-dom';
import { ProgressProvider } from '@/entities/progress';
import { UIDialogsProvider } from '@/shared/contexts';
import { AboutPage } from '@/pages/about';
import { HomePage } from '@/pages/home';
import { TrackPage } from '@/pages/track';

function App() {
  return (
    <ProgressProvider>
      <UIDialogsProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/track/:id" element={<TrackPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </UIDialogsProvider>
    </ProgressProvider>
  );
}

export default App;
