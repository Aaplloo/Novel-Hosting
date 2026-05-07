import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminPage = () => {
  // Upload State
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState('选择文件 (.md, .pdf, .zip)');
  const [coverName, setCoverName] = useState('选择封面 (.jpg, .png)');

  // List State
  const [novels, setNovels] = useState([]);
  const [listLoading, setListLoading] = useState(true);

  useEffect(() => {
    fetchNovels();
  }, []);

  const fetchNovels = async () => {
    try {
      const res = await axios.get('https://novel-hosting.onrender.com/api/novels');
      setNovels(res.data);
    } catch (err) {
      console.error('Failed to fetch novels', err);
    } finally {
      setListLoading(false);
    }
  };

  const onFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setFileName(selectedFile ? selectedFile.name : '选择文件 (.md, .pdf, .zip)');
  };

  const onCoverChange = (e) => {
    const selectedFile = e.target.files[0];
    setCoverImage(selectedFile);
    setCoverName(selectedFile ? selectedFile.name : '选择封面 (.jpg, .png)');
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('请选择一个文件进行上传。');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('file', file);
    if (coverImage) {
      formData.append('coverImage', coverImage);
    }

    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };
      const res = await axios.post('https://novel-hosting.onrender.com/api/novels', formData, config);
      setSuccess(`小说《${res.data.title}》上传成功！`);
      setTitle('');
      setFile(null);
      setCoverImage(null);
      setFileName('选择文件 (.md, .pdf, .zip)');
      setCoverName('选择封面 (.jpg, .png)');
      fetchNovels(); // Refresh list
    } catch (err) {
      setError(err.response?.data?.msg || '上传失败，请确认您是管理员。');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCover = async (novelId, file) => {
    if (!file) return;

    const formData = new FormData();
    formData.append('coverImage', file);

    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };
      await axios.put(`https://novel-hosting.onrender.com/api/novels/${novelId}/cover`, formData, config);
      alert('封面更新成功');
      fetchNovels();
    } catch (err) {
      alert(err.response?.data?.msg || '封面更新失败');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('确定要删除这本小说吗？')) return;
    try {
      await axios.delete(`https://novel-hosting.onrender.com/api/novels/${id}`);
      setNovels(novels.filter(n => n._id !== id));
    } catch (err) {
      alert('删除失败');
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <div className="mb-10">
        <p className="mb-3 inline-block rotate-1 border-2 border-pencil bg-postit px-3 py-1 text-lg font-bold shadow-sketchSm">admin clipboard</p>
        <h1 className="text-5xl leading-tight md:text-6xl">整理故事档案</h1>
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        <div>
          <h2 className="mb-8 text-4xl">
            上传新小说
          </h2>
          <form className="sketch-panel space-y-6 bg-white p-6 md:p-8" onSubmit={onSubmit}>
            {error && <div className="border-[3px] border-correction bg-white px-4 py-3 text-center text-lg text-correction shadow-sketchSm" style={{ borderRadius: '18px 10px 16px 12px / 12px 18px 10px 16px' }}>{error}</div>}
            {success && <div className="border-[3px] border-ballpoint bg-postit px-4 py-3 text-center text-lg text-pencil shadow-sketchSm" style={{ borderRadius: '18px 10px 16px 12px / 12px 18px 10px 16px' }}>{success}</div>}

            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-lg font-bold text-pencil">
                  小说标题
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  required
                  className="sketch-input mt-1"
                  placeholder="请输入小说标题"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-lg font-bold text-pencil">小说文件</label>
                <div className="sketch-dashed-box mt-1 flex items-center justify-center px-6 pb-6 pt-5">
                  <div className="space-y-1 text-center">
                    <div className="text-lg text-pencil/70">
                      <label htmlFor="file-upload" className="sketch-link relative cursor-pointer bg-white px-2 font-bold">
                        <span>{fileName}</span>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={onFileChange} accept=".md,.pdf,.zip" />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-lg font-bold text-pencil">封面图片 (可选)</label>
                <div className="sketch-dashed-box mt-1 flex items-center justify-center px-6 pb-6 pt-5">
                  <div className="space-y-1 text-center">
                    <div className="text-lg text-pencil/70">
                      <label htmlFor="cover-upload" className="sketch-link relative cursor-pointer bg-white px-2 font-bold">
                        <span>{coverName}</span>
                        <input id="cover-upload" name="cover-upload" type="file" className="sr-only" onChange={onCoverChange} accept=".jpg,.jpeg,.png" />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="sketch-button w-full"
            >
              {loading ? '正在上传...' : '确认上传'}
            </button>
          </form>
        </div>

        <div>
          <h2 className="mb-8 text-4xl">
            现有小说管理
          </h2>
          {listLoading ? (
            <p className="text-2xl text-pencil/70">加载中...</p>
          ) : (
            <div className="space-y-4">
              {novels.map((novel) => (
                <div key={novel._id} className="sketch-card flex items-start gap-4 p-4 odd:-rotate-1 even:rotate-1">
                  <div className="h-28 w-20 flex-shrink-0 overflow-hidden border-2 border-pencil bg-erased" style={{ borderRadius: '18px 8px 16px 10px / 10px 18px 8px 16px' }}>
                    <img src={`https://novel-hosting.onrender.com/${novel.coverImage}`} alt={novel.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-marker text-2xl font-bold text-pencil">{novel.title}</p>
                    <p className="truncate text-lg text-pencil/70">作者: {novel.author?.name || 'Unknown'}</p>

                    <div className="mt-3">
                      <label className="sketch-link cursor-pointer text-base font-bold">
                        更换封面
                        <input
                          type="file"
                          className="hidden"
                          accept=".jpg,.jpeg,.png"
                          onChange={(e) => handleUpdateCover(novel._id, e.target.files[0])}
                        />
                      </label>
                      <button onClick={() => handleDelete(novel._id)} className="ml-4 text-base font-bold text-correction hover:line-through">
                        删除小说
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {novels.length === 0 && <p className="text-2xl text-pencil/70">暂无小说。</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
