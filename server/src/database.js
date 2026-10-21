import mongoose from 'mongoose'

const cache = (globalThis.__pulsedeskMongoose ??= { connection: null, promise: null })

export async function connectToDatabase() {
  if (mongoose.connection.readyState === 1) return mongoose

  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pulsedesk'
  if (process.env.VERCEL && !process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is required in the Vercel environment.')
  }

  if (!cache.promise) {
    cache.promise = mongoose
      .connect(uri, { maxPoolSize: 10, serverSelectionTimeoutMS: 8000 })
      .then((connection) => {
        cache.connection = connection
        return connection
      })
      .catch((error) => {
        cache.promise = null
        cache.connection = null
        throw error
      })
  }

  return cache.promise
}
