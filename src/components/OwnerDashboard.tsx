import { useState, useEffect } from 'react';
import { useNavigationStore } from '../store';
import { UserCog, ArrowLeft, Trash2, Calendar, FileText, Anchor } from 'lucide-react';

interface Lawyer {
  id: string;
  name: string;
  specialization: string;
  city: string;
  consultation_fee: number;
}

interface Booking {
  id: string;
  name: string;
  mobile: string;
  case_type: string;
  appointment_date: string;
  status: string;
  lawyer_id: string;
  payment_status: string;
}

export function OwnerDashboard() {
  const { navigate } = useNavigationStore();
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [lawyersRes, bookingsRes] = await Promise.all([
        fetch('/api/lawyers'),
        fetch('/api/bookings')
      ]);
      const lawyersData = await lawyersRes.json();
      const bookingsData = await bookingsRes.json();
      
      if (Array.isArray(lawyersData)) setLawyers(lawyersData);
      if (Array.isArray(bookingsData)) setBookings(bookingsData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const deleteLawyer = async (id: string) => {
    if (!confirm("Are you sure you want to remove this lawyer?")) return;
    try {
      const res = await fetch(`/api/lawyers/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setLawyers(lawyers.filter(l => l.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10 w-full">
      <div className="flex items-center justify-between mb-8">
         <button 
           onClick={() => navigate('home')}
           className="flex items-center text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-white group transition-colors"
         >
           <ArrowLeft className="w-4 h-4 mr-2 text-[#c5a059] group-hover:text-white transition-colors" /> Logout
         </button>
         <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-gray-400">
             <UserCog className="w-4 h-4 text-[#c5a059]" /> Owner Panel
         </div>
      </div>

      <div className="mb-10 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-serif text-white flex items-center gap-3">
            Dashboard
          </h2>
          <p className="mt-2 text-sm text-gray-400 font-sans font-light">
            Manage platform lawyers and view client bookings.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-500 text-sm uppercase tracking-widest">Loading Data...</div>
      ) : (
        <div className="space-y-12">
          {/* LAWYERS SECTION */}
          <div>
            <div className="mb-6 flex items-center gap-2 border-b border-white/10 pb-4">
               <Anchor className="w-5 h-5 text-[#c5a059]" />
               <h3 className="text-xl font-serif text-white">Registered Lawyers</h3>
               <span className="ml-auto bg-[#111] text-[#c5a059] px-3 py-1 rounded text-xs border border-white/5 font-mono">{lawyers.length}</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {lawyers.map(lawyer => (
                 <div key={lawyer.id} className="bg-[#111] border border-white/5 rounded-xl p-6 relative group">
                    <h4 className="text-lg font-serif text-white">{lawyer.name}</h4>
                    <p className="text-xs tracking-widest uppercase text-[#c5a059] mt-1 mb-4">{lawyer.specialization}</p>
                    <div className="space-y-2 text-sm text-gray-400 font-sans">
                       <p>City: <span className="text-white">{lawyer.city}</span></p>
                       <p>Fee: <span className="text-white font-mono">₹{lawyer.consultation_fee}</span></p>
                    </div>
                    <button 
                       onClick={() => deleteLawyer(lawyer.id)}
                       className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 bg-red-500/10 hover:bg-red-500/20 text-red-500 p-2 rounded transition-all"
                    >
                       <Trash2 className="w-4 h-4" />
                    </button>
                 </div>
               ))}
               {lawyers.length === 0 && <p className="text-gray-500 text-sm col-span-full">No lawyers found.</p>}
            </div>
          </div>

          {/* BOOKINGS SECTION */}
          <div>
            <div className="mb-6 flex items-center gap-2 border-b border-white/10 pb-4">
               <Calendar className="w-5 h-5 text-[#c5a059]" />
               <h3 className="text-xl font-serif text-white">Client Bookings</h3>
               <span className="ml-auto bg-[#111] text-[#c5a059] px-3 py-1 rounded text-xs border border-white/5 font-mono">{bookings.length}</span>
            </div>

            <div className="overflow-x-auto">
               <table className="w-full text-left text-sm text-gray-400 border-collapse">
                  <thead className="bg-[#111] text-xs uppercase tracking-widest text-[#c5a059] border-b border-white/5">
                     <tr>
                        <th className="px-4 py-4 font-normal">Id</th>
                        <th className="px-4 py-4 font-normal">Client</th>
                        <th className="px-4 py-4 font-normal">Case</th>
                        <th className="px-4 py-4 font-normal">Date</th>
                        <th className="px-4 py-4 font-normal">Lawyer ID</th>
                        <th className="px-4 py-4 font-normal text-right">Payment</th>
                     </tr>
                  </thead>
                  <tbody>
                     {bookings.map(booking => (
                        <tr key={booking.id} className="border-b border-white/5 hover:bg-[#050505] transition-colors">
                           <td className="px-4 py-4 font-mono text-[10px] text-gray-500">{booking.id}</td>
                           <td className="px-4 py-4"><div className="text-white font-serif">{booking.name}</div><div className="text-[10px] text-[#c5a059] tracking-wider">{booking.mobile}</div></td>
                           <td className="px-4 py-4">{booking.case_type}</td>
                           <td className="px-4 py-4">{new Date(booking.appointment_date).toLocaleDateString()}</td>
                           <td className="px-4 py-4 font-mono">{booking.lawyer_id}</td>
                           <td className="px-4 py-4 text-right">
                               <span className={`inline-block px-2 py-1 text-[10px] uppercase font-bold tracking-widest rounded ${booking.payment_status === 'Paid' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                                 {booking.payment_status}
                               </span>
                           </td>
                        </tr>
                     ))}
                     {bookings.length === 0 && (
                        <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500 text-sm">No bookings yet.</td></tr>
                     )}
                  </tbody>
               </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
