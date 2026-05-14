import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

function getS3Client() {
  const endpoint = process.env.STORAGE_ENDPOINT;
  return new S3Client({
    region: process.env.STORAGE_REGION ?? "auto",
    endpoint: endpoint ?? undefined,
    credentials: {
      accessKeyId: process.env.STORAGE_ACCESS_KEY_ID!,
      secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY!,
    },
    // Force path-style for R2 and other S3-compatible services
    forcePathStyle: !!endpoint,
  });
}

const BUCKET = process.env.STORAGE_BUCKET_NAME ?? "verticality-deliverables";

// Generate a signed URL for downloading a private object (expires in 1 hour)
export async function getSignedDownloadUrl(filePath: string): Promise<string> {
  const client = getS3Client();
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: filePath,
  });
  return getSignedUrl(client, command, { expiresIn: 3600 });
}

// Upload a file and return the storage path
export async function uploadDeliverable(
  buffer: Buffer,
  fileName: string,
  deliverableId: string,
  contentType: string
): Promise<string> {
  const client = getS3Client();
  const key = `deliverables/${deliverableId}/${fileName}`;
  await client.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      // Private by default (no ACL = bucket default, which should be private)
    })
  );
  return key;
}
