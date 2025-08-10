import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

export const setupMiddleware = (app: express.Application) => {
  // CORS
  app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://tu-dominio.com'] 
      : ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true
  }));

  // Body parser
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Logger con Morgan
  if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  } else {
    app.use(morgan('combined'));
  }

  // Middleware para parsear JSON
  app.use(express.json());
};
