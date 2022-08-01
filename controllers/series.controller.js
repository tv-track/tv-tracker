const mongoose = require("mongoose");
const { Serie, Episode } = require("../models");

module.exports.list = (req, res, next) => {
  Serie.find()
    .then((series) => res.render("index", { series }))
    .catch((error) => next(error));
};

module.exports.newSerie = (req, res, next) => {
  res.render("series/new-serie");
};
module.exports.createSerie = (req, res, next) => {
  const serie = req.body;
  Serie.create(serie)
    .then((serie) => {
      console.log("Created");
      res.redirect("/");
    })
    .catch((error) => {
      if (error instanceof mongoose.Error.ValidationError) {
        console.error(error);
        res.render("series/new-serie", { errors: error.errors, serie });
      } else {
        next(error);
      }
    });
};

module.exports.detail = (req, res, next) => {
  Serie.findById(req.params.id)
    .populate({
      path: "episodes",
      populate: {
        path: "viewed"
      }
    })
    .then((serie) => {
      if (serie) {
        const data = serie.episodes
          .sort((a, b) => a.season - b.season)
          .reduce((acc, el) => {
            acc[el.season] = (acc[el.season] || []).sort(
              (a, b) => a.episode - b.episode
            );
            acc[el.season].push(el);
            return acc;
          }, {});
        const seasonNum = Object.keys(data);
        const viewed = serie.episodes.viewed
        res.render("series/series-detail", { serie, data, seasonNum, viewed });
      } else {
        res.redirect("/");
      }
    })
    .catch((error) => next(error));
};

module.exports.createEpisode = (req, res, next) => {
  Serie.findById(req.params.serieId)
    .then((serie) => {
      if (serie) {
        res.render("series/new-episode", { serie });
      } else {
        res.redirect("/")
      }      
    })
    .catch((error) => next(error));
};

// a comprobar desde aquí
module.exports.doCreateEpisode = (req, res, next) => {
  const serieData = req.body;
  serieData.serie = req.params.serieId;

  function renderWithErrors(errors, serie) {
    console.log(serieData);
    res.status(400).render("series/new-episode", {
      serie: serieData,
      episode: req.body,
      serie,
      errors,
    });
  }

  Serie.findById(req.params.serieId).then((serie) => {
    if (!serie) {
      renderWithErrors({ serie: "This serie doesn't exist" }, serie);
    } else {
      return Episode.create(serieData)
        .then((episode) => {
          console.log("Episode created");
          res.redirect(`/series/${req.params.serieId}`);
        })
        .catch((error) => {
          if (error instanceof mongoose.Error.ValidationError) {
            renderWithErrors(error.errors, serie);
          } else {
            next(error);
          }
        });
    }
  });
};

/* module.exports.delete = (req, res, next) => {  
  Serie.findByIdAndDelete(req.params.serieId)
    .then(() => {
      res.redirect("/");
    })
    .catch((error) => next(error));
}; */

module.exports.delete = (req, res, next) => {  
  Serie.findById(req.params.serieId)
    .then((serie) => {
      return Episode.deleteMany({  serie: serie.id })
        .then(() => {
          return Serie.findByIdAndDelete(req.params.serieId) 
            .then(() => {
              res.redirect("/");
            })
        })      
    })
    .catch((error) => next(error));
};

module.exports.update = (req, res, next) => {
  Serie.findById(req.params.serieId)
    .then((serie) => {
      res.render("series/serie-edit", { serie });
    })
    .catch((error) => next(error));
};

module.exports.doUpdate = (req, res, next) => {
  const { name, image, description, network, platform, status, rating } =
    req.body;
  Serie.findByIdAndUpdate(
    req.params.serieId,
    { name, image, description, network, platform, status, rating },
    { new: true }
  )
    .then((serie) => res.redirect(`/series/${serie.id}`))
    .catch((error) => next(error));
};

module.exports.doDeleteEpisode = (req, res, next) => {
  Episode.findByIdAndDelete(req.params.episodeId)
    .then(() => res.redirect("back"))
    .catch(error => next(error))
}
