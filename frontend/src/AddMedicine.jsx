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
    end_date: '',
    reminder_times: '',
    stock_count: '',
    unit: '',
    type: ''
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
      await axios.post(
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
        notes: '',
        start_date: '',
        end_date: '',
        reminder_times: '',
        stock_count: '',
        unit: '',
        type: ''
      });
    } catch (error) {
      setMessage('❌ Error adding medicine. Please try again.');
      console.error(error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Add New Medicine</h2>
      
      {message && (
        <div className="mb-4 p-3 bg-gray-100 rounded text-center">
          {message}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        {/* Row 1: Name */}
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

        {/* Row 2: Dosage */}
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

        {/* Row 3: Unit + Type */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 font-bold mb-2">Unit</label>
            <select
              name="unit"
              value={formData.unit || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Unit</option>
              <option value="mg">mg</option>
              <option value="ml">ml</option>
              <option value="g">g</option>
              <option value="mcg">mcg</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 font-bold mb-2">Type</label>
            <select
              name="type"
              value={formData.type || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Type</option>
              <option value="Tablet">Tablet</option>
              <option value="Capsule">Capsule</option>
              <option value="Liquid">Liquid</option>
              <option value="Cream">Cream</option>
              <option value="Injection">Injection</option>
            </select>
          </div>
        </div>

        {/* Row 4: Frequency */}
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

        {/* Row 5: Time of Day */}
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

        {/* Row 6: Notes */}
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="e.g., Take after food"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="2"
          />
        </div>

        {/* Row 7: Start Date + End Date */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
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
          <div>
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

        {/* Row 8: Reminder Times + Stock Count */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 font-bold mb-2">Reminder Times</label>
            <input
              type="text"
              name="reminder_times"
              value={formData.reminder_times}
              onChange={handleChange}
              placeholder="e.g., 08:00,14:00"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-sm text-gray-500 mt-1">24-hour format, comma separated</p>
          </div>
          <div>
            <label className="block text-gray-700 font-bold mb-2">Stock Count</label>
            <input
              type="number"
              name="stock_count"
              value={formData.stock_count}
              onChange={handleChange}
              placeholder="e.g., 30"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-sm text-gray-500 mt-1">Total quantity available</p>
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