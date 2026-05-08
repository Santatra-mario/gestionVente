const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Product = sequelize.define('Product', {
  numProduit: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
  },

  design: {
    type: DataTypes.STRING,
    allowNull: false
  },

  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },

  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0
  }
}, {
  tableName: 'product',   // important (nom table MySQL)
  timestamps: true
});

// sync (dev uniquement)
Product.sync({ alter: true });

module.exports = Product;