import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { createResponse } from '@/lib/utils';

export function withAuth(handler, requiredType = null) {
  return async (request, context) => {
    try {
      const authHeader = request.headers.get('authorization');
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json(
          createResponse(false, 'Authorization token required'),
          { status: 401 }
        );
      }

      const token = authHeader.substring(7);
      const decoded = verifyToken(token);

      if (requiredType && decoded.type !== requiredType) {
        return NextResponse.json(
          createResponse(false, 'Invalid token type'),
          { status: 403 }
        );
      }

      // Attach decoded token to request
      request.user = decoded;

      // ✅ Now forwarding both request & context
      return handler(request, context);

    } catch (error) {
      return NextResponse.json(
        createResponse(false, 'Invalid or expired token'),
        { status: 401 }
      );
    }
  };
}


export function requireAdmin(handler) {
  return withAuth(handler, 'admin');
}

export function requireTeam(handler) {
  return withAuth(handler, 'team');
}