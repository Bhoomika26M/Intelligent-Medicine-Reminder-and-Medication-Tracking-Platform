import { useState } from 'react';
import axios from 'axios';

function AddMedicine() {
  const [formData, setFormData] = useState({
  name: '',
  dosage: '',
  frequency: '',
  time_of_day: '',
  notes: '',
  start_date: '',
  end_date: ''
});
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const token = localStorage.getItem('token');
    
    try {
      const response = await axios.post(
        'http://127.0.0.1:5000/medicines',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      setMessage('✅ Medicine added successfully!');
      setFormData({
        name: '',
        dosage: '',
        frequency: '',
        time_of_day: '',
        notes: ''
      });
    } catch (error) {
      setMessage('❌ Error adding medicine. Please try again.');
      console.error(error);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Add New Medicine</h2>
      
      {message && (
        <div className="mb-4 p-3 bg-gray-100 rounded text-center">
          {message}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Medicine Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Dosage *</label>
          <input
            type="text"
            name="dosage"
            value={formData.dosage}
            onChange={handleChange}
            placeholder="e.g., 500mg"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Frequency *</label>
          <input
            type="text"
            name="frequency"
            value={formData.frequency}
            onChange={handleChange}
            placeholder="e.g., Twice a day"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Time of Day *</label>
          <input
            type="text"
            name="time_of_day"
            value={formData.time_of_day}
            onChange={handleChange}
            placeholder="e.g., Morning, Night"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="e.g., Take after food"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="3"
          />
          <div className="mb-4">
  <label className="block text-gray-700 font-bold mb-2">Start Date</label>
  <input
    type="date"
    name="start_date"
    value={formData.start_date || ''}
    onChange={handleChange}
    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
  <p className="text-sm text-gray-500 mt-1">Leave empty to start today</p>
</div>

<div className="mb-4">
  <label className="block text-gray-700 font-bold mb-2">End Date</label>
  <input
    type="date"
    name="end_date"
    value={formData.end_date || ''}
    onChange={handleChange}
    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
  <p className="text-sm text-gray-500 mt-1">Leave empty for no end date</p>
</div>
        </div>
        
        <button
          type="submit"
          className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition"
        >
          Add Medicine
        </button>
      </form>
    </div>
  );
}

export default AddMedicine;