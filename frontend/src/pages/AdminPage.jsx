import React, { useContext, useState, useEffect } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const API_BASE_URL = 'https://novel-hosting.onrender.com';
const buildAssetUrl = (assetPath = '') => {
  if (/^(https?:|data:|blob:)/i.test(assetPath)) {
    return assetPath;
  }

  return `${API_BASE_URL}/${assetPath.replace(/\\/g, '/').replace(/^\/+/, '')}`;
};

const AdminPage = () => {
  const { user } = useContext(AuthContext);
  const canUploadNovel = Boolean(user?.isAdmin || user?.canUpload);
  const canManageSite = Boolean(user?.isAdmin);

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
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [invitationCodes, setInvitationCodes] = useState([]);
  const [codesLoading, setCodesLoading] = useState(false);
  const [newInvitationCode, setNewInvitationCode] = useState('');

  useEffect(() => {
    fetchNovels();
  }, []);

  useEffect(() => {
    if (canManageSite) {
      fetchUsers();
      fetchInvitationCodes();
    }
  }, [canManageSite]);

  const fetchNovels = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/novels`);
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
    if (!canUploadNovel) {
      setError('您没有上传权限。');
      return;
    }

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
      const res = await axios.post(`${API_BASE_URL}/api/novels`, formData, config);
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
      await axios.put(`${API_BASE_URL}/api/novels/${novelId}/cover`, formData, config);
      alert('封面更新成功');
      fetchNovels();
    } catch (err) {
      alert(err.response?.data?.msg || '封面更新失败');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('确定要删除这本小说吗？')) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/novels/${id}`);
      setNovels(novels.filter(n => n._id !== id));
    } catch (err) {
      alert('删除失败');
    }
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/admin/users`);
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchInvitationCodes = async () => {
    setCodesLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/admin/invitation-codes`);
      setInvitationCodes(res.data);
    } catch (err) {
      console.error('Failed to fetch invitation codes', err);
    } finally {
      setCodesLoading(false);
    }
  };

  const handleCreateInvitationCode = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/api/admin/invitation-codes`, {
        code: newInvitationCode.trim(),
      });
      setNewInvitationCode('');
      fetchInvitationCodes();
    } catch (err) {
      alert(err.response?.data?.msg || '邀请码创建失败');
    }
  };

  const handleDeleteInvitationCode = async (id) => {
    if (!window.confirm('确定要删除这个邀请码吗？')) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/admin/invitation-codes/${id}`);
      setInvitationCodes(invitationCodes.filter(code => code._id !== id));
    } catch (err) {
      alert(err.response?.data?.msg || '邀请码删除失败');
    }
  };

  const handleToggleUploadPermission = async (member) => {
    try {
      const res = await axios.patch(`${API_BASE_URL}/api/admin/users/${member._id}/permissions`, {
        canUpload: !member.canUpload,
      });
      setUsers(users.map(item => item._id === member._id ? res.data : item));
    } catch (err) {
      alert(err.response?.data?.msg || '权限更新失败');
    }
  };

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
            {!canUploadNovel && <div className="border-[3px] border-correction bg-white px-4 py-3 text-center text-lg text-correction shadow-sketchSm" style={{ borderRadius: '18px 10px 16px 12px / 12px 18px 10px 16px' }}>当前账号没有上传权限。</div>}

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
              disabled={loading || !canUploadNovel}
              className="sketch-button w-full"
            >
              {loading ? '正在上传...' : '确认上传'}
            </button>
          </form>
        </div>

        {canManageSite && <div>
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
                    <img src={buildAssetUrl(novel.coverImage)} alt={novel.title} className="w-full h-full object-cover" />
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
        </div>}
      </div>

      {canManageSite && (
        <div className="mt-14 grid grid-cols-1 gap-12 lg:grid-cols-2">
          <section>
            <h2 className="mb-8 text-4xl">邀请码管理</h2>
            <div className="sketch-panel bg-white p-6 md:p-8">
              <form className="mb-6 flex flex-col gap-3 sm:flex-row" onSubmit={handleCreateInvitationCode}>
                <input
                  className="sketch-input"
                  value={newInvitationCode}
                  onChange={(e) => setNewInvitationCode(e.target.value)}
                  placeholder="留空自动生成"
                />
                <button className="sketch-button shrink-0" type="submit">创建</button>
              </form>

              {codesLoading ? (
                <p className="text-2xl text-pencil/70">加载中...</p>
              ) : (
                <div className="space-y-3">
                  {invitationCodes.map((item) => (
                    <div key={item._id} className="flex flex-wrap items-center justify-between gap-3 border-2 border-pencil bg-paper/70 px-4 py-3" style={{ borderRadius: '18px 10px 16px 12px / 12px 18px 10px 16px' }}>
                      <div>
                        <p className="font-marker text-2xl font-bold text-pencil">{item.code}</p>
                        <p className="text-lg text-pencil/70">{item.used ? '已使用' : '未使用'}</p>
                      </div>
                      <button className="text-lg font-bold text-correction hover:line-through" onClick={() => handleDeleteInvitationCode(item._id)}>
                        删除
                      </button>
                    </div>
                  ))}
                  {invitationCodes.length === 0 && <p className="text-2xl text-pencil/70">暂无邀请码。</p>}
                </div>
              )}
            </div>
          </section>

          <section>
            <h2 className="mb-8 text-4xl">成员权限</h2>
            <div className="sketch-panel bg-white p-6 md:p-8">
              {usersLoading ? (
                <p className="text-2xl text-pencil/70">加载中...</p>
              ) : (
                <div className="space-y-3">
                  {users.map((member) => (
                    <div key={member._id} className="flex flex-wrap items-center justify-between gap-4 border-2 border-pencil bg-paper/70 px-4 py-3" style={{ borderRadius: '18px 10px 16px 12px / 12px 18px 10px 16px' }}>
                      <div className="min-w-0">
                        <p className="truncate font-marker text-2xl font-bold text-pencil">{member.name}</p>
                        <p className="truncate text-lg text-pencil/70">{member.email}</p>
                        <p className="text-base text-pencil/60">{member.isAdmin ? '管理员' : '普通成员'}</p>
                      </div>
                      <label className="flex cursor-pointer items-center gap-3 text-lg font-bold text-pencil">
                        <input
                          type="checkbox"
                          className="h-5 w-5 accent-[#2d5da1]"
                          checked={Boolean(member.canUpload || member.isAdmin)}
                          disabled={member.isAdmin}
                          onChange={() => handleToggleUploadPermission(member)}
                        />
                        可上传文章
                      </label>
                    </div>
                  ))}
                  {users.length === 0 && <p className="text-2xl text-pencil/70">暂无成员。</p>}
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
