const SANDI_ADMIN = "rahmanaulia180602002";

// Ambil dan simpan data terpusat
const DATA_KEY = "aeroPlaneData";

function cekSandi() {
    const input = document.getElementById("passAdmin").value.trim();
    if (input === SANDI_ADMIN) {
        document.getElementById("loginAdmin").classList.add("hidden");
        document.getElementById("kontenAdmin").classList.remove("hidden");
        muatData();
    } else {
        alert("❌ Sandi salah!");
    }
}

function keluarAdmin() {
    document.getElementById("kontenAdmin").classList.add("hidden");
    document.getElementById("loginAdmin").classList.remove("hidden");
    document.getElementById("passAdmin").value = "";
}

let data = {};
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

function tampilkanData() {
    const elUser = document.getElementById("daftarPengguna");
    elUser.innerHTML = data.users.length ? "" : "<p class='text-gray-500'>Belum ada pengguna</p>";
    data.users.forEach(u => {
        elUser.innerHTML += `
        <div class="border-b pb-3 flex flex-wrap justify-between items-center gap-2">
            <div>
                <p class="font-medium">${u.username}</p>
                <p class="text-sm text-gray-500">Email: ${u.email} | Saldo: Rp ${u.saldo.toLocaleString("id-ID")}</p>
            </div>
            <div class="flex gap-1.5">
                <input type="number" id="tambah-${u.username}" class="w-20 border rounded px-2 py-1 text-sm" placeholder="Jml">
                <button onclick="tambahSaldo('${u.username}')" class="bg-sukses text-white px-2 py-1 rounded text-sm">Tambah</button>
            </div>
        </div>`;
    });

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
    akun.investasi.push({ jumlah: tr.jumlah, waktuMulai: new Date().toISOString(), selesai: false });
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
    data.users.find(u => u.username === tr.username).saldo += tr.jumlah;
    simpanData();
    alert("❌ Penarikan ditolak, saldo dikembalikan!");
}

function kirimBalasan() {
    const teks = document.getElementById("balasPesan").value.trim();
    if (!teks) return;
    data.pesan.push({ dari: "admin", ke: "semua", isi: teks, waktu: new Date().toLocaleString("id-ID") });
    simpanData();
    document.getElementById("balasPesan").value = "";
    muatData();
}
