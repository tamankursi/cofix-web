import{t as e}from"./supabase-DzmAdRKq.js";async function t(){let{data:{session:t}}=await e.auth.getSession();if(!t){window.location.href=`/admin-login.html`;return}n(),r()}async function n(){let t=document.getElementById(`orders-list`),{data:n,error:r}=await e.from(`orders`).select(`*`).order(`created_at`,{ascending:!1});if(r){t.innerHTML=`<p style="color:#D32F2F;">Gagal memuat pesanan.</p>`;return}if(n.length===0){t.innerHTML=`<p style="color:#888;">Belum ada pesanan.</p>`;return}let i=``;n.forEach(function(e){i+=`
                    <div style="background:#EFEBE9; border-radius:8px; padding:16px; margin-bottom:12px;">
                        <div style="display:flex; justify-content:space-between; flex-wrap:wrap; gap:8px;">
                            <div>
                                <strong>#${e.id}</strong> - ${e.customer_name}
                                <span style="margin-left:8px; color:#888;">${e.phone}</span>
                            </div>
                            <div>
                                <span style="background:#FF8F00; color:#3E2723; padding:4px 8px; border-radius:4px; font-size:12px;">${e.method}</span>
                                <span style="margin-left:8px; background:#3E2723; color:#EFEBE9; padding:4px 8px; border-radius:4px; font-size:12px;">${e.status}</span>
                            </div>
                        </div>
                        <div style="margin-top:8px; color:#3E2723; font-weight:bold;">
                            Total: Rp ${e.total.toLocaleString(`id-ID`)}
                        </div>
                        ${e.address?`<div style="margin-top:4px; color:#666; font-size:14px;">Alamat: ${e.address}</div>`:``}
                        <div style="margin-top:4px; color:#888; font-size:12px;">${new Date(e.created_at).toLocaleString(`id-ID`)}</div>
                    </div>
                `}),t.innerHTML=i}async function r(){let t=document.getElementById(`menu-list-admin`),{data:n,error:r}=await e.from(`products`).select(`*`).order(`id`);if(r){t.innerHTML=`<p style="color:#D32F2F;">Gagal memuat menu.</p>`;return}if(n.length===0){t.innerHTML=`<p style="color:#888;">Belum ada menu.</p>`;return}let i=``;n.forEach(function(e){let t=e.available?`<span style="background:#4CAF50; color:white; padding:2px 8px; border-radius:4px; font-size:12px;">Tersedia</span>`:`<span style="background:#BDBDBD; color:#333; padding:2px 8px; border-radius:4px; font-size:12px;">Disembunyikan</span>`,n=e.stock===0?`<span style="background:#D32F2F; color:white; padding:2px 8px; border-radius:4px; font-size:12px;">Habis</span>`:`<span style="color:#666; font-size:14px;">Stok: `+e.stock+`</span>`;i+=`
                    <div style="display:flex; justify-content:space-between; align-items:center; padding:12px; background:#EFEBE9; border-radius:8px; margin-bottom:8px; flex-wrap:wrap; gap:8px;">
                        <div>
                            <strong>${e.name}</strong>
                            <span style="margin-left:8px; color:#FF8F00; font-weight:bold;">Rp ${e.price.toLocaleString(`id-ID`)}</span>
                        </div>
                        <div style="display:flex; align-items:center; gap:8px;">
                            ${t}
                            ${n}
                            <button onclick="editMenu(${e.id}, '${e.name}', ${e.price}, ${e.stock})" style="padding:4px 12px; background-color:#FF8F00; color:#3E2723; border:none; border-radius:4px; cursor:pointer; font-size:12px;">Edit</button>
                            <button onclick="deleteMenu(${e.id})" style="padding:4px 12px; background-color:#D32F2F; color:white; border:none; border-radius:4px; cursor:pointer; font-size:12px;">Hapus</button>
                        </div>
                    </div>
                `}),t.innerHTML=i}window.editMenu=function(e,t,n,r){document.getElementById(`form-menu`).style.display=`block`,document.getElementById(`form-title`).textContent=`Edit Menu`,document.getElementById(`edit-id`).value=e,document.getElementById(`menu-name`).value=t,document.getElementById(`menu-price`).value=n,document.getElementById(`menu-stock`).value=r},window.deleteMenu=async function(t){if(!confirm(`Yakin ingin menghapus menu ini?`))return;let{error:n}=await e.from(`products`).delete().eq(`id`,t);if(n){alert(`Gagal menghapus menu: `+n.message);return}r()},document.getElementById(`btn-tambah-menu`).addEventListener(`click`,function(){document.getElementById(`form-menu`).style.display=`block`,document.getElementById(`form-title`).textContent=`Tambah Menu`,document.getElementById(`edit-id`).value=``,document.getElementById(`menu-name`).value=``,document.getElementById(`menu-price`).value=``,document.getElementById(`menu-stock`).value=``}),document.getElementById(`btn-batal-menu`).addEventListener(`click`,function(){document.getElementById(`form-menu`).style.display=`none`}),document.getElementById(`btn-simpan-menu`).addEventListener(`click`,async function(){let t=document.getElementById(`edit-id`).value,n=document.getElementById(`menu-name`).value.trim(),i=parseInt(document.getElementById(`menu-price`).value),a=parseInt(document.getElementById(`menu-stock`).value);if(!n||isNaN(i)||isNaN(a)){alert(`Mohon lengkapi semua field dengan benar.`);return}if(t){let{error:r}=await e.from(`products`).update({name:n,price:i,stock:a}).eq(`id`,t);if(r){alert(`Gagal mengupdate menu: `+r.message);return}}else{let{error:t}=await e.from(`products`).insert([{name:n,price:i,stock:a,available:!0}]);if(t){alert(`Gagal menambah menu: `+t.message);return}}document.getElementById(`form-menu`).style.display=`none`,r()}),document.getElementById(`logout-btn`).addEventListener(`click`,async function(){await e.auth.signOut(),window.location.href=`/admin-login.html`}),t();