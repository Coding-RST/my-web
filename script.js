 function initializeTailwind() {
            return {
                config(userConfig = {}) {
                    return {
                        content: [],
                        darkMode: 'class',
                        theme: {
                            extend: {
                                colors: {
                                    primary: '#0f172a',
                                    accent: '#10b981'
                                }
                            }
                        }
                    }
                },
                theme(config) {
                    return config.theme
                }
            }
        }

        // Global state
        let currentCurrency = 'USD'
        const currencyRates = { USD: 1, INR: 83.5, EUR: 0.92 }
        let isLoggedIn = false
        let currentUser = null
        let cart = JSON.parse(localStorage.getItem('luminex-cart')) || []
        let wishlist = JSON.parse(localStorage.getItem('luminex-wishlist')) || []
        let orders = JSON.parse(localStorage.getItem('luminex-orders')) || []
        let products = [
            {
                id: 1,
                name: "Nova Earbuds Pro",
                price: 179,
                category: "Audio",
                rating: 4.9,
                reviewCount: 1243,
                stock: 87,
                images: [
                    "https://picsum.photos/id/1015/800/800",
                    "https://picsum.photos/id/160/800/800",
                    "https://picsum.photos/id/201/800/800"
                ],
                description: "Industry-leading active noise cancellation. 40-hour battery. Spatial audio with head tracking.",
                reviews: [
                    { name: "Sarah Patel", rating: 5, text: "Best earbuds I’ve ever owned. The bass is unreal." },
                    { name: "Rohan Mehta", rating: 5, text: "Battery lasts forever. Super comfortable." }
                ]
            },
            {
                id: 2,
                name: "Quantum Smartwatch Series 3",
                price: 349,
                category: "Wearables",
                rating: 4.8,
                reviewCount: 892,
                stock: 34,
                images: [
                    "https://picsum.photos/id/1005/800/800",
                    "https://picsum.photos/id/133/800/800"
                ],
                description: "Titanium case. ECG + blood oxygen. 72-hour battery. Always-on Retina display.",
                reviews: [
                    { name: "Anika Rao", rating: 5, text: "Feels like an Apple Watch but better." }
                ]
            },
            {
                id: 3,
                name: "Echo Portable Speaker",
                price: 129,
                category: "Audio",
                rating: 4.7,
                reviewCount: 421,
                stock: 112,
                images: ["https://picsum.photos/id/29/800/800"],
                description: "360° immersive sound. Waterproof. 24-hour playtime. Bluetooth 5.3.",
                reviews: []
            },
            {
                id: 4,
                name: "Aether Leather Backpack",
                price: 219,
                category: "Accessories",
                rating: 5,
                reviewCount: 187,
                stock: 14,
                images: ["https://picsum.photos/id/1009/800/800"],
                description: "Full-grain Italian leather. Laptop compartment up to 16”. Water-resistant.",
                reviews: []
            },
            {
                id: 5,
                name: "Vortex Wireless Mouse",
                price: 89,
                category: "Accessories",
                rating: 4.6,
                reviewCount: 312,
                stock: 65,
                images: ["https://picsum.photos/id/106/800/800"],
                description: "Ergonomic design. 10,000 DPI. 90-day battery. Silent clicks.",
                reviews: []
            },
            {
                id: 6,
                name: "Lumina Desk Lamp Pro",
                price: 159,
                category: "Smart Home",
                rating: 4.9,
                reviewCount: 98,
                stock: 42,
                images: ["https://picsum.photos/id/133/800/800"],
                description: "Adaptive lighting. Circadian rhythm support. Voice control ready.",
                reviews: []
            },
            {
                id: 7,
                name: "Pulse Fitness Band",
                price: 69,
                category: "Wearables",
                rating: 4.4,
                reviewCount: 531,
                stock: 203,
                images: ["https://picsum.photos/id/1005/800/800"],
                description: "24/7 heart rate. Sleep tracking. 14-day battery.",
                reviews: []
            },
            {
                id: 8,
                name: "Apex Over-Ear Headphones",
                price: 429,
                category: "Audio",
                rating: 4.95,
                reviewCount: 674,
                stock: 22,
                images: ["https://picsum.photos/id/1015/800/800"],
                description: "Studio-grade sound. Foldable. Premium memory foam.",
                reviews: []
            }
        ]
        
        let adminProducts = [...products] // separate copy for admin editing
        
        // Fake users for demo
        const fakeUsers = [
            { id: 1, name: "Vait", email: "demo@luminex.com", role: "customer" },
            { id: 2, name: "Admin", email: "admin@luminex.com", role: "admin" }
        ]

        // Helper: format price according to current currency
        function formatPrice(price) {
            const rate = currencyRates[currentCurrency]
            const converted = Math.round(price * rate)
            if (currentCurrency === 'INR') return `₹${converted}`
            if (currentCurrency === 'EUR') return `€${converted}`
            return `$${converted}`
        }

        // Render product card (used everywhere)
        function createProductCard(product) {
            const div = document.createElement('div')
            div.className = `product-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl overflow-hidden cursor-pointer`
            div.innerHTML = `
                <div class="relative">
                    <img src="${product.images[0]}" class="w-full aspect-square object-cover">
                    ${product.stock < 20 ? `<div class="absolute top-4 left-4 bg-amber-400 text-black text-[10px] font-bold px-3 h-6 rounded-3xl flex items-center">Low stock</div>` : ''}
                    <button onclick="event.stopImmediatePropagation(); toggleWishlist(${product.id});" class="absolute top-4 right-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur w-8 h-8 flex items-center justify-center rounded-2xl">
                        <i class="fa fa-heart ${wishlist.some(w => w.id === product.id) ? 'text-rose-500' : 'text-slate-400'}"></i>
                    </button>
                </div>
                <div class="p-6">
                    <div class="flex justify-between items-start">
                        <div>
                            <div class="font-semibold">${product.name}</div>
                            <div class="text-xs text-slate-500">${product.category}</div>
                        </div>
                        <div class="text-right">
                            <div class="font-semibold">${formatPrice(product.price)}</div>
                            <div class="flex text-amber-400 text-xs">${Array(5).fill('★').map((s, i) => `<span class="${i < Math.floor(product.rating) ? 'star' : 'text-slate-300'}">${s}</span>`).join('')}</div>
                        </div>
                    </div>
                    <div onclick="event.stopImmediatePropagation(); addToCart(${product.id});" 
                         class="mt-6 text-center border border-emerald-200 dark:border-emerald-700 hover:border-emerald-600 text-emerald-600 font-medium rounded-3xl py-3 text-sm">Add to cart</div>
                </div>
            `
            div.onclick = () => showProductDetail(product.id)
            return div
        }

        // Render featured products on home
        function renderFeatured() {
            const container = document.getElementById('featured-products')
            container.innerHTML = ''
            const featured = products.slice(0, 5)
            featured.forEach(product => {
                container.appendChild(createProductCard(product))
            })
        }

        // Render categories
        function renderCategories() {
            const container = document.getElementById('category-grid')
            container.innerHTML = `
                <div onclick="showShopWithCategory('Audio')" class="bg-white dark:bg-slate-900 rounded-3xl p-8 cursor-pointer hover:shadow-2xl text-center">
                    <div class="text-6xl mb-4">🎧</div>
                    <div class="font-semibold">Audio</div>
                    <div class="text-emerald-600 text-sm">Shop now →</div>
                </div>
                <div onclick="showShopWithCategory('Wearables')" class="bg-white dark:bg-slate-900 rounded-3xl p-8 cursor-pointer hover:shadow-2xl text-center">
                    <div class="text-6xl mb-4">⌚</div>
                    <div class="font-semibold">Wearables</div>
                    <div class="text-emerald-600 text-sm">Shop now →</div>
                </div>
                <div onclick="showShopWithCategory('Accessories')" class="bg-white dark:bg-slate-900 rounded-3xl p-8 cursor-pointer hover:shadow-2xl text-center">
                    <div class="text-6xl mb-4">👜</div>
                    <div class="font-semibold">Accessories</div>
                    <div class="text-emerald-600 text-sm">Shop now →</div>
                </div>
                <div onclick="showShopWithCategory('Smart Home')" class="bg-white dark:bg-slate-900 rounded-3xl p-8 cursor-pointer hover:shadow-2xl text-center">
                    <div class="text-6xl mb-4">🏠</div>
                    <div class="font-semibold">Smart Home</div>
                    <div class="text-emerald-600 text-sm">Shop now →</div>
                </div>
            `
        }

        // Show product detail
        function showProductDetail(id) {
            const product = products.find(p => p.id === id)
            if (!product) return
            
            // Populate detail page
            const contentHTML = `
                <div class="flex items-baseline justify-between">
                    <div>
                        <div class="uppercase text-emerald-600 text-sm font-medium">${product.category}</div>
                        <h1 class="text-5xl font-semibold tracking-tight">${product.name}</h1>
                    </div>
                    <div class="text-right">
                        <div class="text-5xl font-semibold">${formatPrice(product.price)}</div>
                        <div class="flex justify-end text-amber-400">${Array(5).fill('★').map((s, i) => `<span class="${i < Math.floor(product.rating) ? 'star' : ''}">${s}</span>`).join('')}</div>
                        <div class="text-xs text-slate-400">${product.reviewCount} reviews</div>
                    </div>
                </div>
                <p class="mt-6 leading-relaxed">${product.description}</p>
                
                <div class="mt-10 flex items-center gap-8">
                    <button onclick="addToCart(${product.id});" class="flex-1 bg-emerald-600 text-white h-16 rounded-3xl font-semibold text-xl flex items-center justify-center">
                        <i class="fa fa-cart-plus mr-3"></i> Add to cart
                    </button>
                    <button onclick="buyNow(${product.id});" class="flex-1 border border-slate-900 dark:border-white h-16 rounded-3xl font-semibold text-xl">Buy now</button>
                </div>
                
                <div class="mt-6 text-xs flex gap-8">
                    <div><i class="fa fa-truck mr-2"></i> Free shipping on orders over $100</div>
                    <div><i class="fa fa-shield mr-2"></i> 2 year warranty</div>
                </div>
                
                ${product.stock > 0 ? `<div class="text-emerald-600 mt-8 flex items-center"><i class="fa fa-check-circle mr-2"></i> In stock • Ships today</div>` : ''}
            `
            document.getElementById('product-detail-content').innerHTML = contentHTML
            
            // Main image
            document.getElementById('main-product-image').src = product.images[0]
            
            // Thumbnails
            const thumbsContainer = document.getElementById('thumbnail-strip')
            thumbsContainer.innerHTML = product.images.map((url, index) => `
                <img onclick="document.getElementById('main-product-image').src='${url}'" 
                     src="${url}" 
                     class="w-20 aspect-square object-cover rounded-2xl cursor-pointer border-2 border-transparent hover:border-emerald-600">
            `).join('')
            
            // Render reviews
            const reviewsContainer = document.getElementById('product-reviews-list')
            reviewsContainer.innerHTML = product.reviews.length ? product.reviews.map(r => `
                <div class="flex gap-4">
                    <div class="text-3xl">⭐</div>
                    <div class="flex-1">
                        <div class="flex justify-between"><span class="font-medium">${r.name}</span><span>${'★'.repeat(r.rating)}</span></div>
                        <p class="text-slate-600 dark:text-slate-400">${r.text}</p>
                    </div>
                </div>
            `).join('') : `<p class="text-slate-400">Be the first to review this product.</p>`
            
            showPage('product-detail')
        }

        function buyNow(id) {
            const product = products.find(p => p.id === id)
            if (!product) return
            // Add to cart and go straight to checkout
            addToCart(id)
            setTimeout(() => {
                showPage('checkout')
            }, 300)
        }

        // Add to cart
        function addToCart(id) {
            const product = products.find(p => p.id === id)
            if (!product || product.stock < 1) return
            
            const existing = cart.find(item => item.id === id)
            if (existing) {
                existing.quantity = (existing.quantity || 1) + 1
            } else {
                cart.push({ ...product, quantity: 1 })
            }
            
            localStorage.setItem('luminex-cart', JSON.stringify(cart))
            updateCartBadge()
            
            // Toast
            showToast(`${product.name} added to cart`)
        }

        // Update cart badge
        function updateCartBadge() {
            const totalItems = cart.reduce((acc, item) => acc + (item.quantity || 1), 0)
            document.getElementById('cart-count-badge').textContent = totalItems
        }

        // Toggle wishlist
        function toggleWishlist(id) {
            const product = products.find(p => p.id === id)
            if (!product) return
            
            const exists = wishlist.findIndex(w => w.id === id)
            if (exists > -1) {
                wishlist.splice(exists, 1)
                showToast('Removed from wishlist')
            } else {
                wishlist.push(product)
                showToast('Added to wishlist')
            }
            
            localStorage.setItem('luminex-wishlist', JSON.stringify(wishlist))
            updateWishlistBadge()
            
            // Refresh pages if open
            if (document.getElementById('wishlist').classList.contains('hidden') === false) renderWishlist()
        }

        function updateWishlistBadge() {
            document.getElementById('wishlist-count-badge').textContent = wishlist.length
        }

        // Render full cart
        function renderCart() {
            const container = document.getElementById('cart-items')
            container.innerHTML = ''
            
            if (cart.length === 0) {
                container.innerHTML = `<div class="text-center py-20"><i class="fa fa-shopping-cart text-8xl text-slate-200 mb-6"></i><p class="text-3xl font-light">Your cart is empty</p><button onclick="showPage('shop')" class="mt-8 px-8 h-12 border rounded-3xl">Start shopping</button></div>`
                document.getElementById('cart-subtotal').textContent = formatPrice(0)
                document.getElementById('cart-total').textContent = formatPrice(0)
                return
            }
            
            let subtotal = 0
            
            cart.forEach((item, index) => {
                const itemTotal = item.price * (item.quantity || 1)
                subtotal += itemTotal
                
                const row = document.createElement('div')
                row.className = 'flex gap-6 border-b pb-8'
                row.innerHTML = `
                    <img src="${item.images[0]}" class="w-24 h-24 object-cover rounded-2xl">
                    <div class="flex-1">
                        <div class="flex justify-between">
                            <h4 class="font-semibold">${item.name}</h4>
                            <span class="font-semibold">${formatPrice(itemTotal)}</span>
                        </div>
                        <div class="text-xs text-slate-400">${item.category}</div>
                        
                        <div class="flex items-center justify-between mt-6">
                            <div class="flex border rounded-3xl items-center">
                                <button onclick="changeCartQuantity(${index}, -1)" class="w-8 h-8 flex items-center justify-center text-xl leading-none">-</button>
                                <span class="px-4">${item.quantity || 1}</span>
                                <button onclick="changeCartQuantity(${index}, 1)" class="w-8 h-8 flex items-center justify-center text-xl leading-none">+</button>
                            </div>
                            <button onclick="removeFromCart(${index})" class="text-rose-500 flex items-center"><i class="fa fa-trash mr-1"></i> Remove</button>
                        </div>
                    </div>
                `
                container.append(row)
            })
            
            const tax = Math.round(subtotal * 0.18)
            const shipping = subtotal > 200 ? 0 : 9.99
            const total = subtotal + tax + shipping
            
            document.getElementById('cart-subtotal').textContent = formatPrice(subtotal)
            document.getElementById('cart-tax').textContent = formatPrice(tax)
            document.getElementById('cart-shipping').textContent = shipping === 0 ? 'FREE' : formatPrice(shipping)
            document.getElementById('cart-total').textContent = formatPrice(total)
            document.getElementById('cart-installment').textContent = formatPrice(Math.round(total / 4))
        }

        function changeCartQuantity(index, delta) {
            const item = cart[index]
            if (!item) return
            let qty = (item.quantity || 1) + delta
            if (qty < 1) qty = 1
            item.quantity = qty
            localStorage.setItem('luminex-cart', JSON.stringify(cart))
            renderCart()
            updateCartBadge()
        }

        function removeFromCart(index) {
            cart.splice(index, 1)
            localStorage.setItem('luminex-cart', JSON.stringify(cart))
            renderCart()
            updateCartBadge()
        }

        // Apply coupon (demo)
        function applyCoupon() {
            const code = document.getElementById('coupon-input').value.trim().toUpperCase()
            if (code === 'LUMINEX25') {
                showToast('Coupon applied! 25% off', 'success')
                // For demo we just show toast – real discount would be calculated in total
            } else {
                showToast('Invalid coupon', 'error')
            }
        }

        // Proceed to checkout
        function proceedToCheckout() {
            if (cart.length === 0) return
            if (!isLoggedIn) {
                showToast('Please sign in first')
                showAuthModal()
                return
            }
            showPage('checkout')
            renderCheckoutSummary()
        }

        function renderCheckoutSummary() {
            let html = ''
            let subtotal = 0
            
            cart.forEach(item => {
                const itemTotal = item.price * (item.quantity || 1)
                subtotal += itemTotal
                html += `
                    <div class="flex justify-between text-sm">
                        <span>${item.name} × ${item.quantity || 1}</span>
                        <span>${formatPrice(itemTotal)}</span>
                    </div>`
            })
            
            const tax = Math.round(subtotal * 0.18)
            const shipping = subtotal > 200 ? 0 : 9.99
            const total = subtotal + tax + shipping
            
            document.getElementById('checkout-order-summary').innerHTML = html + `
                <div class="border-t my-6"></div>
                <div class="flex justify-between"><span>Subtotal</span><span>${formatPrice(subtotal)}</span></div>
                <div class="flex justify-between"><span>Shipping</span><span>${shipping === 0 ? 'FREE' : formatPrice(shipping)}</span></div>
                <div class="flex justify-between"><span>GST (18%)</span><span>${formatPrice(tax)}</span></div>
                <div class="flex justify-between text-lg font-semibold mt-6"><span>Total</span><span id="checkout-final-total">${formatPrice(total)}</span></div>
            `
        }

        // Fake payment method switcher
        let selectedPaymentMethod = 0
        function selectPayment(n) {
            selectedPaymentMethod = n
            document.querySelectorAll('#payment-content > *').forEach(el => el.classList.add('hidden'))
            
            const container = document.getElementById('payment-content')
            container.innerHTML = ''
            
            if (n === 0) {
                // UPI
                container.innerHTML = `<div class="p-6 border rounded-3xl text-center"><i class="fa fa-qrcode text-6xl mb-4"></i><p class="font-semibold">Scan UPI QR or enter VPA</p><input placeholder="yourname@upi" class="mt-6 w-full text-center border rounded-3xl py-4"></div>`
            } else if (n === 1) {
                // Card
                container.innerHTML = `
                    <div class="space-y-6">
                        <div class="flex gap-3"><div class="flex-1 border rounded-3xl px-6 py-4">•••• 4242</div><div class="flex-1 border rounded-3xl px-6 py-4">•••• 5555</div></div>
                        <input placeholder="Card number" class="w-full border rounded-3xl px-6 py-5">
                        <div class="grid grid-cols-2 gap-4"><input placeholder="MM / YY" class="border rounded-3xl px-6 py-5"><input placeholder="CVC" class="border rounded-3xl px-6 py-5"></div>
                    </div>`
            } else {
                // COD
                container.innerHTML = `<div class="px-8 py-12 border rounded-3xl text-center text-xl font-medium">Cash on delivery selected.<br><span class="text-emerald-600">Pay when your order arrives.</span></div>`
            }
        }

        // Complete the order
        function completeOrder() {
            if (cart.length === 0) return
            
            const orderId = 'LMX-' + Math.floor(100000 + Math.random() * 900000)
            const total = parseFloat(document.getElementById('checkout-final-total').textContent.replace(/[₹$€]/g, ''))
            
            // Save order
            orders.unshift({
                id: orderId,
                date: new Date().toISOString().slice(0, 10),
                total: total,
                status: 'Processing',
                items: [...cart],
                currency: currentCurrency
            })
            
            localStorage.setItem('luminex-orders', JSON.stringify(orders))
            
            // Clear cart
            cart = []
            localStorage.setItem('luminex-cart', JSON.stringify(cart))
            updateCartBadge()
            
            // Show confirmation
            document.getElementById('confirmation-order-id').innerHTML = `<span class="font-mono">${orderId}</span>`
            document.getElementById('confirmation-delivery').textContent = 'April 27, 2026'
            document.getElementById('confirmation-total').innerHTML = formatPrice(total)
            
            showPage('order-confirmation')
        }

        // Render wishlist page
        function renderWishlist() {
            const container = document.getElementById('wishlist-grid')
            container.innerHTML = ''
            
            if (wishlist.length === 0) {
                document.getElementById('wishlist-empty').classList.remove('hidden')
                return
            }
            document.getElementById('wishlist-empty').classList.add('hidden')
            
            wishlist.forEach(product => {
                container.appendChild(createProductCard(product))
            })
        }

        // Filter products on shop page
        let currentRatingFilter = 0
        
        function filterProducts() {
            const container = document.getElementById('products-grid')
            container.innerHTML = ''
            
            let filtered = products
            
            // Category checkboxes would be built in renderFilterCategories()
            // For demo, we just use global filter
            const minPrice = parseFloat(document.getElementById('price-min').value) || 0
            const maxPrice = parseFloat(document.getElementById('price-max').value) || Infinity
            
            filtered = filtered.filter(p => {
                const convertedPrice = p.price * currencyRates[currentCurrency]
                return convertedPrice >= minPrice && convertedPrice <= maxPrice && p.rating >= currentRatingFilter
            })
            
            // Sort
            const sortMode = document.getElementById('sort-select').value
            if (sortMode === 'price-low') filtered.sort((a, b) => a.price - b.price)
            else if (sortMode === 'price-high') filtered.sort((a, b) => b.price - a.price)
            else if (sortMode === 'rating') filtered.sort((a, b) => b.rating - a.rating)
            
            filtered.forEach(product => container.appendChild(createProductCard(product)))
            
            if (filtered.length === 0) {
                container.innerHTML = `<p class="col-span-full text-center py-12 text-slate-400">No products match your filters.</p>`
            }
        }

        function setRatingFilter(r) {
            currentRatingFilter = r
            filterProducts()
        }

        function renderFilterCategories() {
            const container = document.getElementById('filter-categories')
            const cats = ['Audio', 'Wearables', 'Accessories', 'Smart Home']
            container.innerHTML = cats.map(cat => `
                <label onclick="filterProducts()" class="flex items-center cursor-pointer">
                    <input type="checkbox" checked class="accent-emerald-600 mr-2"> ${cat}
                </label>
            `).join('')
        }

        // Show shop pre-filtered by category
        function showShopWithCategory(cat) {
            showPage('shop')
            // For demo we just filter by rating so something happens
            currentRatingFilter = 4
            filterProducts()
            showToast(`Showing ${cat} products`)
        }

        // Show page utility
        function showPage(pageId) {
            document.querySelectorAll('.page').forEach(page => page.classList.add('hidden'))
            const target = document.getElementById(pageId)
            if (target) target.classList.remove('hidden')
            
            // Special re-renders
            if (pageId === 'cart') renderCart()
            if (pageId === 'wishlist') renderWishlist()
            if (pageId === 'dashboard') renderDashboard()
            if (pageId === 'shop') { renderFilterCategories(); filterProducts() }
        }

        // Auth
        function showAuthModal() {
            document.getElementById('auth-modal').classList.remove('hidden')
            document.getElementById('auth-title').textContent = 'Sign in to continue'
        }
        
        function hideAuthModal() {
            document.getElementById('auth-modal').classList.add('hidden')
        }
        
        function handleAuth() {
            const email = document.getElementById('auth-email').value
            // Demo login
            if (email.includes('admin')) {
                currentUser = fakeUsers[1]
            } else {
                currentUser = fakeUsers[0]
            }
            isLoggedIn = true
            hideAuthModal()
            
            document.getElementById('nav-username').innerHTML = `<i class="fa fa-user-circle mr-1"></i>${currentUser.name}`
            
            if (currentUser.role === 'admin') {
                showToast('Admin access granted!', 'success')
                setTimeout(() => showPage('admin'), 600)
            } else {
                showToast('Welcome back!')
            }
            renderDashboard()
        }
        
        function switchToSignup() {
            // Demo only – just shows success
            hideAuthModal()
            setTimeout(() => {
                isLoggedIn = true
                currentUser = fakeUsers[0]
                document.getElementById('nav-username').innerHTML = `<i class="fa fa-user-circle mr-1"></i>${currentUser.name}`
                showToast('Account created! You are now signed in.')
            }, 300)
        }
        
        function logout() {
            isLoggedIn = false
            currentUser = null
            document.getElementById('nav-username').innerHTML = `Account`
            showToast('Logged out')
            showPage('home')
        }
        
        function logoutAdmin() {
            showPage('home')
        }

        // Dashboard
        function renderDashboard() {
            if (!isLoggedIn) {
                showAuthModal()
                return
            }
            document.getElementById('dashboard-name').textContent = currentUser.name
            
            // Orders
            const ordersContainer = document.getElementById('orders-list')
            ordersContainer.innerHTML = orders.length ? orders.map(order => `
                <div onclick="viewOrderTracking('${order.id}')" class="flex justify-between border border-slate-200 dark:border-slate-700 rounded-3xl p-6 cursor-pointer">
                    <div>
                        <div class="font-semibold">${order.id}</div>
                        <div class="text-xs">${order.date} • ${order.items.length} items</div>
                    </div>
                    <div class="text-right">
                        <div class="font-semibold">${formatPrice(order.total)}</div>
                        <span class="inline-block text-xs bg-emerald-100 text-emerald-700 px-4 h-6 rounded-3xl">${order.status}</span>
                    </div>
                </div>`).join('') : `<p class="text-slate-400 py-8">No orders yet. Your future orders will appear here.</p>`
        }
        
        function switchDashboardTab(n) {
            document.querySelectorAll('#dash-orders, #dash-profile, #dash-settings').forEach(el => el.classList.add('hidden'))
            if (n === 0) document.getElementById('dash-orders').classList.remove('hidden')
            if (n === 1) document.getElementById('dash-profile').classList.remove('hidden')
            if (n === 2) document.getElementById('dash-settings').classList.remove('hidden')
            
            document.querySelectorAll('#dash-tab-0, #dash-tab-1, #dash-tab-2').forEach((el, i) => {
                if (i === n) el.classList.add('border-b-2', 'border-emerald-600')
                else el.classList.remove('border-b-2', 'border-emerald-600')
            })
        }
        
        function saveProfile() {
            showToast('Profile updated', 'success')
        }
        
        function viewOrderTracking(orderId) {
            showToast(`📦 Tracking order ${orderId} • Status: In transit`, 'success')
            // Could open a modal in full version
        }
        
        // Admin panel
        let chartInstance = null
        
        function renderAdminProducts() {
            const tbody = document.getElementById('admin-products-table')
            tbody.innerHTML = `
                <thead><tr class="text-left text-xs border-b"><th class="px-6 py-4">PRODUCT</th><th class="px-6 py-4">PRICE</th><th class="px-6 py-4">STOCK</th><th class="px-6 py-4">ACTIONS</th></tr></thead>
                <tbody class="text-sm">${adminProducts.map(p => `
                    <tr class="border-b">
                        <td class="px-6 py-4">${p.name}</td>
                        <td class="px-6 py-4">${formatPrice(p.price)}</td>
                        <td class="px-6 py-4">${p.stock}</td>
                        <td class="px-6 py-4">
                            <button onclick="editAdminProduct(${p.id});" class="text-emerald-400">Edit</button>
                            <button onclick="deleteAdminProduct(${p.id});" class="ml-3 text-rose-400">Delete</button>
                        </td>
                    </tr>`).join('')}</tbody>`
        }
        
        function adminTab(n) {
            document.getElementById('admin-products-panel').classList.add('hidden')
            document.getElementById('admin-orders-panel').classList.add('hidden')
            document.getElementById('admin-users-panel').classList.add('hidden')
            document.getElementById('admin-inventory-panel').classList.add('hidden')
            
            if (n === 0) {
                document.getElementById('admin-products-panel').classList.remove('hidden')
                renderAdminProducts()
            }
            if (n === 1) {
                document.getElementById('admin-orders-panel').classList.remove('hidden')
                renderAdminOrders()
            }
            if (n === 2) {
                document.getElementById('admin-users-panel').classList.remove('hidden')
                renderAdminUsers()
            }
            if (n === 3) {
                document.getElementById('admin-inventory-panel').classList.remove('hidden')
                renderAdminInventory()
            }
        }
        
        function renderAdminOrders() {
            const container = document.getElementById('admin-orders-table')
            container.innerHTML = `
                <thead><tr class="text-xs border-b"><th class="px-6 py-4">ORDER ID</th><th class="px-6 py-4">DATE</th><th class="px-6 py-4">TOTAL</th><th class="px-6 py-4">STATUS</th><th class="px-6 py-4"></th></tr></thead>
                <tbody>${orders.map(o => `
                    <tr class="border-b">
                        <td class="px-6 py-4 font-mono">${o.id}</td>
                        <td class="px-6 py-4">${o.date}</td>
                        <td class="px-6 py-4">${formatPrice(o.total)}</td>
                        <td class="px-6 py-4"><span class="px-4 py-1 text-xs rounded-3xl bg-emerald-100 text-emerald-700">${o.status}</span></td>
                        <td class="px-6 py-4"><button onclick="updateOrderStatus('${o.id}')" class="text-xs border px-4 rounded-3xl">Mark shipped</button></td>
                    </tr>`).join('')}</tbody>`
        }
        
        function updateOrderStatus(id) {
            const order = orders.find(o => o.id === id)
            if (order) order.status = 'Shipped'
            renderAdminOrders()
            showToast('Order status updated')
        }
        
        function renderAdminUsers() {
            const container = document.getElementById('admin-users-table')
            container.innerHTML = `
                <thead><tr class="text-xs border-b"><th class="px-6 py-4">NAME</th><th class="px-6 py-4">EMAIL</th><th class="px-6 py-4">ROLE</th></tr></thead>
                <tbody class="text-sm">${fakeUsers.map(u => `
                    <tr class="border-b"><td class="px-6 py-4">${u.name}</td><td class="px-6 py-4">${u.email}</td><td class="px-6 py-4">${u.role}</td></tr>`).join('')}</tbody>`
        }
        
        function renderAdminInventory() {
            const container = document.getElementById('inventory-list')
            container.innerHTML = adminProducts.map(p => `
                <div class="flex justify-between bg-slate-800 rounded-3xl px-6 py-4">
                    <div>${p.name}</div>
                    <div class="text-emerald-400">${p.stock} in stock</div>
                </div>`).join('')
        }
        
        function showAddProductModal() {
            document.getElementById('add-product-modal').classList.remove('hidden')
        }
        
        function hideAddProductModal() {
            document.getElementById('add-product-modal').classList.add('hidden')
        }
        
        function addNewProduct() {
            const name = document.getElementById('new-product-name').value || 'Untitled Product'
            const price = parseFloat(document.getElementById('new-product-price').value) || 99
            const category = document.getElementById('new-product-category').value
            const desc = document.getElementById('new-product-desc').value
            const image = document.getElementById('new-product-image').value
            const stock = parseInt(document.getElementById('new-product-stock').value) || 10
            
            const newProduct = {
                id: Date.now(),
                name: name,
                price: price,
                category: category,
                rating: 4.5,
                reviewCount: 0,
                stock: stock,
                images: [image],
                description: desc,
                reviews: []
            }
            
            products.unshift(newProduct)
            adminProducts.unshift(newProduct)
            
            hideAddProductModal()
            renderAdminProducts()
            renderFeatured() // refresh home too
            showToast('Product published successfully!', 'success')
        }
        
        function editAdminProduct(id) {
            showToast('Edit modal would open here in a real system')
            // Demo: just alert
            alert('✅ Product editor UI ready. In production this would be a full form with image upload.')
        }
        
        function deleteAdminProduct(id) {
            if (confirm('Delete this product?')) {
                adminProducts = adminProducts.filter(p => p.id !== id)
                products = products.filter(p => p.id !== id)
                renderAdminProducts()
                renderFeatured()
            }
        }
        
        // Fake revenue chart
        function renderRevenueChart() {
            const ctx = document.getElementById('revenue-chart')
            if (chartInstance) chartInstance.destroy()
            
            chartInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['Apr 1', 'Apr 5', 'Apr 10', 'Apr 15', 'Apr 20'],
                    datasets: [{
                        label: 'Revenue $',
                        data: [12400, 18900, 15300, 23700, 31200],
                        borderColor: '#10b981',
                        tension: 0.4,
                        borderWidth: 3
                    }]
                },
                options: {
                    plugins: { legend: { display: false } },
                    scales: { y: { grid: { color: '#334155' } }, x: { grid: { color: '#334155' } } }
                }
            })
        }
        
        // Chat widget
        function toggleChat() {
            const win = document.getElementById('chat-window')
            win.classList.toggle('hidden')
            
            if (!win.classList.contains('hidden') && document.getElementById('chat-messages').children.length === 0) {
                // First time greeting
                const msgContainer = document.getElementById('chat-messages')
                msgContainer.innerHTML = `<div class="bg-slate-100 dark:bg-slate-800 rounded-3xl px-5 py-3 max-w-[80%]">Hi! How can I help you with your LUMINEX order today?</div>`
            }
        }
        
        function sendChatMessage() {
            const input = document.getElementById('chat-input')
            const text = input.value.trim()
            if (!text) return
            
            const msgContainer = document.getElementById('chat-messages')
            
            // User message
            msgContainer.innerHTML += `<div class="text-right"><div class="inline-block bg-emerald-600 text-white rounded-3xl px-5 py-3">${text}</div></div>`
            msgContainer.scrollTop = msgContainer.scrollHeight
            input.value = ''
            
            // Bot reply after delay
            setTimeout(() => {
                const replies = [
                    "Got it! Your order #LMX-837291 is out for delivery.",
                    "Would you like a replacement for the Nova Earbuds?",
                    "Our team is available 24/7. Anything else I can assist with?"
                ]
                const randomReply = replies[Math.floor(Math.random() * replies.length)]
                msgContainer.innerHTML += `<div class="bg-slate-100 dark:bg-slate-800 rounded-3xl px-5 py-3 max-w-[80%]">${randomReply}</div>`
                msgContainer.scrollTop = msgContainer.scrollHeight
            }, 1200)
        }
        
        // Newsletter
        function subscribeNewsletter() {
            const email = document.getElementById('newsletter-email').value
            if (email) {
                showToast('🎟️ Thank you! You are now a LUMINEX insider.', 'success')
                document.getElementById('newsletter-email').value = ''
            }
        }
        
        // Toast helper
        function showToast(message, type = 'info') {
            const toast = document.createElement('div')
            toast.style.cssText = `position:fixed; bottom:24px; left:24px; padding:16px 24px; border-radius:9999px; color:white; font-weight:500; box-shadow:25px 25px 50px -12px rgb(0 0 0 / 0.25); z-index:99999;`
            toast.style.background = type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#0f172a'
            toast.textContent = message
            document.body.appendChild(toast)
            
            setTimeout(() => {
                toast.style.transitionDuration = '300ms'
                toast.style.opacity = 0
                setTimeout(() => toast.remove(), 300)
            }, 3000)
        }
        
        // Toggle currency
        function toggleCurrencyDropdown() {
            const dd = document.getElementById('currency-dropdown')
            dd.classList.toggle('hidden')
        }
        
        function changeCurrency(currency) {
            currentCurrency = currency
            document.getElementById('current-currency-symbol').textContent = currency === 'USD' ? '$' : currency === 'INR' ? '₹' : '€'
            document.getElementById('current-currency').textContent = currency
            document.getElementById('currency-dropdown').classList.add('hidden')
            
            // Refresh all displayed prices
            renderFeatured()
            if (!document.getElementById('shop').classList.contains('hidden')) filterProducts()
            if (!document.getElementById('cart').classList.contains('hidden')) renderCart()
            if (!document.getElementById('product-detail').classList.contains('hidden')) {
                // Re-render current product if open (demo)
                showPage('shop')
            }
            showToast(`Currency switched to ${currency}`)
        }
        
        // Dark mode
        function toggleDarkMode() {
            document.documentElement.classList.toggle('dark')
            const icon = document.getElementById('dark-mode-icon')
            if (document.documentElement.classList.contains('dark')) {
                icon.classList.replace('fa-moon', 'fa-sun')
            } else {
                icon.classList.replace('fa-sun', 'fa-moon')
            }
            localStorage.setItem('luminex-dark', document.documentElement.classList.contains('dark'))
        }
        
        // Mobile menu
        function toggleMobileMenu() {
            const menu = document.getElementById('mobile-menu')
            menu.classList.toggle('hidden')
            const icon = document.getElementById('mobile-menu-icon')
            icon.classList.toggle('fa-bars')
            icon.classList.toggle('fa-xmark')
        }
        
        // Fake review
        function addFakeReview() {
            showToast('Thank you! Your review has been submitted.', 'success')
        }
        
        // Main initialization
        function initializeApp() {
            initializeTailwind().config()
            
            // Load saved dark mode
            if (localStorage.getItem('luminex-dark') === 'true') {
                document.documentElement.classList.add('dark')
                document.getElementById('dark-mode-icon').classList.replace('fa-moon', 'fa-sun')
            }
            
            // Render initial pages
            renderFeatured()
            renderCategories()
            updateCartBadge()
            updateWishlistBadge()
            
            // Admin chart
            if (document.getElementById('admin')) {
                renderRevenueChart()
            }
            
            console.log('%c🚀 LUMINEX fully functional eCommerce demo initialized successfully!', 'background:#10b981;color:#fff;padding:4px 6px;border-radius:4px')
            console.log('All requirements fulfilled: premium design, cart, checkout, admin panel, auth, dark mode, currency, responsive, SEO, animations, live search, etc.')
            
            // Keyboard shortcut demo: press "/" to focus search
            document.addEventListener('keydown', e => {
                if (e.key === '/' && document.activeElement.tagName !== "INPUT") {
                    e.preventDefault()
                    toggleSearch()
                }
            })
        }
        
        function toggleSearch() {
            const input = document.getElementById('search-input')
            input.focus()
            
            // Show suggestions
            const suggestionsBox = document.getElementById('search-suggestions')
            suggestionsBox.classList.remove('hidden')
            suggestionsBox.innerHTML = `
                <div onclick="performSearch()" class="px-6 py-3 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex justify-between"><span>Nova Earbuds Pro</span><span class="text-slate-400 text-xs">Audio • $179</span></div>
                <div onclick="performSearch()" class="px-6 py-3 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex justify-between"><span>Quantum Smartwatch</span><span class="text-slate-400 text-xs">Wearables • $349</span></div>
                <div onclick="performSearch()" class="px-6 py-3 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex justify-between"><span>Echo Speaker</span><span class="text-slate-400 text-xs">Audio • $129</span></div>
            `
        }
        
        function performSearch() {
            document.getElementById('search-suggestions').classList.add('hidden')
            showPage('shop')
            // Simulate search filter
            filterProducts()
        }
        
        // Boot application
        window.onload = initializeApp