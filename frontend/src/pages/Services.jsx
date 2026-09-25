import React from 'react';
import { Link } from 'react-router-dom';
import {
  Stethoscope, Users, Calendar, FlaskConical, Pill, Receipt,
  ArrowRight, HeartPulse, CheckCircle2
} from 'lucide-react';
import SEOHead from '../components/SEOHead';

const servicesData = [
  {
    id: 1,
    title: 'Doctor Management',
    icon: Stethoscope,
    desc: 'Manage doctor profiles, departments, schedules, consultation fees, and availability from a centralized dashboard.',
    features: ['Doctor Profiles', 'Schedule Management', 'Department Assignment']
  },
  {
    id: 2,
    title: 'Patient Management',
    icon: Users,
    desc: 'Maintain complete patient records including personal information, appointments, prescriptions, and medical history.',
    features: ['Digital Records', 'Medical History', 'Prescriptions']
  },
  {
    id: 3,
    title: 'Appointment Management',
    icon: Calendar,
    desc: 'Allow patients to book appointments online while helping doctors efficiently organize daily schedules.',
    features: ['Online Booking', 'Time Slot Management', 'Status Notifications']
  },
  {
    id: 4,
    title: 'Laboratory Management',
    icon: FlaskConical,
    desc: 'Manage laboratory tests, upload reports, organize diagnostic history, and securely store medical records.',
    features: ['Test Management', 'Digital Reports', 'Patient History']
  },
  {
    id: 5,
    title: 'Pharmacy Management',
    icon: Pill,
    desc: 'Track medicine inventory, generate prescriptions, monitor stock levels, and manage pharmacy operations.',
    features: ['Inventory Tracking', 'Prescription Generation', 'Stock Alerts']
  },
  {
    id: 6,
    title: 'Billing & Payments',
    icon: Receipt,
    desc: 'Automatically generate hospital invoices including consultation, laboratory, pharmacy, and treatment charges.',
    features: ['Automatic Billing', 'Digital Invoices', 'Payment Tracking']
  }
];

const Services = () => {
  return (
    <div className="min-h-screen bg-primary-50 font-sans overflow-x-hidden">
      <SEOHead
        title="MEDICORE Services — Doctor Management, Appointments, AI Health & More"
        description="Explore MEDICORE's comprehensive healthcare services: doctor management, patient records, online appointments, lab reports, pharmacy, AI health assistant, and billing."
        keywords="medicore services, hospital management, AI health, online appointments, pharmacy, lab reports"
        canonical="https://medicore.care/services"
      />

      {/* SECTION 1 - PAGE HEADER */}
      <section className="relative bg-primary-50 pt-10 pb-6 md:pt-14 md:pb-8 overflow-hidden">
        <div className="absolute top-0 right-0 w-full max-w-125 h-125 bg-white rounded-full blur-3xl opacity-60 -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-full max-w-125 h-125 bg-white rounded-full blur-3xl opacity-60 translate-y-1/2 -translate-x-1/3 pointer-events-none"></div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white shadow-sm text-primary-500 text-sm font-medium mb-4">
            <HeartPulse className="w-4 h-4" />
            <span>Comprehensive Healthcare Solutions</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-primary-900 mb-4 tracking-tight">
            Our Services
          </h1>
          <p className="text-base text-primary-600 leading-relaxed max-w-2xl mx-auto">
            Intelligent hospital management solutions that simplify healthcare operations and enhance patient care with AI-powered assistance.
          </p>
        </div>
      </section>

      {/* SECTION 2 - CORE SERVICES */}
      <section className="py-8 md:py-10 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {servicesData.map((service) => {
              const Icon = service.icon;
              return (
                <div key={service.id} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-primary-100 flex flex-col group">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-primary-500 group-hover:text-white transition-colors duration-300">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-primary-900 leading-tight">{service.title}</h3>
                  </div>
                  <p className="text-sm text-primary-600 leading-relaxed mb-5 grow">
                    {service.desc}
                  </p>
                  <ul className="space-y-2 mt-auto pt-4 border-t border-primary-50">
                    {service.features.map((feature, i) => (
                      <li key={i} className="flex items-center text-xs text-primary-700 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary-500 mr-2 shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>


      {/* SECTION 4 - CALL TO ACTION */}
      <section className="py-10 md:py-12 bg-primary-100 border-y border-primary-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-primary-900 mb-6 tracking-tight">
            Ready to experience smarter healthcare?
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/doctors" className="inline-flex items-center justify-center px-6 py-3 text-sm font-bold rounded-xl text-white bg-primary-500 hover:bg-primary-600 shadow-sm transition-all duration-300">
              Book Appointment <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
            <Link to="/contact" className="inline-flex items-center justify-center px-6 py-3 text-sm font-bold rounded-xl text-primary-700 bg-white hover:bg-primary-50 border border-primary-200 transition-all duration-300">
              Contact Support
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Services;
