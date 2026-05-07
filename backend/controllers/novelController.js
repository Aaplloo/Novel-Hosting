const Novel = require('../models/Novel');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const AdmZip = require('adm-zip');
const {
  deleteByUrl,
  deletePrefix,
  getContentType,
  getKeyFromPublicUrl,
  isSpacesEnabled,
  uploadBuffer,
  uploadFile,
} = require('../services/spacesStorage');

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
const NOVEL_PACKAGES_DIR = path.join(UPLOADS_DIR, 'novels');

const toPublicPath = (filePath) => filePath.replace(/\\/g, '/');

const removeFileIfExists = async (filePath) => {
  if (!filePath || filePath.includes('via.placeholder.com')) return;

  if (/^https?:\/\//i.test(filePath)) {
    await deleteByUrl(filePath);
    return;
  }

  const absolutePath = path.isAbsolute(filePath)
    ? filePath
    : path.join(__dirname, '..', filePath);

  if (fs.existsSync(absolutePath)) {
    fs.rm(absolutePath, { force: true }, (err) => {
      if (err) console.error(err);
    });
  }
};

const removeNovelAsset = async (filePath) => {
  if (!filePath) return;

  const normalizedPath = toPublicPath(filePath);

  if (/^https?:\/\//i.test(normalizedPath)) {
    const key = getKeyFromPublicUrl(normalizedPath);

    if (key.startsWith('novels/') && key.split('/').length >= 3) {
      await deletePrefix(key.split('/').slice(0, 2).join('/'));
      return;
    }

    await deleteByUrl(normalizedPath);
    return;
  }

  if (normalizedPath.startsWith('uploads/novels/')) {
    const parts = normalizedPath.split('/');
    const packageDir = path.join(UPLOADS_DIR, 'novels', parts[2]);

    fs.rm(packageDir, { recursive: true, force: true }, (err) => {
      if (err) console.error(err);
    });
    return;
  }

  removeFileIfExists(normalizedPath);
};

const isSafeZipEntry = (entryName) => {
  const normalizedName = entryName.replace(/\\/g, '/');
  return (
    normalizedName &&
    !normalizedName.startsWith('/') &&
    !normalizedName.includes('..') &&
    !path.isAbsolute(normalizedName)
  );
};

const findMarkdownEntry = (entries) => {
  const markdownFiles = entries
    .filter((entry) => !entry.isDirectory)
    .filter((entry) => isSafeZipEntry(entry.entryName))
    .filter((entry) => !entry.entryName.replace(/\\/g, '/').startsWith('__MACOSX/'))
    .filter((entry) => path.extname(entry.entryName).toLowerCase() === '.md');

  if (markdownFiles.length === 0) {
    return null;
  }

  const rootMarkdown = markdownFiles.find((entry) => {
    const normalizedName = entry.entryName.replace(/\\/g, '/');
    return !normalizedName.includes('/');
  });

  return rootMarkdown || markdownFiles[0];
};

const uploadNovelPackageToSpaces = async (zipFilePath) => {
  const packageId = crypto.randomUUID();
  const zip = new AdmZip(zipFilePath);
  const entries = zip.getEntries();
  const markdownEntry = findMarkdownEntry(entries);

  if (!markdownEntry) {
    throw new Error('ZIP 包中必须包含一个 Markdown (.md) 文件。');
  }

  let markdownUrl = '';

  for (const entry of entries) {
    const normalizedName = entry.entryName.replace(/\\/g, '/');

    if (
      entry.isDirectory ||
      !isSafeZipEntry(normalizedName) ||
      normalizedName.startsWith('__MACOSX/')
    ) {
      continue;
    }

    const uploadedUrl = await uploadBuffer({
      key: `novels/${packageId}/${normalizedName}`,
      body: entry.getData(),
      contentType: getContentType(normalizedName),
    });

    if (normalizedName === markdownEntry.entryName.replace(/\\/g, '/')) {
      markdownUrl = uploadedUrl;
    }
  }

  fs.rmSync(zipFilePath, { force: true });

  return markdownUrl;
};

const extractNovelPackage = (zipFilePath) => {
  const packageId = crypto.randomUUID();
  const extractDir = path.join(NOVEL_PACKAGES_DIR, packageId);

  fs.mkdirSync(extractDir, { recursive: true });

  const zip = new AdmZip(zipFilePath);
  const entries = zip.getEntries();
  const markdownEntry = findMarkdownEntry(entries);

  if (!markdownEntry) {
    fs.rmSync(extractDir, { recursive: true, force: true });
    throw new Error('ZIP 包中必须包含一个 Markdown (.md) 文件。');
  }

  entries.forEach((entry) => {
    const normalizedName = entry.entryName.replace(/\\/g, '/');

    if (!isSafeZipEntry(normalizedName) || normalizedName.startsWith('__MACOSX/')) {
      return;
    }

    const targetPath = path.resolve(extractDir, normalizedName);
    if (!targetPath.startsWith(extractDir)) {
      return;
    }

    if (entry.isDirectory) {
      fs.mkdirSync(targetPath, { recursive: true });
      return;
    }

    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.writeFileSync(targetPath, entry.getData());
  });

  fs.rmSync(zipFilePath, { force: true });

  const markdownPath = path
    .join('uploads', 'novels', packageId, markdownEntry.entryName.replace(/\\/g, '/'))
    .replace(/\\/g, '/');

  return markdownPath;
};

