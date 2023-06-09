let dbClient;

function setDBClient(client) {
    dbClient = client;
}

function databaseQuery(res = null, query) {
    try {
        if (dbClient != undefined) {
            dbClient.query(query, function (err, result) {
                if (err) {
                    console.log(err)
                    if (res) {
                        res.send({result: 1, error: err})
                    } else {
                        return {result: 1}
                    }
                }
                if (res) {
                    res.send({result: result})
                } else {
                    return {result: result}
                }
            });
        }   
    } catch (error) {
        console.log(error)
        res.send(error)
    }
}

function databaseCreateTables(res = null) {
    let sql = "CREATE TABLE IF NOT EXISTS patient_data (ID INT AUTO_INCREMENT PRIMARY KEY, NHI VARCHAR(255) NOT NULL, FirstName VARCHAR(255) NOT NULL, LastName VARCHAR(255) NOT NULL, MiddleName VARCHAR(255), DOB DATE NOT NULL, ContactNumber VARCHAR(255) NOT NULL, Email VARCHAR(255) NOT NULL, Notes MEDIUMTEXT, ExistingConditions JSON)";
    databaseQuery(res, sql)
    sql = "CREATE TABLE IF NOT EXISTS accounts (ID INT AUTO_INCREMENT PRIMARY KEY, DentistName VARCHAR(255) NOT NULL, AccountName VARCHAR(255) NOT NULL, AccountPasswordHash VARCHAR(255) NOT NULL, AccountPasswordSalt VARCHAR(255) NOT NULL, AccountAccessLevel INT, DentistNumber INT, DOB DATE NOT NULL, Email VARCHAR(255) NOT NULL, PhoneNumber VARCHAR(255) NOT NULL)";
    databaseQuery(res, sql) 
    sql = "CREATE TABLE IF NOT EXISTS bookings (ID INT AUTO_INCREMENT PRIMARY KEY, Date DATE NOT NULL, Time VARCHAR(255) NOT NULL, Patient INT NOT NULL, Dentist INT NOT NULL, Tooth VARCHAR(255) NOT NULL, FeeDollars INT NOT NULL, FeeCents INT NOT NULL, Notes MEDIUMTEXT, ProcedureName VARCHAR(255) NOT NULL, ProcedureTime VARCHAR(255) NOT NULL, PatientAttended VARCHAR(255), FOREIGN KEY (Patient) REFERENCES patient_data(ID), FOREIGN KEY (Dentist) REFERENCES accounts(ID))";
    databaseQuery(res, sql)
    sql = "CREATE TABLE IF NOT EXISTS quotes (ID INT AUTO_INCREMENT PRIMARY KEY, Patient INT NOT NULL, Dentist INT NOT NULL, Booking INT NOT NULL, QuoteCreationDate DATE NOT NULL, QuotePaymentStatus VARCHAR(255) NOT NULL, QuotePaymentDeadline DATE NOT NULL, QuoteTotalCostDollars INT NOT NULL, QuoteTotalCostCents INT NOT NULL, FOREIGN KEY (Patient) REFERENCES patient_data(ID), FOREIGN KEY (Dentist) REFERENCES accounts(ID), FOREIGN KEY (Booking) REFERENCES bookings(ID))";
    databaseQuery(res, sql)
    sql = "CREATE TABLE IF NOT EXISTS patient_images (ID INT AUTO_INCREMENT PRIMARY KEY, Patient INT NOT NULL, ImagePath VARCHAR(255) NOT NULL, FOREIGN KEY (Patient) REFERENCES patient_data(ID))";
    databaseQuery(res, sql)
    sql = "CREATE TABLE IF NOT EXISTS patient_tooth_data (ID INT AUTO_INCREMENT PRIMARY KEY, Patient INT NOT NULL, ToothID INT, Notes MEDIUMTEXT, leftLowerPocketGap DECIMAL(6,4) NOT NULL, leftMiddlePocketGap DECIMAL(6,4) NOT NULL, leftUpperPocketGap DECIMAL(6,4) NOT NULL, rightLowerPocketGap DECIMAL(6,4) NOT NULL, rightMiddlePocketGap DECIMAL(6,4) NOT NULL, rightUpperPocketGap DECIMAL(6,4) NOT NULL, FOREIGN KEY (Patient) REFERENCES patient_data(ID))";
    databaseQuery(res, sql)
    sql = "CREATE TABLE IF NOT EXISTS patient_tooth_quadrant_data (ID INT AUTO_INCREMENT PRIMARY KEY, Patient INT NOT NULL, Tooth INT NOT NULL, Quadrant INT NOT NULL, Notes MEDIUMTEXT, AffectedArea BOOLEAN NOT NULL, FOREIGN KEY (Tooth) REFERENCES patient_tooth_data(ID), FOREIGN KEY (Patient) REFERENCES patient_data(ID))";
    databaseQuery(res, sql)
    sql = "CREATE TABLE IF NOT EXISTS tickets (ID INT AUTO_INCREMENT PRIMARY KEY, Patient INT NOT NULL, NumberOfVisits INT NOT NULL, FOREIGN KEY (Patient) REFERENCES patient_data(ID))";
    databaseQuery(res, sql)
    sql = "CREATE TABLE IF NOT EXISTS ticket_visit (ID INT AUTO_INCREMENT PRIMARY KEY, VisitNumber INT NOT NULL, Ticket INT NOT NULL, Notes MEDIUMTEXT, Tooth VARCHAR(255) NOT NULL, ProcedureName VARCHAR(255) NOT NULL, FOREIGN KEY (Ticket) REFERENCES tickets(ID))";
    databaseQuery(res, sql)
    sql = "CREATE TABLE IF NOT EXISTS dental_charts (ID INT AUTO_INCREMENT PRIMARY KEY, Booking INT NOT NULL, Data JSON NOT NULL, FOREIGN KEY (Booking) REFERENCES bookings(ID))";
    databaseQuery(res, sql)
}

module.exports = {databaseQuery, databaseCreateTables, setDBClient};