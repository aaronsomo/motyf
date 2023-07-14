"""add tables for secondary settlements

Revision ID: 422915b1450c
Revises: 2278315c469a
Create Date: 2023-01-12 18:08:05.290115

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '422915b1450c'
down_revision = '2278315c469a'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'secondary_sale',
        sa.Column('order_id', sa.Integer(), nullable=False),
        sa.Column('seller_id', sa.Integer(), nullable=False),
        sa.Column('buyer_id', sa.Integer(), nullable=False),
        sa.Column('price', sa.Integer(), nullable=False),
        sa.Column('NFT', sa.Integer(), nullable=False),
        sa.Column('secondary_offering_id', sa.Integer(), nullable=False),
        sa.Column('executed', sa.Boolean(), nullable=False),
        sa.PrimaryKeyConstraint('order_id')
    )
    op.add_column('secondary_sale', sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True))
    op.add_column('secondary_sale', sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True))
    op.add_column('trade', sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True))
    op.add_column('trade', sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True))
    op.add_column('secondary_listing', sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True))
    op.add_column('secondary_listing', sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True))
    pass


def downgrade():
    op.drop_table('secondary_sale')
    op.drop_column('trade', 'created_at')
    op.drop_column('trade', 'updated_at')
    op.drop_column('secondary_listing', 'created_at')
    op.drop_column('secondary_listing', 'updated_at')
    pass
