"""Add cancellation to sale

Revision ID: 62d00e125873
Revises: d0cef95e0e44
Create Date: 2023-01-20 17:40:37.968538

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '62d00e125873'
down_revision = 'd0cef95e0e44'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('secondary_sale', sa.Column('cancelled', sa.Boolean(), nullable=True))
    pass


def downgrade():
    op.drop_column('secondary_sale', 'cancelled')
    pass
