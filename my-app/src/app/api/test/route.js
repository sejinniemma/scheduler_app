import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../db/mongodb';

export async function GET() {
  try {
    await connectToDatabase();
    return NextResponse.json({
      success: true,
      message: 'MongoDB 연결 성공',
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'MongoDB 연결 실패',
      },
      { status: 500 }
    );
  }
}
