const { BadRequestError, ExpressError } = require("../expressError");

// Build string to later use as a SQL query to the db, when updating a company or a user.
// thus preventing SQL injection attacks.

/*  sqlForPartialUpdate
*** Inputs:
dataToUpdate => The body of the PATCH request (req.body), fields can be:
dataToUpdate = { name: "...", description: "...", numEmployees: "...", logo_url: "..." }
jsToSql = { numEmployees: "num_employees", logoUrl: "logo_url" } necesary beacause these variabels have different names 
in the js and the db.

*** Output:
 {setCols: ['"name"=$1', '"description"=$2', ...], values: ["...", "...", ...]}
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
// data will be one the following: {}, { partialName }, { partialName, minEmployees, maxEmployees },
// { minEmployees, maxEmployees } 
function sqlForPartialGet(data) {
  // partialName may be undefined
  const { partialName, minEmployees = 0 , maxEmployees = 999999} = data;
  let whereSQL = "";
  const values = [];
  // User gave no data for partial get
  if(Object.keys(data).length === 0){
    console.log("option 1");		
    console.log({whereSQL, values});
    return {whereSQL, values};
  }
  // User gave name and range of Employess
  if(Object.values(data).length >= 2){
    if(minEmployees > maxEmployees){
      console.log("option 1");		

      throw new ExpressError("Invalid request: minEmployees can't be larger than maxEmployees", 400);
    }
    console.log("option 2");		
    whereSQL = `WHERE name  ILIKE $1 AND num_employees BETWEEN $2 AND $3`;
    values.push(`%${partialName}%`, minEmployees, maxEmployees);
  }
  // User gave partialName, with no Employees range
  else if(!data.minEmployees && !data.maxEmployees && data.partialName){
    console.log("option 3");		
    whereSQL = 'WHERE name  LIKE $1';
    values.push(`%${partialName}%`);
  }
  // User gave Employees range with no partialName 
  else{
    console.log("option 4");		
    whereSQL = 'WHERE num_employees BETWEEN $1 AND $2';
    values.push(minEmployees, maxEmployees);
  }
  console.log({whereSQL, values})
  return {whereSQL, values}
}

module.exports = { sqlForPartialUpdate, sqlForPartialGet };
