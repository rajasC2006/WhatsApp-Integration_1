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
const URL="https://graph.facebook.com/v22.0/645746375298493/messages"
const verifyToken = process.env.VERIFY_TOKEN;

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
    sendVendorList(message.from, name1.name);
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

async function sendVendorList(to, name1) {
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
        header:{
          type:"text",
          text: `Hello ${name1}, please Select the Category.`
        },
        body:{
          text:"Hi"
        },
        footer:{
          text:""
        },
        action:{
          button:"Select Category",
          sections:[
            {
              title:"Select Category",
              rows:[
                {
                  id:"1",
                  title:"Clothing & Apparel",
                  description:""
                },
                {
                  id:"2",
                  title:"Electronics & Gadgets",
                  description:""
                },
                {
                  id:"3",
                  title:"Home & Kitchen",
                  description:""
                },
                {
                  id:"4",
                  title:"Groceries & Food",
                  description:""
                },
                {
                  id:"5",
                  title:"Beauty & Personal Care",
                  description:""
                },
                {
                  id:"6",
                  title:"Health & Wellness",
                  description:""
                },
                {
                  id:"7",
                  title:"Sports & Fitness",
                  description:""
                },
                {
                  id:"8",
                  title:"Books & Stationery",
                  description:""
                },
                {
                  id:"9",
                  title:"Toys & Games",
                  description:""
                },
                {
                  id:"10",
                  title:"Automotive & Accessories",
                  description:""
                }
              ]
            }
          ]
        }
        
      },
    }),
  });
}
