import { MongoClient } from 'mongodb';

const MONGO_URI = 'mongodb://localhost:27017';
const DB_NAME = 'login_system';

(async () => {
    try {
        const client = new MongoClient(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        await client.connect();
        const db = client.db(DB_NAME);
        console.log('Connected to MongoDB');

        const result = await db.collection('users').updateMany(
            { personalizedContent: { $exists: false } },
            { $set: { personalizedContent: '' } }
        );

        console.log(`Updated ${result.modifiedCount} user documents`);
        await client.close();
    } catch (err) {
        console.error('Failed to update user documents', err);
    }
})();
