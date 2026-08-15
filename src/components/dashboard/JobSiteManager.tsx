import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Loader2, MapPin, Trash2, Plus, Navigation } from 'lucide-react';
import MapPicker from './MapPicker';
import { toast } from 'sonner';

export default function JobSiteManager() {
  const { session } = useAuth();
  
  const [jobSites, setJobSites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState('');
  
  const [newSite, setNewSite] = useState<{name: string, latitude: number | null, longitude: number | null}>({ 
    name: '', latitude: null, longitude: null 
  });


  useEffect(() => {
    fetchSites();
  }, [session]);

  const fetchSites = async () => {
    if (!session?.access_token) {
      setJobSites([]);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/job-sites/me`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => null);
        throw new Error(errBody?.detail || 'Failed to fetch job sites');
      }
      const data = await res.json();
      setJobSites(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to fetch job sites');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSite.name || !newSite.latitude || !newSite.longitude) {
      setError('All fields are required');
      return;
    }
    
    setCreating(true);
    setError('');
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/job-sites/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          name: newSite.name,
          latitude: newSite.latitude,
          longitude: newSite.longitude
        })
      });
      
      if (!res.ok) throw new Error('Failed to create job site');
      const created = await res.json();
      setJobSites([...jobSites, created]);
      setNewSite({ name: '', latitude: null, longitude: null });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }
    
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setNewSite({
          ...newSite,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setLocating(false);
      },
      (err) => {
        console.error(err);
        toast.error("Unable to retrieve your location. Please check browser permissions.");
        setLocating(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this job site?")) return;
    
    setDeletingId(id);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/job-sites/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.detail || 'Failed to delete');
      }
      setJobSites(jobSites.filter(s => s.id !== id));
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" size={32} /></div>;

  return (
    <div className="space-y-8">
      
      <div className="bg-white border-4 border-[var(--color-charcoal)] hard-shadow p-6">
        <h2 className="font-[var(--font-anton)] text-2xl uppercase mb-6 flex items-center gap-2">
          <Plus size={24} /> Create New Job Site
        </h2>
        
        {error && <div className="bg-red-100 text-red-700 font-bold p-3 border-2 border-red-500 mb-4">{error}</div>}
        
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
          <div className="md:col-span-4">
             <label className="block font-bold uppercase text-xs tracking-widest mb-2">Site Name</label>
             <input 
               type="text" 
               value={newSite.name}
               onChange={(e) => setNewSite({...newSite, name: e.target.value})}
               placeholder="e.g. Okhla Phase 1 Factory"
               className="w-full border-2 border-[var(--color-charcoal)] px-4 py-3 font-bold outline-none focus:bg-gray-50"
             />
          </div>
          
          <div className="md:col-span-4">
            <div className="flex items-center justify-between mb-2">
              <label className="block font-bold uppercase text-xs tracking-widest">Pin Location on Map</label>
              <button 
                type="button"
                onClick={handleGetCurrentLocation}
                disabled={locating}
                className="text-xs font-bold uppercase tracking-widest bg-blue-50 text-blue-700 px-3 py-1 border-2 border-blue-700 flex items-center gap-1 hover:bg-blue-100 transition-colors disabled:opacity-50"
              >
                {locating ? <Loader2 className="animate-spin" size={14} /> : <Navigation size={14} />}
                Use Current Location
              </button>
            </div>
            <MapPicker 
              latitude={newSite.latitude} 
              longitude={newSite.longitude} 
              onChange={(lat, lng) => setNewSite({ ...newSite, latitude: lat, longitude: lng })} 
            />
            {newSite.latitude && newSite.longitude && (
              <p className="text-xs font-bold text-gray-500 mt-2">
                Selected Coordinates: {newSite.latitude.toFixed(4)}, {newSite.longitude.toFixed(4)}
              </p>
            )}
          </div>
          
          <div className="md:col-span-4 mt-2">
            <button 
              type="submit" 
              disabled={creating}
              className="bg-[var(--color-charcoal)] text-[var(--color-paper)] font-bold uppercase tracking-widest px-8 py-3 border-2 border-[var(--color-charcoal)] hard-shadow-hover hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {creating ? <Loader2 className="animate-spin" /> : 'Add Site'}
            </button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobSites.length === 0 ? (
          <div className="col-span-full p-8 border-4 border-dashed border-[var(--color-charcoal)] text-center font-bold text-gray-500 uppercase tracking-widest">
            No Job Sites Created Yet
          </div>
        ) : (
          jobSites.map(site => (
            <div key={site.id} className="bg-[var(--color-paper)] border-4 border-[var(--color-charcoal)] p-6 hard-shadow relative">
               <button 
                 onClick={() => handleDelete(site.id)}
                 disabled={deletingId === site.id}
                 className="absolute top-4 right-4 text-red-500 hover:text-red-700 bg-white border-2 border-red-500 p-2 hard-shadow-hover transition-all"
               >
                 {deletingId === site.id ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
               </button>
               <div className="flex items-center gap-3 pr-12">
                 <div className="w-10 h-10 bg-white border-2 border-[var(--color-charcoal)] flex items-center justify-center shrink-0">
                   <MapPin size={20} className="text-[var(--color-charcoal)]" />
                 </div>
                 <h3 className="font-[var(--font-anton)] text-xl leading-tight break-words min-w-0">{site.name}</h3>
               </div>
            </div>
          ))
        )}
      </div>
      
    </div>
  );
}
