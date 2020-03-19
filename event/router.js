const express = require("express");
const auth = require("../auth/middleware");
const Event = require("./model");
const Ticket = require("../ticket/model");

const { Router } = express;

const router = Router();

// get all events
router.get("/event", (request, response, next) => {
  const limit = Math.min(request.query.limit || 9, 20);
  const offset = request.query.offset || 0;
  try {
    Event.findAndCountAll({
      limit,
      offset
    }).then(result =>
      response.send({ events: result.rows, total: result.count })
    );
  } catch (error) {
    next(error);
  }
});

// post an event
router.post("/event", auth, async (request, response, next) => {
  try {
    const { name, description, picture, startDate, endDate } = request.body;
    const entity = { name, description, picture, startDate, endDate };
    const event = await Event.create(entity);
    response.send(event);
  } catch (error) {
    next(error);
  }
});

// get one event
router.get("/event/:id", async (request, response, next) => {
  try {
    const { id } = request.params;
    const event = await Event.findByPk(id, { include: [{ model: Ticket }] });
    response.send(event);
  } catch (error) {
    next(error);
  }
});

//update an event
router.put("/event/:id", auth, async (request, response, next) => {
  try {
    const { id } = request.params;
    const event = await event.findByPk(id);
    console.log("request.body test:", request.body);
    console.log("event test:", event.dataValues);
    const updated = await event.update(request.body);
    response.send(updated);
  } catch (error) {
    next(error);
  }
});

// delete an event
router.delete("/event/:id", auth, async (request, response, next) => {
  try {
    const eventToDelete = await Event.destroy({
      where: { id: request.params.id }
    });
    response.json(eventToDelete);
  } catch (error) {
    next(error);
  }
});

// post a ticket for a specific event
router.post("/event/:eventId/ticket", auth, async (request, response, next) => {
  Event.findByPk(request.params.eventId)
    .then(event => {
      if (!event) {
        response.status(404).end();
      } else {
        Ticket.create({
          ...request.body,
          eventId: request.body.eventId
        }).then(ticket => {
          response.json(ticket);
        });
      }
    })
    .catch(next);
});

// get all tickets for a specific event
router.get("event/:eventId/ticket", async (request, response, next) => {
  const limit = Math.min(request.query.limit || 9, 20);
  const offset = request.query.offset || 0;
  try {
    const ticket = await Ticket.findAndCountAll({
      limit,
      offset,
      where: { eventId: request.params.eventId }
    });
    response.send(ticket);
  } catch (error) {
    next(error);
  }
});

// get one ticket for a specific event
router.get("/event/:eventId/ticket/:ticketId", (request, response, next) => {
  Ticket.findOne({
    where: {
      ticketId: request.params.ticketId,
      eventId: request.params.eventId
    }
  })
    .then(ticket => {
      if (ticket) {
        response.json(ticket);
      } else {
        response.status(404).end();
      }
    })
    .catch(next);
});

module.exports = router;
