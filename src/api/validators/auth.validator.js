const validator = require('validator');

const validateEmail = (email) => {
  if (!email) {
    return { valid: false, error: 'Email is required' };
  }
  if (!validator.isEmail(email)) {
    return { valid: false, error: 'Invalid email format' };
  }
  return { valid: true };
};

const validatePassword = (password) => {
  if (!password) {
    return { valid: false, error: 'Password is required' };
  }
  if (password.length < 6) {
    return { valid: false, error: 'Password must be at least 6 characters' };
  }
  return { valid: true };
};

const validateUsername = (username) => {
  if (!username) {
    return { valid: false, error: 'Username is required' };
  }
  if (username.length < 3 || username.length > 20) {
    return { valid: false, error: 'Username must be between 3 and 20 characters' };
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { valid: false, error: 'Username can only contain letters, numbers, and underscores' };
  }
  return { valid: true };
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  const emailValidation = validateEmail(email);
  if (!emailValidation.valid) {
    return res.status(400).json({ message: emailValidation.error });
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    return res.status(400).json({ message: passwordValidation.error });
  }

  next();
};

const validateRegister = (req, res, next) => {
  const { username, email, password } = req.body;

  const usernameValidation = validateUsername(username);
  if (!usernameValidation.valid) {
    return res.status(400).json({ message: usernameValidation.error });
  }

  const emailValidation = validateEmail(email);
  if (!emailValidation.valid) {
    return res.status(400).json({ message: emailValidation.error });
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    return res.status(400).json({ message: passwordValidation.error });
  }

  next();
};

const validateGuest = (req, res, next) => {
  const { username } = req.body;

  const usernameValidation = validateUsername(username);
  if (!usernameValidation.valid) {
    return res.status(400).json({ message: usernameValidation.error });
  }

  next();
};

module.exports = {
  validateLogin,
  validateRegister,
  validateGuest,
};

