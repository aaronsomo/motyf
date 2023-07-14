"""Drop secondary offerings table

Revision ID: 43ebea20b85b
Revises: 53657c558226
Create Date: 2023-01-23 19:32:56.042688

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '43ebea20b85b'
down_revision = '53657c558226'
branch_labels = None
depends_on = None


def upgrade():
    op.drop_table('secondary_offering')
    pass


def downgrade():
    op.create_table(
        'secondary_offering',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('primary_offering_id', sa.Integer(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    pass


