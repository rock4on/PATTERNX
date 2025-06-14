"""merge migrations

Revision ID: 0b7dd36f1a74
Revises: 332dbdf3ffef, create_notifications
Create Date: 2025-06-14 14:10:19.508212

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0b7dd36f1a74'
down_revision = ('332dbdf3ffef', 'create_notifications')
branch_labels = None
depends_on = None


def upgrade():
    pass


def downgrade():
    pass
