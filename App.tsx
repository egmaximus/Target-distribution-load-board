
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
      if (storedLoads) {
        return JSON.parse(storedLoads);
      }
    } catch (error) {
      console.error("Failed to parse loads from localStorage, falling back to mock data.", error);
    }
    // If local storage is empty or fails, initialize with mock data.
    return MOCK_LOADS;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLoad, setEditingLoad] = useState<Load | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    // Theme preference is user-specific and can remain in local storage.
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      return savedTheme;
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
      // We don't need to show a UI error, as the user's session state is correct.
    }
  }, [loads]);


  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
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

    const mailtoLink = `mailto:${recipient}?bcc=${bccRecipients}&subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body.trim())}`;
    
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
    setEditingLoad(null);
    setIsModalOpen(false);
  };
  
  const handleOpenEditModal = (load: Load) => {
    setEditingLoad(load);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingLoad(null);
  };

  const handleLogin = (email: string, password: string) => {
    if (email.toLowerCase() === 'omorales@targetdistribution.com' && password === 'Target8420') {
        setIsAdmin(true);
    } else {
        setIsAdmin(false);
    }
    setIsLoggedIn(true);
    setIsLoginModalOpen(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsAdmin(false);
  };

  const handleOpenLoginModal = () => {
    setIsLoginModalOpen(true);
  };

  const handleRemoveLoad = (loadId: string) => {
    setLoads(prevLoads => prevLoads.filter(load => load.id !== loadId));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans transition-colors duration-300">
      <Header
        onOpenPostLoadModal={() => {
            setEditingLoad(null);
            setIsModalOpen(true);
        }}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        isLoggedIn={isLoggedIn}
        onOpenLoginModal={handleOpenLoginModal}
        onLogout={handleLogout}
      />
      <main className="container mx-auto p-4 md:p-8">
        <SubscriptionForm />
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">Open Freight Loads</h1>
        <LoadBoard
          loads={loads}
          isLoggedIn={isLoggedIn}
          onPromptLogin={handleOpenLoginModal}
          onRemoveLoad={handleRemoveLoad}
          onEditLoad={handleOpenEditModal}
        />
      </main>
      <LoadBuilderModal
        isOpen={isModalOpen}
        onClose={closeModal}
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