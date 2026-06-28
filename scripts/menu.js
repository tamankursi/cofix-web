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