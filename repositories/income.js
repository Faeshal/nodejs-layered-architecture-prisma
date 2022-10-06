const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { paginate } = require("../utils/paginate");
const log = require("log4js").getLogger("repository:income");
log.level = "info";

exports.add = async (body) => {
  const data = await prisma.income.create({ data: body });
  return data;
};

exports.getAll = async (body) => {
  const { offset, req, orderBy } = body;
  const totalData = await prisma.income.count();
  const data = await prisma.income.findMany({
    skip: offset,
    take: req.query.limit,
    orderBy,
  });
  log.info("data 🚀:", data);

  // * pagination
  const pagin = await paginate({
    length: totalData,
    limit: req.query.limit,
    page: req.query.page,
    req,
  });
  let result = { pagin, totalData, data };
  return result;
};

exports.getById = async (id) => {
  const data = await prisma.income.findUnique({ where: { id: parseInt(id) } });
  return data;
};

exports.update = async (body, id) => {
  const data = await prisma.income.update({
    where: { id: parseInt(id) },
    data: body,
  });
  return data;
};

exports.delete = async (id) => {
  const data = await prisma.income.delete({ where: { id: parseInt(id) } });
  return data;
};
