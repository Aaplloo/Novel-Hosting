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
  const [fileName, setFileName] = useState('选择文件 (.md, .pdf)');
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
    setFileName(selectedFile ? selectedFile.name : '选择文件 (.md, .pdf)');
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
      setFileName('选择文件 (.md, .pdf)');
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
    <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Upload Section */}
        <div>
          <h2 className="text-3xl font-bold text-slate-900 mb-8">
            上传新小说
          </h2>
          <form className="space-y-6 bg-white p-8 rounded-xl shadow-md" onSubmit={onSubmit}>
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-center">{error}</div>}
            {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg text-center">{success}</div>}

            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-slate-700">
                  小说标题
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-sky-400 focus:border-sky-400 sm:text-sm"
                  placeholder="请输入小说标题"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">小说文件</label>
                <div className="mt-1 flex items-center justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <div className="text-sm text-slate-600">
                      <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-sky-500 hover:text-sky-400">
                        <span>{fileName}</span>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={onFileChange} accept=".md,.pdf" />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">封面图片 (可选)</label>
                <div className="mt-1 flex items-center justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <div className="text-sm text-slate-600">
                      <label htmlFor="cover-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-sky-500 hover:text-sky-400">
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
              className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-sky-400 to-blue-400 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-400 disabled:opacity-50"
            >
              {loading ? '正在上传...' : '确认上传'}
            </button>
          </form>
        </div>

        {/* Management Section */}
        <div>
          <h2 className="text-3xl font-bold text-slate-900 mb-8">
            现有小说管理
          </h2>
          {listLoading ? (
            <p>加载中...</p>
          ) : (
            <div className="space-y-4">
              {novels.map((novel) => (
                <div key={novel._id} className="bg-white p-4 rounded-xl shadow-md flex items-start space-x-4">
                  <div className="flex-shrink-0 w-20 h-28 bg-slate-200 rounded overflow-hidden">
                    <img src={`https://novel-hosting.onrender.com/${novel.coverImage}`} alt={novel.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-lg font-medium text-slate-900 truncate">{novel.title}</p>
                    <p className="text-sm text-slate-500 truncate">作者: {novel.author?.name || 'Unknown'}</p>

                    <div className="mt-3">
                      <label className="text-xs text-sky-500 hover:text-sky-400 cursor-pointer">
                        更换封面
                        <input
                          type="file"
                          className="hidden"
                          accept=".jpg,.jpeg,.png"
                          onChange={(e) => handleUpdateCover(novel._id, e.target.files[0])}
                        />
                      </label>
                      <button onClick={() => handleDelete(novel._id)} className="ml-4 text-xs text-red-600 hover:text-red-500">
                        删除小说
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {novels.length === 0 && <p className="text-slate-500">暂无小说。</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
