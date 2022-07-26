const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const serieSchema = new Schema(
  {
    name: {
      type: String,
      required: "Series title is required",
      trim: true,
    },
    image: {
      type: String,
      default:
        "https://us.123rf.com/450wm/avectors/avectors1808/avectors180800182/111902588-sin-tarjeta-de-prueba-de-color-de-tv-de-se%C3%B1al-de-patr%C3%B3n-de-barras-vectoriales.jpg?ver=6",
      validate: {
        validator: function (image) {
          try {
            new URL(image);
            return true;
          } catch (error) {
            return false;
          }
        },
        message: (image) => "Invalid URL",
      },
    },
    description: String,
    network: String,
    platform: {
      type: [String],
      enum: [
        "Movistar+",
        "HBO Max",
        "Netflix",
        "Amazon Prime Video",
        "Disney+",
        "Apple TV",
        "Crunchyroll",
        "Other",
      ],
    },
    status: {
      type: String,
    },
    rating: {
      type: Number,
      min: 0,
      max: 10,
    },
    genre: {
      type: [String],
      enum: [
        "Drama",
        "Thriller",
        "Sci-fi",
        "Comedy",
        "Animation",
        "Terror",
        "Fantasy", 
        "Action",
        "Adventure"
      ]
    },
    trailer: {
      type: String,
      default: "https://www.youtube.com/embed/IVqUecYGnoM",
      validate: {
        validator: function (trailer) {
          try {
            new URL(trailer);
            return true
          } catch (error) {
            return false
          }
        },
        message: (trailer) => "Invalid URL",  
      }
    }
  },
  { toJSON: { virtuals: true } }
);

serieSchema.virtual("episodes", {
  ref: "Episode",
  localField: "_id",
  foreignField: "serie",
});

serieSchema.pre("validate", function (next) {
  this.image = this.image || undefined;
  this.description = this.description || undefined;
  this.trailer = this.trailer || undefined;
  next();
});

const Serie = mongoose.model("Serie", serieSchema);
module.exports = Serie;
