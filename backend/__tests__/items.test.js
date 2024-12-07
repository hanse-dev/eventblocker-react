const request = require('supertest');
const { app, prisma } = require('../server');

describe('Items API', () => {
  let testItem;

  beforeEach(async () => {
    // Create a test item before each test
    testItem = await prisma.example.create({
      data: {
        title: 'Test Item',
        content: 'Test Content',
      },
    });
  });

  describe('GET /api/items', () => {
    it('should return all items', async () => {
      const response = await request(app).get('/api/items');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBe(1);
      expect(response.body[0].title).toBe('Test Item');
    });
  });

  describe('GET /api/items/:id', () => {
    it('should return a single item', async () => {
      const response = await request(app).get(`/api/items/${testItem.id}`);
      expect(response.status).toBe(200);
      expect(response.body.title).toBe('Test Item');
      expect(response.body.content).toBe('Test Content');
    });

    it('should return 404 for non-existent item', async () => {
      const response = await request(app).get('/api/items/999');
      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/items', () => {
    it('should create a new item', async () => {
      const newItem = {
        title: 'New Item',
        content: 'New Content',
      };

      const response = await request(app)
        .post('/api/items')
        .send(newItem);

      expect(response.status).toBe(200);
      expect(response.body.title).toBe(newItem.title);
      expect(response.body.content).toBe(newItem.content);
    });

    it('should fail if title is missing', async () => {
      const response = await request(app)
        .post('/api/items')
        .send({ content: 'New Content' });

      expect(response.status).toBe(500);
    });
  });

  describe('PUT /api/items/:id', () => {
    it('should update an existing item', async () => {
      const updatedData = {
        title: 'Updated Title',
        content: 'Updated Content',
      };

      const response = await request(app)
        .put(`/api/items/${testItem.id}`)
        .send(updatedData);

      expect(response.status).toBe(200);
      expect(response.body.title).toBe(updatedData.title);
      expect(response.body.content).toBe(updatedData.content);
    });

    it('should return 404 for non-existent item', async () => {
      const response = await request(app)
        .put('/api/items/999')
        .send({ title: 'Updated Title', content: 'Updated Content' });

      expect(response.status).toBe(500);
    });
  });

  describe('DELETE /api/items/:id', () => {
    it('should delete an existing item', async () => {
      const response = await request(app).delete(`/api/items/${testItem.id}`);
      expect(response.status).toBe(200);

      // Verify item is deleted
      const getResponse = await request(app).get(`/api/items/${testItem.id}`);
      expect(getResponse.status).toBe(404);
    });

    it('should return 500 for non-existent item', async () => {
      const response = await request(app).delete('/api/items/999');
      expect(response.status).toBe(500);
    });
  });
});
