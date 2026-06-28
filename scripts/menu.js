const menuItems = [
    {
        id: 1,
        name: "Coffee Latte",
        price: 13000,
        stock: 10,
        image: "https://placehold.co/300x200/8B4513/FFFFFF?text=Coffee+Latte"
    },
    {
        id: 2,
        name: "Brown Sugar Coffee",
        price: 13000,
        stock: 0,
        image: "https://placehold.co/300x200/8B4513/FFFFFF?text=Brown+Sugar+Coffee"
    },
    {
        id: 3,
        name: "Brown Sugar Latte",
        price: 13000,
        stock: 5,
        image: "https://placehold.co/300x200/8B4513/FFFFFF?text=Brown+Sugar+Latte"
    }
];

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

function addToCart(menuId) {
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

function renderCheckout() {
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

function removeFromCart(menuId) {
    let cart = getCart();
    cart = cart.filter(function(item) {
        return item.id !== menuId;
    });
    saveCart(cart);
    renderCart();
}

document.addEventListener("DOMContentLoaded", function() {
    renderMenu();
    renderCart();
});