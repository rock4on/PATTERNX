"""merge oauth and main heads

Revision ID: 066844823749
Revises: 0b7dd36f1a74, add_oauth_fields
Create Date: 2025-06-14 14:55:46.097997

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '066844823749'
down_revision = ('0b7dd36f1a74', 'add_oauth_fields')
branch_labels = None
depends_on = None


def upgrade():
    pass


def downgrade():
    pass
