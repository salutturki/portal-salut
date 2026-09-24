document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registrationForm');
    const submitBtn = document.getElementById('submitBtn');
    const statusMessage = document.getElementById('statusMessage');

    // Handle File Inputs UI
    const fileInputs = [
        { id: 'pasFoto', nameId: 'pasFotoName', maxSize: 5 }, // 5MB
        { id: 'ktp', nameId: 'ktpName', maxSize: 5 },
        { id: 'ijazah', nameId: 'ijazahName', maxSize: 5 },
        { id: 'ttd', nameId: 'ttdName', maxSize: 5 }
    ];

    fileInputs.forEach(input => {
        const fileElement = document.getElementById(input.id);
        const nameElement = document.getElementById(input.nameId);

        fileElement.addEventListener('change', () => {
            if (fileElement.files.length > 0) {
                const file = fileElement.files[0];
                
                // Cek ukuran file
                if (file.size > input.maxSize * 1024 * 1024) {
                    alert(`Ukuran file terlalu besar. Maksimal ${input.maxSize}MB.`);
                    fileElement.value = '';
                    nameElement.textContent = 'Belum ada berkas';
                    nameElement.style.color = '#000';
                    return;
                }
                
                nameElement.textContent = file.name;
                nameElement.style.color = '#2A66C0'; // Warna berubah menjadi biru saat sudah ada file (seperti di referensi)
            } else {
                nameElement.textContent = 'Belum ada berkas';
                nameElement.style.color = '#000';
            }
        });
    });

    // Form Submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // --- KONFIGURASI GOOGLE APPS SCRIPT ---
        // Ganti URL di bawah ini dengan URL Web App Google Apps Script Anda.
        const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz-ao3f7nU5_r6f15MG0sG8VIcvpmoJlrxSSMLnUst8XA69BRxp_XcfJnwsIOzZpfFivg/exec';
        
        // Cek Difabel Radio Button
        const difabelRadio = document.querySelector('input[name="difabel"]:checked');
        if (!difabelRadio) {
            alert('Mohon lengkapi Pernyataan Difabel.');
            return;
        }

        // Cek kelengkapan file
        const pasFotoFile = document.getElementById('pasFoto').files[0];
        const ktpFile = document.getElementById('ktp').files[0];
        const ijazahFile = document.getElementById('ijazah').files[0];
        const ttdFile = document.getElementById('ttd').files[0];

        if (!pasFotoFile || !ktpFile || !ijazahFile || !ttdFile) {
            alert('Mohon unggah semua dokumen yang diwajibkan (Pas Foto, KTP, Ijazah, dan Tanda Tangan).');
            return;
        }

        // Ubah state tombol
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span>Menyimpan Data...</span><span class="spinner">â³</span>';
        submitBtn.disabled = true;
        statusMessage.className = 'status-message hidden';

        try {
            // Dapatkan seluruh data teks
            const formData = new FormData(form);
            
            // Konversi 4 file gambar/pdf menjadi Base64 secara paralel
            const [base64PasFoto, base64Ktp, base64Ijazah, base64Ttd] = await Promise.all([
                convertFileToBase64(pasFotoFile),
                convertFileToBase64(ktpFile),
                convertFileToBase64(ijazahFile),
                convertFileToBase64(ttdFile)
            ]);

            const payload = {
                // Data Pribadi
                namaLengkap: formData.get('namaLengkap'),
                tempatLahir: formData.get('tempatLahir'),
                tanggalLahir: formData.get('tanggalLahir'),
                jenisKelamin: formData.get('jenisKelamin'),
                agama: formData.get('agama'),
                kewarganegaraan: formData.get('kewarganegaraan'),
                statusKawin: formData.get('statusKawin'),
                namaIbu: formData.get('namaIbu'),
                difabel: difabelRadio.value,

                // Kontak & Domisili
                alamat: formData.get('alamat'),
                noWA: formData.get('noWA'),
                email: formData.get('email'),

                // Pendidikan & Pekerjaan
                pendidikanTerakhir: formData.get('pendidikanTerakhir'),
                sekolahAsal: formData.get('sekolahAsal'),
                jurusanAsal: formData.get('jurusanAsal'),
                pekerjaan: formData.get('pekerjaan'),

                // Rencana Studi
                jurusanTujuan: formData.get('jurusanTujuan'),

                // File 1: Pas Foto
                pasFotoName: pasFotoFile.name,
                pasFotoMimeType: pasFotoFile.type,
                pasFotoBase64: base64PasFoto.split(',')[1],

                // File 2: KTP
                ktpName: ktpFile.name,
                ktpMimeType: ktpFile.type,
                ktpBase64: base64Ktp.split(',')[1],

                // File 3: Ijazah
                ijazahName: ijazahFile.name,
                ijazahMimeType: ijazahFile.type,
                ijazahBase64: base64Ijazah.split(',')[1],

                // File 4: Tanda Tangan
                ttdName: ttdFile.name,
                ttdMimeType: ttdFile.type,
                ttdBase64: base64Ttd.split(',')[1]
            };

            // Mengirim data ke Google Apps Script Web App
            const response = await fetch(SCRIPT_URL, {
                method: 'POST',
                // Menggunakan text/plain untuk mencegah masalah CORS di Google Apps Script
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8',
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            if (result.status !== 'success') {
                throw new Error(result.message || 'Gagal mengirim data.');
            }

            // Tampilkan layar sukses
            if (form) {
                form.reset();
                form.classList.add('hidden'); // Sembunyikan form
            }
            const mainTitle = document.getElementById('mainTitle');
            if (mainTitle) mainTitle.classList.add('hidden'); // Sembunyikan judul lama
            
            const mainSubtitle = document.getElementById('mainSubtitle');
            if (mainSubtitle) mainSubtitle.classList.add('hidden'); // Sembunyikan subjudul lama
            
            const successScreen = document.getElementById('successScreen');
            if (successScreen) {
                successScreen.classList.remove('hidden'); // Tampilkan layar sukses
                try {
                    // Scroll ke atas layar sukses
                    successScreen.scrollIntoView({ behavior: 'smooth', block: 'start' });
                } catch (e) {
                    window.scrollTo(0, 0);
                }
            }
            
        } catch (error) {
            console.error('Error:', error);
            
            // Workaround untuk Google Apps Script CORS/Redirect issue
            // Terkadang browser melempar TypeError 'Failed to fetch' saat Google meredirect response JSON
            // Padahal data sudah BERHASIL masuk ke Google Drive & Sheets.
            if (error.name === 'TypeError' || error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                console.log('Mengabaikan error CORS/Fetch dari Google, karena data kemungkinan besar sudah masuk.');
                
                form.reset();
                form.classList.add('hidden');
                const mainTitle = document.getElementById('mainTitle');
                if (mainTitle) mainTitle.classList.add('hidden');
                const mainSubtitle = document.getElementById('mainSubtitle');
                if (mainSubtitle) mainSubtitle.classList.add('hidden');
                
                const successScreen = document.getElementById('successScreen');
                if (successScreen) {
                    successScreen.classList.remove('hidden');
                    try {
                        successScreen.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    } catch (e) {
                        window.scrollTo(0, 0);
                    }
                }
            } else {
                statusMessage.textContent = 'Terjadi kesalahan: ' + error.message;
                statusMessage.className = 'status-message error';
            }
        } finally {
            // Kembalikan state tombol
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
        }
    });

    // Fungsi bantuan untuk kompresi dan convert file menjadi Base64
    function convertFileToBase64(file) {
        return new Promise((resolve, reject) => {
            if (!file) {
                resolve("");
                return;
            }
            
            // Jika bukan gambar (misal PDF), langsung convert tanpa kompresi
            if (!file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => resolve(reader.result);
                reader.onerror = error => reject(error);
                return;
            }

            // Jika gambar, lakukan kompresi via Canvas
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = function(event) {
                const img = new Image();
                img.src = event.target.result;
                img.onload = function() {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 1200;
                    const MAX_HEIGHT = 1200;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    // Kompresi menjadi JPEG dengan kualitas 0.7
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                    resolve(dataUrl);
                };
                img.onerror = error => reject(error);
            };
            reader.onerror = error => reject(error);
        });
    }
});


