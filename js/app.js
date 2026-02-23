let currentUser = null;

db.enablePersistence()
  .catch((err) => {
      if (err.code == 'failed-precondition') {
          console.log("Multiple tabs open, persistence can only be enabled in one tab at a time.");
      } else if (err.code == 'unimplemented') {
          console.log("The current browser does not support all of the features required to enable persistence");
      }
  });

function showToast(message) {
    const toast = document.getElementById('toast');
    if (toast) {
        toast.innerText = message;
        toast.style.display = 'block';
        setTimeout(() => {
            if (toast) toast.style.display = 'none';
        }, 3000);
    }
}

auth.onAuthStateChanged(user => {
    if (user) {
        currentUser = user;
        loadUserProfile();
        loadEntries();
    } else {
        if (!window.location.href.includes('index.html')) {
            window.location.href = "index.html";
        }
    }
});

async function loadUserProfile() {
    if (!currentUser) return;
    try {
        const doc = await db.collection('users').doc(currentUser.uid).get();
        if (doc.exists) {
            const data = doc.data();
            const greetingElem = document.getElementById('user-greeting');
            if (greetingElem) greetingElem.innerText = data.name || "Penulis";
        }
    } catch (err) {}
}

function loadEntries() {
    const container = document.getElementById('archive-entries');
    if (!container) return;
    
    container.innerHTML = '<p style="text-align: center;">Memuat data...</p>';

    if (!currentUser) {
        container.innerHTML = '<p style="text-align: center; color: #a00;">Sesi berakhir. Silakan login kembali.</p>';
        return;
    }

    db.collection('books')
        .where('userId', '==', currentUser.uid)
        .orderBy('createdAt', 'desc')
        .onSnapshot(snapshot => {
            container.innerHTML = '';
            if (snapshot.empty) {
                container.innerHTML = '<p style="text-align: center; color: #999; margin-top: 50px;">Tidak ada data buku yang ditemukan.</p>';
                return;
            }

            snapshot.forEach(doc => {
                const book = doc.data();
                const stars = "★".repeat(parseInt(book.rating || 3)) + "☆".repeat(5 - parseInt(book.rating || 3));
                const current = book.currentPage || 0;
                const total = book.totalPages || 1;
                const percent = Math.min(100, Math.round((current / total) * 100));
                
                const entry = document.createElement('article');
                entry.className = 'archive-entry';
                entry.innerHTML = `
                    <div style="float: right; font-size: 0.8rem; color: #999;">${formatDate(book.createdAt)}</div>
                    <h3>${book.title}</h3>
                    <div class="author">
                        <span>Penulis: ${book.author}</span>
                        <span class="rating-display">${stars}</span>
                    </div>
                    <div class="progress-container"><div class="progress-bar" style="width: ${percent}%"></div></div>
                    <div style="font-size: 0.8rem; margin-top: -15px; margin-bottom: 15px;">Status: ${current} / ${total} Halaman (${percent}%)</div>
                    <div class="thoughts">${book.thoughts}</div>
                    <div style="margin-top: 15px; display: flex; gap: 15px; align-items: center;">
                        <span onclick="updateProgress('${doc.id}', ${current}, ${total}, '${book.title.replace(/'/g, "\\'")}')" style="font-size: 0.8rem; color: var(--accent-ink); cursor: pointer; border-bottom: 1px solid;">Update Progres</span>
                        <span onclick="deleteEntry('${doc.id}')" style="font-size: 0.8rem; color: #a00; cursor: pointer;">Hapus Data</span>
                    </div>
                `;
                container.appendChild(entry);
            });
        }, error => {
            console.error("Firestore Error:", error);
            if (error.code === 'failed-precondition') {
                container.innerHTML = '<p style="text-align: center; color: #a00; padding: 20px;">Error: Perlu membuat Indeks di Konsol Firebase. Cek Console Browser (F12) untuk klik link pembuatannya.</p>';
            } else if (error.code === 'permission-denied') {
                container.innerHTML = '<p style="text-align: center; color: #a00; padding: 20px;">Error: Akses Database Ditolak. Pastikan Rules Firestore Anda sudah di-set ke Test Mode.</p>';
            } else {
                container.innerHTML = '<p style="text-align: center; color: #a00; padding: 20px;">Gagal memuat data: ' + error.message + '</p>';
            }
        });
}

function updateProgress(id, current, total, title) {
    document.getElementById('update-book-id').value = id;
    document.getElementById('update-current-page').value = current;
    document.getElementById('update-current-page').max = total;
    document.getElementById('update-book-info').innerText = `${title} (Total: ${total} Halaman)`;
    openModal('update-progress-modal');
}

document.getElementById('update-progress-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('update-book-id').value;
    const next = document.getElementById('update-current-page').value;
    
    closeModal('update-progress-modal');

    try {
        await db.collection('books').doc(id).update({
            currentPage: parseInt(next)
        });
        showToast("Progres berhasil diperbarui.");
    } catch (err) {
        showToast("Gagal memperbarui progres.");
    }
});

document.getElementById('add-book-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('book-title').value;
    const author = document.getElementById('book-author').value;
    const pages = document.getElementById('book-pages').value;
    const thoughts = document.getElementById('book-thoughts').value;
    
    const ratingRadio = document.querySelector('input[name="rating"]:checked');
    const rating = ratingRadio ? ratingRadio.value : 3;

    closeModal('add-book-modal');
    const form = document.getElementById('add-book-form');
    form.reset();

    try {
        await db.collection('books').add({
            userId: currentUser.uid,
            title,
            author,
            totalPages: parseInt(pages),
            currentPage: 0,
            thoughts,
            rating,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        showToast("Data buku berhasil disimpan.");
    } catch (err) {
        showToast("Gagal menyimpan data.");
    }
});

function deleteEntry(id) {
    if (confirm("Apakah Anda yakin ingin menghapus data buku ini?")) {
        db.collection('books').doc(id).delete()
            .then(() => showToast("Data berhasil dihapus."))
            .catch(() => showToast("Gagal menghapus data."));
    }
}

function logout() {
    auth.signOut().then(() => {
        window.location.replace("index.html");
    });
}

function openModal(id) {
    document.getElementById(id).style.display = 'flex';
}

function closeModal(id) {
    document.getElementById(id).style.display = 'none';
}

function formatDate(timestamp) {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

window.onclick = function(event) {
    if (event.target.className === 'modal') {
        event.target.style.display = "none";
    }
}
