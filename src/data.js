const mongoose = require('mongoose')
const Subscriber = require('./models/subscribers')
const data = [
  {
    name: 'Jeread Krus',
    subscribedChannel: 'CNET',
  },
  {
    name: 'Lucifer',
    subscribedChannel: 'Sentex',
  },
  {
    name: 'Alice Doe',
    subscribedChannel: 'Tech Talk',
  },
]

Subscriber.insertMany(data)
  .then(() => console.log('Data inserted successfully'))
  .catch((error) => console.error('Error inserting data:', error))
