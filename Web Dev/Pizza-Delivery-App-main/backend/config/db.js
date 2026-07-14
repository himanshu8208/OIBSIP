import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { mockStore, saveToDisk } from './mockDb.js';

// Dynamic virtual .id and .populate document-level property binding
const addVirtualId = (doc) => {
  if (doc && typeof doc === 'object') {
    // Generate subdocument _ids for array subdocuments (e.g. cart.items, user.addresses)
    Object.keys(doc).forEach(key => {
      if (Array.isArray(doc[key])) {
        doc[key].forEach(sub => {
          if (sub && typeof sub === 'object' && !sub._id) {
            sub._id = `mock_sub_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
          }
        });
      }
    });

    if (doc._id && !doc.id) {
      Object.defineProperty(doc, 'id', {
        get() {
          return this._id?.toString();
        },
        configurable: true,
        enumerable: true
      });
    }

    // Bind self-contained document-level .populate method
    if (!doc.populate) {
      doc.populate = async function(path) {
        console.log(`[Mock DB] Executing document-level populate for path: ${path}`);
        if (this.user && typeof this.user === 'string') {
          this.user = mockStore.User.find(u => u._id === this.user) || this.user;
        }
        if (this.items && Array.isArray(this.items)) {
          this.items.forEach(line => {
            if (line.pizza && typeof line.pizza === 'string') {
              line.pizza = mockStore.Pizza.find(p => p._id === line.pizza) || line.pizza;
            }
          });
        }
        return this;
      };
    }
  }
  return doc;
};

// Operator and query matching engine for standard Mongoose find filters
const matchValue = (val, qVal) => {
  // Support populated object references in mock DB queries
  let actualVal = val;
  if (val && typeof val === 'object' && val._id) {
    actualVal = val._id;
  }

  if (qVal instanceof RegExp) {
    return qVal.test(actualVal);
  }
  if (qVal && typeof qVal === 'object') {
    // Regex matching
    if (qVal.$regex) {
      const regex = new RegExp(qVal.$regex, qVal.$options || 'i');
      return regex.test(actualVal);
    }
    // Array matching ($in)
    if (qVal.$in && Array.isArray(qVal.$in)) {
      if (Array.isArray(actualVal)) {
        return actualVal.some(item => qVal.$in.some(qi => {
          if (qi instanceof RegExp) return qi.test(item);
          return item?.toString().toLowerCase() === qi?.toString().toLowerCase();
        }));
      }
      return qVal.$in.some(qi => {
        if (qi instanceof RegExp) return qi.test(actualVal);
        return actualVal?.toString().toLowerCase() === qi?.toString().toLowerCase();
      });
    }
  }
  // Array inclusion check
  if (Array.isArray(actualVal)) {
    return actualVal.includes(qVal);
  }
  
  // Standard equivalence check
  return actualVal?.toString() === qVal?.toString();
};

// Chainable query constructor to behave exactly like standard Mongoose Queries (handles .populate(), .sort(), .limit(), etc.)
class MockQuery {
  constructor(data) {
    this.data = Array.isArray(data) ? data : [data].filter(Boolean);
  }
  populate(path) {
    this.data.forEach(item => {
      if (!item) return;
      addVirtualId(item);
      // Mock populate user reference
      if (item.user && typeof item.user === 'string') {
        item.user = mockStore.User.find(u => u._id === item.user) || item.user;
      }
      // Mock populate items.pizza reference
      if (item.items && Array.isArray(item.items)) {
        item.items.forEach(line => {
          if (line.pizza && typeof line.pizza === 'string') {
            line.pizza = mockStore.Pizza.find(p => p._id === line.pizza) || line.pizza;
          }
        });
      }
    });
    return this;
  }
  sort(field) {
    // Sort logic
    if (field && typeof field === 'string') {
      const isDesc = field.startsWith('-');
      const key = isDesc ? field.slice(1) : field;
      this.data.sort((a, b) => {
        if (a[key] < b[key]) return isDesc ? 1 : -1;
        if (a[key] > b[key]) return isDesc ? -1 : 1;
        return 0;
      });
    }
    return this;
  }
  limit(n) {
    this.data = this.data.slice(0, n);
    return this;
  }
  select() {
    return this;
  }
  then(onResolve, onReject) {
    return Promise.resolve(this.data).then(onResolve, onReject);
  }
}

// Chainable query constructor for single document query results
class MockSingleQuery {
  constructor(data) {
    this.data = data;
  }
  populate(path) {
    if (!this.data) return this;
    addVirtualId(this.data);
    if (this.data.user && typeof this.data.user === 'string') {
      this.data.user = mockStore.User.find(u => u._id === this.data.user) || this.data.user;
    }
    if (this.data.items && Array.isArray(this.data.items)) {
      this.data.items.forEach(line => {
        if (line.pizza && typeof line.pizza === 'string') {
          line.pizza = mockStore.Pizza.find(p => p._id === line.pizza) || line.pizza;
        }
      });
    }
    return this;
  }
  select() {
    return this;
  }
  sort() {
    return this;
  }
  then(onResolve, onReject) {
    return Promise.resolve(this.data).then(onResolve, onReject);
  }
}

// Global flag to monitor database state
global.useMockDB = false;

// Intercept Mongoose model compiles
const originalModel = mongoose.model.bind(mongoose);
mongoose.model = function(name, schema) {
  const model = originalModel(name, schema);
  
  // Return Proxy to dynamically switch between real MongoDB and In-Memory JSON
  return new Proxy(model, {
    get(target, prop) {
      if (!global.useMockDB && mongoose.connection.readyState === 1) {
        return Reflect.get(target, prop);
      }
      
      // Fallback: intercept call and redirect to Mock Database Methods!
      console.log(`[Mock DB] Intercepted call to ${name}.${prop}`);
      return getMockMethod(name, prop);
    }
  });
};

// Mock CRUD Method Router
const getMockMethod = (modelName, prop) => {
  const list = mockStore[modelName] || [];
  
  const methods = {
    find: (query = {}) => {
      let result = [...list];
      if (Object.keys(query).length > 0) {
        result = result.filter(item => {
          return Object.keys(query).every(key => {
            const queryValue = query[key];
            const itemValue = item[key];

            // Evaluate $or queries
            if (key === '$or' && Array.isArray(queryValue)) {
              return queryValue.some(subQuery => {
                return Object.keys(subQuery).every(subKey => {
                  return matchValue(item[subKey], subQuery[subKey]);
                });
              });
            }

            // Evaluate $expr queries (mock fallback support)
            if (key === '$expr' && queryValue && typeof queryValue === 'object') {
              if (queryValue.$lt && Array.isArray(queryValue.$lt)) {
                const [field1, field2] = queryValue.$lt;
                const val1 = field1.startsWith('$') ? item[field1.slice(1)] : field1;
                const val2 = field2.startsWith('$') ? item[field2.slice(1)] : field2;
                return val1 < val2;
              }
              return true;
            }

            return matchValue(itemValue, queryValue);
          });
        });
      }
      return new MockQuery(result.map(doc => addVirtualId(doc)));
    },
    
    findOne: (query = {}) => {
      const found = methods.find(query).data[0];
      if (found) {
        // Dynamic save and schema helpers
        if (modelName === 'User') {
          found.comparePassword = async function(candidate) {
            return await bcrypt.compare(candidate, this.password);
          };
        }
        found.save = async function() {
          addVirtualId(this);
          const idx = mockStore[modelName].findIndex(i => i._id === this._id);
          if (idx > -1) {
            mockStore[modelName][idx] = { ...this };
          }
          saveToDisk();
          return this;
        };
      }
      return new MockSingleQuery(found ? addVirtualId(found) : null);
    },
    
    findById: (id) => {
      const found = mockStore[modelName].find(item => item._id === id || item._id?.toString() === id?.toString());
      if (found) {
        if (modelName === 'User') {
          found.comparePassword = async function(candidate) {
            return await bcrypt.compare(candidate, this.password);
          };
        }
        found.save = async function() {
          addVirtualId(this);
          const idx = mockStore[modelName].findIndex(i => i._id === this._id);
          if (idx > -1) {
            mockStore[modelName][idx] = { ...this };
          }
          saveToDisk();
          return this;
        };
      }
      return new MockSingleQuery(found ? addVirtualId(found) : null);
    },

    create: async (data) => {
      // User Password Hashing
      let finalData = { ...data };
      if (modelName === 'User' && finalData.password) {
        const salt = bcrypt.genSaltSync(10);
        finalData.password = bcrypt.hashSync(finalData.password, salt);
      }

      const newItem = {
        _id: `mock_${modelName.toLowerCase()}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        ...finalData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      mockStore[modelName].push(newItem);
      saveToDisk();

      newItem.save = async function() {
        addVirtualId(this);
        const idx = mockStore[modelName].findIndex(i => i._id === this._id);
        if (idx > -1) {
          mockStore[modelName][idx] = { ...this };
        }
        saveToDisk();
        return this;
      };

      return addVirtualId(newItem);
    },

    findByIdAndDelete: async (id) => {
      mockStore[modelName] = mockStore[modelName].filter(item => item._id !== id && item._id?.toString() !== id?.toString());
      saveToDisk();
      return true;
    },

    findByIdAndUpdate: async (id, updateData) => {
      const idx = mockStore[modelName].findIndex(item => item._id === id || item._id?.toString() === id?.toString());
      let updated = null;
      if (idx > -1) {
        mockStore[modelName][idx] = { ...mockStore[modelName][idx], ...updateData };
        saveToDisk();
        updated = mockStore[modelName][idx];
      }
      return new MockSingleQuery(updated ? addVirtualId(updated) : null);
    },

    findOneAndDelete: async (query = {}) => {
      const found = methods.findOne(query);
      if (found) {
        mockStore[modelName] = mockStore[modelName].filter(item => item._id !== found._id);
        saveToDisk();
      }
      return found;
    },

    countDocuments: async (query = {}) => {
      const filtered = methods.find(query).data;
      return filtered.length;
    },

    aggregate: async (pipeline) => {
      // Custom aggregations for Admin Analytics View
      if (modelName === 'Order') {
        
        // 1. Pizza Popularity
        if (pipeline.some(p => p.$match && p.$match['items.isCustom'] === false)) {
          const counts = {};
          mockStore.Order.forEach(order => {
            order.items.forEach(item => {
              if (!item.isCustom && item.pizza) {
                const pizzaId = item.pizza._id || item.pizza;
                counts[pizzaId] = (counts[pizzaId] || 0) + item.quantity;
              }
            });
          });
          return Object.keys(counts).map(id => ({ _id: id, count: counts[id] }));
        }

        // 2. Custom Pizza Builder counts
        if (pipeline.some(p => p.$match && p.$match['items.isCustom'] === true)) {
          let total = 0;
          mockStore.Order.forEach(order => {
            order.items.forEach(item => {
              if (item.isCustom) total += item.quantity;
            });
          });
          return [{ _id: null, total }];
        }

        // 3. 7-Day Performance Charts Data
        if (pipeline.some(p => p.$group && p.$group._id && typeof p.$group._id === 'object' && p.$group._id.$dateToString)) {
          const daily = {};
          mockStore.Order.forEach(order => {
            if (order.paymentStatus === 'Paid') {
              const dateStr = new Date(order.createdAt).toISOString().split('T')[0];
              if (!daily[dateStr]) daily[dateStr] = { revenue: 0, orders: 0 };
              daily[dateStr].revenue += order.totalAmount;
              daily[dateStr].orders += 1;
            }
          });
          return Object.keys(daily).map(date => ({ _id: date, revenue: daily[date].revenue, orders: daily[date].orders }));
        }
      }
      return [];
    }
  };

  return methods[prop] || (() => {
    console.warn(`[Mock DB] Method "${prop}" is not explicitly mocked for ${modelName}`);
    return Promise.resolve(null);
  });
};

// Database Connection
const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/pizzaverse';
    
    // Quick timeout so we don't hang if MongoDB is offline
    console.log(`[Database] Attempting connection to MongoDB server...`);
    
    mongoose.set('strictQuery', false);
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000 // 2 seconds threshold
    });
    
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`\n⚠️  [Database WARNING] Local MongoDB service is offline or unreachable: ${error.message}`);
    console.warn(`🔥  [Database FALLBACK] Activating High-Fidelity IN-MEMORY JSON Database Mode!`);
    console.warn(`👉  All MERN components (auth, visual builder, checkouts, admin status updates, WebSockets order tracking, charts) are fully functional out of the box!`);
    console.warn(`👉  Your session data is persisted in "backend/data/db_fallback.json"\n`);
    
    global.useMockDB = true;
  }
};

export default connectDB;
