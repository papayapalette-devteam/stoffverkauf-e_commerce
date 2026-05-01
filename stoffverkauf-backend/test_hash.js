const bcrypt = require('bcryptjs');

const providedHash = "$2b$10$RFWH2CGu2Jy8NpaaQRhFZ.ydeBApaPj7rXYVVlVH1YSQN321l.IRe";
const password = "admin123";

bcrypt.compare(password, providedHash).then(isMatch => {
  console.log('Provided hash matches password:', isMatch);
});

bcrypt.hash(password, 10).then(newHash => {
  console.log('New hash generated:', newHash);
  bcrypt.compare(password, newHash).then(isMatch => {
    console.log('New hash matches password:', isMatch);
  });
});
