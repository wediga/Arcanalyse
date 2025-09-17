"""slice 2 - audit not null (created_by_id, updated_by_id)

Revision ID: 72c79ae4394a
Revises: 455b70532c5b
Create Date: 2025-09-17 08:06:52.881654
"""

from __future__ import annotations

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql as psql

from alembic import op

# revision identifiers, used by Alembic.
revision = "72c79ae4394a"
down_revision = "455b70532c5b"
branch_labels = None
depends_on = None

SYSTEM_USER_ID = "00000000-0000-0000-0000-000000000001"


def _drop_fk_on_columns(conn, table: str, cols: list[str]) -> None:
    """Findet und droppt alle FKs der Tabelle, die mindestens eine der Spalten referenzieren."""
    q = sa.text(
        """
        SELECT c.conname
        FROM pg_constraint c
        JOIN pg_class t ON c.conrelid = t.oid
        JOIN pg_namespace n ON n.oid = t.relnamespace
        WHERE t.relname = :table
          AND n.nspname = current_schema()
          AND c.contype = 'f'
          AND EXISTS (
            SELECT 1
            FROM unnest(c.conkey) colnum
            JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = colnum
            WHERE a.attname = ANY(:cols)
          )
    """
    )
    res = conn.execute(q, {"table": table, "cols": cols})
    names = [r[0] for r in res]
    for name in names:
        conn.execute(sa.text(f'ALTER TABLE "{table}" DROP CONSTRAINT "{name}"'))


def upgrade() -> None:
    conn = op.get_bind()

    # 1) Daten bereinigen: NULLs -> SYSTEM_USER_ID (idempotent)
    conn.execute(
        sa.text(
            """
        UPDATE app_user
           SET created_by_id = :sid
         WHERE created_by_id IS NULL
    """
        ),
        {"sid": SYSTEM_USER_ID},
    )
    conn.execute(
        sa.text(
            """
        UPDATE app_user
           SET updated_by_id = :sid
         WHERE updated_by_id IS NULL
    """
        ),
        {"sid": SYSTEM_USER_ID},
    )

    # 2) Existierende FKs auf den beiden Spalten (unabhängig vom Namen) droppen
    _drop_fk_on_columns(conn, "app_user", ["created_by_id", "updated_by_id"])

    # 3) NOT NULL setzen
    op.alter_column(
        "app_user",
        "created_by_id",
        existing_type=psql.UUID(as_uuid=True),
        nullable=False,
    )
    op.alter_column(
        "app_user",
        "updated_by_id",
        existing_type=psql.UUID(as_uuid=True),
        nullable=False,
    )

    # 4) Neue FKs mit definierten Namen + ON DELETE RESTRICT
    op.create_foreign_key(
        "fk_app_user_created_by__app_user",
        "app_user",
        "app_user",
        ["created_by_id"],
        ["id"],
        ondelete="RESTRICT",
    )
    op.create_foreign_key(
        "fk_app_user_updated_by__app_user",
        "app_user",
        "app_user",
        ["updated_by_id"],
        ["id"],
        ondelete="RESTRICT",
    )


def downgrade() -> None:
    # neue FKs droppen
    op.drop_constraint("fk_app_user_created_by__app_user", "app_user", type_="foreignkey")
    op.drop_constraint("fk_app_user_updated_by__app_user", "app_user", type_="foreignkey")

    # zurück auf NULL erlaubt
    op.alter_column(
        "app_user",
        "created_by_id",
        existing_type=psql.UUID(as_uuid=True),
        nullable=True,
    )
    op.alter_column(
        "app_user",
        "updated_by_id",
        existing_type=psql.UUID(as_uuid=True),
        nullable=True,
    )

    # alte, generische FKs wieder herstellen (mit SET NULL, Name egal)
    op.create_foreign_key(
        "app_user_created_by_id_fkey",
        "app_user",
        "app_user",
        ["created_by_id"],
        ["id"],
        ondelete="SET NULL",
    )
    op.create_foreign_key(
        "app_user_updated_by_id_fkey",
        "app_user",
        "app_user",
        ["updated_by_id"],
        ["id"],
        ondelete="SET NULL",
    )
