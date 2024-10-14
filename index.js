import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import Razorpay from "razorpay";
import crypto from  "crypto";
import bcrypt from "bcrypt";


const port=3000;
const app=express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set('view engine','ejs');

const db =new pg.Client(
    {
        user:"postgres",
        host:"localhost",
        database:"users",
        password:"12345678",
        port:5432

    }
);

db.connect();
app.set('view engine','ejs');

const razorpay = new Razorpay({
    key_id: 'rzp_test_F0CnQAOOEuWtCn',
    key_secret: '74j9WIg6jvCOvBE1ENgtSm4V',
  });
  app.get("/payment-sucess",(req,res)=>{
    res.render("paymentsucess.ejs")
  })

app.get("/",(req,res)=>{
    let heading ="HOME";
    let studentlogin ="STUDENTLOGIN";
    let complaintbox ="COMPLAINT BOX";
    let DROPDOWN ="DROPDOWN";
    let REGISTER ="REGISTER";

    res.render("header.ejs",{heading,studentlogin,complaintbox,DROPDOWN,REGISTER});
});
app.get("/header.ejs",(req,res)=>{
  let heading ="HOME";
    let studentlogin ="STUDENTLOGIN";
    let complaintbox ="COMPLAINT BOX";
    let DROPDOWN ="DROPDOWN";
    let REGISTER ="REGISTER";

    res.render("header.ejs",{heading,studentlogin,complaintbox,DROPDOWN,REGISTER});
});

app.get("/h",(req,res)=>{
  //  res.render("detailtable.ejs");
    res.render('detailtable.ejs', { key_id: 'rzp_test_F0CnQAOOEuWtCn' });
});


app.get("/views/home.ejs",(req,res)=>{
  let heading ="HOME";
    let studentlogin ="STUDENTLOGIN";
    let complaintbox ="COMPLAINT BOX";
    let DROPDOWN ="DROPDOWN";
    let REGISTER ="REGISTER";

    res.render("header.ejs",{heading,studentlogin,complaintbox,DROPDOWN,REGISTER});

    
    res.render("home.ejs");
});
app.get("/views/header.ejs",(req,res)=>{
    res.render("header.ejs")

});
app.get("/views/testcarsule.ejs",(req,res)=>{
    res.render("testcarsule.ejs");
})
app.get("/views/login.ejs",(req,res)=>{
    res.render("login.ejs");
});
app.get("/views/register.ejs",(req,res)=>{
    res.render("register.ejs")
});
app.get("/views/newBoys.ejs",(req,res)=>{
    res.render("newBoys.ejs");
});
app.get("/views/oldBoys.ejs",(req,res)=>{
    res.render("oldBoys.ejs")
});
app.get("/views/complaint.ejs",(req,res)=>{
    res.render("complaint.ejs");
});
app.get("/views/navbar.ejs",(req,res)=>{
  res.render("navbar.ejs");
});
app.get("/mess",(req,res)=>[
  res.render("messbill.ejs")
])

app.get("/views/admin.ejs",(req,res)=>{
  res.render("admin.ejs")
})

