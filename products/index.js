const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db');
const app = express();
app.use(bodyParser.json({ type: ['application/json', 'application/vnd.api+json'] }));


// Crear producto
app.post('/productos', (req, res) => {
  
  const { nombre, precio } = req.body.data.attributes;
  
  db.run("INSERT INTO productos (nombre, precio) VALUES (?, ?)", [nombre, precio], function(err) {
    if (err) return res.status(500).json({ errors: [{ detail: err.message }] });
    res.json({ data: { type: 'productos', id: String(this.lastID), attributes: { nombre, precio } } });
  });
});

// Obtener producto por id
app.get('/productos/:id', (req, res) => {
  db.get("SELECT * FROM productos WHERE id = ?", [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ errors: [{ detail: err.message }] });
    if (!row) return res.status(404).json({ errors: [{ detail: 'Producto no encontrado' }] });
    res.json({ data: { type: 'productos', id: String(row.id), attributes: { nombre: row.nombre, precio: row.precio } } });
  });
});

// Actualizar producto
app.patch('/productos/:id', (req, res) => {
  const { nombre, precio } = req.body.data.attributes;
  db.run("UPDATE productos SET nombre = ?, precio = ? WHERE id = ?", [nombre, precio, req.params.id], function(err) {
    if (err) return res.status(500).json({ errors: [{ detail: err.message }] });
    res.json({ data: { type: 'productos', id: req.params.id, attributes: { nombre, precio } } });
  });
});

// Eliminar producto
app.delete('/productos/:id', (req, res) => {
  db.run("DELETE FROM productos WHERE id = ?", [req.params.id], function(err) {
    if (err) return res.status(500).json({ errors: [{ detail: err.message }] });
    res.status(204).end();
  });
});

// Listar productos
app.get('/productos', (req, res) => {
  const page = parseInt(req.query['page[number]']) || 1;
  const size = parseInt(req.query['page[size]']) || 10;
  const offset = (page - 1) * size;

  db.all("SELECT * FROM productos LIMIT ? OFFSET ?", [size, offset], (err, rows) => {
    if (err) return res.status(500).json({ errors: [{ detail: err.message }] });
    db.get("SELECT COUNT(*) as count FROM productos", [], (err, countRow) => {
      const total = countRow.count;
      const data = rows.map(row => ({
        type: 'productos',
        id: String(row.id),
        attributes: { nombre: row.nombre, precio: row.precio }
      }));
      res.json({ data, meta: { page, size, total } });
    });
  });
});

if (require.main === module) {
  app.listen(3000, () => console.log('Products service running on port 3000'));
}

module.exports = { app };
