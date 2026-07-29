document.addEventListener('DOMContentLoaded', () => {

  // --- Elements ---
  const loginForm = document.getElementById('login-form');
  const loginError = document.getElementById('login-error');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  
  const loginScreen = document.getElementById('login-screen');
  const dashboardScreen = document.getElementById('dashboard-screen');
  const logoutBtn = document.getElementById('logout-btn');

  const navBtns = document.querySelectorAll('.nav-btn');
  const panels = document.querySelectorAll('.dashboard-panel');

  const uploadTrigger = document.getElementById('upload-area-trigger');
  const fileInput = document.getElementById('file-input');
  const uploadPreview = document.getElementById('upload-preview');
  const confirmUploadBtn = document.getElementById('confirm-upload-btn');
  const removeCategorySelect = document.getElementById('remove-category');
  const dummyGallery = document.getElementById('dummy-gallery');

  // --- Credentials for Prototype ---
  const validUsername = 'Adminteam360.123';
  const validPassword = 'Gauravsir';

  // --- Login Logic ---
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const user = usernameInput.value.trim();
    const pass = passwordInput.value.trim();

    if (user === validUsername && pass === validPassword) {
      // Success
      loginError.textContent = '';
      loginScreen.classList.remove('active');
      dashboardScreen.classList.add('active');
      usernameInput.value = '';
      passwordInput.value = '';
      renderDummyGallery(); // load initial dummy data
    } else {
      // Error
      loginError.textContent = 'Invalid username or password.';
    }
  });

  // --- Logout Logic ---
  logoutBtn.addEventListener('click', () => {
    dashboardScreen.classList.remove('active');
    loginScreen.classList.add('active');
  });

  // --- Navigation Logic ---
  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active from all buttons and panels
      navBtns.forEach(b => b.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));

      // Add active to clicked button and target panel
      btn.classList.add('active');
      const targetId = btn.getAttribute('data-target');
      document.getElementById(targetId).classList.add('active');
    });
  });

  // --- Upload Simulation ---
  uploadTrigger.addEventListener('click', () => {
    fileInput.click();
  });

  fileInput.addEventListener('change', () => {
    uploadPreview.innerHTML = ''; // clear old
    if (fileInput.files.length > 0) {
      Array.from(fileInput.files).forEach(file => {
        const url = URL.createObjectURL(file);
        const imgItem = document.createElement('div');
        imgItem.className = 'gallery-item';
        imgItem.innerHTML = `<img src="${url}" alt="Preview">`;
        uploadPreview.appendChild(imgItem);
      });
      confirmUploadBtn.style.display = 'block';
    } else {
      confirmUploadBtn.style.display = 'none';
    }
  });

  confirmUploadBtn.addEventListener('click', () => {
    alert('Prototype: Photos uploaded successfully! (Note: Since this is a prototype without a backend database, they won\\'t permanently save yet.)');
    fileInput.value = '';
    uploadPreview.innerHTML = '';
    confirmUploadBtn.style.display = 'none';
  });

  // --- Remove Gallery Simulation ---
  const dummyImages = [
    'assets/Cinematrix Production CC-101.jpg',
    'assets/Cinematrix Production CC-102 - Copy.jpg',
    'assets/Cinematrix Production CC-27.jpg',
    'assets/Cinematrix Production CC-9.jpg'
  ];

  function renderDummyGallery() {
    dummyGallery.innerHTML = '';
    
    // Simulate fetching photos for the selected category
    dummyImages.forEach((src, index) => {
      const item = document.createElement('div');
      item.className = 'gallery-item';
      item.id = `dummy-img-${index}`;
      
      item.innerHTML = `
        <img src="${src}" alt="Portfolio image" onerror="this.src='https://via.placeholder.com/200?text=Placeholder'">
        <button class="delete-btn" aria-label="Delete Photo" onclick="deletePhoto('${item.id}')">✕</button>
      `;
      dummyGallery.appendChild(item);
    });
  }

  removeCategorySelect.addEventListener('change', renderDummyGallery);

  // Global function for the inline onclick handler
  window.deletePhoto = function(id) {
    if (confirm('Are you sure you want to delete this selected pic?')) {
      const el = document.getElementById(id);
      if (el) {
        el.remove();
        // Here is where the real backend call would happen
      }
    }
  };

});
