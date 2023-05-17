exports.requireAuth = (req, res, next) => {
  if (req.session && req.session.user) {
    next();
  } else {
    res.redirect("/auth/login");
  }
};

<<<<<<< Updated upstream

exports.isAuth = (req, res, next) => {
=======
exports.requireAdmin = (req, res, next) => {
>>>>>>> Stashed changes
  if (req.session && req.session.admin) {
    next();
  } else {
    res.redirect("/auth/login");
  }
};
<<<<<<< Updated upstream

=======
>>>>>>> Stashed changes
