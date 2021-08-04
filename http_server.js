require('dotenv').config();
const http = require("http");
const url = require("url");
const express = require("express");
const mongoose = require("mongoose");

/*
.env settings
  PORT=3001
  DB="mongodb://localhost:27017/contacts"
*/

const {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  UpdateContact,
} = require("./contacts");

mongoose.connect(process.env.DB,
  {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: false
  }, 
  function(err){
    
    if(err) return console.log(err);

    server.listen(process.env.PORT, (err) => {
      if (err) console.log(err);
      console.log('Server started on port '+process.env.PORT);
    });
});

const bodyGenerator = (req) => {

  return new Promise((res) => {
    
    let body = {};

    req.on("data", (data) => {
      body =
        req.headers["content-type"] === "application/json"
          ? JSON.parse(data.toString())
          : data.toString();
    });
    
    req.on('end', () => res(body === '' ? {} : body));
  });
};

const CheckProperty = (res, body) => {
  if (!body.name) {
    res.statusCode = 400;
    res.write(JSON.stringify({ message: "missing required name field" }));
    res.end();
    return true;
  }
  else if (!body.email) {
    res.statusCode = 400;
    res.write(JSON.stringify({ message: "missing required email field" }));
    res.end();
    return true;
  }
  else if (!body.phone) {
    res.statusCode = 400;
    res.write(JSON.stringify({ message: "missing required phone field" }));
    res.end();
    return true;
  }
  return false;
};

const CheckId = id => {
  
  if (Number.isNaN(Number(id))){
    res.statusCode = 400;
    res.write({ message: "Wrong contactId" });
    res.end();
    return true;
  }
  return false;
}

const server = http.createServer(async (req, res) => {

  res.setHeader("Content-Type", "application/json");

  if(req.url.includes('/contacts/')){
    
    //const id = url.parse(req.url).query;
    let id = req.url.split('/')[2];

    if (CheckId(id)) return;
    
    switch(req.method){
      case "PATCH":
        try{
          const body = await bodyGenerator(req);
          const contact = await UpdateContact(id, body);
    
          if (contact instanceof Error) throw new Error(contact);
          else{
            if (contact) {
              res.write(JSON.stringify({ message: "Contact updated" }));
              res.end();
            }
            else {
              res.statusCode = 404;
              res.write(JSON.stringify({ message: "Contact not found" }));
              res.end();
            }
          }
        }catch(err) {
          res.statusCode = 504;
          res.write(JSON.stringify({ message: err.toString() }));
          res.end();
      }
    break;

    case 'GET':

      const contact = await getContactById(id);
      
      if (contact.length !== 0) {
        res.write(JSON.stringify(contact[0]));
        res.end();
      }
      else {
        res.statusCode = 404;
        res.write(JSON.stringify({ message: "Contact not found" }));
        res.end();
      }
    break;
      
    case 'DELETE':
    
      try{
        const contact = await removeContact(id);

        if (contact instanceof Error) throw new Error(contact);
        else {

          if (contact) {
            res.write(JSON.stringify({ message: "Contact deleted" }));
            res.end();
          }
          else {
            res.statusCode = 404;
            res.write(JSON.stringify({ message: "Contact not found" }));
            res.end();
          }
        }
      }catch(err) {
        res.statusCode = 504;
        res.write(JSON.stringify({ message: err.toString() }));
        res.end();
      }
    break;
      
    default:
      const contactDef = await getContactById(contactId);

      if (contactDef.length !== 0) res.send(contactDef[0]);
      else {
        res.statusCode = 404;
        res.write(JSON.stringify({ message: "Contact not found" }));
        res.end();
      }
    }
  }
  else if(req.url.includes("/contacts")){
    switch (req.method) {

      case "GET":
        res.write(JSON.stringify(await listContacts()));
        res.end();
      break;

      case "POST":
        const body = await bodyGenerator(req);

        if (CheckProperty(res, body)) return;

        try {
          const newContact = await addContact(body);

          if (newContact instanceof Error) throw Error(newContact);
          else {
            res.statusCode = 201;
            res.write(JSON.stringify(newContact));
            res.end();
          }
        }catch (err) {
          res.statusCode = 504;
          res.write(JSON.stringify({ message: err.toString() }));
          res.end();
        }
      break;

      default :
        res.write(JSON.stringify(await listContacts()));
        res.end();
    }
  }
});

/*server.listen(3000, (err) => {
  if (err) console.log(err);
  console.log("Server started on port 3000");
});*/
