"""add indexes to tables

Revision ID: 4fa6e96039c9
Revises: 5587716fe5d8
Create Date: 2023-01-25 17:34:31.357221

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '4fa6e96039c9'
down_revision = '5587716fe5d8'
branch_labels = None
depends_on = None


def upgrade():
    op.create_index(op.f('ix_offering_secondary_id'), 'offering', ['secondary_offering_id'], unique=False)

    op.create_index(op.f('ix_secondary_listing_secondary_id'), 'secondary_listing', ['secondary_offering_id'], unique=False)
    op.create_index(op.f('ix_secondary_listing_NFT'), 'secondary_listing', ['NFT'], unique=False)
    op.create_index(op.f('ix_secondary_listing_user_id'), 'secondary_listing', ['user_id'], unique=False)

    op.create_index(op.f('ix_secondary_sale_seller_id'), 'secondary_sale', ['seller_id'], unique=False)
    op.create_index(op.f('ix_secondary_sale_buyer_id'), 'secondary_sale', ['buyer_id'], unique=False)
    op.create_index(op.f('ix_secondary_sale_NFT'), 'secondary_sale', ['NFT'], unique=False)
    op.create_index(op.f('ix_secondary_sale_secondary_id'), 'secondary_sale', ['secondary_offering_id'], unique=False)

    op.create_index(op.f('ix_token_NFT'), 'token', ['NFT'], unique=False)
    op.create_index(op.f('ix_token_offering_id'), 'token', ['offering_id'], unique=False)
    op.create_index(op.f('ix_token_owner_id'), 'token', ['owner_id'], unique=False)

    op.create_index(op.f('ix_trade_NFT'), 'trade', ['NFT'], unique=False)
    op.create_index(op.f('ix_trade_offering_id'), 'trade', ['offering_id'], unique=False)

    op.create_index(op.f('ix_user_party_id'), 'user', ['party_id'], unique=True)
    op.create_index(op.f('ix_user_account_id'), 'user', ['account_id'], unique=True)

    pass

def downgrade():
    op.drop_index(op.f('ix_offering_secondary_id'), table_name='offering')
    
    op.drop_index(op.f('ix_secondary_listing_secondary_id'), table_name='secondary_listing')
    op.drop_index(op.f('ix_secondary_listing_NFT'), table_name='secondary_listing')
    op.drop_index(op.f('ix_secondary_listing_user_id'), table_name='secondary_listing')

    op.drop_index(op.f('ix_secondary_sale_seller_id'), table_name='secondary_sale')
    op.drop_index(op.f('ix_secondary_sale_secondary_id'), table_name='secondary_sale')
    op.drop_index(op.f('ix_secondary_sale_buyer_id'), table_name='secondary_sale')
    op.drop_index(op.f('ix_secondary_sale_NFT'), table_name='secondary_sale')

    op.drop_index(op.f('ix_token_NFT'), table_name='token')
    op.drop_index(op.f('ix_token_offering_id'), table_name='token')
    op.drop_index(op.f('ix_token_owner_id'), table_name='token')

    op.drop_index(op.f('ix_trade_NFT'), table_name='trade')
    op.drop_index(op.f('ix_trade_offering_id'), table_name='trade')

    op.drop_index(op.f('ix_user_party_id'), table_name='user')
    op.drop_index(op.f('ix_user_account_id'), table_name='user')

    pass
