// ✅ Sandi baru sesuai permintaan
const SANDI_ADMIN = "rahmanaulia18062002";
const DATA_KEY = "aeroPlaneData";
let data = {};

function cekSandi() {
    const input = document.getElementById("passAdmin").value.trim();
    if (input === SANDI_ADMIN) {
        document.getElementById("loginAdmin").classList.add("hidden");
        document.getElementById("kontenAdmin").classList.remove("hidden");
        muatData();
        setInterval(muatData, 3000); // Refresh otomatis setiap 3 detik
    } else {
        alert("❌ Sandi salah!");
    }
}

function keluarAdmin() {
    document.getElementById("kontenAdmin").classList.add("hidden");
    document.getElementById("loginAdmin").classList.remove("hidden");
    document.getElementById("passAdmin").value = "";
}

function muatData() {
    data = JSON.parse(localStorage.getItem(DATA_KEY)) || {
        users: [], transaksi: [], pesan: [], penarikan: []
    };
    tampilkanData();
}

function simpanData() {
    localStorage.setItem(DATA_KEY, JSON.stringify(data));
    muatData();
}

// Buat kode unik otomatis
function buatKodeUnik() {
    return 'AP-' + Math.random().toString(36).substring(2, 10).toUpperCase();
}

function salinTeks(teks) {
    navigator.clipboard.writeText(teks);
    alert("✅ Kode disalin: " + teks);
}

function filterPengguna() {
    const kata = document.getElementById("cariPengguna").value.toLowerCase();
    const semua = document.querySelectorAll(".baris-pengguna");
    semua.forEach(el => {
        const nama = el.dataset.nama.toLowerCase();
        const kode = el.dataset.kode.toLowerCase();
        el.style.display = (nama.includes(kata) || kode.includes(kata)) ? "" : "none";
    });
}

function tampilkanData() {
    // Daftar Pengguna + Status Aktif
    const elUser = document.getElementById("daftarPengguna");
    elUser.innerHTML = data.users.length ? "" : "<p class='text-gray-500'>Belum ada pengguna</p>";

    data.users.forEach(u => {
        if (!u.kodeUnik) u.kodeUnik = buatKodeUnik();
        const status = u.terakhirAktif && (Date.now() - u.terakhirAktif < 120000)
            ? `<span class="text-sukses text-xs font-semibold">● Aktif</span>`
            : `<span class="text-abu text-xs">● Offline</span>`;

        elUser.innerHTML += `
        <div class="baris-pengguna border-b pb-3" data-nama="${u.username}" data-kode="${u.kodeUnik}">
            <div class="flex justify-between items-center">
                <div>
                    <p class="font-medium">${u.username} ${status}</p>
                    <p class="text-sm text-gray-600">Email: ${u.email}</p>
                    <p class="text-sm text-gray-700">Kode: <b>${u.kodeUnik}</b>
                        <button onclick="salinTeks('${u.kodeUnik}')" class="text-xs text-utama ml-2">Salin</button>
                    </p>
                    <p class="text-sm">Saldo: Rp ${u.saldo.toLocaleString("id-ID")}</p>
                </div>
                <div class="flex gap-1.5">
                    <input type="number" id="tambah-${u.username}" class="w-20 border rounded px-2 py-1 text-sm" placeholder="Jml">
                    <button onclick="tambahSaldo('${u.username}')" class="bg-sukses text-white px-2 py-1 rounded text-sm">Tambah</button>
                </div>
            </div>
        </div>`;
    });

    // Transaksi Menunggu
    const elTrans = document.getElementById("daftarTransaksi");
    const transMenunggu = data.transaksi.filter(t => t.status === "menunggu");
    elTrans.innerHTML = transMenunggu.length ? "" : "<p class='text-gray-500'>Tidak ada transaksi baru</p>";
    transMenunggu.forEach(t => {
        elTrans.innerHTML += `
        <div class="border-b pb-3">
            <p class="font-medium">${t.username}</p>
            <p class="text-sm">Jumlah: Rp ${t.jumlah.toLocaleString("id-ID")}</p>
            <p class="text-xs text-gray-500 mb-2">${t.waktu}</p>
            <div class="flex gap-2">
                <button onclick="setujui(${t.id})" class="bg-sukses text-white px-2.5 py-1 rounded text-sm">Setujui</button>
                <button onclick="tolak(${t.id})" class="bg-gagal text-white px-2.5 py-1 rounded text-sm">Tolak</button>
            </div>
        </div>`;
    });

    // Penarikan
    const elTarik = document.getElementById("daftarPenarikan");
    const tarikMenunggu = data.penarikan.filter(t => t.status === "menunggu");
    elTarik.innerHTML = tarikMenunggu.length ? "" : "<p class='text-gray-500'>Tidak ada permintaan penarikan</p>";
    tarikMenunggu.forEach(t => {
        elTarik.innerHTML += `
        <div class="border-b pb-3">
            <p class="font-medium">${t.username}</p>
            <p class="text-sm">Jumlah: Rp ${t.jumlah.toLocaleString("id-ID")}</p>
            <p class="text-sm">Rekening: ${t.rekening}</p>
            <div class="flex gap-2 mt-2">
                <button onclick="prosesTarik(${t.id})" class="bg-sukses text-white px-2.5 py-1 rounded text-sm">Proses</button>
                <button onclick="tolakTarik(${t.id})" class="bg-gagal text-white px-2.5 py-1 rounded text-sm">Tolak</button>
            </div>
        </div>`;
    });

    // Pesan Masuk
    const elPesan = document.getElementById("kotakPesanAdmin");
    elPesan.innerHTML = "";
    data.pesan.forEach(p => {
        elPesan.innerHTML += `
        <div class="mb-2 p-2 rounded ${p.dari !== "admin" ? "bg-blue-50" : "bg-gray-100 text-right"}">
            <span class="text-xs text-gray-500">${p.waktu}</span><br>
            <strong>${p.dari}:</strong> ${p.isi}
        </div>`;
    });
}

// Fungsi pengelolaan
function tambahSaldo(user) {
    const jml = parseInt(document.getElementById(`tambah-${user}`).value);
    if (!jml || jml <= 0) return alert("Masukkan jumlah yang benar!");
    const akun = data.users.find(u => u.username === user);
    akun.saldo += jml;
    simpanData();
    alert("✅ Saldo berhasil ditambahkan!");
}

function setujui(id) {
    const tr = data.transaksi.find(t => t.id === id);
    tr.status = "disetujui";
    const akun = data.users.find(u => u.username === tr.username);
    akun.saldo += tr.jumlah;
    simpanData();
    alert("✅ Transaksi disetujui!");
}

function tolak(id) {
    data.transaksi.find(t => t.id === id).status = "ditolak";
    simpanData();
    alert("❌ Transaksi ditolak!");
}

function prosesTarik(id) {
    data.penarikan.find(t => t.id === id).status = "selesai";
    simpanData();
    alert("✅ Penarikan diproses!");
}

function tolakTarik(id) {
    const tr = data.penarikan.find(t => t.id === id);
    tr.status = "ditolak";
    const akun = data.users.find(u => u.username === tr.username);
    akun.saldo += tr.jumlah;
    simpanData();
    alert("❌ Penarikan ditolak, saldo dikembalikan!");
}

function kirimBalasan() {
    const teks = document.getElementById("balasPesan").value.trim();
    if (!teks) return;
    data.pesan.push({ dari: "admin", ke: "semua", isi: teks, waktu: new Date().toLocaleString("id-ID") });
    simpanData();
    document.getElementById("balasPesan").value = "";
}
