import { Router } from 'express';
import { AddressTagController } from '../controllers/addressTagController';
import { validateAddressTagRequest } from '../middleware/validation';

/**
 * Router for address tag related endpoints
 */
export function createAddressTagRoutes(): Router {
  const router = Router();
  const controller = new AddressTagController();

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