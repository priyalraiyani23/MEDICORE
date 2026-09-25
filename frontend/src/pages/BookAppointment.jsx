import React from 'react';
import { useParams, Link } from 'react-router-dom';

const BookAppointment = () => {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-linear-to-br from-primary-50 via-primary-100 to-primary-200 font-sans pb-16 pt-8 flex flex-col items-center justify-center">
      <h1 className="text-4xl font-extrabold text-primary-900 mb-4">Appointment Page</h1>
      <p className="text-xl text-primary-600 mb-8">This page will be designed later.</p>
      
      <Link 
        to={`/doctors/${id}`} 
        className="bg-primary-700 text-white px-8 py-3 rounded-full font-bold hover:bg-primary-500 transition-colors shadow-lg"
      >
        Go Back to Profile
      </Link>
    </div>
  );
};

export default BookAppointment;
