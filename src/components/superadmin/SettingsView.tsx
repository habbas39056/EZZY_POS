import React, { useState } from 'react';
import { Settings, Save, Download, Upload, RotateCcw, Globe, Database, Server, Check } from 'lucide-react';
import { useSuperAdmin } from '../../context/SuperAdminContext';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, exportDatabaseJSON, importDatabaseJSON, resetToDemoData } = useSuperAdmin();

  const [platformName, setPlatformName] = useState(settings.platformName);
  const [supportEmail, setSupportEmail] = useState(settings.supportEmail);
  const [supportPhone, setSupportPhone] = useState(settings.supportPhone);
  const [defaultCurrency, setDefaultCurrency] = useState(settings.defaultCurrency);
  const [defaultTrialDays, setDefaultTrialDays] = useState(settings.defaultTrialDays);
  const [allowPublicSignups, setAllowPublicSignups] = useState(settings.allowPublicSignups);
  const [taxRatePercent, setTaxRatePercent] = useState(settings.taxRatePercent);
  const [companyAddress] = useState(settings.companyAddress);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // MySQL connection state
  const [dbHost, setDbHost] = useState('localhost');
  const [dbPort, setDbPort] = useState('3306');
  const [dbUser, setDbUser] = useState('root');
  const [dbPassword, setDbPassword] = useState('');
  const [dbName, setDbName] = useState('adwiselabs_saas');
  const [dbStatus, setDbStatus] = useState<string>('Checking...');
  const [isTestingDb, setIsTestingDb] = useState(false);

  React.useEffect(() => {
    fetch('http://localhost:5000/api/health')
      .then(res => res.json())
      .then(data => setDbStatus(data.database))
      .catch(() => setDbStatus('Server offline (Port 5000)'));
  }, []);

  const handleTestMysql = async () => {
    setIsTestingDb(true);
    try {
      const res = await fetch('http://localhost:5000/api/health');
      const data = await res.json();
      setDbStatus(data.database);
      alert(`Backend Status: ${data.status.toUpperCase()}\nDatabase Engine: ${data.database}`);
    } catch {
      alert('Could not reach backend API at http://localhost:5000');
    } finally {
      setIsTestingDb(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      platformName,
      supportEmail,
      supportPhone,
      defaultCurrency,
      defaultTrialDays,
      allowPublicSignups,
      taxRatePercent,
      companyAddress,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importDatabaseJSON(content);
        if (success) {
          alert('Database restored successfully from backup JSON!');
        } else {
          alert('Invalid backup file format.');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#0070ba]" /> Platform Configuration
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Global settings for your multi-tenant Adwiselabs SaaS cloud backoffice.
          </p>
        </div>
        {savedSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
            <Check className="w-4 h-4 text-emerald-600" /> Settings Saved!
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-5 text-xs">
        {/* Branding & Contacts */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-3.5">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-[#0070ba]" /> SaaS Branding & Support Channels
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Platform Brand Title</label>
              <input
                type="text"
                value={platformName}
                onChange={(e) => setPlatformName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#0070ba] focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Default System Currency</label>
              <select
                value={defaultCurrency}
                onChange={(e) => setDefaultCurrency(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#0070ba] focus:bg-white font-medium"
              >
                <option value="USD">USD ($) - US Dollar</option>
                <option value="GBP">GBP (£) - British Pound</option>
                <option value="EUR">EUR (€) - Euro</option>
                <option value="PKR">PKR (Rs) - Pakistani Rupee</option>
                <option value="AED">AED (AED) - UAE Dirham</option>
                <option value="SAR">SAR (SAR) - Saudi Riyal</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Support Contact Email</label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#0070ba] focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Support Phone / Hotline</label>
              <input
                type="text"
                value={supportPhone}
                onChange={(e) => setSupportPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#0070ba] focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Tenant Defaults */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-3.5">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Server className="w-4 h-4 text-[#0070ba]" /> Multi-Tenant Defaults
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Trial Period Duration (Days)</label>
              <input
                type="number"
                min="1"
                max="90"
                value={defaultTrialDays}
                onChange={(e) => setDefaultTrialDays(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#0070ba] focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Default Platform VAT/Tax Rate (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={taxRatePercent}
                onChange={(e) => setTaxRatePercent(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#0070ba] focus:bg-white"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center gap-2.5">
            <input
              type="checkbox"
              id="allowPublicSignups"
              checked={allowPublicSignups}
              onChange={(e) => setAllowPublicSignups(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-[#0070ba] focus:ring-0 cursor-pointer"
            />
            <label htmlFor="allowPublicSignups" className="text-slate-700 font-semibold cursor-pointer">
              Enable automated client self-onboarding from public registration page
            </label>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-5 py-2.5 rounded-lg bg-[#0070ba] hover:bg-sky-700 text-white font-bold flex items-center gap-1.5 shadow-sm transition"
          >
            <Save className="w-4 h-4" /> Save Platform Settings
          </button>
        </div>
      </form>

      {/* MySQL Live Database Connection Card */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Database className="w-4 h-4 text-[#0070ba]" /> MySQL Database Connection (Node.js + MySQL2)
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Live connection status and relational schema connector for your local or cloud MySQL server.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-full text-[10.5px] font-bold border ${
              dbStatus.includes('MySQL')
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              ● {dbStatus}
            </span>
            <button
              onClick={handleTestMysql}
              disabled={isTestingDb}
              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold transition"
            >
              {isTestingDb ? 'Testing...' : 'Test Connection'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
          <div>
            <label className="block text-slate-600 font-medium mb-1">DB Host</label>
            <input
              type="text"
              value={dbHost}
              onChange={(e) => setDbHost(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-slate-800"
            />
          </div>
          <div>
            <label className="block text-slate-600 font-medium mb-1">DB Port</label>
            <input
              type="text"
              value={dbPort}
              onChange={(e) => setDbPort(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-slate-800"
            />
          </div>
          <div>
            <label className="block text-slate-600 font-medium mb-1">DB User</label>
            <input
              type="text"
              value={dbUser}
              onChange={(e) => setDbUser(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-slate-800"
            />
          </div>
          <div>
            <label className="block text-slate-600 font-medium mb-1">DB Password</label>
            <input
              type="password"
              placeholder="(empty or password)"
              value={dbPassword}
              onChange={(e) => setDbPassword(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-slate-800"
            />
          </div>
          <div>
            <label className="block text-slate-600 font-medium mb-1">Database Name</label>
            <input
              type="text"
              value={dbName}
              onChange={(e) => setDbName(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-slate-800 font-mono"
            />
          </div>
        </div>
      </div>

      {/* Database Snapshot & Disaster Recovery */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-3.5">
        <div>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Database className="w-4 h-4 text-emerald-600" /> Database Backup & Snapshot Center
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Export entire platform state (all clients, subscription packages, invoices, audit logs) to JSON or restore anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
          {/* Export */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between space-y-2.5">
            <div>
              <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1">
                <Download className="w-3.5 h-3.5 text-[#0070ba]" /> Backup Database
              </h4>
              <p className="text-[10.5px] text-slate-500 mt-0.5">
                Download timestamped JSON snapshot of all tenants and SaaS data.
              </p>
            </div>
            <button
              onClick={exportDatabaseJSON}
              className="w-full py-2 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-lg text-xs transition flex items-center justify-center gap-1 border border-slate-200 shadow-xs"
            >
              <Download className="w-3.5 h-3.5" /> Download JSON
            </button>
          </div>

          {/* Import / Restore */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between space-y-2.5">
            <div>
              <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1">
                <Upload className="w-3.5 h-3.5 text-emerald-600" /> Restore Snapshot
              </h4>
              <p className="text-[10.5px] text-slate-500 mt-0.5">
                Upload previously exported JSON backup to restore state.
              </p>
            </div>
            <label className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold rounded-lg text-xs transition flex items-center justify-center gap-1 cursor-pointer">
              <Upload className="w-3.5 h-3.5" /> Upload JSON File
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Reset Demo */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between space-y-2.5">
            <div>
              <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1 text-rose-600">
                <RotateCcw className="w-3.5 h-3.5 text-rose-600" /> Factory Demo Reset
              </h4>
              <p className="text-[10.5px] text-slate-500 mt-0.5">
                Re-initialize database with pre-configured default Adwiselabs demo clients.
              </p>
            </div>
            <button
              onClick={() => {
                if (confirm('Are you sure you want to reset all data to default demo state?')) {
                  resetToDemoData();
                  alert('Database reset to default demo dataset.');
                }
              }}
              className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-lg text-xs transition flex items-center justify-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset to Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
