import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Search, HeartPulse, Brain, Baby, Bone, Stethoscope, Star, GraduationCap, Banknote, Clock, Activity, Syringe, Eye } from 'lucide-react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import SEOHead from '../components/SEOHead';

const categories = [
  { 
    id: 'all', 
    name: 'All Specialties', 
    icon: Stethoscope 
  },
  {
    id: 'General physician', 
    name: 'General physician', 
    icon: Stethoscope, 
    description: 'Primary care doctors who provide comprehensive, day-to-day healthcare for patients of all ages.',
    treats: ['Colds, flu, and viral fevers', 'Routine check-ups & physicals', 'Minor injuries and infections', 'Preventive care & vaccinations', 'High blood pressure management', 'Diabetes screening & care', 'Asthma management', 'Cholesterol management', 'Thyroid disorders']
  },
  { 
    id: 'Cardiologist', 
    name: 'Cardiologist', 
    icon: HeartPulse, 
    description: 'Specialists who diagnose, assess, and treat diseases of the cardiovascular system (heart and blood vessels).',
    treats: ['Heart attacks & disease', 'High blood pressure', 'Arrhythmias (irregular heartbeat)', 'Heart failure']
  },
  { 
    id: 'Dermatologist', 
    name: 'Dermatologist', 
    icon: Stethoscope, 
    description: 'Medical experts focused on conditions involving the skin, hair, nails, and mucous membranes.',
    treats: ['Acne, eczema & psoriasis', 'Skin infections & rashes', 'Hair loss & nail disorders', 'Skin cancer screening', 'Warts & moles', 'Cosmetic dermatology']
  },
  { 
    id: 'Neurologist', 
    name: 'Neurologist', 
    icon: Brain, 
    description: 'Specialists treating disorders that affect the brain, spinal cord, and central nervous system.',
    treats: ['Chronic headaches & migraines', 'Stroke recovery', 'Epilepsy & seizures', 'Parkinson\'s disease & Alzheimer\'s', 'Multiple sclerosis']
  },
  { 
    id: 'Pediatrician', 
    name: 'Pediatrician', 
    icon: Baby, 
    description: 'Doctors specializing in the physical, emotional, and social health of infants, children, and adolescents.',
    treats: ['Childhood illnesses & fevers', 'Growth & development checks', 'Immunizations', 'Newborn care', 'Behavioral health issues', 'Nutrition counseling', 'Asthma & allergies', 'ADHD management']
  },
  { 
    id: 'Psychiatrist', 
    name: 'Psychiatrist', 
    icon: Brain, 
    description: 'Medical doctors focused on the diagnosis, treatment, and prevention of mental, emotional, and behavioral disorders.',
    treats: ['Depression & anxiety', 'Bipolar disorder', 'Schizophrenia', 'Substance abuse disorders', 'PTSD']
  },
  { 
    id: 'Radiologist', 
    name: 'Radiologist', 
    icon: Activity, 
    description: 'Medical doctors who specialize in diagnosing and treating injuries and diseases using medical imaging procedures.',
    treats: ['X-rays & CT scans', 'MRIs & Ultrasounds', 'PET scans', 'Image-guided treatments', 'Mammography']
  },
  { 
    id: 'Gynecologist', 
    name: 'Gynecologist', 
    icon: Baby, 
    description: 'Doctors specializing in women\'s reproductive health, focusing on the female reproductive system.',
    treats: ['Pregnancy & childbirth', 'Menstrual disorders', 'PCOS & Endometriosis', 'Routine pelvic exams', 'Family planning & contraception', 'Menopause management', 'Infertility evaluations', 'Pap smears']
  },
  { 
    id: 'Orthopedist', 
    name: 'Orthopedist', 
    icon: Bone, 
    description: 'Surgeons and specialists treating problems related to the musculoskeletal system.',
    treats: ['Bone fractures & joint pain', 'Arthritis management', 'Sports injuries & tears', 'Back & spinal disorders', 'Joint replacement surgery']
  },
  { 
    id: 'Anesthesiologist', 
    name: 'Anesthesiologist', 
    icon: Syringe, 
    description: 'Physicians trained in anesthesia and perioperative medicine, ensuring patient safety during surgeries.',
    treats: ['Surgical anesthesia', 'Pain management', 'Critical care medicine', 'Post-operative recovery']
  },
  { 
    id: 'Ophthalmologist', 
    name: 'Ophthalmologist', 
    icon: Eye, 
    description: 'Medical and osteopathic doctors who specialize in eye and vision care, including performing eye surgery.',
    treats: ['Cataracts & Glaucoma', 'Vision correction (LASIK)', 'Macular degeneration', 'Eye infections & injuries', 'Diabetic retinopathy', 'Corneal diseases']
  },
];

