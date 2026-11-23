
const db = require('../config/db');

const settingsModel = {
  // Get settings and hospital locations
  get: async () => {
    const [settingsRows] = await db.query(
      'SELECT * FROM settings WHERE id = 1 LIMIT 1'
    );

    const [contacts] = await db.query(
      `SELECT
        id,
        location_name,
        email,
        phone,
        alt_phone,
        address,
        location_url,
        sort_order
       FROM hospital_contacts
       ORDER BY sort_order ASC, id ASC`
    );

    return {
      ...(settingsRows[0] || {}),
      contacts,
    };
  },

  // Get existing logo
  getLogo: async () => {
    const [rows] = await db.query(
      'SELECT logo FROM settings WHERE id = 1 LIMIT 1'
    );

    return rows[0]?.logo || null;
  },

  getLogo2: async () => {
  const [rows] = await db.query(
    "SELECT logo2 FROM settings WHERE id = 1 LIMIT 1"
  );

  return rows[0]?.logo2 || null;
},

  // Update settings and contacts together
  update: async (data, contacts) => {
    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      // Update main settings
      const columns = Object.keys(data);
      const values = columns.map((column) => data[column]);

      await connection.query(
        `INSERT INTO settings (id, ${columns.join(', ')})
         VALUES (1, ${columns.map(() => '?').join(', ')})
         ON DUPLICATE KEY UPDATE
         ${columns.map((column) => `${column} = VALUES(${column})`).join(', ')}`,
        values
      );

      // Replace hospital locations
      await connection.query('DELETE FROM hospital_contacts');

      for (let i = 0; i < contacts.length; i++) {
        const item = contacts[i];

        await connection.query(
          `INSERT INTO hospital_contacts (
            location_name,
            email,
            phone,
            alt_phone,
            address,
            location_url,
            sort_order
          ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            item.location_name,
            item.email || null,
            item.phone || null,
            item.alt_phone || null,
            item.address || null,
            item.location_url || null,
            i,
          ]
        );
      }
      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },
};
module.exports = settingsModel;
