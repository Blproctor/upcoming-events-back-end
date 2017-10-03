'use strict'

const controller = require('lib/wiring/controller')
const models = require('app/models')
const Event = models.event

const authenticate = require('./concerns/authenticate')
const setUser = require('./concerns/set-current-user')
const setModel = require('./concerns/set-mongoose-model')

const index = (req, res, next) => {
  Event.find()
    .then(events => res.json({
      events: events.map((e) =>
        e.toJSON({ virtuals: true, user: req.user }))
    }))
    .catch(next)
}

const show = (req, res) => {
  res.json({
    event: req.event.toJSON({ virtuals: true, user: req.user })
  })
}

const create = (req, res, next) => {
  const event = Object.assign(req.body.event, {
    _owner: req.user._id
  })
  Event.create(event)
    .then(event =>
      res.status(201)
        .json({
          event: event.toJSON({ virtuals: true, user: req.user })
        }))
    .catch(next)
}

const update = (req, res, next) => {
  delete req.body._owner
  req.event.update(req.body.event)
    .then(() => res.sendStatus(204))
    .catch(next)
}

const destroy = (req, res, next) => {
  req.event.remove()
    .then(() => res.sendStatus(204))
    .catch(next)
}

module.exports = controller({
  index,
  show,
  create,
  update,
  destroy
}, { before: [
  { method: setUser, only: ['index', 'show'] },
  { method: authenticate, except: ['index', 'show'] },
  { method: setModel(Event), only: ['show'] },
  { method: setModel(Event, { forUser: true }), only: ['update', 'destroy'] }
] })
