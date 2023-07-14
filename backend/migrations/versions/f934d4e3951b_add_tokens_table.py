"""Add tokens table

Revision ID: f934d4e3951b
Revises: c5543c097444
Create Date: 2023-01-09 18:29:54.219025

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'f934d4e3951b'
down_revision = 'c5543c097444'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'token',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('owner_id', sa.Integer(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.add_column('token', sa.Column('offering_id', sa.Integer(), nullable=False))
    op.add_column('token', sa.Column('NFT', sa.Integer(), nullable=True))
    op.create_unique_constraint('uq_token_nft_offering', 'trade', ['NFT', 'offering_id'])
    pass


def downgrade():
    op.drop_table('token')
    pass
