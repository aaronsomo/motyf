"""Add payouts table to db

Revision ID: 5a8d4349c042
Revises: da4b88fc0899
Create Date: 2023-02-21 16:57:11.198084

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '5a8d4349c042'
down_revision = 'da4b88fc0899'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'royalty_payout',
        sa.Column('id', sa.Integer(), nullable=False, primary_key=True),
        sa.Column('offering_id', sa.Integer(), nullable=False),
        sa.Column('date', sa.Date(), nullable=False),
        sa.Column('amount', sa.Numeric(10,2), nullable=False),
        sa.Column('executed', sa.Boolean, nullable=False),
    )
    pass


def downgrade():
    op.drop_table('royalty_payout')
    pass
