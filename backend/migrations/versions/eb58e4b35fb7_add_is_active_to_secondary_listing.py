"""add_active_to_secondary_listing
Revision ID: eb58e4b35fb7
Revises: 2758dd5ef569
Create Date: 2023-03-17 15:40:59.094297
"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'eb58e4b35fb7'
down_revision = '2758dd5ef569'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('secondary_listing', sa.Column('is_active', sa.Boolean, nullable=True))
    pass


def downgrade():
    op.drop_column('secondary_listing', 'is_active')
    pass