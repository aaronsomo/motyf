"""add secondary offering table

Revision ID: c5543c097444
Revises: 904360285efc
Create Date: 2023-01-09 15:29:59.636607

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'c5543c097444'
down_revision = '904360285efc'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'secondary_offering',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('primary_offering_id', sa.Integer(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    pass


def downgrade():
    op.drop_table('secondary_offering')
    pass
