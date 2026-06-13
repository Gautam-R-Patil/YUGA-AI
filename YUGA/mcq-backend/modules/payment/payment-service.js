import crypto from 'crypto';

export const generatePaymentHash = (txnid, amount, productinfo, firstname, email) => {
    const MERCHANT_KEY = process.env.PAYU_MERCHANT_KEY;
    const SALT = process.env.PAYU_SALT;

    if (!MERCHANT_KEY || !SALT) {
        throw { status: 500, message: "Server configuration error: Missing PayU credentials" };
    }

    // Hash sequence: key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||SALT
    const hashString = `${MERCHANT_KEY}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|||||||||||${SALT}`;
    const hash = crypto.createHash('sha512').update(hashString).digest('hex');

    return { hash, key: MERCHANT_KEY };
};

export const verifyPaymentHash = (txnid, amount, productinfo, firstname, email, status, hash) => {
    const MERCHANT_KEY = process.env.PAYU_MERCHANT_KEY;
    const SALT = process.env.PAYU_SALT;

    // Hash sequence for verification: SALT|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key
    const hashString = `${SALT}|${status}|||||||||||${email}|${firstname}|${productinfo}|${amount}|${txnid}|${MERCHANT_KEY}`;
    const calculatedHash = crypto.createHash('sha512').update(hashString).digest('hex');

    return calculatedHash === hash;
};
