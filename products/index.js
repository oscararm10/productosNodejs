const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db');
const app = express();
app.use(bodyParser.json({ type: ['application/json', 'application/vnd.api+json'] }));

/**
 * @openapi
 * /productos:
 *   post:
 *     summary: Crear un nuevo producto
 *     requestBody:
 *       required: true
 *       content:
 *         application/vnd.api+json:
 *           schema:
 *             type: object
 *             properties:
 *               data:
 *                 type: object
 *                 properties:
 *                   type:
 *                     type: string
 *                     example: productos
 *                   attributes:
 *                     type: object
 *                     properties:
 *                       nombre:
 *                         type: string
 *                         example: Café
 *                       precio:
 *                         type: number
 *                         example: 10.5
 *     responses:
 *       200:
 *         description: Producto creado exitosamente
 */
app.post('/productos', (req, res) => {
  
  const { nombre, precio } = req.body.data.attributes;
  
  db.run("INSERT INTO productos (nombre, precio) VALUES (?, ?)", [nombre, precio], function(err) {
    if (err) return res.status(500).json({ errors: [{ detail: err.message }] });
    res.json({ data: { type: 'productos', id: String(this.lastID), attributes: { nombre, precio } } });
  });
});

/**
 * @openapi
 * /productos/:id:
 *   post:
 *     summary: Obtener un producto por id
 *     requestBody:
 *       required: false
 *       content:
 *         application/vnd.api+json:
 *           schema:
 *             type: object
 *             properties:
 *               data:
 *                 type: object
 *                 properties:
 *                   type:
 *                     type: string
 *                     example: productos
 *                   attributes:
 *                     type: object
 *                     properties:
 *                       nombre:
 *                         type: string
 *                         example: Café
 *                       precio:
 *                         type: number
 *                         example: 10.5
 *     responses:
 *       200:
 *         description: Ok
 */
app.get('/productos/:id', (req, res) => {
  db.get("SELECT * FROM productos WHERE id = ?", [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ errors: [{ detail: err.message }] });
    if (!row) return res.status(404).json({ errors: [{ detail: 'Producto no encontrado' }] });
    res.json({ data: { type: 'productos', id: String(row.id), attributes: { nombre: row.nombre, precio: row.precio } } });
  });
});

/**
 * @openapi
 * /productos/:id:
 *   patch:
 *     summary: Actualizar un producto
 *     requestBody:
 *       required: true
 *       content:
 *         application/vnd.api+json:
 *           schema:
 *             type: object
 *             properties:
 *               data:
 *                 type: object
 *                 properties:
 *                   type:
 *                     type: string
 *                     example: productos
 *                   attributes:
 *                     type: object
 *                     properties:
 *                       nombre:
 *                         type: string
 *                         example: Café
 *                       precio:
 *                         type: number
 *                         example: 10.5
 *     responses:
 *       200:
 *         description: Producto actualizado exitosamente
 */
app.patch('/productos/:id', (req, res) => {
  const { nombre, precio } = req.body.data.attributes;
  db.run("UPDATE productos SET nombre = ?, precio = ? WHERE id = ?", [nombre, precio, req.params.id], function(err) {
    if (err) return res.status(500).json({ errors: [{ detail: err.message }] });
    res.json({ data: { type: 'productos', id: req.params.id, attributes: { nombre, precio } } });
  });
});

/**
 * @openapi
 * /productos/:id:
 *   delete:
 *     summary: eliminar un producto
 *     requestBody:
 *       required: false
 *       content:
 *         application/vnd.api+json:
 *           schema:
 *             type: object
 *             properties:
 *               data:
 *                 type: object
 *                 properties:
 *                   type:
 *                     type: string
 *                     example: productos
 *                   attributes:
 *                     type: object
 *                     properties:
 *                       nombre:
 *                         type: string
 *                         example: Café
 *                       precio:
 *                         type: number
 *                         example: 10.5
 *     responses:
 *       200:
 *         description: Producto eliminado exitosamente
 */
app.delete('/productos/:id', (req, res) => {
  db.run("DELETE FROM productos WHERE id = ?", [req.params.id], function(err) {
    if (err) return res.status(500).json({ errors: [{ detail: err.message }] });
    res.status(204).end();
  });
});

/**
 * @openapi
 * /productos:
 *   get:
 *     summary: Obtener un producto por id
 *     requestBody:
 *       required: false
 *       content:
 *         application/vnd.api+json:
 *           schema:
 *             type: object
 *             properties:
 *               data:
 *                 type: object
 *                 properties:
 *                   type:
 *                     type: string
 *                     example: productos
 *                   attributes:
 *                     type: object
 *                     properties:
 *                       nombre:
 *                         type: string
 *                         example: Café
 *                       precio:
 *                         type: number
 *                         example: 10.5
 *     responses:
 *       200:
 *         description: Ok
 */
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


// Documentacion Swagger
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Products API',
      version: '1.0.0',
      description: 'API de productos con JSON:API',
    },
    servers: [
      { url: 'http://localhost:3000' }
    ],
  },
  apis: ['./index.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


if (require.main === module) {
  app.listen(3000, () => console.log('Products service running on port 3000'));
}

module.exports = { app };
