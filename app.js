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
const productname={"1020": "SOLDERING WIRE 60/40 ROSIN FINE Premium Cotton Shirt"};
const productids=["1020", "1025", "1021", "1017", "1016"]
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
app.post('/webhook', async(req, res) => {
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
        searchproducts(message.from);
        await new Promise(resolve => setTimeout(resolve, 1000));
        sendReplyButtons(message.from);
    }
    //   else
    //     {
    //     console.log(JSON.stringify(req.body,null,2));
    //   }
    if (message?.type === "order") {
    const productId = message.order.product_items[0].product_retailer_id;
    const articleName = productname[productId] || "Unknown Product";
    sendvendorList(message?.from,articleName)
    }

    if (message?.type == "interactive") {
        if (message?.interactive?.list_reply?.id=="1") {
            senditemsList1(message.from,message.interactive.list_reply.title)
            //console.log(JSON.stringify(message.interactive.list_reply.title));
        }
        if (message?.interactive?.button_reply?.id=="browse_category") {
            sendCategoryList(message.from,name1.name)
        }
        if (message?.interactive?.nfm_reply?.response_json) {
            const responseJson = message.interactive.nfm_reply.response_json;
            const parsedResponse = JSON.parse(responseJson);
            const productName = parsedResponse.screen_0_Product_Name_0;
            console.log("✅ User searched for product:", productName);
            await new Promise(resolve => setTimeout(resolve, 1000));
            senditemsList2(message.from,productName)
        }
    }
    // Always end the response
    res.status(200).end();
}); 



// Start the server
app.listen(port, () => {
    console.log(`\nListening on port ${port}\n`);
});


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
    const productItems = productids.map(id => ({
        product_retailer_id: id
    }));
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
                            product_items: productItems
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

async function sendReplyButtons(to) {
  //debugger;
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
        type: "button",
        header: {
          type: "text",
          text: "Hello",
        },
        body: {
          text: "Hope you are doing well!",
        },
        footer: {
          text: "Please select anyone",
        },
        action: {
          buttons: [
            {
              type: "reply",
              reply: {
                id: "browse_category",
                title: "Browse Categories",
              },
            },
            {
              type: "reply",
              reply: {
                id: "view_cart",
                title: "View Cart",
              },
            },
          ],
        },
      },
    }),
  });
}

async function searchproducts(to) {
  //debugger;
  await axios({
    url: `${URL}`,
    method: "post",
    headers: {
      Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    data: JSON.stringify({
  messaging_product: "whatsapp",
  to: "9022666166",
  type: "interactive",
  interactive: {
    type: "flow",
    header: {
      type: "text",
      text: "Hi",
    },
    body: {
      text: "Search for products by entering a keyword.",
    },
    footer: {
      text: "Click the button below to Search",
    },
    action: {
      name: "flow",
      parameters: {
        flow_message_version: "3",
        flow_id: "2304896149927204", // replace with your flow_id
        flow_cta: "Search Products",
        flow_action: "navigate",
        flow_action_payload: {
          screen: "SEARCH",
        },
      },
    },
  },
}),
  });
}

async function senditemsList2(to,productkeyword) {
    const productItems = productids.map(id => ({
        product_retailer_id: id
    }));
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
                header: {
                    type: "text",
                    text: `${productkeyword}`
                },
                type: "product_list",
                body: {
                    text: `Your items for keyword ${productkeyword} `
                },
                footer: {
                    text: ""
                },
                action: {
                    catalog_id: "708631082000623",
                    sections: [
                        {
                            title: "Products",
                            product_items: productItems
                        }
                    ]
                }
            }
        }),
    });
}
