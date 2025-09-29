const http = require('http');
const fs = require('fs');
const path = require('path');
const itemDb_path = path.join(__dirname, 'items.json');

http
  .createServer((req, res) => {
    if (req.method === 'POST' && req.url === '/item') {
      createItem(req, res);
    } else if (req.method === 'GET' && req.url === '/items') {
      getItems(req, res);
    } else if (req.method === 'GET' && req.url.split('/item/')[1]) {
      let id = parseInt(req.url.split('/item/')[1]);
      getOneItem(req, res, id);
    } else if (req.method === 'PUT' && req.url === '/item') {
      updateItem(req, res);
    } else if (req.method === 'DELETE' && req.url.split('/item/')[1]) {
      let id = parseInt(req.url.split('/item/')[1]);
      console.log(id);
      deleteItem(req, res, id);
    }
  })
  .listen(3000, () => {
    console.log('Server running at localhost:3000/');
  });

//create new item
const createItem = function (req, res) {
  const itemsDb = JSON.parse(fs.readFileSync(itemDb_path, 'utf-8'));
  const body = [];

  req.on('data', (chunk) => {
    body.push(chunk);
  });

  req.on('end', () => {
    const data = Buffer.concat(body).toString();
    const newItem = JSON.parse(data);

    //generate id for new item
    const lastItem = itemsDb[itemsDb.length - 1];

    const lstItemId = lastItem.id;
    newItem.id = lstItemId + 1;

    // add new item to db
    itemsDb.push(newItem);
    fs.writeFile(itemDb_path, JSON.stringify(itemsDb), (err) => {
      if (err) {
        console.log(err);
        res.writeHead(500);
        res.end(
          JSON.stringify({
            message: 'Error adding item',
          })
        );
      }

      res.end('Item added successfully');
    });
  });
};

// get all items
const getItems = function (req, res) {
  fs.readFile(itemDb_path, 'utf8', (err, items) => {
    if (err) {
      console.log(err);
      res.writeHead(400);
      res.end('An error occured');
    }

    res.end(items);
  });
};

// get one item
const getOneItem = function (req, res, id) {
  const itemsDb = JSON.parse(fs.readFileSync(itemDb_path, 'utf-8'));

  if (!id) {
    res.writeHead(400);
    res.end(
      JSON.stringify({
        message: 'Item id is required',
      })
    );
    return;
  }

  const item = itemsDb.filter((item) => item.id === parseInt(id));

  if (!item) {
    res.writeHead(404);
    res.end(
      JSON.stringify({
        message: 'Item not found',
      })
    );
    return;
  }

  res.end(JSON.stringify(item));
};

// update item
const updateItem = function (req, res) {
  const itemsDb = JSON.parse(fs.readFileSync(itemDb_path, 'utf-8'));
  const body = [];

  req.on('data', (chunk) => {
    body.push(chunk);
  });

  req.on('end', () => {
    const data = Buffer.concat(body).toString();
    const newItem = JSON.parse(data);

    const findItem = itemsDb.findIndex((item) => {
      return item.id === newItem.id;
    });

    if (findItem === -1) {
      res.writeHead(404);
      res.end(
        JSON.stringify({
          message: 'Book not found',
        })
      );
      return;
    }

    // update the book in the database
    itemsDb[findItem] = { ...itemsDb[findItem], ...newItem };

    // save to db
    fs.writeFile(itemDb_path, JSON.stringify(itemsDb), (err) => {
      if (err) {
        console.log(err);
        res.writeHead(500);
        res.end(
          JSON.stringify({
            message: 'Error updating book in database',
          })
        );
      }

      res.end('Item updated successfully');
    });
  });
};

// delete item
const deleteItem = function (req, res, id) {
  const itemsDb = JSON.parse(fs.readFileSync(itemDb_path, 'utf-8'));

  if (!id) {
    res.writeHead(400);
    res.end(
      JSON.stringify({
        message: 'Item id is required',
      })
    );
    return;
  }

  const item = itemsDb.filter((item) => item.id !== parseInt(id));

  fs.writeFile(itemDb_path, JSON.stringify(item), (err) => {
    if (err) {
      console.log(err);
      res.writeHead(500);
      res.end(
        JSON.stringify({
          message: 'Error deleting item from database',
        })
      );
    }

    res.end('Item deleted successfully');
  });
};
