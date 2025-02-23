import { handleAuth } from '@auth0/nextjs-auth0';
import { NextRequest } from 'next/server';
import { Session } from '@auth0/nextjs-auth0';

export const GET = handleAuth();

export const POST = handleAuth();