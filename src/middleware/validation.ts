import { Request, Response, NextFunction } from 'express';
import { AddressTagRequest } from '../types/api';

/**
 * Validates if a string is a valid Ethereum address
 */
function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Validates if a string is a valid chain ID
 */
function isValidChainId(chainId: string): boolean {
  return /^\d+$/.test(chainId) && parseInt(chainId) > 0;
}

/**
 * Middleware to validate the address tag request
 */
export function validateAddressTagRequest(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const { chains, addresses }: AddressTagRequest = req.body;

    // Check if required fields exist
    if (!chains || !addresses) {
      res.status(400).json({
        success: false,
        error: {
          error: 'VALIDATION_ERROR',
          message: 'Missing required fields: chains and addresses are required',
          statusCode: 400
        }
      });
      return;
    }

    // Validate chains array
    if (!Array.isArray(chains) || chains.length === 0) {
      res.status(400).json({
        success: false,
        error: {
          error: 'VALIDATION_ERROR',
          message: 'chains must be a non-empty array',
          statusCode: 400
        }
      });
      return;
    }

    // Validate addresses array
    if (!Array.isArray(addresses) || addresses.length === 0) {
      res.status(400).json({
        success: false,
        error: {
          error: 'VALIDATION_ERROR',
          message: 'addresses must be a non-empty array',
          statusCode: 400
        }
      });
      return;
    }

    // Validate each chain ID
    for (const chainId of chains) {
      if (typeof chainId !== 'string' || !isValidChainId(chainId)) {
        res.status(400).json({
          success: false,
          error: {
            error: 'VALIDATION_ERROR',
            message: `Invalid chain ID: ${chainId}. Chain IDs must be positive numeric strings`,
            statusCode: 400
          }
        });
        return;
      }
    }

    // Validate each address
    for (const address of addresses) {
      if (typeof address !== 'string' || !isValidAddress(address)) {
        res.status(400).json({
          success: false,
          error: {
            error: 'VALIDATION_ERROR',
            message: `Invalid address: ${address}. Addresses must be valid Ethereum addresses with 0x prefix`,
            statusCode: 400
          }
        });
        return;
      }
    }

    next();
  } catch (error) {
    res.status(400).json({
      success: false,
      error: {
        error: 'VALIDATION_ERROR',
        message: 'Invalid request body format',
        statusCode: 400
      }
    });
  }
} 