const Doctors = () => {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('speciality') || 'all';
  const initialSearch = searchParams.get('search') || '';

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const categoriesRef = useRef(null);
  const doctorsRef = useRef(null);

  const { doctors } = useAppContext();

  useEffect(() => {
    const specialty = searchParams.get('speciality');
    const search = searchParams.get('search');
    if (specialty) {
      setSelectedCategory(specialty);
    }
    if (search) {
      setSearchQuery(search);
    }
    if (specialty || search) {
      setTimeout(() => {
        scrollToSection(doctorsRef);
      }, 300);
    }
  }, [searchParams]);

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const filteredDoctors = doctors.filter(doc => {
    const matchesCategory = selectedCategory === 'all' || doc.speciality === selectedCategory;
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.speciality.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-linear-to-br from-primary-50 via-primary-100 to-primary-200 font-sans pb-24">
      <SEOHead
        title="Find Doctors Near You | MEDICORE — Book Specialist Appointments"
        description="Browse and book appointments with top doctors and specialists on MEDICORE. Filter by specialty, experience, and availability. Cardiologists, Dermatologists, Neurologists and more."
        keywords="find doctor, book specialist appointment, cardiologist, dermatologist, neurologist, online doctor"
        canonical="https://medicore.care/doctors"
      />

      {/* Banner Section */}
      <section className="relative w-full min-h-75 md:min-h-64 py-12 flex items-center justify-center overflow-hidden bg-primary-900">
        {/* Background Decorative Blur */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-100 bg-primary-500 rounded-full mix-blend-screen filter blur-[150px] opacity-40"></div>

        <div className="relative z-10 text-center px-6 mt-4">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white tracking-tight mb-4">
            Find a <span className="text-transparent bg-clip-text bg-linear-to-r from-primary-300 to-primary-200">Doctor</span>
          </h1>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4 max-w-2xl mx-auto">
            <div className="flex-1 w-full flex items-center gap-3 px-6 py-4 rounded-full bg-white/10 border border-white/20 shadow-sm backdrop-blur-md focus-within:bg-white/20 focus-within:border-white/40 transition-all">
              <Search className="w-5 h-5 text-primary-300" />
              <input
                type="text"
                placeholder="Search doctors or specialties..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value !== '') {
                    setSelectedCategory('all');
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    scrollToSection(doctorsRef);
                  }
                }}
                className="bg-transparent border-none outline-none text-base text-white placeholder:text-white/70 w-full font-medium"
              />
            </div>
            <button
              onClick={() => scrollToSection(doctorsRef)}
              className="bg-white text-primary-900 px-8 py-4 rounded-full font-bold hover:bg-primary-300 transition-colors shadow-lg w-full md:w-auto whitespace-nowrap">
              Search Now
            </button>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section ref={categoriesRef} className="max-w-7xl mx-auto px-6 py-8 scroll-mt-24">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-primary-900 mb-2">Search Doctor By Categories</h2>
          <p className="text-primary-600">Select a specialty to find the right expert for your needs.</p>
        </div>

        <div className="flex overflow-x-auto gap-4 pb-4 snap-x scrollbar-none [&::-webkit-scrollbar]:hidden">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                setTimeout(() => scrollToSection(doctorsRef), 150);
              }}
              className={`shrink-0 min-w-35 flex flex-col items-center p-4 rounded-2xl transition-all duration-300 snap-center ${selectedCategory === cat.id
                  ? 'bg-primary-500 text-white shadow-xl scale-105'
                  : 'bg-white/60 text-primary-600 hover:bg-white hover:shadow-md backdrop-blur-md border border-white/50'
                }`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${selectedCategory === cat.id ? 'bg-white/20' : 'bg-primary-300/20 text-primary-500'
                }`}>
                <cat.icon className="w-6 h-6" />
              </div>
              <span className="font-bold text-center text-sm">{cat.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Doctors Section */}
      <section ref={doctorsRef} className="max-w-7xl mx-auto px-6 pt-4 pb-8 scroll-mt-24">
        <div className="flex flex-col sm:flex-row justify-between items-end sm:items-center mb-6 border-b border-primary-500/10 pb-4">
          <div>
            <h2 className="text-3xl font-bold text-primary-900 mb-1">Featured Doctors</h2>
            <p className="text-primary-600">
              {selectedCategory === 'all'
                ? 'Showing all our specialists'
                : `Showing specialists in ${categories.find(c => c.id === selectedCategory)?.name}`
              }
            </p>
          </div>
          <div className="mt-4 sm:mt-0 bg-white/60 backdrop-blur-md px-6 py-2 rounded-full border border-white/50 shadow-sm text-primary-500 font-bold">
            {filteredDoctors.length} {filteredDoctors.length === 1 ? 'Doctor' : 'Doctors'} Found
          </div>
        </div>

        {selectedCategory !== 'all' && categories.find(c => c.id === selectedCategory)?.description && (
          <div className="bg-white/70 backdrop-blur-md rounded-2xl p-4 md:p-6 mb-6 border border-white/60 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-200 rounded-full mix-blend-multiply filter blur-2xl opacity-40"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-start gap-4">
              <div className="bg-linear-to-br from-primary-100 to-white p-3 rounded-xl text-primary-500 shrink-0 shadow-sm border border-white">
                {React.createElement(categories.find(c => c.id === selectedCategory)?.icon || Stethoscope, { className: "w-8 h-8" })}
              </div>
              
              <div className="flex-1">
                <h3 className="text-xl font-bold text-primary-900 mb-2">
                  What does a {categories.find(c => c.id === selectedCategory)?.name} do?
                </h3>
                
                <p className="text-primary-700 leading-relaxed font-medium text-base mb-4 max-w-4xl">
                  {categories.find(c => c.id === selectedCategory)?.description}
                </p>
                
                {categories.find(c => c.id === selectedCategory)?.treats && (
                  <div className="bg-white/50 rounded-lg p-4 border border-white/50">
                    <h4 className="font-bold text-primary-800 text-sm mb-3 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-primary-500 rounded-full"></div>
                      Commonly Treats & Services:
                    </h4>
                    <ul className={`grid grid-cols-1 ${categories.find(c => c.id === selectedCategory)?.treats.length > 5 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-y-2 gap-x-4`}>
                      {categories.find(c => c.id === selectedCategory)?.treats.map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-primary-600 text-sm font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary-300 shrink-0"></span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {filteredDoctors.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredDoctors.map((doctor) => (
              <div key={doctor._id} className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-white/60 shadow-lg hover:shadow-xl transition-all group flex flex-col relative">
                <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-md px-2 py-1 rounded-lg shadow-sm border border-white flex items-center gap-1 z-20">
                  <Star className="w-3.5 h-3.5 text-yellow-500 fill-current" />
                  <span className="text-xs font-bold text-primary-800">{doctor.rating}</span>
                  <span className="text-xs text-primary-400">({doctor.reviews})</span>
                </div>

                {/* Availability Badge */}
                <div className={`absolute top-4 left-4 px-2.5 py-1 rounded-full text-[10px] font-bold z-20 flex items-center gap-1 ${
                  doctor.availability !== false
                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                    : 'bg-red-100 text-red-600 border border-red-200'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${doctor.availability !== false ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                  {doctor.availability !== false ? 'Available' : 'Unavailable'}
                </div>

                <Link to={`/doctors/${doctor._id}`} className="flex flex-col items-center text-center cursor-pointer group-hover:scale-105 transition-transform duration-300">
                  <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-primary-300 mb-4 relative z-10 shadow-md bg-white">
                    <img src={doctor.image} alt={doctor.name} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                  </div>

                  <h3 className="text-xl font-bold text-primary-800 mb-1 group-hover:text-primary-500 transition-colors">{doctor.name}</h3>
                  <p className="text-primary-500 font-bold text-sm mb-4">{doctor.speciality}</p>
                </Link>

                <div className="w-full border-t border-primary-500/10 pt-4 mb-6 space-y-2">
                  <div className="flex items-start gap-2 text-sm text-primary-600">
                    <GraduationCap className="w-4 h-4 text-primary-300 shrink-0 mt-0.5" />
                    <span className="text-left leading-tight">{doctor.degree}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-primary-600">
                    <Clock className="w-4 h-4 text-primary-300 shrink-0" />
                    <span>{doctor.experience}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-primary-600">
                    <Banknote className="w-4 h-4 text-primary-300 shrink-0" />
                    <span>Consultation: <span className="font-bold text-primary-800">{doctor.fees}</span></span>
                  </div>
                </div>

                <div className="mt-auto w-full">
                  <Link to={`/doctors/${doctor._id}`} className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-semibold transition-all bg-primary-50 text-primary-600 border border-primary-300/30 hover:bg-primary-500 hover:text-white hover:border-primary-500 shadow-sm">
                    Book Visit
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white/40 rounded-3xl border border-white/50 backdrop-blur-md">
            <p className="text-2xl text-primary-500 font-bold">No doctors found matching your criteria.</p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="mt-4 text-primary-500 hover:underline font-semibold">
              Clear Filters
            </button>
          </div>
        )}
      </section>

    </div>
  );
};

export default Doctors;
