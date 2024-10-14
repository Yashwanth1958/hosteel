import express from 'express';
import Razorpay from 'razorpay';
import bodyParser from 'body-parser';
import { join } from 'path';

const app = express();

// Set EJS as the view engine
app.set('view engine', 'ejs');
//app.set('views', join(__dirname, 'views'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize Razorpay instance
const razorpay = new Razorpay({
    key_id:  'rzp_test_F0CnQAOOEuWtCn',  // Replace with your Razorpay Key ID
    key_secret: '74j9WIg6jvCOvBE1ENgtSm4V'  // Replace with your Razorpay Key Secret
});

// Home Route
app.get('/', (req, res) => {
    res.render('index');
});

// Create Order Route
app.post('/createOrder', async (req, res) => {
    const { amount } = req.body;  // Get the amount from the form

    const options = {
        amount: amount * 100,  // Amount in smallest currency unit (paise)
        currency: "INR",
        receipt: "order_rcptid_11",
        payment_capture: 1,  // Auto-capture after payment
    };

    try {
        const order = await razorpay.orders.create(options);
        res.render('payment', { orderId: order.id, amount: order.amount });
    } catch (error) {
        res.status(500).send('Error creating Razorpay order');
    }
});

// Start the server
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
