"""Add trade table for tracking mint status

Revision ID: d8ee442da688
Revises: 8bdaab8864f1
Create Date: 2023-01-05 18:53:52.840377

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'd8ee442da688'
down_revision = '8bdaab8864f1'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'trade',
        sa.Column('trade_id', sa.Integer(), nullable=False),
        sa.Column('minted', sa.Boolean(), nullable=False),
        sa.PrimaryKeyConstraint('trade_id')
    )
    pass


def downgrade():
    op.drop_table('trade')
    pass
