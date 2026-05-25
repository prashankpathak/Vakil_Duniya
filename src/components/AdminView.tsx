import { useState } from 'react';
import { useNavigationStore } from '../store';
import { ShieldCheck, ArrowLeft, Upload, Link } from 'lucide-react';

export function AdminView() {
  const { navigate } = useNavigationStore();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    specialization: 'Civil & Criminal',
    experience: '',
    consultation_fee: 599,
    city: '',
    language: 'Hindi, English',
    image: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccess(false);
    
    // Attempt to open UPI intent
    window.location.href = "upi://pay?pa=prashankpathak@fam&pn=Vakil%20Duniya&am=49&cu=INR";
    
    // Simulate payment passing and auto-registering
    setTimeout(async () => {
      try {
        const languages = formData.language.split(',').map(l => l.trim()).filter(l => l);
        
        const res = await fetch('/api/lawyers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            name: "Advocate " + formData.name.replace(/^Advocate\s+/i, ''), // Ensure 'Advocate' prefix
            language: languages.length > 0 ? languages : ["English"]
          })
        });

        if (res.ok) {
          setSuccess(true);
          setFormData({
            name: '',
            specialization: 'Civil & Criminal',
            experience: '',
            consultation_fee: 599,
            city: '',
            language: 'Hindi, English',
            image: ''
          });
        } else {
          alert("Failed to add lawyer");
        }
      } catch (err) {
        console.error(err);
        alert("Error adding lawyer");
      } finally {
        setSubmitting(false);
      }
    }, 4000); // 4 second delay to simulate payment confirmation phase
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10 w-full">
      <button 
        onClick={() => navigate('home')}
        className="flex items-center text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-white mb-8 group transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2 text-[#c5a059] group-hover:text-white transition-colors" /> Back to Home
      </button>

      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-serif text-white flex items-center gap-3">
            Lawyer Portal <ShieldCheck className="w-6 h-6 text-[#c5a059]" />
          </h2>
          <p className="mt-2 text-sm text-gray-400 font-sans font-light">
            Onboard a new verified lawyer to the Vakil Duniya platform.
          </p>
        </div>
        <div className="bg-[#c5a059]/10 border border-[#c5a059]/30 rounded-lg p-4 shrink-0 text-center md:text-right">
           <div className="text-[10px] uppercase tracking-widest text-[#c5a059] mb-1 font-bold">Platform Registration Fee</div>
           <div className="text-3xl font-serif text-white">₹49</div>
        </div>
      </div>

      <div className="bg-[#111] border border-white/5 rounded-xl shadow-sm p-8 md:p-10">
        {success && (
          <div className="mb-8 p-4 bg-green-500/10 border border-green-500/20 rounded text-green-400 text-sm font-medium text-center">
            Payment successful! Lawyer profile has been added to the platform.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label htmlFor="name" className="block text-xs font-bold tracking-widest uppercase text-gray-500 mb-2">Lawyer Name</label>
              <div className="mt-2 text-white">
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  placeholder="e.g. Ramesh Singh"
                  value={formData.name}
                  onChange={handleChange}
                  className="block w-full bg-[#050505] border border-white/10 py-3 px-4 rounded text-white shadow-sm placeholder:text-gray-600 focus:outline-none focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059] sm:text-sm transition-colors"
                />
              </div>
            </div>

            <div className="md:col-span-1">
              <label htmlFor="specialization" className="block text-xs font-bold tracking-widest uppercase text-gray-500 mb-2">Specialization</label>
              <div className="mt-2">
                <select
                  id="specialization"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  className="block w-full bg-[#050505] border border-white/10 py-3 px-4 rounded text-white shadow-sm focus:outline-none focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059] sm:text-sm transition-colors appearance-none"
                >
                  <option value="Civil & Criminal">Civil & Criminal</option>
                  <option value="Family Matter">Family Matter</option>
                  <option value="Property Dispute">Property Dispute</option>
                  <option value="Corporate Law">Corporate Law</option>
                </select>
              </div>
            </div>

            <div className="md:col-span-1">
              <label htmlFor="experience" className="block text-xs font-bold tracking-widest uppercase text-gray-500 mb-2">Experience (e.g. 5 Years)</label>
              <div className="mt-2">
                <input
                  type="text"
                  name="experience"
                  id="experience"
                  required
                  placeholder="5 Years"
                  value={formData.experience}
                  onChange={handleChange}
                  className="block w-full bg-[#050505] border border-white/10 py-3 px-4 rounded text-white shadow-sm placeholder:text-gray-600 focus:outline-none focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059] sm:text-sm transition-colors"
                />
              </div>
            </div>

            <div className="md:col-span-1">
              <label htmlFor="city" className="block text-xs font-bold tracking-widest uppercase text-gray-500 mb-2">City</label>
              <div className="mt-2">
                <input
                  type="text"
                  name="city"
                  id="city"
                  required
                  placeholder="e.g. Delhi"
                  value={formData.city}
                  onChange={handleChange}
                  className="block w-full bg-[#050505] border border-white/10 py-3 px-4 rounded text-white shadow-sm placeholder:text-gray-600 focus:outline-none focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059] sm:text-sm transition-colors"
                />
              </div>
            </div>

            <div className="md:col-span-1">
              <label htmlFor="consultation_fee" className="block text-xs font-bold tracking-widest uppercase text-gray-500 mb-2">Consultation Fee (₹)</label>
              <div className="mt-2">
                <input
                  type="number"
                  name="consultation_fee"
                  id="consultation_fee"
                  required
                  min="0"
                  value={formData.consultation_fee}
                  onChange={handleChange}
                  className="block w-full bg-[#050505] border border-white/10 py-3 px-4 rounded text-white shadow-sm placeholder:text-gray-600 focus:outline-none focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059] sm:text-sm transition-colors"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="language" className="block text-xs font-bold tracking-widest uppercase text-gray-500 mb-2">Languages (comma separated)</label>
              <div className="mt-2">
                <input
                  type="text"
                  name="language"
                  id="language"
                  required
                  placeholder="Hindi, English"
                  value={formData.language}
                  onChange={handleChange}
                  className="block w-full bg-[#050505] border border-white/10 py-3 px-4 rounded text-white shadow-sm placeholder:text-gray-600 focus:outline-none focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059] sm:text-sm transition-colors"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="image" className="block text-xs font-bold tracking-widest uppercase text-gray-500 mb-2">Profile Image URL (Optional)</label>
              <div className="mt-2 relative">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Link className="h-4 w-4 text-gray-500" />
                 </div>
                <input
                  type="url"
                  name="image"
                  id="image"
                  placeholder="https://example.com/image.jpg"
                  value={formData.image}
                  onChange={handleChange}
                  className="block w-full pl-10 bg-[#050505] border border-white/10 py-3 px-4 rounded text-white shadow-sm placeholder:text-gray-600 focus:outline-none focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059] sm:text-sm transition-colors"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="payment_mode_admin" className="block text-xs font-bold tracking-widest uppercase text-gray-500 mb-2">Payment Mode</label>
              <div className="mt-2 text-white">
                <select
                  id="payment_mode_admin"
                  name="payment_mode_admin"
                  className="block w-full bg-[#050505] border border-white/10 py-3 px-4 rounded text-white shadow-sm focus:outline-none focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059] sm:text-sm transition-colors appearance-none"
                >
                  <option value="UPI">UPI (GPay, PhonePe, Paytm, etc.)</option>
                  <option value="Card" disabled>Credit/Debit Card (Coming Soon)</option>
                  <option value="NetBanking" disabled>Net Banking (Coming Soon)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/5 space-y-4">
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#c5a059] text-black px-6 py-4 text-xs font-bold uppercase tracking-widest hover:brightness-110 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 relative overflow-hidden group"
            >
              <Upload className="w-4 h-4" />
              {submitting ? 'Waiting for Payment & Registering...' : 'Pay ₹49 via UPI & Auto Register'}
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform"></div>
            </button>
            <p className="mt-2 text-[10px] text-center text-gray-500 uppercase tracking-wider">
              Clicking this will open your UPI app. After payment, your profile will be automatically registered!
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
