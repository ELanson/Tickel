import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// These should be set in .env.local
const R2_ACCOUNT_ID = import.meta.env.VITE_R2_ACCOUNT_ID || "";
const R2_ACCESS_KEY_ID = import.meta.env.VITE_R2_ACCESS_KEY_ID || "";
const R2_SECRET_ACCESS_KEY = import.meta.env.VITE_R2_SECRET_ACCESS_KEY || "";
const R2_BUCKET_NAME = import.meta.env.VITE_R2_BUCKET_NAME || "tickel-workflow-assets";

const r2Client = new S3Client({
    region: "auto",
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
});

export const getUploadUrl = async (key: string, contentType: string) => {
    const command = new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
        ContentType: contentType,
    });
    return await getSignedUrl(r2Client, command, { expiresIn: 3600 });
};

export const getDownloadUrl = async (key: string) => {
    const command = new GetObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
    });
    return await getSignedUrl(r2Client, command, { expiresIn: 3600 });
};

export const formatR2Key = (projectId: string, category: string, fileName: string) => {
    // projects/{project_id}/{category}/{timestamp}_{filename}
    const timestamp = Date.now();
    return `projects/${projectId}/${category}/${timestamp}_${fileName}`;
};
