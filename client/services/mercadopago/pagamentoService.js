import { ACCESS_TOKEN } from "../../config.json"


export const handleIntegrationMP = async (selectedPaymentMethod,  valorTotal, title, descricao, categoria, userId)  => {
  const preferencia = {
    "items": [
      {
        "title": title,
        "description": descricao,
        "category_id": categoria,
        "quantity": 1,
        "currency_id": "BRL",
        "unit_price": valorTotal
      }
    ],
    "external_reference": userId,
    "notification_url": "https://southamerica-east1-food-delivery-app-413414.cloudfunctions.net/mercadoPagoIPNAppGeladinho",
    "payment_methods": {
      "excluded_payment_methods": [
        {"id": "bolbradesco"},
        {"id": "pec"} 
      ],
      "excluded_payment_types": [
        { "id": "debit_card" }
      ],
      "installments": 1
    }
  };

  if (selectedPaymentMethod === 'Pix') {
    preferencia.payment_methods.excluded_payment_types = [
      {"id": "credit_card"}, {"id": "debit_card"}, {"id": "ticket"}
    ];
  } else if (selectedPaymentMethod === 'Cartão de Crédito') {
    preferencia.payment_methods.excluded_payment_methods.push({"id": "pix"});
  }
  try {
    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(preferencia)
    })

    const data = await response.json()

    console.log("url de pagamento", data.init_point)

    return data.init_point

  } catch (error) {
    console.log(error)
  }

}