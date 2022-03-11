// {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
const sql = require("./sql");

/* Inputs   
dataToUpdate => The body of the PATCH request (req.body), fields can be:
dataToUpdate = { name: "...", description: "...", numEmployees: "...", logo_url: "..." }
jsToSql = { numEmployees: "num_employees", logoUrl: "logo_url" }

Output: {setCols: ['"name"=$1', '"description"=$2', ...], values: ["...", "...", ...]}
 
'C1', 1, 'Desc1', 'http://c1.img'
*/

describe("test sqlForPartialUpdate", function () {
    test("test data convertion for PATCH query", function () {
        const c1Update = { name: "C1", description: "Desc1", numEmployees: 100, logo_url: "http://c1Update.img" };
        const jsToSql = {
            numEmployees: "num_employees",
            logoUrl: "logo_url",
        };
        expect(sql.sqlForPartialUpdate(c1Update, jsToSql)).toEqual({
            setCols: '"name"=$1, "description"=$2, "num_employees"=$3, "logo_url"=$4', 
            "values": ["C1", "Desc1", 100, "http://c1Update.img"]
        });
    }) 
});


/* tests for get partial companies 

sqlForPartialGet({});
sqlForPartialGet({partialName : "Mil"});
sqlForPartialGet({minEmployees: 45, maxEmployees: 756});
sqlForPartialGet({minEmployees: 45, maxEmployees: 756, partialName : "Mil"});
sqlForPartialGet({minEmployees: 450, maxEmployees: 75, partialName : "Mil"}); */