// index.js
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const kv = env.SUB_LINK;
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
    
  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <title>登录</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
      
      /* 页脚样式 */
      .footer {
        position: absolute;
        bottom: 20px;
        width: 100%;
        text-align: center;
        color: #6c757d;
        font-size: 0.85rem;
        padding: 0 20px;
      }
      
      .footer p {
        margin: 5px 0;
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
          <label for="password">访问密码</label>
          <div class="password-container">
            <input type="password" id="password" name="password" required ${error ? 'class="error"' : ''}>
            <button type="button" class="toggle-password" id="togglePassword">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
                <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
              </svg>
            </button>
          </div>
        </div>
        <button type="submit" id="loginBtn">登录</button>
      </form>
      <div class="message">默认密码: admin123</div>
    </div>
    
    <div class="footer">
      <p>© ${new Date().getFullYear()} 订阅管理器 | 由Cloudflare Workers提供支持</p>
      <p>数据存储在Cloudflare KV中 | 安全加密访问</p>
    </div>
    
    <script>
      // 密码可见性切换
      const togglePassword = document.getElementById('togglePassword');
      const passwordInput = document.getElementById('password');
      
      togglePassword.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        // 更新图标
        if (type === 'text') {
          this.innerHTML = '<svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z"/><path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829l.822.822zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829z"/><path d="M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12-.708.708z"/></svg>';
        } else {
          this.innerHTML = '<svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/><path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/></svg>';
        }
      });
      
      // 防止重复提交
      const loginForm = document.getElementById('loginForm');
      const loginBtn = document.getElementById('loginBtn');
      
      loginForm.addEventListener('submit', function() {
        loginBtn.disabled = true;
        loginBtn.textContent = '登录中...';
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
    { bg: 'linear-gradient(120deg, #4361ee, #4895ef)', btn: '#4361ee' }, // 蓝色
    { bg: 'linear-gradient(120deg, #3a0ca3, #7209b7)', btn: '#3a0ca3' }, // 紫色
    { bg: 'linear-gradient(120deg, #f72585, #b5179e)', btn: '#f72585' }, // 粉色
    { bg: 'linear-gradient(120deg, #4cc9f0, #4895ef)', btn: '#4cc9f0' }, // 青色
    { bg: 'linear-gradient(120deg, #2a9d8f, #2e9e49)', btn: '#2a9d8f' }, // 绿色
    { bg: 'linear-gradient(120deg, #f77f00, #e63946)', btn: '#f77f00' }, // 橙色
    { bg: 'linear-gradient(120deg, #9d4edd, #5a189a)', btn: '#9d4edd' }, // 深紫
    { bg: 'linear-gradient(120deg, #00bbf9, #00f5d4)', btn: '#00bbf9' }  // 蓝绿
  ];
  
  const html = `
  <!DOCTYPE html>
  <html lang="zh-CN">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>我的链接收藏</title>
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
        padding-bottom: 80px; /* 为页脚留出空间 */
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
        display: flex;
        align-items: center;
        gap: 12px;
      }
      
      .group-color-indicator {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
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
      }
      
      .link-card:hover {
        border-color: var(--accent);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
      }
      
      .link-info {
        flex-grow: 1;
        overflow: hidden;
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
      
      .copy-btn {
        color: white;
        border: none;
        border-radius: 8px;
        padding: 8px 12px;
        cursor: pointer;
        align-self: center;
        transition: all 0.3s;
        display: flex;
        align-items: center;
        gap: 5px;
        min-width: 80px;
        position: relative;
      }
      
      .copy-btn:hover {
        filter: brightness(0.9);
        transform: translateY(-2px);
      }
      
      .copy-btn:active {
        transform: translateY(1px);
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
      
      /* 页脚样式 */
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
      
      /* 移动端优化 */
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
        
        .link-card {
          flex-direction: column;
          gap: 15px;
        }
        
        .copy-btn {
          width: 100%;
          justify-content: center;
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
        <h1>🔗 我的链接收藏</h1>
        <div class="actions">
          <button class="btn btn-admin" onclick="location.href='/admin'">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
              <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/>
            </svg>
            管理链接
          </button>
          <button class="btn btn-logout" onclick="location.href='/logout'">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path fill-rule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z"/>
              <path fill-rule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"/>
            </svg>
            退出
          </button>
        </div>
      </div>
    </header>
    
    <div class="container">
      ${links.groups.length > 0 ? `
        <div class="groups-container">
          ${links.groups.map((group, gIndex) => {
            // 为每个分组分配一个颜色
            const colorIndex = gIndex % groupColors.length;
            const colorScheme = groupColors[colorIndex];
            return `
            <div class="group">
              <div class="group-header" style="background: ${colorScheme.bg}">
                <div class="group-color-indicator" style="background: ${colorScheme.btn}"></div>
                <h2 class="group-title">${group.name}</h2>
              </div>
              <div class="links">
                ${group.links.map(link => `
                  <div class="link-card">
                    <div class="link-info">
                      <h3 class="link-name">${link.name}</h3>
                      <div class="link-url">${link.url}</div>
                    </div>
                    <button class="copy-btn" data-url="${link.url}" style="background: ${colorScheme.btn}">
                      <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
                        <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
                      </svg>
                      复制
                    </button>
                  </div>
                `).join('')}
              </div>
            </div>
          `}).join('')}
        </div>
      ` : `
        <div class="empty-state">
          <h2>📋 您还没有添加任何链接</h2>
          <p>开始创建您的第一个链接收藏吧</p>
          <button class="empty-btn" onclick="location.href='/admin'">添加链接</button>
        </div>
      `}
    </div>
    
    <footer class="footer">
      <div class="footer-content">
        <p>© ${new Date().getFullYear()} 链接管理器 | 由Cloudflare Workers提供边缘计算服务</p>
        <p>数据存储在Cloudflare KV中，安全持久 | 每个分组使用不同颜色便于区分</p>
        <p>提示：复制按钮颜色与分组颜色一致，便于识别所属分组</p>
        <div class="footer-links">
          <a href="/admin">管理链接</a>
          <a href="/logout">退出登录</a>
          <a href="#" onclick="alert('如需更改密码，请设置ACCESS_PASSWORD环境变量')">密码设置</a>
        </div>
      </div>
    </footer>
    
    <script>
      // 复制功能
      document.addEventListener('click', e => {
        if (e.target.classList.contains('copy-btn')) {
          navigator.clipboard.writeText(e.target.dataset.url)
            .then(() => {
              const originalText = e.target.innerHTML;
              e.target.innerHTML = '<svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/></svg> 已复制';
              
              setTimeout(() => {
                e.target.innerHTML = originalText;
              }, 2000);
            })
            .catch(err => alert('复制失败: ' + err));
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
    { bg: 'linear-gradient(120deg, #4361ee, #4895ef)', btn: '#4361ee' }, // 蓝色
    { bg: 'linear-gradient(120deg, #3a0ca3, #7209b7)', btn: '#3a0ca3' }, // 紫色
    { bg: 'linear-gradient(120deg, #f72585, #b5179e)', btn: '#f72585' }, // 粉色
    { bg: 'linear-gradient(120deg, #4cc9f0, #4895ef)', btn: '#4cc9f0' }, // 青色
    { bg: 'linear-gradient(120deg, #2a9d8f, #2e9e49)', btn: '#2a9d8f' }, // 绿色
    { bg: 'linear-gradient(120deg, #f77f00, #e63946)', btn: '#f77f00' }, // 橙色
    { bg: 'linear-gradient(120deg, #9d4edd, #5a189a)', btn: '#9d4edd' }, // 深紫
    { bg: 'linear-gradient(120deg, #00bbf9, #00f5d4)', btn: '#00bbf9' }  // 蓝绿
  ];
  
  const html = `
  <!DOCTYPE html>
  <html lang="zh-CN">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>链接管理</title>
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
        padding-bottom: 80px; /* 为页脚留出空间 */
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
        display: flex;
        align-items: center;
        gap: 12px;
      }
      
      .color-indicator {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
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
      
      /* 添加分组按钮固定 */
      .add-group-btn {
        position: sticky;
        bottom: 30px;
        z-index: 100;
        width: auto;
        margin: 20px auto 0;
        display: block;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
      }
      
      /* 页脚样式 */
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
      
      /* 移动端优化 */
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
        <h1>⚙️ 链接管理</h1>
        <div class="actions">
          <button class="btn btn-back" onclick="location.href='/'">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path fill-rule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
            </svg>
            返回首页
          </button>
          <button class="btn btn-logout" onclick="location.href='/logout'">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path fill-rule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z"/>
              <path fill-rule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"/>
            </svg>
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
              // 为每个分组分配一个颜色
              const colorIndex = gIndex % groupColors.length;
              const colorScheme = groupColors[colorIndex];
              return `
              <div class="group-card" data-index="${gIndex}">
                <div class="group-header" style="background: ${colorScheme.bg}">
                  <h3 class="group-title">
                    <span class="color-indicator" style="background: ${colorScheme.btn}"></span>
                    分组 #${gIndex + 1}: ${group.name}
                  </h3>
                  <button type="button" class="delete-btn" onclick="this.closest('.group-card').remove()">删除分组</button>
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
                        <button type="button" class="btn-secondary" onclick="this.closest('.link-item').remove()">删除链接</button>
                      </div>
                    </div>
                  `).join('')}
                </div>
                
                <button type="button" class="btn-primary" onclick="addLink(${gIndex})" style="background: ${colorScheme.btn}">+ 添加链接</button>
              </div>
            `}).join('')}
          </div>
          
          <div class="actions-bar">
            <button type="button" class="btn-primary add-group-btn" onclick="addGroup()">+ 添加新分组</button>
            <button type="submit" class="btn-primary" style="background-color: var(--accent);">💾 保存所有更改</button>
          </div>
        </form>
      </div>
    </div>
    
    <footer class="footer">
      <div class="footer-content">
        <p>© ${new Date().getFullYear()} 链接管理器 | 数据存储在Cloudflare KV中</p>
        <p>操作指南：1. 点击"添加分组"创建新分类 2. 在每个分组内添加链接 3. 点击"保存所有更改"应用修改</p>
        <p>提示：复制按钮颜色与分组颜色一致，便于识别所属分组</p>
        <div class="footer-links">
          <a href="/">返回首页</a>
          <a href="/logout">退出登录</a>
          <a href="#" onclick="alert('所有更改实时保存到Cloudflare KV，无需额外保存按钮')">数据安全说明</a>
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
        const colorScheme = groupColors[colorIndex];
        
        const groupHTML = \`
        <div class="group-card" data-index="\${groupIndex}">
          <div class="group-header" style="background: \${colorScheme.bg}">
            <h3 class="group-title">
              <span class="color-indicator" style="background: \${colorScheme.btn}"></span>
              新分组
            </h3>
            <button type="button" class="delete-btn" onclick="this.closest('.group-card').remove()">删除分组</button>
          </div>
          
          <div class="form-group">
            <label>分组名称</label>
            <input type="text" name="group-name-\${groupIndex}" required placeholder="输入分组名称">
          </div>
          
          <h4>链接列表</h4>
          
          <div class="links" id="links-\${groupIndex}"></div>
          
          <button type="button" class="btn-primary" onclick="addLink(\${groupIndex})" style="background: \${colorScheme.btn}">+ 添加链接</button>
        </div>\`;
        
        document.getElementById('groups').insertAdjacentHTML('beforeend', groupHTML);
        
        // 滚动到新分组
        const newGroup = document.querySelector(\`.group-card[data-index="\${groupIndex}"]\`);
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
            <button type="button" class="btn-secondary" onclick="this.closest('.link-item').remove()">删除链接</button>
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
          const groupIndex = groupEl.dataset.index;
          const groupName = groupEl.querySelector(\`input[name="group-name-\${groupIndex}"]\`)?.value;
          
          if (!groupName) return;
          
          const links = [];
          // 收集当前分组的所有链接
          groupEl.querySelectorAll('.link-item').forEach(linkEl => {
            const nameInput = linkEl.querySelector(\`input[name^="link-name-\${groupIndex}-"]\`);
            const urlInput = linkEl.querySelector(\`input[name^="link-url-\${groupIndex}-"]\`);
            
            if (nameInput && urlInput && nameInput.value && urlInput.value) {
              links.push({
                name: nameInput.value,
                url: urlInput.value
              });
            }
          });
          
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