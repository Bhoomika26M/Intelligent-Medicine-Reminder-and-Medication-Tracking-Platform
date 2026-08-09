const pool = require('./db');

exports.getDashboardData = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Fetch active medicines from the database
    const result = await pool.query(
      'SELECT id, name, dosage FROM medicines WHERE user_id = $1',
      [userId]
    );

    // Format the data for the frontend schedule
    const schedule = result.rows.map((med, index) => {
      const times = ['08:00 AM', '01:00 PM', '08:00 PM'];
      return {
        id: med.id,
        name: med.name,
        dosage: med.dosage || 'Standard Dose',
        time: times[index % times.length], 
        status: index === 0 ? 'taken' : 'pending' // Simulating one taken pill
      };
    });

    // Calculate dynamic stats based on the DB records
    const activeMedicines = schedule.length;
    const takenToday = schedule.filter(s => s.status === 'taken').length;
    const upcomingDoses = activeMedicines - takenToday;

    res.json({
      stats: { activeMedicines, takenToday, upcomingDoses },
      schedule
    });
  } catch (err) {
    console.error("Dashboard DB Error:", err.message);
    res.status(500).send('Server Error');
  }
};