
import * as React from 'react';
import { collection, doc, onSnapshot, addDoc, updateDoc, deleteDoc, getDocs, writeBatch, query, orderBy } from 'firebase/firestore';
import { onAuthStateChanged, signOut, signInWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from './firebase-config.ts';
import Header from './components/Header.tsx';
import LoadBoard from './components/LoadBoard.tsx';
import LoadBuilderModal from './components/LoadBuilderModal.tsx';
import LoginModal from './components/LoginModal.tsx';
import SubscriptionForm from './components/SubscriptionForm.tsx';
import { MOCK_LOADS } from './constants.ts';
import type { Load } from './types.ts';
import { getCarrierEmails } from './components/carrier-emails.ts';

const App: React.FC = () => {
  const [loads, setLoads] = React.useState<Load[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingLoad, setEditingLoad] = React.useState<Load | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = React.useState(false);
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [theme, setTheme] = React.useState<'light' | 'dark'>(() => {
    try {
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
      if (savedTheme) return savedTheme;
    } catch (error) {
      console.error("Failed to read theme from localStorage.", error);
    }
    return window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ? 'dark' : 'light';
  });

  // Fetch loads from Firestore in real-time
  React.useEffect(() => {
    const loadsCollection = collection(db, 'loads');
    const q = query(loadsCollection, orderBy('pickupDate', 'desc'));

    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      // Seed database if it's empty on first load
      if (querySnapshot.empty && MOCK_LOADS.length > 0) {
        console.log("Empty 'loads' collection, seeding with mock data...");
        const batch = writeBatch(db);
        MOCK_LOADS.forEach((load) => {
          const { id, ...loadData } = load; // Firestore generates its own ID
          const docRef = doc(collection(db, 'loads'));
          batch.set(docRef, loadData);
        });
        await batch.commit();
      } else {
        const loadsData = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Load));
        setLoads(loadsData);
      }
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching loads:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Listen for authentication state changes
  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true);
        setIsAdmin(user.email === 'admin@targetdistribution.com');
      } else {
        setIsLoggedIn(false);
        setIsAdmin(false);
      }
    });
    return () => unsubscribe();
  }, []);

  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    try {
      localStorage.setItem('theme', theme);
    } catch (error) {
      console.error("Failed to save theme to localStorage.", error);
    }
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const sendNewLoadNotification = async (newLoad: Load) => {
    const recipient = 'omorales@targetdistribution.com';
    const carrierEmails = await getCarrierEmails();
    if (carrierEmails.length === 0) return; // Don't open mailto if no carriers subscribed

    const bccRecipients = carrierEmails.join(',');
    const subject = `New Freight Available: ${newLoad.origin} to ${newLoad.destinations[0]}${newLoad.destinations.length > 1 ? ` (+${newLoad.destinations.length - 1} drops)` : ''}`;
    const formatDate = (dateString: string) => dateString ? new Date(`${dateString}T00:00:00`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A';
    const destinationsList = newLoad.destinations.map((dest, index) => `Destination ${index + 1}: ${dest}`).join('\n');

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
To place your bid, please visit the loadboard.

Thank you,
Target Distribution`;

    const mailtoLink = `mailto:${recipient}?bcc=${bccRecipients}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
  };

  const handlePostLoad = async (newLoadData: Omit<Load, 'id' | 'bids'>) => {
    const loadToAdd = { ...newLoadData, bids: [] };
    try {
      const docRef = await addDoc(collection(db, 'loads'), loadToAdd);
      setIsModalOpen(false);
      const notificationLoad: Load = { ...loadToAdd, id: docRef.id };
      await sendNewLoadNotification(notificationLoad);
    } catch (error) {
      console.error("Error posting load: ", error);
      alert("Failed to post load.");
    }
  };

  const handleUpdateLoad = async (updatedLoad: Load) => {
    try {
      const { id, ...loadData } = updatedLoad;
      const loadRef = doc(db, 'loads', id);
      await updateDoc(loadRef, loadData);
      setIsModalOpen(false);
      setEditingLoad(null);
    } catch (error) {
      console.error("Error updating load: ", error);
      alert("Failed to update load.");
    }
  };

  const handleRemoveLoad = async (loadId: string) => {
    try {
      await deleteDoc(doc(db, 'loads', loadId));
    } catch (error) {
      console.error("Error removing load: ", error);
      alert("Failed to remove load.");
    }
  };

  const handleOpenEditModal = (load: Load) => {
    setEditingLoad(load);
    setIsModalOpen(true);
  };
  
  const handleLogin = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setIsLoginModalOpen(false);
    } catch (error) {
      alert('Invalid credentials. Please try again.');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handlePromptLogin = () => {
    setIsLoginModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-xl font-semibold text-gray-700 dark:text-gray-300">Loading Loadboard...</div>
      </div>
    );
  }

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