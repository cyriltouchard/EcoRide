/**
 * Mock manuel de Mongoose pour les tests
 */

// Mock du constructeur Schema
class MockSchema {
  constructor() {
    this.obj = {};
    this.methods = {};
    this.statics = {};
  }
  
  pre() {
    return this;
  }
  
  post() {
    return this;
  }
}

// Ajouter Types à Schema
MockSchema.Types = {
  ObjectId: String
};


// Mock du modèle Mongoose
class MockModel {
  constructor(data) {
    Object.assign(this, data);
  }

  async save() {
    return this;
  }

  static find() {
    return {
      populate: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([]),
      limit: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis()
    };
  }

  static findById() {
    return {
      populate: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(null)
    };
  }

  static findOne() {
    return {
      populate: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(null)
    };
  }

  static findByIdAndUpdate() {
    return {
      exec: jest.fn().mockResolvedValue(null)
    };
  }

  static create() {
    return Promise.resolve({});
  }

  static deleteOne() {
    return Promise.resolve({ deletedCount: 1 });
  }
}

const mongoose = {
  Schema: MockSchema,
  model: jest.fn((name) => MockModel),
  connect: jest.fn().mockResolvedValue({}),
  disconnect: jest.fn().mockResolvedValue({}),
  connection: {
    readyState: 1,
    on: jest.fn(),
    once: jest.fn()
  },
  Types: {
    ObjectId: jest.fn((id) => id || 'mockObjectId')
  }
};

module.exports = mongoose;
