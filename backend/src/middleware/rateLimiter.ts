import rateLimit from 'express-rate-limit';

// Rate limiter general
export const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // 100 requests por ventana
  message: {
    error: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.',
    retryAfter: '15 minutos'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter específico para análisis con IA (más restrictivo)
export const aiAnalysisLimiter = rateLimit({
  windowMs: 60000, // 1 minuto
  max: 10, // 10 análisis por minuto
  message: {
    error: 'Límite de análisis con IA excedido. Intenta de nuevo en 1 minuto.',
    retryAfter: '1 minuto'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
