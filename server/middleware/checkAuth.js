exports.isLoggedIn = async (req,res,next) => {
  if(req.url == "/" && !req?.user) return next()
  if(req?.user) {
    if(req.url == "/"){
      return res.redirect("/dashboard")
    }
    return next();
  }
  else{
    return res.redirect("/")
  }
}