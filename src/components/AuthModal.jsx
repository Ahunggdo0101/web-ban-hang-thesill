import { useState, useEffect } from 'react';
import { X, Sparkles, AlertCircle, Settings, Mail, User, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal() {
  const { isAuthModalOpen, setIsAuthModalOpen, login, loginWithPassword, register } = useAuth();
  
  // Cấu hình Google
  const [googleClientId, setGoogleClientId] = useState(
    localStorage.getItem('thesill_google_client_id') || ''
  );
  const [showConfig, setShowConfig] = useState(false);
  const [showAccountChooser, setShowAccountChooser] = useState(false);
  
  // Custom inputs cho Google mock bypass
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [showCustomForm, setShowCustomForm] = useState(false);

  // States cho Email + Mật khẩu
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Danh sách tài khoản mock để đăng nhập nhanh Google
  const mockAccounts = [
    {
      name: 'Đỗ Xuân Hùng ⚙️',
      email: 'dohungg0101@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=150',
    },
    {
      name: 'Nguyễn Văn An',
      email: 'an.nguyen@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
    },
    {
      name: 'Lê Mai Chi',
      email: 'chi.le@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
    },
    {
      name: 'Trần Minh Đức',
      email: 'duc.tran@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=150',
    }
  ];

  // Tải SDK Google thật nếu có Google Client ID
  useEffect(() => {
    if (!isAuthModalOpen || !googleClientId) return;

    let script = document.getElementById('google-jssdk');
    if (!script) {
      script = document.createElement('script');
      script.id = 'google-jssdk';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }

    const initGoogleSignIn = () => {
      if (window.google && window.google.accounts) {
        try {
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: handleGoogleCredential,
          });
          window.google.accounts.id.renderButton(
            document.getElementById('real-google-btn'),
            { theme: 'outline', size: 'large', width: '100%' }
          );
        } catch (err) {
          console.error('Failed to initialize Google Auth:', err);
          setError('Không thể khởi tạo Client ID. Vui lòng kiểm tra lại ID của bạn.');
        }
      } else {
        setTimeout(initGoogleSignIn, 500);
      }
    };

    initGoogleSignIn();
  }, [isAuthModalOpen, googleClientId]);

  if (!isAuthModalOpen) return null;

  const handleGoogleCredential = async (response) => {
    try {
      setError(null);
      const res = await login({
        idToken: response.credential,
      });
      if (res && !res.success) {
        setError(res.error || 'Đã xảy ra lỗi khi xác thực tài khoản Google.');
      }
    } catch (err) {
      setError('Đã xảy ra lỗi khi kết nối với máy chủ.');
    }
  };

  const handleMockLogin = async (account) => {
    setError(null);
    const res = await login({
      idToken: 'mock-bypass-token',
      bypassEmail: account.email,
      bypassName: account.name.replace(' ⚙️', ''),
    });
    
    if (res && res.success) {
      setShowAccountChooser(false);
    } else {
      setError(res?.error || 'Đăng nhập mô phỏng thất bại.');
    }
  };

  const handleCustomLoginSubmit = async (e) => {
    e.preventDefault();
    if (!customName || !customEmail) {
      setError('Vui lòng điền đầy đủ tên và email.');
      return;
    }
    if (!customEmail.includes('@')) {
      setError('Email không hợp lệ.');
      return;
    }

    setError(null);
    const res = await login({
      idToken: 'mock-bypass-token',
      bypassEmail: customEmail,
      bypassName: customName,
    });

    if (res && res.success) {
      setShowAccountChooser(false);
      setShowCustomForm(false);
    } else {
      setError(res?.error || 'Đăng nhập mô phỏng thất bại.');
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setName('');
    setEmail('');
    setPassword('');
    setError(null);
    setShowPassword(false);
  };

  const handlePasswordAuthSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Vui lòng điền đầy đủ các trường.');
      return;
    }
    if (activeTab === 'register' && !name) {
      setError('Vui lòng nhập họ tên.');
      return;
    }
    if (activeTab === 'register' && password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      let res;
      if (activeTab === 'login') {
        res = await loginWithPassword(email, password);
      } else {
        res = await register(name, email, password);
      }

      if (res && res.success) {
        setName('');
        setEmail('');
        setPassword('');
      } else {
        setError(res?.error || 'Tài khoản hoặc mật khẩu không chính xác.');
      }
    } catch (err) {
      setError('Không thể kết nối tới máy chủ.');
    }
  };

  const saveClientId = (e) => {
    e.preventDefault();
    if (googleClientId.trim()) {
      localStorage.setItem('thesill_google_client_id', googleClientId.trim());
      setError(null);
      alert('Đã lưu Google Client ID. Hệ thống sẽ cố gắng tải nút đăng nhập Google chính thức.');
    } else {
      localStorage.removeItem('thesill_google_client_id');
      setGoogleClientId('');
      alert('Đã xóa Client ID. Hệ thống sẽ quay về chế độ mô phỏng.');
    }
    setShowConfig(false);
  };

  const handleClose = () => {
    setIsAuthModalOpen(false);
    setShowAccountChooser(false);
    setShowCustomForm(false);
    setError(null);
    setName('');
    setEmail('');
    setPassword('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 xs:p-4">
      {/* Backdrop with simple opacity fallback for performance */}
      <div
        className="absolute inset-0 bg-[#0D231A]/45 transition-opacity duration-300"
        onClick={handleClose}
      />

      {/* Modal Container */}
      <div className="relative bg-brand-cream w-full max-w-md modal-panel border border-brand-sand shadow-2xl animate-fade-in z-10 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center px-4 xs:px-6 py-4 border-b border-brand-sand">
          <span className="font-serif text-lg text-brand-forest lowercase tracking-wider">
            nghệ nhân đỗ xuân hùng account
          </span>
          <button
            onClick={handleClose}
            className="text-brand-charcoal hover:text-brand-moss p-1 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 xs:p-6 space-y-6">
          
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 flex items-start space-x-3 text-red-800 text-xs">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {!showAccountChooser ? (
            <>
              {/* Tab Selector */}
              <div className="flex border-b border-brand-sand">
                <button
                  type="button"
                  onClick={() => handleTabChange('login')}
                  className={`flex-1 pb-3 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    activeTab === 'login'
                      ? 'border-b-2 border-brand-forest text-brand-forest'
                      : 'text-[#888] hover:text-brand-charcoal'
                  }`}
                >
                  Đăng nhập
                </button>
                <button
                  type="button"
                  onClick={() => handleTabChange('register')}
                  className={`flex-1 pb-3 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    activeTab === 'register'
                      ? 'border-b-2 border-brand-forest text-brand-forest'
                      : 'text-[#888] hover:text-brand-charcoal'
                  }`}
                >
                  Đăng ký
                </button>
              </div>

              {/* Email + Password Form */}
              <form onSubmit={handlePasswordAuthSubmit} className="space-y-4">
                {activeTab === 'register' && (
                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase tracking-wider text-brand-moss font-semibold">
                      Họ và tên
                    </label>
                    <div className="relative">
                      <User size={14} className="absolute left-3 top-3 text-[#999]" />
                      <input
                        type="text"
                        required
                        placeholder="Nguyễn Văn A"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full border border-brand-sand bg-white pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-brand-forest"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="block text-[10px] uppercase tracking-wider text-brand-moss font-semibold">
                    Địa chỉ Email
                  </label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-3 text-[#999]" />
                    <input
                      type="email"
                      required
                      placeholder="email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full border border-brand-sand bg-white pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-brand-forest"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] uppercase tracking-wider text-brand-moss font-semibold">
                    Mật khẩu
                  </label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-3 text-[#999]" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder={activeTab === 'login' ? '••••••••' : 'Tối thiểu 6 ký tự'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full border border-brand-sand bg-white pl-9 pr-10 py-2.5 text-sm focus:outline-none focus:border-brand-forest"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-brand-moss hover:text-brand-forest cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand-forest text-brand-cream hover:bg-brand-moss py-3 text-[11px] font-bold uppercase tracking-widest transition-colors cursor-pointer disabled:opacity-50"
                >
                  {loading
                    ? 'Đang xử lý...'
                    : activeTab === 'login'
                    ? 'Đăng nhập'
                    : 'Tạo tài khoản'}
                </button>
              </form>

              {/* Or separator */}
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-brand-sand"></div>
                <span className="flex-shrink mx-4 text-[#888] text-[10px] uppercase tracking-wider font-semibold">
                  Hoặc
                </span>
                <div className="flex-grow border-t border-brand-sand"></div>
              </div>

              {/* Google Sign In Buttons */}
              <div className="space-y-3">
                {googleClientId ? (
                  <div className="w-full flex justify-center py-1">
                    <div id="real-google-btn" className="w-full"></div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowAccountChooser(true)}
                    className="w-full flex items-center justify-center space-x-3 bg-white border border-brand-sand py-3 px-4 hover:bg-brand-cream/50 active:bg-brand-sand/20 transition-all font-sans font-medium text-sm text-brand-charcoal cursor-pointer shadow-sm"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Tiếp tục với Google</span>
                  </button>
                )}

                {/* Info bypass cho Dev */}
                <div className="bg-[#1F3E35]/5 p-3.5 border border-[#1F3E35]/10 space-y-1 rounded-sm">
                  <div className="flex items-center space-x-2 text-brand-forest text-[11px] font-semibold">
                    <Sparkles size={13} className="text-brand-clay" />
                    <span>Demo Mode (Đăng nhập Google mô phỏng)</span>
                  </div>
                  <p className="text-[10px] text-[#666] leading-relaxed">
                    Mặc định, nút Google sẽ mở danh sách tài khoản Google mock để kiểm thử nhanh. Bạn cũng có thể đăng ký tài khoản mới bằng Email + Mật khẩu ở form trên.
                  </p>
                </div>
              </div>

              {/* Config Client ID ẩn */}
              <div className="pt-4 border-t border-brand-sand">
                <button
                  onClick={() => setShowConfig(!showConfig)}
                  className="flex items-center space-x-2 text-[10px] text-[#888] hover:text-brand-forest transition-colors cursor-pointer"
                >
                  <Settings size={12} />
                  <span>{showConfig ? 'Ẩn cấu hình phát triển' : 'Cấu hình Google Client ID thật'}</span>
                </button>

                {showConfig && (
                  <form onSubmit={saveClientId} className="mt-3 space-y-3 p-3 bg-white border border-brand-sand">
                    <label className="block text-[9px] uppercase tracking-wider font-semibold text-brand-charcoal">
                      Google OAuth Client ID
                    </label>
                    <input
                      type="text"
                      placeholder="Nhập Client ID của bạn..."
                      value={googleClientId}
                      onChange={(e) => setGoogleClientId(e.target.value)}
                      className="w-full bg-brand-cream border border-brand-sand p-2 text-xs text-brand-charcoal focus:outline-none focus:border-brand-forest font-mono"
                    />
                    <div className="flex space-x-2">
                      <button
                        type="submit"
                        className="bg-brand-forest text-brand-cream text-[9px] py-1.5 px-3 uppercase tracking-wider font-bold hover:bg-brand-moss transition-colors cursor-pointer"
                      >
                        Lưu cấu hình
                      </button>
                      {googleClientId && (
                        <button
                          type="button"
                          onClick={() => {
                            localStorage.removeItem('thesill_google_client_id');
                            setGoogleClientId('');
                            setShowConfig(false);
                            alert('Đã xóa cấu hình Client ID. Quay về chế độ mô phỏng.');
                          }}
                          className="border border-[#bbb] text-brand-charcoal text-[9px] py-1.5 px-3 uppercase tracking-wider font-bold hover:bg-gray-100 transition-colors cursor-pointer"
                        >
                          Xóa
                        </button>
                      )}
                    </div>
                  </form>
                )}
              </div>
            </>
          ) : (
            // Google Mock Account Chooser
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <div className="inline-flex items-center justify-center space-x-1.5 bg-[#4285F4]/10 py-1.5 px-3 rounded-full text-[#4285F4] text-[10px] font-bold uppercase tracking-wider mb-2">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  </svg>
                  <span>Google Accounts</span>
                </div>
                <h3 className="font-sans font-semibold text-lg text-brand-charcoal">
                  Chọn tài khoản để tiếp tục
                </h3>
                <p className="text-xs text-brand-moss">
                  để đăng nhập vào trang **nghệ nhân đỗ xuân hùng**
                </p>
              </div>

              {!showCustomForm ? (
                <div className="border border-brand-sand bg-white divide-y divide-brand-sand rounded-sm overflow-hidden">
                  {mockAccounts.map((acc, index) => (
                    <button
                      key={index}
                      onClick={() => handleMockLogin(acc)}
                      className="w-full flex items-center space-x-3 p-4 hover:bg-brand-cream/50 active:bg-brand-cream transition-all text-left cursor-pointer"
                    >
                      <img
                        src={acc.avatar}
                        alt={acc.name}
                        className="w-10 h-10 rounded-full object-cover border border-brand-sand"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-brand-charcoal truncate">
                          {acc.name}
                        </p>
                        <p className="text-xs text-[#666] truncate">{acc.email}</p>
                      </div>
                    </button>
                  ))}

                  <button
                    onClick={() => setShowCustomForm(true)}
                    className="w-full flex items-center space-x-3 p-4 hover:bg-brand-cream/50 active:bg-brand-cream transition-all text-left text-brand-clay text-xs font-semibold cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-full border border-dashed border-brand-clay flex items-center justify-center shrink-0">
                      <User size={16} />
                    </div>
                    <span>Sử dụng một tài khoản khác</span>
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCustomLoginSubmit} className="space-y-4 p-4 bg-white border border-brand-sand rounded-sm">
                  <h4 className="text-xs font-bold text-brand-forest uppercase tracking-wider">
                    Nhập tài khoản Google mới
                  </h4>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="block text-[10px] uppercase tracking-wider text-brand-moss font-semibold">
                        Họ và tên
                      </label>
                      <div className="relative">
                        <User size={14} className="absolute left-3 top-3 text-[#999]" />
                        <input
                          type="text"
                          required
                          placeholder="Nguyễn Văn A"
                          value={customName}
                          onChange={(e) => setCustomName(e.target.value)}
                          className="w-full bg-brand-cream border border-brand-sand pl-9 p-2.5 text-xs text-brand-charcoal focus:outline-none focus:border-brand-forest"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] uppercase tracking-wider text-brand-moss font-semibold">
                        Địa chỉ Email
                      </label>
                      <div className="relative">
                        <Mail size={14} className="absolute left-3 top-3 text-[#999]" />
                        <input
                          type="email"
                          required
                          placeholder="ten.email@gmail.com"
                          value={customEmail}
                          onChange={(e) => setCustomEmail(e.target.value)}
                          className="w-full bg-brand-cream border border-brand-sand pl-9 p-2.5 text-xs text-brand-charcoal focus:outline-none focus:border-brand-forest"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <button
                      type="submit"
                      className="flex-1 bg-[#4285F4] text-white py-2 px-4 text-xs font-bold uppercase tracking-wider hover:bg-blue-600 transition-colors cursor-pointer text-center"
                    >
                      Đăng nhập
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCustomForm(false)}
                      className="border border-[#bbb] text-brand-charcoal py-2 px-4 text-xs font-bold uppercase tracking-wider hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      Quay lại
                    </button>
                  </div>
                </form>
              )}

              <div className="text-center">
                <button
                  onClick={() => setShowAccountChooser(false)}
                  className="text-xs text-brand-moss hover:text-brand-forest hover:underline transition-all cursor-pointer font-semibold"
                >
                  Quay lại menu Đăng nhập
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
