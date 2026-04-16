const mongoose = require('mongoose');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function connectMongo() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI is not defined');
  }
  await mongoose.connect(mongoUri, {
    dbName: process.env.MONGODB_DB || 'academic_check'
  });
}

module.exports = {
  prisma,
  connectMongo
};
