import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

const { WEBHOOK_VERIFY_TOKEN, GRAPH_API_TOKEN, PORT } = process.env;
const WHATSAPP_ACCESS_TOKEN =
  "EAAQbaEgZC7uYBO13oVk4uqo5VFMtAXdKZAaJDhehtBgyyoZAq9QAkqkruZCU2haK50ZBCY6dc87wVAZAc9QuYZAY9JTekUuDeLb0sFhZCIUYWGJkX1o0iyNXojbmabXMZCO1bdx5ROJQ2rJhH4bZBSDWHuLpHodenVUvkhzqtH7QBGYQO7ODA0JR1kIK6mBLCGTfKAXwZDZD";
app.post("/webhook", async (req, res) => {
  const { entry } = req.body;
  const changes = entry[0].changes;

  //console.log("Incoming webhook message:", JSON.stringify(req.body, null, 2));
  const statuses = changes[0].value.statuses
    ? changes[0].value.statuses[0]
    : null;
  const message = changes[0].value.messages
    ? changes[0].value.messages[0]
    : null;
  const name1 = changes[0].value.contacts
    ? changes[0].value.contacts[0].profile
    : null;
  //console.log(name1);

  if (statuses) {
    
    console.log("MESSAGE STATUS UPDATE:", JSON.stringify(statuses, null, 2));
  }
  if (message?.type === "button") {
    //Set something for STOP Button
    if (message?.button?.payload.toLowerCase() === "stop") {
      sendregrets(message.from, name1.name);
    }
  }
  if (message?.type === "text") {
    if (message.text.body.length > 10) {
      console.log(JSON.stringify({ address: message }, null, 2));
      sendReplyButtons(message.from, name1.name);
    } else {
      sendCatalog(message.from, name1.name);
    }
  }

  if (message?.interactive?.type.toLowerCase() === "button_reply") {
    if (
      message?.interactive?.button_reply?.id.toLowerCase() ===
      "cash_on_delivery"
    ) {
      sendthankyou(message.from, name1.name);
    } else if (
      message?.interactive?.button_reply?.id.toLowerCase() ===
      "online_payment"
    ){
      sendpayment(message.from);
    };
  }
  // if (
  //   message?.interactive?.button_reply?.id.toLowerCase() === "cash_on_delivery"
  // ) {
  //   sendthankyou(message.from, name1.name);
  // }
  // if (message?.interactive?.button_reply?.id.toLowerCase() === "view_catalog") {
  //   sendCatalog(message.from, name1.name);
  // }
  // if (message?.interactive?.button_reply?.id.toLowerCase() === "greetings") {
  //   sendGreetings(message.from);
  // }

  if (message?.type.toLowerCase() === "order") {
    console.log(JSON.stringify({ order: message }, null, 2));
    askaddress(message.from, name1.name);
  }
  //console.log(JSON.stringify(message, null, 2));

  res.sendStatus(200);
});

app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === WEBHOOK_VERIFY_TOKEN) {
    res.status(200).send(challenge);
    console.log("Webhook verified successfully!");
  } else {
    res.sendStatus(403);
  }
});

app.get("/", (req, res) => {
  res.send(`<pre>Nothing to see here.
Checkout README.md to start.</pre>`);
});

app.listen(PORT, () => {
  console.log(`Server is listening on port: ${PORT}`);
});

async function sendCatalog(to, name1) {
  await axios({
    url: "https://graph.facebook.com/v22.0/656225884244503/messages",
    method: "post",
    headers: {
      Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    data: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "interactive",
      interactive: {
        type: "catalog_message",
        body: {
          text: `Hello ${name1},Welcome to TechB's Shopping Experience.\n\nTo start shopping, you can view our catalog and add items to purchase.
          \n\n*You can directly place your order on WhatsApp chat🥳🥳.* \n\nClick the View Catalog button to start shopping.`,
        },
        action: {
          name: "catalog_message",
        },
      },
    }),
  });
}
async function sendCatalog1(to, name1) {
  await axios({
    url: "https://graph.facebook.com/v22.0/656225884244503/messages",
    method: "post",
    headers: {
      Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    data: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "template",
      template: {
        name: "catalog",
        language: {
          code: "en",
        },
        components: [
          {
            type: "body",
            parameters: [
              {
                type: "text",
                text: `${name1}`,
              },
            ],
          },
          {
            type: "button",
            sub_type: "catalog",
            index: "0",
          },
        ],
      },
    }),
  });
}

async function sendReplyButtons(to, name1) {
  //debugger;
  await axios({
    url: "https://graph.facebook.com/v22.0/656225884244503/messages",
    method: "post",
    headers: {
      Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    data: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "interactive",
      interactive: {
        type: "button",
        header: {
          type: "text",
          text: `Hello ${name1}`,
        },
        body: {
          text: "Hope you are doing well!",
        },
        footer: {
          text: "Please select payment option.",
        },
        action: {
          buttons: [
            {
              type: "reply",
              reply: {
                id: "cash_on_delivery",
                title: "Cash On Delivery",
              },
            },
            {
              type: "reply",
              reply: {
                id: "online_payment",
                title: "Online Payment",
              },
            },
          ],
        },
      },
    }),
  });
}
async function sendGreetings(to) {
  await axios({
    url: "https://graph.facebook.com/v22.0/656225884244503/messages",
    method: "post",
    headers: {
      Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    data: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "template",
      template: {
        name: "rajas_2009",
        language: {
          code: "en_US",
        },
      },
    }),
  });
}
async function askaddress(to, name1) {
  await axios({
    url: "https://graph.facebook.com/v22.0/656225884244503/messages",
    method: "post",
    headers: {
      Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    data: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "template",
      template: {
        name: "rajas_2009",
        language: {
          code: "en_US",
        },
        components: [
          {
            type: "header",
            parameters: [
              {
                type: "text",
                text: `${name1}`,
              },
            ],
          },
        ],
      },
    }),
  });
}

async function sendthankyou(to, name1) {
  await axios({
    method: "POST",
    url: "https://graph.facebook.com/v22.0/656225884244503/messages",
    headers: {
      Authorization: `Bearer ${GRAPH_API_TOKEN}`,
    },
    data: {
      messaging_product: "whatsapp",
      to,
      type: "template",
      template: {
        name: "thank_you",
        language: {
          code: "en",
        },
        components: [
          {
            type: "header",
            parameters: [
              {
                type: "text",
                text: `${name1}`,
              },
            ],
          },
        ],
      },
    },
  });
}
async function sendregrets(to) {
  await axios({
    url: "https://graph.facebook.com/v22.0/656225884244503/messages",
    method: "post",
    headers: {
      Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    data: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: {
        body: "Your order is cancelled!.\n Please send 'Hi' to place a new order.",
      },
    }),
  });
}
async function sendpayment(to) {
  await axios({
    url: "https://graph.facebook.com/v22.0/656225884244503/messages",
    method: "post",
    headers: {
      Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    data: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "template",
      template: {
        name: "online_payment",
        language: {
          code: "en",
        },
      },
    }),
  });
}
