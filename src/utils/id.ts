import crypto from "crypto";

function getId(str: string) {
    const hasher = crypto.createHash("sha1");
    let hash = hasher.update(str);
    return hash.digest().toString("hex");
}

export { getId };
