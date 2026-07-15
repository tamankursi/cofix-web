import { supabase } from "./supabase.js";

let menuItems = [];

// ========== FETCH DATA ==========

async function fetchMenuItems() {
    const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("available", true)
        .order("id");

    if (error) {
        console.error("Gagal mengambil data menu:", error.message);
        return;
    }

    if (data) {
        menuItems = data;
        renderMenu();
    }
}

// ========== RENDER MENU ==========

const localImages = {
    "Coffee Latte": "/asset/Coffe Latte.png",
    "Brown Sugar Coffee": "/asset/Brown Sugar Coffe.png",
    "Brown Sugar Latte": "/asset/Brown Sugar Latte.png"
};

function renderMenu() {
    const menuGrid = document.querySelector(".menu-grid");
    if (!menuGrid) return;

    menuGrid.innerHTML = "";

    menuItems.forEach(function (item) {
        const isOutOfStock = item.stock === 0;
        const card = document.createElement("article");
        card.classList.add("menu-card");

        const imageSrc = localImages[item.name] || item.image;

        card.innerHTML = `
            <img src="${imageSrc}" alt="${item.name}" style="width:100%; border-radius:8px; margin-bottom:12px;">
            <h3>${item.name}</h3>
            <p>Rp ${item.price.toLocaleString("id-ID")}</p>
            ${isOutOfStock
                ? '<button disabled style="background-color:#C4C4C4; cursor:not-allowed;">Habis</button>'
                : `<button onclick="addToCart(${item.id})">Tambah ke Keranjang</button>`
            }
        `;

        menuGrid.appendChild(card);
    });
}

// ========== TOAST NOTIFICATION ==========

function showToast(message) {
    const toast = document.getElementById("toast");
    if (!toast) return;

    toast.textContent = message;
    toast.style.opacity = "1";
    toast.style.transform = "translateY(0)";

    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(function () {
        toast.style.opacity = "0";
        toast.style.transform = "translateY(20px)";
    }, 2000);
}

// ========== KERANJANG ==========

function getCart() {
    const cartData = localStorage.getItem("cofix-cart");
    return cartData ? JSON.parse(cartData) : [];
}

function saveCart(cart) {
    localStorage.setItem("cofix-cart", JSON.stringify(cart));
}

window.addToCart = function (menuId) {
    const cart = getCart();
    const menuItem = menuItems.find(function (item) {
        return item.id === menuId;
    });

    if (!menuItem || menuItem.stock === 0) return;

    const existingItem = cart.find(function (item) {
        return item.id === menuId;
    });

    if (existingItem) {
        if (existingItem.quantity < menuItem.stock) {
            existingItem.quantity += 1;
        } else {
            showToast("Stok tidak mencukupi.");
            return;
        }
    } else {
        cart.push({
            id: menuItem.id,
            name: menuItem.name,
            price: menuItem.price,
            quantity: 1,
            stock: menuItem.stock
        });
    }

    saveCart(cart);
    renderCart();
    showToast(menuItem.name + " ditambahkan ke keranjang.");
};

window.removeFromCart = function (menuId) {
    let cart = getCart();
    cart = cart.filter(function (item) {
        return item.id !== menuId;
    });
    saveCart(cart);
    renderCart();
};

window.increaseQuantity = function (menuId) {
    const cart = getCart();
    const item = cart.find(function (item) {
        return item.id === menuId;
    });
    if (!item) return;

    const menuItem = menuItems.find(function (m) {
        return m.id === menuId;
    });

    if (menuItem && item.quantity < menuItem.stock) {
        item.quantity += 1;
        saveCart(cart);
        renderCart();
    } else {
        showToast("Stok tidak mencukupi.");
    }
};

window.decreaseQuantity = function (menuId) {
    const cart = getCart();
    const item = cart.find(function (item) {
        return item.id === menuId;
    });
    if (!item) return;

    if (item.quantity > 1) {
        item.quantity -= 1;
        saveCart(cart);
        renderCart();
    } else {
        removeFromCart(menuId);
    }
};

