# backend/app/services/password_service.py
from __future__ import annotations

from argon2 import PasswordHasher, Type
from argon2.exceptions import InvalidHash, VerifyMismatchError


class PasswordService:
    """
    Thin wrapper around argon2-cffi's PasswordHasher.
    Uses Argon2id with conservative, modern defaults.
    """

    def __init__(
        self,
        *,
        time_cost: int = 3,
        memory_cost: int = 65_536,  # KiB (64 MiB)
        parallelism: int = 2,
        hash_len: int = 32,
        salt_len: int = 16,
    ) -> None:
        self._hasher = PasswordHasher(
            time_cost=time_cost,
            memory_cost=memory_cost,
            parallelism=parallelism,
            hash_len=hash_len,
            salt_len=salt_len,
            type=Type.ID,
        )

    def hash(self, password: str) -> str:
        """Return an encoded Argon2id hash string for the given password."""
        return self._hasher.hash(password)

    def verify(self, hashed: str, password: str) -> bool:
        """
        Verify a password against an encoded Argon2 hash.
        Returns False on mismatch or invalid/unknown hash format.
        """
        try:
            return self._hasher.verify(hashed, password)
        except VerifyMismatchError:
            return False
        except InvalidHash:
            return False

    def needs_rehash(self, hashed: str) -> bool:
        """
        Check if the given hash should be rehashed with current parameters.
        Returns True if parameters have been raised since the hash was created.
        """
        try:
            return self._hasher.check_needs_rehash(hashed)
        except InvalidHash:
            # Unknown/invalid hash => treat as needing rehash.
            return True


# Optional module-level singleton for convenient reuse.
password_service = PasswordService()
