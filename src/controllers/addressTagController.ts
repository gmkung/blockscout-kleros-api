import { Request, Response } from 'express';
import { AddressTagService } from '../services/addressTagService';
import { AddressTagRequest, ApiResponse, AddressTagResponse } from '../types/api';

/**
 * Controller for handling address tag requests
 */
export class AddressTagController {
  private addressTagService: AddressTagService;

  constructor() {
    this.addressTagService = new AddressTagService();
  }

  /**
   * Handles POST /api/address-tags requests
   */
  async getAddressTags(req: Request, res: Response): Promise<void> {
    try {
      const request: AddressTagRequest = req.body;

      // Validate business logic constraints
      const validation = this.addressTagService.validateRequest(request);
      if (!validation.isValid) {
        res.status(400).json({
          success: false,
          error: {
            error: 'BUSINESS_LOGIC_ERROR',
            message: validation.error || 'Invalid request',
            statusCode: 400
          }
        } as ApiResponse<never>);
        return;
      }

      // Process the request
      const result = await this.addressTagService.getAddressTags(request);

      // Return successful response
      res.status(200).json({
        success: true,
        data: result
      } as ApiResponse<AddressTagResponse>);

    } catch (error) {
      console.error('Error processing address tags request:', error);
      
      res.status(500).json({
        success: false,
        error: {
          error: 'INTERNAL_SERVER_ERROR',
          message: 'An internal server error occurred',
          statusCode: 500
        }
      } as ApiResponse<never>);
    }
  }

  /**
   * Health check endpoint
   */
  async healthCheck(req: Request, res: Response): Promise<void> {
    res.status(200).json({
      success: true,
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'blockscout-api'
      }
    });
  }
} 