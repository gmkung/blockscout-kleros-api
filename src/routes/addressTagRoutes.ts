import { Router } from 'express';
import { AddressTagController } from '../controllers/addressTagController';
import { validateAddressTagRequest } from '../middleware/validation';
import { Logger } from 'pino';

/**
 * Router for address tag related endpoints
 */
export function createAddressTagRoutes(logger: Logger): Router {
  const router = Router();
  const controller = new AddressTagController(logger);

  /**
   * POST /api/address-tags
   * Get address tags for given chains and addresses
   */
  router.post(
    '/address-tags',
    validateAddressTagRequest,
    controller.getAddressTags.bind(controller)
  );

  /**
   * GET /api/health
   * Health check endpoint
   */
  router.get(
    '/health',
    controller.healthCheck.bind(controller)
  );

  return router;
} 