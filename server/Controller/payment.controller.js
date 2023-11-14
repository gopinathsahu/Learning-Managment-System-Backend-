const payment = require('../Model/payment.js');
const User = require('../Model/payment.js');
const { razorpay } = require('../index.js');
exports.getRazorpayApiKey = async (req, res) => {
   try {
    res.status(200).json({
        success: true,
        message: 'RazorApiKey',
        key: process.env.RAZORRPAY_KEY_ID
    })
   } catch (error) {
    res.status(400).json({
        success: false,
        message: error.message,
    })
   }
}
exports.subscription = async (req, res) => {
try {
    const { id } = req.user;
    const user = await User.findById(id);

    if (!user) {
        res.status(400).json({
            success: false,
            message: 'Unauthorized,please login !',

        })
    }
    if (user.role === 'ADMIN') {
        res.status(400).json({
            success: false,
            message: 'ADmin cannot purchase a subscription',

        })
    }

    const subscription = await razorpay.subscriptions.create({
        plan_id: process.env.RAZORRPAY_PLAN_ID,
        customer_notify: 1
    })
    user.subscription.id = subscription.id;
    user.subscription.status = subscription.status;
    await user.save();
    res.status(200).json({
        success: true,
        message: 'Subscribed successfully ',
        subscription_id: subscription.id
    });

} catch (error) {
    res.status(400).json({
        success: false,
        message: error.message,
    })
}
}
exports.verifysubscription = async (req, res) => {

try {
    const { id } = req.user;
    const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature } = req.body;
    const user = await User.findById(id);

    if (!user) {
        res.status(400).json({
            success: false,
            message: 'Unauthorized,please login !',

        })
    }
    const subscription = user.subscription.id;
    const generatedSignature = crypto.createHmac('sha256', process.env.RAZORRPAY_SECRET).update(`${razorpay_payment_id}| ${razorpay_subscription_id}`)
    if (generatedSignature !== razorpay_signature) {
        res.status(400).json({
            success: false,
            message: 'Payment not verified,please try again'
        })

    }
    await payment.create({
        razorpay_payment_id,
        razorpay_subscription_id,
        razorpay_signature
    })
    user.subscription.status = 'active';
    await user.save();
    res.status(200).json({
        success: true,
        message: 'Payment verified successfully..!',subscription
    })

} catch (error) {
    res.status(400).json({
        success: false,
        message: error.message,
    })
}
}
exports.cancelsubscription = async (req, res) => {
    try {
        const { id } = req.user;
    const user = await User.findById(id);

    if (!user) {
        res.status(400).json({
            success: false,
            message: 'Unauthorized,please login !',

        })
    }
    if (user.role === 'ADMIN') {
        res.status(400).json({
            success: false,
            message: 'ADmin cannot purchase a subscription',

        })
    }
    const subscriptionId = user.subscription.id;
    const subscription = await razorpay.subscriptions.cancel(
        subscriptionId
    )
    user.subscription.status=subscription.status;
    await user.save();
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        })
    }


}
exports.allpayments = async (req, res) => {
     const{count}=req.query;
     const subscriptions=await razorpay.subscriptions.all({
        count:count||10,
     });
     res.status(200).json({
        success: true,
        message: 'All paymments...',
      subscriptions
    })

}