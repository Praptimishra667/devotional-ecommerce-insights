<script>
    let currentUser = localStorage.getItem("iskconUser") || null;
    let cart = JSON.parse(localStorage.getItem("iskconCart")) || [];
    let couponDiscount = 0;
    let isLogin = true;

    const products = [
      { name: 'Tulsi Mala', desc: 'Sacred tulsi beads.', price: 120, category: 'Accessories', img: 'https://tse4.mm.bing.net/th/id/OIP.AIMlqnMpvFra3__8wrIDngHaJ4?pid=Api&P=0&h=180', rating: 4 },
      { name: 'Ghee Lamp', desc: 'Traditional ghee lamp.', price: 80, category: 'Ritual', img: 'https://thumbs.dreamstime.com/b/glowing-earthen-ghee-lamp-dark-diyas-diwali-deepawali-lined-up-preparation-celebration-festival-lights-306774797.jpg', rating: 5 },
      { name: 'Bhagavatam Set', desc: 'Complete Srimad Bhagavatam.', price: 2500, category: 'Books', img: 'https://www.touchstonemedia.com/cdn/shop/products/original-srimad-bhagavatam-set-pre-1978-10-volumes-philosophy-201.jpg?v=1647437417&width=522', rating: 5 },
      { name: 'Tilak Pack', desc: 'Natural tilak powder.', price: 60, category: 'Ritual', img: 'https://m.media-amazon.com/images/I/31GtrCGENmL.__AC_SX300_SY300_QL70_ML2_.jpg', rating: 4 },
      { name: 'Mahaprasadam Laddu', desc: 'Sweet offered to Krishna.', price: 50, category: 'Mahaprasadam', img: 'https://tse3.mm.bing.net/th/id/OIP.2VYCgs_q9JU6LxIZTf9udAHaEB?pid=Api&P=0&h=180', rating: 5 },
      { name: 'Jagannath Rice', desc: 'Blessed rice from temple.', price: 40, category: 'Mahaprasadam', img: 'https://tse2.mm.bing.net/th/id/OIP.KLFgnE02QLpPF8VI8MksxAHaJU?pid=Api&P=0&h=180', rating: 4 }
    ];

    function toggleDarkMode() {
      const isDark = document.body.classList.toggle('dark-mode');
      localStorage.setItem('darkMode', isDark);
    }

    function showToast(message) {
      const toast = new bootstrap.Toast(document.getElementById('toast'));
      document.getElementById('toastMessage').textContent = message;
      toast.show();
    }

    function loginUser() {
      isLogin = true;
      document.getElementById("authTitle").textContent = "Login";
      document.getElementById("authUsername").value = "";
      new bootstrap.Modal(document.getElementById("authModal")).show();
    }

    function toggleAuthMode() {
      isLogin = !isLogin;
      document.getElementById("authTitle").textContent = isLogin ? "Login" : "Register";
    }

    function handleLogin() {
      const username = document.getElementById("authUsername").value.trim();
      if (!username) return showToast("Username cannot be empty");

      const key = `iskconUser_${username}`;
      const modal = bootstrap.Modal.getInstance(document.getElementById("authModal"));

      if (isLogin) {
        if (localStorage.getItem(key)) {
          localStorage.setItem("iskconUser", username);
          currentUser = username;
          showToast(`Welcome back, ${username}!`);
          modal.hide();
        } else {
          showToast("User not found. Please register.");
        }
      } else {
        if (localStorage.getItem(key)) {
          showToast("User already exists.");
        } else {
          localStorage.setItem(key, "registered");
          localStorage.setItem("iskconUser", username);
          currentUser = username;
          showToast(`Registered successfully, ${username}!`);
          modal.hide();
        }
      }
    }

    function displayProducts(list) {
      const mainContainer = document.getElementById('productsContainer');
      const foodContainer = document.getElementById('foodContainer');
      mainContainer.innerHTML = '';
      foodContainer.innerHTML = '';
      list.forEach(p => {
        const stars = '⭐'.repeat(Math.floor(p.rating));
        const cardHTML = `
          <div class="col-md-4">
            <div class="product-card">
              <img src="${p.img}" alt="${p.name}">
              <h4>${p.name}</h4>
              <p>${p.desc}</p>
              <p>Rating: ${stars}</p>
              <p><strong>₹${p.price}</strong></p>
              <button class="btn btn-sm btn-outline-primary" onclick="addToCart('${p.name}')">Add to Cart</button>
            </div>
          </div>`;
        if (p.category === 'Mahaprasadam') {
          foodContainer.innerHTML += cardHTML;
        } else {
          mainContainer.innerHTML += cardHTML;
        }
      });
    }

    function filterByCategory(cat) {
      displayProducts(cat === 'all' ? products : products.filter(p => p.category === cat));
    }

    function searchProducts(term) {
      const filtered = products.filter(p => p.name.toLowerCase().includes(term.toLowerCase()));
      displayProducts(filtered);
    }

    function addToCart(name) {
      const item = products.find(p => p.name === name);
      const existing = cart.find(i => i.name === name);
      if (existing) {
        existing.qty++;
      } else {
        cart.push({ ...item, qty: 1 });
      }
      localStorage.setItem("iskconCart", JSON.stringify(cart));
      updateCart();
    }

    function updateCart() {
      const cartList = document.getElementById('cartItems');
      const totalEl = document.getElementById('totalAmount');
      cartList.innerHTML = '';
      let total = 0;
      cart.forEach((item, i) => {
        const subtotal = item.price * item.qty;
        total += subtotal;
        cartList.innerHTML += `
          <li class="list-group-item d-flex justify-content-between align-items-center">
            ${item.name} (x${item.qty}) - ₹${subtotal}
            <button class="btn btn-sm btn-danger" onclick="removeItem(${i})">X</button>
          </li>`;
      });
      total -= couponDiscount;
      totalEl.textContent = Math.max(total, 0);
      document.getElementById("payAmt").textContent = Math.max(total, 0);
    }

    function removeItem(index) {
      cart.splice(index, 1);
      localStorage.setItem("iskconCart", JSON.stringify(cart));
      updateCart();
    }

    function applyCoupon() {
      const code = document.getElementById("couponCode").value;
      if (code === "HAREKRISHNA") {
        couponDiscount = 100;
        updateCart();
        showToast("Coupon Applied! ₹100 off 🥳");
      } else {
        showToast("Invalid Coupon!");
      }
    }

    function checkout() {
      if (!currentUser) {
        showToast("Please login before checkout.");
        loginUser();
        return;
      }
      new bootstrap.Modal(document.getElementById("paymentModal")).show();
    }

    function confirmPayment() {
      showToast("Payment Successful! Hare Krishna ✨");
      cart = [];
      localStorage.removeItem("iskconCart");
      updateCart();
      bootstrap.Modal.getInstance(document.getElementById("paymentModal")).hide();
    }

    function addProduct() {
      const name = document.getElementById("pname").value.trim();
      const desc = document.getElementById("pdesc").value.trim();
      const price = +document.getElementById("pprice").value;
      const img = document.getElementById("pimg").value.trim();
      const cat = document.getElementById("pcategory").value;
      if (name && desc && price && img) {
        products.push({ name, desc, price, category: cat, img, rating: 5 });
        showToast("Product Added!");
        displayProducts(products);
      } else {
        showToast("Fill all fields.");
      }
    }

    // Rotating Slokas
    const shlokas = [
      "Hare Krishna Hare Krishna<br>Krishna Krishna Hare Hare<br>Hare Rama Hare Rama<br>Rama Rama Hare Hare",
      "man-mana bhava mad-bhakto<br>mad-yaji mam namaskuru<br>mam evaishyasi satyam te<br>pratijane priyo ’si me",
      "sarva-dharman parityajya<br>mam ekam sharanam vraja<br>aham tvam sarva-papebhyo<br>mokshayishyami ma shuchah",
      "yatra yogeshvara krishna<br>yatra partho dhanur-dharah<br>tatra shrir vijayo bhutir<br>dhruva nitir matir mama",
      "om namo bhagavate vasudevaya",
      "vasudeva sutam devam<br>kamsa-chanura-mardanam<br>devaki paramanandam<br>krishnam vande jagadgurum"
    ];

    function rotateShloka() {
      let index = 0;
      setInterval(() => {
        document.getElementById('slokaText').innerHTML = shlokas[index];
        index = (index + 1) % shlokas.length;
      }, 1000);
    }

    window.onload = () => {
      if (localStorage.getItem('darkMode') === 'true') document.body.classList.add('dark-mode');
      displayProducts(products);
      updateCart();
      rotateShloka();
    };

    function createFlower() {
  const flower = document.createElement('div');
  flower.classList.add('flower');
  flower.style.left = Math.random() * 100 + 'vw';
  flower.style.animationDuration = (3 + Math.random() * 5) + 's';
  document.body.appendChild(flower);

  setTimeout(() => flower.remove(), 8000);
}

setInterval(createFlower, 500);

  </script>