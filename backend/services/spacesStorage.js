const fs = require('fs');
const path = require('path');
const {
  DeleteObjectsCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} = require('@aws-sdk/client-s3');

const publicBaseUrl = process.env.DO_SPACES_PUBLIC_BASE_URL;

const isSpacesEnabled = () => Boolean(
  process.env.DO_SPACES_KEY &&
  process.env.DO_SPACES_SECRET &&
  process.env.DO_SPACES_BUCKET &&
  process.env.DO_SPACES_REGION &&
  process.env.DO_SPACES_ENDPOINT &&
  publicBaseUrl
);

const client = isSpacesEnabled()
  ? new S3Client({
    region: process.env.DO_SPACES_REGION,
    endpoint: process.env.DO_SPACES_ENDPOINT,
    credentials: {
      accessKeyId: process.env.DO_SPACES_KEY,
      secretAccessKey: process.env.DO_SPACES_SECRET,
    },
  })
  : null;

const contentTypes = {
  '.gif': 'image/gif',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.md': 'text/markdown; charset=utf-8',
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.zip': 'application/zip',
};

const normalizeKey = (key) => key.replace(/\\/g, '/').replace(/^\/+/, '');

const getContentType = (fileName) => (
  contentTypes[path.extname(fileName).toLowerCase()] || 'application/octet-stream'
);

const getPublicUrl = (key) => `${publicBaseUrl.replace(/\/+$/, '')}/${normalizeKey(key)}`;

const uploadBuffer = async ({ key, body, contentType }) => {
  if (!client) {
    throw new Error('DigitalOcean Spaces is not configured.');
  }

  const normalizedKey = normalizeKey(key);

  await client.send(new PutObjectCommand({
    Bucket: process.env.DO_SPACES_BUCKET,
    Key: normalizedKey,
    Body: body,
    ACL: 'public-read',
    ContentType: contentType || getContentType(normalizedKey),
  }));

  return getPublicUrl(normalizedKey);
};

const uploadFile = async ({ key, filePath, contentType }) => (
  uploadBuffer({
    key,
    body: fs.createReadStream(filePath),
    contentType: contentType || getContentType(filePath),
  })
);

const deleteByUrl = async (url) => {
  if (!client || !url || !publicBaseUrl || !url.startsWith(publicBaseUrl)) {
    return;
  }

  const key = decodeURIComponent(url.slice(publicBaseUrl.length).replace(/^\/+/, ''));
  if (!key) return;

  await client.send(new DeleteObjectCommand({
    Bucket: process.env.DO_SPACES_BUCKET,
    Key: normalizeKey(key),
  }));
};

const deletePrefix = async (prefix) => {
  if (!client || !prefix) return;

  const normalizedPrefix = normalizeKey(prefix);
  let continuationToken;

  do {
    const listResult = await client.send(new ListObjectsV2Command({
      Bucket: process.env.DO_SPACES_BUCKET,
      Prefix: normalizedPrefix,
      ContinuationToken: continuationToken,
    }));

    if (listResult.Contents && listResult.Contents.length > 0) {
      await client.send(new DeleteObjectsCommand({
        Bucket: process.env.DO_SPACES_BUCKET,
        Delete: {
          Objects: listResult.Contents.map((item) => ({ Key: item.Key })),
        },
      }));
    }

    continuationToken = listResult.NextContinuationToken;
  } while (continuationToken);
};

const getKeyFromPublicUrl = (url) => {
  if (!url || !publicBaseUrl || !url.startsWith(publicBaseUrl)) {
    return '';
  }

  return decodeURIComponent(url.slice(publicBaseUrl.length).replace(/^\/+/, ''));
};

module.exports = {
  deleteByUrl,
  deletePrefix,
  getContentType,
  getKeyFromPublicUrl,
  getPublicUrl,
  isSpacesEnabled,
  normalizeKey,
  uploadBuffer,
  uploadFile,
};
