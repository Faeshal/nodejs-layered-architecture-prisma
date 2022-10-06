const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const log = require("log4js").getLogger("repository:analytic");
log.level = "info";

exports.getAnaytics = async () => {
  let data = await prisma.income.count();
  return data;
};
