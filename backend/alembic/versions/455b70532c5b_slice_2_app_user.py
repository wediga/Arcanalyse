"""slice 2 - app_user

Revision ID: 455b70532c5b
Revises: 0b6635e32d0f
Create Date: 2025-09-16 08:25:25.168352
"""

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql as pg

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "455b70532c5b"
down_revision: str | None = "0b6635e32d0f"
branch_labels: str | None = None
depends_on: str | None = None


def upgrade() -> None:
    """Upgrade schema."""
    # required for gen_random_uuid()
    op.execute("CREATE EXTENSION IF NOT EXISTS pgcrypto")

    op.create_table(
        "app_user",
        sa.Column(
            "id",
            pg.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column("email", sa.TEXT(), nullable=False),
        sa.Column("password_hash", sa.TEXT(), nullable=False),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(timezone=True),
            nullable=False,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
        sa.Column(
            "updated_at",
            sa.TIMESTAMP(timezone=True),
            nullable=False,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
        sa.Column("deleted_at", sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column("created_by_id", pg.UUID(as_uuid=True), nullable=True),
        sa.Column("updated_by_id", pg.UUID(as_uuid=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )

    # self-referencing FKs
    op.create_foreign_key(
        "fk_app_user_created_by",
        source_table="app_user",
        referent_table="app_user",
        local_cols=["created_by_id"],
        remote_cols=["id"],
        ondelete="SET NULL",
    )
    op.create_foreign_key(
        "fk_app_user_updated_by",
        source_table="app_user",
        referent_table="app_user",
        local_cols=["updated_by_id"],
        remote_cols=["id"],
        ondelete="SET NULL",
    )

    # case-insensitive unique index on email
    op.execute("CREATE UNIQUE INDEX uq_app_user_email_ci ON app_user (lower(email))")
    # useful sort index
    op.create_index("idx_app_user_created_at", "app_user", ["created_at"], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index("idx_app_user_created_at", table_name="app_user")
    op.execute("DROP INDEX IF EXISTS uq_app_user_email_ci")
    op.drop_constraint("fk_app_user_created_by", "app_user", type_="foreignkey")
    op.drop_constraint("fk_app_user_updated_by", "app_user", type_="foreignkey")
    op.drop_table("app_user")
