import { supabase } from "./supabase.js";

let menuItems = [];
const EDGE_FUNCTION_URL = "https://lathuftssqgdxawjunwc.supabase.co/functions/v1/create-snap-token";
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

function renderMenu() {
    const menuGrid = document.querySelector(".menu-grid");

    if (!menuGrid) {
        console.log("Elemen .menu-grid tidak ditemukan di halaman ini.");
        return;
    }

    menuGrid.innerHTML = "";

    menuItems.forEach(function (item) {
        const isOutOfStock = item.stock === 0;

        const card = document.createElement("article");
        card.classList.add("menu-card");

        card.innerHTML = `
            <img src="${item.image}" alt="${item.name}" style="width:100%; border-radius:8px; margin-bottom:12px;">
            <h3>${item.name}</h3>
            <p>Rp ${item.price.toLocaleString("id-ID")}</p>
            ${isOutOfStock
                ? `<button disabled style="background-color:#BDBDBD; cursor:not-allowed;">Habis</button>`
                : `<button onclick="addToCart(${item.id})">Tambah ke Keranjang</button>`
            }
        `;

        menuGrid.appendChild(card);
    });
}

function getCart() {
    const cartData = localStorage.getItem("cofix-cart");
    if (cartData) {
        return JSON.parse(cartData);
    }
    return [];
}

function saveCart(cart) {
    localStorage.setItem("cofix-cart", JSON.stringify(cart));
}

