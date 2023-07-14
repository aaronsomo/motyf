"""Add suitability submitted to account

Revision ID: 6047de3c7f8d
Revises: ae5e643f9d88
Create Date: 2022-11-08 17:41:36.937001

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '6047de3c7f8d'
down_revision = 'ae5e643f9d88'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('account', sa.Column('suitability_submitted', sa.Boolean(), nullable=True))
    pass


def downgrade():
    op.drop_column('account', 'suitability_submitted')
    pass
