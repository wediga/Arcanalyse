## Alembic revision template
<%
    import datetime
%>
"""${message}

Revision ID: ${up_revision}
Revises: ${down_revision | comma,n}
Create Date: ${create_date}

"""
from typing import
from collections.abc import Sequence
from alembic import op
import sqlalchemy as sa
${imports if imports else ""}

# revision identifiers, used by Alembic.
revision: str = ${repr(up_revision)}
down_revision: str | Sequence[str] | None = ${repr(down_revision) if down_revision else "None"}
branch_labels: str | Sequence[str] | None = ${repr(branch_labels) if branch_labels else "None"}
depends_on: str | Sequence[str] | None = ${repr(depends_on) if depends_on else "None"}


def upgrade() -> None:
    """Upgrade schema."""
    ${upgrades if upgrades else "pass"}


def downgrade() -> None:
    """Downgrade schema."""
    ${downgrades if downgrades else "pass"}
