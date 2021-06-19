/// <reference types="url-search-params" />
import ShopifyClient from "shopify-buy";

function futureDay(days) {
  var result: Date = new Date();
  result.setDate(result.getDate() + days);
  return result.toLocaleDateString("en-US");
}

function formatMoney(number: number, currency: string): string {
  var formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  });

  return formatter.format(number);
}

const serverUrl: string = "mandatum-app.uc.r.appspot.com";
class MandatumApp {
  discount: number;
  days: number;
  container: HTMLElement;
  modalContainer: HTMLDivElement;
  loading: boolean;
  shop: string;
  productId: number;
  shopifyClient;
  shopifyProduct;
  shopifyVariant;
  currency: string;

  constructor(
    container: HTMLElement,
    shop: string,
    descuento: number,
    dias: number,
    productId: number,
    storefrontToken: string,
    shopifyProduct
  ) {
    this.container = container;
    this.loading = true;
    this.shop = shop;
    this.discount = descuento;
    this.days = dias;
    this.productId = productId;
    this.shopifyProduct = shopifyProduct;
    this.currency = shopifyProduct.variants[0].priceV2.currencyCode;

    console.log(shop, storefrontToken);

    this.shopifyClient = ShopifyClient.buildClient({
      domain: shop,
      storefrontAccessToken: storefrontToken,
    });
  }

  async init(): Promise<Boolean> {
    this.addStyles();
    this.addMandatumButton();
    await this.addMandatumModal();
    this.loading = false;

    return this.loading;
  }

