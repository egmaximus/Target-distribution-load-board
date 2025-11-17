import React, { useState, useEffect } from 'react';

import Header from './components/Header';
import LoadBoard from './components/LoadBoard';
import LoadBuilderModal from './components/LoadBuilderModal';
import LoginModal from './components/LoginModal';
import SubscriptionForm from './components/SubscriptionForm';
import { fetchData, saveData } from './services/dataService';
import type { Load, AppData } from './types';

const App: React.FC = () => {
  const [appData, setAppData] = useState<AppData>({ loads: [], carrierEmails: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLoad, setEditingLoad] = useState<Load | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      return savedTheme;
    }
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    const loadAppData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await fetchData();
            setAppData(data);
        } catch (e) {
            setError("Failed to load data. Displaying sample data.");
            // The service layer provides default data on failure
            const data = await fetchData();
            setAppData(data);
        } finally {
            setIsLoading(false);
        }
    };
    loadAppData();
  }, []);


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
    const recipient = 'omorales@targetdistribution.com';
    const carrierEmails = appData.carrierEmails;
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

    const publicationsList = newLoad.itemDescriptions.map(item => 
      `- ${item}`
    ).join('\n');

    const body = `A new load has been posted and is available for bidding.

Load Details:
--------------------------------------------------
Items:
${publicationsList}
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

  const handlePostLoad = async (newLoadData: Omit<Load, 'id' | 'bids'>) => {
    const newLoad: Load = {
      ...newLoadData,
      id: `load-${Date.now()}`,
      bids: [],
    };
    
    const originalData = appData;
    const newData: AppData = { ...appData, loads: [newLoad, ...appData.loads] };
    
    setAppData(newData);
    setIsModalOpen(false);

    try {
        await saveData(newData);
        sendNewLoadNotification(newLoad);
    } catch(e) {
        console.error("Failed to post load:", e);
        alert("Failed to save the new load. The change has been reverted.");
        setAppData(originalData); // Rollback
    }
  };

  const handleUpdateLoad = async (updatedLoad: Load) => {
    const originalData = appData;
    const newLoads = appData.loads.map(load => (load.id === updatedLoad.id ? updatedLoad : load));
    const newData: AppData = { ...appData, loads: newLoads };

    setAppData(newData);
    setEditingLoad(null);
    setIsModalOpen(false);
    
    try {
        await saveData(newData);
    } catch(e) {
        console.error("Failed to update load:", e);
        alert("Failed to save changes to the load. The change has been reverted.");
        setAppData(originalData); // Rollback
    }
  };

  const handleRemoveLoad = async (loadId: string) => {
    const originalData = appData;
    const newLoads = appData.loads.filter(load => load.id !== loadId);
    const newData: AppData = { ...appData, loads: newLoads };

    setAppData(newData);

    try {
        await saveData(newData);
    } catch(e) {
        console.error("Failed to remove load:", e);
        alert("Failed to remove the load. The change has been reverted.");
        setAppData(originalData); // Rollback
    }
  };

  const handleAddCarrierEmail = async (email: string): Promise<{ success: boolean; message: string; }> => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return { success: false, message: 'Please enter a valid email address.' };
    }

    const originalData = appData;
    const normalizedEmail = email.toLowerCase();

    if (appData.carrierEmails.map(e => e.toLowerCase()).includes(normalizedEmail)) {
        return { success: false, message: 'This email is already subscribed.' };
    }

    const newEmails = [...appData.carrierEmails, email];
    const newData: AppData = { ...appData, carrierEmails: newEmails };
    setAppData(newData);

    try {
        await saveData(newData);
        return { success: true, message: 'You have been successfully subscribed!' };
    } catch(e) {
        console.error("Failed to add carrier email:", e);
        setAppData(originalData); // Rollback
        return { success: false, message: 'An error occurred while subscribing. Please try again.' };
    }
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
        <SubscriptionForm onSubscribe={handleAddCarrierEmail} />
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">Open Freight Loads</h1>
        <LoadBoard
          loads={appData.loads}
          isLoading={isLoading}
          error={error}
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
