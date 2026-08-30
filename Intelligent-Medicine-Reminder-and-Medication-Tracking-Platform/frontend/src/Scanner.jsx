import { useState } from 'react';
import axios from 'axios';
import { Camera, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Tesseract from 'tesseract.js';

function Scanner() {
  const navigate = useNavigate();
  
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
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

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setError('');
    setImage(URL.createObjectURL(file));

    try {
      const result = await Tesseract.recognize(file, 'eng', {
        logger: (m) => console.log(m)
      });

      const text = result.data.text;
      const lines = text.split('\n').filter(l => l.trim());

      let medicineName = '';
      let dosage = '';
      let frequency = '';

      for (let line of lines) {
        const clean = line.trim();
        if (clean.match(/patient|name|date|dr\.|doctor|clinic|hospital/i)) continue;
        if (clean.match(/^\d{1,2}\/\d{1,2}\/\d{2,4}$/)) continue;
        if (clean.match(/\d+\s*(mg|ml|g|mcg)/i)) {
          dosage = clean;
          continue;
        }
        if (clean.match(/day|daily|once|twice|thrice|week|month/i)) {
          frequency = clean;
          continue;
        }
        if (clean.split(' ').length <= 4 && clean.length > 2 && !medicineName) {
          medicineName = clean;
        }
      }

      if (!medicineName && lines.length > 0) {
        medicineName = lines[0].trim();
      }

      setFormData(prev => ({
        ...prev,
        name: medicineName || prev.name,
        dosage: dosage || prev.dosage,
        frequency: frequency || prev.frequency,
        notes: text.slice(0, 300) || prev.notes
      }));

    } catch (err) {
      setError('Could not read text. Please enter details manually.');
      console.error(err);
    }
    setLoading(false);
  };

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
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setMessage('✅ Medicine added successfully!');
      setFormData({
        name: '', dosage: '', frequency: '', time_of_day: '',
        notes: '', start_date: '', end_date: '', reminder_times: '', stock_count: '',
        unit: '', type: ''
      });
      setTimeout(() => navigate('/medicines'), 1500);
    } catch (error) {
      setMessage('❌ Error adding medicine. Please try again.');
      console.error(error);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">📸 Scan Prescription</h1>

      <div className="bg-white rounded-xl shadow p-6">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleImageUpload}
            className="hidden"
            id="scanner-input"
          />
          <label htmlFor="scanner-input" className="cursor-pointer block">
            {image ? (
              <img src={image} alt="Prescription" className="max-h-64 mx-auto rounded" />
            ) : (
              <div className="py-8">
                <Camera size={48} className="mx-auto text-gray-400" />
                <p className="text-gray-500 mt-2">Tap to take photo or upload</p>
                <p className="text-sm text-gray-400">(JPG, PNG)</p>
              </div>
            )}
          </label>
        </div>

        {loading && (
          <div className="flex items-center justify-center gap-2 mt-4 text-blue-500">
            <Loader2 className="animate-spin" size={20} />
            <span>AI reading prescription...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mt-4">{error}</div>
        )}

        {message && (
          <div className="bg-green-100 text-green-700 p-3 rounded mt-4">{message}</div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Medicine Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Dosage *</label>
              <input
                type="text"
                name="dosage"
                value={formData.dosage}
                onChange={handleChange}
                placeholder="e.g., 500mg"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Unit</label>
              <select
                name="unit"
                value={formData.unit || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Unit</option>
                <option value="mg">mg</option>
                <option value="ml">ml</option>
                <option value="g">g</option>
                <option value="mcg">mcg</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                name="type"
                value={formData.type || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Frequency *</label>
              <input
                type="text"
                name="frequency"
                value={formData.frequency}
                onChange={handleChange}
                placeholder="e.g., Twice a day"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Time of Day *</label>
              <input
                type="text"
                name="time_of_day"
                value={formData.time_of_day}
                onChange={handleChange}
                placeholder="e.g., Morning, Night"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="e.g., Take after food"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              rows="2"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Date</label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Reminder Times</label>
              <input
                type="text"
                name="reminder_times"
                value={formData.reminder_times}
                onChange={handleChange}
                placeholder="e.g., 08:00,14:00"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Stock Count</label>
              <input
                type="number"
                name="stock_count"
                value={formData.stock_count}
                onChange={handleChange}
                placeholder="e.g., 30"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
          >
            💊 Add Medicine
          </button>
        </form>
      </div>
    </div>
  );
}

export default Scanner;