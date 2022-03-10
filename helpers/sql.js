const { BadRequestError } = require("../expressError");

// Build string to later use as a SQL query to the db, when updating a company or a user.
// thus preventing SQL injection attacks.

/* Inputs:
dataToUpdate => The body of the PATCH request (req.body), fields can be:
dataToUpdate = { name: "...", description: "...", numEmployees: "...", logo_url: "..." }
jsToSql = { numEmployees: "num_employees", logoUrl: "logo_url" }

Output: {setCols: ['"name"=$1', '"description"=$2', ...], values: ["...", "...", ...]}
 */
function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate); // keys could be ['name', 'description', 'numEmployees', 'logo_url']
  if (keys.length === 0) throw new BadRequestError("No data");

  // { name: "...", description: "...", ... } => ['"name"=$1', '"description"=$2', ...]
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