const uploadSingleNovelFileToSpaces = async (file, uploadedFileType) => {
  const fileId = crypto.randomUUID();
  const fileName = `${fileId}${path.extname(file.originalname).toLowerCase()}`;
  const folder = uploadedFileType === 'pdf' ? 'pdfs' : 'novels';
  const url = await uploadFile({
    key: `${folder}/${fileName}`,
    filePath: file.path,
  });

  fs.rmSync(file.path, { force: true });
  return url;
};

const uploadCoverToSpaces = async (file) => {
  const coverId = crypto.randomUUID();
  const fileName = `${coverId}${path.extname(file.originalname).toLowerCase()}`;
  const url = await uploadFile({
    key: `covers/${fileName}`,
    filePath: file.path,
  });

  fs.rmSync(file.path, { force: true });
  return url;
};

// @desc    Upload a novel
// @route   POST /api/novels
// @access  Private/Admin
const uploadNovel = async (req, res) => {
  try {
    const { title } = req.body;
    const file = req.files['file'][0];
    const uploadedFileType = path.extname(file.originalname).substring(1).toLowerCase();
    let filePath = toPublicPath(file.path);
    let fileType = uploadedFileType;

    if (isSpacesEnabled() && uploadedFileType === 'zip') {
      filePath = await uploadNovelPackageToSpaces(file.path);
      fileType = 'md';
    } else if (uploadedFileType === 'zip') {
      filePath = extractNovelPackage(file.path);
      fileType = 'md';
    } else if (isSpacesEnabled()) {
      filePath = await uploadSingleNovelFileToSpaces(file, uploadedFileType);
    }

    let coverImage = 'https://via.placeholder.com/150x220.png?text=No+Cover';
    if (req.files['coverImage']) {
      coverImage = isSpacesEnabled()
        ? await uploadCoverToSpaces(req.files['coverImage'][0])
        : toPublicPath(req.files['coverImage'][0].path);
    }

    const newNovel = new Novel({
      title,
      author: req.user.id,
      filePath,
      fileType,
      coverImage,
    });

    const novel = await newNovel.save();
    res.json(novel);
  } catch (err) {
    console.error(err.message);
    res.status(400).json({ msg: err.message || 'Upload failed' });
  }
};

// @desc    Get all novels
// @route   GET /api/novels
// @access  Public
const getNovels = async (req, res) => {
  try {
    const novels = await Novel.find().populate('author', 'name');
    res.json(novels);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get a single novel by ID
// @route   GET /api/novels/:id
// @access  Public
const getNovelById = async (req, res) => {
  try {
    const novel = await Novel.findById(req.params.id).populate('author', 'name');
    if (!novel) {
      return res.status(404).json({ msg: 'Novel not found' });
    }
    res.json(novel);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Novel not found' });
    }
    res.status(500).send('Server Error');
  }
};

// @desc    Get Markdown content for a novel
// @route   GET /api/novels/:id/content
// @access  Private
const getNovelContent = async (req, res) => {
  try {
    const novel = await Novel.findById(req.params.id);

    if (!novel) {
      return res.status(404).json({ msg: 'Novel not found' });
    }

    if (novel.fileType !== 'md') {
      return res.status(400).json({ msg: 'Novel is not a Markdown file' });
    }

    const normalizedPath = toPublicPath(novel.filePath);

    if (/^https?:\/\//i.test(normalizedPath)) {
      const response = await fetch(normalizedPath);

      if (!response.ok) {
        return res.status(response.status).json({ msg: 'Novel content not found' });
      }

      const content = await response.text();
      res.type('text/markdown').send(content);
      return;
    }

    const absolutePath = path.isAbsolute(normalizedPath)
      ? normalizedPath
      : path.join(__dirname, '..', normalizedPath);

    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ msg: 'Novel content not found' });
    }

    res.type('text/markdown').send(fs.readFileSync(absolutePath, 'utf8'));
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Delete a novel
// @route   DELETE /api/novels/:id
// @access  Private/Admin
const deleteNovel = async (req, res) => {
  try {
    const novel = await Novel.findById(req.params.id);

    if (!novel) {
      return res.status(404).json({ msg: 'Novel not found' });
    }

    // Check user
    if (novel.author.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await removeNovelAsset(novel.filePath);
    await removeFileIfExists(novel.coverImage);

    await Novel.deleteOne({ _id: req.params.id });

    res.json({ msg: 'Novel removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Novel not found' });
    }
    res.status(500).send('Server Error');
  }
};

// @desc    Update novel cover
// @route   PUT /api/novels/:id/cover
// @access  Private/Admin
const updateNovelCover = async (req, res) => {
  try {
    const novel = await Novel.findById(req.params.id);

    if (!novel) {
      return res.status(404).json({ msg: 'Novel not found' });
    }

    // Check user
    if (novel.author.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    if (!req.file) {
      return res.status(400).json({ msg: 'Please upload a file' });
    }

    // Delete old cover if it's not the placeholder and exists
    if (novel.coverImage && !novel.coverImage.includes('via.placeholder.com')) {
      await removeFileIfExists(novel.coverImage);
    }

    novel.coverImage = isSpacesEnabled()
      ? await uploadCoverToSpaces(req.file)
      : toPublicPath(req.file.path);
    await novel.save();

    res.json(novel);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Novel not found' });
    }
    res.status(500).send('Server Error');
  }
};


module.exports = {
  uploadNovel,
  getNovels,
  getNovelById,
  getNovelContent,
  deleteNovel,
  updateNovelCover,
};
