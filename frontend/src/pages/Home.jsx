import React, { useState, useEffect } from 'react';
import { ArrowRight, Activity, Calendar, ShieldCheck, Users, Stethoscope, Building2, MonitorSmartphone, Lock, Settings, CheckCircle, ChevronLeft, ChevronRight, Quote, Search } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import SEOHead from '../components/SEOHead';

const Home = () => {
  const { doctors } = useAppContext();
  const [activeIndex, setActiveIndex] = useState(0);

  const [homeSpecialty, setHomeSpecialty] = useState('all');
  const [homeSearch, setHomeSearch] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (homeSpecialty !== 'all') {
      params.append('speciality', homeSpecialty);
    }
    if (homeSearch.trim() !== '') {
      params.append('search', homeSearch.trim());
    }
    navigate(`/doctors?${params.toString()}`);
  };

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in-up');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    document.querySelectorAll('.reveal-section').forEach(el => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % doctors.length);
  };

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + doctors.length) % doctors.length);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-primary-50 via-primary-100 to-primary-200 font-sans overflow-hidden">
      <SEOHead
        title="MEDICORE — Book Doctor Appointments Online | Healthcare Platform"
        description="Book doctor appointments online with MEDICORE. Find specialists, manage medical records, get AI health assistance, lab reports and pharmacy services — all in one place."
        keywords="book doctor appointment, online healthcare, find specialist, medical records, AI health assistant"
        canonical="https://medicore.care/"
      />
      <style>
        {`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .reveal-section {
            opacity: 0;
          }
          .animate-fade-in-up {
            animation: fadeInUp 0.8s ease-out forwards;
          }
          @keyframes bounce-slow {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          .animate-bounce-slow { animation: bounce-slow 3s ease-in-out infinite; }
        `}
      </style>

      {/* Background Decorative Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary-300 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-pulse"></div>
      <div className="absolute bottom-[10%] right-[-5%] w-125 h-125 bg-primary-400 rounded-full mix-blend-multiply filter blur-[120px] opacity-30"></div>

      {/* Hero Section */}
      <section className="reveal-section relative z-10 max-w-7xl mx-auto px-6 pt-4 pb-8 lg:px-8 lg:pt-16">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 border border-white/60 shadow-sm mb-6 backdrop-blur-md">
            <Activity className="w-4 h-4 text-primary-500" />
            <span className="text-sm font-semibold text-primary-700">Next-Generation Healthcare Management</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-primary-900 tracking-tight mb-4 leading-tight">
            Excellence in Every <span className="text-transparent bg-clip-text bg-black gradient-to-r from-[#000000c6] to-primary-300">Care</span>
          </h1>
          <p className="text-base md:text-lg text-primary-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Elevate your hospital's operational efficiency with MEDICORE. An integrated system designed for intelligent scheduling, comprehensive patient records, and seamless billing.
          </p>

          {/* Find a Doctor Search Card */}
          <div className="max-w-3xl mx-auto bg-white/80 backdrop-blur-xl border border-white/60 p-6 md:p-8 rounded-4xl shadow-2xl mb-8">
            <div className="text-left mb-6">
              <h2 className="text-xl font-bold text-primary-800 mb-1">Find a Healthcare Specialist</h2>
              <p className="text-sm text-primary-400">Search by speciality, location, or name to find the best care.</p>
            </div>
            <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-4 items-stretch">
              <div className="flex-1 min-w-50 flex flex-col items-start gap-1">
                <label className="text-xs font-bold text-primary-500 uppercase tracking-wider pl-3">Speciality</label>
                <select
                  value={homeSpecialty}
                  onChange={(e) => setHomeSpecialty(e.target.value)}
                  className="w-full bg-white border border-primary-100 px-4 py-3 rounded-full text-primary-800 outline-none focus:ring-2 focus:ring-primary-500/30 transition-all font-medium text-sm"
                >
                  <option value="all">All Specialities</option>
                  <option value="General physician">General physician</option>
                  <option value="Cardiologist">Cardiologist</option>
                  <option value="Dermatologist">Dermatologist</option>
                  <option value="Neurologist">Neurologist</option>
                  <option value="Pediatrician">Pediatrician</option>
                  <option value="Gynecologist">Gynecologist</option>
                  <option value="Orthopedist">Orthopedist</option>
                </select>
              </div>

              <div className="flex-1 min-w-50 flex flex-col items-start gap-1">
                <label className="text-xs font-bold text-primary-500 uppercase tracking-wider pl-3">Doctor Name / Keyword</label>
                <div className="w-full relative flex items-center">
                  <Search className="w-4 h-4 text-primary-300 absolute left-4" />
                  <input
                    type="text"
                    placeholder="Search doctor name..."
                    value={homeSearch}
                    onChange={(e) => setHomeSearch(e.target.value)}
                    className="w-full bg-white border border-primary-100 pl-10 pr-4 py-3 rounded-full text-primary-800 placeholder:text-primary-400/70 outline-none focus:ring-2 focus:ring-primary-500/30 transition-all font-medium text-sm"
                  />
                </div>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full md:w-auto bg-primary-500 text-white px-8 py-3.5 rounded-full font-bold shadow-lg hover:shadow-xl hover:bg-primary-700 hover:scale-[1.02] active:scale-95 transition-all whitespace-nowrap text-sm cursor-pointer"
                >
                  Search Now
                </button>
              </div>
            </form>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/doctors" className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary-700 text-white px-8 py-4 rounded-full font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              Browse Doctors
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/contact" className="w-full sm:w-auto inline-flex items-center justify-center bg-white/70 backdrop-blur-md text-primary-700 border border-primary-300/50 px-8 py-4 rounded-full font-semibold hover:bg-white transition-all duration-300 shadow-sm hover:shadow-md">
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="reveal-section relative z-10 max-w-6xl mx-auto px-6 mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl p-6 shadow-xl">
          <div className="text-center">
            <p className="text-3xl font-black text-primary-500 mb-1">50+</p>
            <p className="text-xs font-semibold text-primary-400 uppercase tracking-wider">Specialists</p>
          </div>
          <div className="text-center border-l border-white/40">
            <p className="text-3xl font-black text-primary-500 mb-1">10k+</p>
            <p className="text-xs font-semibold text-primary-400 uppercase tracking-wider">Patients</p>
          </div>
          <div className="text-center border-l border-white/40">
            <p className="text-3xl font-black text-primary-500 mb-1">24/7</p>
            <p className="text-xs font-semibold text-primary-400 uppercase tracking-wider">Support</p>
          </div>
          <div className="text-center border-l border-white/40">
            <p className="text-3xl font-black text-primary-500 mb-1">100%</p>
            <p className="text-xs font-semibold text-primary-400 uppercase tracking-wider">Secure</p>
          </div>
        </div>
      </section>

      {/* Core Modules Section */}
      <section className="reveal-section relative z-10 max-w-7xl mx-auto px-6 pb-12">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-4xl font-bold text-primary-900 mb-3">Core Modules</h2>
          <p className="text-primary-600 text-base">Everything you need to run a modern healthcare facility.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: Users, title: 'Patient Portal', desc: 'Secure access to medical records and prescriptions.' },
            { icon: Calendar, title: 'Smart Scheduling', desc: 'Automated appointment booking and reminders.' },
            { icon: Building2, title: 'OPD / IPD', desc: 'Complete in-patient and out-patient management.' },
            { icon: ShieldCheck, title: 'Integrated Billing', desc: 'Transparent invoicing with payment gateways.' }
          ].map((module, idx) => (
            <div key={idx} className="group bg-white/70 backdrop-blur-lg border border-white/60 rounded-3xl p-8 hover:-translate-y-2 transition-all duration-300 shadow-lg hover:shadow-2xl">
              <div className="w-14 h-14 bg-linear-to-br from-primary-300 to-primary-500 rounded-2xl flex items-center justify-center mb-6 shadow-md group-hover:scale-110 transition-transform">
                <module.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-primary-800 mb-3">{module.title}</h3>
              <p className="text-primary-400 font-medium leading-relaxed">{module.desc}</p>
            </div>
          ))}
        </div>
      </section>
      {/* Unified Portals Section */}
      <section className="reveal-section relative z-10 max-w-7xl mx-auto px-6 pb-12">
        <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-[2.5rem] p-6 md:p-8 overflow-hidden relative shadow-2xl">
          <div className="absolute top-0 right-0 w-150 h-150 bg-primary-300 rounded-full mix-blend-multiply filter blur-[150px] opacity-40"></div>

          <div className="relative z-10 text-center mb-8">
            <h2 className="text-2xl md:text-4xl font-bold text-primary-900 mb-3">All Connected</h2>
            <p className="text-primary-600 text-base max-w-2xl mx-auto">A dedicated portal for everyone. Experience seamless coordination between admins, doctors, and patients.</p>
          </div>

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/70 backdrop-blur-md border border-white/60 rounded-3xl p-8 hover:bg-white/90 transition-colors shadow-lg">
              <Settings className="w-8 h-8 text-primary-500 mb-5" />
              <h3 className="text-xl font-bold text-primary-800 mb-2">Admin Portal</h3>
              <p className="text-sm md:text-base text-primary-500 leading-7 max-w-sm">Manage modules, billing, access comprehensive BI reports, and control user roles globally.</p>
            </div>
            <div className="bg-white/70 backdrop-blur-md border border-white/60 rounded-3xl p-8 hover:bg-white/90 transition-colors shadow-lg">
              <Stethoscope className="w-8 h-8 text-primary-500 mb-5" />
              <h3 className="text-xl font-bold text-primary-800 mb-2">Doctor Portal</h3>
              <p className="text-sm md:text-base text-primary-500 leading-7 max-w-sm">Efficiently manage patient treatments, e-prescriptions, daily tasks, and appointment schedules.</p>
            </div>
            <div className="bg-white/70 backdrop-blur-md border border-white/60 rounded-3xl p-8 hover:bg-white/90 transition-colors shadow-lg">
              <MonitorSmartphone className="w-8 h-8 text-primary-500 mb-5" />
              <h3 className="text-xl font-bold text-primary-800 mb-2">Patient Portal</h3>
              <p className="text-sm md:text-base text-primary-500 leading-7 max-w-sm">Book appointments, securely view clinical records, make payments, and attend video consultations.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Doctor Carousel Section */}
      <section className="reveal-section relative z-10 max-w-7xl mx-auto px-6 pb-12">
        <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-[2.5rem] p-6 md:p-8 overflow-hidden relative shadow-2xl">
          {/* Decorative background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-100 bg-primary-300 rounded-full mix-blend-multiply filter blur-[150px] opacity-20"></div>

          <div className="relative z-10 text-center mb-8">
            <h2 className="text-2xl md:text-4xl font-bold text-primary-900 mb-3">Our Specialist Doctors</h2>
            <p className="text-primary-600 text-base max-w-2xl mx-auto">Meet our team of experienced healthcare professionals dedicated to your well-being.</p>
          </div>

          <div className="relative z-10 flex items-center justify-center gap-4 md:gap-8 min-h-95">
            {/* Prev Button */}
            <button onClick={prevSlide} className="z-20 p-3 rounded-full bg-white/60 border border-white/80 text-primary-500 hover:bg-white transition-all backdrop-blur-md shadow-md hover:shadow-lg">
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Cards Container */}
            <div className="flex items-center justify-center relative w-full max-w-5xl h-87.5">
              {doctors.map((doctor, idx) => {
                let position = idx - activeIndex;
                if (position > Math.floor(doctors.length / 2)) position -= doctors.length;
                if (position < -Math.floor(doctors.length / 2)) position += doctors.length;

                if (Math.abs(position) > 1) return null;

                const isActive = position === 0;
                const isLeft = position < 0;
                const isRight = position > 0;

                return (
                  <div
                    key={doctor._id}
                    className={`absolute transition-all duration-500 ease-in-out
                      ${isActive ? 'z-30 scale-100 opacity-100' : 'z-20 scale-90 opacity-50'}
                      ${isLeft ? 'translate-x-[-90%] md:translate-x-[-110%]' : ''}
                      ${isRight ? 'translate-x-[90%] md:translate-x-[110%]' : ''}
                      ${isActive ? 'translate-x-0 shadow-[0_0_50px_rgba(152,193,217,0.3)]' : ''}
                    `}
                    style={{ width: '100%', maxWidth: '380px' }}
                  >
                    <div className={`bg-white/80 backdrop-blur-md rounded-3xl p-6 border ${isActive ? 'border-primary-500/30 shadow-2xl' : 'border-white/60 shadow-lg'} h-full flex flex-col items-center text-center bg-white/55 backdrop-blur-sm rounded-3xl px-6 py-8 shadow-[0_18px_45px_rgba(15,23,42,0.08)] relative overflow-hidden group`}>
                      {/* Quote Badge matching theme */}
                      <div className="absolute top-4 right-4 w-8 h-8 bg-linear-to-br from-primary-300 to-primary-500 rounded-full flex items-center justify-center shadow-lg z-20">
                        <Quote className="w-5 h-5 text-white fill-current" />
                      </div>

                      {isActive && <div className="absolute top-0 right-0 w-32 h-32 bg-primary-300 rounded-full mix-blend-multiply filter blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity"></div>}

                      <Link to={`/doctors/${doctor._id}`} className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary-300 mb-4 relative z-10 shadow-lg bg-white group-hover:scale-105 transition-transform">
                        <img src={doctor.image} alt={doctor.name} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                      </Link>

                      <Link to={`/doctors/${doctor._id}`}>
                        <h3 className="text-2xl font-bold text-primary-800 mb-1 relative z-10 group-hover:text-primary-500 transition-colors">{doctor.name}</h3>
                      </Link>
                      <p className="text-primary-500 font-bold mb-1 relative z-10">{doctor.speciality}</p>
                      <p className="text-primary-400 text-sm mb-6 relative z-10">{doctor.experience}</p>

                      <div className="mt-auto relative z-10 w-full">
                        <Link to={`/doctors/${doctor._id}`} className={`inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold transition-all ${isActive ? 'bg-linear-to-r from-primary-500 to-primary-700 text-white hover:from-[#4A6D9A] hover:to-[#384355] shadow-lg shadow-primary-500/20' : 'bg-primary-50 text-primary-600 border border-primary-300/30 hover:bg-white hover:shadow-sm'}`}>
                          See More
                          {isActive && <ArrowRight className="w-4 h-4" />}
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Next Button */}
            <button onClick={nextSlide} className="z-20 p-3 rounded-full bg-white/60 border border-white/80 text-primary-500 hover:bg-white transition-all backdrop-blur-md shadow-md hover:shadow-lg">
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Pagination Dots */}
          <div className="flex justify-center gap-2 mt-8 relative z-10">
            {doctors.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${idx === activeIndex ? 'bg-primary-500 w-8' : 'bg-primary-500/20 hover:bg-primary-500/40'}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="reveal-section relative z-10 max-w-6xl mx-auto px-6 pb-14">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-4xl font-semibold tracking-tight text-primary-900 mb-3">Why Healthcare Professionals Love Us</h2>
          <p className="text-primary-600 text-sm md:text-base leading-7 max-w-2xl mx-auto">Simple, powerful, and built to improve the quality of your administration and patient care.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          <div className="flex flex-col items-center text-center bg-white/55 backdrop-blur-sm rounded-3xl px-6 py-8 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
            <div className="w-16 h-16 bg-white rounded-full shadow-md flex items-center justify-center mb-5 text-primary-500">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="text-xl md:text-2xl font-semibold text-primary-800 mb-3">Total Control</h3>
            <p className="text-sm md:text-base text-primary-500 leading-7 max-w-sm">Digitally generate clinical records, access prescriptions, and control your finances from any device, anywhere.</p>
          </div>
          <div className="flex flex-col items-center text-center bg-white/55 backdrop-blur-sm rounded-3xl px-6 py-8 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
            <div className="w-16 h-16 bg-white rounded-full shadow-md flex items-center justify-center mb-5 text-primary-500">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-xl md:text-2xl font-semibold text-primary-800 mb-3">Easy to Use</h3>
            <p className="text-sm md:text-base text-primary-500 leading-7 max-w-sm">No special training needed. Save time on administrative work and focus entirely on what matters most: your patients.</p>
          </div>
          <div className="flex flex-col items-center text-center bg-white/55 backdrop-blur-sm rounded-3xl px-6 py-8 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
            <div className="w-16 h-16 bg-white rounded-full shadow-md flex items-center justify-center mb-5 text-primary-500">
              <Lock className="w-8 h-8" />
            </div>
            <h3 className="text-xl md:text-2xl font-semibold text-primary-800 mb-3">Highly Secure</h3>
            <p className="text-sm md:text-base text-primary-500 leading-7 max-w-sm">State-of-the-art security measures to ensure your data and patient records remain completely private and safe.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

