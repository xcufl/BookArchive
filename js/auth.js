let toastTimeout;
function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    clearTimeout(toastTimeout);
    toast.innerText = message;
    toast.style.display = 'block';
    
    toastTimeout = setTimeout(() => {
        toast.style.display = 'none';
    }, 4000);
}

function toggleAuth(view) {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const errorMsg = document.getElementById('error-msg');
    
    if (errorMsg) errorMsg.innerText = "";
    
    if (view === 'register') {
        if (loginForm) loginForm.style.display = 'none';
        if (registerForm) registerForm.style.display = 'block';
    } else {
        if (loginForm) loginForm.style.display = 'block';
        if (registerForm) registerForm.style.display = 'none';
    }
}

window.onload = () => {
    const msg = localStorage.getItem('logoutMsg');
    if (msg) {
        showToast(msg);
        localStorage.removeItem('logoutMsg');
    }
};

document.getElementById('login-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    if (btn) btn.disabled = true;
    showToast("Memverifikasi kredensial...");

    auth.signInWithEmailAndPassword(email, password)
        .then(() => {
            showToast("Autentikasi berhasil.");
            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 500);
        })
        .catch((error) => {
            if (btn) btn.disabled = false;
            
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential' || error.code === 'auth/invalid-login-credentials') {
                showToast("Email atau kata sandi Anda salah.");
            } else if (error.code === 'auth/too-many-requests') {
                showToast("Terlalu banyak percobaan. Silakan coba lagi nanti.");
            } else {
                showToast("Gagal masuk: " + error.message);
            }
        });
});

document.getElementById('register-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;

    if (btn) btn.disabled = true;
    showToast("Memproses pendaftaran...");

    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            return db.collection('users').doc(user.uid).set({
                name: name,
                email: email,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        })
        .then(() => {
            showToast("Registrasi berhasil.");
            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 1000);
        })
        .catch((error) => {
            if (btn) btn.disabled = false;
            
            if (error.code === 'auth/email-already-in-use') {
                showToast("Email sudah terdaftar. Mengalihkan ke halaman masuk...");
                setTimeout(() => {
                    toggleAuth('login');
                    document.getElementById('login-email').value = email;
                }, 2000);
            } else if (error.code === 'auth/invalid-email') {
                showToast("Format email tidak valid.");
            } else if (error.code === 'auth/weak-password') {
                showToast("Kata sandi terlalu lemah (minimal 6 karakter).");
            } else {
                showToast("Gagal melakukan registrasi: " + error.message);
            }
        });
});
