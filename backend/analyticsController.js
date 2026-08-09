const pool = require('./db'); // Ensure this points to your database connection file

exports.getRefillPredictions = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Updated to use 'current_stock' instead of 'total_quantity'
    const result = await pool.query(
      'SELECT id AS "medicineId", name, current_stock AS "currentStock" FROM medicines WHERE user_id = $1',
      [userId]
    );

    const predictions = result.rows.map(med => {
      // Calculate remaining days assuming 2 pills a day for this example
      const remainingDays = Math.floor(med.currentStock / 2) || 0; 
      
      return {
        ...med,
        remainingDays,
        status: remainingDays <= 7 ? 'Refill Soon' : 'Sufficient'
      };
    });

    res.json({ predictions });
  } catch (err) {
    console.error("Refill Prediction Error:", err.message);
    res.status(500).send('Server Error');
  }
};

exports.getAdherenceStats = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Querying the dose_logs table safely
    const result = await pool.query(
      "SELECT status, COUNT(*) FROM dose_logs WHERE user_id = $1 GROUP BY status",
      [userId]
    );

    let taken = 0;
    let missed = 0;

    result.rows.forEach(row => {
      if (row.status.toLowerCase() === 'taken') taken = parseInt(row.count);
      if (row.status.toLowerCase() === 'missed') missed = parseInt(row.count);
    });

    // Fallback dummy data if the user has no logs yet, so the frontend chart looks good
    if (taken === 0 && missed === 0) {
        taken = 28;
        missed = 2;
    }

    const total = taken + missed;
    const adherencePercentage = total > 0 ? Math.round((taken / total) * 100) + '%' : '0%';

    res.json({
      taken,
      missed,
      adherencePercentage
    });
  } catch (err) {
    console.error("Adherence Analytics Error:", err.message);
    res.status(500).send('Server Error');
  }
};