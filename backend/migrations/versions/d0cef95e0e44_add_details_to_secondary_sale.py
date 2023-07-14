"""add details to secondary sale

Revision ID: d0cef95e0e44
Revises: 422915b1450c
Create Date: 2023-01-13 21:21:27.137785

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'd0cef95e0e44'
down_revision = '422915b1450c'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('secondary_sale', sa.Column('bid_id', sa.Integer(), nullable=True))
    op.add_column('secondary_sale', sa.Column('ask_id', sa.Integer(), nullable=True))
    op.add_column('secondary_sale', sa.Column('match_id', sa.Integer(), nullable=True))
    pass


def downgrade():
    op.drop_column('secondary_sale', 'bid_id')
    op.drop_column('secondary_sale', 'ask_id')
    op.drop_column('secondary_sale', 'match_id')
    pass
