app.post('/save-progress', async (req, res) => {
  const { username, missionName, currentLevel, completed, additionalData } = req.body;

  const user = await db.query('SELECT id FROM users WHERE username = $1', [username]);
  const mission = await db.query('SELECT id FROM missions WHERE name = $1', [missionName]);

  const existing = await db.query(
    'SELECT id FROM user_progress WHERE user_id = $1 AND mission_id = $2',
    [user.rows[0].id, mission.rows[0].id]
  );

  if (existing.rows.length === 0) {
    await db.query(
      `INSERT INTO user_progress (user_id, mission_id, current_level, completed, additional_data, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [user.rows[0].id, mission.rows[0].id, currentLevel || 0, completed || false, additionalData || {}]
    );
  } else {
    await db.query(
      `UPDATE user_progress SET current_level = $1, completed = $2, additional_data = $3, updated_at = NOW()
       WHERE user_id = $4 AND mission_id = $5`,
      [currentLevel || 0, completed || false, additionalData || {}, user.rows[0].id, mission.rows[0].id]
    );
  }

  res.json({ status: 'success' });
});

