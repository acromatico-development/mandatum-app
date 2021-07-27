/// <reference types="url-search-params" />
import { serverUrl } from "./helpers";
import MandatumApp from "./product-app";
import MandatumOrder from "./checkout-app";

type Mandatum = {
  product: MandatumApp,
  order: MandatumOrder
}

async function main(): Promise<Mandatum> {
  let MandatumInstance: MandatumApp,
    OrderInstance: MandatumOrder,
    productContainer: HTMLElement,
    shopifyProduct: any,
    productID: number,
    productInfo: any,
    isMandatum: boolean,
    descuento: number,
    dias: number,
    activeWidget: boolean,
    isMandatumOrder: boolean,
    mandatumCheckoutDiscount: number,
    mandatumCheckoutPrice: number;
  const isProduct: boolean = location.pathname.includes("products");
  const isOrder: boolean = location.pathname.includes("orders");

  let scriptShopify: HTMLScriptElement = document.querySelector("script[src*='mandatum']");
  let queryString: URLSearchParams = new URLSearchParams(scriptShopify.src.split("?")[1]);
  let shopName: string = queryString.get("shop");

  if (isProduct) {
    console.log("Is Product");
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
    activeWidget = productInfo.newProduct.shop.privateMetafield.value === "false" ? false : true;
  }

  if (activeWidget && isMandatum && isProduct) {
    const newShopProd = productInfo.newProduct;

    console.log("product", newShopProd);

    MandatumInstance = new MandatumApp(
      productContainer,
      shopName,
      descuento,
      dias,
      productID,
      newShopProd
    );

    MandatumInstance.init();
  }

  if(isOrder){
    
    console.log("Is Order");

    const mandateProductFound = Shopify.checkout.line_items.find(prod => {
      return prod.properties["Mandatum Discount"] ? true : false;
    });

    isMandatumOrder = mandateProductFound ? true : false;
    mandatumCheckoutDiscount = parseFloat(mandateProductFound.properties["Mandatum Discount"].split("%")[0]) / 100;
    mandatumCheckoutPrice = parseFloat(mandateProductFound.line_price);
  }

  if(isOrder && isMandatumOrder){
    console.log("Is mandatum Order", mandatumCheckoutDiscount)
    console.log(mandatumCheckoutPrice)
    const shopInfo = await fetch(
      `https://${serverUrl}/checkoutData?shop=${shopName}`
    ).then((json) => json.json());
    OrderInstance = new MandatumOrder(mandatumCheckoutDiscount, mandatumCheckoutPrice, shopInfo.name);

    await OrderInstance.init();
  }

  return {
    product: MandatumInstance,
    order: OrderInstance
  };
}

main().then((App) => {
  // @ts-ignore
  window.mandatum = App;
});
