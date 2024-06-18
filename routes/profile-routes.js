const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../model/User');

const authCheck = (req, res, next) => {
    const token = req.cookies.jwt;
    if (!token) {
        return res.redirect('/auth/login');
    }
    jwt.verify(token, process.env.JWT_SECRET, async (err, decodedToken) => {
        if (err) {
            return res.redirect('/auth/login');
        }
        try {
            const user = await User.findById(decodedToken.id);
            req.user = user;
            next();
        } catch (error) {
            res.redirect('/auth/login');
        }
    });
};

router.get('/', authCheck, (req, res) => {
    res.render('profile', { user: req.user });
});

module.exports = router;
