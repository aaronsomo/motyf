"""Add secondary offers

Revision ID: ad1adead37a4
Revises: 6e79f84c7d31
Create Date: 2023-03-06 17:18:33.322915

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'ad1adead37a4'
down_revision = '6e79f84c7d31'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'secondary_offer',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('price', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('secondary_offering_id', sa.Integer(), nullable=False),
        sa.Column('NFT', sa.Integer(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.drop_column('secondary_listing', 'open_to_offers')
    pass


def downgrade():
    op.add_column('secondary_listing', sa.Column('open_to_offers', sa.Boolean(), nullable=False, server_default='0'))
    op.drop_table('secondary_offer')
    pass