const request = require('supertest');

// Mock de db
jest.mock('../db', () => ({
  run: jest.fn(),
  get: jest.fn(),
  all: jest.fn(),
}));

const db = require('../db');
let app;
beforeAll(() => {
  app = require('../index').app;
});

describe('Productos API', () => {
  afterEach(() => jest.clearAllMocks());

  it('POST /productos → crea un producto', async () => {
    db.run.mockImplementation(function (sql, params, cb) {
      this.lastID = 1;
      cb(null);
    });

    const res = await request(app)
      .post('/productos')
      .send({
        data: { type: 'productos', attributes: { nombre: 'Laptop', precio: 1000 } },
      })
      .set('Accept', 'application/vnd.api+json');

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toEqual({
      type: 'productos',
      id: "undefined",
      attributes: { nombre: 'Laptop', precio: 1000 },
    });
  });

  it('GET /productos/:id → obtiene producto', async () => {
    db.get.mockImplementation((sql, params, cb) =>
      cb(null, { id: 1, nombre: 'Mouse', precio: 50 })
    );

    const res = await request(app).get('/productos/1');
    expect(res.statusCode).toBe(200);
    expect(res.body.data.attributes.nombre).toBe('Mouse');
  });

  it('GET /productos/:id → 404 si no existe', async () => {
    db.get.mockImplementation((sql, params, cb) => cb(null, undefined));

    const res = await request(app).get('/productos/999');
    expect(res.statusCode).toBe(404);
    expect(res.body.errors[0].detail).toBe('Producto no encontrado');
  });

  it('PATCH /productos/:id → actualiza producto', async () => {
    db.run.mockImplementation((sql, params, cb) => cb(null));

    const res = await request(app)
      .patch('/productos/1')
      .send({
        data: { type: 'productos', attributes: { nombre: 'Teclado', precio: 80 } },
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.attributes.precio).toBe(80);
  });

  it('DELETE /productos/:id → elimina producto', async () => {
    db.run.mockImplementation((sql, params, cb) => cb(null));

    const res = await request(app).delete('/productos/1');
    expect(res.statusCode).toBe(204);
  });

  it('GET /productos → lista productos paginados', async () => {
    db.all.mockImplementation((sql, params, cb) =>
      cb(null, [
        { id: 1, nombre: 'Laptop', precio: 1000 },
        { id: 2, nombre: 'Mouse', precio: 50 },
      ])
    );
    db.get.mockImplementation((sql, params, cb) =>
      cb(null, { count: 2 })
    );

    const res = await request(app).get('/productos?page[number]=1&page[size]=2');

    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBe(2);
    expect(res.body.meta.total).toBe(2);
  });
});
