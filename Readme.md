# Intrucciones de instalación y ejecucion

# 1. Clonar repositorio
git clone [<REPO_URL>](https://github.com/oscararm10/productosNodejs.git)

cd productosNodejs

# 2. Ejecutar servicio

Ejecutar en los dos servicio el siguiente comando para instalar dependencias

```bash
$ npm install
```
Una vez finalizafo ejecutar el siguiente comando

```bash
$ npm run start
```

## Esto levantará:

- products-service en http://localhost:3000
- inventory-service en http://localhost:3001

# 3. Endpoints principales

## Microservicio Productos

- POST /productos → Crear producto

```
Body:
{
  "data": {
    "type": "productos",
    "attributes": {
      "nombre": "Producto Prueba",
      "precio": 13
    }
  }
}
```

- GET /productos/:id → Obtener producto por ID

- PATCH /productos/:id → Actualizar producto
```
Body:
{
  "data": {
    "type": "productos",
    "attributes": {
      "nombre": "Producto Prueba",
      "precio": 16
    }
  }
}
```
- DELETE /productos/:id → Eliminar producto

- GET /productos?page[number]=1&page[size]=10 → Listar productos con paginación

## Microservicio Inventario

- POST /inventarios → Crear inventario para un producto

```
Boby:
{
  "data": {
    "type": "inventarios",
    "attributes": {
      "producto_id": 1,
      "cantidad": 100
    }
  }
}
```

- GET /inventarios/:producto_id → Consultar inventario (incluye datos del producto desde Products Service)

- POST /inventarios/:producto_id/compra → Actualizar inventario tras una compra (emite evento en consola)

```
Body:
{
  "data": {
    "attributes": {
      "cantidad": 2
    }
  }
}
```

# Swagger

- Products: http://localhost:3000/docs
- Inventory: http://localhost:3001/docs

# Arquitectura

Node.js + Express como framework base.
SQLite como base de datos ligera y embebida (ideal para pruebas rápidas y ambientes sin necesidad de instalar un servidor de DB externo).
JSON:API para estandarizar las respuestas de los microservicios.
Docker para containerizar y aislar cada microservicio.
Comunicación síncrona entre Inventario y Productos vía HTTP.

# Flujo básico

Products Service gestiona CRUD de productos.
Inventory Service consulta a Products Service para enriquecer la información.
Inventario actualiza cantidades y emite un evento simple (log en consola).

# Decisiones técnicas

Node.js + Express: por simplicidad, rapidez en el desarrollo y comunidad amplia.
Base de datos SQLite: elegida por ser ligera, sin dependencias externas y adecuada para ambientes de prueba o demos. Para producción, se recomienda migrar a PostgreSQL o MySQL por robustez.
JSON:API: asegura consistencia en la estructura de las respuestas.
Docker Compose: permite levantar múltiples servicios de manera aislada y reproducible.

# Diagrama de interacción entre servicios

sequenceDiagram
    participant Cliente
    participant Productos
    participant Inventario

    Cliente->>Productos: POST /productos (crear producto)
    Productos-->>Cliente: JSON:API respuesta

    Cliente->>Inventario: GET /inventarios/:producto_id
    Inventario->>Productos: GET /productos/:id
    Productos-->>Inventario: Detalles del producto
    Inventario-->>Cliente: Cantidad + Detalles del producto

    Cliente->>Inventario: POST /inventarios/:producto_id/compra
    Inventario->>Productos: GET /productos/:id
    Productos-->>Inventario: Detalles del producto
    Inventario-->>Cliente: JSON:API con cantidad actualizada
    Note right of Inventario: Emite evento INVENTARIO_CHANGE en consola

# Recursos adicionales

- JSON:API Spec
- Express Docs
- SQLite Docs
- Docker Docs