  async addCartMandate(): Promise<any> {
    const productId: string = `gid://shopify/Product/${this.productId}`;

    console.log("Shopify Variant", this.shopifyVariant);

    try {
      const codeData = await fetch(
        `https://${serverUrl}/getDiscountCode?shop=${this.shop}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productId: productId,
          }),
        }
      ).then((json) => json.json());

      const discountCode =
        codeData.codeDiscountNode.codeDiscount.codes.edges[0].node.code;

      console.log("Shopify Product", this.shopifyProduct);

      let newCheckout = await this.shopifyClient.checkout.create();

      const input = {
        customAttributes: [{ key: "Mandatum Order", value: "true" }],
      };

      newCheckout = await this.shopifyClient.checkout.updateAttributes(
        newCheckout.id,
        input
      );

      const variantIdShopify = this.shopifyProduct.variants.find(
        (variant) => variant.title === this.shopifyVariant.title
      ).id;

      const lineItemsToAdd = [
        {
          variantId: variantIdShopify,
          quantity: 1,
          customAttributes: [
            { key: "Mandatum Discount", value: `${this.discount}%` },
            { key: "Mandatum Delivery Days", value: `${this.days}%` },
          ],
        },
      ];

      console.log("Shopify Line Item", lineItemsToAdd);

      newCheckout = await this.shopifyClient.checkout.addLineItems(
        newCheckout.id,
        lineItemsToAdd
      );

      newCheckout = await this.shopifyClient.checkout.addDiscount(
        newCheckout.id,
        discountCode
      );

      let checkoutURL = newCheckout.webUrl;

      console.log(checkoutURL);

      location.assign(checkoutURL);
    } catch (error) {
      console.log(error);
    }
  }

  toggleModal(): void {
    this.modalContainer.classList.toggle("open");
  }

  addStyles(): void {
    const htmlHead: HTMLHeadElement = document.querySelector("head");
    const stylesTag: HTMLStyleElement = document.createElement("style");

    stylesTag.innerHTML = `
      .mandatum-button {
        position: fixed;
        left: 50%;
        bottom: 2rem;
        transform: translate3d(-50%, 0, 0);
        background-color: purple;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 30px;
        color: white;
        padding-right: 15px;
      }

      .mandatum-button:hover {
        cursor: pointer;
      }

      .mandatum-button h3 {
        color: white;
        text-align: center;
        margin: 0;
        font-size: 20px;
      }

      #mandatum_logo {
        width: 50px;
      }

      .mandatum-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100vh;
        background-color: rgba(0, 0, 0, 0.5);
        display: none;
        justify-content: center;
        align-items: center;
        z-index: 100000;
      }

      .mandatum-modal.open {
        display: flex;
      }

      .mandatum-modal .mandatum-modal-box {
        width: 90%;
        max-width: 400px;
        max-height: 90%;
        background-color: white;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        border-radius: 10px;
        overflow-y: scroll;
      }

      .mandatum-modal .mandatum-modal-box .mandatum-modal-head {
        width: 100%;
        background-color: purple;
        color: white;
        box-sizing: border-box;
        border-radius: 10px 10px 0 0;
      }

      .mandatum-modal .mandatum-modal-box .mandatum-modal-head svg {
        width: 200px;
        max-width: 100%;
      }

      .mandatum-modal-intro {
        text-align: center;
        box-sizing: border-box;
        width: 100%;
        padding: 20px;
        margin: 0;
      }

      .mandatum-modal .mandatum-modal-box h3 {
        padding: 20px;
        text-align: center;
        box-sizing: border-box;
        width: 100%;
        argin: 0;
      }

      .mandatum-modal .mandatum-modal-box p {
        padding: 0;
        text-align: center;
        box-sizing: border-box;
        width: 100%;
        margin: 0;
      }

      .mandatum-modal .mandatum-modal-box img {
        width: 80%;
        margin: 1rem auto;
      }

      .mandatum-modal .selector-wrapper {
        width: 100%;
      }

      .mandatum-modal .product-price-mandatum {
        font-weight: bold;

      }

      .mandatum-modal .product-price-mandatum span {
        color: purple;
      }

      .mandatum-modal .single-option-selector {
        opacity: 1;
        width: 90%;
        padding: 10px 15px;
        display: block;
        border: 1px solid purple;
        margin: 0 auto;
      }

      .mandatum-modal .mandatum-modal-box .mandatum-modal-buttons {
        width: 100%;
        box-sizing: border-box;
        margin: 2rem 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 20px;
      }

      .mandatum-modal .mandatum-modal-box .mandatum-modal-buttons button {
        width: 45%;
        padding: 20px 15px;
        border-radius: 10px;
        cursor: pointer;
        background-color: purple;
        color: white;
        border: none;
      }

      .mandatum-modal .mandatum-modal-box .mandatum-modal-buttons button[disabled] {
        background-color: grey;
        cursor: auto;
      }

      @media (max-width: 600px) {
        .mandatum-button {
          padding: 0;
        }

        .mandatum-button h3 {
          display: none;
        }
      }
    `;

    htmlHead.appendChild(stylesTag);
  }

  async addMandatumModal(): Promise<void> {
    const modalContainer: HTMLDivElement = document.createElement("div");
    const shopifyProduct = await fetch(
      `${location.href.split("?")[0]}.json`
    ).then((json) => json.json());

    modalContainer.classList.add("mandatum-modal");
    modalContainer.innerHTML = `
      <div class="mandatum-modal-box">
        <div class="mandatum-modal-head">
        <svg id="Layer_1" viewBox="0 0 720 216">
          <style type="text/css">
            .st0{fill:#FFFFFF;}
          </style>
          <g id="Layer_1_1_">
          </g>
          <g id="Layer_2">
            <g>
              <g id="Layer_2_1_">
                <g>
                  <g>
                    <g>
                      <path class="st0" d="M68.3,145.7c-3.6,0-6.5-2.9-6.5-6.5v-43c0-3.6,2.9-6.5,6.5-6.5c3.6,0,6.5,2.9,6.5,6.5v43
                        C74.8,142.8,71.9,145.7,68.3,145.7z"/>
                    </g>
                  </g>
                  <g>
                    <g>
                      <path class="st0" d="M89.4,145.7c-3.6,0-6.5-2.9-6.5-6.5v-29.8c0-3.6,2.9-6.5,6.5-6.5c3.6,0,6.5,2.9,6.5,6.5v29.7
                        C95.9,142.8,93,145.7,89.4,145.7z"/>
                    </g>
                  </g>
                  <g>
                    <g>
                      <g>
                        <path class="st0" d="M110.5,145.7c-3.6,0-6.5-2.9-6.5-6.5v-43c0-3.6,2.9-6.5,6.5-6.5s6.5,2.9,6.5,6.5v43
                          C117,142.8,114.1,145.7,110.5,145.7z"/>
                      </g>
                    </g>
                  </g>
                  <circle class="st0" cx="110.5" cy="76.8" r="6.5"/>
                  <circle class="st0" cx="89.4" cy="89.7" r="6.5"/>
                  <circle class="st0" cx="68.1" cy="76.8" r="6.5"/>
                </g>
              </g>
              <g>
                <g>
                  <path class="st0" d="M164.2,97c0-3.4,2.6-6.1,6-6.1s6.1,2.7,6.1,6.1v2.5c3.4-4.7,8-9.1,16-9.1c7.6,0,12.9,3.7,15.7,9.3
                    c4.2-5.6,9.8-9.3,17.7-9.3c11.4,0,18.4,7.3,18.4,20.1v28.1c0,3.4-2.6,6-6,6s-6.1-2.6-6.1-6v-24.4c0-8.4-3.9-12.8-10.7-12.8
                    c-6.6,0-11.2,4.6-11.2,13v24.2c0,3.4-2.7,6-6,6c-3.4,0-6.1-2.6-6.1-6v-24.5c0-8.2-4-12.7-10.7-12.7s-11.2,5-11.2,13v24.2
                    c0,3.4-2.7,6-6.1,6c-3.3,0-6-2.6-6-6V97H164.2z"/>
                  <path class="st0" d="M251.3,128.9v-0.2c0-11.3,8.9-16.9,21.7-16.9c5.9,0,10.1,0.9,14.1,2.2v-1.3c0-7.5-4.6-11.4-13-11.4
                    c-4.6,0-8.4,0.8-11.6,2.1c-0.7,0.2-1.3,0.3-1.9,0.3c-2.8,0-5.1-2.2-5.1-5c0-2.2,1.5-4.1,3.3-4.8c5-1.9,10.1-3.1,16.9-3.1
                    c7.9,0,13.7,2.1,17.4,5.9c3.9,3.8,5.7,9.4,5.7,16.2v25.9c0,3.3-2.6,5.8-5.9,5.8c-3.5,0-5.9-2.4-5.9-5.1v-2
                    c-3.6,4.3-9.1,7.7-17.1,7.7C260.1,145.1,251.3,139.5,251.3,128.9z M287.4,125.1v-3.6c-3.1-1.2-7.2-2.1-11.9-2.1
                    c-7.8,0-12.3,3.3-12.3,8.8v0.2c0,5.1,4.5,8,10.3,8C281.3,136.4,287.4,131.8,287.4,125.1z"/>
                  <path class="st0" d="M309.3,97c0-3.4,2.6-6.1,6-6.1s6.1,2.7,6.1,6.1v2.6c3.4-4.9,8.3-9.2,16.4-9.2c11.8,0,18.7,8,18.7,20.1v28.1
                    c0,3.4-2.6,6-6,6s-6.1-2.6-6.1-6v-24.4c0-8.2-4.1-12.8-11.2-12.8c-7,0-11.8,4.9-11.8,13v24.2c0,3.4-2.7,6-6.1,6
                    c-3.3,0-6-2.6-6-6V97z"/>
                  <path class="st0" d="M418.7,138.6c0,3.4-2.7,6-6,6c-3.4,0-6.1-2.6-6.1-6v-3.3c-3.9,5.5-9.4,9.9-17.9,9.9
                    c-12.3,0-24.4-9.9-24.4-27.3v-0.2c0-17.4,11.8-27.3,24.4-27.3c8.7,0,14.1,4.3,17.9,9.3V76.8c0-3.4,2.7-6,6-6
                    c3.4,0,6.1,2.6,6.1,6V138.6z M376.5,117.7v0.2c0,10.2,7,16.8,15.1,16.8s15.2-6.8,15.2-16.8v-0.2c0-10.2-7.2-16.8-15.2-16.8
                    C383.3,100.8,376.5,107.2,376.5,117.7z"/>
                  <path class="st0" d="M426.3,128.9v-0.2c0-11.3,8.9-16.9,21.7-16.9c5.9,0,10.1,0.9,14.1,2.2v-1.3c0-7.5-4.6-11.4-13-11.4
                    c-4.6,0-8.4,0.8-11.6,2.1c-0.7,0.2-1.3,0.3-1.9,0.3c-2.8,0-5.1-2.2-5.1-5c0-2.2,1.5-4.1,3.3-4.8c5-1.9,10.1-3.1,16.9-3.1
                    c7.9,0,13.7,2.1,17.4,5.9c3.9,3.8,5.7,9.4,5.7,16.2v25.9c0,3.3-2.6,5.8-5.9,5.8c-3.5,0-5.9-2.4-5.9-5.1v-2
                    c-3.6,4.3-9.1,7.7-17.1,7.7C435.1,145.1,426.3,139.5,426.3,128.9z M462.4,125.1v-3.6c-3.1-1.2-7.2-2.1-11.9-2.1
                    c-7.8,0-12.3,3.3-12.3,8.8v0.2c0,5.1,4.5,8,10.3,8C456.3,136.4,462.4,131.8,462.4,125.1z"/>
                  <path class="st0" d="M486.2,129.5v-27.7h-2c-2.9,0-5.2-2.3-5.2-5.2c0-2.9,2.3-5.2,5.2-5.2h2v-9c0-3.3,2.7-6,6.1-6
                    c3.3,0,6,2.7,6,6v9h9.5c2.9,0,5.3,2.3,5.3,5.2c0,2.9-2.4,5.2-5.3,5.2h-9.5v25.8c0,4.7,2.4,6.6,6.5,6.6c1.4,0,2.6-0.3,3-0.3
                    c2.7,0,5.1,2.2,5.1,5c0,2.2-1.5,4-3.2,4.7c-2.6,0.9-5.1,1.4-8.3,1.4C492.5,144.9,486.2,141,486.2,129.5z"/>
                  <path class="st0" d="M567.4,138.6c0,3.3-2.7,6-6.1,6c-3.3,0-6.1-2.6-6.1-6v-2.7c-3.4,5-8.3,9.3-16.4,9.3
                    c-11.8,0-18.7-8-18.7-20.2V97c0-3.4,2.7-6.1,6-6.1c3.4,0,6.1,2.7,6.1,6.1v24.4c0,8.2,4.1,12.7,11.2,12.7c7,0,11.8-4.8,11.8-12.9
                    V97c0-3.4,2.7-6.1,6.1-6.1c3.3,0,6.1,2.7,6.1,6.1L567.4,138.6L567.4,138.6z"/>
                  <path class="st0" d="M578.4,97c0-3.4,2.6-6.1,6-6.1s6.1,2.7,6.1,6.1v2.5c3.4-4.7,8-9.1,16-9.1c7.6,0,12.9,3.7,15.7,9.3
                    c4.2-5.6,9.8-9.3,17.7-9.3c11.4,0,18.4,7.3,18.4,20.1v28.1c0,3.4-2.6,6-6,6s-6.1-2.6-6.1-6v-24.4c0-8.4-3.9-12.8-10.7-12.8
                    c-6.6,0-11.2,4.6-11.2,13v24.2c0,3.4-2.7,6-6,6c-3.4,0-6.1-2.6-6.1-6v-24.5c0-8.2-4-12.7-10.6-12.7c-6.7,0-11.2,5-11.2,13v24.2
                    c0,3.4-2.7,6-6.1,6c-3.3,0-6-2.6-6-6L578.4,97L578.4,97z"/>
                </g>
              </g>
            </g>
          </g>
        </svg>
        </div>
        <img src="${this.shopifyProduct.images[0].src}" alt="${
      this.shopifyProduct.title
    }"/>
        <h3>${this.shopifyProduct.title}</h3>
        <select id="product-select-mandatum" name="product-select-mandatum">
          ${this.shopifyProduct.variants.reduce((prev, curr) => {
            const newOption = `<option value="${curr.id}">${
              curr.title
            } - ${formatMoney(curr.price, this.currency)}</option>`;
            return prev + newOption;
          }, "")}
        </select>
        <p id="product-price-mandatum" class="product-price-mandatum">
          Price | <del>${formatMoney(this.shopifyProduct.variants[0].price, this.currency)}</del> <span>${formatMoney(this.shopifyProduct.variants[0].price * (1 - this.discount / 100) * 100, this.currency)}</span>
        </p>
        <p class="product-price-mandatum">Delivery Date: ${futureDay(
          this.days
        )}</p>
        <div class="mandatum-modal-buttons">
          <button id="mandate_cancel">Cancel</button>
          <button id="mandate_mandate">Mandate</button>
        </div>
      </div>
    `;

    this.modalContainer = modalContainer;

    this.container.appendChild(modalContainer);

    document.getElementById("mandate_cancel").addEventListener("click", () => {
      this.toggleModal();
    });

    document.getElementById("mandate_mandate").addEventListener("click", () => {
      this.addCartMandate();
    });

    const fixedProduct = {
      ...shopifyProduct.product,
      variants: [
        ...shopifyProduct.product.variants.map((varian) => ({
          ...varian,
          available: this.shopifyProduct.variants.find(
            (ddd) => ddd.title === varian.title
          ).available,
        })),
      ],
    };

    console.log(fixedProduct);

    // @ts-ignore
    new Shopify.OptionSelectors("product-select-mandatum", {
      product: fixedProduct,
      onVariantSelected: (variant, selector) => {
        console.log(variant);
        console.log(selector);

        if (selector.selectors[0].values[0] === "Default Title") {
          selector.selectors.forEach((selecto) => {
            selecto.element.style.display = "none";
          });
        }

        const precioMandatum: HTMLParagraphElement = document.querySelector(
          "#product-price-mandatum"
        );
        const mandateButton: HTMLButtonElement =
          document.querySelector("#mandate_mandate");

        precioMandatum.innerText = `${
          variant.compare_at_price > variant.price
            ? // @ts-ignore
              ` <del>${Shopify.formatMoney(variant.compare_at_price, "")}</del>`
            : ""
          // @ts-ignore
        } <span>${Shopify.formatMoney(variant.price, "")}</span>`;

        this.shopifyVariant = variant;

        if (variant.available) {
          mandateButton.disabled = false;
        } else {
          mandateButton.disabled = true;
        }
      },
    });
  }

  addMandatumButton(): void {
    const button: HTMLDivElement = document.createElement("div");
    button.classList.add("mandatum-button");
    button.innerHTML = `
      <svg id="mandatum_logo" viewBox="0 0 216 216">
        <style type="text/css">
          .st0{fill:#FFFFFF;}
        </style>
        <g id="Layer_1_1_">
        </g>
        <g id="Layer_2">
          <g>
            <g>
              <g>
                <path class="st0" d="M87,139.9c-3.6,0-6.5-2.9-6.5-6.5v-43c0-3.6,2.9-6.5,6.5-6.5c3.6,0,6.5,2.9,6.5,6.5v43
                  C93.5,137,90.6,139.9,87,139.9z"/>
              </g>
            </g>
            <g>
              <g>
                <path class="st0" d="M108.1,139.9c-3.6,0-6.5-2.9-6.5-6.5v-29.8c0-3.6,2.9-6.5,6.5-6.5c3.6,0,6.5,2.9,6.5,6.5v29.7
                  C114.6,137,111.7,139.9,108.1,139.9z"/>
              </g>
            </g>
            <g>
              <g>
                <g>
                  <path class="st0" d="M129.2,139.9c-3.6,0-6.5-2.9-6.5-6.5v-43c0-3.6,2.9-6.5,6.5-6.5s6.5,2.9,6.5,6.5v43
                    C135.7,137,132.8,139.9,129.2,139.9z"/>
                </g>
              </g>
            </g>
            <circle class="st0" cx="129.2" cy="71.1" r="6.5"/>
            <circle class="st0" cx="108.1" cy="83.9" r="6.5"/>
            <circle class="st0" cx="86.8" cy="71.1" r="6.5"/>
          </g>
        </g>
      </svg>
      <h3>Eco-Discount and Free Donation Available</h3>
    `;
    this.container.appendChild(button);

    button.addEventListener("click", () => {
      this.toggleModal();
    });
  }
}

async function main(): Promise<MandatumApp> {
  let MandatumInstance: MandatumApp,
    scriptShopify: HTMLScriptElement,
    queryString: URLSearchParams,
    shopName: string,
    productContainer: HTMLElement,
    shopifyProduct: any,
    productID: number,
    productInfo: any,
    isMandatum: boolean,
    descuento: number,
    dias: number;
  const isProduct: boolean = location.pathname.includes("products");

  if (isProduct) {
    console.log("Is Product");
    scriptShopify = document.querySelector("script[src*='mandatum']");
    queryString = new URLSearchParams(scriptShopify.src.split("?")[1]);
    shopName = queryString.get("shop");
    productContainer = document.querySelector("body");
    shopifyProduct = await fetch(`${location.href.split("?")[0]}.json`).then(
      (json) => json.json()
    );
    productID = shopifyProduct.product.id;
    productInfo = await fetch(
      `https://${serverUrl}/isMandatum?shop=${shopName}&product=${
        "gid://shopify/Product/" + productID
      }`
    ).then((json) => json.json());

    isMandatum = productInfo.isMandatum;
    descuento = parseFloat(productInfo.descuento);
    dias = parseInt(productInfo.dias);
  } else {
    console.log("No Product");
  }

  if (isMandatum && isProduct) {
    const storefrontToken: string = productInfo.storeFrontToken.accessToken;
    const tempClient = ShopifyClient.buildClient({
      domain: shopName,
      storefrontAccessToken: storefrontToken,
    });

    const newShopProd = await tempClient.product.fetchByHandle(
      shopifyProduct.product.handle
    );

    console.log("product", newShopProd);

    MandatumInstance = new MandatumApp(
      productContainer,
      shopName,
      descuento,
      dias,
      productID,
      storefrontToken,
      newShopProd
    );

    MandatumInstance.init();
  }

  return MandatumInstance;
}

main().then((App) => {
  // @ts-ignore
  window.mandatum = App;
});
