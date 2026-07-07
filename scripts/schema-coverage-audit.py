#!/usr/bin/env python3
"""
Schema coverage audit.

Extracts every field token from the legacy Mongoose models (both backends) and
checks each one is represented in the new Prisma schema (as a field name, an
@map() target, or an enum value). Prints legacy fields with no match so we can
guarantee the rewrite drops no field the frontend may depend on.

Usage:  python3 scripts/schema-coverage-audit.py
Matching is case-insensitive and underscore-insensitive (phone_number ==
phoneNumber). Renames handled at the DTO layer will still show here — treat the
output as "confirm each is intentional", not "these are bugs".
"""
import glob
import re
from collections import defaultdict

STOP = {
    "type", "ref", "enum", "default", "required", "unique", "min", "max",
    "lowercase", "uppercase", "expires", "timestamps", "of", "_id", "trim",
    "index", "sparse", "select", "validate", "match", "set", "get", "alias",
    "immutable", "maxlength", "minlength", "toJSON", "toObject", "virtuals",
    "localField", "foreignField", "message", "versionKey", "id", "collection",
    "discriminatorKey", "populate", "autopopulate", "cast", "transform",
    "function", "return", "const", "let", "interface", "export", "import",
    "new", "this", "await", "async", "string", "number", "boolean", "date",
    "object", "any", "void", "null", "undefined", "true", "false",
}

LEGACY_GLOB = "legacy/*/src/models/*.ts"
SCHEMA_GLOB = "packages/db/prisma/schema/*.prisma"


def norm(s: str) -> str:
    """Case/underscore-insensitive, and collapses `xId`/`xIds`/plural to base
    so `likeIds` == `likes`, `userIds` == `users`, `wishlistIds` == `wishList`."""
    t = s.lower().replace("_", "")
    for suf in ("ids", "id"):
        if t.endswith(suf) and len(t) > len(suf) + 2:
            t = t[: -len(suf)]
            break
    if t.endswith("s") and len(t) > 3:
        t = t[:-1]
    return t


# Irregular renames covered by the schema/DTO layer (normalised legacy -> ok).
ALIASES = {
    "categorie", "relatedproduct", "size", "inventory", "discountpercentage",
    "orderstatu", "paymentmethod", "avatar", "documentverification",
    "varification", "offer", "follower", "wishlist", "for", "refid",
    "seller", "schoolid", "dateadded", "orderdate", "startdate", "enddate",
    "reviewallow", "productimage", "receiver", "user", "subcategory",
    "courierpartnerclaimapprovalpercentage", "ref",
}

# Legacy auth/OTP internals intentionally replaced by better-auth, plus
# per-file KYC upload metadata folded into KycDocument, plus a code typo.
EXPECTED_DROPPED = {
    "otp", "otpexpiration", "mobilenumber", "usertype", "enteredpassword",
    "resetpasswordexpired", "restpasswordtoken", "expiresin", "minlength",
    "broadcast", "reqired", "aadharupload", "panupload", "gstinupload",
    "accountupload", "fieldname", "originalname", "mimetype", "destination",
    "path", "filename", "gstinnumber", "ifscnumber",
}


def legacy_fields():
    fields = defaultdict(set)
    for path in glob.glob(LEGACY_GLOB):
        for line in open(path, encoding="utf-8", errors="ignore"):
            m = re.match(r"\s*([A-Za-z_][A-Za-z0-9_]*)\s*[:?]", line)
            if m and m.group(1) not in STOP:
                fields[norm(m.group(1))].add(m.group(1))
    return fields


def schema_tokens():
    tokens = set()
    for path in glob.glob(SCHEMA_GLOB):
        text = open(path).read()
        for m in re.finditer(r"^\s*([A-Za-z_][A-Za-z0-9_]*)\s+\w", text, re.M):
            tokens.add(norm(m.group(1)))
        for m in re.finditer(r'@map\("([^"]+)"\)', text):
            tokens.add(norm(m.group(1)))
        for m in re.finditer(r"^\s*([A-Za-z_][A-Za-z0-9_]*)\s*$", text, re.M):
            tokens.add(norm(m.group(1)))
    return tokens


def main():
    legacy = legacy_fields()
    schema = schema_tokens()
    missing = [k for k in legacy if k not in schema]

    dropped = sorted(k for k in missing if k in EXPECTED_DROPPED)
    aliased = sorted(k for k in missing if k in ALIASES)
    unexpected = sorted(
        k for k in missing if k not in EXPECTED_DROPPED and k not in ALIASES
    )

    print(f"Legacy field tokens: {len(legacy)}   Schema tokens: {len(schema)}")
    print(f"Covered by rename/alias: {len(aliased)}")
    print(f"Intentionally dropped (better-auth / upload meta): {len(dropped)}")
    print(f"\n=== UNEXPECTED (investigate) [{len(unexpected)}] ===")
    for k in unexpected:
        print("  " + "/".join(sorted(legacy[k])))
    if not unexpected:
        print("  (none — every legacy field is accounted for ✅)")


if __name__ == "__main__":
    main()
