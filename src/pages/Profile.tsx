import { useState, useEffect } from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, getDocs, query, where, doc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';

type Tab = 'active' | 'expired' | 'add' | 'edit';

interface Listing {
  id: string | number;
  title: string;
  location: string;
  price: number;
  type: string;
  image: string;
  distance?: number;
  gender?: string;
  cooking?: boolean;
  meals?: boolean;
  weekend?: boolean;
  bathroom?: boolean;
  description?: string;
  latitude?: string;
  longitude?: string;
  minStay?: string;
  moveInDate?: string;
  ownerName?: string;
  ownerContact?: string;
  terms?: string;
  images?: string[];
  createdAt?: Date;
}

export default function Profile() {
  const [activeTab, setActiveTab] = useState<Tab>('active');
  const [activeListings, setActiveListings] = useState<Listing[]>([]);
  const [expiredListings, setExpiredListings] = useState<Listing[]>([]);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [addTitle, setAddTitle] = useState('');

  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filterType, setFilterType] = useState('All');
  const [filterGender, setFilterGender] = useState('All');

  const [activePage, setActivePage] = useState(1);
  const [expiredPage, setExpiredPage] = useState(1);
  const ITEMS_PER_PAGE = 15;

  useEffect(() => {
    setActivePage(1);
    setExpiredPage(1);
  }, [searchQuery, filterType, filterGender, sortBy]);

  const EXPIRY_DAYS = 30;
  const AUTO_DELETE_DAYS = 30; // days after expiration before auto-delete

  const fetchListings = async () => {
    if (!auth.currentUser) return;
    try {
      const q = query(collection(db, 'listings'), where('hostId', '==', auth.currentUser.uid));
      const querySnapshot = await getDocs(q);
      const now = new Date();
      const active: Listing[] = [];
      const expired: Listing[] = [];
      const deletePromises: Promise<void>[] = [];

      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const createdAt = data.createdAt instanceof Timestamp
          ? data.createdAt.toDate()
          : data.createdAt ? new Date(data.createdAt) : now;

        const daysSinceCreation = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
        const isExpired = daysSinceCreation >= EXPIRY_DAYS;
        const daysSinceExpiry = isExpired ? daysSinceCreation - EXPIRY_DAYS : 0;

        // Auto-delete listings that have been expired for 30+ days
        if (isExpired && daysSinceExpiry >= AUTO_DELETE_DAYS) {
          deletePromises.push(deleteDoc(doc(db, 'listings', docSnap.id)));
          return; // skip adding to UI
        }

        const listing: Listing = {
          id: docSnap.id,
          title: data.title,
          location: data.location || 'Unknown',
          price: data.price || 0,
          type: data.propertyType || 'Room',
          gender: data.genderPreference || 'Any',
          distance: data.distance || 0,
          cooking: data.cooking || false,
          meals: data.meals || false,
          weekend: data.weekend || false,
          bathroom: data.bathroom || false,
          description: data.description || '',
          latitude: data.latitude || '',
          longitude: data.longitude || '',
          minStay: data.minStay || 'Any',
          moveInDate: data.moveInDate || 'Anytime',
          ownerName: data.ownerName || '',
          ownerContact: data.ownerContact || '',
          terms: data.terms || '',
          image: data.image || "https://images.unsplash.com/photo-1502672260266-1c1de2d9d000?q=80&w=2000&auto=format&fit=crop",
          images: data.images && data.images.length > 0 ? data.images : [data.image || "https://images.unsplash.com/photo-1502672260266-1c1de2d9d000?q=80&w=2000&auto=format&fit=crop"],
          createdAt,
        };

        if (isExpired) {
          expired.push(listing);
        } else {
          active.push(listing);
        }
      });

      // Execute auto-deletions in background
      if (deletePromises.length > 0) {
        await Promise.allSettled(deletePromises);
      }

      setActiveListings(active);
      setExpiredListings(expired);
    } catch (err) {
      console.error("Failed to fetch listings:", err);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        setCurrentUser(user);
        fetchListings();
      } else {
        setCurrentUser(null);
        setActiveListings([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const getInitials = (name: string | null, email: string | null) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    }
    if (email) {
      return email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  const moveImage = (index: number, direction: 'left' | 'right') => {
    if ((direction === 'left' && index === 0) || (direction === 'right' && index === uploadedImages.length - 1)) return;
    const newImages = [...uploadedImages];
    const newFiles = [...uploadedFiles];
    const swapIndex = direction === 'left' ? index - 1 : index + 1;
    [newImages[index], newImages[swapIndex]] = [newImages[swapIndex], newImages[index]];
    [newFiles[index], newFiles[swapIndex]] = [newFiles[swapIndex], newFiles[index]];
    setUploadedImages(newImages);
    setUploadedFiles(newFiles);
  };

  const removeImage = (index: number) => {
    setUploadedImages(uploadedImages.filter((_, i) => i !== index));
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  const watermarkImage = async (file: File): Promise<File> => {
    if (!file.type.startsWith('image/')) return file;

    return new Promise((resolve) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(file);

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const logo = new Image();
        logo.src = '/logo/logo.png';
        logo.onload = () => {
          const logoWidth = Math.max(100, canvas.width * 0.25);
          const logoHeight = (logo.height / logo.width) * logoWidth;

          const padding = canvas.width * 0.03;
          const x = canvas.width - logoWidth - padding;
          const y = canvas.height - logoHeight - padding;

          ctx.globalAlpha = 0.85;
          ctx.drawImage(logo, x, y, logoWidth, logoHeight);
          ctx.globalAlpha = 1.0;

          canvas.toBlob((blob) => {
            URL.revokeObjectURL(objectUrl);
            if (blob) resolve(new File([blob], file.name, { type: file.type }));
            else resolve(file);
          }, file.type, 0.9);
        };
        logo.onerror = () => {
          URL.revokeObjectURL(objectUrl);
          resolve(file);
        };
      };
      img.onerror = () => resolve(file);
      img.src = objectUrl;
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const processedFiles = await Promise.all(files.map(watermarkImage));
      const urls = processedFiles.map(file => URL.createObjectURL(file));
      setUploadedImages(prev => [...prev, ...urls]);
      setUploadedFiles(prev => [...prev, ...processedFiles]);
    }
  };

  const handleDelete = (id: string | number, type: 'active' | 'expired') => {
    if (confirm('Are you sure you want to delete this listing?')) {
      if (type === 'active') {
        setActiveListings(activeListings.filter(l => l.id !== id));
      } else {
        setExpiredListings(expiredListings.filter(l => l.id !== id));
      }
    }
  };

  const handleEdit = (id: string | number) => {
    const listing = activeListings.find(l => l.id === id);
    if (listing) {
      setEditingListing(listing);
      setUploadedImages(listing.images && listing.images.length > 0 ? listing.images : [listing.image]);
      setActiveTab('edit');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingListing || !auth.currentUser) return;

    if (!/^(Mr\.|Ms\.)\s/i.test(editingListing.ownerName || '')) {
      alert("Owner name must start with 'Mr. ' or 'Ms. '");
      return;
    }

    if (uploadedImages.length === 0) {
      alert("Please ensure at least one image is uploaded.");
      return;
    }

    setIsUploading(true);
    try {
      const docRef = doc(db, 'listings', editingListing.id.toString());
      await updateDoc(docRef, {
        title: editingListing.title,
        location: editingListing.location,
        price: editingListing.price,
        propertyType: editingListing.type,
        genderPreference: editingListing.gender,
        distance: editingListing.distance,
        cooking: editingListing.cooking,
        meals: editingListing.meals,
        weekend: editingListing.weekend,
        bathroom: editingListing.bathroom,
        description: editingListing.description,
        longitude: editingListing.longitude,
        minStay: editingListing.minStay,
        moveInDate: editingListing.moveInDate,
        ownerName: editingListing.ownerName,
        ownerContact: editingListing.ownerContact,
        terms: editingListing.terms,
      });

      setActiveListings(activeListings.map(l => l.id === editingListing.id ? editingListing : l));
      alert("Listing updated successfully!");
      setUploadedImages([]);
      setActiveTab('active');
      setEditingListing(null);
    } catch (err: any) {
      alert("Error updating listing: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    if (!auth.currentUser) {
      alert("Please log in to add a listing.");
      return;
    }

    const ownerName = formData.get('ownerName') as string;
    if (!/^(Mr\.|Ms\.)\s/i.test(ownerName)) {
      alert("Owner name must start with 'Mr. ' or 'Ms. '");
      return;
    }

    if (uploadedFiles.length === 0) {
      alert("Please upload at least one image or video.");
      return;
    }

    setIsUploading(true);

    try {
      const uploadedImageUrls: string[] = [];

      for (const file of uploadedFiles) {
        if (!file) continue;

        const uploadData = new FormData();
        uploadData.append('file', file);
        uploadData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'bodima_preset');

        const response = await fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`, {
          method: 'POST',
          body: uploadData,
        });

        const data = await response.json();
        if (data.secure_url) {
          uploadedImageUrls.push(data.secure_url);
        } else {
          throw new Error(data.error?.message || "Cloudinary upload failed");
        }
      }

      await addDoc(collection(db, 'listings'), {
        title: addTitle,
        location: formData.get('location'),
        price: Number(formData.get('price')),
        propertyType: formData.get('type'),
        genderPreference: formData.get('gender'),
        distance: Number(formData.get('distance')),
        latitude: formData.get('lat'),
        longitude: formData.get('lng'),
        description: formData.get('description'),
        minStay: formData.get('minStay') || 'Any',
        moveInDate: formData.get('moveInDate') || 'Anytime',
        cooking: formData.get('cooking') === 'true',
        meals: formData.get('meals') === 'true',
        weekend: formData.get('weekend') === 'true',
        bathroom: formData.get('bathroom') === 'true',
        ownerName: ownerName,
        ownerContact: formData.get('ownerContact'),
        terms: formData.get('terms'),
        hostId: auth.currentUser.uid,
        hostName: auth.currentUser.displayName || 'Host',
        images: uploadedImageUrls,
        image: uploadedImageUrls[0] || "https://images.unsplash.com/photo-1502672260266-1c1de2d9d000?q=80&w=2000&auto=format&fit=crop",
        createdAt: serverTimestamp(),
      });

      alert("New listing added successfully!");
      setUploadedImages([]);
      setUploadedFiles([]);
      setAddTitle('');
      form.reset();
      setActiveTab('active');
      fetchListings();
    } catch (err: any) {
      alert("Error adding listing: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      window.location.href = '/';
    } catch (err) {
      console.error("Error logging out:", err);
    }
  };

  const getFilteredListings = (listings: Listing[]) => {
    let result = [...listings];
    
    if (filterType !== 'All') {
      result = result.filter(l => l.type === filterType);
    }
    
    if (filterGender !== 'All') {
      result = result.filter(l => l.gender === filterGender || l.gender === 'Any');
    }
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(l => 
        l.title.toLowerCase().includes(q) || 
        l.location.toLowerCase().includes(q)
      );
    }
    
    result.sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      const dateA = a.createdAt ? a.createdAt.getTime() : 0;
      const dateB = b.createdAt ? b.createdAt.getTime() : 0;
      if (sortBy === 'expires-soon') return dateA - dateB;
      return dateB - dateA;
    });
    
    return result;
  };

  const displayedActiveListingsTotal = getFilteredListings(activeListings);
  const activeTotalPages = Math.ceil(displayedActiveListingsTotal.length / ITEMS_PER_PAGE);
  const displayedActiveListings = displayedActiveListingsTotal.slice((activePage - 1) * ITEMS_PER_PAGE, activePage * ITEMS_PER_PAGE);

  const displayedExpiredListingsTotal = getFilteredListings(expiredListings);
  const expiredTotalPages = Math.ceil(displayedExpiredListingsTotal.length / ITEMS_PER_PAGE);
  const displayedExpiredListings = displayedExpiredListingsTotal.slice((expiredPage - 1) * ITEMS_PER_PAGE, expiredPage * ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-brand/20 selection:text-brand">
      <Navbar />

      <main className="flex-grow pt-24 md:pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex flex-col lg:flex-row gap-8 items-start">

        {/* Mobile Menu Toggle Button */}
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="lg:hidden flex items-center justify-center gap-2 w-full bg-brand text-white py-3.5 rounded-2xl font-bold shadow-lg shadow-brand/20 active:scale-[0.98] transition-transform"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h7"></path></svg>
          Host Dashboard Menu
        </button>

        {/* Overlay for mobile drawer */}
        {isMobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] lg:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}

        {/* Sidebar / Mobile Drawer */}
        <aside className={`fixed inset-y-0 left-0 w-[85vw] sm:w-[320px] z-[70] transform transition-transform duration-300 lg:relative lg:translate-x-0 lg:w-72 lg:z-auto shrink-0 ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="bg-white h-full lg:h-auto rounded-r-[2rem] lg:rounded-[2rem] p-6 shadow-2xl lg:shadow-xl shadow-brand/20 lg:shadow-brand/5 border-r lg:border border-slate-100 lg:sticky lg:top-32 flex flex-col overflow-y-auto hide-scrollbar">

            <div className="flex items-center justify-between mb-6 lg:mb-8 shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-full bg-brand text-white flex items-center justify-center text-xl lg:text-2xl font-black shadow-lg shadow-brand/20">
                  {getInitials(currentUser?.displayName, currentUser?.email)}
                </div>
                <div className="min-w-0">
                  <h2 className="text-base lg:text-lg font-black text-slate-900 truncate">
                    {currentUser?.displayName || 'Verified User'}
                  </h2>
                  <p className="text-[10px] lg:text-[12px] font-bold text-slate-400 truncate">
                    {currentUser?.email || 'No email provided'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="lg:hidden w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <nav className="flex flex-col gap-2">
              <button
                onClick={() => { setActiveTab('active'); setIsMobileSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all duration-300 ${(activeTab === 'active' || activeTab === 'edit') ? 'bg-brand text-white shadow-md shadow-brand/20 lg:translate-x-1' : 'bg-transparent text-slate-600 hover:bg-slate-50 hover:text-brand'}`}
              >
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                <span className="whitespace-nowrap">Active Listings</span>
                <span className={`ml-auto text-xs py-0.5 px-2 rounded-full ${(activeTab === 'active' || activeTab === 'edit') ? 'bg-white/20 text-white' : 'bg-brand/10 text-brand'}`}>{activeListings.length}</span>
              </button>

              <button
                onClick={() => { setActiveTab('expired'); setIsMobileSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all duration-300 ${activeTab === 'expired' ? 'bg-brand text-white shadow-md shadow-brand/20 lg:translate-x-1' : 'bg-transparent text-slate-600 hover:bg-slate-50 hover:text-brand'}`}
              >
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <span className="whitespace-nowrap">Expired</span>
                <span className={`ml-auto text-xs py-0.5 px-2 rounded-full ${activeTab === 'expired' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-500'}`}>{expiredListings.length}</span>
              </button>

              <button
                onClick={() => { setActiveTab('add'); setUploadedImages([]); setAddTitle(''); setIsMobileSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all duration-300 ${activeTab === 'add' ? 'bg-brand text-white shadow-md shadow-brand/20 lg:translate-x-1' : 'bg-transparent text-slate-600 hover:bg-slate-50 hover:text-brand'}`}
              >
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg>
                <span className="whitespace-nowrap">Add New</span>
              </button>

              <div className="w-full pt-6 mt-auto lg:mt-6 border-t border-slate-100">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 px-4 py-3 rounded-2xl font-bold text-rose-500 bg-transparent hover:bg-rose-50 transition-all duration-300"
                >
                  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                  <span className="whitespace-nowrap">Log Out</span>
                </button>
              </div>
            </nav>

          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 w-full min-w-0 bg-white rounded-[2rem] p-6 sm:p-8 shadow-xl shadow-brand/10 border border-slate-200 min-h-[600px] relative z-10">

          {/* Active Listings */}
          {activeTab === 'active' && (
            <div className="animate-fade-in">
              <div className="mb-8 bg-white p-4 sm:p-5 rounded-3xl shadow-sm border border-slate-100/60">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                  <h1 className="text-2xl font-black text-slate-900">Active Listings</h1>
                  <div className="flex flex-wrap sm:flex-nowrap gap-2 w-full md:w-auto">
                    <div className="relative flex-1 sm:w-auto min-w-[120px]">
                      <select value={filterType} onChange={e => setFilterType(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 pr-8 font-bold text-sm text-slate-800 outline-none focus:bg-white focus:border-brand/40 focus:ring-4 focus:ring-brand/5 transition-all appearance-none cursor-pointer">
                        <option value="All">All Types</option>
                        <option value="Room">Room</option>
                        <option value="Annex">Annex</option>
                        <option value="House">House</option>
                        <option value="Apartment">Apartment</option>
                      </select>
                      <svg className="absolute right-3 top-0 bottom-0 my-auto w-4 h-4 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                    <div className="relative flex-1 sm:w-auto min-w-[120px]">
                      <select value={filterGender} onChange={e => setFilterGender(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 pr-8 font-bold text-sm text-slate-800 outline-none focus:bg-white focus:border-brand/40 focus:ring-4 focus:ring-brand/5 transition-all appearance-none cursor-pointer">
                        <option value="All">All Genders</option>
                        <option value="Boys">Boys</option>
                        <option value="Girls">Girls</option>
                      </select>
                      <svg className="absolute right-3 top-0 bottom-0 my-auto w-4 h-4 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                    <div className="relative flex-[2_2_100%] sm:flex-1 sm:w-auto min-w-[150px]">
                      <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 pr-8 font-bold text-sm text-slate-800 outline-none focus:bg-white focus:border-brand/40 focus:ring-4 focus:ring-brand/5 transition-all appearance-none cursor-pointer">
                        <option value="newest">Newest First</option>
                        <option value="expires-soon">Expires Soon</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                      </select>
                      <svg className="absolute right-3 top-0 bottom-0 my-auto w-4 h-4 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>
                <div className="relative w-full">
                  <input type="text" placeholder="Search by title or location..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 font-bold text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:bg-white focus:border-brand/40 focus:ring-4 focus:ring-brand/5 transition-all" />
                  <svg className="absolute left-4 top-0 bottom-0 my-auto w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>
              </div>

              {displayedActiveListings.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                  <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
                  </div>
                  <p className="text-slate-500 font-bold">No active listings match your criteria.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {displayedActiveListings.map(listing => {
                    const daysLeft = listing.createdAt
                      ? EXPIRY_DAYS - Math.floor((new Date().getTime() - listing.createdAt.getTime()) / (1000 * 60 * 60 * 24))
                      : EXPIRY_DAYS;
                    return (
                      <div key={listing.id} className="group rounded-[1.5rem] bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-brand/5 hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col">
                        <div className="relative h-48 w-full overflow-hidden">
                          <img src={listing.image} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                          <div className="absolute top-3 left-3 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg shadow-sm">Active</div>
                          <div className={`absolute top-3 right-3 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg shadow-sm ${daysLeft <= 7 ? 'bg-amber-500' : 'bg-slate-800/60 backdrop-blur-sm'}`}>
                            {daysLeft} day{daysLeft !== 1 ? 's' : ''} left
                          </div>
                        </div>
                        <div className="p-5 flex-1 flex flex-col">
                          <h3 className="font-extrabold text-lg text-slate-900 mb-1">{listing.title}</h3>
                          <p className="text-slate-500 text-sm font-bold mb-4 flex items-center gap-1">
                            <svg className="w-4 h-4 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
                            {listing.location}
                          </p>
                          <div className="mt-auto flex items-center justify-between">
                            <span className="font-black text-lg text-slate-900">Rs. {listing.price}</span>
                            <div className="flex gap-2">
                              <button onClick={() => handleEdit(listing.id)} className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-brand hover:text-white transition-colors" title="Edit">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                              </button>
                              <button onClick={() => handleDelete(listing.id, 'active')} className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-colors" title="Delete">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
              {activeTotalPages > 1 && (
                <div className="flex justify-center mt-10 mb-2">
                  <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
                    <button 
                      onClick={() => setActivePage(p => Math.max(1, p - 1))}
                      disabled={activePage === 1}
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 hover:bg-white hover:text-slate-900 hover:shadow-sm disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-slate-500 disabled:hover:shadow-none transition-all"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg>
                    </button>
                    <div className="px-4 font-bold text-sm text-slate-700">
                      Page {activePage} of {activeTotalPages}
                    </div>
                    <button 
                      onClick={() => setActivePage(p => Math.min(activeTotalPages, p + 1))}
                      disabled={activePage === activeTotalPages}
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 hover:bg-white hover:text-slate-900 hover:shadow-sm disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-slate-500 disabled:hover:shadow-none transition-all"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path></svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Expired Listings */}
          {activeTab === 'expired' && (
            <div className="animate-fade-in">
              <div className="mb-4 bg-white p-4 sm:p-5 rounded-3xl shadow-sm border border-slate-100/60">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                  <h1 className="text-2xl font-black text-slate-900">Expired Listings</h1>
                  <div className="flex flex-wrap sm:flex-nowrap gap-2 w-full md:w-auto">
                    <div className="relative flex-1 sm:w-auto min-w-[120px]">
                      <select value={filterType} onChange={e => setFilterType(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 pr-8 font-bold text-sm text-slate-800 outline-none focus:bg-white focus:border-brand/40 focus:ring-4 focus:ring-brand/5 transition-all appearance-none cursor-pointer">
                        <option value="All">All Types</option>
                        <option value="Room">Room</option>
                        <option value="Annex">Annex</option>
                        <option value="House">House</option>
                        <option value="Apartment">Apartment</option>
                      </select>
                      <svg className="absolute right-3 top-0 bottom-0 my-auto w-4 h-4 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                    <div className="relative flex-1 sm:w-auto min-w-[120px]">
                      <select value={filterGender} onChange={e => setFilterGender(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 pr-8 font-bold text-sm text-slate-800 outline-none focus:bg-white focus:border-brand/40 focus:ring-4 focus:ring-brand/5 transition-all appearance-none cursor-pointer">
                        <option value="All">All Genders</option>
                        <option value="Boys">Boys</option>
                        <option value="Girls">Girls</option>
                      </select>
                      <svg className="absolute right-3 top-0 bottom-0 my-auto w-4 h-4 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                    <div className="relative flex-[2_2_100%] sm:flex-1 sm:w-auto min-w-[150px]">
                      <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 pr-8 font-bold text-sm text-slate-800 outline-none focus:bg-white focus:border-brand/40 focus:ring-4 focus:ring-brand/5 transition-all appearance-none cursor-pointer">
                        <option value="newest">Newest First</option>
                        <option value="expires-soon">Expires Soon</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                      </select>
                      <svg className="absolute right-3 top-0 bottom-0 my-auto w-4 h-4 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>
                <div className="relative w-full">
                  <input type="text" placeholder="Search by title or location..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 font-bold text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:bg-white focus:border-brand/40 focus:ring-4 focus:ring-brand/5 transition-all" />
                  <svg className="absolute left-4 top-0 bottom-0 my-auto w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>
              </div>
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 mb-6 flex items-start gap-3 shadow-sm">
                <svg className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"></path></svg>
                <div>
                  <h4 className="text-rose-800 font-bold text-sm">Auto-Deletion Policy</h4>
                  <p className="text-rose-700 text-xs font-medium mt-1">Expired listings are <strong>permanently deleted after 30 days</strong> of being expired. Renew your listings before then to keep them active on the platform.</p>
                </div>
              </div>
              {displayedExpiredListings.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                  <p className="text-slate-500 font-bold">No expired listings match your criteria.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {displayedExpiredListings.map(listing => {
                    const daysSinceExpiry = listing.createdAt
                      ? Math.floor((new Date().getTime() - listing.createdAt.getTime()) / (1000 * 60 * 60 * 24)) - EXPIRY_DAYS
                      : 0;
                    const daysUntilDeletion = AUTO_DELETE_DAYS - daysSinceExpiry;
                    return (
                      <div key={listing.id} className="group rounded-[1.5rem] bg-white border border-slate-200 shadow-sm overflow-hidden flex flex-col transition-all duration-300">
                        <div className="relative h-48 w-full overflow-hidden grayscale group-hover:grayscale-[50%] transition-all duration-500">
                          <img src={listing.image} alt={listing.title} className="w-full h-full object-cover" />
                          <div className="absolute top-3 left-3 bg-slate-800 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg shadow-sm">Expired</div>
                          <div className={`absolute top-3 right-3 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg shadow-sm ${daysUntilDeletion <= 7 ? 'bg-rose-500' : 'bg-amber-500'}`}>
                            Deletes in {daysUntilDeletion}d
                          </div>
                        </div>
                        <div className="p-5 flex-1 flex flex-col">
                          <h3 className="font-extrabold text-lg text-slate-900 mb-1">{listing.title}</h3>
                          <div className="mt-auto flex items-center justify-between pt-4">
                            <span className="font-black text-lg text-slate-500">Rs. {listing.price}</span>
                            <div className="flex gap-2">
                              <button onClick={() => alert('Renew listing')} className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-brand transition-colors">
                                Renew
                              </button>
                              <button onClick={() => handleDelete(listing.id, 'expired')} className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-colors" title="Delete">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
              {expiredTotalPages > 1 && (
                <div className="flex justify-center mt-10 mb-2">
                  <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
                    <button 
                      onClick={() => setExpiredPage(p => Math.max(1, p - 1))}
                      disabled={expiredPage === 1}
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 hover:bg-white hover:text-slate-900 hover:shadow-sm disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-slate-500 disabled:hover:shadow-none transition-all"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg>
                    </button>
                    <div className="px-4 font-bold text-sm text-slate-700">
                      Page {expiredPage} of {expiredTotalPages}
                    </div>
                    <button 
                      onClick={() => setExpiredPage(p => Math.min(expiredTotalPages, p + 1))}
                      disabled={expiredPage === expiredTotalPages}
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 hover:bg-white hover:text-slate-900 hover:shadow-sm disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-slate-500 disabled:hover:shadow-none transition-all"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path></svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Add New Listing */}
          {activeTab === 'add' && (
            <div className="animate-fade-in max-w-3xl mx-auto">
              <div className="flex items-center gap-3 mb-2">
                <button type="button" onClick={() => setActiveTab('active')} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg>
                </button>
                <h1 className="text-2xl font-black text-slate-900">Add New Listing</h1>
              </div>
              <p className="text-slate-500 font-bold mb-6 ml-11">Fill out the form below to list your property.</p>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 ml-11 flex items-start gap-3 shadow-sm">
                <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <div>
                  <h4 className="text-amber-800 font-bold text-sm">Listing Lifecycle</h4>
                  <p className="text-amber-700 text-xs font-medium mt-1">All listings automatically expire after <strong>30 days</strong>. Expired listings are <strong>permanently deleted 30 days</strong> after expiration. Renew from your Expired tab to keep them live.</p>
                </div>
              </div>

              <form onSubmit={handleAddSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="sm:col-span-2">
                    <div className="flex justify-between items-end mb-2">
                      <label className="text-xs font-bold uppercase text-slate-400 block tracking-wider">Property Title</label>
                      <span className="text-xs font-bold text-slate-400">{addTitle.length}/20</span>
                    </div>
                    <input type="text" required maxLength={20} value={addTitle} onChange={(e) => setAddTitle(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 font-bold text-slate-800 placeholder:text-slate-300 outline-none focus:bg-white focus:ring-2 focus:ring-brand/20 focus:border-brand/40 transition-all shadow-sm" placeholder="e.g. Cozy Annex near SLIIT" />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase text-slate-400 mb-2 block tracking-wider">Location</label>
                    <input type="text" name="location" required className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 font-bold text-slate-800 placeholder:text-slate-300 outline-none focus:bg-white focus:ring-2 focus:ring-brand/20 focus:border-brand/40 transition-all shadow-sm" placeholder="e.g. Malabe" />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase text-slate-400 mb-2 block tracking-wider">Price (Rs/Month)</label>
                    <input type="number" name="price" required className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 font-bold text-slate-800 placeholder:text-slate-300 outline-none focus:bg-white focus:ring-2 focus:ring-brand/20 focus:border-brand/40 transition-all shadow-sm" placeholder="15000" />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase text-slate-400 mb-2 block tracking-wider">Property Type</label>
                    <div className="relative">
                      <select name="type" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 pr-10 font-bold text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-brand/20 focus:border-brand/40 transition-all appearance-none cursor-pointer shadow-sm">
                        <option>Room</option>
                        <option>Annex</option>
                        <option>House</option>
                        <option>Apartment</option>
                      </select>
                      <svg className="absolute right-4 top-0 bottom-0 my-auto w-5 h-5 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase text-slate-400 mb-2 block tracking-wider">Gender Preference</label>
                    <div className="relative">
                      <select name="gender" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 pr-10 font-bold text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-brand/20 focus:border-brand/40 transition-all appearance-none cursor-pointer shadow-sm">
                        <option>Any</option>
                        <option>Boys</option>
                        <option>Girls</option>
                      </select>
                      <svg className="absolute right-4 top-0 bottom-0 my-auto w-5 h-5 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase text-slate-400 mb-2 block tracking-wider">Distance from Center (km)</label>
                    <input type="number" step="0.1" required name="distance" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 font-bold text-slate-800 placeholder:text-slate-300 outline-none focus:bg-white focus:ring-2 focus:ring-brand/20 focus:border-brand/40 transition-all shadow-sm" placeholder="e.g. 1.2" />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase text-slate-400 mb-2 block tracking-wider">Move-in Date</label>
                    <input type="text" name="moveInDate" required className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 font-bold text-slate-800 placeholder:text-slate-300 outline-none focus:bg-white focus:ring-2 focus:ring-brand/20 focus:border-brand/40 transition-all shadow-sm" placeholder="e.g. Anytime" defaultValue="Anytime" />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase text-slate-400 mb-2 block tracking-wider">Minimum Stay</label>
                    <div className="relative">
                      <select name="minStay" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 pr-10 font-bold text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-brand/20 focus:border-brand/40 transition-all appearance-none cursor-pointer shadow-sm">
                        <option value="Any">Any</option>
                        <option value="1 Month">1 Month</option>
                        <option value="3 Months">3 Months</option>
                        <option value="6 Months">6 Months</option>
                        <option value="1 Year">1 Year</option>
                      </select>
                      <svg className="absolute right-4 top-0 bottom-0 my-auto w-5 h-5 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>

                  <div className="sm:col-span-2 pt-4 border-t border-slate-100">
                    <label className="text-xs font-bold uppercase text-slate-400 mb-4 block tracking-wider">Amenities & Features</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {[
                        { label: 'Kitchen Access', name: 'cooking' },
                        { label: 'Meals Included', name: 'meals' },
                        { label: 'Weekend Stays', name: 'weekend' },
                        { label: 'Attached Bathroom', name: 'bathroom' }
                      ].map((item, i) => (
                        <label key={i} className="flex items-center gap-3 cursor-pointer group">
                          <div className="relative flex items-center justify-center">
                            <input type="checkbox" name={item.name} value="true" className="peer appearance-none w-6 h-6 border-2 border-slate-200 rounded-lg checked:bg-brand checked:border-brand transition-colors cursor-pointer" />
                            <svg className="absolute w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                          </div>
                          <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900">{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="sm:col-span-2 pt-4 border-t border-slate-100">
                    <div className="flex flex-col mb-4">
                      <label className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">Map Coordinates</label>
                      <div className="text-xs bg-blue-50/50 border border-blue-100 text-blue-700 px-4 py-3 rounded-xl font-medium">
                        <strong>How to get these:</strong> Open <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="underline font-bold hover:text-blue-800">Google Maps</a>, right-click on your property's location, and click the numbers at the top of the menu (e.g. <code>6.9023, 79.8612</code>) to copy them. Paste the first number in Latitude and the second in Longitude.
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <input type="text" name="lat" required className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 font-bold text-slate-800 placeholder:text-slate-300 outline-none focus:bg-white focus:ring-2 focus:ring-brand/20 focus:border-brand/40 transition-all shadow-sm" placeholder="Latitude (e.g. 6.9023)" />
                      </div>
                      <div>
                        <input type="text" name="lng" required className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 font-bold text-slate-800 placeholder:text-slate-300 outline-none focus:bg-white focus:ring-2 focus:ring-brand/20 focus:border-brand/40 transition-all shadow-sm" placeholder="Longitude (e.g. 79.8612)" />
                      </div>
                    </div>
                  </div>

                  <div className="sm:col-span-2 pt-4 border-t border-slate-100">
                    <label className="text-xs font-bold uppercase text-slate-400 mb-2 block tracking-wider">Description</label>
                    <textarea name="description" required rows={4} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 font-bold text-slate-800 placeholder:text-slate-300 outline-none focus:bg-white focus:ring-2 focus:ring-brand/20 focus:border-brand/40 transition-all resize-none shadow-sm" placeholder="Describe the amenities, rules, and nearby places..."></textarea>
                  </div>

                  <div className="sm:col-span-2 pt-4 border-t border-slate-100">
                    <label className="text-xs font-bold uppercase text-slate-400 mb-2 block tracking-wider">Terms & Rules</label>
                    <textarea name="terms" rows={4} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 font-bold text-slate-800 placeholder:text-slate-300 outline-none focus:bg-white focus:ring-2 focus:ring-brand/20 focus:border-brand/40 transition-all resize-none shadow-sm" placeholder="Any specific rules or terms for this property..."></textarea>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold uppercase text-slate-400 mb-2 block tracking-wider">Images & Videos</label>

                    <div className="relative border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:bg-slate-50 hover:border-brand/30 transition-all cursor-pointer group bg-slate-50/50 mb-4">
                      <input type="file" multiple accept="image/*,video/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" title="Upload media" />
                      <div className="w-10 h-10 bg-white text-brand rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm group-hover:scale-110 transition-transform">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                      </div>
                      <p className="font-bold text-slate-600 mb-1">Click or drag to add images/videos</p>
                      <p className="text-xs font-bold text-slate-400">JPG, PNG, GIF, MP4 (max. 10MB)</p>
                    </div>

                    {uploadedImages.length > 0 && (
                      <div className="flex flex-col gap-3">
                        {uploadedImages.map((img, idx) => (
                          <div key={idx} className="flex items-center justify-between bg-white border border-slate-200 p-3 rounded-xl shadow-sm hover:border-brand/30 transition-colors group">
                            <div className="flex items-center gap-4">
                              <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-slate-100">
                                <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                              </div>
                              <div className="flex flex-col">
                                <span className="font-bold text-slate-800 text-sm">Media {idx + 1}</span>
                                {idx === 0 ? (
                                  <span className="text-[10px] font-black uppercase text-brand bg-brand/10 px-2 py-0.5 rounded-md w-max mt-1">Cover Image</span>
                                ) : (
                                  <span className="text-[10px] font-bold text-slate-400 mt-1">Gallery Item</span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex bg-slate-50 rounded-lg p-1 border border-slate-100">
                                <button type="button" onClick={() => moveImage(idx, 'left')} disabled={idx === 0} className="w-8 h-8 rounded-md text-slate-600 flex items-center justify-center hover:bg-white hover:shadow-sm transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:shadow-none" title="Move Up">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 15l7-7 7 7"></path></svg>
                                </button>
                                <button type="button" onClick={() => moveImage(idx, 'right')} disabled={idx === uploadedImages.length - 1} className="w-8 h-8 rounded-md text-slate-600 flex items-center justify-center hover:bg-white hover:shadow-sm transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:shadow-none" title="Move Down">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
                                </button>
                              </div>
                              <button type="button" onClick={() => removeImage(idx)} className="w-10 h-10 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-colors" title="Remove">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="sm:col-span-2 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs font-bold uppercase text-slate-400 mb-2 block tracking-wider">Owner Name</label>
                      <input type="text" name="ownerName" required className="w-full bg-slate-50/80 border border-slate-200 rounded-2xl px-4 py-3.5 font-bold text-slate-800 placeholder:text-slate-300 outline-none focus:bg-white focus:ring-2 focus:ring-brand/20 focus:border-brand/40 transition-all shadow-sm" placeholder="e.g. Mr. John Doe" />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase text-slate-400 mb-2 block tracking-wider">Owner Contact</label>
                      <input type="tel" name="ownerContact" required className="w-full bg-slate-50/80 border border-slate-200 rounded-2xl px-4 py-3.5 font-bold text-slate-800 placeholder:text-slate-300 outline-none focus:bg-white focus:ring-2 focus:ring-brand/20 focus:border-brand/40 transition-all shadow-sm" placeholder="e.g. 0771234567" />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button type="button" onClick={() => setActiveTab('active')} className="px-6 py-4 rounded-full font-bold text-slate-600 hover:bg-slate-100 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={isUploading} className="bg-slate-900 text-white px-8 py-4 rounded-full font-bold hover:bg-brand hover:-translate-y-0.5 transition-all duration-300 shadow-xl hover:shadow-brand/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0">
                    {isUploading ? 'Uploading...' : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg>
                        Publish Listing
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Edit Listing */}
          {activeTab === 'edit' && editingListing && (
            <div className="animate-fade-in max-w-3xl mx-auto">
              <div className="flex items-center gap-3 mb-2">
                <button type="button" onClick={() => { setActiveTab('active'); setEditingListing(null); }} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg>
                </button>
                <h1 className="text-2xl font-black text-slate-900">Edit Listing</h1>
              </div>
              <p className="text-slate-500 font-bold mb-8 ml-11">Update the details of your property.</p>

              <form onSubmit={handleEditSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="sm:col-span-2">
                    <div className="flex justify-between items-end mb-2">
                      <label className="text-xs font-bold uppercase text-slate-400 block tracking-wider">Property Title</label>
                      <span className="text-xs font-bold text-slate-400">{editingListing.title.length}/20</span>
                    </div>
                    <input type="text" required maxLength={20} value={editingListing.title} onChange={(e) => setEditingListing({ ...editingListing, title: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 font-bold text-slate-800 placeholder:text-slate-300 outline-none focus:bg-white focus:ring-2 focus:ring-brand/20 focus:border-brand/40 transition-all shadow-sm" />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase text-slate-400 mb-2 block tracking-wider">Location</label>
                    <input type="text" required value={editingListing.location} onChange={(e) => setEditingListing({ ...editingListing, location: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 font-bold text-slate-800 placeholder:text-slate-300 outline-none focus:bg-white focus:ring-2 focus:ring-brand/20 focus:border-brand/40 transition-all shadow-sm" />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase text-slate-400 mb-2 block tracking-wider">Price (Rs/Month)</label>
                    <input type="number" required value={editingListing.price} onChange={(e) => setEditingListing({ ...editingListing, price: Number(e.target.value) })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 font-bold text-slate-800 placeholder:text-slate-300 outline-none focus:bg-white focus:ring-2 focus:ring-brand/20 focus:border-brand/40 transition-all shadow-sm" />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase text-slate-400 mb-2 block tracking-wider">Property Type</label>
                    <div className="relative">
                      <select value={editingListing.type} onChange={(e) => setEditingListing({ ...editingListing, type: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 pr-10 font-bold text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-brand/20 focus:border-brand/40 transition-all appearance-none cursor-pointer shadow-sm">
                        <option>Room</option>
                        <option>Annex</option>
                        <option>House</option>
                        <option>Apartment</option>
                      </select>
                      <svg className="absolute right-4 top-0 bottom-0 my-auto w-5 h-5 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase text-slate-400 mb-2 block tracking-wider">Gender Preference</label>
                    <div className="relative">
                      <select value={editingListing.gender || 'Any'} onChange={(e) => setEditingListing({ ...editingListing, gender: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 pr-10 font-bold text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-brand/20 focus:border-brand/40 transition-all appearance-none cursor-pointer shadow-sm">
                        <option>Any</option>
                        <option>Boys</option>
                        <option>Girls</option>
                      </select>
                      <svg className="absolute right-4 top-0 bottom-0 my-auto w-5 h-5 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase text-slate-400 mb-2 block tracking-wider">Distance from Center (km)</label>
                    <input type="number" step="0.1" required value={editingListing.distance || ''} onChange={(e) => setEditingListing({ ...editingListing, distance: Number(e.target.value) })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 font-bold text-slate-800 placeholder:text-slate-300 outline-none focus:bg-white focus:ring-2 focus:ring-brand/20 focus:border-brand/40 transition-all shadow-sm" placeholder="e.g. 1.2" />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase text-slate-400 mb-2 block tracking-wider">Move-in Date</label>
                    <input type="text" required value={editingListing.moveInDate || ''} onChange={(e) => setEditingListing({ ...editingListing, moveInDate: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 font-bold text-slate-800 placeholder:text-slate-300 outline-none focus:bg-white focus:ring-2 focus:ring-brand/20 focus:border-brand/40 transition-all shadow-sm" placeholder="e.g. Anytime" />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase text-slate-400 mb-2 block tracking-wider">Minimum Stay</label>
                    <div className="relative">
                      <select value={editingListing.minStay || 'Any'} onChange={(e) => setEditingListing({ ...editingListing, minStay: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 pr-10 font-bold text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-brand/20 focus:border-brand/40 transition-all appearance-none cursor-pointer shadow-sm">
                        <option value="Any">Any</option>
                        <option value="1 Month">1 Month</option>
                        <option value="3 Months">3 Months</option>
                        <option value="6 Months">6 Months</option>
                        <option value="1 Year">1 Year</option>
                      </select>
                      <svg className="absolute right-4 top-0 bottom-0 my-auto w-5 h-5 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>

                  <div className="sm:col-span-2 pt-4 border-t border-slate-100">
                    <label className="text-xs font-bold uppercase text-slate-400 mb-4 block tracking-wider">Amenities & Features</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative flex items-center justify-center">
                          <input type="checkbox" checked={editingListing.cooking || false} onChange={(e) => setEditingListing({ ...editingListing, cooking: e.target.checked })} className="peer appearance-none w-6 h-6 border-2 border-slate-200 rounded-lg checked:bg-brand checked:border-brand transition-colors cursor-pointer" />
                          <svg className="absolute w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                        <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900">Kitchen</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative flex items-center justify-center">
                          <input type="checkbox" checked={editingListing.meals || false} onChange={(e) => setEditingListing({ ...editingListing, meals: e.target.checked })} className="peer appearance-none w-6 h-6 border-2 border-slate-200 rounded-lg checked:bg-brand checked:border-brand transition-colors cursor-pointer" />
                          <svg className="absolute w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                        <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900">Meals</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative flex items-center justify-center">
                          <input type="checkbox" checked={editingListing.weekend || false} onChange={(e) => setEditingListing({ ...editingListing, weekend: e.target.checked })} className="peer appearance-none w-6 h-6 border-2 border-slate-200 rounded-lg checked:bg-brand checked:border-brand transition-colors cursor-pointer" />
                          <svg className="absolute w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                        <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900">Weekend</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative flex items-center justify-center">
                          <input type="checkbox" checked={editingListing.bathroom || false} onChange={(e) => setEditingListing({ ...editingListing, bathroom: e.target.checked })} className="peer appearance-none w-6 h-6 border-2 border-slate-200 rounded-lg checked:bg-brand checked:border-brand transition-colors cursor-pointer" />
                          <svg className="absolute w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                        <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900">Bathroom</span>
                      </label>
                    </div>
                  </div>

                  <div className="sm:col-span-2 pt-4 border-t border-slate-100">
                    <div className="flex flex-col mb-4">
                      <label className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">Map Coordinates</label>
                      <div className="text-xs bg-blue-50/50 border border-blue-100 text-blue-700 px-4 py-3 rounded-xl font-medium">
                        <strong>How to get these:</strong> Open <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="underline font-bold hover:text-blue-800">Google Maps</a>, right-click on your property's location, and click the numbers at the top of the menu to copy them. Paste the first number in Latitude and the second in Longitude.
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <input type="text" required value={editingListing.latitude || ''} onChange={(e) => setEditingListing({ ...editingListing, latitude: e.target.value })} className="w-full bg-slate-50/80 border border-slate-200 rounded-2xl px-4 py-3.5 font-bold text-slate-800 placeholder:text-slate-300 outline-none focus:bg-white focus:ring-2 focus:ring-brand/20 focus:border-brand/40 transition-all shadow-sm" placeholder="Latitude (e.g. 6.9023)" />
                      </div>
                      <div>
                        <input type="text" required value={editingListing.longitude || ''} onChange={(e) => setEditingListing({ ...editingListing, longitude: e.target.value })} className="w-full bg-slate-50/80 border border-slate-200 rounded-2xl px-4 py-3.5 font-bold text-slate-800 placeholder:text-slate-300 outline-none focus:bg-white focus:ring-2 focus:ring-brand/20 focus:border-brand/40 transition-all shadow-sm" placeholder="Longitude (e.g. 79.8612)" />
                      </div>
                    </div>
                  </div>

                  <div className="sm:col-span-2 pt-4 border-t border-slate-100">
                    <label className="text-xs font-bold uppercase text-slate-400 mb-2 block tracking-wider">Description</label>
                    <textarea rows={4} required value={editingListing.description || ''} onChange={(e) => setEditingListing({ ...editingListing, description: e.target.value })} className="w-full bg-slate-50/80 border border-slate-200 rounded-2xl px-4 py-3.5 font-bold text-slate-800 placeholder:text-slate-300 outline-none focus:bg-white focus:ring-2 focus:ring-brand/20 focus:border-brand/40 transition-all resize-none shadow-sm" placeholder="Describe the amenities, rules, and nearby places..."></textarea>
                  </div>

                  <div className="sm:col-span-2 pt-4 border-t border-slate-100">
                    <label className="text-xs font-bold uppercase text-slate-400 mb-2 block tracking-wider">Terms & Rules</label>
                    <textarea rows={4} value={editingListing.terms || ''} onChange={(e) => setEditingListing({ ...editingListing, terms: e.target.value })} className="w-full bg-slate-50/80 border border-slate-200 rounded-2xl px-4 py-3.5 font-bold text-slate-800 placeholder:text-slate-300 outline-none focus:bg-white focus:ring-2 focus:ring-brand/20 focus:border-brand/40 transition-all resize-none shadow-sm" placeholder="Any specific rules or terms for this property..."></textarea>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold uppercase text-slate-400 mb-2 block tracking-wider">Images & Videos</label>

                    <div className="relative border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:bg-slate-50 hover:border-brand/30 transition-all cursor-pointer group bg-slate-50/50 mb-4">
                      <input type="file" multiple accept="image/*,video/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" title="Upload media" />
                      <div className="w-10 h-10 bg-white text-brand rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm group-hover:scale-110 transition-transform">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                      </div>
                      <p className="font-bold text-slate-600 mb-1">Click or drag to add images/videos</p>
                      <p className="text-xs font-bold text-slate-400">JPG, PNG, GIF, MP4 (max. 10MB)</p>
                    </div>

                    {uploadedImages.length > 0 && (
                      <div className="flex flex-col gap-3">
                        {uploadedImages.map((img, idx) => (
                          <div key={idx} className="flex items-center justify-between bg-white border border-slate-200 p-3 rounded-xl shadow-sm hover:border-brand/30 transition-colors group">
                            <div className="flex items-center gap-4">
                              <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-slate-100">
                                <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                              </div>
                              <div className="flex flex-col">
                                <span className="font-bold text-slate-800 text-sm">Media {idx + 1}</span>
                                {idx === 0 ? (
                                  <span className="text-[10px] font-black uppercase text-brand bg-brand/10 px-2 py-0.5 rounded-md w-max mt-1">Cover Image</span>
                                ) : (
                                  <span className="text-[10px] font-bold text-slate-400 mt-1">Gallery Item</span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex bg-slate-50 rounded-lg p-1 border border-slate-100">
                                <button type="button" onClick={() => moveImage(idx, 'left')} disabled={idx === 0} className="w-8 h-8 rounded-md text-slate-600 flex items-center justify-center hover:bg-white hover:shadow-sm transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:shadow-none" title="Move Up">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 15l7-7 7 7"></path></svg>
                                </button>
                                <button type="button" onClick={() => moveImage(idx, 'right')} disabled={idx === uploadedImages.length - 1} className="w-8 h-8 rounded-md text-slate-600 flex items-center justify-center hover:bg-white hover:shadow-sm transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:shadow-none" title="Move Down">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
                                </button>
                              </div>
                              <button type="button" onClick={() => removeImage(idx)} className="w-10 h-10 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-colors" title="Remove">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="sm:col-span-2 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs font-bold uppercase text-slate-400 mb-2 block tracking-wider">Owner Name</label>
                      <input type="text" required value={editingListing.ownerName || ''} onChange={(e) => setEditingListing({ ...editingListing, ownerName: e.target.value })} className="w-full bg-slate-50/80 border border-slate-200 rounded-2xl px-4 py-3.5 font-bold text-slate-800 placeholder:text-slate-300 outline-none focus:bg-white focus:ring-2 focus:ring-brand/20 focus:border-brand/40 transition-all shadow-sm" placeholder="e.g. Mr. John Doe" />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase text-slate-400 mb-2 block tracking-wider">Owner Contact</label>
                      <input type="tel" required value={editingListing.ownerContact || ''} onChange={(e) => setEditingListing({ ...editingListing, ownerContact: e.target.value })} className="w-full bg-slate-50/80 border border-slate-200 rounded-2xl px-4 py-3.5 font-bold text-slate-800 placeholder:text-slate-300 outline-none focus:bg-white focus:ring-2 focus:ring-brand/20 focus:border-brand/40 transition-all shadow-sm" placeholder="e.g. 0771234567" />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button type="button" onClick={() => { setActiveTab('active'); setEditingListing(null); }} className="px-6 py-4 rounded-full font-bold text-slate-600 hover:bg-slate-100 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" className="bg-brand text-white px-8 py-4 rounded-full font-bold hover:bg-brand/90 hover:-translate-y-0.5 transition-all duration-300 shadow-xl hover:shadow-brand/20 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

      </main>
      <Footer />
    </div>
  );
}
