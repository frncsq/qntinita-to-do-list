import express from 'express';
import session from 'express-session';
import { pool } from './db.js';
import { hashPassword, comparePassword } from './components/hash.js';


const app = express();
app.use(express.json());
app.use(session({
  secret: '1234567890', 
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } 
}));


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



app.post('/register', async (req, res) => {
  const {username, password, confirm, name } = req.body;
  if(password === confirm ){
    try {
      const hashedPassword = await hashPassword(password);
      await pool.query(
       "INSERT INTO user_accounts (username, password, name) VALUES ($1, $2, $3)", [username, hashedPassword, name]
      );
      res.status(200).json({ success: true, message: "Registered successfully"});
    } catch (error) {
      res.status(500).json({ success: false, message: "Error registering user" });
    }
  } else {
    res.status(401).json({ success: false, message: "Handa agparis"});
  
}
});
app.post('/login', async (req, res) => {
  const { username, name, password } = req.body;
  try {
    const result = await pool.query(
      "SELECT * FROM user_accounts WHERE name = $1", [name]
    );
    if (result.rows.length > 0) {
      const user = result.rows[0];
      const isPasswordValid = await comparePassword(password, user.password);
      if (isPasswordValid) {
        req.session.userId = user.id;
        req.session.name = user.name;
        res.status(200).json({ success: true, message: "Login successfully" });
      } else {
        res.status(401).json({ success: false, message: "Invalid username or password" });
      }
    } else {
      res.status(401).json({ success: false, message: "Invalid username or password" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Error logging in" });
  }
});

app.get('/get-session', (req, res) => {
  if (req.session.userId) {
    res.status(200).json({
      session: true,
      userId: req.session.userId,
      name: req.session.name
    });
  } else {
    res.status(200).json({ session: false });
  }
});

app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({ success: false, message: "Error logging out" });
    } else {
      res.status(200).json({ success: true, message: "Logged out successfully" });
    }
  });
}); 
app.listen (PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});













