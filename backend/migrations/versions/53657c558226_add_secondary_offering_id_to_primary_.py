"""Add secondary offering id to primary offering

Revision ID: 53657c558226
Revises: 62d00e125873
Create Date: 2023-01-23 18:39:12.606871

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '53657c558226'
down_revision = '62d00e125873'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('offering', sa.Column('secondary_offering_id', sa.Integer(), nullable=True))
    pass


def downgrade():
    op.drop_column('offering', 'secondary_offering_id');
    pass
