import { Route, Routes } from 'react-router-dom';
import { ProgressProvider } from '@/entities/progress';
import { UIDialogsProvider, RadioProvider, AudioControlProvider, LanguageProvider } from '@/shared/contexts';
import { AboutPage } from '@/pages/about';
import { HomePage } from '@/pages/home';
import { TrackPage } from '@/pages/track';
import '@/shared/i18n'; // Initialize i18n

function App() {
  return (
    <LanguageProvider>
      <AudioControlProvider>
        <RadioProvider>
          <ProgressProvider>
            <UIDialogsProvider>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/track/:id" element={<TrackPage />} />
                <Route path="/about" element={<AboutPage />} />
              </Routes>
            </UIDialogsProvider>
          </ProgressProvider>
        </RadioProvider>
      </AudioControlProvider>
    </LanguageProvider>
  );
}

export default App;
