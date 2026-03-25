const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let memoryServer;

async function connectDB() {
    const hasMongoUrl = Boolean(process.env.MONGO_URL);
    const mongoUrl = process.env.MONGO_URL || await getMemoryMongoUrl();

    await mongoose.connect(mongoUrl, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false
    });

    return {
        mongoUrl,
        isInMemory: !hasMongoUrl
    };
}

async function getMemoryMongoUrl() {
    if (!memoryServer) {
        memoryServer = await MongoMemoryServer.create({
            instance: {
                dbName: 'CityDiaries'
            }
        });
    }

    return memoryServer.getUri();
}

module.exports = connectDB;
