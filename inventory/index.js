const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const db = require('./db');
const app = express();
app.use(bodyParser.json({ type: ['application/json', 'application/vnd.api+json'] }));

/**
 * @openapi
 * /inventarios/{producto_id}:
 *   Post:
 *     summary: Crear inventario de un producto
 *     parameters:
 *       - name: producto_id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Cantidad disponible y datos del producto
 */
app.post('/inventarios', (req, res) => {
  const { producto_id, cantidad } = req.body.data.attributes;
  db.run("INSERT INTO inventarios (producto_id, cantidad) VALUES (?, ?)", [producto_id, cantidad], function(err) {
    if (err) return res.status(500).json({ errors: [{ detail: err.message }] });
    res.json({ data: { type: 'inventarios', id: String(producto_id), attributes: { cantidad } } });
  });
});

/**
 * @openapi
 * /inventarios/{producto_id}:
 *   get:
 *     summary: Consultar inventario de un producto
 *     parameters:
 *       - name: producto_id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Cantidad disponible y datos del producto
 */
app.get('/inventarios/:producto_id', async (req, res) => {
  const producto_id = req.params.producto_id;
  
  db.get("SELECT * FROM inventarios WHERE producto_id = ?", [producto_id], async (err, row) => {
    if (err) return res.status(500).json({ errors: [{ detail: err.message }] });
    if (!row) return res.status(404).json({ errors: [{ detail: 'Inventario no encontrado' }] });

    const resp = await fetch(`http://localhost:3000/productos/${producto_id}`, { headers: { Accept: 'application/json' }});
    
    const producto = await resp.json();

    res.json({
      data: {
        type: 'inventarios',
        id: String(producto_id),
        attributes: {
          cantidad: row.cantidad,
          producto: producto.data
        }
      }
    });
  });
});

/**
 * @openapi
 * /inventarios/{producto_id}:
 *   post:
 *     summary: Actualizar el inventario de un producto
 *     parameters:
 *       - name: producto_id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Cantidad disponible y datos del producto
 */
app.post('/inventarios/:producto_id/compra', (req, res) => {
  const producto_id = req.params.producto_id;
  const { cantidad } = req.body.data.attributes;

  db.get("SELECT * FROM inventarios WHERE producto_id = ?", [producto_id], (err, row) => {
    if (!row) return res.status(404).json({ errors: [{ detail: 'Inventario no encontrado' }] });
    const nuevaCantidad = row.cantidad - cantidad;
    db.run("UPDATE inventarios SET cantidad = ? WHERE producto_id = ?", [nuevaCantidad, producto_id], function(err) {
      if (err) return res.status(500).json({ errors: [{ detail: err.message }] });
      console.log(`INVENTARIO_CHANGE producto_id=${producto_id} cantidad=${nuevaCantidad}`);
      res.json({ data: { type: 'inventarios', id: String(producto_id), attributes: { cantidad: nuevaCantidad } } });
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
      { url: 'http://localhost:3001' }
    ],
  },
  apis: ['./index.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


if (require.main === module) {
  app.listen(3001, () => console.log('Inventory service running on port 3001'));
}

module.exports = { app };
