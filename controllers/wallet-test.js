app.get("/deposit", (req, res) => {
  const errorMessage = req.flash("error");
  res.render("deposit", { errorMessage: errorMessage });
});

// {% if errorMessage %}
//   <div class="alert alert-danger">{{ errorMessage }}</div>
// {% endif %}

// <form method="post" action="/deposit">
//   <!-- ... -->
// </form>