import { ACCESS_TOKEN } from "../../config.json"

export const handleIntegrationMP = async () => {

  const preferencia = {
    "items": [
      {
        "title": "name",
        "description": "Compra de celular",
        "picture_url": "imagen",
        "category_id": "cells",
        "quantity": 1,
        "currency_id": "BRL",
        "unit_price": 1
      }
    ],
    "payment_methods": {
      "excluded_payment_methods": [
        {
          "id": "bolbradesco"
        },
        {
          "id": "pix"
        },
        {
          "id": "pec"
        }
      ],
      "excluded_payment_types": [
        {
          "id": "credit_card"
        },
        {
          "id": "debit_card"
        }
      ],
      "installments": 1
    }
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

    return data.init_point

  } catch (error) {
    console.log(error)
  }

}