import { useState, useEffect } from 'react';
import { Clock, Save, Info } from 'lucide-react';
import api from '../api';

const ScheduleManager = () => {
  const [schedule, setSchedule] = useState({ cron_expression: '0 */12 * * *', webhook_url: '', is_active: 1 });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess] = useState(false);

  const fetchSchedule = async () => {
    setFetching(true);
    try {
      const res = await api.get('/schedule');
      if (res.data) setSchedule(res.data);
    } catch (err) {
      console.error('Failed to fetch schedule');
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    try {
      await api.put('/schedule', schedule);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed to update schedule.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg text-white ${schedule.is_active ? 'bg-indigo-600 shadow-indigo-200 shadow-md' : 'bg-slate-400'}`}>
            <Clock size={20} />
          </div>
          <h2 className="text-lg font-bold text-slate-800">Scraping Schedule</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className={`flex h-3 w-3 rounded-full relative ${schedule.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`}>
            {schedule.is_active ? <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span> : null}
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {schedule.is_active ? 'Active' : 'Paused'}
          </span>
        </div>
      </div>

      <form onSubmit={handleSave} className="p-6 pb-8 space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center justify-between">
            Cron Expression
            <a href="https://crontab.guru/" target="_blank" rel="noreferrer" className="text-indigo-500 hover:text-indigo-600 text-xs font-normal flex items-center gap-1 bg-indigo-50 px-2 py-0.5 rounded-full">
              <Info size={12}/> Format Help
            </a>
          </label>
          <input 
            type="text" 
            value={schedule.cron_expression || ''}
            onChange={(e) => setSchedule({...schedule, cron_expression: e.target.value})}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            required
            placeholder="0 * * * *"
          />
          <p className="text-xs text-slate-500 mt-2">Example: <code className="bg-slate-100 text-slate-600 px-1 py-0.5 rounded">0 */12 * * *</code> (every 12 hours)</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            n8n Webhook URL
          </label>
          <input 
            type="url" 
            value={schedule.webhook_url || ''}
            onChange={(e) => setSchedule({...schedule, webhook_url: e.target.value})}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            required
            placeholder="https://your-n8n-instance.com/webhook/..."
          />
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between mt-6">
          <label className="flex items-center cursor-pointer gap-3 group">
            <div className="relative">
              <input 
                type="checkbox" 
                className="sr-only" 
                checked={!!schedule.is_active}
                onChange={(e) => setSchedule({...schedule, is_active: e.target.checked ? 1 : 0})}
              />
              <div className={`block w-14 h-8 rounded-full transition-colors ${schedule.is_active ? 'bg-indigo-500' : 'bg-slate-300'}`}></div>
              <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${schedule.is_active ? 'transform translate-x-6' : ''}`}></div>
            </div>
            <span className="text-sm font-bold text-slate-700 select-none group-hover:text-indigo-600 transition-colors">
              Enable Cron Job
            </span>
          </label>
        </div>

        <button 
          type="submit" 
          disabled={loading || fetching}
          className={`w-full py-3 mt-4 text-white font-semibold rounded-xl shadow-lg transition-all flex items-center justify-center transform active:scale-[0.98] ${success ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30' : 'bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 shadow-slate-900/20'}`}
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : success ? (
            'Saved Successfully!'
          ) : (
            <><Save size={18} className="mr-2" /> Save Configuration</>
          )}
        </button>
      </form>
    </div>
  );
};

export default ScheduleManager;
