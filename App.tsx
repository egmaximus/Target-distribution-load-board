
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import LoadBoard from './components/LoadBoard';
import LoadBuilderModal from './components/LoadBuilderModal';
import LoginModal from './components/LoginModal';
import SubscriptionForm from './components/SubscriptionForm';
import { MOCK_LOADS, LOADS_STORAGE_KEY } from './constants';
import type { Load } from './types';
import { getCarrierEmails } from './components/carrier-emails';

const App: React.FC = () => {
  const [loads, setLoads] = useState<Load[]>(() => {
    try {
      const storedLoads = localStorage.getItem(LOADS_STORAGE_KEY);

      // Case 1: Data exists in localStorage.
      if (storedLoads) {
        try {
          return JSON.parse(storedLoads);
        } catch (parseError) {
          console.error("Failed to parse loads from localStorage, clearing corrupted data.", parseError);
          // Attempt to remove the corrupted item.
          try {
            localStorage.removeItem(LOADS_STORAGE_KEY);
          } catch (removeError) {
            console.error("Failed to remove corrupted loads from localStorage.", removeError);
          }
          return []; // Start with an empty list if data was corrupt.
        }
      }
      
      // Case 2: No data in localStorage (first visit).
      // Initialize storage with mock data.
      try {
        localStorage.setItem(LOADS_STORAGE_KEY, JSON.stringify(MOCK_LOADS));
      } catch (setItemError) {
        console.error("Failed to save initial loads to localStorage. Will use in-memory mock data.", setItemError);
      }
      return MOCK_LOADS;

    } catch (storageError) {
      // Case 3: localStorage is not available (e.g., private browsing, sandboxed iframe).
      console.error("localStorage is not available. Using in-memory mock data.", storageError);
      return MOCK_LOADS; // Fallback to in-memory mock data without trying to write.
    }
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLoad, setEditingLoad] = useState<Load | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
      if (savedTheme) {
        return savedTheme;
      }
    } catch (error) {
      console.error("Failed to read theme from localStorage.", error);
    }
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  // Save loads to local storage whenever the 'loads' state changes.
  useEffect(() => {
    try {
      localStorage.setItem(LOADS_STORAGE_KEY, JSON.stringify(loads));
    } catch (error) {
      console.error("Failed to save loads to localStorage", error);
    }
  }, [loads]);


  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem('theme', theme);
    } catch (error) {
      console.error("Failed to save theme to localStorage.", error);
    }
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const sendNewLoadNotification = (newLoad: Load) => {
    const recipient = 'omorales@targetdistribution.com'; // Admin's email for record-keeping
    const carrierEmails = getCarrierEmails();
    const bccRecipients = carrierEmails.join(',');
    const subject = `New Freight Available: ${newLoad.origin} to ${newLoad.destinations[0]}${newLoad.destinations.length > 1 ? ` (+${newLoad.destinations.length - 1} drops)` : ''}`;

    const formatDate = (dateString: string) => {
      if (!dateString) return 'N/A';
      return new Date(`${dateString}T00:00:00`).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    };

    const destinationsList = newLoad.destinations.map((dest, index) => 
      `Destination ${index + 1}: ${dest}`
    ).join('\n');

    const body = `A new load has been posted and is available for bidding.

Load Details:
--------------------------------------------------
Item: ${newLoad.itemDescription}
Reference #: ${newLoad.referenceNumber || 'N/A'}

Origin: ${newLoad.origin}
${destinationsList}

Pickup Date: ${formatDate(newLoad.pickupDate)}
Delivery Date: ${formatDate(newLoad.deliveryDate)}

Pallet Count: ${newLoad.palletCount.toLocaleString()}
Weight: ${newLoad.weight.toLocaleString()} lbs
Equipment: ${newLoad.equipmentType}
--------------------------------------------------
Details:
${newLoad.details}
--------------------------------------------------

To place your bid, please follow the link to the loadboard below.

Target-Distribution-Loadboard
https://target-distribution-loadboard-770425821428.us-west1.run.app/

Thank you,
Target Distribution`;

    const mailtoLink = `mailto:${recipient}?bcc=${bccRecipients}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
  };

  const handlePostLoad = (newLoadData: Omit<Load, 'id' | 'bids'>) => {
    const newLoad: Load = {
      ...newLoadData,
      id: `load-${Date.now()}`,
      bids: [],
    };
    setLoads(prevLoads => [newLoad, ...prevLoads]);
    setIsModalOpen(false);
    sendNewLoadNotification(newLoad);
  };

  const handleUpdateLoad = (updatedLoad: Load) => {
    setLoads(prevLoads => prevLoads.map(load => (load.id === updatedLoad.id ? updatedLoad : load)));
    setIsModalOpen(false);
    setEditingLoad(null);
  };

  const handleRemoveLoad = (loadId: string) => {
    setLoads(prevLoads => prevLoads.filter(load => load.id !== loadId));
  };

  const handleOpenEditModal = (load: Load) => {
    setEditingLoad(load);
    setIsModalOpen(true);
  };
  
  const handleLogin = (email: string, password: string) => {
    // This is a mock login. In a real app, you'd verify against a server.
    if (email.toLowerCase() === 'admin@targetdistribution.com' && password === 'password123') {
      setIsLoggedIn(true);
      setIsAdmin(true);
      setIsLoginModalOpen(false);
    } else if (password === 'carrier123') { // Simple login for carriers to view bids
      setIsLoggedIn(true);
      setIsAdmin(false);
      setIsLoginModalOpen(false);
    }
     else {
      alert('Invalid credentials. Hint: use admin@targetdistribution.com / password123 for admin, or any email / carrier123 for carrier.');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsAdmin(false);
  };

  const handlePromptLogin = () => {
    setIsLoginModalOpen(true);
  };

  return (
    <div className={`min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans transition-colors duration-300`}>
      <Header
        onOpenPostLoadModal={() => {
          setEditingLoad(null);
          setIsModalOpen(true);
        }}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        isLoggedIn={isLoggedIn}
        isAdmin={isAdmin}
        onOpenLoginModal={handlePromptLogin}
        onLogout={handleLogout}
      />
      <main className="container mx-auto p-4 md:p-8">
        <SubscriptionForm />
        <LoadBoard 
          loads={loads}
          isLoggedIn={isLoggedIn}
          isAdmin={isAdmin}
          onPromptLogin={handlePromptLogin}
          onRemoveLoad={handleRemoveLoad}
          onEditLoad={handleOpenEditModal}
        />
      </main>
      <LoadBuilderModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingLoad(null);
        }}
        onPostLoad={handlePostLoad}
        onUpdateLoad={handleUpdateLoad}
        loadToEdit={editingLoad}
      />
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={handleLogin}
      />
    </div>
  );
};

export default App;
