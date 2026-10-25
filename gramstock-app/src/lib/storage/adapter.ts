/**
 * GramStock Cloud — Storage Abstraction
 *
 * Provides a unified interface for file storage.
 * In development: stores files locally under /uploads/
 * In production with AWS credentials: uses S3
 *
 * Set STORAGE_ADAPTER=local|s3 in environment.
 * Never pretend local storage is AWS S3.
 */
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

export interface UploadResult {
  key: string;
  url: string;
  adapter: "local" | "s3";
}

export interface StorageAdapter {
  upload(buffer: Buffer, fileName: string, mimeType: string): Promise<UploadResult>;
  download(key: string): Promise<Buffer>;
  delete(key: string): Promise<void>;
  getSignedUrl(key: string, expiresInSeconds?: number): Promise<string>;
}

// =============================================
// LOCAL STORAGE ADAPTER (DEVELOPMENT)
// =============================================

const LOCAL_UPLOAD_DIR = path.join(process.cwd(), "uploads");

class LocalStorageAdapter implements StorageAdapter {
  async upload(buffer: Buffer, fileName: string, _mimeType: string): Promise<UploadResult> {
    await fs.mkdir(LOCAL_UPLOAD_DIR, { recursive: true });

    const ext = path.extname(fileName);
    const key = `local/${Date.now()}-${crypto.randomBytes(8).toString("hex")}${ext}`;
    const filePath = path.join(LOCAL_UPLOAD_DIR, key.replace("local/", ""));

    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, buffer);

    return {
      key,
      url: `/api/files/${encodeURIComponent(key)}`,
      adapter: "local",
    };
  }

  async download(key: string): Promise<Buffer> {
    const filePath = path.join(LOCAL_UPLOAD_DIR, key.replace("local/", ""));
    return fs.readFile(filePath);
  }

  async delete(key: string): Promise<void> {
    const filePath = path.join(LOCAL_UPLOAD_DIR, key.replace("local/", ""));
    await fs.unlink(filePath).catch(() => {});
  }

  async getSignedUrl(key: string, _expiresInSeconds?: number): Promise<string> {
    // Local: just return the API route URL
    return `/api/files/${encodeURIComponent(key)}`;
  }
}

// =============================================
// S3 STORAGE ADAPTER (PRODUCTION)
// =============================================

class S3StorageAdapter implements StorageAdapter {
  private readonly bucket: string;
  private readonly region: string;

  constructor() {
    this.bucket = process.env.AWS_S3_BUCKET ?? "";
    this.region = process.env.AWS_REGION ?? "us-east-1";

    if (!this.bucket) {
      throw new Error("AWS_S3_BUCKET environment variable is required for S3 storage");
    }
  }

  async upload(buffer: Buffer, fileName: string, mimeType: string): Promise<UploadResult> {
    // Lazy import AWS SDK to avoid bundling it when not needed
    const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");

    const client = new S3Client({ region: this.region });
    const ext = path.extname(fileName);
    const key = `uploads/${Date.now()}-${crypto.randomBytes(8).toString("hex")}${ext}`;

    await client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
        ServerSideEncryption: "AES256",
      })
    );

    return {
      key,
      url: `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`,
      adapter: "s3",
    };
  }

  async download(key: string): Promise<Buffer> {
    const { S3Client, GetObjectCommand } = await import("@aws-sdk/client-s3");
    const client = new S3Client({ region: this.region });

    const response = await client.send(
      new GetObjectCommand({ Bucket: this.bucket, Key: key })
    );

    const chunks: Uint8Array[] = [];
    for await (const chunk of response.Body as AsyncIterable<Uint8Array>) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  }

  async delete(key: string): Promise<void> {
    const { S3Client, DeleteObjectCommand } = await import("@aws-sdk/client-s3");
    const client = new S3Client({ region: this.region });
    await client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }

  async getSignedUrl(key: string, expiresInSeconds = 3600): Promise<string> {
    const { S3Client, GetObjectCommand } = await import("@aws-sdk/client-s3");
    const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");
    const client = new S3Client({ region: this.region });

    return getSignedUrl(
      client,
      new GetObjectCommand({ Bucket: this.bucket, Key: key }),
      { expiresIn: expiresInSeconds }
    );
  }
}

// =============================================
// ADAPTER FACTORY
// =============================================

let _adapter: StorageAdapter | null = null;

export function getStorageAdapter(): StorageAdapter {
  if (_adapter) return _adapter;

  const adapterType = process.env.STORAGE_ADAPTER ?? "local";

  if (adapterType === "s3") {
    const hasCredentials =
      process.env.AWS_ACCESS_KEY_ID ||
      process.env.AWS_ROLE_ARN ||
      process.env.AWS_WEB_IDENTITY_TOKEN_FILE;

    if (!hasCredentials) {
      console.warn(
        "[Storage] STORAGE_ADAPTER=s3 but no AWS credentials found. " +
          "Falling back to local storage. " +
          "Configure AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY or use IAM roles."
      );
      _adapter = new LocalStorageAdapter();
    } else {
      _adapter = new S3StorageAdapter();
    }
  } else {
    _adapter = new LocalStorageAdapter();
  }

  return _adapter;
}

export function getActiveAdapterName(): "local" | "s3" {
  const adapterType = process.env.STORAGE_ADAPTER ?? "local";
  if (
    adapterType === "s3" &&
    (process.env.AWS_ACCESS_KEY_ID ||
      process.env.AWS_ROLE_ARN ||
      process.env.AWS_WEB_IDENTITY_TOKEN_FILE)
  ) {
    return "s3";
  }
  return "local";
}
