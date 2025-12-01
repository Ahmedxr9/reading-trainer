/**
 * User Controller
 * Request handlers for user endpoints
 */

import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '../services/UserService';
import { RegisterDtoSchema, UpdateProfileDtoSchema } from '../dto/user.dto';
import { validateBody, validateQuery } from '../middleware/validation';
import { errorHandler } from '../middleware/errorHandler';
import { PaginationQuerySchema } from '../dto/common.dto';
import { logger } from '../logger';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  /**
   * POST /api/v1/users/register
   * Register a new user
   */
  async register(req: NextRequest): Promise<NextResponse> {
    try {
      const validation = await validateBody(RegisterDtoSchema)(req);
      if (validation instanceof NextResponse) return validation;

      const user = await this.userService.register(validation.data);
      
      return NextResponse.json(
        {
          success: true,
          data: user,
          message: 'User registered successfully',
        },
        { status: 201 }
      );
    } catch (error) {
      return errorHandler(error, req);
    }
  }

  /**
   * GET /api/v1/users/:id
   * Get user by ID
   */
  async getById(req: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
    try {
      const user = await this.userService.findById(params.id);
      
      return NextResponse.json({
        success: true,
        data: user,
      });
    } catch (error) {
      return errorHandler(error, req);
    }
  }

  /**
   * GET /api/v1/users/:id/profile
   * Get user profile with stats
   */
  async getProfile(req: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
    try {
      const profile = await this.userService.getProfile(params.id);
      
      return NextResponse.json({
        success: true,
        data: profile,
      });
    } catch (error) {
      return errorHandler(error, req);
    }
  }

  /**
   * PUT /api/v1/users/:id
   * Update user profile
   */
  async updateProfile(req: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
    try {
      const validation = await validateBody(UpdateProfileDtoSchema)(req);
      if (validation instanceof NextResponse) return validation;

      const user = await this.userService.updateProfile(params.id, validation.data);
      
      return NextResponse.json({
        success: true,
        data: user,
        message: 'Profile updated successfully',
      });
    } catch (error) {
      return errorHandler(error, req);
    }
  }
}

