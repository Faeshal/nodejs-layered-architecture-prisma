"use strict";
require("dotenv").config();
require("pretty-error").start();
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const morgan = require("morgan");
const cors = require("cors");
const session = require("express-session");
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");
const compression = require("compression");
const hpp = require("hpp");
const helmet = require("helmet");
const log4js = require("log4js");
const paginate = require("express-paginate");
const dayjs = require("dayjs");
const { errorHandler } = require("./middleware/errorHandler");
const log = log4js.getLogger("entrypoint");
log.level = "info";

// * Security, Compression & Parser
app.use(helmet());
app.use(hpp());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// * Http Logger
morgan.token("time", (req) => {
  let user = "anonym";
  if (req.session) {
    if (req.session.name) {
      user = req.session.name || "anonym";
    }
  }
  const time = dayjs().format("h:mm:ss A") + " - " + user;
  return time;
});
app.use(morgan("morgan: [:time] :method :url - :status"));

// * Session Store
app.set("trust proxy", 1);
app.use(
  session({
    cookie: { maxAge: 14 * 24 * 60 * 60 * 1000 },
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new PrismaSessionStore(new PrismaClient(), {
      checkPeriod: 2 * 60 * 1000, //ms
      dbRecordIdIsSessionId: true,
    }),
  })
);

// * Paginate
app.use(paginate.middleware(10, 30));

// * Route
app.use(require("./routes"));

// * Custom Error Handler
app.use(errorHandler);

// * Rolliing log (optional)

// * Database
async function prismaMain() {
  await prisma.income.count();
}

prismaMain()
  .then(async () => {
    log.info("prisma connected ✅");
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    log.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

// * Server Listen
app.listen(PORT, (err) => {
  if (err) {
    log.error(`Error : ${err}`);
    process.exit(1);
  }
  log.info(`Server is Running On Port : ${PORT}`);
});

module.exports = app;
