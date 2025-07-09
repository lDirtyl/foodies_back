"use strict";

const testimonialsRaw = require("../db/source/testimonials.json");
const { v4: uuidv4 } = require("uuid");

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    const testimonialsData = testimonialsRaw.map((testimonial) => ({
      id: uuidv4(),
      testimonial: testimonial.testimonial,
      ownerId:
        typeof testimonial.owner === "object" && testimonial.owner.$oid
          ? testimonial.owner.$oid
          : testimonial.owner,
      createdAt: now,
      updatedAt: now,
    }));

    await queryInterface.bulkInsert("testimonials", testimonialsData, {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("testimonials", null, {});
  },
};
