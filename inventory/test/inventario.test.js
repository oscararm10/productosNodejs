const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');

// Mock de dependencias externas
jest.mock('../db', () => ({
  run: jest.fn((sql, params, cb) => cb && cb(null)),
  get: jest.fn(),
}));
jest.mock('node-fetch', () => jest.fn());

const db = require('../db');
const fetch = require('node-fetch');

// Importar la app (ajusta según tu export)
let app;
beforeAll(() => {
  app = require('../index').app; // asegúrate de exportar `app` en index.js
});

describe('Inventarios API', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('POST /inventarios → crea un inventario', async () => {
    const res = await request(app)
      .post('/inventarios')
      .send({
        data: {
          type: 'inventarios',
          attributes: { producto_id: 1, cantidad: 10 },
        },
      })
      .set('Accept', 'application/vnd.api+json');

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toEqual({
      type: 'inventarios',
      id: '1',
      attributes: { cantidad: 10 },
    });
  });

  it('GET /inventarios/:id → devuelve inventario con producto', async () => {
    db.get.mockImplementation((sql, params, cb) =>
      cb(null, { producto_id: 1, cantidad: 5 })
    );

    fetch.mockResolvedValue({
      json: () =>
        Promise.resolve({
          data: { id: '1', type: 'productos', attributes: { nombre: 'Laptop', precio: 1000 } },
        }),
    });

    const res = await request(app).get('/inventarios/1');

    expect(res.statusCode).toBe(200);
    expect(res.body.data.attributes.cantidad).toBe(5);
    expect(res.body.data.attributes.producto.attributes.nombre).toBe('Laptop');
  });

  it('POST /inventarios/:id/compra → actualiza inventario', async () => {
    db.get.mockImplementation((sql, params, cb) =>
      cb(null, { producto_id: 1, cantidad: 10 })
    );
    db.run.mockImplementation((sql, params, cb) => cb(null));

    const res = await request(app)
      .post('/inventarios/1/compra')
      .send({
        data: { type: 'inventarios', attributes: { cantidad: 3 } },
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.attributes.cantidad).toBe(7);
  });

  it('GET /inventarios/:id → 404 si no existe inventario', async () => {
    db.get.mockImplementation((sql, params, cb) => cb(null, undefined));

    const res = await request(app).get('/inventarios/999');

    expect(res.statusCode).toBe(404);
    expect(res.body.errors[0].detail).toBe('Inventario no encontrado');
  });
});
