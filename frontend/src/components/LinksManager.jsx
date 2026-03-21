import { useState, useEffect } from 'react';
import { Plus, Trash2, Link as LinkIcon, RefreshCcw, ExternalLink } from 'lucide-react';
import api from '../api';

const LinksManager = () => {
  const [links, setLinks] = useState([]);
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const fetchLinks = async () => {
    setFetching(true);
    try {
      const res = await api.get('/links');
      setLinks(res.data);
    } catch (err) {
      console.error('Failed to fetch links');
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const handleAddLink = async (e) => {
    e.preventDefault();
    if (!url) return;
    
    setLoading(true);
    try {
      await api.post('/links', { url, name });
      setUrl('');
      setName('');
      fetchLinks();
    } catch (err) {
      console.error('Failed to add link');
      alert('Could not add link. Verify your input.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to remove this link?')) return;
    try {
      await api.delete(`/links/${id}`);
      fetchLinks();
    } catch (err) {
      console.error('Failed to delete link');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
      <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
            <LinkIcon size={20} />
          </div>
          <h2 className="text-lg font-bold text-slate-800">Target URLs</h2>
        </div>
        <button 
          onClick={fetchLinks}
          disabled={fetching}
          className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors disabled:opacity-50"
        >
          <RefreshCcw size={18} className={fetching ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="p-6">
        <form onSubmit={handleAddLink} className="flex gap-4 mb-8">
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input 
              type="text" 
              placeholder="Display Name (optional)" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
            <input 
              type="url" 
              placeholder="https://example.com" 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center disabled:opacity-70 flex-shrink-0"
          >
            {loading ? <RefreshCcw size={18} className="animate-spin" /> : <><Plus size={18} className="mr-2" /> Add Link</>}
          </button>
        </form>

        <div className="space-y-3">
          {links.length === 0 && !fetching && (
            <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
              <LinkIcon size={32} className="mx-auto text-slate-400 mb-3" />
              <p className="text-slate-500 font-medium text-sm">No target links configured.</p>
              <p className="text-slate-400 text-xs mt-1">Add a link above to get started.</p>
            </div>
          )}

          {links.map((link) => (
            <div key={link.id} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:shadow-md hover:border-indigo-100 transition-all group">
              <div className="flex-1 min-w-0 pr-4">
                <p className="text-sm font-bold text-slate-800 truncate">
                  {link.name || link.url}
                </p>
                <a 
                  href={link.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-slate-500 truncate hover:text-indigo-600 mt-0.5 flex items-center gap-1 w-max transition-colors"
                >
                  {link.url} <ExternalLink size={12} />
                </a>
              </div>
              <button 
                onClick={() => handleDelete(link.id)}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all focus:opacity-100 outline-none"
                title="Remove Link"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LinksManager;
