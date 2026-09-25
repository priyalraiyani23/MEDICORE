import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin, Phone, Mail, Clock, Send, X,
  Calendar, FileText, Monitor, Brain,
  ChevronDown, AlertCircle, ArrowRight, HeartPulse
} from 'lucide-react';
import SEOHead from '../components/SEOHead';

const Contact = () => {
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [activeFaq, setActiveFaq] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/contact-messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setIsSuccess(true);
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
        setTimeout(() => setIsSuccess(false), 5000);
      } else {
        setError(data.message || 'Failed to send message. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection failed. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearForm = () => {
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    setError('');
  };

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const faqs = [
    { q: "How can I book an appointment?", a: "You can easily book an appointment by navigating to the 'Doctors' section, selecting your preferred doctor, and choosing an available time slot." },
    { q: "Can I download my medical reports online?", a: "Yes, once your laboratory tests are complete, you can download your reports from the 'Medical Records' section in your patient dashboard." },
    { q: "Is my medical information secure?", a: "Absolutely. Medicore employs state-of-the-art encryption and strictly follows role-based access to ensure your health data remains 100% confidential." },
    { q: "How does Medicore AI work?", a: "Medicore AI uses advanced natural language processing to analyze symptoms and summarize medical reports, providing quick insights to assist both patients and doctors." },
    { q: "How do I contact technical support?", a: "You can reach out to our technical team by filling out the contact form on this page or by calling our dedicated support line during business hours." },
    { q: "Can hospitals request a demo of Medicore?", a: "Yes, hospital administrators can contact our sales team to schedule a comprehensive live demonstration of the Medicore platform." }
  ];

  return (
    <div className="min-h-screen bg-primary-50 font-sans overflow-x-hidden">
      <SEOHead
        title="Contact MEDICORE — Get in Touch with Our Healthcare Team"
        description="Contact MEDICORE for support, partnership enquiries, or to book an appointment. We are available 24/7. Reach us by phone, email or our online contact form."
        keywords="contact medicore, healthcare support, book appointment, medicore helpline"
        canonical="https://medicore.care/contact"
      />

      {/* SECTION 1 – PAGE HEADER */}
      <section className="relative bg-primary-50 py-4 overflow-hidden border-b border-primary-100">
        {/* Abstract shapes */}
        <div className="absolute top-0 right-0 w-full max-w-125 h-125 bg-white rounded-full blur-3xl opacity-60 -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-full max-w-125 h-125 bg-white rounded-full blur-3xl opacity-60 translate-y-1/2 -translate-x-1/3"></div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white shadow-sm text-primary-500 text-sm font-medium">
            <HeartPulse className="w-4 h-4" />
            <span>24/7 Support Available</span>
          </div>
        </div>
      </section>

      {/* SECTION 2 – CONTACT INFORMATION & SECTION 3 - SEND US A MESSAGE */}
      <section className="py-10 md:py-12 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-5 grid-cols-1 md:grid-cols-3 lg:grid-cols-5">

            {/* Contact Info Cards */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 content-start">
              {/* Card 1 */}
              <div className="bg-white p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-primary-100 flex flex-col gap-3 group">
                <div className="w-10 h-10 bg-primary-100 text-primary-500 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-primary-500 group-hover:text-white transition-colors duration-300">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-primary-900 mb-1">Address</h3>
                  <p className="text-xs text-primary-900 font-medium mb-1">Medicore Healthcare Solutions</p>
                  <p className="text-primary-600 text-xs mb-1">Surat, Gujarat<br />India</p>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-white p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-primary-100 flex flex-col gap-3 group">
                <div className="w-10 h-10 bg-primary-100 text-primary-500 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-primary-500 group-hover:text-white transition-colors duration-300">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-primary-900 mb-1">Phone</h3>
                  <p className="text-sm text-primary-500 font-bold mb-1">+91 98765 43210</p>
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-white p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-primary-100 flex flex-col gap-3 group">
                <div className="w-10 h-10 bg-primary-100 text-primary-500 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-primary-500 group-hover:text-white transition-colors duration-300">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-primary-900 mb-1">Email</h3>
                  <p className="text-xs text-primary-500 font-medium mb-1">admin@medicore.com</p>
                </div>
              </div>

              {/* Card 4 */}
              <div className="bg-white p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-primary-100 flex flex-col gap-3 group">
                <div className="w-10 h-10 bg-primary-100 text-primary-500 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-primary-500 group-hover:text-white transition-colors duration-300">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-primary-900 mb-1">Working Hours</h3>
                  <p className="text-xs text-primary-900 font-medium mb-1">Monday – Saturday</p>
                  <p className="text-xs text-primary-500 font-semibold mb-1">10:00 AM – 10:00 PM</p>
                </div>
              </div>
            </div>

            {/* Contact Form Card */}
            <div className="lg:col-span-3">
              <div className="bg-white p-5 md:p-6 rounded-2xl shadow-xl border border-primary-100 h-full relative">
                <h2 className="text-xl font-bold text-primary-900 mb-4">Send Us A Message</h2>

                {isSuccess ? (
                  <div className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center z-10 p-6 text-center animate-in fade-in duration-300">
                    <div className="w-16 h-16 bg-primary-200 text-primary-500 rounded-full flex items-center justify-center mb-4">
                      <AlertCircle className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-primary-900 mb-2">Message Sent Successfully!</h3>
                    <p className="text-sm text-primary-600">Thank you for contacting Medicore. Our support team will get back to you shortly.</p>
                  </div>
                ) : null}

                {error && (
                  <div className="mb-4 p-3.5 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    {/* Full Name */}
                    <div className="relative">
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3.5 py-2.5 border-2 border-primary-100 rounded-xl bg-primary-50 text-primary-900 text-sm focus:outline-none focus:border-primary-500 focus:bg-white transition-colors"
                        placeholder="Full Name"
                      />
                    </div>

                    {/* Phone Number */}
                    <div className="relative">
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3.5 py-2.5 border-2 border-primary-100 rounded-xl bg-primary-50 text-primary-900 text-sm focus:outline-none focus:border-primary-500 focus:bg-white transition-colors"
                        placeholder="Phone Number"
                      />
                    </div>
                  </div>

                  {/* Email Address */}
                  <div className="relative">
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3.5 py-2.5 border-2 border-primary-100 rounded-xl bg-primary-50 text-primary-900 text-sm focus:outline-none focus:border-primary-500 focus:bg-white transition-colors"
                      placeholder="Email Address"
                    />
                  </div>

                  {/* Subject */}
                  <div className="relative">
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3.5 py-2.5 border-2 border-primary-100 rounded-xl bg-primary-50 text-primary-900 text-sm focus:outline-none focus:border-primary-500 focus:bg-white transition-colors"
                      placeholder="Subject"
                    />
                  </div>

                  {/* Message */}
                  <div className="relative">
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows="3"
                      className="w-full px-3.5 py-2.5 border-2 border-primary-100 rounded-xl bg-primary-50 text-primary-900 text-sm focus:outline-none focus:border-primary-500 focus:bg-white transition-colors resize-none"
                      placeholder="Message"
                    ></textarea>
                  </div>

                  {/* Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-1">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 bg-primary-500 hover:bg-primary-700 text-white py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" /> Send Message
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={clearForm}
                      disabled={isSubmitting}
                      className="sm:w-28 bg-primary-100 hover:bg-primary-200 text-primary-700 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      <X className="w-3.5 h-3.5" /> Clear
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* SECTION 5 – FREQUENTLY ASKED QUESTIONS */}
      <section className="py-10 md:py-12 bg-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12 items-start">
            <div className="lg:col-span-1 text-left lg:order-2">
              <h2 className="text-2xl md:text-3xl font-bold text-primary-900 mb-3 tracking-tight">Frequently Asked Questions</h2>
              <p className="text-primary-600 text-sm md:text-base">Find quick answers to common queries about using Medicore.</p>
            </div>

            <div className="lg:col-span-2 space-y-3 lg:order-1">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className={`bg-white border rounded-xl overflow-hidden transition-all duration-300 ${activeFaq === index ? 'border-primary-500 shadow-md' : 'border-primary-200 shadow-sm'}`}
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full flex items-center justify-between p-4 md:p-5 text-left focus:outline-none"
                  >
                    <span className={`font-bold text-sm md:text-base pr-4 ${activeFaq === index ? 'text-primary-500' : 'text-primary-900'}`}>
                      {faq.q}
                    </span>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors ${activeFaq === index ? 'bg-primary-100 text-primary-500' : 'bg-primary-100 text-primary-400'}`}>
                      <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${activeFaq === index ? 'rotate-180' : ''}`} />
                    </div>
                  </button>

                  <div
                    className={`px-4 md:px-5 overflow-hidden transition-all duration-300 ease-in-out ${activeFaq === index ? 'max-h-48 pb-4 md:pb-5 opacity-100' : 'max-h-0 opacity-0'}`}
                  >
                    <p className="text-primary-600 text-sm leading-relaxed pt-3 border-t border-primary-100">
                      {faq.a}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>



      {/* SECTION 7 – EMERGENCY CONTACT */}
      <section className="py-10 md:py-12 bg-primary-100 border-y border-primary-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-md border border-primary-200">
            <AlertCircle className="w-8 h-8 text-primary-500" />
          </div>
          <h2 className="text-2xl font-bold text-primary-900 mb-4 tracking-tight">Need Immediate Assistance?</h2>
          <p className="text-base text-primary-700 mb-8 leading-relaxed">
            For medical emergencies, please contact your nearest hospital or emergency healthcare services immediately. Medicore's AI tools provide informational support only and are not a substitute for professional medical care.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="tel:108" className="inline-flex items-center justify-center px-6 py-3 text-base font-bold rounded-xl text-white bg-primary-500 hover:bg-primary-500 shadow-lg shadow-primary-500/30 hover:-translate-y-1 transition-all duration-300">
              <Phone className="w-5 h-5 mr-2" /> Call Emergency
            </a>
            <Link to="/doctors" className="inline-flex items-center justify-center px-6 py-3 text-base font-bold rounded-xl text-primary-700 bg-white hover:bg-primary-50 border border-primary-200 transition-all duration-300">
              Book Appointment
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Contact;
