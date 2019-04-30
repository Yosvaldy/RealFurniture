//variables
const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.close-cart');
const clearCartBtn = document.querySelector('.clear-cart');
const cartDOM = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartItems = document.querySelector('.cart-btn .cart-items');
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const productsDOM = document.querySelector('.products-center');
const cartTitle = document.querySelector('.cart-title');


const body = $(document.body);
//cart
let cart = [];

//buttons
let buttonsDOM = [];

class Products {
     async getProducts() {
         try {
            let result = await fetch('data.json');
            let data = await result.json();
            let products = data.items;
            products = products.map(item => {
                const {title, price} = item.fields;
                const {id} = item.sys;
                const image = item.fields.image.fields.file.url;
                return {title, price, id, image}
            })
            return products;
         } catch (error) {
             console.log(error);
         }
     }
}

class UI {
    displayProducts(products) {
        let result ='';
        products.forEach(product => {
            result += 
                    `<article class="product">
                        <div class="img-container">
                            <img src=${product.image} alt=${product.title} class="product-img">
                            <button class="bag-btn" data-id=${product.id}>
                                <i class="fas fa-shopping-cart"></i>add to cart
                            </button>
                        </div>
                        <h3>${product.title}</h3>
                        <h4>$${product.price}</h4>
                    </article>`
        });
        productsDOM.innerHTML = result;
    }

    getBagButtons() {
        const btns = [...document.querySelectorAll(".bag-btn")];
        buttonsDOM = btns;

        btns.forEach(button => {
            let id = button.dataset.id;
            let inCart = cart.find(item => item.id === id);
            
            if(inCart) {
                button.innerText = "In Cart";
                button.disabled = true;
                button.style.background = 'var(--mainItemInCart)';
                button.style.color = 'var(--mainWhite)';
            }

            button.addEventListener('click', (event) => {
                event.target.innerText = "In Cart";
                event.target.disabled = true;
                button.style.background = 'var(--mainItemInCart)';
                button.style.color = 'var(--mainWhite)';

                // Get product from products in localStorage
                let cartItem = {...Storage.getProduct(id), amount: 1};
                
                // Add product to the cart
                cart = [...cart, cartItem];
                
                // Save cart in local storage
                Storage.saveCart(cart);

                // Set cart values
                this.setCartValues(cart);

                // Display cart item
                this.addCartItem(cartItem);

                // Show the cart
                //this.showCart();
            });

            // cartOverlay.addEventListener('click', () => {
            //     this.hideCart();
            // });
        });
    }

    setCartValues(cart) {
        let tempTotal = 0;
        let itemsTotal = 0;
        cart.map(item => {
            tempTotal += item.price * item.amount;
            itemsTotal += item.amount;
        })

        cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
        cartItems.innerText = itemsTotal;
    }

    addCartItem(item) {
        const div = document.createElement('div');
        div.classList.add('cart-item');
        div.innerHTML = 
                        `<img src=${item.image} alt="product">
                            <div>
                                <h4>${item.title}</h4>
                                <h5>$${item.price}</h5>
                                <span class="remove-item" data-id=${item.id}>remove</span>
                            </div>
                            <div>
                                <i class="fas fa-chevron-up" data-id=${item.id}></i>
                                <p class="item-amount">${item.amount}</p>
                                <i class="fas fa-chevron-down" data-id=${item.id}></i>
                            </div>`

        cartContent.appendChild(div);
    }

    showCart(){
        cartOverlay.classList.add('transparentBcg');
        cartDOM.classList.add('showCart');
        body.css('overflow', 'hidden');
        body.css('margin-right', '15px');
    };

    hideCart() {
        cartOverlay.classList.remove('transparentBcg');
        cartDOM.classList.remove('showCart');
        body.css('overflow', 'auto');
        body.css('margin-right', '0');

    }

    setUpApp() {
        cart = Storage.getCart();
        this.setCartValues(cart);
        this.populateCart(cart);
        cartBtn.addEventListener('click', this.showCart);
        closeCartBtn.addEventListener('click', this.hideCart);
    }

    populateCart(cart) {
        cart.forEach(item => {
            this.addCartItem(item);
        })
    }

    cartLogic() {
        //clear cart button
        clearCartBtn.addEventListener('click', () => {
            this.clearCart();
        });

        //cart functionality
    }

    clearCart() {
        let cartItems = cart.map(item => item.id);
        cartItems.forEach(id => this.removeItem(id));
        
        while(cartContent.children.length > 0){
            cartContent.removeChild(cartContent.children[0]);
        }

        this.hideCart();
    }

    removeItem(id) {
        cart = cart.filter(item => item.id !== id);
        this.setCartValues(cart);
        Storage.saveCart(cart);
        let button = this.getSingleButton(id);
        button.disabled = false;
        button.innerHTML = `<i class="fas fa-shopping-cart"></i>add to cart`
        button.style.background = 'var(--primaryColor)';
        button.style.color = 'var(--mainBlack)';
    }

    getSingleButton(id) {
        return buttonsDOM.find(button => button.dataset.id === id);
    }
}

class Storage {
    static saveProducts(products) {
        localStorage.setItem("products", JSON.stringify(products));
    }

    static getProduct(id) {
        let products = JSON.parse(localStorage.getItem('products'));
        return products.find(product => product.id === id);
    }

    static saveCart(cart) {
        localStorage.setItem('cart', JSON.stringify(cart));
        cartTitle.innerText = "your cart";
    }

    static getCart() {
        cart.length == 0 ? cartTitle.innerText = "cart is empty" : "your cart";
        return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [];
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const ui = new UI();
    const products = new Products();

    //SetUp app
    ui.setUpApp();

    // get all products
    products.getProducts().then(products => {
        ui.displayProducts(products);
        Storage.saveProducts(products);
    }).then(() => { 
        ui.getBagButtons(); 
        ui.cartLogic();
    });
});