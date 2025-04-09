/**
 * Test API endpoint for transaction manager
 * 
 * This endpoint is used to test the transaction manager functionality.
 * It supports various operations like create, update, delete, batch operations,
 * and error scenarios to test the transaction manager's capabilities.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';
import { CampaignWizard } from '@prisma/client';

// Schema for test operations
const TestRequestSchema = z.object({
  operation: z.enum(['create', 'update', 'delete', 'batch']),
  id: z.string().uuid().optional(),
  name: z.string().optional(),
  testId: z.string().uuid().optional(),
  isolation: z.enum(['READ UNCOMMITTED', 'READ COMMITTED', 'REPEATABLE READ', 'SERIALIZABLE']).optional(),
  additionalOperations: z.array(z.object({
    type: z.enum(['influencer', 'history']),
    platform: z.enum(['INSTAGRAM', 'YOUTUBE', 'TIKTOK']).optional(),
    step: z.number().optional()
  })).optional()
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request
    const body = await request.json();
    const validationResult = TestRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { operation, id, name, testId, isolation, additionalOperations } = validationResult.data;

    // Handle different operations
    switch (operation) {
      case 'create':
        return await handleCreate(name || 'Test Campaign', testId || randomUUID());
      case 'update':
        return await handleUpdate(id || '', name || 'Updated Campaign');
      case 'delete':
        return await handleDelete(id || '');
      case 'batch':
        return await handleBatch(name || 'Batch Campaign', testId || randomUUID(), additionalOperations || []);
      default:
        return NextResponse.json(
          { error: 'Unsupported operation' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in transaction test endpoint:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

/**
 * Handle create operation
 */
async function handleCreate(name: string, testId: string) {
  const startTime = new Date();

  try {
    // Create a test campaign
    const campaign = await prisma.campaignWizard.create({
      data: {
        name,
        testId,
        businessGoal: 'TEST',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        updatedAt: new Date(),
        createdAt: new Date()
      }
    });

    const endTime = new Date();

    return NextResponse.json({
      success: true,
      data: campaign,
      timing: {
        startTime,
        endTime,
        durationMs: endTime.getTime() - startTime.getTime()
      }
    });
  } catch (error) {
    const endTime = new Date();

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      timing: {
        startTime,
        endTime,
        durationMs: endTime.getTime() - startTime.getTime()
      }
    }, { status: 500 });
  }
}

/**
 * Handle update operation
 */
async function handleUpdate(id: string, name: string) {
  const startTime = new Date();

  try {
    // Update a campaign
    const campaign = await prisma.campaignWizard.update({
      where: { id },
      data: {
        name,
        updatedAt: new Date()
      }
    });

    const endTime = new Date();

    return NextResponse.json({
      success: true,
      data: campaign,
      timing: {
        startTime,
        endTime,
        durationMs: endTime.getTime() - startTime.getTime()
      }
    });
  } catch (error) {
    const endTime = new Date();

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      timing: {
        startTime,
        endTime,
        durationMs: endTime.getTime() - startTime.getTime()
      }
    }, { status: 500 });
  }
}

/**
 * Handle delete operation
 */
async function handleDelete(id: string) {
  const startTime = new Date();

  try {
    // Delete a campaign
    const campaign = await prisma.campaignWizard.delete({
      where: { id }
    });

    const endTime = new Date();

    return NextResponse.json({
      success: true,
      data: campaign,
      timing: {
        startTime,
        endTime,
        durationMs: endTime.getTime() - startTime.getTime()
      }
    });
  } catch (error) {
    const endTime = new Date();

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      timing: {
        startTime,
        endTime,
        durationMs: endTime.getTime() - startTime.getTime()
      }
    }, { status: 500 });
  }
}

/**
 * Handle batch operation
 */
async function handleBatch(name: string, testId: string, additionalOperations: Array<{
  type: 'influencer' | 'history';
  platform?: 'INSTAGRAM' | 'YOUTUBE' | 'TIKTOK';
  step?: number;
}>) {
  const startTime = new Date();

  try {
    // Create the main campaign
    const campaign = await prisma.campaignWizard.create({
      data: {
        name,
        testId,
        businessGoal: 'TEST',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        updatedAt: new Date(),
        createdAt: new Date()
      }
    });

    // Create additional records based on the request
    const additionalRecords = [];

    for (const op of additionalOperations) {
      if (op.type === 'influencer') {
        const influencer = await prisma.influencer.create({
          data: {
            campaignWizardId: (campaign as CampaignWizard).id,
            platform: op.platform || 'INSTAGRAM',
            handle: `influencer_${randomUUID().substring(0, 8)}`,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });
        additionalRecords.push(influencer);
      } else if (op.type === 'history') {
        const history = await prisma.wizardHistory.create({
          data: {
            campaignWizardId: (campaign as CampaignWizard).id,
            step: op.step || 1,
            action: 'BATCH_TEST',
            changes: JSON.stringify({ testData: true }),
            performedBy: 'SYSTEM_TEST',
            timestamp: new Date()
          }
        });
        additionalRecords.push(history);
      }
    }

    const endTime = new Date();

    return NextResponse.json({
      success: true,
      data: {
        campaign,
        additionalRecords
      },
      timing: {
        startTime,
        endTime,
        durationMs: endTime.getTime() - startTime.getTime()
      }
    });
  } catch (error) {
    const endTime = new Date();

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      timing: {
        startTime,
        endTime,
        durationMs: endTime.getTime() - startTime.getTime()
      }
    }, { status: 500 });
  }
} 