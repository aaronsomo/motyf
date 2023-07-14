"""Refactoring secondary orders tables

Revision ID: 2278315c469a
Revises: f934d4e3951b
Create Date: 2023-01-11 15:51:45.992465

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '2278315c469a'
down_revision = 'f934d4e3951b'
branch_labels = None
depends_on = None


def upgrade():
    op.drop_table('secondary_order')
    op.create_table(
        'secondary_listing',
        sa.Column('order_id', sa.Integer(), nullable=False),
        sa.Column('price', sa.Integer(), nullable=False),
        sa.Column('secondary_offering_id', sa.Integer(), nullable=False),
        sa.Column('NFT', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.PrimaryKeyConstraint('order_id')
    )
    op.create_unique_constraint('uq_secondary_listing_nft_offering', 'secondary_listing', ['NFT', 'secondary_offering_id'])
    pass


def downgrade():
    op.create_table(
        'secondary_order',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('primary_offering_id', sa.Integer(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.drop_table('secondary_listing')
    pass
