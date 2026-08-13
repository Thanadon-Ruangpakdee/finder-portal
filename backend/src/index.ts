import express from 'express';
import cors from 'cors';
import { initConfig } from './config/vault';
import apiRouter from './routes/api';

async function bootstrap() {
  try {
    // 1. Initialize configuration (Azure Key Vault + fallback local .env)
    const config = await initConfig();

    const app = express();

    // 2. Register global middleware
    app.use(cors({
      origin: '*', // Allow all origins for student project ease of integration
      credentials: true
    }));
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ limit: '10mb', extended: true }));

    // 3. Mount REST API Routing
    app.use('/api/v1', apiRouter);

    // 4. Default Health Check
    app.get('/', (req, res) => {
      res.json({
        name: 'Finder Portal REST API',
        status: 'healthy',
        timestamp: new Date()
      });
    });

    // 5. Start Server listening
    app.listen(config.PORT, () => {
      console.log(`=================================================`);
      console.log(`🚀 Finder Portal REST API server is running!`);
      console.log(`   Local Address: http://localhost:${config.PORT}`);
      console.log(`   API Endpoint:  http://localhost:${config.PORT}/api/v1`);
      console.log(`=================================================`);
    });
  } catch (err: any) {
    console.error('❌ Server startup failed:', err.message);
    process.exit(1);
  }
}

bootstrap();
