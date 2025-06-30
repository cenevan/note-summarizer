"""Make api_usage.note_id nullable

Revision ID: c617e38a52fa
Revises: 
Create Date: 2025-06-29 19:58:24.018459

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c617e38a52fa'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.alter_column(
        'api_usage',
        'note_id',
        existing_type=sa.Integer(),
        nullable=True,
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.alter_column(
        'api_usage',
        'note_id',
        existing_type=sa.Integer(),
        nullable=False,
    )
