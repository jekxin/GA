    const express = require('express');
    const mysql = require('mysql2');
    const app = express();

    const connection = mysql.createConnection({
        host: 'mysql-jekxin.alwaysdata.net',
        user: 'jekxin',
        password: 'alwaysdataJX',
        port: 3306,
        database: 'jekxin_clinicapp'
    });

    connection.connect((err) => {
        if (err) {
            console.error('Error connecting to MySQL:', err);
            return
        }
        console.log('Connected to MySQL database');
    });

    // Set up view engine
    app.set('view engine', 'ejs');
    // enable static files
    app.use(express.static('public'));
    // enable form processing
    app.use(express.urlencoded({
        extended: false
    }));

    app.get('/', (req, res) => {
        res.render('index');
    });

    app.get('/aboutUs', (req, res) => {
        res.render('AboutUs');
    });

    app.get('/services', (req, res) => {
        res.render('services');
    });

    app.get('/contactUs', (req, res) => {
        res.render('contactUs');
    });
    
    app.get('/feedback/:success?', (req, res) => {
        let success = req.params.success;
        res.render('feedback',{success});
    });

    app.post('/feedback', (req, res) => {
        //Extract product data from the request body
        const { name, email, contact_number, clinic_visited, date, subject, comment } = req.body;
        const sql = 'INSERT INTO feedback (name, email, contact_number, clinic_visited, date, subject, comment) VALUES (?,?,?,?,?,?,?)';
        //Insert the new product into the database
        connection.query(sql, [name, email, contact_number, clinic_visited, date, subject, comment], (error, results) => {
            if (error) {
                //Handle any error that occurs during the database operation
                console.error("Error submitting form:", error);
                res.status(500).send('Error submitting form');
            } else {
                // Send a success response 
                res.redirect('/feedback/1');
            }
        });
    });

    app.get('/bookAppointment', (req, res) => {
        res.render('bookAppointment');
    });

    app.post('/bookAppointment', (req, res) => {
        //Extract product data from the request body
        const {name, email, contact_number, service, date, time, comment } = req.body;
        const sql = 'INSERT INTO bookingappointment (name, email, contact_number, service, date, time, comment) VALUES (?,?,?,?,?,?,?)';
        //Insert the new product into the database
        connection.query( sql, [name, email, contact_number, service, date, time, comment], (error, results) => {
            if (error) {
                //Handle any error that occurs during the database operation
                console.error("Error booking appointment:", error);
                res.status(500).send('Error booking appointment');
            } else {
                // Send a success response 
                res.redirect('/Appointments');
            }
        });
    });
    
    app.get('/Appointments', (req, res) => {
        const sql = 'SELECT * FROM bookingappointment';
        //Fetch data from SQL
        connection.query(sql , (error, results) => {
            if (error) {
                console.error('Database query error:', error.message);
                return res.status(500).send('Error Retrieving appointments');
            }
            results.forEach(bookingappointment => {
                const date = new Date(bookingappointment.date);
                bookingappointment.date = date.toLocaleDateString();
            });
            //render HTML Page with data 
            res.render('Appointments', {bookingappointment: results});
        });
    });

    app.get('/editAppointment/:id', (req, res) => {
        //Extract the appointment ID from the request parameters
        const bookingId = req.params.id;
        const sql = "SELECT * FROM bookingappointment WHERE bookingId = ?";
        //Fetch data from MySQL based on the appointment ID
        connection.query(sql, [bookingId], (error, results) => {
            if (error) {
                console.error('Database query error:', error.message);
                return res.status(500).send('Error Retrieving appointment by ID');
            }
            //Check if any appointment with the given ID was found 
            if (results.length > 0) {
                //Render HTML Page with the appointment data
                res.render('editAppointment', { bookingappointment: results[0] });
            } else {
                // If no appointment with the given ID was found, render a 404 page or handle it accordingly
                res.status(404).send("Appointment not found");
            }
        });
    });

    app.post('/editAppointment/:id', (req, res) => {
        const bookingId = req.params.id;
        //Extract appointment data from the request body
        const { name, email, contact_number, service, date, time, comment } = req.body;
        const sql = 'UPDATE bookingappointment SET name =?, email =?, contact_number=?, service=?, date=?, time=?, comment=? WHERE bookingId = ?';
    
        //Insert the new appointment into the database
        connection.query(sql, [name, email, contact_number, service, date, time, comment, bookingId], (error, results) => {
            if (error) {
                //Handle any error that occurs during the database operation
                console.error("Error updating appointment:", error);
                res.status(500).send("Error updating appointment");
            } else {
                //Send a sucess respones
                res.redirect('/Appointments');
            }
        });
    });


    app.get('/deleteAppointment/:id', (req, res) => {
        const bookingId = req.params.id;
        const sql = "DELETE FROM bookingappointment WHERE bookingId = ?";
        connection.query(sql ,[bookingId], (error, results) => {
            if(error) {
                //Handle any error that occurs during the database operation
                console.error("Error updating appointment:", error);
                res.status(500).send("Error updating appointment");
            } else {
                //Send a sucess respones
                res.redirect('/Appointments');
            }
        });
    });

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));