function renderCart() {
    const cartContainer = document.getElementById("cart-items");
    const totalContainer = document.getElementById("cart-total");
    if (!cartContainer || !totalContainer) return;

    const cart = getCart();

    if (cart.length === 0) {
        cartContainer.innerHTML = '<p style="color:#8C8C8C;">Keranjang kosong.</p>';
        totalContainer.innerHTML = "";
        return;
    }

    let cartHTML = "";
    let total = 0;

    cart.forEach(function (item) {
        const subtotal = item.price * item.quantity;
        total += subtotal;

        cartHTML += `
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; padding:12px; background:#F5F3EC; border-radius:8px; margin-bottom:8px;">
                <div>
                    <strong>${item.name}</strong>
                    <span style="margin-left:8px; display:inline-flex; align-items:center; gap:6px;">
                        <button onclick="decreaseQuantity(${item.id})" style="background:#1F150C; color:#FBF9F5; border:none; width:24px; height:24px; border-radius:50%; cursor:pointer; font-size:14px; line-height:1;">-</button>
                        <span style="min-width:20px; text-align:center; color:#1F150C;">${item.quantity}</span>
                        <button onclick="increaseQuantity(${item.id})" style="background:#1F150C; color:#FBF9F5; border:none; width:24px; height:24px; border-radius:50%; cursor:pointer; font-size:14px; line-height:1;">+</button>
                    </span>
                </div>
                <div style="display:flex; align-items:center; gap:12px;">
                    <span>Rp ${subtotal.toLocaleString("id-ID")}</span>
                    <button onclick="removeFromCart(${item.id})" style="background:#B0413E; color:white; border:none; padding:6px 12px; border-radius:4px; cursor:pointer; font-size:12px;">Hapus</button>
                </div>
            </div>
        `;
    });

    cartContainer.innerHTML = cartHTML;
    totalContainer.innerHTML = '<p style="font-size:18px; margin-top:12px;">Total: Rp ' + total.toLocaleString("id-ID") + '</p>';
    totalContainer.innerHTML += '<a href="/checkout.html" style="display:inline-block; margin-top:12px; padding:12px 24px; background-color:#E1DCC9; color:#1F150C; text-decoration:none; border-radius:50px; font-weight:600;">Checkout</a>';
}

// ========== CHECKOUT ==========

window.renderCheckout = function () {
    const checkoutItems = document.getElementById("checkout-items");
    const checkoutTotal = document.getElementById("checkout-total");
    if (!checkoutItems || !checkoutTotal) return;

    const cart = getCart();

    if (cart.length === 0) {
        checkoutItems.innerHTML = '<p style="color:#8C8C8C;">Keranjang kosong. <a href="/products.html">Lihat menu</a></p>';
        checkoutTotal.innerHTML = "";
        document.getElementById("pay-button").disabled = true;
        return;
    }

    let html = "";
    let total = 0;

    cart.forEach(function (item) {
        const subtotal = item.price * item.quantity;
        total += subtotal;

        html += `
            <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #ddd;">
                <span>${item.name} x${item.quantity}</span>
                <span>Rp ${subtotal.toLocaleString("id-ID")}</span>
            </div>
        `;
    });

    checkoutItems.innerHTML = html;
    checkoutTotal.innerHTML = 'Total: Rp ' + total.toLocaleString("id-ID");
};

// ========== SUBMIT ORDER ==========

