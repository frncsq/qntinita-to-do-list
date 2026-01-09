import express from 'express';

const app = express();
app.use(express.json());
const PORT = 3000;

const list = [
  {
    id: 1,
    title: "Assignments",
    status: "pending"
  },
  {
    id: 2,
    title: "Daily chores",
    status: "pending"
  }
]

const item =[
  {
    id: 1,
    description: "Programming",
    status: "pending"
  },
  {
    id: 2,
    list_id: 1,
    description: "Web dev",  
    status: "pending"
  },
  {
    id: 3,
    list_id: 2,
    description: "Wash Dish",
    status: "pending"
  },
  {
    id: 4,
    list_id: 2,
    description: "Clean Room",
    status: "pending" 
  }
]


app. get('/', (req, res) => {
  res.send('Hello from your express app!');
});

app. get('/get-list', (req, res) => {
  res.status(200).json({ success: true, list });
});



app. post('/add-list', (req, res) => {
  const {listTitle} = req.body;

 list.push({
    id: list.length + 1,
    title: listTitle,
    status: "pending"
  }); 

  res.status(200).json({ success: true, list, message: 'Title Successfully added  ' });
});



app. get('/edit-list', (req, res) => {
  res.send('Welcome to edit list!');
});




app. get('/delete-list', (req, res) => {
  res.send('Welcome to delete list!');
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





app. get('/add-item', (req, res) => {
  res.send('Welcome to add item!');
});





app. get('/edit-item', (req, res) => {
  res.send('Welcome to edit item!');
});





app. get('/delete-item', (req, res) => {
  res.send('Welcome to delete item!');
});


app.listen (PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});