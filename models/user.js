const { Schema, model } = require("mongoose");
const { createHmac, randomBytes } = require("crypto");

const userSchema = new Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,   // normalize case
      trim: true,
    },
    salt: {
      type: String,
      select: false,     // don't include salt in queries by default
    },
    password: {
      type: String,
      required: true,
      select: false,     // prevents password from leaking
    },
    profileImageURL: {
      type: String,
      default: "/images/default.png",
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  { timestamps: true }
);

userSchema.pre("save", function (next) {
  if (!this.isModified("password")) return next();

  this.salt = randomBytes(16).toString("hex");
  this.password = createHmac("sha256", this.salt)
    .update(this.password)
    .digest("hex");

  next();
});

// Login compare function
userSchema.statics.matchPassword = async function (email, password) {
  const user = await this.findOne({ email });
  if (!user) return null;

  const hashedPassword = createHmac("sha256", user.salt)
    .update(password)
    .digest("hex");

  if (hashedPassword === user.password) return user;
  return null;
};

// Login compare function
userSchema.statics.matchPassword = async function (email, password) {
  const user = await this.findOne({ email });
  if (!user) return null;

  const hashedPassword = createHmac("sha256", user.salt)
    .update(password)
    .digest("hex");

  if (hashedPassword === user.password) return user;
  return null;
};

// Custom static login helper
userSchema.statics.login = async function (email, password) {
  const user = await this.findOne({ email }).select("+password +salt");

  if (!user) throw new Error("No user found with this email");

  const hashed = createHmac("sha256", user.salt)
    .update(password)
    .digest("hex");

  if (hashed !== user.password) throw new Error("Invalid password");

  // remove sensitive fields before returning
  user.password = undefined;
  user.salt = undefined;
  return user;
};

// Ensure password never appears when converting to JSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.salt;
  return obj;
};

module.exports = model("User", userSchema);
