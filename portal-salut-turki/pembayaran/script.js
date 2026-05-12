document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('paymentForm');
    const submitBtn = document.getElementById('submitBtn');
    const statusMessage = document.getElementById('statusMessage');

    // Handle File Input UI
    const fileInput = document.getElementById('buktiTransfer');
    const nameElement = document.getElementById('buktiTransferName');

    fileInput.addEventListener('change', () => {
        if (fileInput.files.length > 0) {
            const file = fileInput.files[0];
            
            // Cek ukuran file (Maks 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('Ukuran file terlalu besar. Maksimal 5MB.');
                fileInput.value = '';
                nameElement.textContent = 'Belum ada berkas';
                nameElement.style.color = '#000';
                return;
            }
            
            nameElement.textContent = file.name;
            nameElement.style.color = '#2A66C0';
        } else {
            nameElement.textContent = 'Belum ada berkas';
            nameElement.style.color = '#000';
        }
    });

    // Form Submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // --- KONFIGURASI GOOGLE APPS SCRIPT ---
        // Ganti URL di bawah ini dengan URL Web App Google Apps Script KHUSUS PEMBAYARAN Anda.
        const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzN6hM8Z9w-W7Liqr8X9OKKKGdUi0rFRPVqhxVwlIYZ_1FXq4Uwhf7Yd4ep6P4iCqDC/exec';
        
        const file = fileInput.files[0];
        if (!file) {
            alert('Mohon unggah bukti transfer.');
            return;
        }

        // Ubah state tombol
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span>Memproses Pembayaran...</span><span class="spinner">⏳</span>';
        submitBtn.disabled = true;
        statusMessage.className = 'status-message hidden';

        try {
            const formData = new FormData(form);
            const base64File = await convertFileToBase64(file);

            const payload = {
                namaLengkap: formData.get('namaLengkap'),
                email: formData.get('email'),
                noWA: formData.get('noWA'),
                layanan: formData.get('layanan'),
                buktiTransferName: file.name,
                buktiTransferMimeType: file.type,
                buktiTransferBase64: base64File.split(',')[1]
            };

            // Mengirim data ke Google Apps Script Web App
            const response = await fetch(SCRIPT_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8',
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            if (result.status !== 'success') {
                throw new Error(result.message || 'Gagal memproses pembayaran.');
            }

            // Tampilkan layar sukses
            form.reset();
            form.classList.add('hidden');
            document.getElementById('mainTitle').classList.add('hidden');
            document.getElementById('mainSubtitle').classList.add('hidden');
            
            const successScreen = document.getElementById('successScreen');
            successScreen.classList.remove('hidden');
            successScreen.scrollIntoView({ behavior: 'smooth', block: 'start' });
            
        } catch (error) {
            console.error('Error:', error);
            statusMessage.textContent = 'Terjadi kesalahan saat memproses pembayaran. Silakan coba lagi.';
            statusMessage.className = 'status-message error';
        } finally {
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
        }
    });

    function convertFileToBase64(file) {
        return new Promise((resolve, reject) => {
            if (!file) {
                resolve("");
                return;
            }
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }
});
