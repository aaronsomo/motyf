"""Add quantity to trade

Revision ID: 27f215717cfd
Revises: eb58e4b35fb7
Create Date: 2023-03-17 15:42:31.889092

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '27f215717cfd'
down_revision = 'eb58e4b35fb7'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('trade', sa.Column('mint_count', sa.Integer(), nullable=True))
    pass


def downgrade():
    op.drop_column('trade', 'mint_count')
    pass
