import express from 'express';
import { pool } from './db.js';
const app = express();
app.use(express.json());


const PORT = 3000;


app. get('/get-list', async (req, res) => {

  const list = await pool.query("SELECT * FROM list");
  res.status(200).json({ success: true, list: list.rows });
});



app. post('/add-list', async (req, res) => {
  const { listTitle } = req.body;

  await pool.query(
    'INSERT INTO list (title, status) VALUES ($1, $2)', 
    [listTitle, "pending"]);

  res.status(200).json({ success: true, message: 'List added successfully  ' });
});



app.post('/edit-list', async (req, res) => {
  const { listTitle, id } = req.body;

  await pool.query(
    'UPDATE list SET title = $1 WHERE title = $2',
    [listTitle, id]
  );

  res.status(200).json({ success: true, message: 'List edited successfully' });
});

app.post('/delete-list', async (req, res) => {
  const { listTitle } = req.body;

  await pool.query(
    'DELETE FROM list WHERE title = $1',
    [listTitle]
  );
  res.status(200).json({ success: true, message: 'List deleted successfully' });
});




app. get('/get-items/:id', (req, res) => {
  const listId = req.params.id;
  const filtered = item.filter(
    item => item.list_id == listId);

    if (filtered.length === 0) {
      res.status(200).json({ success: false, message: 'list not found' });
    }

  res.status(200).json({ success: true, items: filtered });
});





app. post('/add-item', async (req, res) => {
  const { list_id, description } = req.body;

  await pool.query(
    'INSERT INTO items (list_id, description, status) VALUES ($1, $2, $3)', 
    [list_id, description, "pending"]);
    res.status(200).json({ success: true, message: 'Item added successfully' });
  
});


app. post('/edit-item', async (req, res) => {
  const { description, id } = req.body; 

  await pool.query(
    'UPDATE items SET description = $1 WHERE id = $2',
    [description, id]
  );
  res.status(200).json({ success: true, message: 'Item edited successfully' });
});





app. post('/delete-item', async  (req, res) => {
  const { id } = req.body; 

  await pool.query(
    'DELETE FROM items WHERE id = $1',
    [id]
  );
  res.status(200).json({ success: true, message: 'Item deleted successfully' });
});


app.listen (PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});