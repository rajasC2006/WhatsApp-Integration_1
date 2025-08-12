// Import Express.js
import express from 'express';
import axios from "axios"
// Create an Express app
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Set port and verify_token
const WHATSAPP_ACCESS_TOKEN =
    "EAASbflZCFgYkBPI41pNRbrdZAtvSfnUx4FDbch6gT3iwYE1vrDip9wvYbu1DAiUwj0SZA8GK84X0U694oJc9j5kKOM9BRLdqVfBD0BA4BxJJBTLXdhggY4lYWNrRMe5ClFLDIbtSOa6M9Lc8gONUsjPggGSt5APwElMAHQIxROic1VCsBK2CVVzhYPDuAZDZD";
const port = process.env.PORT || 3000;
const URL = "https://graph.facebook.com/v22.0/645746375298493/messages"
const verifyToken = process.env.VERIFY_TOKEN;
const productname={"1020": "SOLDERING WIRE 60/40 ROSIN FINEPremium Cotton Shirt"};
// Route for GET requests
app.get('/webhook', (req, res) => {
    const { 'hub.mode': mode, 'hub.challenge': challenge, 'hub.verify_token': token } = req.query;

    if (mode === 'subscribe' && token === verifyToken) {
        console.log('WEBHOOK VERIFIED');
        res.status(200).send(challenge);
    } else {
        res.status(403).end();
    }
});

// Route for POST requests
app.post('/webhook', (req, res) => {
    const { entry } = req.body;
    const changes = entry[0].changes;
    const statuses = changes[0].value.statuses
        ? changes[0].value.statuses[0]
        : null;
    const message = changes[0].value.messages
        ? changes[0].value.messages[0]
        : null;
    const name1 = changes[0].value.contacts
        ? changes[0].value.contacts[0].profile
        : null;

    if (message?.type === "text") {
        console.log(JSON.stringify(message, null, 2));
        sendCategoryList(message.from, name1.name);
    }
      else
        {
        console.log(JSON.stringify(req.body,null,2));
      }
    if (message?.type === "order") {
    const productId = message.order.product_items[0].product_retailer_id;
    const articleName = productname[productId] || "Unknown Product";
    sendvendorList(message?.from,articleName)
    }

    if (message?.type == "interactive") {
        if (message?.interactive?.list_reply?.id == "1") {
            senditemsList1(message.from,message.interactive.list_reply.title)
        }
    }
    // Always end the response
    res.status(200).end();
});



// Start the server
app.listen(port, () => {
    console.log(`\nListening on port ${port}\n`);
});
async function sendCatalog(to, name1) {
    await axios({
        url: `${URL}`,
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

async function sendCategoryList(to, name1) {
    await axios({
        url: `${URL}`,
        method: "post",
        headers: {
            Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
        },
        data: JSON.stringify({
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to,
            type: "interactive",
            interactive: {
                type: "list",
                header: {
                    type: "text",
                    text: `Hello ${name1}, please Select the Category.`
                },
                body: {
                    text: "Hi"
                },
                footer: {
                    text: ""
                },
                action: {
                    button: "Select Category",
                    sections: [
                        {
                            title: "Select Category",
                            rows: [
                                {
                                    id: "1",
                                    title: "Clothing & Apparel",
                                    description: ""
                                },
                                {
                                    id: "2",
                                    title: "Electronics & Gadgets",
                                    description: ""
                                },
                                {
                                    id: "3",
                                    title: "Home & Kitchen",
                                    description: ""
                                },
                                {
                                    id: "4",
                                    title: "Groceries & Food",
                                    description: ""
                                },
                                {
                                    id: "5",
                                    title: "Beauty & Personal Care",
                                    description: ""
                                },
                                {
                                    id: "6",
                                    title: "Health & Wellness",
                                    description: ""
                                },
                                {
                                    id: "7",
                                    title: "Sports & Fitness",
                                    description: ""
                                },
                                {
                                    id: "8",
                                    title: "Books & Stationery",
                                    description: ""
                                },
                                {
                                    id: "9",
                                    title: "Toys & Games",
                                    description: ""
                                },
                                {
                                    id: "10",
                                    title: "Automotive & Accessories",
                                    description: ""
                                }
                            ]
                        }
                    ]
                }

            },
        }),
    });
}

async function senditemsList1(to, category) {
    await axios({
        url: `${URL}`,
        method: "post",
        headers: {
            Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
        },
        data: JSON.stringify({
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to,
            type: "interactive",
            interactive: {
                type: "product_list",
                header: {
                    type: "text",
                    text: `${category}`
                },
                body: {
                    text: `Your items in ${category} `
                },
                footer: {
                    text: ""
                },
                action: {
                    catalog_id: "708631082000623",
                    sections: [
                        {
                            title: "Products",
                            product_items: [
                                { product_retailer_id: "1020" },
                                { product_retailer_id: "1025" },
                                { product_retailer_id: "1021" },
                                { product_retailer_id: "1017" },
                                { product_retailer_id: "1016" }
                            ]
                        }
                    ]
                }
            }
        }),
    });
}

async function sendvendorList(to, articleName) {
    await axios({
        url: `${URL}`,
        method: "post",
        headers: {
            Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
        },
        data: JSON.stringify({
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to,
  type: "interactive",
  interactive: {
    type: "list",
    header: {
      type: "text",
      text: "Vendors for your selected product"
    },
    body: {
      text: `${articleName}`
    },
    footer: {
      text: "Powered by ShopBot"
    },
    action: {
      button: "Select Vendor",
      sections: [
        {
          title: "Vendors",
          rows: [
            { id: "vendor_1", title: "Vendor A", description: "Fast shipping, COD available" },
            { id: "vendor_2", title: "Vendor B", description: "Lowest price guarantee" },
            { id: "vendor_3", title: "Vendor C", description: "Premium quality" }
          ]
        }
      ]
    }
  }
}),
    });
}
