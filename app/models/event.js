'use strict'

const mongoose = require('mongoose')

const eventSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  _owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function (doc, ret, options) {
      const userId = (options.user && options.user._id) || false
      ret.editable = userId && userId.equals(doc._owner)
      return ret
    }
  }
})

eventSchema.virtual('length').get(function length () {
  return this.text.length
})

const Event = mongoose.model('Event', eventSchema)

module.exports = Event
