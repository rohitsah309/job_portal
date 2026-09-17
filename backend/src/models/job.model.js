import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3
    },

    organization: {
      type: String,
      required: true,
      trim: true
    },

    category: {
      type: String,
      required: true,
      trim: true
    },

    state: {
      type: String,
      default: "All India",
      true: true
    },

    qualification: {
      type: [String],
      required: true
    },

    vacancies: {
      type: Number,
      required: true,
      min: 0
    },

    ageLimit: {
      min: {
        type: Number,
        min:0
      },
      max: {
        type: Number,
        min: 0
      }
    },

    salary: {
      type: String,
      trim: true
    },

    applicationStart: {
      type: Date,
      required: true
    },

    applicationLastDate: {
      type: Date,
      required: true
    },

    notificationUrl: {
      type: String,
      required: true,
      trim: true
    },

    applyUrl: {
      type: String,
      required: true
    },

    sourceUrl: {
      type: String,
      required: true,
      trim: true
    },

    status: {
      type: String,
      enum: ["UPCOMING", "OPEN", "CLOSED"],
      default: "OPEN"
    },
    sourceId: {
      type: String,
      unique: true,
      sparse: true
    },
  },
  {
    timestamps: true
  }
);

const Job = mongoose.model("Job", jobSchema);

export default Job;