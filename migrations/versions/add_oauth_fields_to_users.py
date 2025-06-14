"""Add OAuth fields to users table

Revision ID: add_oauth_fields
Revises: 0be369b65da7
Create Date: 2024-01-01 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_oauth_fields'
down_revision = '0be369b65da7'
branch_labels = None
depends_on = None


def upgrade():
    # Add OAuth fields to users table
    op.add_column('users', sa.Column('firebase_uid', sa.String(128), nullable=True))
    op.add_column('users', sa.Column('oauth_provider', sa.String(50), nullable=True))
    op.add_column('users', sa.Column('is_verified', sa.Boolean(), nullable=False, server_default='0'))
    
    # Create unique index on firebase_uid
    op.create_index('ix_users_firebase_uid', 'users', ['firebase_uid'], unique=True)


def downgrade():
    # Remove OAuth fields
    op.drop_index('ix_users_firebase_uid', 'users')
    op.drop_column('users', 'firebase_uid')
    op.drop_column('users', 'oauth_provider')
    op.drop_column('users', 'is_verified')