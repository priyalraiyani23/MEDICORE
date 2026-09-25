import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, CheckCircle, ArrowRight, Info } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAppContext } from '../context/AppContext';
import SEOHead from '../components/SEOHead';

const DoctorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, doctors } = useAppContext();
  
  // Find the doctor from the AppContext doctors array using _id
  const doctor = doctors.find(doc => doc._id === id);

  if (!doctor) {
    return (
      <div className="min-h-screen bg-linear-to-br from-primary-50 via-primary-100 to-primary-200 flex items-center justify-center">
        <p className="text-xl text-primary-500 font-bold animate-pulse">Loading doctor details...</p>
      </div>
    );
  }

  const [docSlots, setDocSlots] = useState([]);
  const [slotIndex, setSlotIndex] = useState(0);
  const [slotTime, setSlotTime] = useState('');

  const bookAppointment = async () => {
    if (!token) {
      toast.warning("Please login to book an appointment");
      // Save current URL so user is redirected back after login
      localStorage.setItem('redirectAfterLogin', window.location.pathname);
      navigate('/login');
      return;
    }
    
    if (!slotTime) {
      toast.warning("Please select a time slot");
      return;
    }

    const selectedDate = docSlots[slotIndex].date;
    const formattedDate = `${selectedDate.getDate()} ${selectedDate.toLocaleString('default', { month: 'short' })} ${selectedDate.getFullYear()}`;
    
    // Convert string ID to mock backend Object ID equivalent or use a mock logic for now 
    // since we use mockDoctors, we will send doctor._id if it existed, for now send string
    try {
      const res = await fetch('/api/appointment/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          doctorId: doctor._id,
          slotDate: formattedDate,
          slotTime: slotTime
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Appointment booked successfully!");
        navigate('/my-appointments');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getAvailableSlots = () => {
    const slots = [];
    const now = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(now);
      date.setDate(now.getDate() + i);

      // Build date key in YYYY-MM-DD format matching what admin saves
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateKey = `${year}-${month}-${day}`;

      // Get blocked times for this date from doctor's unavailableSlots
      const blockedEntry = doctor.unavailableSlots?.find(s => s.date === dateKey);
      const blockedTimes = blockedEntry ? blockedEntry.times : [];

      const daySlots = [];
      for (let h = 10; h <= 20; h++) {
        for (let m = 0; m < 60; m += 30) {
          const slotDate = new Date(date);
          slotDate.setHours(h, m, 0, 0);
          
          if (slotDate > now) {
            const timeLabel = slotDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
            // Mark blocked slots as red instead of hiding them
            const isBlocked = blockedTimes.includes(timeLabel);
            daySlots.push({ datetime: slotDate, time: timeLabel, isBlocked });
          }
        }
      }
      // availableCount = slots not blocked
      const availableCount = daySlots.filter(s => !s.isBlocked).length;
      slots.push({ date: date, slots: daySlots, availableCount });
    }
    setDocSlots(slots);
  };

  useEffect(() => {
    getAvailableSlots();
    setSlotIndex(0);
    setSlotTime('');
    window.scrollTo(0, 0);
  }, [doctor]);

  const relatedDoctors = doctors.filter(doc => doc.speciality === doctor.speciality && doc._id !== doctor._id);

  return (
    <div className="min-h-screen bg-linear-to-br from-primary-50 via-primary-100 to-primary-200 font-sans pb-8 pt-8">
      <SEOHead
        title={`${doctor.name} — ${doctor.speciality} | MEDICORE`}
        description={`Book an appointment with ${doctor.name}, a ${doctor.speciality} with ${doctor.experience} years of experience. ${doctor.about?.slice(0, 100) || 'Expert care at MEDICORE.'}`}
        keywords={`${doctor.name}, ${doctor.speciality}, book doctor appointment, MEDICORE`}
        canonical={`https://medicore.care/doctors/${doctor._id}`}
      />
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* Back Button */}
        <Link to="/doctors" className="inline-flex items-center gap-2 text-primary-500 font-semibold hover:text-primary-800 transition-colors mb-4 bg-white/50 px-4 py-1.5 rounded-full backdrop-blur-sm border border-white/60 shadow-sm w-max">
          <ArrowLeft className="w-4 h-4" />
          Back to Doctors
        </Link>

        {/* Profile Card */}
        <div className="flex flex-col sm:flex-row gap-4 mt-5">
          {/* Image Section */}
          <div>
            <img src={doctor.image} alt={doctor.name} loading="lazy" decoding="async" className="bg-primary-300 w-full sm:max-w-72 rounded-lg object-cover" />
          </div>

          {/* Details Section */}
          <div className="flex-1 border border-primary-500/20 bg-white/80 backdrop-blur-md rounded-xl p-8 py-7 shadow-sm">
            {/* Name */}
            <p className="flex items-center gap-2 text-3xl font-bold text-primary-800">
              {doctor.name}
              <CheckCircle className="w-5 h-5 text-primary-500" fill="currentColor" stroke="white" />
            </p>
            
            {/* Degree & Speciality */}
            <div className="flex items-center gap-2 text-sm mt-1 text-primary-600">
              <p>{doctor.degree} - {doctor.speciality}</p>
              <button className="py-0.5 px-2 border border-primary-300/50 text-xs rounded-full">{doctor.experience}</button>
            </div>

            {/* Availability Badge */}
            <div className={`mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
              doctor.availability !== false
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-red-50 text-red-600 border-red-200'
            }`}>
              <span className={`w-2 h-2 rounded-full animate-pulse ${doctor.availability !== false ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
              {doctor.availability !== false ? 'Currently Available' : 'Currently Unavailable'}
            </div>

            {/* About */}
            <div className="mt-6">
              <p className="flex items-center gap-1 text-sm font-bold text-primary-800 mb-2">
                About <Info className="w-4 h-4 text-primary-500" />
              </p>
              <p className="text-gray-600 font-medium text-sm mt-4 max-w-175 leading-relaxed">
                {doctor.about}
              </p>
            </div>

            {/* Fee */}
            <p className="text-primary-600 font-semibold mt-6">
              Appointment Fee: <span className="text-primary-800 font-bold">{doctor.fees}</span>
            </p>
          </div>
        </div>

        {/* Booking Slots Section */}
        <div className="mt-8 font-medium text-primary-600">
          <p className="text-xl font-bold text-primary-800 mb-4">Booking Slots</p>
          
          <div className="flex gap-3 items-center w-full overflow-x-auto pb-4" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
            {docSlots.length > 0 && docSlots.map((item, index) => {
              // Check if this date is partially or fully blocked
              const year = item.date.getFullYear();
              const month = String(item.date.getMonth() + 1).padStart(2, '0');
              const day = String(item.date.getDate()).padStart(2, '0');
              const dateKey = `${year}-${month}-${day}`;
              const blockedEntry = doctor.unavailableSlots?.find(s => s.date === dateKey);
              const hasBlocked = blockedEntry && blockedEntry.times.length > 0;
              const allBlocked = item.slots.length === 0 && hasBlocked;

              return (
                <div
                  key={index}
                  onClick={() => setSlotIndex(index)}
                  className={`relative text-center py-6 min-w-18 rounded-full cursor-pointer transition-all border ${
                    slotIndex === index
                      ? 'bg-primary-500 text-white border-primary-500 shadow-md'
                      : allBlocked
                      ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                      : 'bg-white text-primary-600 border-primary-300/30 hover:border-primary-500/50'
                  }`}
                >
                  <p className="text-sm uppercase font-bold">{item.date.toLocaleDateString('en-US', { weekday: 'short' })}</p>
                  <p className="text-lg font-black mt-1">{item.date.getDate()}</p>
                  {allBlocked && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>}
                </div>
              );
            })}
          </div>

          {/* Slots row or unavailability message */}
          {docSlots.length > 0 && docSlots[slotIndex].availableCount === 0 ? (
            <div className="flex items-center gap-3 mt-4 mb-4 px-5 py-4 bg-red-50 border border-red-100 rounded-2xl">
              <span className="w-8 h-8 bg-red-100 text-red-500 rounded-full flex items-center justify-center text-lg shrink-0">✕</span>
              <div>
                <p className="text-sm font-bold text-red-600">No slots available for this day</p>
                <p className="text-xs text-red-400 mt-0.5">The doctor is unavailable on this date. Please select another day.</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 w-full overflow-x-auto mt-4 pb-4" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
              {docSlots.length > 0 && docSlots[slotIndex].slots.map((item, index) => (
                <p
                  key={index}
                  onClick={() => !item.isBlocked && setSlotTime(item.time)}
                  title={item.isBlocked ? 'This slot is unavailable' : ''}
                  className={`text-sm font-semibold px-5 py-2.5 rounded-full transition-all border whitespace-nowrap ${
                    item.isBlocked
                      ? 'bg-red-50 text-red-500 border-red-300 cursor-not-allowed opacity-80 line-through'
                      : item.time === slotTime
                      ? 'bg-primary-500 text-white border-primary-500 shadow-md cursor-pointer'
                      : 'bg-white text-primary-600 border-primary-300/30 hover:border-primary-500/50 cursor-pointer'
                  }`}
                >
                  {item.time}
                </p>
              ))}
            </div>
          )}

          <button 
            onClick={bookAppointment}
            disabled={docSlots.length > 0 && docSlots[slotIndex].availableCount === 0}
            className="bg-primary-500 text-white text-sm font-bold px-10 py-3.5 rounded-full mt-6 shadow-md hover:bg-primary-700 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Book an Appointment
          </button>
        </div>

        {/* Related Doctors Section */}
        {relatedDoctors.length > 0 && (
          <div className="mt-24 flex flex-col items-center">
            <h2 className="text-3xl font-bold text-primary-800 mb-3">Related Doctors</h2>
            <p className="text-primary-600 text-center mb-10 max-w-xl">Simply Browse through our extensive list of trusted doctors.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full">
              {relatedDoctors.slice(0, 5).map((relatedDoc) => (
                <div key={relatedDoc._id} className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-white/60 shadow-lg hover:shadow-xl transition-all group flex flex-col relative">
                  <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-md px-2 py-1 rounded-lg shadow-sm border border-white flex items-center gap-1 z-20">
                    <Star className="w-3.5 h-3.5 text-yellow-500 fill-current" />
                    <span className="text-xs font-bold text-primary-800">{relatedDoc.rating}</span>
                  </div>
                  
                  <Link to={`/doctors/${relatedDoc._id}`} className="flex flex-col items-center text-center cursor-pointer group-hover:scale-105 transition-transform duration-300">
                    <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-primary-300 mb-4 relative z-10 shadow-md bg-white">
                      <img src={relatedDoc.image} alt={relatedDoc.name} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                    </div>
                    
                    <div className="w-full flex items-center justify-center gap-2 mb-2">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      <span className="text-sm font-semibold text-green-500">Available</span>
                    </div>
                    <h3 className="text-xl font-bold text-primary-800 mb-1 group-hover:text-primary-500 transition-colors">{relatedDoc.name}</h3>
                    <p className="text-primary-500 font-bold text-sm mb-4">{relatedDoc.speciality}</p>
                  </Link>
                  
                  <div className="mt-auto w-full pt-4 border-t border-primary-500/10">
                    <Link to={`/doctors/${relatedDoc._id}`} className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-semibold transition-all bg-primary-50 text-primary-600 border border-primary-300/30 hover:bg-primary-500 hover:text-white hover:border-primary-500 shadow-sm">
                      Book Visit
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default DoctorProfile;
