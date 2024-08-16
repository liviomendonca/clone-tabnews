import database from "infra/database.js";

async function status(request, response) {
  const updatedAt = new Date().toISOString();
  const dbVersionQuery = await database.query("SHOW server_version;");
  const dbMaxConnQuery = await database.query("SHOW max_connections;");
  const dbOpenConnQuery = await database.query({
    text: "SELECT count(*)::int FROM pg_stat_activity WHERE datname = $1;",
    values: [process.env.POSTGRES_DB],
  });

  const dbVersion = dbVersionQuery.rows[0].server_version;
  const dbMaxConn = parseInt(dbMaxConnQuery.rows[0].max_connections);
  const dbOpenConn = dbOpenConnQuery.rows[0].count;

  response.status(200).json({
    updated_at: updatedAt,
    dependencies: {
      database: {
        version: dbVersion,
        max_connections: dbMaxConn,
        opened_connections: dbOpenConn,
      },
    },
  });
}

export default status;
