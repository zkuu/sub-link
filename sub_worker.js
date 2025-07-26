// index.js
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const kv = env.KV;
    const PASSWORD = env.ACCESS_PASSWORD || "admin123"; // 默认密码
    // 验证密码
    const isAuthenticated = await checkAuth(request, PASSWORD);
    
    // 登录处理
    if (path === '/login') {
      if (request.method === 'POST') {
        return handleLogin(request, PASSWORD);
      } else {
        // 显示登录页面时检查是否有错误参数
        const error = url.searchParams.get('error');
        return showLoginPage(error);
      }
    }
    
    // 密码保护
    if (!isAuthenticated) {
      // 重定向到登录页，不带错误信息
      return Response.redirect(new URL('/login', request.url), 302);
    }
    // 主页面
    if (path === '/' && request.method === 'GET') {
      return mainHandler(kv);
    }
    
    // 管理页面
    if (path === '/admin' && request.method === 'GET') {
      return adminHandler(kv);
    }
    
    // 保存数据
    if (path === '/save' && request.method === 'POST') {
      return saveHandler(request, kv);
    }
    
    // 退出登录
    if (path === '/logout') {
      return handleLogout();
    }
    
    return new Response('Not Found', { status: 404 });
  }
};
// 验证身份
async function checkAuth(request, password) {
  // 从cookie中获取token
  const cookie = request.headers.get('Cookie') || '';
  const tokenMatch = cookie.match(/access_token=([^;]+)/);
  
  if (tokenMatch) {
    const token = tokenMatch[1];
    return token === password;
  }
  
  return false;
}
// 显示登录页面 (添加错误处理)
function showLoginPage(error = null) {
  const errorMessage = error ? 
    `<div class="error-message">哎呦~想白嫖？</div>` : 
    '';
    
  // 在登录容器后添加页脚
  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <title>登录</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
      :root {
        --primary: #4361ee;
        --secondary: #3f37c9;
        --light: #f8f9fa;
        --dark: #212529;
        --success: #4cc9f0;
        --error: #e63946;
      }
      
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }
      
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        min-height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 20px;
      }
      
      .login-container {
        background: white;
        border-radius: 16px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        width: 100%;
        max-width: 400px;
        padding: 40px 30px;
        text-align: center;
        position: relative;
      }
      
      .logo {
        color: var(--primary);
        font-size: 2.5rem;
        margin-bottom: 20px;
      }
      
      h1 {
        color: var(--dark);
        margin-bottom: 15px;
        font-weight: 600;
      }
      
      .form-group {
        margin-bottom: 20px;
        text-align: left;
      }
      
      label {
        display: block;
        margin-bottom: 8px;
        color: var(--dark);
        font-weight: 500;
      }
      
      input {
        width: 100%;
        padding: 14px;
        border: 2px solid #e1e5eb;
        border-radius: 10px;
        font-size: 16px;
        transition: border-color 0.3s;
      }
      
      input:focus {
        border-color: var(--primary);
        outline: none;
        box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.2);
      }
      
      input.error {
        border-color: var(--error);
      }
      
      .error-message {
        color: var(--error);
        background: rgba(230, 57, 70, 0.1);
        padding: 10px 15px;
        border-radius: 8px;
        margin: 15px 0;
        font-weight: 500;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
      }
      
      button {
        background: var(--primary);
        color: white;
        border: none;
        border-radius: 10px;
        padding: 14px;
        width: 100%;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.3s, transform 0.2s;
        margin-top: 10px;
      }
      
      button:hover {
        background: var(--secondary);
        transform: translateY(-2px);
      }
      
      .message {
        margin-top: 20px;
        color: #6c757d;
      }
      
      .message a {
        color: var(--primary);
        text-decoration: none;
      }
      
      /* 密码可见性切换 */
      .password-container {
        position: relative;
      }
      
      .toggle-password {
        position: absolute;
        right: 15px;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        color: #6c757d;
        cursor: pointer;
        width: auto;
        padding: 0;
      }
	  
      .login-footer {
        position: fixed;
        bottom: 0;
        width: 100%;
        text-align: center;
        padding: 15px;
        color: #6c757d;
        font-size: 0.9rem;
        background: rgba(255, 255, 255, 0.8);
        backdrop-filter: blur(5px);
        border-top: 1px solid rgba(0, 0, 0, 0.1);
      }
      
      .login-footer p {
        margin: 5px 0;
        line-height: 1.6;
      }
      
      .login-footer-links {
        display: flex;
        justify-content: center;
        gap: 15px;
        margin-top: 10px;
      }
      
      .login-footer-links a {
        color: #4361ee;
        text-decoration: none;
        font-weight: 500;
      }
      
      .login-footer-links a:hover {
        text-decoration: underline;
      }
      
      @media (max-width: 480px) {
        .login-footer {
          padding: 10px;
          font-size: 0.8rem;
        }
        
        .login-footer-links {
          flex-direction: column;
          gap: 5px;
        }
      }
    </style>
  </head>
  <body>
    <div class="login-container">
      <div class="logo">🔒</div>
      <h1>订阅管理器</h1>
      ${errorMessage}
      <form id="loginForm" method="POST" action="/login">
        <div class="form-group">
          <label for="password">请输入神秘代码</label>
          <div class="password-container">
            <input type="password" id="password" name="password" required ${error ? 'class="error"' : ''}>
            <button type="button" class="toggle-password" id="togglePassword">
              <i class="fas fa-eye"></i>
            </button>
          </div>
        </div>
        <button type="submit" id="loginBtn">登录</button>
      </form>
      <div class="message">默认密码: admin123</div>
    </div>
	
	<!-- 新增的页脚 -->
    <footer class="login-footer">
      <p>© ${new Date().getFullYear()} 订阅管理器 | 安全访问您的链接收藏</p>
      <p>由Cloudflare Workers提供边缘计算服务</p>
      <div class="login-footer-links">
        <a href="/">首页</a>
        <a href="https://workers.cloudflare.com" target="_blank">关于Cloudflare Workers</a>
      </div>
    </footer>
    
    <script>
      // 密码可见性切换
      const togglePassword = document.getElementById('togglePassword');
      const passwordInput = document.getElementById('password');
      
      togglePassword.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        // 更新图标
        if (type === 'text') {
          this.innerHTML = '<i class="fas fa-eye-slash"></i>';
        } else {
          this.innerHTML = '<i class="fas fa-eye"></i>';
        }
      });
      
      // 防止重复提交
      const loginForm = document.getElementById('loginForm');
      const loginBtn = document.getElementById('loginBtn');
      
      loginForm.addEventListener('submit', function() {
        loginBtn.disabled = true;
        loginBtn.innerHTML = '登录中...';
      });
    </script>
  </body>
  </html>
  `;
  
  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=UTF-8' }
  });
}
// 处理登录
async function handleLogin(request, password) {
  try {
    const formData = await request.formData();
    const inputPassword = formData.get('password');
    
    if (inputPassword === password) {
      const headers = new Headers();
      headers.append('Location', '/');
      headers.append('Set-Cookie', `access_token=${password}; HttpOnly; Path=/; Max-Age=86400`); // 1天有效期
      return new Response(null, {
        status: 302,
        headers
      });
    }
    
    // 密码错误，重定向到登录页并带错误参数
    const url = new URL('/login', request.url);
    url.searchParams.append('error', '1');
    return Response.redirect(url, 302);
    
  } catch (e) {
    // 处理异常情况
    const url = new URL('/login', request.url);
    url.searchParams.append('error', '1');
    return Response.redirect(url, 302);
  }
}
// 处理退出
function handleLogout() {
  const headers = new Headers();
  headers.append('Location', '/login');
  headers.append('Set-Cookie', 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/');
  return new Response(null, {
    status: 302,
    headers
  });
}
// 主页面处理器
async function mainHandler(kv) {
  const data = await kv.get('link_data');
  const links = data ? JSON.parse(data) : { groups: [] };
  
  // 定义分组颜色方案
  const groupColors = [
    '#4361ee', // 蓝色
    '#7209b7', // 紫色
    '#f72585', // 粉色
    '#4cc9f0', // 青色
    '#2a9d8f', // 绿色
    '#f77f00', // 橙色
    '#9d4edd', // 深紫
    '#00bbf9'  // 蓝绿
  ];
  
  const html = `
  <!DOCTYPE html>
  <html lang="zh-CN">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>订阅链接</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
      :root {
        --primary: #4361ee;
        --primary-light: #4895ef;
        --secondary: #3f37c9;
        --accent: #4cc9f0;
        --light: #f8f9fa;
        --dark: #212529;
        --gray: #6c757d;
        --success: #2ecc71;
        --card-bg: #ffffff;
        --border: #e1e5eb;
      }
      
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }
      
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background: #f0f2f5;
        color: var(--dark);
        line-height: 1.6;
        padding: 0;
        min-height: 100vh;
        position: relative;
        padding-bottom: 80px;
      }
      
      .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
      }
      
      header {
        background: linear-gradient(120deg, var(--primary), var(--primary-light));
        color: white;
        padding: 20px 0;
        border-radius: 0 0 20px 20px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        margin-bottom: 30px;
      }
      
      .header-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 20px;
      }
      
      h1 {
        font-size: 1.8rem;
        font-weight: 700;
      }
      
      .actions {
        display: flex;
        gap: 15px;
      }
      
      .btn {
        background: rgba(255, 255, 255, 0.2);
        color: white;
        border: none;
        border-radius: 50px;
        padding: 10px 20px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .btn:hover {
        background: rgba(255, 255, 255, 0.3);
        transform: translateY(-2px);
      }
      
      .btn-admin {
        background: var(--accent);
      }
      
      .btn-logout {
        background: rgba(255, 255, 255, 0.1);
      }
      
      .groups-container {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 25px;
      }
      
      .group {
        background: var(--card-bg);
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
        transition: transform 0.3s, box-shadow 0.3s;
      }
      
      .group:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
      }
      
      .group-header {
        color: white;
        padding: 15px 20px;
      }
      
      .group-title {
        font-size: 1.3rem;
        font-weight: 600;
        margin: 0;
      }
      
      .links {
        padding: 20px;
        display: grid;
        grid-template-columns: 1fr;
        gap: 15px;
      }
      
      .link-card {
        background: var(--card-bg);
        border: 1px solid var(--border);
        border-radius: 12px;
        padding: 15px;
        display: flex;
        transition: all 0.3s;
        position: relative;
        align-items: center;
      }
      
      .link-card:hover {
        border-color: var(--accent);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
      }
      
      .link-info {
        flex-grow: 1;
        overflow: hidden;
        min-width: 0;
      }
      
      .link-name {
        font-size: 1.1rem;
        font-weight: 600;
        margin: 0 0 8px 0;
        color: var(--dark);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .link-url {
        color: var(--gray);
        font-size: 0.9rem;
        word-break: break-all;
      }
      
      .link-actions {
        display: flex;
        gap: 8px;
        flex-shrink: 0;
        margin-left: 10px;
      }
      
      .action-btn {
        color: white;
        border: none;
        border-radius: 8px;
        padding: 0;
        cursor: pointer;
        transition: all 0.3s;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        flex-shrink: 0;
        position: relative;
      }
      
      .action-btn i {
        font-size: 18px;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        transition: all 0.3s;
      }
      
      .action-btn:hover {
        filter: brightness(0.9);
        transform: translateY(-2px);
      }
      
      .copy-success {
        opacity: 0;
        transform: translate(-50%, -50%) scale(0.8);
      }
      
      .action-btn.copied .copy-icon {
        opacity: 0;
        transform: translate(-50%, -50%) scale(0.8);
      }
      
      .action-btn.copied .copy-success {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1);
      }
      
      .empty-state {
        text-align: center;
        padding: 40px 20px;
        color: var(--gray);
      }
      
      .empty-state p {
        margin: 10px 0 20px;
      }
      
      .empty-btn {
        background: var(--primary);
        color: white;
        border: none;
        border-radius: 50px;
        padding: 12px 25px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s;
      }
      
      .empty-btn:hover {
        background: var(--secondary);
        transform: translateY(-2px);
      }
      
      /* 二维码模态框 */
      .modal {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.7);
        z-index: 1000;
        justify-content: center;
        align-items: center;
      }
      
      .modal-content {
        background: white;
        border-radius: 16px;
        padding: 30px;
        text-align: center;
        width: 300px;
        max-width: 90%;
        max-height: 90%;
        overflow: auto;
        position: relative;
      }
      
      .close-modal {
        position: absolute;
        top: 15px;
        right: 15px;
        font-size: 1.5rem;
        cursor: pointer;
        color: #666;
      }
      
      .qr-code-container {
        margin: 20px 0;
        padding: 15px;
        background: white;
        border-radius: 10px;
        display: inline-block;
      }
      
      .qr-title {
        font-size: 1.2rem;
        margin-bottom: 15px;
        color: var(--dark);
      }
      
      .qr-buttons {
        display: flex;
        gap: 10px;
        justify-content: center;
        margin-top: 20px;
      }
      
      .qr-btn {
        padding: 10px 15px;
        border-radius: 8px;
        border: none;
        cursor: pointer;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .qr-btn-download {
        background: #4361ee;
        color: white;
      }
      
      .qr-btn-close {
        background: #e9ecef;
        color: #495057;
      }
      
      #qrCodeCanvas {
        width: 200px;
        height: 200px;
        display: block;
        margin: 0 auto;
      }
      
      .footer {
        position: absolute;
        bottom: 0;
        width: 100%;
        text-align: center;
        padding: 20px;
        color: #6c757d;
        font-size: 0.9rem;
        background: #f8f9fa;
        border-top: 1px solid #e9ecef;
      }
      
      .footer-content {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 20px;
      }
      
      .footer p {
        margin: 5px 0;
        line-height: 1.6;
      }
      
      .footer-links {
        display: flex;
        justify-content: center;
        gap: 15px;
        margin-top: 10px;
      }
      
      .footer-links a {
        color: var(--primary);
        text-decoration: none;
      }
      
      .footer-links a:hover {
        text-decoration: underline;
      }
      
      @media (max-width: 768px) {
        .header-content {
          flex-direction: column;
          gap: 15px;
          text-align: center;
        }
        
        .actions {
          width: 100%;
          justify-content: center;
        }
        
        .groups-container {
          grid-template-columns: 1fr;
        }
        
        .footer {
          position: relative;
          margin-top: 40px;
        }
      }
      
      @media (max-width: 480px) {
        h1 {
          font-size: 1.5rem;
        }
        
        .btn {
          padding: 8px 15px;
          font-size: 0.9rem;
        }
        
        .action-btn {
          width: 36px;
          height: 36px;
        }
        
        .action-btn i {
          font-size: 16px;
        }
        
        .footer {
          padding: 15px;
          font-size: 0.8rem;
        }
        
        .footer-links {
          flex-direction: column;
          gap: 5px;
        }
      }
    </style>
  </head>
  <body>
    <header>
      <div class="header-content">
        <h1><i class="fas fa-bookmark"></i> 订阅链接</h1>
        <div class="actions">
          <button class="btn btn-admin" onclick="location.href='/admin'">
            <i class="fas fa-edit"></i>
            管理链接
          </button>
          <button class="btn btn-logout" onclick="location.href='/logout'">
            <i class="fas fa-sign-out-alt"></i>
            退出
          </button>
        </div>
      </div>
    </header>
    
    <div class="container">
      ${links.groups.length > 0 ? `
        <div class="groups-container">
          ${links.groups.map((group, gIndex) => {
            const colorIndex = gIndex % groupColors.length;
            const groupColor = groupColors[colorIndex];
            return `
            <div class="group">
              <div class="group-header" style="background: ${groupColor}">
                <h2 class="group-title">${group.name}</h2>
              </div>
              <div class="links">
                ${group.links.map(link => `
                  <div class="link-card">
                    <div class="link-info">
                      <h3 class="link-name">${link.name}</h3>
                      <div class="link-url">${link.url}</div>
                    </div>
                    <div class="link-actions">
                      <button class="action-btn copy-btn" data-url="${link.url}" style="background: ${groupColor}" title="复制链接">
                        <i class="fas fa-copy copy-icon"></i>
                        <i class="fas fa-check copy-success"></i>
                      </button>
                      <button class="action-btn qr-btn" data-url="${link.url}" data-name="${link.name}" style="background: ${groupColor}" title="生成二维码">
                        <i class="fas fa-qrcode"></i>
                      </button>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
            `;
          }).join('')}
        </div>
      ` : `
        <div class="empty-state">
          <h2><i class="fas fa-bookmark"></i> 您还没有添加任何链接</h2>
          <p>开始创建您的第一个链接收藏吧</p>
          <button class="empty-btn" onclick="location.href='/admin'">添加链接</button>
        </div>
      `}
    </div>
    
    <!-- 二维码模态框 -->
    <div class="modal" id="qrModal">
      <div class="modal-content">
        <span class="close-modal" id="closeModal">&times;</span>
        <h3 class="qr-title" id="qrTitle">链接二维码</h3>
        <div class="qr-code-container">
          <canvas id="qrCodeCanvas" width="200" height="200"></canvas>
        </div>
        <div class="qr-buttons">
          <button class="qr-btn qr-btn-download" id="downloadQR">
            <i class="fas fa-download"></i> 下载二维码
          </button>
          <button class="qr-btn qr-btn-close" id="closeQRModal">
            <i class="fas fa-times"></i> 关闭
          </button>
        </div>
      </div>
    </div>
    
    <footer class="footer">
      <div class="footer-content">
        <p>© ${new Date().getFullYear()} 订阅管理器 | 由Cloudflare Workers提供边缘计算服务</p>
        <p>优化：统一按钮尺寸 | 分组颜色标识 | 二维码功能增强</p>
        <div class="footer-links">
          <a href="/admin">管理链接</a>
          <a href="/logout">退出登录</a>
        </div>
      </div>
    </footer>
    
    <!-- 引入QRCode生成库 -->
    <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.1/build/qrcode.min.js"></script>
    
    <script>
      // 复制功能
      document.addEventListener('click', e => {
        if (e.target.closest('.copy-btn')) {
          const btn = e.target.closest('.copy-btn');
          navigator.clipboard.writeText(btn.dataset.url)
            .then(() => {
              btn.classList.add('copied');
              btn.title = '已复制!';
              
              setTimeout(() => {
                btn.classList.remove('copied');
                btn.title = '复制链接';
              }, 2000);
            })
            .catch(err => alert('复制失败: ' + err));
        }
      });
      
      // 二维码功能
      const modal = document.getElementById('qrModal');
      const closeModal = document.getElementById('closeModal');
      const closeQRModal = document.getElementById('closeQRModal');
      const qrTitle = document.getElementById('qrTitle');
      const qrCodeCanvas = document.getElementById('qrCodeCanvas');
      const downloadQR = document.getElementById('downloadQR');
      
      // 打开二维码模态框
      document.addEventListener('click', e => {
        if (e.target.closest('.qr-btn')) {
          const btn = e.target.closest('.qr-btn');
          let url = btn.dataset.url;
          const name = btn.dataset.name;
          
          // 确保URL有协议前缀
          if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
          }
          
          qrTitle.textContent = name + " - 二维码";
          
          // 清除之前的二维码
          const ctx = qrCodeCanvas.getContext('2d');
          ctx.clearRect(0, 0, qrCodeCanvas.width, qrCodeCanvas.height);
          
          // 生成新二维码
          try {
            QRCode.toCanvas(qrCodeCanvas, url, {
              width: 200,
              margin: 1,
              color: {
                dark: '#000',
                light: '#fff'
              }
            }, function (error) {
              if (error) {
                console.error('生成二维码失败:', error);
                alert('生成二维码失败，请重试');
              } else {
                modal.style.display = 'flex';
              }
            });
          } catch (error) {
            console.error('生成二维码失败:', error);
            alert('生成二维码失败，请重试');
          }
        }
      });
      
      // 关闭模态框
      closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
      });
      
      closeQRModal.addEventListener('click', () => {
        modal.style.display = 'none';
      });
      
      // 点击模态框外部关闭
      window.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.style.display = 'none';
        }
      });
      
      // 下载二维码
      downloadQR.addEventListener('click', () => {
        try {
          const link = document.createElement('a');
          link.download = 'qrcode.png';
          link.href = qrCodeCanvas.toDataURL('image/png');
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } catch (error) {
          console.error('下载二维码失败:', error);
          alert('下载二维码失败');
        }
      });
    </script>
  </body>
  </html>
  `;
  
  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=UTF-8' }
  });
}
// 管理页面处理器
async function adminHandler(kv) {
  const data = await kv.get('link_data');
  const links = data ? JSON.parse(data) : { groups: [] };
  
  // 定义分组颜色方案
  const groupColors = [
    '#4361ee', // 蓝色
    '#7209b7', // 紫色
    '#f72585', // 粉色
    '#4cc9f0', // 青色
    '#2a9d8f', // 绿色
    '#f77f00', // 橙色
    '#9d4edd', // 深紫
    '#00bbf9'  // 蓝绿
  ];
  
  const html = `
  <!DOCTYPE html>
  <html lang="zh-CN">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>链接管理</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
      :root {
        --primary: #4361ee;
        --primary-light: #4895ef;
        --secondary: #3f37c9;
        --accent: #4cc9f0;
        --danger: #e63946;
        --light: #f8f9fa;
        --dark: #212529;
        --gray: #6c757d;
        --card-bg: #ffffff;
        --border: #e1e5eb;
      }
      
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }
      
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background: #f0f2f5;
        color: var(--dark);
        line-height: 1.6;
        padding: 0;
        min-height: 100vh;
        position: relative;
        padding-bottom: 80px;
      }
      
      .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
      }
      
      header {
        background: linear-gradient(120deg, var(--primary), var(--primary-light));
        color: white;
        padding: 20px 0;
        border-radius: 0 0 20px 20px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        margin-bottom: 30px;
      }
      
      .header-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 20px;
      }
      
      h1 {
        font-size: 1.8rem;
        font-weight: 700;
      }
      
      .actions {
        display: flex;
        gap: 15px;
      }
      
      .btn {
        background: rgba(255, 255, 255, 0.2);
        color: white;
        border: none;
        border-radius: 50px;
        padding: 10px 20px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .btn:hover {
        background: rgba(255, 255, 255, 0.3);
        transform: translateY(-2px);
      }
      
      .btn-back {
        background: var(--accent);
      }
      
      .btn-logout {
        background: rgba(255, 255, 255, 0.1);
      }
      
      .admin-container {
        background: var(--card-bg);
        border-radius: 16px;
        box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
        padding: 30px;
        margin-bottom: 30px;
      }
      
      .form-group {
        margin-bottom: 20px;
      }
      
      label {
        display: block;
        margin-bottom: 8px;
        font-weight: 500;
        color: var(--dark);
      }
      
      input {
        width: 100%;
        padding: 14px;
        border: 2px solid var(--border);
        border-radius: 10px;
        font-size: 16px;
        transition: border-color 0.3s;
      }
      
      input:focus {
        border-color: var(--primary);
        outline: none;
        box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.2);
      }
      
      .group-card {
        background: var(--card-bg);
        border: 2px solid var(--border);
        border-radius: 16px;
        padding: 20px;
        margin-bottom: 25px;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.03);
      }
      
      .group-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding: 15px;
        border-radius: 12px;
        color: white;
      }
      
      .group-title {
        font-size: 1.3rem;
        font-weight: 600;
      }
      
      .delete-btn {
        background: var(--danger);
        color: white;
        border: none;
        border-radius: 8px;
        padding: 8px 16px;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.3s;
      }
      
      .delete-btn:hover {
        opacity: 0.9;
        transform: translateY(-2px);
      }
      
      .link-item {
        background: rgba(67, 97, 238, 0.03);
        border: 1px solid var(--border);
        border-radius: 12px;
        padding: 15px;
        margin-bottom: 15px;
      }
      
      .link-actions {
        display: flex;
        justify-content: flex-end;
        margin-top: 15px;
      }
      
      .link-actions button {
        margin-left: 10px;
      }
      
      .btn-primary {
        background: var(--primary);
        color: white;
        border: none;
        border-radius: 8px;
        padding: 10px 20px;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.3s;
      }
      
      .btn-primary:hover {
        background: var(--secondary);
        transform: translateY(-2px);
      }
      
      .btn-secondary {
        background: var(--gray);
        color: white;
        border: none;
        border-radius: 8px;
        padding: 10px 20px;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.3s;
      }
      
      .btn-secondary:hover {
        background: #5a6268;
        transform: translateY(-2px);
      }
      
      .actions-bar {
        display: flex;
        justify-content: space-between;
        margin-top: 30px;
      }
      
      .add-group-btn {
        position: sticky;
        bottom: 30px;
        z-index: 100;
        width: auto;
        margin: 20px auto 0;
        display: block;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
      }
      
      .footer {
        position: absolute;
        bottom: 0;
        width: 100%;
        text-align: center;
        padding: 20px;
        color: #6c757d;
        font-size: 0.9rem;
        background: #f8f9fa;
        border-top: 1px solid #e9ecef;
      }
      
      .footer-content {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 20px;
      }
      
      .footer p {
        margin: 5px 0;
        line-height: 1.6;
      }
      
      .footer-links {
        display: flex;
        justify-content: center;
        gap: 15px;
        margin-top: 10px;
      }
      
      .footer-links a {
        color: var(--primary);
        text-decoration: none;
      }
      
      .footer-links a:hover {
        text-decoration: underline;
      }
      
      @media (max-width: 768px) {
        .header-content {
          flex-direction: column;
          gap: 15px;
          text-align: center;
        }
        
        .actions {
          width: 100%;
          justify-content: center;
        }
        
        .admin-container {
          padding: 20px;
        }
        
        .actions-bar {
          flex-direction: column;
          gap: 15px;
        }
        
        .actions-bar button {
          width: 100%;
        }
        
        .add-group-btn {
          position: static;
          width: 100%;
        }
        
        .footer {
          position: relative;
          margin-top: 40px;
        }
      }
      
      @media (max-width: 480px) {
        h1 {
          font-size: 1.5rem;
        }
        
        .btn {
          padding: 8px 15px;
          font-size: 0.9rem;
        }
        
        .group-header {
          flex-direction: column;
          align-items: flex-start;
          gap: 15px;
        }
        
        .footer {
          padding: 15px;
          font-size: 0.8rem;
        }
        
        .footer-links {
          flex-direction: column;
          gap: 5px;
        }
      }
    </style>
  </head>
  <body>
    <header>
      <div class="header-content">
        <h1><i class="fas fa-cog"></i> 链接管理</h1>
        <div class="actions">
          <button class="btn btn-back" onclick="location.href='/'">
            <i class="fas fa-arrow-left"></i>
            返回首页
          </button>
          <button class="btn btn-logout" onclick="location.href='/logout'">
            <i class="fas fa-sign-out-alt"></i>
            退出
          </button>
        </div>
      </div>
    </header>
    
    <div class="container">
      <div class="admin-container">
        <form id="linkForm">
          <div id="groups">
            ${links.groups.map((group, gIndex) => {
              const colorIndex = gIndex % groupColors.length;
              const groupColor = groupColors[colorIndex];
              return `
              <div class="group-card">
                <div class="group-header" style="background: ${groupColor}">
                  <h3 class="group-title">分组 #${gIndex + 1}: ${group.name}</h3>
                  <button type="button" class="delete-btn" onclick="this.closest('.group-card').remove()">
                    <i class="fas fa-trash"></i> 删除分组
                  </button>
                </div>
                
                <div class="form-group">
                  <label>分组名称</label>
                  <input type="text" name="group-name-${gIndex}" value="${group.name}" required>
                </div>
                
                <h4>链接列表</h4>
                
                <div class="links" id="links-${gIndex}">
                  ${group.links.map((link, lIndex) => `
                    <div class="link-item">
                      <div class="form-group">
                        <label>链接名称</label>
                        <input type="text" name="link-name-${gIndex}-${lIndex}" value="${link.name}" required>
                      </div>
                      <div class="form-group">
                        <label>URL</label>
                        <input type="url" name="link-url-${gIndex}-${lIndex}" value="${link.url}" required>
                      </div>
                      <div class="link-actions">
                        <button type="button" class="btn-secondary" onclick="this.closest('.link-item').remove()">
                          <i class="fas fa-trash"></i> 删除链接
                        </button>
                      </div>
                    </div>
                  `).join('')}
                </div>
                
                <button type="button" class="btn-primary" onclick="addLink(${gIndex})" style="background: ${groupColor}">
                  <i class="fas fa-plus"></i> 添加链接
                </button>
              </div>
              `;
            }).join('')}
          </div>
          
          <div class="actions-bar">
            <button type="button" class="btn-primary add-group-btn" onclick="addGroup()">
              <i class="fas fa-layer-group"></i> 添加新分组
            </button>
            <button type="submit" class="btn-primary" style="background-color: var(--accent);">
              <i class="fas fa-save"></i> 保存所有更改
            </button>
          </div>
        </form>
      </div>
    </div>
    
    <footer class="footer">
      <div class="footer-content">
        <p>© ${new Date().getFullYear()} 订阅管理器 | 数据存储在Cloudflare KV中</p>
        <p>操作指南：1. 点击"添加分组"创建新分类 2. 在每个分组内添加链接 3. 点击"保存所有更改"应用修改</p>
        <div class="footer-links">
          <a href="/">返回首页</a>
          <a href="/logout">退出登录</a>
        </div>
      </div>
    </footer>
    
    <script>
      let groupCounter = ${links.groups.length};
      let linkCounters = [${links.groups.map(g => g.links.length).join(',')}];
      
      // 定义分组颜色方案
      const groupColors = ${JSON.stringify(groupColors)};
      
      function addGroup() {
        const groupIndex = groupCounter++;
        linkCounters[groupIndex] = 0;
        
        // 为分组分配颜色
        const colorIndex = groupIndex % groupColors.length;
        const groupColor = groupColors[colorIndex];
        
        const groupHTML = \`
        <div class="group-card">
          <div class="group-header" style="background: \${groupColor}">
            <h3 class="group-title">新分组</h3>
            <button type="button" class="delete-btn" onclick="this.closest('.group-card').remove()">
              <i class="fas fa-trash"></i> 删除分组
            </button>
          </div>
          
          <div class="form-group">
            <label>分组名称</label>
            <input type="text" name="group-name-\${groupIndex}" required placeholder="输入分组名称">
          </div>
          
          <h4>链接列表</h4>
          
          <div class="links" id="links-\${groupIndex}"></div>
          
          <button type="button" class="btn-primary" onclick="addLink(\${groupIndex})" style="background: \${groupColor}">
            <i class="fas fa-plus"></i> 添加链接
          </button>
        </div>\`;
        
        document.getElementById('groups').insertAdjacentHTML('beforeend', groupHTML);
        
        // 滚动到新分组
        const newGroup = document.querySelector('.group-card:last-child');
        newGroup.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      
      function addLink(groupIndex) {
        const linkIndex = linkCounters[groupIndex] || 0;
        linkCounters[groupIndex] = linkIndex + 1;
        
        const linkHTML = \`
        <div class="link-item">
          <div class="form-group">
            <label>链接名称</label>
            <input type="text" name="link-name-\${groupIndex}-\${linkIndex}" required placeholder="输入链接名称">
          </div>
          <div class="form-group">
            <label>URL</label>
            <input type="url" name="link-url-\${groupIndex}-\${linkIndex}" required placeholder="https://example.com">
          </div>
          <div class="link-actions">
            <button type="button" class="btn-secondary" onclick="this.closest('.link-item').remove()">
              <i class="fas fa-trash"></i> 删除链接
            </button>
          </div>
        </div>\`;
        
        const linksContainer = document.getElementById(\`links-\${groupIndex}\`);
        linksContainer.insertAdjacentHTML('beforeend', linkHTML);
        
        // 滚动到新添加的链接
        const newLink = linksContainer.lastElementChild;
        newLink.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      
      document.getElementById('linkForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const groups = [];
        
        // 收集所有分组
        document.querySelectorAll('.group-card').forEach(groupEl => {
          const groupIndex = Array.from(groupEl.parentNode.children).indexOf(groupEl);
          const groupName = groupEl.querySelector(\`input[name="group-name-\${groupIndex}"]\`)?.value;
          
          if (!groupName) return;
          
          const links = [];
          // 收集当前分组的所有链接
          const linksContainer = groupEl.querySelector('.links');
          if (linksContainer) {
            linksContainer.querySelectorAll('.link-item').forEach(linkEl => {
              const nameInput = linkEl.querySelector(\`input[name^="link-name-\${groupIndex}-"]\`);
              const urlInput = linkEl.querySelector(\`input[name^="link-url-\${groupIndex}-"]\`);
              
              if (nameInput && urlInput && nameInput.value && urlInput.value) {
                links.push({
                  name: nameInput.value,
                  url: urlInput.value
                });
              }
            });
          }
          
          if (groupName && links.length > 0) {
            groups.push({
              name: groupName,
              links
            });
          }
        });
        
        try {
          const response = await fetch('/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ groups })
          });
          
          if (response.ok) {
            alert('保存成功!');
            window.location.href = '/';
          } else {
            const error = await response.text();
            alert(\`保存失败: \${error}\`);
          }
        } catch (err) {
          alert(\`请求错误: \${err.message}\`);
        }
      });
    </script>
  </body>
  </html>
  `;
  
  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=UTF-8' }
  });
}
// 保存处理器
async function saveHandler(request, kv) {
  try {
    const data = await request.json();
    await kv.put('link_data', JSON.stringify(data));
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
