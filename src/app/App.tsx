import { useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AboutPage } from '../pages/about/ui/AboutPage';
import { HomePage } from '../pages/home/ui/HomePage';
import { TrackPage } from '../pages/track/ui/TrackPage';

function App() {
  const [, setStorageUpdateTick] = useState(0);

  const updateStorage = () => {
    setStorageUpdateTick((value) => value + 1);
  };

  return (
    <Routes>
      <Route path="/" element={<HomePage onStorageUpdated={updateStorage} />} />
      <Route
        path="/track/:id"
        element={<TrackPage onStorageUpdated={updateStorage} />}
      />
      <Route path="/about" element={<AboutPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