app.post("/register", async (req,res)=>{
//const email=req.body.username;
   // const password=req.body.password;
    const {username,password}=req.body;
       console.log(username);
       console.log(password);
       const haspass= await bcrypt.hash(password,10);
       console.log(haspass);

        await  db.query("insert into details (username,pasword) values ($1,$2)",[username,haspass]);
     //res.send("thank you for registering");
     //res.status(200);
    res.render("header.ejs");
    res.send("thank you for registering");

   // db.query("insert into users (email,password) values ($1,$2)",[email,password])

});
app.post("/login",async(req,res)=>{
  const {username,password}=req.body;
    //const email=req.body.username; // this takes input values and stored in variables 
    //const password=req.body.password; // same as above
   console.log(username); 
    console.log(password);
    //db.query("insert into user (email,password) values $1 $2",[user,passw]);

    const result = await db.query("select * from details where username=$1 ",[username]);
   // console.log(result.rows); this line thros an output of the result in object
   //console.log(result)
   console.log(result.rows[0].pasword); // this throws the output of passord of first row
   const dbpassword =result.rows[0].pasword;
   console.log(dbpassword);
   const match = await bcrypt.compare(password,dbpassword);
   console.log(match)
    
    if (match===false){
        console.log("users exists");
        res.render("messbill.ejs");

    }
    else{
        console.log("user not found");
        //res.send("IF you don,t have an account try please go ahead an register yourself").render("register.ejs")
        res.render("register.ejs")
    }
    //res.send("connection sucess");
    res.render("messbill.ejs")
    console.log("connection sucess");
  //  console.log( result);

 // res.render("messbill.ejs");
});
app.get("/views/admin.ejs",(req,res)=>{
  res.render("admin.ejs");
});
app.post("/admin",async (req,res)=>{
  const {employeeid,password}=req.body;
  console.log(employeeid + " " + password);
  const hashadmin =await bcrypt.hash(employeeid,10);
  console.log(hashadmin);
  await db.query("insert into tuadmin (employeeid,pasword ) values ($1,$2)",[employeeid,hashadmin]);
  res.send("Welcome Admin");
})

app.post("/mess",async (req,res)=>{
    const VALUE =req.body.messno;;
  console.log(VALUE);
    const result =await db.query("select *  from messinfo where messno=$1",[VALUE]);
    console.log(result);
    const rows  =result.rows;

    console.log(rows);
    res.render('messtable.ejs',
    {rows, key_id: 'rzp_test_F0CnQAOOEuWtCn' });
   // console.log(details);
});

app.post('/createOrder', async (req, res) => {
    const { amount } = req.body;
  
    const options = {
      amount: amount * 100, // Convert amount to paise
      currency: 'INR',
      receipt: 'order_receipt_' + Math.floor(Math.random() * 1000),
      payment_capture: 1, // Auto capture payment
    };
  
    try {
      const response = await razorpay.orders.create(options);
  
      // Save the order details to the database
      const order = await db.query(
        'INSERT INTO payments (razorpay_order_id, amount, currency, status) VALUES ($1, $2, $3, $4) RETURNING *',
        [response.id, amount, 0, 'Pending']
      );
  
      res.json({ ...response, orderId: order.rows[0].id });
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });



  
// Home route to render the payment page
app.get('/p', (req, res) => {
  res.render('index');
});

// Route to create Razorpay order
app.post('/createOrder', async (req, res) => {
  const amount = req.body.amount * 100; // Convert to smallest currency unit (paisa for INR)
  
  const options = {
    amount: amount, // amount in paisa
    currency: 'INR',
    receipt: 'order_rcptid_11',
  };

  try {
    const order = await razorpay.orders.create(options);
    res.json(order); // Send the order details to the frontend
  } catch (error) {
    console.error(error);
    res.status(500).send('Something went wrong');
  }
});

// Route to verify payment signature
app.post('/verifyPayment', (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', 'YOUR_KEY_SECRET')
    .update(body.toString())
    .digest('hex');

  if (expectedSignature === razorpay_signature) {
    res.render('success', { paymentId: razorpay_payment_id });
  } else {
    res.status(400).send('Payment verification failed');
  }
});


  /*app.post('/payment-success', async (req, res) => {
    const { order_id, payment_id, razorpay_signature, orderId } = req.body;
  
    const generatedSignature = crypto.createHmac('sha256', '74j9WIg6jvCOvBE1ENgtSm4V')
      .update(order_id + '|' + payment_id)
      .digest('hex');
  
    if (generatedSignature === razorpay_signature) {
      // Signature validation successful
  
      // Update the payment status in the database
      await db.query(
        'UPDATE payments SET status = $1, paid_amount = amount WHERE id = $2',
        ['Paid', orderId]
      );
  
      res.send('Payment successful!');
    } else {
      // Signature validation failed
      res.status(400).send('Invalid signature');
    }
  });*/

app.post("/complaint",(req,res)=>{
    req.body.textname;


    
    
});



app.listen(port,()=>{
    console.log('the port is running at 3000 ')
});