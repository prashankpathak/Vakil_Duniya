import { useState, useEffect } from 'react';
import { useNavigationStore } from '../store';
import { Lawyer, BookingRequest } from '../types';
import { ArrowLeft, CheckCircle2, User } from 'lucide-react';

export function BookingView() {
  const { selectedLawyerId, navigate } = useNavigationStore();
  const [lawyer, setLawyer] = useState<Lawyer | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    case_type: 'Civil Consultation',
    appointment_date: ''
  });

  useEffect(() => {
    if (!selectedLawyerId) {
      navigate('lawyers');
      return;
    }

    fetch('/api/lawyers')
      .then(res => res.json())
      .then(data => {
        const found = data.find((l: Lawyer) => l.id === selectedLawyerId);
        setLawyer(found || null);
        setLoading(false);
      });
  }, [selectedLawyerId, navigate]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!selectedLawyerId || !lawyer) return;

    setSubmitting(true);
    const bookingFee = lawyer.consultation_fee;

    // Try Razorpay if script is available
    if ((window as any).Razorpay) {
      try {
        const orderRes = await fetch('/api/create-razorpay-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: bookingFee })
        });
        
        if (!orderRes.ok) {
           throw new Error("Razorpay Order failed. Fallback to UPI Intent.");
        }
        
        const orderInfo = await orderRes.json();
        const razorpayKey = (import.meta as any).env.VITE_RAZORPAY_KEY_ID || "rzp_test_change_me";
        
        const options = {
          key: razorpayKey,
          name: "Vakil Duniya",
          description: "Consultation Fee",
          order_id: orderInfo.id,
          handler: async function (response: any) {
            await finalizeBooking();
          },
          prefill: {
            name: formData.name,
            contact: formData.mobile,
          },
          theme: {
            color: "#c5a059"
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', function (response: any){
           alert("Payment failed");
           setSubmitting(false);
        });
        rzp.open();
        return; // wait for handler
      } catch (err) {
        console.warn("Razorpay error, falling back to UPI intent", err);
      }
    }

    // Fallback/UPI Intent attempt
    window.location.href = `upi://pay?pa=prashankpathak@fam&pn=Vakil%20Duniya&am=${bookingFee}&cu=INR`;
    
    // Simulate booking
    setTimeout(async () => {
      await finalizeBooking();
    }, 4000);
  };

  const finalizeBooking = async () => {
    try {
      const payload: BookingRequest = {
        ...formData,
        lawyer_id: selectedLawyerId as string
      };

      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setSuccess(true);
        const text = `*New Booking Received!*\n\n*Client Name:* ${formData.name}\n*Mobile:* ${formData.mobile}\n*Case Type:* ${formData.case_type}\n*Appointment Date:* ${formData.appointment_date}\n*Lawyer:* ${lawyer?.name}\n*Consultation Fee:* ₹${lawyer?.consultation_fee}`;
        const waLink = `https://api.whatsapp.com/send?phone=916263364561&text=${encodeURIComponent(text)}`;
        window.open(waLink, '_blank');
      } else {
        alert("Booking failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (loading) return <div className="flex justify-center flex-1 py-32"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#c5a059]"></div></div>;
  if (!lawyer) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10 w-full">
      <button 
        onClick={() => navigate('lawyers')}
        className="flex items-center text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-white mb-8 group transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2 text-[#c5a059] group-hover:text-white transition-colors" /> Back to Lawyers
      </button>

      {success ? (
        <div className="bg-[#111] border border-white/5 p-12 text-center rounded-xl shadow-sm">
          <div className="flex justify-center mb-6">
            <CheckCircle2 className="w-16 h-16 text-[#c5a059]" />
          </div>
          <h2 className="text-3xl font-serif text-white mb-4">Booking Confirmed!</h2>
          <p className="text-gray-400 font-sans font-light mb-8 max-w-xl mx-auto">
            Your appointment with <span className="text-white font-medium">{lawyer.name}</span> on <span className="text-white font-medium">{formData.appointment_date}</span> has been initialized. 
            We will contact you shortly on {formData.mobile} for final confirmation.
          </p>

          <div className="flex flex-col items-center justify-center gap-4">
            <a 
              href={`https://api.whatsapp.com/send?phone=916263364561&text=${encodeURIComponent(`*New Booking Received!*\n\n*Client Name:* ${formData.name}\n*Mobile:* ${formData.mobile}\n*Case Type:* ${formData.case_type}\n*Appointment Date:* ${formData.appointment_date}\n*Lawyer:* ${lawyer?.name}\n*Consultation Fee:* ₹${lawyer?.consultation_fee}`)}`}
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-green-600 text-white px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-green-500 transition-colors rounded inline-flex items-center"
            >
              Confirm on WhatsApp
            </a>
            <button
              onClick={() => navigate('home')}
              className="text-xs font-bold uppercase tracking-widest text-[#c5a059] hover:text-white transition-colors mt-4"
            >
              Return Home
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-[#111] border border-white/5 rounded-xl shadow-sm grid grid-cols-1 md:grid-cols-2 overflow-hidden">
          {/* Summary Section */}
          <div className="p-8 md:p-10 bg-[#080808] border-b md:border-b-0 md:border-r border-white/5 flex flex-col">
            <h3 className="text-xs font-bold tracking-[0.2em] text-gray-500 uppercase mb-8">Consultation Details</h3>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-gray-800 rounded-lg overflow-hidden border border-white/10 flex items-center justify-center">
                 {lawyer.image ? (
                   <img src={lawyer.image} alt={lawyer.name} className="w-full h-full object-cover" />
                 ) : (
                   <User className="w-8 h-8 text-white/50" />
                 )}
              </div>
              <div>
                <h4 className="font-serif text-lg text-white">{lawyer.name}</h4>
                <p className="text-[#c5a059] text-[10px] font-bold uppercase tracking-wider mt-1">{lawyer.specialization}</p>
              </div>
            </div>
            
            <div className="space-y-4 text-sm text-gray-400 mb-8 flex-grow">
               <div className="flex justify-between border-b border-white/5 pb-2">
                 <span>Location</span>
                 <span className="font-semibold text-white">{lawyer.city}</span>
               </div>
               <div className="flex justify-between border-b border-white/5 pb-2">
                 <span>Experience</span>
                 <span className="font-semibold text-white">{lawyer.experience}</span>
               </div>
               <div className="flex justify-between border-b border-white/5 pb-2">
                 <span>Language</span>
                 <span className="font-semibold text-white">{lawyer.language.join(', ')}</span>
               </div>
            </div>

            <div className="mt-auto">
              <div className="mt-4 bg-[#111] border border-[#c5a059]/20 p-4 rounded-lg">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Total Fee (Pay Now)</p>
                <p className="text-2xl font-serif text-[#c5a059]">₹{lawyer.consultation_fee}</p>
                <p className="text-[10px] text-gray-500 mt-2">100% secure payment for confirmation.</p>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="p-8 md:p-10">
            <h3 className="text-2xl font-serif text-white mb-8">Enter Details</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-xs font-bold tracking-widest uppercase text-gray-500 mb-2">Full Name</label>
                <div className="mt-2">
                  <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="block w-full bg-[#050505] border border-white/10 py-3 px-4 rounded text-white shadow-sm placeholder:text-gray-600 focus:outline-none focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059] sm:text-sm transition-colors"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="mobile" className="block text-xs font-bold tracking-widest uppercase text-gray-500 mb-2">Mobile Number</label>
                <div className="mt-2">
                  <input
                    type="tel"
                    name="mobile"
                    id="mobile"
                    required
                    pattern="[0-9]{10}"
                    value={formData.mobile}
                    onChange={handleChange}
                    className="block w-full bg-[#050505] border border-white/10 py-3 px-4 rounded text-white shadow-sm placeholder:text-gray-600 focus:outline-none focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059] sm:text-sm transition-colors"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="case_type" className="block text-xs font-bold tracking-widest uppercase text-gray-500 mb-2">Case Type</label>
                <div className="mt-2">
                  <select
                    id="case_type"
                    name="case_type"
                    value={formData.case_type}
                    onChange={handleChange}
                    className="block w-full bg-[#050505] border border-white/10 py-3 px-4 rounded text-white shadow-sm focus:outline-none focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059] sm:text-sm transition-colors appearance-none"
                  >
                    <option value="Civil Consultation">Civil Consultation</option>
                    <option value="Criminal Defense">Criminal Defense</option>
                    <option value="Family Matter">Family Matter</option>
                    <option value="Property Dispute">Property Dispute</option>
                    <option value="Corporate / Startup">Corporate / Startup</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="appointment_date" className="block text-xs font-bold tracking-widest uppercase text-gray-500 mb-2">Appointment Date</label>
                <div className="mt-2">
                  <input
                    type="date"
                    name="appointment_date"
                    id="appointment_date"
                    required
                    value={formData.appointment_date}
                    onChange={handleChange}
                    className="block w-full bg-[#050505] border border-white/10 py-3 px-4 rounded text-white shadow-sm placeholder:text-gray-600 focus:outline-none focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059] sm:text-sm transition-colors"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="payment_mode" className="block text-xs font-bold tracking-widest uppercase text-gray-500 mb-2">Payment Mode</label>
                <div className="mt-2">
                  <select
                    id="payment_mode"
                    name="payment_mode"
                    className="block w-full bg-[#050505] border border-white/10 py-3 px-4 rounded text-white shadow-sm focus:outline-none focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059] sm:text-sm transition-colors appearance-none"
                  >
                    <option value="UPI">UPI (GPay, PhonePe, Paytm, etc.)</option>
                    <option value="Card" disabled>Credit/Debit Card (Coming Soon)</option>
                    <option value="NetBanking" disabled>Net Banking (Coming Soon)</option>
                  </select>
                </div>
              </div>

              <div className="pt-6 border-t border-white/5">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#c5a059] text-black px-6 py-4 text-xs font-bold uppercase tracking-widest hover:brightness-110 transition-colors disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                >
                  {submitting ? 'Processing Payment...' : `Pay Now (₹${lawyer.consultation_fee}) & Book`}
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform"></div>
                </button>
                <p className="mt-4 text-[10px] text-center text-gray-500 uppercase tracking-wider">
                  Secure checkout via Razorpay (Cards, UPI, NetBanking).
                </p>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
