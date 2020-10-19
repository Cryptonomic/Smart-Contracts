var crypto = require("crypto");

const getNewSecret = () => {
  const rand = crypto.randomBytes(32);
  let hash = crypto.createHash("sha256").update(rand).digest();
  hash = crypto.createHash("sha256").update(hash).digest("hex");
  return {
    hashedSecret: "0x" + hash,
    secret: "0x" + rand.toString("hex"),
  };
};

console.log(getNewSecret());
