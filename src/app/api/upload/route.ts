import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import type { UploadApiResponse } from 'cloudinary';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/authOptions';
import type { NextAuthOptions } from 'next-auth';

// Cloudinary 설정
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    // Cloudinary 환경 변수 확인
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      console.error('Cloudinary 환경 변수가 설정되지 않았습니다.');
      return NextResponse.json(
        { error: '이미지 업로드 서비스가 설정되지 않았습니다.' },
        { status: 500 }
      );
    }

    // 인증 확인
    const session = await getServerSession(authOptions as NextAuthOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: '파일이 제공되지 않았습니다.' },
        { status: 400 }
      );
    }

    // 파일을 버퍼로 변환
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Base64로 변환
    const base64 = buffer.toString('base64');
    const dataURI = `data:${file.type};base64,${base64}`;

    // Cloudinary에 업로드
    const uploadResult = await new Promise<UploadApiResponse>(
      (resolve, reject) => {
      cloudinary.uploader.upload(
        dataURI,
        {
          folder: 'arrival-reports', // Cloudinary 폴더 경로
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) reject(error);
            else resolve(result as UploadApiResponse);
        }
      );
      }
    );

    return NextResponse.json({
      success: true,
      imageUrl: uploadResult.secure_url,
    });
  } catch (error) {
    console.error('이미지 업로드 오류:', error);
    return NextResponse.json(
      { error: '이미지 업로드 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 업로드 상태 확인용 GET 핸들러
export async function GET() {
  // 인증 확인
  const session = await getServerSession(authOptions as NextAuthOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  // Cloudinary 설정 여부 확인
  const ready =
    !!process.env.CLOUDINARY_CLOUD_NAME &&
    !!process.env.CLOUDINARY_API_KEY &&
    !!process.env.CLOUDINARY_API_SECRET;

  if (!ready) {
    return NextResponse.json(
      { status: 'not_ready', error: 'Cloudinary env 미설정' },
      { status: 500 }
    );
  }

  return NextResponse.json({ status: 'ready' });
}
