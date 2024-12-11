'use server'
import { S3Client } from "@aws-sdk/client-s3"
import { Upload } from "@aws-sdk/lib-storage"

const s3Client = new S3Client({
  region: process.env.NEXT_PUBLIC_AWS_REGION
})

export const uploadToS3 = async (file) => {
  try {
    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: process.env.NEXT_PUBLIC_AWS_S3_BUCKET,
        Key: `${file.name}`,
        Body: file,
        ContentType: file.type,
      },
    })

    const result = await upload.done()
    return {
      url: result.Location,
      key: result.Key
    }
  } catch (error) {
    console.error('S3 upload error:', error)
    throw new Error('파일 업로드에 실패했습니다.')
  }
} 