import { NextRequest, NextResponse } from 'next/server';
import { getUserHistory } from '@/lib/db-service';

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 400 }
      );
    }

    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '30', 10);
    const history = await getUserHistory(userId, limit);

    return NextResponse.json({ 
      success: true, 
      history 
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching user history:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
