type Client = {
  name: string,
  email: string
}

export default class MandatumOrder {
  client: Client;
  order: string;

  constructor() {
    this.client = {
      name: `${Shopify.checkout.shipping_address.first_name} ${Shopify.checkout.shipping_address.last_name}`,
      email: Shopify.checkout.email
    };
    this.order = Shopify.checkout.order_id;

    console.log("Client", this.client);
    console.log("Order", this.order);
  }
}