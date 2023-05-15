exports.requireAuth = (req, res, next) => {
  if (req.session && req.session.user) {
    next();
  } else {
    res.redirect("/auth/login");
  }
};


exports.isAuth = (req, res, next) => {
  if (req.session && req.session.admin) {
    next();
  } else {
    res.redirect("/auth/login");
  }
};

