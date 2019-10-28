const { env } = process;

module.exports = {
    port: env.PORT,
    environment: env.NODE_ENV,
    mongo: {
        connection: `${env.MONGO_CONNECTION}`,
    },
    firebase: {
        apiKey: env.FIREBASE_API_KEY,
        authDomain: env.FIREBASE_AUTH_DOMAIN,
        databaseURL: env.FIREBASE_DATABASE_URL,
        projectId: env.FIREBASE_PROJECT_ID,
        storageBucket: env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: env.MESSAGING_SENDER_ID,
    },
    ioConnection: env.IO_CONNECTION,
};
