
const loadAuth = (req, res) => {
    res.render('auth');
}

const successGoogleLogin = (req , res) => { 
    console.log(req.user)
	if(!req.user) 
		res.redirect('/failure'); 
    console.log(req.user);
	res.send("Welcome " + req.user.email); 
}

const failureGoogleLogin = (req , res) => { 
	res.send("Error"); 
}

module.exports = {
    loadAuth,
    successGoogleLogin,
    failureGoogleLogin
}