window.submitOrder = async function (event) {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const method = document.getElementById("method").value;
    const address = document.getElementById("address")
        ? document.getElementById("address").value.trim()
        : "";

    if (!name || !phone || !method) {
        showToast("Mohon lengkapi data pemesan.");
        return;
    }

    if (method === "delivery" && !address) {
        showToast("Mohon isi alamat untuk pengiriman.");
        return;
    }

    const cart = getCart();

    if (cart.length === 0) {
        showToast("Keranjang kosong. Silakan pilih menu terlebih dahulu.");
        return;
    }

    const customerName = name;
    const orderCart = [...cart];

    let total = 0;
    cart.forEach(function (item) {
        total += item.price * item.quantity;
    });

    // Simpan pesanan
    const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert([{
            customer_name: name,
            phone: phone,
            method: method,
            address: method === "delivery" ? address : null,
            total: total,
            status: "pending"
        }])
        .select("id")
        .single();

    if (orderError) {
        console.error("Gagal menyimpan pesanan:", orderError.message);
        showToast("Gagal menyimpan pesanan. Silakan coba lagi.");
        return;
    }

    const orderId = orderData.id;

    // Simpan item pesanan
    const orderItems = cart.map(function (item) {
        return {
            order_id: orderId,
            product_name: item.name,
            price: item.price,
            quantity: item.quantity,
            subtotal: item.price * item.quantity
        };
    });

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems);

    if (itemsError) {
        console.error("Gagal menyimpan item pesanan:", itemsError.message);
        showToast("Gagal menyimpan detail pesanan. Silakan coba lagi.");
        return;
    }

    // Buat Snap Token
    const { data: snapData, error: snapError } = await supabase.functions.invoke("create-snap-token", {
        body: {
            order_id: "COFIX-" + orderId,
            gross_amount: total,
            customer_name: name,
            customer_phone: phone,
        },
    });

    if (snapError) {
        console.error("Gagal membuat Snap Token:", snapError.message);
        showToast("Gagal memproses pembayaran. Silakan coba lagi.");
        return;
    }

    const snapToken = snapData.token;

    // Buka popup pembayaran
    window.snap.pay(snapToken, {
        onSuccess: function () {
            sendWhatsAppNotification(customerName, orderId, orderCart, total, method, address);
        },
        onPending: function () {
            localStorage.removeItem("cofix-cart");
            showToast("Pembayaran tertunda. Silakan selesaikan pembayaran Anda.");
            window.location.href = "/";
        },
        onError: function () {
            showToast("Pembayaran gagal. Silakan coba lagi.");
        },
        onClose: function () {
            showToast("Popup ditutup. Pesanan tetap tersimpan dan bisa dibayar nanti.");
        },
    });
};

// ========== WHATSAPP NOTIFICATION ==========

function sendWhatsAppNotification(customerName, orderId, orderCart, total, method, address) {
    const itemsText = orderCart.map(function (item) {
        return `  - ${item.name} x${item.quantity} = Rp ${(item.price * item.quantity).toLocaleString("id-ID")}`;
    }).join("\n");

    const messageText = `☕ *Pesanan Baru Cofix!*\n\n📦 *Order ID:* #COFIX-${orderId}\n👤 *Pemesan:* ${customerName}\n🛵 *Metode:* ${method === "delivery" ? "Delivery" : "Pick Up"}\n${method === "delivery" && address ? `📍 *Alamat:* ${address}\n` : ""}\n📋 *Detail Pesanan:*\n${itemsText}\n\n💰 *Total:* Rp ${total.toLocaleString("id-ID")}\n\n_Silakan cek dashboard untuk memproses pesanan._`;

    const formData = new FormData();
    formData.append("target", "6285890058978");
    formData.append("message", messageText);
    formData.append("countryCode", "62");

    fetch("https://api.fonnte.com/send", {
        method: "POST",
        headers: {
            "Authorization": "Sm9hrEMG6ufUTE8BFqDP"
        },
        body: formData
    })
        .then(function (res) { return res.json(); })
        .then(function (data) {
            console.log("Fonnte Response:", data);
        })
        .catch(function (error) {
            console.error("Fonnte Error:", error);
        })
        .finally(function () {
            localStorage.removeItem("cofix-cart");
            showToast("Pembayaran berhasil! Pesanan akan segera diproses.");
            window.location.href = "/";
        });
}

// ========== INIT ==========

document.addEventListener("DOMContentLoaded", function () {
    fetchMenuItems();
    renderCart();
});

