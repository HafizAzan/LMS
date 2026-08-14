const Stripe = require('stripe');
const Course = require('../models/Course');
const Payment = require('../models/Payment');
const { enrollUserInCourse } = require('../utils/enrollUser');

const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    const error = new Error('Stripe is not configured');
    error.statusCode = 503;
    throw error;
  }

  return new Stripe(process.env.STRIPE_SECRET_KEY);
};

const getClientUrl = () =>
  (process.env.CLIENT_URL || 'http://localhost:5173').split(',')[0].trim();

const fulfillPaidEnrollment = async (session) => {
  const userId = session.metadata?.userId;
  const courseId = session.metadata?.courseId;

  if (!userId || !courseId) {
    return null;
  }

  const payment = await Payment.findOneAndUpdate(
    { stripeSessionId: session.id },
    {
      status: 'paid',
      stripePaymentIntentId:
        typeof session.payment_intent === 'string'
          ? session.payment_intent
          : session.payment_intent?.id || '',
    },
    { new: true },
  );

  const result = await enrollUserInCourse(userId, courseId);
  return { payment, ...result };
};

const createCheckoutSession = async (req, res) => {
  try {
    const { courseId } = req.body;
    if (!courseId) {
      return res.status(400).json({ message: 'courseId is required' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (!course.price || course.price <= 0) {
      return res.status(400).json({
        message: 'This course is free. Use the enroll endpoint instead.',
      });
    }

    const alreadyEnrolled = course.enrolledStudents.some(
      (studentId) => studentId.toString() === req.user._id.toString(),
    );
    if (alreadyEnrolled) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    const stripe = getStripe();
    const unitAmount = Math.round(Number(course.price) * 100);
    const clientUrl = getClientUrl();

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: req.user.email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: course.title,
              description: course.description?.slice(0, 400) || undefined,
            },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: req.user._id.toString(),
        courseId: course._id.toString(),
      },
      success_url: `${clientUrl}/courses/${course._id}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientUrl}/courses/${course._id}?payment=cancelled`,
    });

    await Payment.create({
      user: req.user._id,
      course: course._id,
      stripeSessionId: session.id,
      amount: unitAmount,
      currency: 'usd',
      status: 'pending',
    });

    return res.status(200).json({ url: session.url, sessionId: session.id });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    return res.status(500).json({ message: error.message });
  }
};

const confirmCheckoutSession = async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) {
      return res.status(400).json({ message: 'sessionId is required' });
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.metadata?.userId !== req.user._id.toString()) {
      return res.status(403).json({ message: 'This payment does not belong to you' });
    }

    if (session.payment_status !== 'paid') {
      return res.status(400).json({ message: 'Payment is not complete yet' });
    }

    const result = await fulfillPaidEnrollment(session);
    return res.status(200).json({
      message: result?.alreadyEnrolled
        ? 'Already enrolled in this course'
        : 'Payment confirmed. Course unlocked.',
      course: result?.course,
      user: result?.user,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    return res.status(500).json({ message: error.message });
  }
};

const handleStripeWebhook = async (req, res) => {
  const signature = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return res.status(503).json({ message: 'Stripe webhook is not configured' });
  }

  let event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
  } catch (error) {
    return res.status(400).json({ message: `Webhook error: ${error.message}` });
  }

  try {
    if (
      event.type === 'checkout.session.completed' ||
      event.type === 'checkout.session.async_payment_succeeded'
    ) {
      const session = event.data.object;
      if (session.payment_status === 'paid' || event.type === 'checkout.session.completed') {
        await fulfillPaidEnrollment(session);
      }
    }

    if (event.type === 'checkout.session.async_payment_failed') {
      const session = event.data.object;
      await Payment.findOneAndUpdate(
        { stripeSessionId: session.id },
        { status: 'failed' },
      );
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createCheckoutSession,
  confirmCheckoutSession,
  handleStripeWebhook,
};
