import { useState } from 'react'
import SplashScreen from './SplashScreen'
import Home from './pages/Home'
import Listings from './pages/Listings'
import ListingDetails from './pages/ListingDetails'
import About from './pages/About'
import Profile from './pages/Profile'
import BackgroundSVG from './components/common/BackgroundSVG'

function App() {
  const [showSplash, setShowSplash] = useState(() => {
    // Check if this is the first time the app is opened in this tab
    const hasSeenSplash = sessionStorage.getItem('hasSeenSplash');
    return !hasSeenSplash;
  });

  const path = window.location.pathname;

  if (showSplash && path === '/') {
    return <SplashScreen onComplete={() => {
      sessionStorage.setItem('hasSeenSplash', 'true');
      setShowSplash(false);
    }} />
  }

  // Determine the active page content
  const renderContent = () => {
    if (path.startsWith('/listings/')) {
      const id = path.split('/')[2];
      if (id) return <ListingDetails id={id} />;
    }
    if (path === '/listings' || path === '/listings/') return <Listings />
    if (path.startsWith('/about')) return <About />
    if (path.startsWith('/profile')) return <Profile />
    return <Home />
  }

  return (
    <>
      <BackgroundSVG />
      {renderContent()}
    </>
  )
}

export default App
