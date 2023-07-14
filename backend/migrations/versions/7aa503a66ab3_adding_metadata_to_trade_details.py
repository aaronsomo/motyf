"""Adding metadata to trade details

Revision ID: 7aa503a66ab3
Revises: d8ee442da688
Create Date: 2023-01-05 20:52:11.735158

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '7aa503a66ab3'
down_revision = 'd8ee442da688'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('trade', sa.Column('offering_id', sa.Integer(), nullable=False))
    op.add_column('trade', sa.Column('NFT', sa.Integer(), nullable=True))
    op.create_unique_constraint('uq_trade_nft_offering', 'trade', ['NFT', 'offering_id'])
    pass


def downgrade():
    op.drop_column('trade', 'offering_id')
    op.drop_column('trade', 'NFT')
    op.drop_constraint('uq_trade_nft_offering', 'trade')
    pass
