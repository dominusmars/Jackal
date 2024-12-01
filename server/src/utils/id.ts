import crypto from "crypto";

// makes id from a hash of the string, used for making ids for rules
function getId(str: string) {
    const hasher = crypto.createHash("sha1");
    let hash = hasher.update(str);
    return hash.digest().toString("hex");
}

export { getId };
