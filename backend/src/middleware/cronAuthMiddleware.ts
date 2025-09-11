import { Request, Response, NextFunction } from 'express';

/**
 * Middleware para proteger endpoints de cron con un secreto compartido.
 * Espera header: Authorization: Bearer <CRON_SECRET>
 */
export function cronAuthMiddleware(req: Request, res: Response, next: NextFunction): void {
  try {
    const headerValue = req.headers['authorization'] || '';
    const expected = process.env.CRON_SECRET;

    if (!expected) {
      console.error('⚠️  CRON_SECRET no está definido en el entorno. Bloqueando acceso.');
      res.status(500).json({ success: false, message: 'CRON_SECRET no configurado en el servidor' });
      return;
    }

    if (!headerValue || typeof headerValue !== 'string' || !headerValue.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'Unauthorized: missing bearer token' });
      return;
    }

    const token = headerValue.slice('Bearer '.length).trim();

    if (token !== expected) {
      res.status(401).json({ success: false, message: 'Unauthorized: invalid token' });
      return;
    }

    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
  }
}