window.addToCart = function(menuId) {
    const cart = getCart();
    const menuItem = menuItems.find(function(item) {
        return item.id === menuId;
    });

    if (!menuItem) {
        console.log("Menu tidak ditemukan.");
        return;
    }

    if (menuItem.stock === 0) {
        console.log("Stok habis.");
        return;
    }

    const existingItem = cart.find(function(item) {
        return item.id === menuId;
    });

    if (existingItem) {
        if (existingItem.quantity < menuItem.stock) {
            existingItem.quantity += 1;
        } else {
            alert("Stok tidak mencukupi.");
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
    alert(menuItem.name + " ditambahkan ke keranjang.");
}

function renderCart() {
    const cartContainer = document.getElementById("cart-items");
    const totalContainer = document.getElementById("cart-total");

    if (!cartContainer || !totalContainer) {
        return;
    }

    const cart = getCart();

    if (cart.length === 0) {
        cartContainer.innerHTML = '<p style="color:#888;">Keranjang kosong.</p>';
        totalContainer.innerHTML = "";
        return;
    }

    let cartHTML = "";
    let total = 0;

    cart.forEach(function(item) {
        const subtotal = item.price * item.quantity;
        total += subtotal;

        cartHTML += `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:12px; background:#EFEBE9; border-radius:8px; margin-bottom:8px;">
                <div>
                    <strong>${item.name}</strong>
                    <span style="margin-left:8px; color:#888;">x${item.quantity}</span>
                </div>
                <div style="display:flex; align-items:center; gap:12px;">
                    <span>Rp ${subtotal.toLocaleString("id-ID")}</span>
                    <button onclick="removeFromCart(${item.id})" style="background:#D32F2F; color:white; border:none; padding:6px 12px; border-radius:4px; cursor:pointer; font-size:12px;">Hapus</button>
                </div>
            </div>
        `;
    });

    cartContainer.innerHTML = cartHTML;
    totalContainer.innerHTML = '<p style="font-size:18px; margin-top:12px;">Total: Rp ' + total.toLocaleString("id-ID") + '</p>';
        totalContainer.innerHTML += '<a href="/checkout.html" style="display:inline-block; margin-top:12px; padding:12px 24px; background-color:#FF8F00; color:#3E2723; text-decoration:none; border-radius:4px; font-weight:bold;">Checkout</a>';
}

window.renderCheckout = function() {
    const checkoutItems = document.getElementById("checkout-items");
    const checkoutTotal = document.getElementById("checkout-total");

    if (!checkoutItems || !checkoutTotal) {
        return;
    }

    const cart = getCart();

    if (cart.length === 0) {
        checkoutItems.innerHTML = '<p style="color:#888;">Keranjang kosong. <a href="/products.html">Lihat menu</a></p>';
        checkoutTotal.innerHTML = "";
        document.getElementById("pay-button").disabled = true;
        return;
    }

    let html = "";
    let total = 0;

    cart.forEach(function(item) {
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
}

window.submitOrder = async function(event) {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const method = document.getElementById("method").value;
    const address = document.getElementById("address") 
        ? document.getElementById("address").value.trim() 
        : "";

    if (!name || !phone || !method) {
        alert("Mohon lengkapi data pemesan.");
        return;
    }

    if (method === "delivery" && !address) {
        alert("Mohon isi alamat untuk pengiriman.");
        return;
    }

    const cart = getCart();

    if (cart.length === 0) {
        alert("Keranjang kosong. Silakan pilih menu terlebih dahulu.");
        return;
    }

        const customerName = name;
    const orderCart = [...cart];
    
    let total = 0;
    cart.forEach(function(item) {
        total += item.price * item.quantity;
    });

    const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert([
            {
                customer_name: name,
                phone: phone,
                method: method,
                address: method === "delivery" ? address : null,
                total: total,
                status: "pending"
            }
        ])
        .select("id")
        .single();

    if (orderError) {
        console.error("Gagal menyimpan pesanan:", orderError.message);
        alert("Gagal menyimpan pesanan. Silakan coba lagi.");
        return;
    }

    const orderId = orderData.id;

    const orderItems = cart.map(function(item) {
        return {
            order_id: orderId,
            product_name: item.name,
            price: item.price,
            quantity: item.quantity,
            subtotal: item.price * item.quantity
        };
    });

    const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

    if (itemsError) {
        console.error("Gagal menyimpan item pesanan:", itemsError.message);
        alert("Gagal menyimpan detail pesanan. Silakan coba lagi.");
        return;
    }

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
        alert("Gagal memproses pembayaran. Silakan coba lagi.");
        return;
    }

    const snapToken = snapData.token;

    window.snap.pay(snapToken, {
                        onSuccess: function(result) {
            const messageText = `☕ *Pesanan Baru Cofix!*\n\n📦 *Order ID:* #COFIX-${orderId}\n👤 *Pemesan:* ${customerName}\n🛵 *Metode:* ${method === "delivery" ? "Delivery" : "Pick Up"}\n${method === "delivery" && address ? `📍 *Alamat:* ${address}\n` : ""}\n📋 *Detail Pesanan:*\n${orderCart.map(function(item) { return `  - ${item.name} x${item.quantity} = Rp ${(item.price * item.quantity).toLocaleString("id-ID")}`; }).join("\n")}\n\n💰 *Total:* Rp ${total.toLocaleString("id-ID")}\n\n_Silakan cek dashboard untuk memproses pesanan._`;

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
            .then(function(res) { return res.json(); })
            .then(function(data) {
                console.log("Fonnte Response:", data);
                localStorage.removeItem("cofix-cart");
                alert("Pembayaran berhasil! Pesanan Anda akan segera diproses.");
                window.location.href = "/";
            })
            .catch(function(error) {
                console.error("Fonnte Error:", error);
                localStorage.removeItem("cofix-cart");
                alert("Pembayaran berhasil! Pesanan Anda akan segera diproses.");
                window.location.href = "/";
            });
        },
        
        onPending: function(result) {
            localStorage.removeItem("cofix-cart");
            alert("Pembayaran tertunda. Silakan selesaikan pembayaran Anda.");
            window.location.href = "/";
        },
        onError: function(result) {
            alert("Pembayaran gagal. Silakan coba lagi.");
        },
        onClose: function() {
            alert("Anda menutup popup pembayaran. Pesanan tetap tersimpan dan bisa dibayar nanti.");
        },
    });
};

window.removeFromCart = function(menuId) {
    let cart = getCart();
    cart = cart.filter(function(item) {
        return item.id !== menuId;
    });
    saveCart(cart);
    renderCart();
}

document.addEventListener("DOMContentLoaded", function() {
    fetchMenuItems();
    renderCart();
});