const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const contactsScheme = new Schema({
  _id: {type: mongoose.Schema.ObjectId, select: false, auto: true},
  id: Number,
  name: String,
  email: String,
  phone: String,
}, {versionKey: false});

const Contacts = mongoose.model("Contact", contactsScheme);

function listContacts() {
  return Contacts.find({})
    .then(contacts => contacts)
    .catch(err => err);
}

function getContactById(contactId) {
  return Contacts.find({id: +contactId})
    .then(contacts => contacts)
    .catch(err => err);
}

function removeContact(contactId) {
  return Contacts.deleteOne({id: +contactId}).
    then(contact => contact)
    .catch(err => err);
}

async function addContact(body) {

    const contact = await Contacts.find({})
      .limit(1)
      .sort({$natural: -1})
      .then(contact => contact[0])
      .catch(err => err);

    const newBody = new Contacts({ id: contact.id+1 , ...body });

    return newBody.save({ writeConcern: { w: "majority", wtimeout: 5000 } })
      .then(contact => contact)
      .catch(err => err);
}

function UpdateContact(id, body) {
  return Contacts.findOneAndUpdate({id}, body, {new: true});
}

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  UpdateContact,
};
